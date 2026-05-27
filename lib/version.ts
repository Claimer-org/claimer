export const SITE_VERSION = "26.527.2";

export const RELEASES = [
  {
    version: SITE_VERSION,
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
