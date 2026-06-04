import type { Metadata } from "next";

import { RELEASES } from "../../lib/version";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Recent Claimer product releases and source-backed evidence record updates."
};

export default function ChangelogPage() {
  return (
    <section className="legal">
      <p className="eyebrow">Product updates</p>
      <h1>Changelog</h1>
      {RELEASES.map((release) => (
        <article key={release.version}>
          <p>
            <strong>v{release.version}</strong> - {release.date}
          </p>
          <h2>{release.title}</h2>
          <ul>
            {release.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
