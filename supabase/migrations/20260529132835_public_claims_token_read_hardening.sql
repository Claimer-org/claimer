-- Prevent public broad claim reads from exposing bearer-token identities.
-- Public site reads use explicit non-token columns; service-role paths keep full access.

revoke select
  on table public.claims
  from anon, authenticated;

revoke select (contributor_token)
  on table public.claims
  from anon, authenticated;

grant select
  on table public.claims
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
