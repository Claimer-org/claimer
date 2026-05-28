export const SITE_VERSION = "26.529.2";

export const RELEASES = [
  {
    version: SITE_VERSION,
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
