import type { Metadata } from "next";
import Link from "next/link";
import { evidenceHealth, reviewMission, seedClaims } from "../../lib/claims";
import { siteUrl } from "../../lib/site";
import LaunchShareDrafts, { type LaunchShareDraft } from "./launch-share-drafts";

export const metadata: Metadata = {
  title: "Reviewer Launch Kit",
  description:
    "Measured Claimer reviewer launch links for evidence review, claim browsing, feedback, and priority review missions."
};

const campaignName = "milestone4-launch";

const channels = [
  {
    label: "Hacker News",
    source: "hackernews",
    medium: "community",
    path: "/review/",
    title: "Claimer: a source-backed evidence queue for AI and tech claims"
  },
  {
    label: "Reddit",
    source: "reddit",
    medium: "community",
    path: "/claims/",
    title: "A community claim review board for AI and technology claims"
  },
  {
    label: "X",
    source: "x",
    medium: "social",
    path: "/review/",
    title: "Claimer needs source-backed evidence on disputed AI and tech claims"
  },
  {
    label: "Nostr",
    source: "nostr",
    medium: "social",
    path: "/review/",
    title: "Claimer: source-backed AI and tech claim review queue"
  }
];

const nostrFallbackPost = {
  eventId: "1320678c6a5bf61b18c35329ae66117931eaac749f4a6be25119116234a094b9",
  viewerUrl:
    "https://njump.me/1320678c6a5bf61b18c35329ae66117931eaac749f4a6be25119116234a094b9",
  measuredReviewUrl: campaignUrl("/review/", "nostr", "social", "fallback_note")
};

const nostrAskPost = {
  eventId: "ed74e5b3b76d355005e48ecb9424ae22abc2d8febc6618d39836165432fdae9d",
  viewerUrl:
    "https://njump.me/ed74e5b3b76d355005e48ecb9424ae22abc2d8febc6618d39836165432fdae9d",
  measuredReviewUrl: campaignUrl(
    "/review/",
    "nostr",
    "social",
    "asknostr_workflow_review"
  )
};

const repeatReviewerLinks = [
  {
    label: "Daily",
    title: "Return to the daily review pack",
    body:
      "A focused three-claim queue for reviewers who want one fresh source-backed task instead of browsing the full claim list.",
    href: internalCampaignPath(
      "/daily/",
      "launch_kit",
      "internal",
      "repeat_daily"
    ),
    action: "Open daily pack"
  },
  {
    label: "Trending",
    title: "Scan current evidence gaps",
    body:
      "Use the ranked claim surface to find disputed or newly active AI and technology claims where evidence suggests more source review is useful.",
    href: internalCampaignPath(
      "/trending/",
      "launch_kit",
      "internal",
      "repeat_trending"
    ),
    action: "Open trending"
  },
  {
    label: "Changelog",
    title: "Check what changed",
    body:
      "Review recent workflow fixes, freshness labels, and conversion changes before sending another reviewer through the product.",
    href: internalCampaignPath(
      "/changelog/",
      "launch_kit",
      "internal",
      "repeat_changelog"
    ),
    action: "Open changelog"
  }
];

function campaignParams(source: string, medium: string, content: string) {
  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaignName,
    utm_content: content,
    ref: "launch_kit"
  });

  return params.toString();
}

function internalCampaignPath(
  path: string,
  source: string,
  medium: string,
  content: string,
  claimId?: string
) {
  const params = new URLSearchParams(campaignParams(source, medium, content));
  if (claimId) {
    params.set("claim_id", claimId);
  }

  return `${path}?${params.toString()}`;
}

function campaignUrl(
  path: string,
  source: string,
  medium: string,
  content: string,
  claimId?: string
) {
  return `${siteUrl}${internalCampaignPath(path, source, medium, content, claimId)}`;
}

function socialSubmitUrl(channel: (typeof channels)[number]) {
  const url = campaignUrl(channel.path, channel.source, channel.medium, "channel_entry");

  if (channel.source === "hackernews") {
    return `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(
      url
    )}&t=${encodeURIComponent(channel.title)}`;
  }

  if (channel.source === "reddit") {
    return `https://reddit.com/submit?url=${encodeURIComponent(
      url
    )}&title=${encodeURIComponent(channel.title)}`;
  }

  if (channel.source === "nostr") {
    return nostrFallbackPost.viewerUrl;
  }

  return `https://x.com/intent/tweet?text=${encodeURIComponent(
    channel.title
  )}&url=${encodeURIComponent(url)}`;
}

function socialActionLabel(channel: (typeof channels)[number]) {
  return channel.source === "nostr" ? "Open live post" : "Open submit page";
}

function missionScore(claim: (typeof seedClaims)[number]) {
  const health = evidenceHealth(claim);
  let score = 0;

  if (health.needsChallenge) {
    score += 100;
  }

  if (health.needsSupport) {
    score += 80;
  }

  if (!health.hasHighQualitySource) {
    score += 45;
  }

  return score + Math.max(0, 4 - health.total) * 8;
}

function byNewestClaim(
  a: (typeof seedClaims)[number],
  b: (typeof seedClaims)[number]
) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function uniqueClaims(claims: typeof seedClaims) {
  const seen = new Set<string>();

  return claims.filter((claim) => {
    if (seen.has(claim.id)) {
      return false;
    }

    seen.add(claim.id);
    return true;
  });
}

const launchShareDrafts: LaunchShareDraft[] = [
  {
    id: "hackernews",
    label: "Hacker News",
    title: "Show HN: Claimer - source-backed community assessment for AI claims",
    body:
      "Claimer is a small community assessment board for AI and tech claims. Every claim starts with cited URLs, separates attribution accuracy from claim veracity, and keeps scores explainable instead of presenting official truth verdicts.\n\nI am looking for reviewers who can add support or challenge evidence, inspect weak source chains, and point out where the product should be clearer.",
    url: campaignUrl("/review/", "hackernews", "community", "copy_draft_hn")
  },
  {
    id: "reddit",
    label: "Reddit or Discord",
    title: "Looking for reviewers on source-backed AI and tech claims",
    body:
      "Claimer is testing a source-backed reviewer queue for AI and technology claims. Evidence suggests some claims need stronger support or challenge links, so the useful action is reviewing cited URLs and adding better sources.\n\nScores are community assessments, not official fact-check verdicts, and automated analysis is labeled.",
    url: campaignUrl("/claims/", "reddit", "community", "copy_draft_reddit")
  },
  {
    id: "direct",
    label: "Direct share",
    title: "Can you review one AI claim on Claimer?",
    body:
      "I am looking for quick reviewer feedback on Claimer, a source-backed community assessment tool for AI and tech claims. Each claim has cited URLs, support/challenge evidence, and explainable scores.\n\nThe goal is not a definitive verdict; it is to show what the evidence suggests and where better sources are needed.",
    url: campaignUrl("/review/", "direct", "outreach", "copy_draft_direct")
  },
  {
    id: "nostr",
    label: "Nostr",
    title: "Source-backed AI and tech claim review queue",
    body:
      "Claimer has a source-backed AI/tech review queue with 100 live claims. Add support or challenge evidence, inspect what the evidence suggests, and improve the community assessment.\n\nAutomated assistance is disclosed; scores are not official fact-check verdicts.",
    url: campaignUrl("/review/", "nostr", "social", "copy_draft_nostr")
  }
];

export default function LaunchPage() {
  const newestClaims = seedClaims.slice().sort(byNewestClaim).slice(0, 5);
  const priorityClaims = seedClaims
    .slice()
    .sort((a, b) => missionScore(b) - missionScore(a))
    .slice(0, 6);
  const missionClaims = uniqueClaims([...newestClaims, ...priorityClaims]).slice(0, 6);

  return (
    <section className="stack">
      <header className="page-heading" aria-labelledby="launch-title">
        <p className="eyebrow">Reviewer distribution</p>
        <h1 id="launch-title">Reviewer launch kit</h1>
        <p>
          Channel-ready entry points for AI and technology claim reviewers.
          Each link carries campaign parameters into first-party analytics so
          DAU, review intent, feedback, and claim interest can be traced back to
          a launch source.
        </p>
        <div className="actions">
          <Link className="button primary" href="/review">
            Open reviewer queue
          </Link>
          <Link className="button" href="/metrics">
            Open metrics
          </Link>
          <Link className="button" href="/embed">
            Open embed kit
          </Link>
          <Link className="button" href="/feedback?use_case=other&ref=launch_kit">
            Open feedback
          </Link>
        </div>
      </header>

      <section className="metric-strip" aria-label="Launch kit status">
        <div>
          <strong>{channels.length}</strong>
          <span>channel links</span>
        </div>
        <div>
          <strong>{missionClaims.length}</strong>
          <span>priority missions</span>
        </div>
        <div>
          <strong>{seedClaims.length}</strong>
          <span>claims measured</span>
        </div>
      </section>

      <section className="panel" aria-labelledby="repeat-reviewer-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Repeat reviewer path</p>
            <h2 id="repeat-reviewer-title">Give reviewers a reason to come back</h2>
          </div>
          <Link href="/daily?ref=launch_repeat_reviewer">Daily pack</Link>
        </div>
        <div className="grid">
          {repeatReviewerLinks.map((link) => (
            <article className="card claim-card" key={link.label}>
              <span className="claim-domain">{link.label}</span>
              <h3>{link.title}</h3>
              <p>{link.body}</p>
              <p className="copy-line">{`${siteUrl}${link.href}`}</p>
              <Link className="button compact" href={link.href}>
                {link.action}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <LaunchShareDrafts drafts={launchShareDrafts} />

      <section className="panel" aria-labelledby="reviewer-path-title">
        <div className="section-heading">
          <h2 id="reviewer-path-title">Reviewer path for AI and tech claims</h2>
          <Link href="/review?ref=reviewer_launch_pack">Open reviewer queue</Link>
        </div>
        <div className="grid">
          <article className="card">
            <h3>Inspect source-backed claims</h3>
            <p>
              Review claims with cited URLs and community assessment context;
              evidence suggests where support and challenge material is still thin.
            </p>
            <Link className="button compact" href="/claims?ref=reviewer_launch_pack">
              Browse claims
            </Link>
          </article>
          <article className="card">
            <h3>Add support or challenge evidence</h3>
            <p>
              Contribute source-backed evidence to improve the community assessment
              without presenting Claimer as an official truth authority.
            </p>
            <div className="mission-actions">
              <Link className="button compact" href="/review?ref=reviewer_launch_pack">
                Start review
              </Link>
              <Link
                className="button compact"
                href="/feedback?use_case=add_evidence&ref=reviewer_launch_pack"
              >
                Send feedback
              </Link>
            </div>
          </article>
          <article className="card">
            <h3>Reuse the public data surface</h3>
            <p>
              Open source URLs, evidence stances, scores, and ClaimReview-compatible
              community assessment data so reviewers can audit the record without
              scraping pages.
            </p>
            <div className="mission-actions">
              <Link className="button compact" href="/data?ref=reviewer_launch_pack">
                Open data
              </Link>
              <Link className="button compact" href="/api/claimreview.json">
                JSON feed
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="launch-grid" aria-label="Measured channel links">
        {channels.map((channel) => {
          const internalPath = internalCampaignPath(
            channel.path,
            channel.source,
            channel.medium,
            "channel_entry"
          );
          const measuredUrl = campaignUrl(
            channel.path,
            channel.source,
            channel.medium,
            "channel_entry"
          );

          return (
            <article className="launch-card" key={channel.source}>
              <div className="mission-meta">
                <span className="claim-domain">{channel.label}</span>
                <span className="mission-priority">{channel.medium}</span>
              </div>
              <h2>{channel.title}</h2>
              <p className="copy-line">{measuredUrl}</p>
              <div className="mission-actions">
                <Link className="button primary compact" href={internalPath}>
                  Open measured link
                </Link>
                <a
                  className="button compact"
                  href={socialSubmitUrl(channel)}
                  rel="noreferrer"
                  target="_blank"
                >
                  {socialActionLabel(channel)}
                </a>
              </div>
            </article>
          );
        })}
      </section>

      <section className="panel" aria-labelledby="nostr-fallback-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Live Nostr posts</p>
            <h2 id="nostr-fallback-title">Nostr distribution references</h2>
          </div>
          <a href={nostrFallbackPost.viewerUrl} rel="noreferrer" target="_blank">
            Open fallback viewer
          </a>
        </div>
        <div className="grid">
          <article className="card">
            <h3>Fallback event ID</h3>
            <p className="copy-line">{nostrFallbackPost.eventId}</p>
          </article>
          <article className="card">
            <h3>AskNostr event ID</h3>
            <p className="copy-line">{nostrAskPost.eventId}</p>
            <a href={nostrAskPost.viewerUrl} rel="noreferrer" target="_blank">
              Open public ask
            </a>
          </article>
          <article className="card">
            <h3>Measured review link</h3>
            <p>
              The public AskNostr note routes reviewers to the source-backed
              review queue with Nostr campaign attribution.
            </p>
            <p className="copy-line">{nostrAskPost.measuredReviewUrl}</p>
          </article>
        </div>
      </section>

      <section className="panel" aria-labelledby="mission-links-title">
        <div className="section-heading">
          <h2 id="mission-links-title">Priority mission links</h2>
          <Link href="/review">Full queue</Link>
        </div>
        <div className="mission-board">
          {missionClaims.map((claim) => {
            const mission = reviewMission(claim);
            const health = evidenceHealth(claim);
            const path = `/submit/${claim.id}/`;
            const measuredPath = internalCampaignPath(
              path,
              "launch_kit",
              "internal",
              claim.id,
              claim.id
            );

            return (
              <article className={`mission-card ${mission.stance}`} key={claim.id}>
                <div className="mission-meta">
                  <span className="claim-domain">{claim.domain}</span>
                  <span className="mission-priority">{mission.stance}</span>
                </div>
                <h2>{mission.title}</h2>
                <p>{claim.title}</p>
                <div className="mission-stats">
                  <span>{health.support} support</span>
                  <span>{health.challenge} challenge</span>
                  <span>{health.highQualityCount} strong</span>
                </div>
                <p className="copy-line">
                  {campaignUrl(path, "launch_kit", "internal", claim.id, claim.id)}
                </p>
                <div className="mission-actions">
                  <Link className="button primary compact" href={measuredPath}>
                    Start mission
                  </Link>
                  <Link className="button compact" href={`/claims/${claim.id}`}>
                    Inspect claim
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel" aria-labelledby="tracking-title">
        <h2 id="tracking-title">Tracking contract</h2>
        <div className="grid">
          <article className="card">
            <h3>Campaign fields</h3>
            <p>
              Page views store <code>utm_source</code>,{" "}
              <code>utm_medium</code>, <code>utm_campaign</code>,{" "}
              <code>utm_content</code>, <code>ref</code>, and{" "}
              <code>landing_path</code> in analytics properties.
            </p>
          </article>
          <article className="card">
            <h3>Claim context</h3>
            <p>
              Claim IDs are captured from claim and submit routes, or from a
              {" "}
              <code>claim_id</code> query parameter.
            </p>
          </article>
          <article className="card">
            <h3>Privacy line</h3>
            <p>
              The tracker keeps source attribution and route-level activity, not
              full referrer paths, user agents, emails, or submitted content.
            </p>
          </article>
        </div>
      </section>
    </section>
  );
}
