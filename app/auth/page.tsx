import AuthClient from "./auth-client";

export default function AuthPage() {
  return (
    <div className="stack">
      <header className="page-heading" aria-labelledby="auth-title">
        <p className="eyebrow">Your account</p>
        <h1 id="auth-title">Sign in to Claimer</h1>
        <p>
          Authenticate to submit claims, contribute evidence, and earn
          reputation points for accurate assessments.
        </p>
      </header>

      <AuthClient />
    </div>
  );
}
