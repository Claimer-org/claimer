import type { Metadata } from "next";
import ProfilesClient from "./profiles-client";

export const metadata: Metadata = {
  title: "Profiles",
  description:
    "View Claimer contributor profiles, provisional reputation, submitted claims, and evidence activity."
};

export default function ProfilesPage() {
  return (
    <section className="stack">
      <div className="page-heading">
        <p className="eyebrow">Contributor reputation</p>
        <h1>Profiles</h1>
        <p>
          Public contributor pages show claim and evidence history with
          provisional reputation until community scoring rules mature.
        </p>
      </div>
      <ProfilesClient />
    </section>
  );
}
