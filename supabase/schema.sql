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

create index claims_domain_created_at_idx on public.claims (domain, created_at desc);
create index evidence_entries_claim_id_created_at_idx on public.evidence_entries (claim_id, created_at desc);
create index attribution_scores_claim_id_created_at_idx on public.attribution_scores (claim_id, created_at desc);
create index veracity_scores_claim_id_created_at_idx on public.veracity_scores (claim_id, created_at desc);
create index analytics_events_created_at_idx on public.analytics_events (created_at desc);
create index analytics_events_dau_idx
  on public.analytics_events (event_name, created_at desc, visitor_id);

alter table public.profiles enable row level security;
alter table public.sources enable row level security;
alter table public.claims enable row level security;
alter table public.evidence_entries enable row level security;
alter table public.attribution_scores enable row level security;
alter table public.veracity_scores enable row level security;
alter table public.analytics_events enable row level security;

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

revoke select, update, delete
  on table public.analytics_events
  from anon, authenticated;

grant select, update, delete
  on table public.analytics_events
  to service_role;

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
