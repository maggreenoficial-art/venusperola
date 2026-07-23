import type { AffiliateTier } from "./types";

export interface TierConfig {
  tier: AffiliateTier;
  label: string;
  percent: number;
  minSales: number;
  tagline: string;
  theme: TierTheme;
}

export interface TierTheme {
  glow: string;
  accent: string;
  bodyLight: string;
  bodyMid: string;
  bodyDark: string;
  atmosphere: string;
  ring: string;
}

const iniciante: TierTheme = {
  glow: "rgba(180, 140, 160, 0.45)",
  accent: "#c9a8b0",
  bodyLight: "#f0e4ea",
  bodyMid: "#d4a8b8",
  bodyDark: "#8a6070",
  atmosphere: "rgba(212, 160, 168, 0.35)",
  ring: "rgba(212, 160, 168, 0.25)",
};

const bronze: TierTheme = {
  glow: "rgba(201, 140, 80, 0.5)",
  accent: "#d4a060",
  bodyLight: "#f8ead8",
  bodyMid: "#d4a060",
  bodyDark: "#8a5a28",
  atmosphere: "rgba(212, 160, 96, 0.4)",
  ring: "rgba(212, 160, 96, 0.3)",
};

const prata: TierTheme = {
  glow: "rgba(180, 195, 220, 0.5)",
  accent: "#b8c8dc",
  bodyLight: "#eef2f8",
  bodyMid: "#a8b8cc",
  bodyDark: "#607088",
  atmosphere: "rgba(184, 200, 220, 0.4)",
  ring: "rgba(184, 200, 220, 0.3)",
};

const ouro: TierTheme = {
  glow: "rgba(232, 196, 74, 0.55)",
  accent: "#e8c44a",
  bodyLight: "#fff8e0",
  bodyMid: "#e8c44a",
  bodyDark: "#a07820",
  atmosphere: "rgba(232, 196, 74, 0.35)",
  ring: "rgba(232, 196, 74, 0.35)",
};

const platina: TierTheme = {
  glow: "rgba(200, 220, 255, 0.6)",
  accent: "#d8e8ff",
  bodyLight: "#f8fcff",
  bodyMid: "#c8d8f0",
  bodyDark: "#8090b8",
  atmosphere: "rgba(216, 232, 255, 0.5)",
  ring: "rgba(216, 232, 255, 0.4)",
};

export const AFFILIATE_TIERS: TierConfig[] = [
  {
    tier: "platina",
    label: "Platina",
    percent: 35,
    minSales: 100,
    tagline: "Elite absoluta",
    theme: platina,
  },
  {
    tier: "ouro",
    label: "Ouro",
    percent: 30,
    minSales: 51,
    tagline: "Alta performance",
    theme: ouro,
  },
  {
    tier: "prata",
    label: "Prata",
    percent: 25,
    minSales: 26,
    tagline: "Crescimento sólido",
    theme: prata,
  },
  {
    tier: "bronze",
    label: "Bronze",
    percent: 20,
    minSales: 11,
    tagline: "Primeiros resultados",
    theme: bronze,
  },
  {
    tier: "iniciante",
    label: "Iniciante",
    percent: 15,
    minSales: 0,
    tagline: "Comece agora",
    theme: iniciante,
  },
];

/** Ordem ascendente para exibição na landing (Iniciante → Platina). */
export const AFFILIATE_TIERS_ASC = [...AFFILIATE_TIERS].reverse();

export function tierForMonthlySales(salesCount: number): TierConfig {
  for (const t of AFFILIATE_TIERS) {
    if (salesCount >= t.minSales) return t;
  }
  return AFFILIATE_TIERS[AFFILIATE_TIERS.length - 1];
}

export function tierConfigById(tier: AffiliateTier): TierConfig {
  return (
    AFFILIATE_TIERS.find((t) => t.tier === tier) ??
    AFFILIATE_TIERS[AFFILIATE_TIERS.length - 1]
  );
}
