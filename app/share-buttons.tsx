"use client";

import { useEffect, useState } from "react";

interface ShareButtonsProps {
  title: string;
  text: string;
  claimId: string;
}

export default function ShareButtons({ title, text, claimId }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const shareText = `${title}\n\n${text}\n\nCheck the evidence on Claimer:`;

  const trackedUrl = (source: string) => {
    if (!url) {
      return "";
    }

    try {
      const nextUrl = new URL(url);
      nextUrl.searchParams.set("utm_source", source);
      nextUrl.searchParams.set("utm_medium", "social_share");
      nextUrl.searchParams.set("utm_campaign", "claim_share");
      nextUrl.searchParams.set("utm_content", claimId);
      nextUrl.searchParams.set("claim_id", claimId);
      nextUrl.searchParams.set("ref", "claim_share");
      return nextUrl.toString();
    } catch {
      return url;
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trackedUrl("copy"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback: do nothing */
    }
  };

  const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(trackedUrl("x"))}`;
  const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(trackedUrl("reddit"))}&title=${encodeURIComponent(title)}`;
  const hnUrl = `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(trackedUrl("hackernews"))}&t=${encodeURIComponent(title)}`;

  return (
    <div className="share-buttons" aria-label="Share this claim">
      <span className="share-label">Share</span>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="share-btn share-x"
        aria-label="Share on X (Twitter)"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span>X</span>
      </a>
      <a
        href={redditUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="share-btn share-reddit"
        aria-label="Share on Reddit"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.066 13.28c.075.36.112.726.112 1.095 0 3.598-4.186 6.521-9.342 6.521S-.506 17.97-.506 14.375c0-.37.037-.736.112-1.095a1.877 1.877 0 01-.78-1.528c0-1.038.843-1.88 1.882-1.88.502 0 .959.2 1.295.524 1.28-.924 3.047-1.522 5.012-1.6l.943-4.42a.37.37 0 01.44-.295l3.13.669a1.338 1.338 0 012.498.682 1.338 1.338 0 01-1.338 1.338 1.338 1.338 0 01-1.27-.916l-2.785-.594-.837 3.917c1.94.088 3.68.69 4.945 1.604a1.873 1.873 0 011.295-.524c1.038 0 1.882.843 1.882 1.881 0 .618-.3 1.168-.78 1.508zm-9.598.818a1.338 1.338 0 100 2.676 1.338 1.338 0 000-2.676zm5.064 0a1.338 1.338 0 100 2.676 1.338 1.338 0 000-2.676zm-4.753 3.655c-.085-.085-.085-.222 0-.307.085-.085.222-.085.307 0 .75.75 2.077.81 2.914 0 .085-.085.222-.085.307 0 .085.085.085.222 0 .307-.872.87-2.656.87-3.528 0z" />
        </svg>
        <span>Reddit</span>
      </a>
      <a
        href={hnUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="share-btn share-hn"
        aria-label="Share on Hacker News"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M0 0v24h24V0H0zm13.1 13.28V19h-2.2v-5.72L6.5 5h2.48l3.02 5.72L15.02 5h2.48l-4.4 8.28z" />
        </svg>
        <span>HN</span>
      </a>
      <button
        onClick={handleCopy}
        className={`share-btn share-copy ${copied ? "copied" : ""}`}
        aria-label="Copy link"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {copied ? (
            <path d="M20 6L9 17l-5-5" />
          ) : (
            <>
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </>
          )}
        </svg>
        <span>{copied ? "Copied!" : "Copy"}</span>
      </button>
    </div>
  );
}
