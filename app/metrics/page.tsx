import type { Metadata } from "next";
import Link from "next/link";
import { seedClaims } from "../../lib/claims";
import MetricsClient from "./metrics-client";

export const metadata: Metadata = {
  title: "Growth Metrics",
  description:
    "Aggregate Claimer traction metrics for daily active users, launch attribution, feedback, and submissions.",
  robots: {
    index: false,
    follow: false
  }
};

export default function MetricsPage() {
  return (
    <section className="stack">
      <header className="page-heading" aria-labelledby="metrics-title">
        <p className="eyebrow">Operator metrics</p>
        <h1 id="metrics-title">Growth snapshot</h1>
        <p>
          Aggregate traction signals for Milestone 4. This page reads the safe
          summary RPC only; raw analytics events and feedback text stay private.
        </p>
        <div className="actions">
          <Link className="button primary" href="/launch">
            Open launch kit
          </Link>
          <Link className="button" href="/review">
            Open review queue
          </Link>
        </div>
      </header>

      <MetricsClient seedClaimCount={seedClaims.length} />
    </section>
  );
}
