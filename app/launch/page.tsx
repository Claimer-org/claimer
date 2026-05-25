import type { Metadata } from "next";
import Link from "next/link";
import { evidenceHealth, reviewMission, seedClaims } from "../../lib/claims";

export const metadata: Metadata = {
  title: "Launch Kit",
  description:
    "Measured Claimer launch links for evidence review, claim browsing, and priority review missions."
};

const siteUrl = "https://smithmatric-boop.github.io/claimer";
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

  return `https://x.com/intent/tweet?text=${encodeURIComponent(
    channel.title
  )}&url=${encodeURIComponent(url)}`;
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

export default function LaunchPage() {
  const missionClaims = seedClaims
    .slice()
    .sort((a, b) => missionScore(b) - missionScore(a))
    .slice(0, 6);

  return (
    <section className="stack">
      <header className="page-heading" aria-labelledby="launch-title">
        <p className="eyebrow">Measured distribution</p>
        <h1 id="launch-title">Launch kit</h1>
        <p>
          Channel-ready entry points for Milestone 4. Each link carries campaign
          parameters into first-party analytics so DAU, review intent, and claim
          interest can be traced back to a launch source.
        </p>
        <div className="actions">
          <Link className="button primary" href="/review">
            Open review queue
          </Link>
          <Link className="button" href="/feedback">
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
                  Open submit page
                </a>
              </div>
            </article>
          );
        })}
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
              Page views store <code>utm_source</code>, <code>utm_medium</code>,
              <code>utm_campaign</code>, <code>utm_content</code>, <code>ref</code>,
              and <code>landing_path</code> in analytics properties.
            </p>
          </article>
          <article className="card">
            <h3>Claim context</h3>
            <p>
              Claim IDs are captured from claim and submit routes, or from a
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
