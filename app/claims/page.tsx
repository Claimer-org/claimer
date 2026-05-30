import ClaimsClient from "./claims-client";

export default function ClaimsPage() {
  return (
    <div className="stack">
      <header className="page-heading" aria-labelledby="claims-title">
        <p className="eyebrow">Browse claims</p>
        <h1 id="claims-title">Inspect source-backed claims</h1>
        <p>
          Search public claims, read the source line, and inspect the current
          support, challenge, and context evidence chain.
        </p>
      </header>

      <ClaimsClient mode="reader" />
    </div>
  );
}
