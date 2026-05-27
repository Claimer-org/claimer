"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  attributedPath,
  attributionFromSearch,
  type AttributionParams
} from "../../lib/attribution";

type AttributedReviewLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  defaults?: AttributionParams;
  fallback?: AttributionParams;
  overrides?: AttributionParams;
};

export default function AttributedReviewLink({
  href,
  children,
  className,
  defaults,
  fallback,
  overrides
}: AttributedReviewLinkProps) {
  const [attribution, setAttribution] = useState<AttributionParams>({});

  useEffect(() => {
    setAttribution(attributionFromSearch(window.location.search));
  }, []);

  return (
    <Link
      className={className}
      href={attributedPath(href, attribution, { defaults, fallback, overrides })}
    >
      {children}
    </Link>
  );
}
