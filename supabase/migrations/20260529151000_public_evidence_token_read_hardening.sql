-- Prevent public broad evidence reads from exposing bearer-token identities.
-- Public site reads use explicit non-token columns; service-role paths keep full access.

revoke select
  on table public.evidence_entries
  from anon, authenticated;

grant select
  on table public.evidence_entries
  to service_role;

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
