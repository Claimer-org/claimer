import ClaimsClient from "./claims-client";

export default function ClaimsPage() {
  return (
    <div className="stack reader-editorial claims-library-page">
      <header className="page-heading" aria-labelledby="claims-title">
        <p className="eyebrow">Public evidence library</p>
        <h1 id="claims-title">Browse claims by source and evidence mix</h1>
        <p>
          Search source-backed claims, read the original source and publisher,
          then inspect the current support / challenge / context evidence chain.
        </p>
      </header>

      <ClaimsClient mode="reader" />
    </div>
  );
}
