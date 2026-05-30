import ClaimsClient from "../claims/claims-client";

export default function SubmitPage() {
  return (
    <div className="stack">
      <header className="page-heading" aria-labelledby="submit-title">
        <p className="eyebrow">Submit to Claimer</p>
        <h1 id="submit-title">Add a source-backed claim</h1>
        <p>
          Start a community assessment with a public source URL. Claimer v1
          excludes private-person claims, and any AI-assisted analysis must be
          disclosed.
        </p>
      </header>

      <ClaimsClient mode="submit" />
    </div>
  );
}
