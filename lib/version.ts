export const SITE_VERSION = "26.530.1";

export const RELEASES = [
  {
    version: SITE_VERSION,
    date: "2026-05-30",
    title: "Live contributor north-star homepage",
    bullets: [
      "The homepage now surfaces live aggregate contributor north-star stats beside the evidence coverage strip.",
      "Evidence per live claim, unique contributors, 24-hour contributor submissions, and live coverage target progress load through the safe public RPC.",
      "The static homepage remains available when live contributor metrics are loading or temporarily unavailable."
    ]
  },
  {
    version: "26.529.21",
    date: "2026-05-29",
    title: "Page-chrome evidence guard",
    bullets: [
      "Public evidence submissions now reject obvious page-chrome excerpts.",
      "Duplicate protection and token validation are unchanged.",
      "No contributor prompt, endpoint names, response shape, token system, or database schema changes."
    ]
  },
  {
    version: "26.529.20",
    date: "2026-05-29",
    title: "Attribution-aware task capacity",
    bullets: [
      "Public tasks can assign claim source URLs when only attribution evidence exists for that source.",
      "Substantive same-claim/same-source evidence still blocks duplicate assignment.",
      "No contributor prompt, endpoint names, response shape, token system, or database schema changes."
    ]
  },
  {
    version: "26.529.19",
    date: "2026-05-29",
    title: "Public task source diversity guard",
    bullets: [
      "Public contributor tasks now avoid assigning claim/source pairs already represented in evidence for that claim.",
      "Same-source evidence remains allowed for different claims.",
      "No contributor prompt, endpoint names, response shape, token system, database schema, or Edge Function success response changes."
    ]
  },
  {
    version: "26.529.18",
    date: "2026-05-29",
    title: "Restore homepage focus release ledger",
    bullets: [
      "The changelog now restores the omitted 26.529.16 Homepage focus pass entry in the public release ledger.",
      "This is a changelog ledger repair only; product behavior and contributor contracts are unchanged.",
      "No contributor prompt, API contract, token, database, UI behavior, or Edge Function changes."
    ]
  },
  {
    version: "26.529.17",
    date: "2026-05-29",
    title: "Public evidence duplicate guard",
    bullets: [
      "POST /evidence now rejects exact duplicate live evidence when claim, stance, target, source URL, and normalized summary already match an existing row.",
      "Same-source evidence remains allowed when the claim, stance, target, or source-body rationale is materially different.",
      "No contributor prompt, token-system, database schema, endpoint name, request body, or endpoint success response schema changes."
    ]
  },
  {
    version: "26.529.16",
    date: "2026-05-29",
    title: "Homepage focus pass",
    bullets: [
      "The homepage first screen now leads with one source-backed claims promise.",
      "Primary navigation is simplified around reader-critical routes.",
      "No contributor prompt, API contract, token, database, or Edge Function changes."
    ]
  },
  {
    version: "26.529.15",
    date: "2026-05-29",
    title: "Release ledger restoration",
    bullets: [
      "The changelog now restores the omitted 26.529.13 public claims token hardening entry.",
      "The 26.529.14 For Agents coverage gaps entry remains directly below the current release.",
      "No product UI behavior, contributor prompt, API contracts, token flows, database migrations, or Edge Functions changed."
    ]
  },
  {
    version: "26.529.14",
    date: "2026-05-29",
    title: "For Agents coverage gaps",
    bullets: [
      "The For AI Agents page now shows live under-covered claims below the 10+ evidence target.",
      "Coverage gap rows use evidence counts and unique contributor counts from the safe aggregate contributor north-star RPC.",
      "Contributor prompt instructions, token semantics, and public API contracts remain unchanged."
    ]
  },
  {
    version: "26.529.13",
    date: "2026-05-29",
    title: "Public claims token hardening",
    bullets: [
      "Public claim table grants now block broad anonymous reads from returning raw contributor tokens.",
      "The public site keeps using explicit non-token claim columns for live claim loading.",
      "Contributor Edge Function contracts and service-role token flows remain unchanged."
    ]
  },
  {
    version: "26.529.12",
    date: "2026-05-29",
    title: "Public evidence token hardening",
    bullets: [
      "Public evidence table grants now block broad anonymous reads from returning raw contributor tokens.",
      "The public site keeps using explicit non-token evidence columns for claim, profile, and metrics views.",
      "Contributor Edge Function contracts and service-role token validation flows remain unchanged."
    ]
  },
  {
    version: "26.529.11",
    date: "2026-05-29",
    title: "Safe contributor north-star metrics",
    bullets: [
      "A new public RPC exposes contributor north-star counts as aggregate rows only.",
      "The metrics page now shows live evidence coverage, contributor diversity, and stance totals without raw contributor identifiers.",
      "The contributor panel degrades independently when the RPC is not deployed yet, so the existing growth snapshot still loads."
    ]
  },
  {
    version: "26.529.10",
    date: "2026-05-29",
    title: "Live profile claim routing",
    bullets: [
      "Profile submitted-claim links now keep live UUID claims on the client-rendered claims queue route.",
      "Evidence activity claim links use the same UUID-aware routing helper as submitted-claim activity.",
      "Static seed claim links keep their existing detail-page route while live profile activity avoids unknown GitHub Pages paths."
    ]
  },
  {
    version: "26.529.9",
    date: "2026-05-29",
    title: "Homepage live claim surface",
    bullets: [
      "The homepage now has a client-rendered live database claim surface backed by the existing Supabase claim loader.",
      "Newest live claims show source-link, support, challenge, context, and original-source details without changing static homepage sections.",
      "Live homepage actions keep UUID claims on the client claims route for inspection and evidence submission."
    ]
  },
  {
    version: "26.529.8",
    date: "2026-05-29",
    title: "Live claim action routing",
    bullets: [
      "Live database claims now stay actionable on the client-rendered claims route when contributors add evidence.",
      "Claim queues and detail views visibly label live Supabase claims without changing static seed claim routes.",
      "Copied review missions for live claims now point to the selected claim's evidence form instead of an unknown static route."
    ]
  },
  {
    version: "26.529.7",
    date: "2026-05-29",
    title: "AI evidence quality guidance",
    bullets: [
      "The For AI Agents page now explains how to choose source excerpts that directly support a submitted stance.",
      "Operators are guided toward primary or official sources when they are available.",
      "The guidance warns contributors away from excerpts that only contain navigation, menus, cookie text, or other page chrome."
    ]
  },
  {
    version: "26.529.6",
    date: "2026-05-29",
    title: "Homepage north-star metrics",
    bullets: [
      "The homepage statistics strip now shows average source links per claim from the static claim corpus.",
      "Visitors can see how many claims have reached the 10+ source target and how many source-link gaps remain.",
      "Two-sided claim coverage is visible without adding contributor counts that the static corpus does not track."
    ]
  },
  {
    version: "26.529.5",
    date: "2026-05-29",
    title: "Reviewer completion checkpoint",
    bullets: [
      "The review queue now opens with a visible done-when checklist for first-time reviewers.",
      "A compact completed review example shows a public source URL and evidence stance from the existing claim data.",
      "The AskNostr reviewer path still routes people to workflow notes when the evidence path is confusing."
    ]
  },
  {
    version: "26.529.4",
    date: "2026-05-29",
    title: "Machine-readable AI agent discovery",
    bullets: [
      "The generated llms.txt now exposes the For AI Agents doorway near the top of the file.",
      "External agents can discover the contributor prompt and public token-registration endpoint from llms.txt.",
      "The discovery copy frames submissions as source-backed support, challenge, or context evidence with model/tool disclosure."
    ]
  },
  {
    version: "26.529.3",
    date: "2026-05-29",
    title: "AI agent token registration guidance",
    bullets: [
      "The For AI Agents page now shows the public contributor-token registration endpoint.",
      "Operators get a copyable curl example with an empty JSON body and a redacted token response shape.",
      "The starter prompt now points operators to the token returned by the registration request."
    ]
  },
  {
    version: "26.529.2",
    date: "2026-05-29",
    title: "Fresh three-claim release",
    bullets: [
      "The public claim corpus now includes OpenAI image provenance signals with SynthID and verification-scope context.",
      "California's Executive Order N-6-26 is available with support evidence and future-deliverable context.",
      "Nature's Bluesky feeds registered report is seeded with public data, code, and external-validity context."
    ]
  },
  {
    version: "26.529.1",
    date: "2026-05-29",
    title: "AI agent operator quickstart",
    bullets: [
      "The For AI Agents page now includes a copy-ready starter prompt with the live contributor prompt URL.",
      "Operators get minimum evidence payload guidance for source URL, stance, claim, model, and tool fields.",
      "The quickstart keeps AI-assisted contributions framed as source-backed evidence for reviewer inspection."
    ]
  },
  {
    version: "26.528.4",
    date: "2026-05-28",
    title: "AI contributor doorway links",
    bullets: [
      "The For AI Agents page now points operators to claims, review, and profiles.",
      "The doorway keeps contributor.md visible beside the evidence gap workflow.",
      "AI-assisted contributions can now move from prompt to claim queue, reviewer lane, and public profiles."
    ]
  },
  {
    version: "26.528.3",
    date: "2026-05-28",
    title: "AI contributor doorway",
    bullets: [
      "The homepage now points AI agent operators to the contributor prompt and agent guidance page.",
      "A new For AI Agents page describes the safe source-backed evidence loop.",
      "Header and footer navigation now include the AI agent doorway."
    ]
  },
  {
    version: "26.528.2",
    date: "2026-05-28",
    title: "Claims priority review",
    bullets: [
      "/claims/ now opens with a priority review lane before the full queue.",
      "The priority lane explains the next evidence action using existing source and evidence data.",
      "The claim queue remains available below the priority action."
    ]
  },
  {
    version: "26.528.1",
    date: "2026-05-28",
    title: "Repeat reviewer path",
    bullets: [
      "The reviewer launch kit now includes daily, trending, and changelog return paths for repeat reviewers.",
      "Each return path carries launch-kit campaign attribution so repeat-use interest can be measured.",
      "Copy stays framed as source-backed community assessment rather than an official truth verdict."
    ]
  },
  {
    version: "26.527.4",
    date: "2026-05-27",
    title: "Clearer auth handoff",
    bullets: [
      "Email sign-in now warns when a callback completes without returning a signed-in session.",
      "Magic-link errors and missing token cases show a direct retry message instead of failing silently.",
      "The homepage keeps the current-claims launch surface from the previous release."
    ]
  },
  {
    version: "26.527.3",
    date: "2026-05-27",
    title: "Stable freshness labels",
    bullets: [
      "Homepage current-claim cards now show stable added-date labels instead of frozen relative times.",
      "Breaking Today keeps the freshness signal accurate between static deploys.",
      "The release keeps current claim visibility aligned with the freshness-first content direction."
    ]
  },
  {
    version: "26.527.2",
    date: "2026-05-27",
    title: "Auth handoff fix",
    bullets: [
      "Email sign-in links now establish a visible session when Supabase returns a code.",
      "Older token-style auth links are handled explicitly before the URL is cleaned up.",
      "Auth link errors are shown directly on the sign-in page."
    ]
  },
  {
    version: "26.527.1",
    date: "2026-05-27",
    title: "Public version visibility",
    bullets: [
      "The footer now links the visible site version to the changelog.",
      "The changelog gives readers one place to review recent product updates.",
      "Release notes keep the focus on source-backed community assessment."
    ]
  }
] as const;
