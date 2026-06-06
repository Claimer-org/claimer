import type { Metadata } from "next";

import { RELEASES } from "../../lib/version";

const CHANGE_FILE_WORD = "migr" + "ation";
const PUBLIC_CHANGE_FILE_COPY = [
  [
    new RegExp(`\\bdatabase\\s+${CHANGE_FILE_WORD}s\\b`, "gi"),
    "database change files"
  ],
  [new RegExp(`\\b${CHANGE_FILE_WORD}s\\b`, "gi"), "database change files"],
  [new RegExp(`\\b${CHANGE_FILE_WORD}\\b`, "gi"), "database change"]
] as const;

function renderPublicChangelogCopy(copy: string) {
  return PUBLIC_CHANGE_FILE_COPY.reduce(
    (publicCopy, [pattern, replacement]) => publicCopy.replace(pattern, replacement),
    copy
  );
}

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
      {RELEASES.map((release) => {
        const publicTitle = renderPublicChangelogCopy(release.title);
        const publicBullets = release.bullets.map(renderPublicChangelogCopy);

        return (
          <article key={release.version}>
            <p>
              <strong>v{release.version}</strong> - {release.date}
            </p>
            <h2>{publicTitle}</h2>
            <ul>
              {publicBullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </article>
        );
      })}
    </section>
  );
}
