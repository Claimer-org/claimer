create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

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
  channel_rows as (
    select
      coalesce(
        nullif(events_7d.properties ->> 'utm_source', ''),
        nullif(events_7d.properties ->> 'ref', ''),
        'direct'
      ) as source,
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
        events_24h.path,
        count(*) as page_views,
        count(distinct events_24h.visitor_id) as visitors
      from events_24h
      group by events_24h.path
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
  to anon, authenticated, service_role;

create or replace function public.get_growth_snapshot()
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
security invoker
set search_path = ''
as $$
  select *
  from private.get_growth_snapshot_impl()
  order by sort_order;
$$;

revoke all on function public.get_growth_snapshot() from public;
grant execute on function public.get_growth_snapshot()
  to anon, authenticated, service_role;
