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

create table public.contributor_profiles (
  token uuid primary key default gen_random_uuid(),
  status text not null default 'active',
  reputation_score numeric(5,4) not null default 0.5000,
  total_submissions integer not null default 0,
  accepted_submissions integer not null default 0,
  models_used text[] not null default '{}'::text[],
  tools_used text[] not null default '{}'::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  constraint contributor_profiles_status_check check (
    status in ('active', 'suspended', 'revoked')
  ),
  constraint contributor_profiles_reputation_score_check check (
    reputation_score >= 0
    and reputation_score <= 1
  ),
  constraint contributor_profiles_submission_counts_check check (
    total_submissions >= 0
    and accepted_submissions >= 0
    and accepted_submissions <= total_submissions
  ),
  constraint contributor_profiles_models_used_check check (
    cardinality(models_used) <= 40
  ),
  constraint contributor_profiles_tools_used_check check (
    cardinality(tools_used) <= 40
  ),
  constraint contributor_profiles_metadata_check check (
    jsonb_typeof(metadata) = 'object'
    and octet_length(metadata::text) <= 2048
  )
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
  submitted_by uuid default auth.uid() references public.profiles (id) on delete restrict,
  contributor_token uuid references public.contributor_profiles (token) on delete restrict,
  model_used text,
  tool_used text,
  is_ai_generated boolean not null default false,
  ai_disclosure text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint claims_title_not_blank check (nullif(trim(title), '') is not null),
  constraint claims_source_url_http_check check (source_url ~* '^https?://'),
  constraint claims_ai_disclosure_check check (
    is_ai_generated = false
    or nullif(trim(ai_disclosure), '') is not null
  ),
  constraint claims_submitter_identity_check check (
    submitted_by is not null
    or contributor_token is not null
  ),
  constraint claims_contributor_model_check check (
    contributor_token is null
    or (
      nullif(trim(model_used), '') is not null
      and char_length(model_used) <= 120
    )
  ),
  constraint claims_contributor_tool_check check (
    contributor_token is null
    or (
      nullif(trim(tool_used), '') is not null
      and char_length(tool_used) <= 120
    )
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
  submitted_by uuid default auth.uid() references public.profiles (id) on delete restrict,
  contributor_token uuid references public.contributor_profiles (token) on delete restrict,
  model_used text,
  tool_used text,
  is_ai_generated boolean not null default false,
  ai_disclosure text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint evidence_entries_summary_not_blank check (nullif(trim(summary), '') is not null),
  constraint evidence_entries_source_url_http_check check (source_url ~* '^https?://'),
  constraint evidence_entries_ai_disclosure_check check (
    is_ai_generated = false
    or nullif(trim(ai_disclosure), '') is not null
  ),
  constraint evidence_entries_submitter_identity_check check (
    submitted_by is not null
    or contributor_token is not null
  ),
  constraint evidence_entries_contributor_model_check check (
    contributor_token is null
    or (
      nullif(trim(model_used), '') is not null
      and char_length(model_used) <= 120
    )
  ),
  constraint evidence_entries_contributor_tool_check check (
    contributor_token is null
    or (
      nullif(trim(tool_used), '') is not null
      and char_length(tool_used) <= 120
    )
  )
);

create table public.seed_evidence_entries (
  id uuid primary key default gen_random_uuid(),
  seed_claim_id text not null,
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
  constraint seed_evidence_entries_seed_claim_id_check check (
    seed_claim_id ~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,120}$'
  ),
  constraint seed_evidence_entries_summary_not_blank check (nullif(trim(summary), '') is not null),
  constraint seed_evidence_entries_source_url_http_check check (source_url ~* '^https?://'),
  constraint seed_evidence_entries_ai_disclosure_check check (
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
create index contributor_profiles_status_last_seen_idx
  on public.contributor_profiles (status, last_seen_at desc);
create index claims_contributor_token_created_at_idx
  on public.claims (contributor_token, created_at desc)
  where contributor_token is not null;
create index evidence_entries_claim_id_created_at_idx on public.evidence_entries (claim_id, created_at desc);
create index evidence_entries_contributor_token_created_at_idx
  on public.evidence_entries (contributor_token, created_at desc)
  where contributor_token is not null;
create index seed_evidence_entries_claim_id_created_at_idx
  on public.seed_evidence_entries (seed_claim_id, created_at desc);
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
alter table public.contributor_profiles enable row level security;
alter table public.claims enable row level security;
alter table public.evidence_entries enable row level security;
alter table public.seed_evidence_entries enable row level security;
alter table public.attribution_scores enable row level security;
alter table public.veracity_scores enable row level security;
alter table public.analytics_events enable row level security;
alter table public.feedback_entries enable row level security;

grant usage on schema public to anon, authenticated, service_role;

revoke all
  on table public.contributor_profiles
  from anon, authenticated;

grant select, insert, update
  on table public.contributor_profiles
  to service_role;

grant select
  on table public.profiles,
  public.sources,
  public.seed_evidence_entries,
  public.attribution_scores,
  public.veracity_scores
  to anon, authenticated, service_role;

grant select
  on table public.claims,
  public.evidence_entries
  to service_role;

grant select (
  id,
  domain,
  title,
  body,
  claimant_name,
  subject_kind,
  source_id,
  source_url,
  submitted_by,
  model_used,
  tool_used,
  is_ai_generated,
  ai_disclosure,
  created_at,
  updated_at
)
  on table public.claims
  to anon, authenticated;

grant select (
  id,
  claim_id,
  stance,
  assessment_target,
  summary,
  source_id,
  source_url,
  submitted_by,
  model_used,
  tool_used,
  is_ai_generated,
  ai_disclosure,
  created_at,
  updated_at
)
  on table public.evidence_entries
  to anon, authenticated;

grant insert
  on table public.profiles,
  public.sources,
  public.claims,
  public.evidence_entries,
  public.seed_evidence_entries,
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
  with check (
    submitted_by = auth.uid()
    and contributor_token is null
    and model_used is null
    and tool_used is null
  );

create policy "public read evidence entries"
  on public.evidence_entries for select
  to anon, authenticated
  using (true);

create policy "authenticated insert evidence entries"
  on public.evidence_entries for insert
  to authenticated
  with check (
    submitted_by = auth.uid()
    and contributor_token is null
    and model_used is null
    and tool_used is null
  );

create policy "public read seed evidence entries"
  on public.seed_evidence_entries for select
  to anon, authenticated
  using (true);

create policy "authenticated insert seed evidence entries"
  on public.seed_evidence_entries for insert
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
  evidence_24h as (
    select
      evidence_entries.stance,
      'live_claim'::text as claim_type
    from public.evidence_entries, bounds
    where evidence_entries.created_at >= bounds.since_24h
      and evidence_entries.created_at <= bounds.window_end

    union all

    select
      seed_evidence_entries.stance,
      'seed_claim'::text as claim_type
    from public.seed_evidence_entries, bounds
    where seed_evidence_entries.created_at >= bounds.since_24h
      and seed_evidence_entries.created_at <= bounds.window_end
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
      'support', count(*) filter (where evidence_24h.stance = 'support'),
      'challenge', count(*) filter (where evidence_24h.stance = 'challenge'),
      'context', count(*) filter (where evidence_24h.stance = 'context'),
      'live_claims', count(*) filter (where evidence_24h.claim_type = 'live_claim'),
      'seed_claims', count(*) filter (where evidence_24h.claim_type = 'seed_claim')
    ),
    50
  from evidence_24h

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

-- Public static pages need a narrow feedback review feed without direct table
-- SELECT. This RPC is bounded to the 20 newest rows, never selects visitor_id,
-- and returns only allow-listed attribution metadata with public label/path
-- sanitizers applied.
create or replace function public.get_feedback_review_snapshot()
returns table (
  created_at timestamptz,
  rating smallint,
  use_case text,
  summary text,
  page_path text,
  metadata jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  with newest_feedback as (
    select
      feedback_entries.id,
      feedback_entries.created_at,
      feedback_entries.rating,
      feedback_entries.use_case,
      feedback_entries.summary,
      feedback_entries.page_path,
      feedback_entries.metadata
    from public.feedback_entries
    order by feedback_entries.created_at desc
    limit 20
  ),
  metadata_values as (
    select
      newest_feedback.id,
      metadata_field.key,
      case
        when nullif(btrim(metadata_field.value), '') is null then null
        when metadata_field.kind = 'path'
          and btrim(metadata_field.value) ~ '^/[A-Za-z0-9/_-]{0,255}$'
          then btrim(metadata_field.value)
        when metadata_field.kind = 'label'
          and btrim(metadata_field.value) ~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,95}$'
          then btrim(metadata_field.value)
        when metadata_field.kind = 'path' then '/redacted'
        else 'redacted'
      end as value
    from newest_feedback
    cross join lateral (
      values
        ('ref', newest_feedback.metadata ->> 'ref', 'label'),
        ('claim_id', newest_feedback.metadata ->> 'claim_id', 'label'),
        ('utm_source', newest_feedback.metadata ->> 'utm_source', 'label'),
        ('utm_medium', newest_feedback.metadata ->> 'utm_medium', 'label'),
        ('utm_campaign', newest_feedback.metadata ->> 'utm_campaign', 'label'),
        ('utm_content', newest_feedback.metadata ->> 'utm_content', 'label'),
        ('utm_term', newest_feedback.metadata ->> 'utm_term', 'label'),
        ('source_event', newest_feedback.metadata ->> 'source_event', 'label'),
        ('landing_path', newest_feedback.metadata ->> 'landing_path', 'path')
    ) as metadata_field(key, value, kind)
  ),
  metadata_json as (
    select
      metadata_values.id,
      coalesce(
        jsonb_object_agg(metadata_values.key, metadata_values.value order by metadata_values.key)
          filter (where metadata_values.value is not null),
        '{}'::jsonb
      ) as metadata
    from metadata_values
    group by metadata_values.id
  )
  select
    newest_feedback.created_at,
    newest_feedback.rating,
    newest_feedback.use_case::text as use_case,
    newest_feedback.summary,
    case
      when btrim(newest_feedback.page_path) ~ '^/[A-Za-z0-9/_-]{0,255}$'
        then btrim(newest_feedback.page_path)
      else '/redacted'
    end as page_path,
    coalesce(metadata_json.metadata, '{}'::jsonb) as metadata
  from newest_feedback
  left join metadata_json on metadata_json.id = newest_feedback.id
  order by newest_feedback.created_at desc;
$$;

revoke all on function public.get_feedback_review_snapshot() from public;
grant execute on function public.get_feedback_review_snapshot()
  to anon, authenticated, service_role;

create or replace function private.get_contributor_north_star_impl()
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
      now() - interval '24 hours' as since_24h
  ),
  live_claims as (
    select
      claims.id,
      claims.title,
      claims.created_at
    from public.claims
  ),
  live_evidence as (
    select
      evidence_entries.claim_id,
      evidence_entries.stance,
      evidence_entries.contributor_token,
      evidence_entries.created_at
    from public.evidence_entries
  ),
  claim_coverage as (
    select
      live_claims.id::text as claim_id,
      left(live_claims.title, 160) as title,
      count(live_evidence.claim_id)::integer as evidence_count,
      count(distinct live_evidence.contributor_token)
        filter (where live_evidence.contributor_token is not null)::integer as unique_contributors,
      count(*) filter (where live_evidence.stance = 'support')::integer as support_count,
      count(*) filter (where live_evidence.stance = 'challenge')::integer as challenge_count,
      count(*) filter (where live_evidence.stance = 'context')::integer as context_count
    from live_claims
    left join live_evidence on live_evidence.claim_id = live_claims.id
    group by live_claims.id, live_claims.title
  ),
  claim_coverage_detail as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'claim_id', claim_id,
          'title', title,
          'evidence_count', evidence_count,
          'unique_contributor_count', unique_contributors,
          'support_count', support_count,
          'challenge_count', challenge_count,
          'context_count', context_count
        )
        order by evidence_count desc, unique_contributors desc, title asc
      ),
      '[]'::jsonb
    ) as items
    from (
      select *
      from claim_coverage
      order by evidence_count desc, unique_contributors desc, title asc
      limit 12
    ) ranked_coverage
  ),
  contributor_tokens as (
    select distinct live_evidence.contributor_token
    from live_evidence
    where live_evidence.contributor_token is not null
  ),
  evidence_totals as (
    select
      count(*)::numeric as total,
      count(*) filter (where live_evidence.stance = 'support')::numeric as support,
      count(*) filter (where live_evidence.stance = 'challenge')::numeric as challenge,
      count(*) filter (where live_evidence.stance = 'context')::numeric as context
    from live_evidence
  )
  select
    'live_claims_total'::text as metric,
    'Total live claims'::text as label,
    count(*)::numeric as value,
    'all time'::text as window_label,
    jsonb_build_object(
      'new_last_24h', count(*) filter (
        where live_claims.created_at >= (select since_24h from bounds)
      )
    ) as detail,
    10 as sort_order
  from live_claims

  union all

  select
    'live_evidence_entries_total',
    'Total live evidence entries',
    evidence_totals.total,
    'all time',
    jsonb_build_object(
      'support_count', evidence_totals.support,
      'challenge_count', evidence_totals.challenge,
      'context_count', evidence_totals.context,
      'claim_coverage', (select items from claim_coverage_detail)
    ),
    20
  from evidence_totals

  union all

  select
    'evidence_per_live_claim',
    'Evidence per live claim',
    case
      when (select count(*) from live_claims) = 0 then 0::numeric
      else round(
        (select count(*)::numeric from live_evidence)
        / nullif((select count(*)::numeric from live_claims), 0),
        1
      )
    end,
    'all time',
    jsonb_build_object(
      'healthy_claim_target', 10,
      'claims_without_evidence', count(*) filter (where claim_coverage.evidence_count = 0),
      'claim_coverage', (select items from claim_coverage_detail)
    ),
    30
  from claim_coverage

  union all

  select
    'live_claims_with_3_evidence',
    'Live claims with 3+ evidence entries',
    count(*) filter (where claim_coverage.evidence_count >= 3)::numeric,
    'all time',
    jsonb_build_object(
      'claim_coverage', (select items from claim_coverage_detail)
    ),
    40
  from claim_coverage

  union all

  select
    'live_claims_with_10_evidence',
    'Live claims with 10+ evidence entries',
    count(*) filter (where claim_coverage.evidence_count >= 10)::numeric,
    'all time',
    jsonb_build_object(
      'healthy_claim_target', 10,
      'claim_coverage', (select items from claim_coverage_detail)
    ),
    50
  from claim_coverage

  union all

  select
    'unique_contributors_total',
    'Total unique contributors',
    count(*)::numeric,
    'all time',
    jsonb_build_object(
      'basis', 'live evidence submissions'
    ),
    60
  from contributor_tokens

  union all

  select
    'live_claims_with_5_unique_contributors',
    'Live claims with 5+ unique contributors',
    count(*) filter (where claim_coverage.unique_contributors >= 5)::numeric,
    'all time',
    jsonb_build_object(
      'healthy_claim_target', 5,
      'claim_coverage', (select items from claim_coverage_detail)
    ),
    70
  from claim_coverage

  union all

  select
    'contributor_evidence_submissions_24h',
    'Evidence submissions',
    count(*)::numeric,
    'last 24 hours',
    jsonb_build_object(
      'support_count', count(*) filter (where live_evidence.stance = 'support'),
      'challenge_count', count(*) filter (where live_evidence.stance = 'challenge'),
      'context_count', count(*) filter (where live_evidence.stance = 'context')
    ),
    80
  from live_evidence, bounds
  where live_evidence.created_at >= bounds.since_24h
    and live_evidence.created_at <= bounds.window_end

  union all

  select
    'support_evidence_entries_total',
    'Support evidence',
    evidence_totals.support,
    'all time',
    jsonb_build_object(),
    90
  from evidence_totals

  union all

  select
    'challenge_evidence_entries_total',
    'Challenge evidence',
    evidence_totals.challenge,
    'all time',
    jsonb_build_object(),
    100
  from evidence_totals

  union all

  select
    'context_evidence_entries_total',
    'Context evidence',
    evidence_totals.context,
    'all time',
    jsonb_build_object(),
    110
  from evidence_totals;
$$;

revoke all on function private.get_contributor_north_star_impl() from public;
grant execute on function private.get_contributor_north_star_impl()
  to service_role;

create or replace function public.get_contributor_north_star()
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
  from private.get_contributor_north_star_impl()
  order by sort_order;
$$;

revoke all on function public.get_contributor_north_star() from public;
grant execute on function public.get_contributor_north_star()
  to anon, authenticated, service_role;
