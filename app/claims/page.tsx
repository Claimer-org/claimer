import ClaimsClient from "./claims-client";

export default function ClaimsPage() {
  return (
    <div className="stack reader-editorial claims-archive-page">
      <header className="page-heading" aria-labelledby="claims-title">
        <p className="eyebrow">Claims archive</p>
        <h1 id="claims-title">Inspect source-backed claims as evidence records</h1>
        <p>
          Search public claims, read the original source and URL, then inspect
          the current support, challenge, and context evidence chain.
        </p>
      </header>

      <ClaimsClient mode="reader" />
    </div>
  );
}
