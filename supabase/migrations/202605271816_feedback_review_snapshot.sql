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
  select
    feedback_entries.created_at,
    feedback_entries.rating,
    feedback_entries.use_case,
    feedback_entries.summary,
    private.public_growth_path(feedback_entries.page_path) as page_path,
    jsonb_strip_nulls(jsonb_build_object(
      'ref', private.public_growth_label(feedback_entries.metadata ->> 'ref', null),
      'claim_id', private.public_growth_label(feedback_entries.metadata ->> 'claim_id', null),
      'utm_source', private.public_growth_label(feedback_entries.metadata ->> 'utm_source', null),
      'utm_medium', private.public_growth_label(feedback_entries.metadata ->> 'utm_medium', null),
      'utm_campaign', private.public_growth_label(feedback_entries.metadata ->> 'utm_campaign', null),
      'utm_content', private.public_growth_label(feedback_entries.metadata ->> 'utm_content', null),
      'utm_term', private.public_growth_label(feedback_entries.metadata ->> 'utm_term', null),
      'source_event', private.public_growth_label(feedback_entries.metadata ->> 'source_event', null),
      'landing_path', private.public_growth_path(feedback_entries.metadata ->> 'landing_path', null)
    )) as metadata
  from public.feedback_entries
  order by feedback_entries.created_at desc
  limit 20;
$$;

revoke all on function public.get_feedback_review_snapshot() from public;
grant execute on function public.get_feedback_review_snapshot()
  to anon, authenticated, service_role;
