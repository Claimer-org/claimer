create table if not exists public.contributor_profiles (
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

create index if not exists contributor_profiles_status_last_seen_idx
  on public.contributor_profiles (status, last_seen_at desc);

alter table public.contributor_profiles enable row level security;

revoke all
  on table public.contributor_profiles
  from anon, authenticated;

grant select, insert, update
  on table public.contributor_profiles
  to service_role;

alter table public.claims
  alter column submitted_by drop not null;

alter table public.claims
  add column if not exists contributor_token uuid
    references public.contributor_profiles (token) on delete restrict,
  add column if not exists model_used text,
  add column if not exists tool_used text;

alter table public.evidence_entries
  alter column submitted_by drop not null;

alter table public.evidence_entries
  add column if not exists contributor_token uuid
    references public.contributor_profiles (token) on delete restrict,
  add column if not exists model_used text,
  add column if not exists tool_used text;

create index if not exists claims_contributor_token_created_at_idx
  on public.claims (contributor_token, created_at desc)
  where contributor_token is not null;

create index if not exists evidence_entries_contributor_token_created_at_idx
  on public.evidence_entries (contributor_token, created_at desc)
  where contributor_token is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'claims_submitter_identity_check'
      and conrelid = 'public.claims'::regclass
  ) then
    alter table public.claims
      add constraint claims_submitter_identity_check check (
        submitted_by is not null
        or contributor_token is not null
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'claims_contributor_model_check'
      and conrelid = 'public.claims'::regclass
  ) then
    alter table public.claims
      add constraint claims_contributor_model_check check (
        contributor_token is null
        or (
          nullif(trim(model_used), '') is not null
          and char_length(model_used) <= 120
        )
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'claims_contributor_tool_check'
      and conrelid = 'public.claims'::regclass
  ) then
    alter table public.claims
      add constraint claims_contributor_tool_check check (
        contributor_token is null
        or (
          nullif(trim(tool_used), '') is not null
          and char_length(tool_used) <= 120
        )
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'evidence_entries_submitter_identity_check'
      and conrelid = 'public.evidence_entries'::regclass
  ) then
    alter table public.evidence_entries
      add constraint evidence_entries_submitter_identity_check check (
        submitted_by is not null
        or contributor_token is not null
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'evidence_entries_contributor_model_check'
      and conrelid = 'public.evidence_entries'::regclass
  ) then
    alter table public.evidence_entries
      add constraint evidence_entries_contributor_model_check check (
        contributor_token is null
        or (
          nullif(trim(model_used), '') is not null
          and char_length(model_used) <= 120
        )
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'evidence_entries_contributor_tool_check'
      and conrelid = 'public.evidence_entries'::regclass
  ) then
    alter table public.evidence_entries
      add constraint evidence_entries_contributor_tool_check check (
        contributor_token is null
        or (
          nullif(trim(tool_used), '') is not null
          and char_length(tool_used) <= 120
        )
      );
  end if;
end $$;

drop policy if exists "authenticated insert claims"
  on public.claims;

create policy "authenticated insert claims"
  on public.claims for insert
  to authenticated
  with check (
    submitted_by = auth.uid()
    and contributor_token is null
    and model_used is null
    and tool_used is null
  );

drop policy if exists "authenticated insert evidence entries"
  on public.evidence_entries;

create policy "authenticated insert evidence entries"
  on public.evidence_entries for insert
  to authenticated
  with check (
    submitted_by = auth.uid()
    and contributor_token is null
    and model_used is null
    and tool_used is null
  );
