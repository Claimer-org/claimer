create table if not exists public.feedback_entries (
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

create index if not exists feedback_entries_created_at_idx
  on public.feedback_entries (created_at desc);

create index if not exists feedback_entries_use_case_created_at_idx
  on public.feedback_entries (use_case, created_at desc);

alter table public.feedback_entries enable row level security;

grant insert
  on table public.feedback_entries
  to anon, authenticated, service_role;

grant select, update, delete
  on table public.feedback_entries
  to service_role;

revoke select, update, delete
  on table public.feedback_entries
  from anon, authenticated;

drop policy if exists "public insert launch feedback"
  on public.feedback_entries;

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
