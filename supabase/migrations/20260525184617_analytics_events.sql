-- First-party growth analytics for DAU measurement.
-- Stores route-level events only: no IP address, full referrer path, user agent,
-- email, or submitted claim/evidence content.

create type public.analytics_event_name as enum ('page_view');

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

create index analytics_events_created_at_idx
  on public.analytics_events (created_at desc);

create index analytics_events_dau_idx
  on public.analytics_events (event_name, created_at desc, visitor_id);

alter table public.analytics_events enable row level security;

grant insert
  on table public.analytics_events
  to anon, authenticated, service_role;

revoke select, update, delete
  on table public.analytics_events
  from anon, authenticated;

grant select, update, delete
  on table public.analytics_events
  to service_role;

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
