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
