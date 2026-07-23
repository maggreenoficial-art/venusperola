"use client";

import { useId } from "react";
import type { TierTheme } from "@/lib/affiliates/tiers";

interface AffiliateVenusPlanetProps {
  theme: TierTheme;
  size?: number;
  className?: string;
}

export function AffiliateVenusPlanet({
  theme,
  size = 220,
  className = "",
}: AffiliateVenusPlanetProps) {
  const uid = useId().replace(/:/g, "");
  const bodyId = `venus-body-${uid}`;
  const atmoId = `venus-atmo-${uid}`;
  const clipId = `venus-clip-${uid}`;

  return (
    <div
      className={`affiliate-venus-planet ${className}`}
      style={
        {
          width: size,
          height: size,
          "--venus-glow": theme.glow,
          "--venus-accent": theme.accent,
          "--venus-ring": theme.ring,
        } as React.CSSProperties
      }
      aria-hidden
    >
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={bodyId} cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor={theme.bodyLight} />
            <stop offset="35%" stopColor={theme.bodyMid} />
            <stop offset="65%" stopColor={theme.bodyMid} />
            <stop offset="100%" stopColor={theme.bodyDark} />
          </radialGradient>
          <radialGradient id={atmoId} cx="50%" cy="50%" r="50%">
            <stop offset="65%" stopColor="transparent" />
            <stop offset="88%" stopColor={theme.atmosphere} />
            <stop offset="100%" stopColor={theme.atmosphere} stopOpacity="0.7" />
          </radialGradient>
          <clipPath id={clipId}>
            <circle cx="60" cy="60" r="30" />
          </clipPath>
        </defs>

        <circle
          className="affiliate-venus-orbit"
          cx="60"
          cy="60"
          r="54"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.25"
        />
        <circle
          className="affiliate-venus-orbit affiliate-venus-orbit--reverse"
          cx="60"
          cy="60"
          r="46"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.15"
        />

        <circle className="affiliate-venus-halo" cx="60" cy="60" r="40" fill="currentColor" />

        <g className="affiliate-venus-body">
          <circle cx="60" cy="60" r="30" fill={`url(#${bodyId})`} />
          <circle cx="60" cy="60" r="30" fill={`url(#${atmoId})`} />

          <g className="affiliate-venus-clouds" clipPath={`url(#${clipId})`}>
            <ellipse cx="48" cy="52" rx="14" ry="5" fill={theme.bodyLight} opacity="0.4" />
            <ellipse cx="72" cy="58" rx="11" ry="4" fill={theme.bodyMid} opacity="0.35" />
            <ellipse cx="55" cy="68" rx="16" ry="4.5" fill={theme.bodyMid} opacity="0.3" />
            <ellipse cx="68" cy="48" rx="9" ry="3" fill="#fff" opacity="0.45" />
          </g>

          <ellipse
            cx="72"
            cy="68"
            rx="10"
            ry="18"
            fill="#000"
            opacity="0.2"
            clipPath={`url(#${clipId})`}
          />
        </g>

        <circle className="affiliate-venus-spark" cx="98" cy="32" r="1.5" fill="currentColor" />
        <circle className="affiliate-venus-spark" cx="18" cy="48" r="1" fill="currentColor" style={{ animationDelay: "0.5s" }} />
        <circle className="affiliate-venus-spark" cx="92" cy="82" r="1.2" fill="currentColor" style={{ animationDelay: "1s" }} />
        <circle className="affiliate-venus-spark" cx="26" cy="88" r="0.8" fill="currentColor" style={{ animationDelay: "1.5s" }} />
      </svg>
    </div>
  );
}
