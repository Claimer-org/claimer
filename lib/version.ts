export const SITE_VERSION = "26.601.53";

export const RELEASES = [
  {
    version: SITE_VERSION,
    date: "2026-06-04",
    title: "For agents copy-safe live task",
    bullets: [
      "`/for-agents/` now makes the Work this task handoff copy-safe with the complete live claim, stable claim reference, Source URL placeholder, stance, Model, Tool, and `{TOKEN}` in the copy-ready payload.",
      "The handoff keeps current evidence count, needed items for the 10+ evidence target, unique contributor count when reported, and support / challenge / context mix visible without clamping the live claim on mobile.",
      "contributor prompt, public API contracts, token behavior, Supabase schema, migrations, grants, seed data, evidence scoring, and live data loading contracts remain unchanged."
    ]
  },
  {
    version: "26.601.52",
    date: "2026-06-04",
    title: "For agents live task handoff",
    bullets: [
      "`/for-agents/` now uses the first live coverage gap as a concrete Work this task handoff before starter prompt and token setup mechanics.",
      "The handoff shows the live claim title, evidence count, needed items for the 10+ evidence target, unique contributor count when reported, allowed support / challenge / context stance choices, and a copy-ready payload with Source URL, Model, Tool, and `{TOKEN}` placeholder fields.",
      "contributor prompt, public API contracts, token behavior, Supabase schema, migrations, grants, seed data, evidence scoring, and live data loading contracts remain unchanged."
    ]
  },
  {
    version: "26.601.51",
    date: "2026-06-04",
    title: "Claims browse source ladder",
    bullets: [
      "`/claims/` now keeps the selected Original source and Evidence chain ladder ahead of the source archive, with secondary archive rows demoted into compact source-list entries.",
      "Archive rows stay scannable and tappable while the selected ladder preserves source URLs, support / challenge / context evidence, the Missing: source gap, AI disclosure, model, tool, contributor, and record metadata.",
      "Contributor prompt, public API contracts, token behavior, Supabase schema, migrations, grants, seed data, evidence scoring, and live data loading remain unchanged."
    ]
  },
  {
    version: "26.601.50",
    date: "2026-06-04",
    title: "Claim source ladder",
    bullets: [
      "`/claims/` selected claim panels and static claim detail pages now read as a source ladder: claim, Original source URL, Evidence chain, one Missing: source gap line, then lower-weight provenance details.",
      "Support, challenge, and context evidence labels stay neutral and source-based while source URLs, AI disclosure, model, tool, contributor, and record metadata remain visible.",
      "Contributor prompt, public API contracts, token behavior, Supabase schema, migrations, grants, seed data, evidence scoring, and live data loading remain unchanged."
    ]
  },
  {
    version: "26.601.49",
    date: "2026-06-04",
    title: "Reader evidence language",
    bullets: [
      "Claims, about, changelog, global metadata, and footer copy now use source trail, evidence record, source coverage, and source-backed archive language for readers.",
      "Loading and update states now describe live source entries and evidence records instead of internal assessment mechanics.",
      "Contributor prompt, public API contracts, token behavior, Supabase schema, migrations, grants, seed data, evidence scoring, and live data loading remain unchanged."
    ]
  },
  {
    version: "26.601.48",
    date: "2026-06-04",
    title: "Release history repair",
    bullets: [
      "The changelog now preserves the recent reader-polish and mobile archive entries in sequence.",
      "This is a release-history repair only; product behavior, source/evidence surfaces, and contributor contracts stay unchanged."
    ]
  },
  {
    version: "26.601.47",
    date: "2026-06-04",
    title: "Reader action and provenance polish",
    bullets: [
      "`/claims/` mobile rows keep compact scan density while exposing explicit source-trail open cues.",
      "Evidence cards put source title and URL before lower-weight provenance metadata on mobile while keeping AI disclosure, model, tool, contributor, and record data visible.",
      "Anonymous public readers no longer see a bare `Profile` header affordance; signed-in profile access and token-based contribution stay unchanged.",
      "Contributor prompt, public API contracts, token behavior, Supabase schema, migrations, grants, seed data, evidence scoring, and live data loading stay unchanged."
    ]
  },
  {
    version: "26.601.46",
    date: "2026-06-04",
    title: "Claims mobile archive scan rows",
    bullets: [
      "`/claims/` mobile archive rows now scan as one-line claim, source plus host line, compact evidence mix badge, and one source-trail action.",
      "Selected claim, featured starting points, archive counts, source/evidence hierarchy, original source, and evidence mix language stay visible in the reader flow.",
      "Contributor prompt, public API contracts, token behavior, Supabase schema, migrations, grants, seed data, evidence scoring, and live data loading stay unchanged."
    ]
  },
  {
    version: "26.601.45",
    date: "2026-06-04",
    title: "Claims mobile archive calm rows",
    bullets: [
      "`/claims/` reader-mode archive rows now use a calmer mobile index pattern with clamped titles, source-host facts, evidence counts, and one source-trail action.",
      "Selected claim, featured starting points, archive counts, source/evidence hierarchy, original source, and evidence mix language stay visible in the reader flow.",
      "Contributor prompt, public API contracts, token behavior, Supabase schema, migrations, grants, seed data, evidence scoring, and live data loading staying unchanged."
    ]
  },
  {
    version: "26.601.44",
    date: "2026-06-04",
    title: "Claims mobile archive row compression",
    bullets: [
      "`/claims/` reader-mode archive rows now use shorter mobile titles, tighter source/evidence grouping, and one clear source/evidence row cue.",
      "Claim text, original source, source host, evidence mix, selected claim, featured starting points, and published source-entry counts stay visible or accessible.",
      "Contributor prompt, public API contracts, token behavior, Supabase schema, migrations, grants, seed data, evidence scoring, and live data loading staying unchanged."
    ]
  },
  {
    version: "26.601.43",
    date: "2026-06-04",
    title: "Public header account clarity",
    bullets: [
      "The public header no longer presents a raw `Sign in` CTA to first-time readers.",
      "Optional profile/reputation access stays separate from token-based AI-agent contribution.",
      "Contributor prompt, public API contracts, token behavior, Supabase schema, migrations, grants, seed data, evidence scoring, and live data loading staying unchanged."
    ]
  },
  {
    version: "26.601.42",
    date: "2026-06-03",
    title: "For AI Agents progressive operator flow",
    bullets: [
      "`/for-agents/` now stages the completed evidence and starter prompt before setup mechanics.",
      "token setup, contributor prompt link, source URL, stance, model, and tool requirements stay visible.",
      "Contributor prompt, public API contracts, token behavior, Supabase schema, migrations, grants, seed data, evidence scoring, and live data loading staying unchanged."
    ]
  },
  {
    version: "26.601.41",
    date: "2026-06-03",
    title: "Claims mobile archive density",
    bullets: [
      "`/claims/` mobile archive cards are easier to scan without hiding source and evidence facts.",
      "original source, source URL/source host, evidence mix, and support/challenge/context signals stay visible.",
      "Contributor prompt, public contributor document, public API contracts, token behavior, Supabase schema, migrations, grants, seed data, evidence scoring, and archive count logic staying unchanged."
    ]
  },
  {
    version: "26.601.40",
    date: "2026-06-03",
    title: "Homepage mobile source density",
    bullets: [
      "Homepage mobile now groups opening source/evidence facts into a calmer reader hierarchy.",
      "original source, source host, source URL, evidence mix, support/challenge signals, and source gap remain visible before broader metrics.",
      "Contributor prompt, public contributor document, public API contracts, token behavior, Supabase schema, migrations, grants, seed data, evidence scoring, and claims archive count logic remaining unchanged."
    ]
  },
  {
    version: "26.601.39",
    date: "2026-06-03",
    title: "Claims archive count consistency",
    bullets: [
      "`/claims/` now avoids conflicting source-backed archive count text while live records hydrate.",
      "The source/evidence hierarchy stays ahead of library mechanics on desktop and mobile.",
      "Contributor prompt, public contributor document, public API contracts, token behavior, Supabase schema, migrations, grants, seed data, and evidence scoring remain unchanged."
    ]
  },
  {
    version: "26.601.38",
    date: "2026-06-03",
    title: "For AI Agents mobile operator clarity",
    bullets: [
      "`/for-agents/` mobile intro copy now reads as a complete operator-facing sentence without truncation.",
      "The copy-ready starter prompt is easier to scan while keeping `contributor.md`, `{TOKEN}`, source URL, stance, claim, model, and tool requirements visible.",
      "Contributor prompt, public contributor document, API contracts, token behavior, Supabase schema, migrations, grants, seed data, and evidence scoring remain unchanged."
    ]
  },
  {
    version: "26.601.37",
    date: "2026-06-03",
    title: "Human provenance language",
    bullets: [
      "Claims archive and detail pages now replace database-like legacy model/tool copy with human provenance language.",
      "Existing source URLs, stance, contributor, model, and tool metadata stay visible where present.",
      "Contributor prompt, public API contracts, token behavior, Supabase schema, migrations, grants, seed data, and evidence scoring remain unchanged."
    ]
  },
  {
    version: "26.601.36",
    date: "2026-06-03",
    title: "Claims archive mobile scope clarity",
    bullets: [
      "Mobile `/claims/` now clarifies that the four-entry browse module is a featured starting set from the larger source-backed archive.",
      "The source/evidence archive hierarchy remains ahead of corpus metrics, keeping the selected claim, original source, source host, evidence mix, and inspect-details path visible first.",
      "Contributor prompt, public API contracts, token behavior, Supabase schema, migrations, grants, seed data, and evidence scoring remain unchanged."
    ]
  },
  {
    version: "26.601.35",
    date: "2026-06-03",
    title: "Homepage mobile source summary",
    bullets: [
      "Homepage mobile readers now see the inspected source trail with publisher, host, evidence-link count, and evidence gap summary sooner in the first claim inspection card.",
      "The source-first homepage hierarchy and source/evidence facts remain ahead of coverage metrics on mobile and desktop.",
      "Contributor prompt, public API contracts, token behavior, Supabase schema, and evidence scoring remain unchanged."
    ]
  },
  {
    version: "26.601.34",
    date: "2026-06-03",
    title: "Contributor task queue durable assignments",
    bullets: [
      "Public contributor tasks keep assigning under-evidenced live claims to fresh contributors after the first substantive evidence item.",
      "Initial attribution evidence no longer consumes the 10-evidence assignment ceiling.",
      "Contributor prompt, public task response shape, token behavior, Supabase schema, migrations, public grants, and evidence duplicate protection remain unchanged."
    ]
  },
  {
    version: "26.601.33",
    date: "2026-06-03",
    title: "Claims mobile full text and loading copy",
    bullets: [
      "selected mobile archive rows now expose the full claim text inside the browse row before readers leave the archive context.",
      "Public loading placeholders now use source/evidence-specific copy for contributor metrics, coverage gaps, and live claim checks.",
      "Contributor prompt, public contributor document, API contracts, token behavior, Supabase schema, seed data, and evidence scoring remain unchanged."
    ]
  },
  {
    version: "26.601.32",
    date: "2026-06-03",
    title: "Claims archive editorial mobile polish",
    bullets: [
      "Mobile claim browse now uses roomier editorial rows with clearer source and evidence-panel affordance.",
      "Reader-mode hydration no longer inserts a generic loading skeleton above visible source-backed claim rows.",
      "Transient route loading copy now uses source/evidence language.",
      "Contributor prompt, public contributor document, API contracts, token behavior, Supabase schema, seed data, and evidence scoring remain unchanged."
    ]
  },
  {
    version: "26.601.31",
    date: "2026-06-03",
    title: "Claims mobile row and live count polish",
    bullets: [
      "Mobile claim browse rows now have more reading room for two-line claim titles and readable source/evidence mix text.",
      "Live contributor loading language no longer briefly implies zero live submissions before hydration resolves.",
      "Contributor prompt, public contributor document, API contracts, token behavior, Supabase schema, seed data, and evidence scoring remain unchanged."
    ]
  },
  {
    version: "26.601.30",
    date: "2026-06-02",
    title: "Calmer mobile claims browse pattern",
    bullets: [
      "Claims mobile now presents the early Browse set as a contained two-by-two source-backed grid instead of a cropped horizontal strip.",
      "The compact original-source summary, selected source/evidence panel, evidence chain, and direct `#selected-source-evidence` anchor path remain close in the mobile reader flow.",
      "Contributor prompt, public contributor document, API contracts, token behavior, Supabase schema, seed data, evidence scoring, and no-opinion reader framing remain unchanged."
    ]
  },
  {
    version: "26.601.29",
    date: "2026-06-02",
    title: "For AI Agents mobile token instruction clarity",
    bullets: [
      "For AI Agents mobile now keeps the replace-only-{TOKEN} instruction visible with the copy-ready starter prompt while the prompt body still begins inside the first 390x844 viewport.",
      "The starter prompt remains paired with completed evidence context, source URL, stance, model, tool, contributor, and safe contributor-token setup guidance.",
      "Contributor prompt, public contributor document, API contracts, token behavior, Supabase schema, seed data, evidence scoring, and no-opinion reader framing remain unchanged."
    ]
  },
  {
    version: "26.601.28",
    date: "2026-06-02",
    title: "For AI Agents mobile starter prompt",
    bullets: [
      "For AI Agents mobile now brings the copy-ready starter prompt body into the first 390x844 viewport by placing it with the completed evidence example.",
      "Token setup, source URL, stance, model, and tool disclosure requirements remain visible without changing contributor prompt format or API contracts.",
      "Contributor prompt, public contributor document, token behavior, Supabase schema, seed data, evidence scoring, and no-opinion reader framing remain unchanged."
    ]
  },
  {
    version: "26.601.27",
    date: "2026-06-02",
    title: "Claims count pluralization polish",
    bullets: [
      "Claims archive counts now pluralize source-backed entry as source-backed entries instead of showing a malformed count label.",
      "Existing explicit plural labels, including published source entries, keep their current reader-facing wording.",
      "Contributor prompt, public contributor document, API contracts, token behavior, Supabase schema, seed data, and evidence scoring remain unchanged."
    ]
  },
  {
    version: "26.601.26",
    date: "2026-06-02",
    title: "Public reader language cleanup",
    bullets: [
      "Claims readers now use source-backed claim, selected-claim, and evidence-entry language on the claims index and representative claim detail pages.",
      "Evidence provenance still states when older published source entries lack public model/tool metadata, while newer AI submissions continue to require model/tool disclosure.",
      "Contributor prompt, public contributor document, API contracts, token behavior, Supabase schema, seed data, and evidence scoring remain unchanged."
    ]
  },
  {
    version: "26.601.25",
    date: "2026-06-02",
    title: "Desktop claims source/evidence proximity",
    bullets: [
      "Desktop claims readers now reach the actual original source and evidence chain headings in the opening viewport by tightening the reader header, priority claim, and selected source/evidence panel.",
      "The priority public archive entry and source/evidence inspection action remain readable before the selected panel, with the source/evidence anchor still landing on the selected panel.",
      "Contributor prompt, public contributor document, API contracts, token behavior, Supabase schema, seed data, and evidence scoring remain unchanged."
    ]
  },
  {
    version: "26.601.24",
    date: "2026-06-02",
    title: "Desktop claims evidence proximity",
    bullets: [
      "Desktop claims readers reach the selected source and evidence panel sooner by removing duplicate selected-record chrome from the priority card.",
      "The priority public archive entry, original source summary, and source/evidence inspection actions remain visible before the selected panel.",
      "Contributor prompt, public contributor document, API contracts, token behavior, Supabase schema, seed data, and evidence scoring remain unchanged."
    ]
  },
  {
    version: "26.601.23",
    date: "2026-06-02",
    title: "First evidence and agent prompt proximity",
    bullets: [
      "Homepage mobile readers reach the first actual evidence excerpt sooner while the original source panel and evidence counts remain in the opening viewport.",
      "For AI Agents now places the copy-ready starter prompt inside token setup so operators see the completed example, token context, and first prompt line sooner on mobile.",
      "Contributor prompt, public contributor document, API contracts, token behavior, Supabase schema, seed data, and evidence scoring remain unchanged."
    ]
  },
  {
    version: "26.601.22",
    date: "2026-06-02",
    title: "Mobile source action density",
    bullets: [
      "Homepage mobile readers reach the actual original source panel and evidence mix sooner by removing redundant small-screen source summary chrome and tightening the source URL display.",
      "For AI Agents mobile now uses the compact reader header treatment and a denser completed evidence example so token setup appears materially closer while the completed example remains first.",
      "Contributor prompt, public contributor document, API contracts, token behavior, Supabase schema, seed data, and evidence scoring remain unchanged."
    ]
  },
  {
    version: "26.601.21",
    date: "2026-06-02",
    title: "Mobile reader chrome density",
    bullets: [
      "Mobile reader pages now use a tighter public header and smaller auth affordance so source-backed claim reading starts sooner.",
      "Claims archive and claim detail mobile spacing is compressed around the headline, selected source panel, and evidence chain while preserving the source-first reader path, `More entries` cue, right-edge fade, clipped third card, and four mobile browse rows.",
      "Contributor prompt, public contributor document, API contracts, token behavior, Supabase schema, seed data, and evidence scoring remain unchanged."
    ]
  },
  {
    version: "26.601.20",
    date: "2026-06-02",
    title: "Claims live mobile evidence handoff parity",
    bullets: [
      "The claims archive mobile selected source box is compressed so readers reach the evidence chain within the live source-to-evidence handoff target.",
      "The `#selected-source-evidence` anchor now lands the selected panel at the top of narrow mobile viewports while preserving the compact original-source summary, four-entry browse strip, `More entries` cue, fade, and clipped third card.",
      "Contributor prompt, public contributor document, API contracts, token behavior, Supabase schema, seed data, and evidence scoring remain unchanged."
    ]
  },
  {
    version: "26.601.19",
    date: "2026-06-02",
    title: "Claims mobile evidence handoff",
    bullets: [
      "The claims archive mobile selected source panel now hands readers directly from the original source into the evidence chain with tighter reader-facing spacing.",
      "The compact original-source summary, four-entry mobile browse strip, `More entries` cue, right-edge fade, clipped third card, and direct `#selected-source-evidence` anchor path remain intact.",
      "Desktop keeps the existing archive reader layout, and contributor prompt, public contributor document, API contracts, token behavior, Supabase schema, seed data, and evidence scoring remain unchanged."
    ]
  },
  {
    version: "26.601.18",
    date: "2026-06-02",
    title: "Claims mobile browse affordance",
    bullets: [
      "The claims archive mobile browse strip now shows a compact more-entries cue and right-edge fade so readers can see that additional public archive entries continue sideways.",
      "The early browse path still renders four public archive entries before the selected source/evidence panel while preserving the compact original-source summary.",
      "Desktop keeps the existing archive layout, and contributor prompt, public contributor document, API contracts, token behavior, Supabase schema, seed data, and evidence scoring remain unchanged."
    ]
  },
  {
    version: "26.601.17",
    date: "2026-06-02",
    title: "Claims mobile evidence chain proximity",
    bullets: [
      "The claims archive mobile reader now keeps a four-entry public archive browse path close to the compact original-source summary without moving the selected source/evidence anchor.",
      "The selected source/evidence panel and evidence chain arrive sooner on mobile while the desktop archive keeps its existing reader layout.",
      "Claims archive and claim detail evidence chains now explain that older public archive entries may lack public model/tool metadata while newer AI submissions require disclosure."
    ]
  },
  {
    version: "26.601.16",
    date: "2026-06-02",
    title: "Claims mobile evidence proximity",
    bullets: [
      "The claims archive mobile reader now keeps the compact original-source summary first, then exposes a short public archive browse strip before the selected source/evidence panel.",
      "Reader-mobile priority copy is tightened so the selected source/evidence panel and evidence chain arrive materially closer to the opening source summary while desktop keeps the existing archive layout.",
      "Contributor prompt, public contributor document, API contracts, token behavior, Supabase schema, migrations, functions, seed data, evidence scoring, and source-backed reader language remain unchanged."
    ]
  },
  {
    version: "26.601.15",
    date: "2026-06-01",
    title: "Live claim reader token language guard",
    bullets: [
      "The public claims archive now excludes live Supabase claim rows when reader-visible claim text contains contributor-token protocol terms or UUID-shaped token strings.",
      "Live Supabase evidence rows with unsafe reader-visible evidence text are filtered before rendering while safe public live claims and safe evidence remain available.",
      "For AI Agents, the contributor prompt, public contributor document, API contracts, token behavior, Supabase schema, migrations, functions, RLS policies, seed data, and evidence scoring remain unchanged."
    ]
  },
  {
    version: "26.601.14",
    date: "2026-06-01",
    title: "Reader publication labels",
    bullets: [
      "The claims archive now describes the opening reader surface as a public archive entry with reader-facing publication language.",
      "Claims archive counts and live-load fallback copy now refer to public archive entries.",
      "The For AI Agents completed evidence example now uses archived-public-entry language while preserving contributor prompt, API contracts, token behavior, backend, claim data, evidence data, record order, and evidence scoring."
    ]
  },
  {
    version: "26.601.13",
    date: "2026-06-01",
    title: "Claims mobile source summary",
    bullets: [
      "The claims archive opening record now includes a compact original-source summary with publisher, source host, and support / challenge / context mix in the first mobile viewport.",
      "The summary points readers to the existing selected source and evidence panel while preserving the `#selected-source-evidence` anchor path and mobile evidence-before-rail order.",
      "Claim data, evidence data, public API contracts, contributor prompt, token behavior, backend, source provenance language, and reader token privacy remain unchanged."
    ]
  },
  {
    version: "26.601.12",
    date: "2026-06-01",
    title: "Reader-native evidence provenance labels",
    bullets: [
      "Claims archive and claim detail evidence provenance now describe static seed evidence as public archive entries instead of internal record state.",
      "Missing model and tool metadata on public archive entries now uses plain reader language while preserving AI disclosure honesty.",
      "Source URLs, contributor/public-entry context, AI disclosure, evidence standards, methodology and corrections, sourced-evidence contribution, and feedback paths remain visible without exposing raw contributor tokens."
    ]
  },
  {
    version: "26.601.11",
    date: "2026-06-01",
    title: "Claims mobile evidence-first archive",
    bullets: [
      "Mobile claims archive readers now reach the selected source and evidence panel before the long public record rail in the default scroll order.",
      "The full public record rail remains available below the evidence surface on mobile and keeps the existing desktop reader flow.",
      "The selected evidence panel still includes source inspection, evidence provenance, Evidence standards, methodology and corrections context, sourced-evidence contribution, and feedback paths without exposing raw contributor tokens."
    ]
  },
  {
    version: "26.601.10",
    date: "2026-06-01",
    title: "Evidence methodology and corrections path",
    bullets: [
      "Public claims evidence surfaces now pair Evidence standards with compact methodology and corrections context beside the evidence chain.",
      "The copy keeps support, challenge, and context evidence separate; explains quality review by source relevance, source type, and source-summary fit; and confirms Claimer stores evidence, not editorial conclusions.",
      "Reader corrections use the existing sourced-evidence and feedback paths for missing, stale, or incorrect coverage, meaning readers add or challenge sourced evidence rather than rewriting claims into editorial conclusions."
    ]
  },
  {
    version: "26.601.9",
    date: "2026-06-01",
    title: "Evidence standards reader context",
    bullets: [
      "Reader evidence chains now include compact source standards context explaining that Claimer stores source-backed evidence, not editorial conclusions.",
      "The standards block prefers primary, official, direct, court, academic, or original sources when available and keeps support, challenge, and context entries separate.",
      "Static record model/tool fallback labels are explained as public metadata availability, with existing contribution paths preserved and no contributor prompt, API contract, token behavior, backend, seed data, investor, DEC, or agent artifact changes."
    ]
  },
  {
    version: "26.601.8",
    date: "2026-06-01",
    title: "Evidence provenance reader labels",
    bullets: [
      "Reader-facing evidence items now show a compact provenance line with contributor label, AI disclosure status, model, tool, and live/static record status using existing public fields.",
      "Static library evidence uses truthful model and tool fallbacks when no values are public, while live contributor evidence maps existing disclosure fields without exposing raw contributor tokens or UUIDs.",
      "Contributor prompt, contributor/API contracts, token behavior, Supabase functions, schema, migrations, grants, seed claim data, and evidence records remain unchanged."
    ]
  },
  {
    version: "26.601.7",
    date: "2026-06-01",
    title: "Claims mobile selected detail path",
    bullets: [
      "The claims archive selected public record now links directly to the selected source and evidence panel, giving mobile readers a first-screen path past the full record rail.",
      "The priority card, selected public record affordance, active row, and source/evidence panel continue to describe the OpenAI GPT-4o record without changing claim data, evidence data, or record order.",
      "Contributor prompt, contributor/API contracts, token behavior, Supabase functions, schema, migrations, grants, seed claim data, and evidence records remain unchanged."
    ]
  },
  {
    version: "26.601.6",
    date: "2026-06-01",
    title: "Claims selected record label",
    bullets: [
      "The claims archive now labels the pinned OpenAI GPT-4o affordance as the selected public record before the record rail, matching the priority reader card, active row, and detail panel after live records hydrate.",
      "The selected public record copy names the original source and source/evidence panel relationship without changing record order, claim data, evidence data, or reader routes.",
      "Contributor prompt, contributor/API contracts, token behavior, Supabase functions, schema, migrations, grants, seed claim data, and evidence records remain unchanged."
    ]
  },
  {
    version: "26.601.5",
    date: "2026-06-01",
    title: "Claims pinned current record",
    bullets: [
      "The claims archive now duplicates the active OpenAI GPT-4o record as a pinned public-record row before the scrollable record rail begins, keeping the priority reader card, pinned row, and detail panel connected after live records hydrate.",
      "The full hydrated record rail remains below the pinned row with the selected record still first in the list order and live contributor records counted with public library records.",
      "Contributor prompt, contributor/API contracts, token behavior, Supabase functions, schema, migrations, grants, seed claim data, and evidence records remain unchanged."
    ]
  },
  {
    version: "26.601.4",
    date: "2026-06-01",
    title: "Claims selected row visibility",
    bullets: [
      "The claims archive now keeps the active selected record at the top of the reader rail after live contributor records hydrate, so the reader card, active row, and detail panel describe the same OpenAI GPT-4o record.",
      "The full hydrated public record list remains available below the selected row with live contributor records and public library records counted together.",
      "Contributor prompt, contributor/API contracts, token behavior, Supabase functions, schema, migrations, grants, and seed claim data remain unchanged."
    ]
  },
  {
    version: "26.601.3",
    date: "2026-06-01",
    title: "Claims initial state coherence",
    bullets: [
      "The claims archive opening reader card now follows the selected claim, so the top record, active row, detail panel, and visible detail link describe the same claim on first load.",
      "Live Supabase contributor records can still load into the archive without taking over the reader card until a reader selects one.",
      "Contributor prompt, contributor/API contracts, token behavior, Supabase functions, schema, migrations, grants, and seed claim data remain unchanged."
    ]
  },
  {
    version: "26.601.2",
    date: "2026-06-01",
    title: "For Agents reader surface",
    bullets: [
      "The For AI Agents route now uses the same calm light reader surface as the homepage, claims archive, and claim detail pages.",
      "The completed evidence example remains first while source URL, stance, model, tool, and contributor disclosure are easier to scan without dark console styling.",
      "Contributor token setup, the registration endpoint, starter prompt, live coverage gaps, evidence quality guidance, safe evidence loop, minimum payload checklist, contributor prompt links, API contracts, token behavior, Supabase functions, schema, migrations, grants, and seed claim data remain unchanged."
    ]
  },
  {
    version: "26.601.1",
    date: "2026-06-01",
    title: "Claims count clarity and neutral gaps",
    bullets: [
      "The public claims archive now uses one reader-facing record count with live contributor records and public library records labeled together.",
      "Reader mode no longer shows a separate Supabase load count beside the visible record count.",
      "Claim detail evidence gaps now use neutral source coverage language while preserving original source, source URL, evidence chain, support / challenge / context mix, live loading, and contributor routes."
    ]
  },
  {
    version: "26.531.9",
    date: "2026-05-31",
    title: "Claims archive public evidence library",
    bullets: [
      "The public claims archive now opens as a public evidence library with calmer reader copy around source-backed claim records.",
      "Reader-mode rows and selected-claim inspection keep original source, publisher, source URL, evidence chain, and support / challenge / context mix while replacing workflow labels with library language.",
      "Evidence gaps are framed as missing source coverage rather than truth judgments, with submit/review routes, contributor prompt, public API contracts, token behavior, Supabase functions, schema, migrations, grants, and seed claim data unchanged."
    ]
  },
  {
    version: "26.531.8",
    date: "2026-05-31",
    title: "Mobile horizontal overflow fix",
    bullets: [
      "Mobile reader and agent pages now constrain long claims, source URLs, evidence rows, chips, buttons, cards, grids, tables, and code blocks inside narrow viewports.",
      "The homepage, claims archive, representative claim detail, and For AI Agents route preserve source trails, evidence counts, stance mix, selected-claim inspection, and neutral evidence framing while wrapping content at 390px.",
      "Contributor prompt, API contracts, token behavior, Supabase functions, database schema, migrations, grants, seed claim data, DEC files, investor documents, and Chameleon artifacts remain unchanged."
    ]
  },
  {
    version: "26.531.7",
    date: "2026-05-31",
    title: "Claims archive reader simplification",
    bullets: [
      "The public claims archive now presents reader-mode rows as evidence records with claim title, original source publisher, and support / challenge / context mix.",
      "Reader-mode triage chips, repeated row-level evidence-gap labels, and row-level strong-source counters are removed from the archive list while selected-claim inspection remains available.",
      "Submit and review mode behavior, contributor prompt, public API contracts, token behavior, Supabase functions, database schema, migrations, grants, seed claim data, and claim detail route behavior remain unchanged."
    ]
  },
  {
    version: "26.531.6",
    date: "2026-05-31",
    title: "Homepage publication rhythm",
    bullets: [
      "The homepage now continues from the protected source trail into latest evidence records drawn from existing Claimer seed evidence.",
      "Claims needing evidence now show explicit support, challenge, and context gaps before quieter corpus and contributor metrics.",
      "The claims archive remains the primary reader route while the For AI Agents page and contributor prompt stay available as secondary contributor paths, with public API contracts, token behavior, Supabase functions, schema, migrations, grants, seed claim data, DEC files, and contributor prompt unchanged."
    ]
  },
  {
    version: "26.531.5",
    date: "2026-05-31",
    title: "For Agents evidence quality first",
    bullets: [
      "The For AI Agents page now opens with a completed evidence example from existing Claimer static data before token setup or endpoint mechanics.",
      "The example shows claim, stance, source URL, source-grounded summary, and model/tool disclosure so operators see the evidence standard before copying registration details.",
      "Contributor prompt links, the public registration endpoint, starter prompt, coverage gaps, and evidence quality guidance remain available while contributor prompt, API contracts, token behavior, Supabase functions, schema, migrations, grants, seed claim data, and DEC files remain unchanged."
    ]
  },
  {
    version: "26.531.4",
    date: "2026-05-31",
    title: "Claims archive neutral coverage",
    bullets: [
      "The claims archive selected-claim pane now keeps original source, source URL, evidence chain, support / challenge / context mix, and the evidence gap before coverage metadata.",
      "Large archive score cards have been replaced in reader mode with compact neutral coverage metadata for source trail, evidence count, stance mix, and attribution notes.",
      "Contributor prompt, public API contracts, token behavior, Supabase functions, database schema, migrations, grants, seed claim data, and claim detail route behavior remain unchanged."
    ]
  },
  {
    version: "26.531.3",
    date: "2026-05-31",
    title: "Claim detail neutral coverage",
    bullets: [
      "Claim detail pages now keep original source, source URL, evidence chain, support / challenge / context mix, and the evidence gap before sharing or coverage metadata.",
      "Large percentage panels have been replaced with compact reader inspection metadata below the evidence context.",
      "ClaimReview structured data and rating semantics were removed from the claim detail route while contributor prompt, public API contracts, token behavior, database schema, Supabase functions, and seed claim data remain unchanged."
    ]
  },
  {
    version: "26.531.2",
    date: "2026-05-31",
    title: "Mobile homepage opening",
    bullets: [
      "The mobile homepage now brings the inspected claim card and source summary ahead of the opening action buttons.",
      "The source publisher, source host, and evidence-link count are styled as deliberate mobile evidence facts immediately below the selected claim title.",
      "Contributor prompt, public API contracts, token behavior, database schema, Supabase functions, and seed claim data remain unchanged."
    ]
  },
  {
    version: "26.531.1",
    date: "2026-05-31",
    title: "Mobile homepage source density",
    bullets: [
      "The homepage inspected-claim unit now includes a compact mobile source and evidence summary before the longer source URL and evidence rows.",
      "At narrow widths, the first viewport brings the selected claim title closer to source publisher, source host, and source-link count facts while preserving the light editorial desktop surface.",
      "Contributor prompt, public API contracts, token behavior, database schema, Supabase functions, and seed claim data remain unchanged."
    ]
  },
  {
    version: "26.530.8",
    date: "2026-05-30",
    title: "Claims editorial reader surface",
    bullets: [
      "The claims archive now uses a light editorial reader surface with original source, source URL, source publisher, evidence count, stance mix, and evidence gaps ahead of assessment chrome.",
      "Claim detail pages now read as source-first evidence articles with the claim, original source, source URL, evidence chain, and support / challenge / context mix before percentage panels.",
      "Contributor prompt, public API contracts, token behavior, database schema, Supabase functions, and seed claim data remain unchanged."
    ]
  },
  {
    version: "26.530.7",
    date: "2026-05-30",
    title: "Homepage editorial evidence surface",
    bullets: [
      "The homepage first viewport now leads with an inspectable claim, original source, source URL, source publisher, evidence counts, and evidence links before coverage metrics.",
      "Homepage styling now uses a light editorial reading surface while keeping the contributor pathway visible as a secondary route.",
      "Contributor prompt, public API contracts, token behavior, database schema, Supabase functions, and seed claim data remain unchanged."
    ]
  },
  {
    version: "26.530.6",
    date: "2026-05-30",
    title: "Mobile reader cleanup",
    bullets: [
      "Public reader pages now constrain long claim text, source URLs, code blocks, pills, cards, grids, and CTA groups inside mobile viewports.",
      "The primary claims browser no longer renders outcome-style support labels or contributor/reviewer action language on the reader surface.",
      "Contributor routes, contributor prompt, public API contracts, token behavior, database schema, seed claim data, and Supabase functions remain unchanged."
    ]
  },
  {
    version: "26.530.5",
    date: "2026-05-30",
    title: "Source-first claim detail",
    bullets: [
      "Public claim detail pages now show the original source and evidence chain before coverage scores, readiness checks, or contribution prompts.",
      "Outcome-style claim detail labels have been reframed as evidence coverage and support / challenge balance.",
      "The claim detail contribution route is reduced to one secondary sourced-evidence action while contributor contracts and data remain unchanged."
    ]
  },
  {
    version: "26.530.4",
    date: "2026-05-30",
    title: "Claims reader surface",
    bullets: [
      "The public claims route now opens as a reader-first browsing surface with search, filters, source lines, evidence health, assessment readiness, and evidence chains.",
      "Claim and evidence authoring controls now stay on explicit submit and review routes instead of competing with first-pass reading.",
      "Claim data, contributor prompt, public API contracts, token behavior, database schema, migrations, grants, and Supabase functions remain unchanged."
    ]
  },
  {
    version: "26.530.3",
    date: "2026-05-30",
    title: "Homepage source task guard",
    bullets: [
      "Public contributor tasks now suppress root-homepage claim sources after substantive same-host evidence exists for that claim.",
      "Same-host evidence is used only as a suppression guard and does not create alternate assigned source URLs.",
      "Contributor prompt, public task response shape, token system, database schema, migrations, and grants remain unchanged."
    ]
  },
  {
    version: "26.530.2",
    date: "2026-05-30",
    title: "Homepage metric clarity",
    bullets: [
      "Homepage coverage labels now identify the static public claim corpus denominator.",
      "Live contributor north-star labels now identify the live contributor database denominator.",
      "The 10+ evidence target counts distinguish static corpus progress from live contributor database progress."
    ]
  },
  {
    version: "26.530.1",
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
      "Copy stays framed as source-backed evidence records rather than an official editorial conclusion."
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
      "Release notes keep the focus on source-backed evidence records."
    ]
  }
] as const;
