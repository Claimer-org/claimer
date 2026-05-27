-- Claimer MVP Supabase schema baseline.
-- V1 scope: public AI, news, and technology claims only; no private-person claims.
-- Product language: display scores as "community assessment" and "evidence suggests",
-- not as definitive truth authority.
-- AI disclosure: any automated analysis or score explanation must be labeled as AI-assisted.
-- Security: use Supabase anon/authenticated clients with RLS. Do not use service keys in the app.

create extension if not exists pgcrypto;

create type public.claim_domain as enum ('ai', 'news', 'technology');
create type public.claim_stance as enum ('support', 'challenge', 'context');
create type public.assessment_target as enum ('attribution', 'veracity', 'context');
create type public.source_quality as enum (
  'primary',
  'direct_witness',
  'reputable_secondary',
  'indirect_secondary',
  'unverifiable'
);
create type public.score_method as enum ('community', 'ai_assisted', 'manual_seed');
create type public.public_subject_kind as enum (
  'company',
  'organization',
  'public_official',
  'public_figure',
  'product',
  'policy',
  'event',
  'publication',
  'other_public'
);
create type public.analytics_event_name as enum ('page_view');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  handle text unique,
  bio text,
  reputation_points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_not_blank check (nullif(trim(display_name), '') is not null)
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  title text,
  publisher text,
  published_at timestamptz,
  quality public.source_quality not null default 'unverifiable',
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint sources_url_http_check check (url ~* '^https?://')
);

create table public.claims (
  id uuid primary key default gen_random_uuid(),
  domain public.claim_domain not null,
  title text not null,
  body text,
  claimant_name text,
  subject_kind public.public_subject_kind not null,
  source_id uuid references public.sources (id) on delete restrict,
  source_url text not null,
  submitted_by uuid not null default auth.uid() references public.profiles (id) on delete restrict,
  is_ai_generated boolean not null default false,
  ai_disclosure text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint claims_title_not_blank check (nullif(trim(title), '') is not null),
  constraint claims_source_url_http_check check (source_url ~* '^https?://'),
  constraint claims_ai_disclosure_check check (
    is_ai_generated = false
    or nullif(trim(ai_disclosure), '') is not null
  )
);

create table public.evidence_entries (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims (id) on delete cascade,
  stance public.claim_stance not null,
  assessment_target public.assessment_target not null default 'veracity',
  summary text not null,
  source_id uuid references public.sources (id) on delete restrict,
  source_url text not null,
  submitted_by uuid not null default auth.uid() references public.profiles (id) on delete restrict,
  is_ai_generated boolean not null default false,
  ai_disclosure text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint evidence_entries_summary_not_blank check (nullif(trim(summary), '') is not null),
  constraint evidence_entries_source_url_http_check check (source_url ~* '^https?://'),
  constraint evidence_entries_ai_disclosure_check check (
    is_ai_generated = false
    or nullif(trim(ai_disclosure), '') is not null
  )
);

create table public.attribution_scores (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims (id) on delete cascade,
  score numeric(5,2) not null,
  method public.score_method not null default 'community',
  explanation text not null,
  created_by uuid not null default auth.uid() references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint attribution_scores_explanation_not_blank check (nullif(trim(explanation), '') is not null),
  constraint attribution_scores_range_check check (score >= 0 and score <= 100)
);

create table public.veracity_scores (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims (id) on delete cascade,
  score numeric(5,2) not null,
  method public.score_method not null default 'community',
  explanation text not null,
  created_by uuid not null default auth.uid() references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint veracity_scores_explanation_not_blank check (nullif(trim(explanation), '') is not null),
  constraint veracity_scores_range_check check (score >= 0 and score <= 100)
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name public.analytics_event_name not null,
  path text not null,
  visitor_id uuid not null,
  session_id uuid not null,
  claim_id text,
  referrer_origin text,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint analytics_events_path_check check (
    path ~ '^/[A-Za-z0-9/_-]{0,255}$'
  ),
  constraint analytics_events_claim_id_check check (
    claim_id is null
    or claim_id ~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,120}$'
  ),
  constraint analytics_events_referrer_origin_check check (
    referrer_origin is null
    or referrer_origin ~* '^https?://[^/?#]{1,253}$'
  ),
  constraint analytics_events_properties_object_check check (
    jsonb_typeof(properties) = 'object'
    and octet_length(properties::text) <= 2048
  )
);

create table public.feedback_entries (
  id uuid primary key default gen_random_uuid(),
  page_path text not null,
  visitor_id uuid,
  use_case text not null,
  rating smallint not null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint feedback_entries_path_check check (
    page_path ~ '^/[A-Za-z0-9/_-]{0,255}$'
  ),
  constraint feedback_entries_use_case_check check (
    use_case in (
      'browse_claims',
      'submit_claim',
      'add_evidence',
      'research_decision',
      'other'
    )
  ),
  constraint feedback_entries_rating_check check (rating between 1 and 5),
  constraint feedback_entries_summary_check check (
    nullif(trim(summary), '') is not null
    and char_length(summary) <= 1200
  ),
  constraint feedback_entries_metadata_check check (
    jsonb_typeof(metadata) = 'object'
    and octet_length(metadata::text) <= 2048
  )
);

create index claims_domain_created_at_idx on public.claims (domain, created_at desc);
create index evidence_entries_claim_id_created_at_idx on public.evidence_entries (claim_id, created_at desc);
create index attribution_scores_claim_id_created_at_idx on public.attribution_scores (claim_id, created_at desc);
create index veracity_scores_claim_id_created_at_idx on public.veracity_scores (claim_id, created_at desc);
create index analytics_events_created_at_idx on public.analytics_events (created_at desc);
create index analytics_events_dau_idx
  on public.analytics_events (event_name, created_at desc, visitor_id);
create index feedback_entries_created_at_idx
  on public.feedback_entries (created_at desc);
create index feedback_entries_use_case_created_at_idx
  on public.feedback_entries (use_case, created_at desc);

alter table public.profiles enable row level security;
alter table public.sources enable row level security;
alter table public.claims enable row level security;
alter table public.evidence_entries enable row level security;
alter table public.attribution_scores enable row level security;
alter table public.veracity_scores enable row level security;
alter table public.analytics_events enable row level security;
alter table public.feedback_entries enable row level security;

grant usage on schema public to anon, authenticated, service_role;

grant select
  on table public.profiles,
  public.sources,
  public.claims,
  public.evidence_entries,
  public.attribution_scores,
  public.veracity_scores
  to anon, authenticated, service_role;

grant insert
  on table public.profiles,
  public.sources,
  public.claims,
  public.evidence_entries,
  public.attribution_scores,
  public.veracity_scores
  to authenticated, service_role;

grant insert
  on table public.analytics_events
  to anon, authenticated, service_role;

grant insert
  on table public.feedback_entries
  to anon, authenticated, service_role;

revoke select, update, delete
  on table public.analytics_events
  from anon, authenticated;

grant select, update, delete
  on table public.analytics_events
  to service_role;

grant select, update, delete
  on table public.feedback_entries
  to service_role;

revoke select, update, delete
  on table public.feedback_entries
  from anon, authenticated;

create policy "public read profiles"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "authenticated insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "public read sources"
  on public.sources for select
  to anon, authenticated
  using (true);

create policy "authenticated insert sources"
  on public.sources for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "public read claims"
  on public.claims for select
  to anon, authenticated
  using (true);

create policy "authenticated insert claims"
  on public.claims for insert
  to authenticated
  with check (submitted_by = auth.uid());

create policy "public read evidence entries"
  on public.evidence_entries for select
  to anon, authenticated
  using (true);

create policy "authenticated insert evidence entries"
  on public.evidence_entries for insert
  to authenticated
  with check (submitted_by = auth.uid());

create policy "public read attribution scores"
  on public.attribution_scores for select
  to anon, authenticated
  using (true);

create policy "authenticated insert attribution scores"
  on public.attribution_scores for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "public read veracity scores"
  on public.veracity_scores for select
  to anon, authenticated
  using (true);

create policy "authenticated insert veracity scores"
  on public.veracity_scores for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "public insert page views"
  on public.analytics_events for insert
  to anon, authenticated
  with check (
    event_name = 'page_view'
    and path ~ '^/[A-Za-z0-9/_-]{0,255}$'
    and jsonb_typeof(properties) = 'object'
    and octet_length(properties::text) <= 2048
    and created_at >= now() - interval '10 minutes'
    and created_at <= now() + interval '2 minutes'
  );

create policy "public insert launch feedback"
  on public.feedback_entries for insert
  to anon, authenticated
  with check (
    page_path ~ '^/[A-Za-z0-9/_-]{0,255}$'
    and use_case in (
      'browse_claims',
      'submit_claim',
      'add_evidence',
      'research_decision',
      'other'
    )
    and rating between 1 and 5
    and nullif(trim(summary), '') is not null
    and char_length(summary) <= 1200
    and jsonb_typeof(metadata) = 'object'
    and octet_length(metadata::text) <= 2048
    and created_at >= now() - interval '10 minutes'
    and created_at <= now() + interval '2 minutes'
  );

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to service_role;

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
  to service_role;

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
security definer
set search_path = ''
as $$
  select *
  from private.get_growth_snapshot_impl()
  order by sort_order;
$$;

revoke all on function public.get_growth_snapshot() from public;
grant execute on function public.get_growth_snapshot()
  to anon, authenticated, service_role;
