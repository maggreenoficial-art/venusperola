import type { AffiliateTier } from "./types";
import {
  AFFILIATE_TIERS_ASC,
  tierConfigById,
  type TierConfig,
} from "./tiers";

export function nextTierConfig(current: AffiliateTier): TierConfig | null {
  const idx = AFFILIATE_TIERS_ASC.findIndex((t) => t.tier === current);
  if (idx < 0 || idx >= AFFILIATE_TIERS_ASC.length - 1) return null;
  return AFFILIATE_TIERS_ASC[idx + 1];
}

export function tierProgress(
  currentTier: AffiliateTier,
  monthlySales: number
): {
  current: TierConfig;
  next: TierConfig | null;
  salesToNext: number;
  progressPercent: number;
} {
  const current = tierConfigById(currentTier);
  const next = nextTierConfig(currentTier);

  if (!next) {
    return {
      current,
      next: null,
      salesToNext: 0,
      progressPercent: 100,
    };
  }

  const range = next.minSales - current.minSales;
  const earned = Math.max(0, monthlySales - current.minSales);
  const salesToNext = Math.max(0, next.minSales - monthlySales);
  const progressPercent =
    range > 0 ? Math.min(100, Math.round((earned / range) * 100)) : 0;

  return { current, next, salesToNext, progressPercent };
}
