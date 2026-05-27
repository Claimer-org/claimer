create or replace function private.public_growth_label(
  value text,
  fallback text default 'none'
)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when nullif(btrim(value), '') is null then fallback
    when btrim(value) ~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,95}$' then btrim(value)
    else 'redacted'
  end;
$$;

revoke all on function private.public_growth_label(text, text) from public;
grant execute on function private.public_growth_label(text, text)
  to service_role;

create or replace function private.public_growth_path(
  value text,
  fallback text default '/'
)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when nullif(btrim(value), '') is null then fallback
    when btrim(value) ~ '^/[A-Za-z0-9/_-]{0,255}$' then btrim(value)
    else '/redacted'
  end;
$$;

revoke all on function private.public_growth_path(text, text) from public;
grant execute on function private.public_growth_path(text, text)
  to service_role;

create or replace function private.get_growth_snapshot_impl()
returns table (
  metric text,
  label text,
  value numeric,
  window_label text,
  detail jsonb,
  sort_order integer
)
language sql
stable
security definer
set search_path = ''
as $$
  with bounds as (
    select
      now() as window_end,
      now() - interval '24 hours' as since_24h,
      now() - interval '7 days' as since_7d,
      date_trunc('day', now()) as today_start
  ),
  events_24h as (
    select analytics_events.*
    from public.analytics_events, bounds
    where analytics_events.event_name = 'page_view'
      and analytics_events.created_at >= bounds.since_24h
      and analytics_events.created_at <= bounds.window_end
  ),
  events_7d as (
    select analytics_events.*
    from public.analytics_events, bounds
    where analytics_events.event_name = 'page_view'
      and analytics_events.created_at >= bounds.since_7d
      and analytics_events.created_at <= bounds.window_end
  ),
  campaign_events_7d as (
    select events_7d.*
    from events_7d
    where events_7d.properties ?| array[
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
      'ref'
    ]
  ),
  events_today as (
    select analytics_events.*
    from public.analytics_events, bounds
    where analytics_events.event_name = 'page_view'
      and analytics_events.created_at >= bounds.today_start
      and analytics_events.created_at <= bounds.window_end
  ),
  feedback_7d as (
    select feedback_entries.*
    from public.feedback_entries, bounds
    where feedback_entries.created_at >= bounds.since_7d
      and feedback_entries.created_at <= bounds.window_end
  ),
  feedback_source_events_7d as (
    select feedback_7d.*
    from feedback_7d
    where feedback_7d.metadata ?| array[
      'source_event',
      'utm_source',
      'utm_content',
      'ref'
    ]
  ),
  channel_rows as (
    select
      private.public_growth_label(coalesce(
        nullif(events_7d.properties ->> 'utm_source', ''),
        nullif(events_7d.properties ->> 'ref', ''),
        'direct'
      ), 'direct') as source,
      count(distinct events_7d.visitor_id) as visitors,
      count(*) as page_views
    from events_7d
    where events_7d.properties ->> 'utm_campaign' in ('milestone4-launch', 'claim_share')
      or events_7d.properties ->> 'ref' in ('launch_kit', 'claim_share', 'post_contribution')
    group by 1
  ),
  channel_detail as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'source', source,
          'visitors', visitors,
          'page_views', page_views
        )
        order by visitors desc, page_views desc, source asc
      ),
      '[]'::jsonb
    ) as items
    from (
      select *
      from channel_rows
      order by visitors desc, page_views desc, source asc
      limit 8
    ) ranked_channels
  ),
  campaign_rows as (
    select
      private.public_growth_label(campaign_events_7d.properties ->> 'utm_source') as utm_source,
      private.public_growth_label(campaign_events_7d.properties ->> 'utm_content') as utm_content,
      private.public_growth_label(campaign_events_7d.properties ->> 'ref') as ref,
      private.public_growth_path(coalesce(
        nullif(campaign_events_7d.properties ->> 'landing_path', ''),
        campaign_events_7d.path,
        '/'
      )) as landing_path,
      count(distinct campaign_events_7d.visitor_id) as visitors,
      count(*) as page_views
    from campaign_events_7d
    group by 1, 2, 3, 4
  ),
  campaign_detail as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'utm_source', utm_source,
          'utm_content', utm_content,
          'ref', ref,
          'landing_path', landing_path,
          'visitors', visitors,
          'page_views', page_views
        )
        order by visitors desc, page_views desc, utm_source asc, utm_content asc, ref asc, landing_path asc
      ),
      '[]'::jsonb
    ) as items
    from (
      select *
      from campaign_rows
      order by visitors desc, page_views desc, utm_source asc, utm_content asc, ref asc, landing_path asc
      limit 12
    ) ranked_campaigns
  ),
  feedback_detail as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'use_case', use_case,
          'count', entry_count,
          'average_rating', average_rating
        )
        order by entry_count desc, use_case asc
      ),
      '[]'::jsonb
    ) as items
    from (
      select
        feedback_7d.use_case,
        count(*) as entry_count,
        round(avg(feedback_7d.rating)::numeric, 1) as average_rating
      from feedback_7d
      group by feedback_7d.use_case
    ) feedback_by_case
  ),
  feedback_source_rows as (
    select
      private.public_growth_label(feedback_source_events_7d.metadata ->> 'source_event') as source_event,
      private.public_growth_label(feedback_source_events_7d.metadata ->> 'utm_source') as utm_source,
      private.public_growth_label(feedback_source_events_7d.metadata ->> 'utm_content') as utm_content,
      private.public_growth_label(feedback_source_events_7d.metadata ->> 'ref') as ref,
      private.public_growth_path(feedback_source_events_7d.page_path) as page_path,
      count(*) as entry_count,
      round(avg(feedback_source_events_7d.rating)::numeric, 1) as average_rating
    from feedback_source_events_7d
    group by 1, 2, 3, 4, 5
  ),
  feedback_source_detail as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'source_event', source_event,
          'utm_source', utm_source,
          'utm_content', utm_content,
          'ref', ref,
          'page_path', page_path,
          'count', entry_count,
          'average_rating', average_rating
        )
        order by entry_count desc, source_event asc, utm_source asc, utm_content asc, ref asc, page_path asc
      ),
      '[]'::jsonb
    ) as items
    from (
      select *
      from feedback_source_rows
      order by entry_count desc, source_event asc, utm_source asc, utm_content asc, ref asc, page_path asc
      limit 12
    ) ranked_feedback_sources
  ),
  top_paths as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'path', path,
          'page_views', page_views,
          'visitors', visitors
        )
        order by page_views desc, visitors desc, path asc
      ),
      '[]'::jsonb
    ) as items
    from (
      select
        private.public_growth_path(events_24h.path) as path,
        count(*) as page_views,
        count(distinct events_24h.visitor_id) as visitors
      from events_24h
      group by 1
      order by page_views desc, visitors desc, path asc
      limit 8
    ) ranked_paths
  )
  select
    'active_visitors_24h'::text as metric,
    'Active visitors'::text as label,
    count(distinct events_24h.visitor_id)::numeric as value,
    'last 24 hours'::text as window_label,
    jsonb_build_object(
      'page_views', count(*),
      'sessions', count(distinct events_24h.session_id),
      'top_paths', (select items from top_paths)
    ) as detail,
    10 as sort_order
  from events_24h

  union all

  select
    'daily_active_users_utc',
    'Daily active users',
    count(distinct events_today.visitor_id)::numeric,
    'current UTC day',
    jsonb_build_object(
      'page_views', count(*),
      'sessions', count(distinct events_today.session_id)
    ),
    20
  from events_today

  union all

  select
    'launch_visitors_7d',
    'Launch-attributed visitors',
    coalesce(sum(channel_rows.visitors), 0)::numeric,
    'last 7 days',
    jsonb_build_object(
      'channels', (select items from channel_detail)
    ),
    30
  from channel_rows

  union all

  select
    'campaign_visitors_7d',
    'Campaign visitors',
    count(distinct campaign_events_7d.visitor_id)::numeric,
    'last 7 days',
    jsonb_build_object(
      'campaigns', (select items from campaign_detail)
    ),
    35
  from campaign_events_7d

  union all

  select
    'feedback_entries_7d',
    'Feedback entries',
    count(*)::numeric,
    'last 7 days',
    jsonb_build_object(
      'average_rating', coalesce(round(avg(feedback_7d.rating)::numeric, 1), 0),
      'use_cases', (select items from feedback_detail)
    ),
    40
  from feedback_7d

  union all

  select
    'feedback_source_events_7d',
    'Feedback source events',
    count(*)::numeric,
    'last 7 days',
    jsonb_build_object(
      'source_events', (select items from feedback_source_detail)
    ),
    45
  from feedback_source_events_7d

  union all

  select
    'evidence_submissions_24h',
    'Evidence submissions',
    count(*)::numeric,
    'last 24 hours',
    jsonb_build_object(
      'support', count(*) filter (where evidence_entries.stance = 'support'),
      'challenge', count(*) filter (where evidence_entries.stance = 'challenge'),
      'context', count(*) filter (where evidence_entries.stance = 'context')
    ),
    50
  from public.evidence_entries, bounds
  where evidence_entries.created_at >= bounds.since_24h
    and evidence_entries.created_at <= bounds.window_end

  union all

  select
    'claims_total',
    'Live claims',
    count(*)::numeric,
    'all time',
    jsonb_build_object(
      'last_24h', count(*) filter (
        where claims.created_at >= (select since_24h from bounds)
      ),
      'domains', coalesce(
        (
          select jsonb_object_agg(domain_counts.domain, domain_counts.claims)
          from (
            select claims_by_domain.domain, count(*) as claims
            from public.claims claims_by_domain
            group by claims_by_domain.domain
          ) domain_counts
        ),
        '{}'::jsonb
      )
    ),
    60
  from public.claims;
$$;

revoke all on function private.get_growth_snapshot_impl() from public;
grant execute on function private.get_growth_snapshot_impl()
  to service_role;
