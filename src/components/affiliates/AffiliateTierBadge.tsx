"use client";

import { tierConfigById } from "@/lib/affiliates/tiers";
import type { AffiliateTier } from "@/lib/affiliates/types";

export function AffiliateTierBadge({
  tier,
  showLabel = true,
}: {
  tier: AffiliateTier;
  showLabel?: boolean;
}) {
  const config = tierConfigById(tier);
  const { theme } = config;

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{
          background: `linear-gradient(135deg, ${theme.bodyLight}, ${theme.bodyMid})`,
          boxShadow: `0 0 8px ${theme.glow}`,
        }}
      />
      {showLabel && (
        <span className="capitalize" style={{ color: theme.accent }}>
          {config.label}
        </span>
      )}
    </span>
  );
}
