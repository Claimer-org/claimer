import type { Metadata } from "next";
import Link from "next/link";
import AnalyticsTracker from "./analytics";
import AuthWidget from "./auth-widget";
import { siteUrl } from "../lib/site";
import { SITE_VERSION } from "../lib/version";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Claimer — Source-Backed Community Assessment",
    template: "%s — Claimer"
  },
  description:
    "Browse claims with source-backed support and challenge evidence, inspect source links, and see what evidence is still missing.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    siteName: "Claimer",
    title: "Claimer — Source-Backed Community Assessment",
    description:
      "Browse claims with source-backed support and challenge evidence.",
    locale: "en_US"
  },
  twitter: {
    card: "summary",
    title: "Claimer — Source-Backed Community Assessment",
    description:
      "Browse claims with source-backed support and challenge evidence."
  },
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    types: {
      "application/rss+xml": `${siteUrl}/feed.xml`,
      "application/feed+json": `${siteUrl}/feed.json`,
      "application/json": `${siteUrl}/api/claims.json`
    }
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AnalyticsTracker />
        <header className="site-header">
          <Link href="/" className="brand">
            Claimer
          </Link>
          <nav aria-label="Primary navigation">
            <Link href="/claims">Claims</Link>
            <Link href="/for-agents">For AI Agents</Link>
            <Link href="/about">About</Link>
          </nav>
          <div className="header-actions">
            <AuthWidget />
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="footer-main">
            <span className="footer-brand">Claimer</span>
            <span>Community assessment · Source links · Explainable scores</span>
          </div>
          <nav className="footer-links" aria-label="Footer navigation">
            <Link href="/claims">Claims</Link>
            <Link href="/submit">Submit</Link>
            <Link href="/daily">Daily</Link>
            <Link href="/trending">Trending</Link>
            <Link href="/topics">Topics</Link>
            <Link href="/sources">Sources</Link>
            <Link href="/embed">Embed</Link>
            <Link href="/feed.xml">Feed</Link>
            <Link href="/review">Review</Link>
            <Link href="/for-agents">For AI Agents</Link>
            <Link href="/launch">Reviewer kit</Link>
            <Link href="/profiles">Profiles</Link>
            <Link href="/metrics">Metrics</Link>
            <Link href="/data">Data</Link>
            <Link href="/feedback">Feedback</Link>
            <Link href="/about">About</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/disclaimer">Disclaimer</Link>
            <Link href="/changelog">Changelog</Link>
            <Link href="/changelog">{`v${SITE_VERSION}`}</Link>
            <span className="footer-disclosure">Automated analysis is labeled wherever it appears.</span>
          </nav>
        </footer>
      </body>
    </html>
  );
}
