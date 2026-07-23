"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AFFILIATE_TIERS_ASC,
  tierConfigById,
  type TierConfig,
} from "@/lib/affiliates/tiers";
import { tierProgress } from "@/lib/affiliates/tier-progress";
import type { AffiliateTier } from "@/lib/affiliates/types";
import { AffiliateVenusPlanet } from "./AffiliateVenusPlanet";

const AUTO_CYCLE_MS = 4500;

export type AffiliateTiersPanelVariant = "landing" | "dashboard";

export interface AffiliateTiersPanelProps {
  variant?: AffiliateTiersPanelVariant;
  currentTier?: AffiliateTier;
  monthlySales?: number;
  className?: string;
}

export function AffiliateTiersPanel({
  variant = "landing",
  currentTier = "iniciante",
  monthlySales = 0,
  className = "",
}: AffiliateTiersPanelProps) {
  const isLanding = variant === "landing";
  const isDashboard = variant === "dashboard";

  const [activeTier, setActiveTier] = useState<AffiliateTier>(currentTier);
  const [hoveredTier, setHoveredTier] = useState<AffiliateTier | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setActiveTier(currentTier);
  }, [currentTier]);

  const displayedTier = hoveredTier ?? activeTier;
  const theme = tierConfigById(displayedTier).theme;
  const activeConfig = tierConfigById(displayedTier);
  const progress = isDashboard ? tierProgress(currentTier, monthlySales) : null;

  const cycleNext = useCallback(() => {
    setActiveTier((prev) => {
      const idx = AFFILIATE_TIERS_ASC.findIndex((t) => t.tier === prev);
      const next = (idx + 1) % AFFILIATE_TIERS_ASC.length;
      return AFFILIATE_TIERS_ASC[next].tier;
    });
  }, []);

  useEffect(() => {
    if (!isLanding || paused || hoveredTier) return;
    const id = window.setInterval(cycleNext, AUTO_CYCLE_MS);
    return () => window.clearInterval(id);
  }, [isLanding, paused, hoveredTier, cycleNext]);

  const venusSize = isLanding ? 240 : 200;

  const titles = {
    landing: {
      kicker: "Evolua seu planeta",
      title: "Tiers de Comissão",
      subtitle:
        "Quanto mais você vende no mês, mais brilhante fica seu Vênus — e maior sua comissão. Passe o mouse nos tiers para ver a transformação.",
    },
    dashboard: {
      kicker: "Seu planeta",
      title: `Tier ${tierConfigById(currentTier).label}`,
      subtitle: progress?.next
        ? `Faltam ${progress.salesToNext} vendas este mês para alcançar ${progress.next.label} (${progress.next.percent}%)`
        : "Você está no tier máximo. Parabéns!",
    },
  }[variant];

  return (
    <section
      className={`affiliate-tiers-showcase relative overflow-hidden rounded-2xl border border-white/10 ${className}`}
      onMouseEnter={() => isLanding && setPaused(true)}
      onMouseLeave={() => {
        if (isLanding) {
          setPaused(false);
          setHoveredTier(null);
        }
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${theme.glow}, transparent 70%)`,
        }}
      />

      <div
        className={`relative ${isLanding ? "px-6 py-12 md:px-10 md:py-16" : "px-5 py-8 md:px-8 md:py-10"}`}
      >
        <div className={isLanding ? "text-center" : "text-left md:text-center"}>
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted">
            {titles.kicker}
          </p>
          <h2
            className={`mt-2 font-serif italic ${
              isLanding ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"
            }`}
          >
            {titles.title}
          </h2>
          <p
            className={`mt-2 text-sm text-muted ${
              isLanding ? "mx-auto max-w-lg" : "mx-auto max-w-xl"
            }`}
          >
            {titles.subtitle}
          </p>
        </div>

        {isDashboard && progress?.next && (
          <div className="mx-auto mt-6 max-w-md">
            <div className="mb-2 flex justify-between text-[10px] uppercase tracking-widest text-muted">
              <span>{progress.current.label}</span>
              <span>{progress.next.label}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progress.progressPercent}%`,
                  background: `linear-gradient(90deg, ${progress.current.theme.accent}, ${progress.next.theme.accent})`,
                  boxShadow: `0 0 12px ${progress.current.theme.glow}`,
                }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-muted">
              {monthlySales} vendas aprovadas este mês
            </p>
          </div>
        )}

        <div
          className={`mt-8 flex flex-col items-center gap-8 ${
            isLanding ? "lg:flex-row lg:items-center lg:justify-between lg:gap-6" : "lg:flex-row lg:justify-center lg:gap-10"
          }`}
        >
          <div className="flex shrink-0 flex-col items-center">
            <AffiliateVenusPlanet theme={theme} size={venusSize} />
            <div className="mt-5 text-center transition-all duration-500">
              <p
                className="font-serif text-2xl italic transition-colors duration-500"
                style={{ color: theme.accent }}
              >
                {activeConfig.label}
              </p>
              <p className="mt-1 text-3xl font-light tabular-nums">
                {activeConfig.percent}
                <span className="text-base text-muted">%</span>
              </p>
              <p className="mt-1 text-xs text-muted">{activeConfig.tagline}</p>
            </div>
          </div>

          <div className={`w-full ${isLanding ? "max-w-xl" : "max-w-lg"}`}>
            <div className="space-y-2.5">
              {AFFILIATE_TIERS_ASC.map((tier, index) => (
                <TierRow
                  key={tier.tier}
                  tier={tier}
                  index={index}
                  isActive={displayedTier === tier.tier}
                  isCurrent={currentTier === tier.tier}
                  isLocked={isDashboard && activeTier === tier.tier && !hoveredTier}
                  compact={!isLanding}
                  onHover={() => setHoveredTier(tier.tier)}
                  onLeave={() => setHoveredTier(null)}
                  onSelect={() => {
                    setActiveTier(tier.tier);
                    setHoveredTier(null);
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] tracking-widest text-muted uppercase">
          Tiers recalculados automaticamente no dia 1º de cada mês
        </p>
      </div>
    </section>
  );
}

function TierRow({
  tier,
  index,
  isActive,
  isCurrent,
  isLocked,
  compact,
  onHover,
  onLeave,
  onSelect,
}: {
  tier: TierConfig;
  index: number;
  isActive: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  compact: boolean;
  onHover: () => void;
  onLeave: () => void;
  onSelect: () => void;
}) {
  const { theme } = tier;

  return (
    <button
      type="button"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onSelect}
      className={`affiliate-tier-row group relative flex w-full items-center gap-3 rounded-xl border text-left transition-all duration-500 ${
        compact ? "px-3 py-2.5" : "gap-4 px-4 py-3"
      } ${
        isActive
          ? "border-white/25 bg-white/6 shadow-lg"
          : "border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4"
      }`}
      style={
        isActive
          ? {
              boxShadow: `0 0 32px ${theme.glow}, inset 0 0 0 1px ${theme.ring}`,
            }
          : undefined
      }
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-full text-xs font-medium transition-all duration-500 ${
          compact ? "h-7 w-7" : "h-9 w-9"
        }`}
        style={
          isActive || isCurrent
            ? {
                background: `linear-gradient(135deg, ${theme.bodyLight}, ${theme.bodyMid})`,
                color: theme.bodyDark,
                boxShadow: `0 0 16px ${theme.glow}`,
              }
            : { background: "rgba(255,255,255,0.06)", color: "var(--muted)" }
        }
      >
        {index + 1}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={`font-serif italic transition-colors duration-500 ${
              compact ? "text-base" : "text-lg"
            }`}
            style={{ color: isActive ? theme.accent : undefined }}
          >
            {tier.label}
            {isCurrent && (
              <span className="ml-2 text-[9px] not-italic uppercase tracking-widest text-muted">
                atual
              </span>
            )}
          </span>
          <span
            className={`font-light tabular-nums transition-colors duration-500 ${
              compact ? "text-lg" : "text-xl"
            }`}
            style={{ color: isActive ? theme.accent : undefined }}
          >
            {tier.percent}%
          </span>
        </div>
        {!compact && (
          <p className="text-xs text-muted">
            {tier.minSales === 0
              ? "Ponto de partida"
              : `${tier.minSales}+ vendas no mês anterior`}
          </p>
        )}
      </div>

      <span
        className={`h-2 w-2 shrink-0 rounded-full transition-all duration-500 ${
          isLocked || isCurrent ? "scale-125 opacity-100" : "opacity-0 group-hover:opacity-60"
        }`}
        style={{
          background: theme.accent,
          boxShadow:
            isLocked || isCurrent ? `0 0 8px ${theme.glow}` : undefined,
        }}
      />

      {isActive && (
        <span
          className="affiliate-tier-shimmer pointer-events-none absolute inset-0 rounded-xl opacity-30"
          style={{
            background: `linear-gradient(105deg, transparent 40%, ${theme.bodyLight}40 50%, transparent 60%)`,
          }}
        />
      )}
    </button>
  );
}
