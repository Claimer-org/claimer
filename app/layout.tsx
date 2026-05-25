import type { Metadata } from "next";
import Link from "next/link";
import AnalyticsTracker from "./analytics";
import AuthWidget from "./auth-widget";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claimer",
  description:
    "A community assessment platform for source-backed claims and explainable evidence."
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
            <Link href="/submit">Submit</Link>
            <AuthWidget />
            <Link href="/terms">Terms</Link>
            <Link href="/disclaimer">Disclaimer</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <span>Community assessment, source links, and explainable scores.</span>
          <span>Automated analysis is labeled wherever it appears.</span>
        </footer>
      </body>
    </html>
  );
}
