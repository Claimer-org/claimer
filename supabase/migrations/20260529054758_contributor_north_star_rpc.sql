create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to service_role;

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
      evidence_entries.id,
      evidence_entries.claim_id,
      evidence_entries.stance,
      evidence_entries.contributor_token,
      evidence_entries.created_at
    from public.evidence_entries
  ),
  claim_rollup as (
    select
      live_claims.id,
      live_claims.title,
      live_claims.created_at,
      count(live_evidence.id) as evidence_count,
      count(distinct live_evidence.contributor_token) filter (
        where live_evidence.contributor_token is not null
      ) as unique_contributor_count,
      count(live_evidence.id) filter (
        where live_evidence.stance = 'support'
      ) as support_count,
      count(live_evidence.id) filter (
        where live_evidence.stance = 'challenge'
      ) as challenge_count,
      count(live_evidence.id) filter (
        where live_evidence.stance = 'context'
      ) as context_count
    from live_claims
    left join live_evidence on live_evidence.claim_id = live_claims.id
    group by live_claims.id, live_claims.title, live_claims.created_at
  ),
  claim_counts as (
    select
      count(*) as total_claims,
      count(*) filter (where claim_rollup.evidence_count >= 3) as claims_with_3_evidence,
      count(*) filter (where claim_rollup.evidence_count >= 10) as claims_with_10_evidence,
      count(*) filter (
        where claim_rollup.unique_contributor_count >= 5
      ) as claims_with_5_unique_contributors
    from claim_rollup
  ),
  evidence_counts as (
    select
      count(*) as total_evidence,
      count(*) filter (where live_evidence.stance = 'support') as support_count,
      count(*) filter (where live_evidence.stance = 'challenge') as challenge_count,
      count(*) filter (where live_evidence.stance = 'context') as context_count,
      count(distinct live_evidence.contributor_token) filter (
        where live_evidence.contributor_token is not null
      ) as unique_contributor_count,
      count(*) filter (
        where live_evidence.created_at >= bounds.since_24h
          and live_evidence.created_at <= bounds.window_end
      ) as evidence_24h,
      count(*) filter (
        where live_evidence.stance = 'support'
          and live_evidence.created_at >= bounds.since_24h
          and live_evidence.created_at <= bounds.window_end
      ) as support_24h,
      count(*) filter (
        where live_evidence.stance = 'challenge'
          and live_evidence.created_at >= bounds.since_24h
          and live_evidence.created_at <= bounds.window_end
      ) as challenge_24h,
      count(*) filter (
        where live_evidence.stance = 'context'
          and live_evidence.created_at >= bounds.since_24h
          and live_evidence.created_at <= bounds.window_end
      ) as context_24h
    from live_evidence
    cross join bounds
  ),
  claim_coverage_detail as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'claim_id', ranked_claims.id,
          'title', left(ranked_claims.title, 180),
          'evidence_count', ranked_claims.evidence_count,
          'unique_contributor_count', ranked_claims.unique_contributor_count,
          'support_count', ranked_claims.support_count,
          'challenge_count', ranked_claims.challenge_count,
          'context_count', ranked_claims.context_count
        )
        order by
          ranked_claims.evidence_count desc,
          ranked_claims.unique_contributor_count desc,
          ranked_claims.created_at desc,
          ranked_claims.id asc
      ),
      '[]'::jsonb
    ) as items
    from (
      select *
      from claim_rollup
      order by
        claim_rollup.evidence_count desc,
        claim_rollup.unique_contributor_count desc,
        claim_rollup.created_at desc,
        claim_rollup.id asc
      limit 12
    ) ranked_claims
  )
  select
    'live_claims_total'::text as metric,
    'Total live claims'::text as label,
    claim_counts.total_claims::numeric as value,
    'all time'::text as window_label,
    jsonb_build_object(
      'claim_coverage', (select items from claim_coverage_detail)
    ) as detail,
    10 as sort_order
  from claim_counts

  union all

  select
    'live_evidence_entries_total',
    'Total live evidence entries',
    evidence_counts.total_evidence::numeric,
    'all time',
    jsonb_build_object(
      'support_count', evidence_counts.support_count,
      'challenge_count', evidence_counts.challenge_count,
      'context_count', evidence_counts.context_count
    ),
    20
  from evidence_counts

  union all

  select
    'evidence_per_live_claim',
    'Evidence per live claim',
    round(
      coalesce(
        evidence_counts.total_evidence::numeric / nullif(claim_counts.total_claims, 0),
        0
      ),
      2
    ),
    'all time',
    jsonb_build_object(
      'healthy_claim_target', 10,
      'total_live_claims', claim_counts.total_claims,
      'total_live_evidence_entries', evidence_counts.total_evidence
    ),
    30
  from claim_counts
  cross join evidence_counts

  union all

  select
    'live_claims_with_3_evidence',
    'Live claims with 3+ evidence entries',
    claim_counts.claims_with_3_evidence::numeric,
    'all time',
    jsonb_build_object(
      'claim_coverage', (select items from claim_coverage_detail)
    ),
    40
  from claim_counts

  union all

  select
    'live_claims_with_10_evidence',
    'Live claims with 10+ evidence entries',
    claim_counts.claims_with_10_evidence::numeric,
    'all time',
    jsonb_build_object(
      'healthy_claim_target', 10,
      'claim_coverage', (select items from claim_coverage_detail)
    ),
    50
  from claim_counts

  union all

  select
    'unique_contributors_total',
    'Total unique contributors',
    evidence_counts.unique_contributor_count::numeric,
    'all time',
    jsonb_build_object(
      'basis', 'live evidence submissions'
    ),
    60
  from evidence_counts

  union all

  select
    'live_claims_with_5_unique_contributors',
    'Live claims with 5+ unique contributors',
    claim_counts.claims_with_5_unique_contributors::numeric,
    'all time',
    jsonb_build_object(
      'healthy_claim_target', 5,
      'claim_coverage', (select items from claim_coverage_detail)
    ),
    70
  from claim_counts

  union all

  select
    'contributor_evidence_submissions_24h',
    'Evidence submissions',
    evidence_counts.evidence_24h::numeric,
    'last 24 hours',
    jsonb_build_object(
      'support_count', evidence_counts.support_24h,
      'challenge_count', evidence_counts.challenge_24h,
      'context_count', evidence_counts.context_24h
    ),
    80
  from evidence_counts

  union all

  select
    'support_evidence_entries_total',
    'Support evidence',
    evidence_counts.support_count::numeric,
    'all time',
    jsonb_build_object(
      'total_live_evidence_entries', evidence_counts.total_evidence
    ),
    90
  from evidence_counts

  union all

  select
    'challenge_evidence_entries_total',
    'Challenge evidence',
    evidence_counts.challenge_count::numeric,
    'all time',
    jsonb_build_object(
      'total_live_evidence_entries', evidence_counts.total_evidence
    ),
    100
  from evidence_counts

  union all

  select
    'context_evidence_entries_total',
    'Context evidence',
    evidence_counts.context_count::numeric,
    'all time',
    jsonb_build_object(
      'total_live_evidence_entries', evidence_counts.total_evidence
    ),
    110
  from evidence_counts;
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
