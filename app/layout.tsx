import type { Metadata } from "next";
import Link from "next/link";
import AnalyticsTracker from "./analytics";
import AuthWidget from "./auth-widget";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Claimer — Source-Backed Community Assessment",
    template: "%s — Claimer"
  },
  description:
    "Submit public claims with source links, inspect support and challenge evidence, and separate attribution accuracy from claim veracity. Community-powered truth assessment.",
  metadataBase: new URL("https://smithmatric-boop.github.io/claimer"),
  openGraph: {
    type: "website",
    siteName: "Claimer",
    title: "Claimer — Source-Backed Community Assessment",
    description:
      "Submit claims with verifiable sources. Build reputation through accurate assessments.",
    locale: "en_US"
  },
  twitter: {
    card: "summary",
    title: "Claimer — Source-Backed Community Assessment",
    description:
      "Submit claims with verifiable sources. Build reputation through accurate assessments."
  },
  robots: {
    index: true,
    follow: true
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
            <Link href="/review">Review</Link>
            <Link href="/submit">Submit</Link>
            <Link href="/profiles">Profiles</Link>
            <Link href="/about">About</Link>
            <AuthWidget />
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="footer-main">
            <span className="footer-brand">Claimer</span>
            <span>Community assessment · Source links · Explainable scores</span>
          </div>
          <nav className="footer-links" aria-label="Footer navigation">
            <Link href="/review">Review</Link>
            <Link href="/launch">Launch</Link>
            <Link href="/metrics">Metrics</Link>
            <Link href="/feedback">Feedback</Link>
            <Link href="/about">About</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/disclaimer">Disclaimer</Link>
            <span className="footer-disclosure">Automated analysis is labeled wherever it appears.</span>
          </nav>
        </footer>
      </body>
    </html>
  );
}
