import type {
  MetaAdsAd,
  MetaAdsAdSet,
  MetaAdsCampaign,
} from "@/lib/meta-ads-types";

export type ManagerLevel = "campaigns" | "adsets" | "ads";

export type MetaTableRow = MetaAdsCampaign | MetaAdsAdSet | MetaAdsAd;

export interface MetaTableContext {
  avgOrderValue: number;
  cogsPercent: number;
  paymentFeePercent: number;
  shippingPerOrder: number;
  accountStatus?: number | null;
  accountTotalSpent?: number;
}

export type ColumnAlign = "left" | "right";

export interface MetaColumnDef {
  id: string;
  label: string;
  group: string;
  align: ColumnAlign;
  levels: ManagerLevel[];
  pinned?: boolean;
  getValue: (row: MetaTableRow, ctx: MetaTableContext) => string;
  getAggregate?: (rows: MetaTableRow[], ctx: MetaTableContext) => string;
}

function budgetOf(row: MetaTableRow): number | null {
  if ("dailyBudget" in row && row.dailyBudget != null) return row.dailyBudget;
  if ("lifetimeBudget" in row && row.lifetimeBudget != null) {
    return row.lifetimeBudget;
  }
  return null;
}

function estRevenue(row: MetaTableRow, ctx: MetaTableContext) {
  return row.conversions * ctx.avgOrderValue;
}

function estCosts(row: MetaTableRow, ctx: MetaTableContext, revenue: number) {
  const cogs = revenue * ctx.cogsPercent;
  const fees = revenue * ctx.paymentFeePercent;
  const shipping = row.conversions * ctx.shippingPerOrder;
  return { total: row.spend + cogs + fees + shipping };
}

function money(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "N/A";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function num(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "N/A";
  return n.toLocaleString("pt-BR");
}

function pct(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "N/A";
  return `${n.toFixed(1)}%`;
}

export const META_COLUMN_GROUPS = [
  "Essencial",
  "Financeiro",
  "Vendas",
  "Meta Ads",
  "Vídeo",
  "Conta",
  "Outros",
] as const;

function col(
  def: Omit<MetaColumnDef, "getValue"> & {
    getValue: MetaColumnDef["getValue"];
    getAggregate?: MetaColumnDef["getAggregate"];
  }
): MetaColumnDef {
  return def;
}

export const META_COLUMNS: MetaColumnDef[] = [
  col({
    id: "status",
    label: "Status",
    group: "Essencial",
    align: "left",
    levels: ["campaigns", "adsets", "ads"],
    pinned: true,
    getValue: (row) => row.effectiveStatus ?? row.status,
  }),
  col({
    id: "name_campaign",
    label: "Campanha",
    group: "Essencial",
    align: "left",
    levels: ["campaigns"],
    pinned: true,
    getValue: (row) => row.name,
  }),
  col({
    id: "name_adset",
    label: "Conjunto",
    group: "Essencial",
    align: "left",
    levels: ["adsets"],
    pinned: true,
    getValue: (row) => row.name,
  }),
  col({
    id: "name_ad",
    label: "Anúncio",
    group: "Essencial",
    align: "left",
    levels: ["ads"],
    pinned: true,
    getValue: (row) => row.name,
  }),
  col({
    id: "spend",
    label: "Gastos",
    group: "Financeiro",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row) => money(row.spend),
    getAggregate: (rows) => money(rows.reduce((s, r) => s + r.spend, 0)),
  }),
  col({
    id: "revenue",
    label: "Faturamento",
    group: "Financeiro",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row, ctx) => money(estRevenue(row, ctx)),
    getAggregate: (rows, ctx) =>
      money(rows.reduce((s, r) => s + estRevenue(r, ctx), 0)),
  }),
  col({
    id: "gross_revenue",
    label: "Faturamento Bruto",
    group: "Financeiro",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row, ctx) => money(estRevenue(row, ctx)),
  }),
  col({
    id: "pending_revenue",
    label: "Faturamento Pendente",
    group: "Financeiro",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => money(0),
  }),
  col({
    id: "refunded_revenue",
    label: "Faturamento Reembolsado",
    group: "Financeiro",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => money(0),
  }),
  col({
    id: "profit",
    label: "Lucro",
    group: "Financeiro",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row, ctx) => {
      const rev = estRevenue(row, ctx);
      return money(rev - estCosts(row, ctx, rev).total);
    },
    getAggregate: (rows, ctx) => {
      const profit = rows.reduce((s, r) => {
        const rev = estRevenue(r, ctx);
        return s + (rev - estCosts(r, ctx, rev).total);
      }, 0);
      return money(profit);
    },
  }),
  col({
    id: "roas",
    label: "ROAS",
    group: "Financeiro",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row, ctx) => {
      const rev = estRevenue(row, ctx);
      return row.spend > 0 ? `${(rev / row.spend).toFixed(2)}x` : "N/A";
    },
  }),
  col({
    id: "margin",
    label: "Margem",
    group: "Financeiro",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row, ctx) => {
      const rev = estRevenue(row, ctx);
      if (rev <= 0) return "N/A";
      const profit = rev - estCosts(row, ctx, rev).total;
      return pct((profit / rev) * 100);
    },
  }),
  col({
    id: "roi",
    label: "ROI",
    group: "Financeiro",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row, ctx) => {
      const rev = estRevenue(row, ctx);
      const total = estCosts(row, ctx, rev).total;
      return total > 0 ? pct(((rev - total) / total) * 100) : "N/A";
    },
  }),
  col({
    id: "product_costs",
    label: "Custos de Produto",
    group: "Financeiro",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row, ctx) => money(estRevenue(row, ctx) * ctx.cogsPercent),
  }),
  col({
    id: "meta_ads_tax",
    label: "Imposto Meta Ads",
    group: "Financeiro",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => money(0),
  }),
  col({
    id: "budget",
    label: "Orçamento",
    group: "Financeiro",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row) => money(budgetOf(row)),
  }),
  col({
    id: "cpa",
    label: "CPA",
    group: "Vendas",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row) => money(row.cpa),
  }),
  col({
    id: "sales",
    label: "Vendas",
    group: "Vendas",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row) => num(row.conversions),
    getAggregate: (rows) => num(rows.reduce((s, r) => s + r.conversions, 0)),
  }),
  col({
    id: "individual_sales",
    label: "Vendas Individuais",
    group: "Vendas",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row) => num(row.conversions),
  }),
  col({
    id: "pending_sales",
    label: "Vendas Pendentes",
    group: "Vendas",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "0",
  }),
  col({
    id: "total_sales",
    label: "Vendas Totais",
    group: "Vendas",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row) => num(row.conversions),
  }),
  col({
    id: "rejected_sales",
    label: "Vendas Recusadas",
    group: "Vendas",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "0",
  }),
  col({
    id: "refunded_sales",
    label: "Vendas Reembolsadas",
    group: "Vendas",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "0",
  }),
  col({
    id: "cpp",
    label: "Custo por Vendas Pendentes",
    group: "Vendas",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "cpt",
    label: "Custo por Vendas Totais",
    group: "Vendas",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row) => money(row.cpa),
  }),
  col({
    id: "arpu",
    label: "ARPU",
    group: "Vendas",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row, ctx) =>
      row.conversions > 0
        ? money(estRevenue(row, ctx) / row.conversions)
        : "N/A",
  }),
  col({
    id: "impressions",
    label: "Impressões",
    group: "Meta Ads",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row) => num(row.impressions),
    getAggregate: (rows) => num(rows.reduce((s, r) => s + r.impressions, 0)),
  }),
  col({
    id: "clicks",
    label: "Cliques",
    group: "Meta Ads",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row) => num(row.clicks),
    getAggregate: (rows) => num(rows.reduce((s, r) => s + r.clicks, 0)),
  }),
  col({
    id: "cpc",
    label: "CPC",
    group: "Meta Ads",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row) =>
      row.clicks > 0 ? money(row.spend / row.clicks) : "N/A",
  }),
  col({
    id: "ctr",
    label: "CTR",
    group: "Meta Ads",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row) =>
      row.impressions > 0
        ? pct((row.clicks / row.impressions) * 100)
        : "N/A",
  }),
  col({
    id: "cpm",
    label: "CPM",
    group: "Meta Ads",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row) =>
      row.impressions > 0
        ? money((row.spend / row.impressions) * 1000)
        : "N/A",
  }),
  col({
    id: "frequency",
    label: "Frequência",
    group: "Meta Ads",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "conversations",
    label: "Conversas Iniciadas",
    group: "Meta Ads",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "cost_per_conversation",
    label: "Custo por Conversa",
    group: "Meta Ads",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "leads",
    label: "Cadastros",
    group: "Meta Ads",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "cpl",
    label: "CPL",
    group: "Meta Ads",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "checkout_initiated",
    label: "Finalização de compra iniciada",
    group: "Meta Ads",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "cpi",
    label: "CPI",
    group: "Meta Ads",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "page_views",
    label: "Visualizações de página",
    group: "Meta Ads",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "cpv",
    label: "CPV",
    group: "Meta Ads",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "icr",
    label: "Taxa de ICs",
    group: "Meta Ads",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "connection_rate",
    label: "Taxa de conexão",
    group: "Meta Ads",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "conversion_rate",
    label: "Conversão",
    group: "Meta Ads",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "checkout_conversion",
    label: "Conversão do Checkout",
    group: "Meta Ads",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "click_conversion",
    label: "Conversão de Cliques",
    group: "Meta Ads",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row) =>
      row.clicks > 0
        ? pct((row.conversions / row.clicks) * 100)
        : "N/A",
  }),
  col({
    id: "video_retention",
    label: "Retenção",
    group: "Vídeo",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "hook",
    label: "Hook",
    group: "Vídeo",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "hold_rate",
    label: "Hold Rate",
    group: "Vídeo",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "body_conversion",
    label: "Conversão do Body",
    group: "Vídeo",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "body_retention",
    label: "Retenção do Body",
    group: "Vídeo",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "cta",
    label: "CTA",
    group: "Vídeo",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "play_rate_hook",
    label: "Play Rate do Hook",
    group: "Vídeo",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "video_retention_75",
    label: "Retenção de Vídeo (75%)",
    group: "Vídeo",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "account_status",
    label: "Status da conta",
    group: "Conta",
    align: "left",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (_row, ctx) =>
      ctx.accountStatus != null ? String(ctx.accountStatus) : "N/A",
  }),
  col({
    id: "account_total_spent",
    label: "Total gasto na conta",
    group: "Conta",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (_row, ctx) => money(ctx.accountTotalSpent),
  }),
  col({
    id: "card_cycle",
    label: "Ciclo do cartão",
    group: "Conta",
    align: "left",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "credit_card",
    label: "Cartão de crédito",
    group: "Conta",
    align: "left",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "bid_cap",
    label: "Bid Cap",
    group: "Conta",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "instagram_followers",
    label: "Seguidores Instagram",
    group: "Conta",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "cost_per_follower",
    label: "Custo por Seguidor",
    group: "Conta",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "accounts_count",
    label: "Contas de Anúncios",
    group: "Conta",
    align: "right",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "1",
  }),
  col({
    id: "id",
    label: "ID",
    group: "Outros",
    align: "left",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row) => row.id,
  }),
  col({
    id: "created_at",
    label: "Data de criação",
    group: "Outros",
    align: "left",
    levels: ["campaigns", "adsets", "ads"],
    getValue: () => "N/A",
  }),
  col({
    id: "updated_at",
    label: "Última Atualização",
    group: "Outros",
    align: "left",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row) => {
      const d = "syncedAt" in row ? row.syncedAt : row.updatedAt;
      return d ? new Date(d).toLocaleString("pt-BR") : "N/A";
    },
  }),
  col({
    id: "delivery",
    label: "Veiculação",
    group: "Outros",
    align: "left",
    levels: ["campaigns", "adsets", "ads"],
    getValue: (row) => row.effectiveStatus ?? row.status,
  }),
  col({
    id: "objective",
    label: "Objetivo",
    group: "Outros",
    align: "left",
    levels: ["campaigns"],
    getValue: (row) =>
      "objective" in row && row.objective ? row.objective : "N/A",
  }),
  col({
    id: "optimization_goal",
    label: "Otimização",
    group: "Outros",
    align: "left",
    levels: ["adsets"],
    getValue: (row) =>
      "optimizationGoal" in row && row.optimizationGoal
        ? row.optimizationGoal
        : "N/A",
  }),
  col({
    id: "creative",
    label: "Criativo",
    group: "Outros",
    align: "left",
    levels: ["ads"],
    getValue: (row) =>
      "creativeName" in row && row.creativeName ? row.creativeName : "N/A",
  }),
];

const DEFAULT_VISIBLE: Record<ManagerLevel, string[]> = {
  campaigns: [
    "status",
    "name_campaign",
    "spend",
    "impressions",
    "clicks",
    "sales",
    "cpa",
    "budget",
    "revenue",
    "roas",
    "profit",
  ],
  adsets: [
    "status",
    "name_adset",
    "spend",
    "impressions",
    "clicks",
    "sales",
    "cpa",
    "budget",
    "revenue",
    "roas",
  ],
  ads: [
    "status",
    "name_ad",
    "spend",
    "impressions",
    "clicks",
    "sales",
    "cpa",
    "revenue",
    "ctr",
    "cpc",
  ],
};

const STORAGE_PREFIX = "meta-ads-columns-v1";

export function columnsForLevel(level: ManagerLevel): MetaColumnDef[] {
  return META_COLUMNS.filter((c) => c.levels.includes(level));
}

export function getDefaultVisibleColumns(level: ManagerLevel): string[] {
  return [...DEFAULT_VISIBLE[level]];
}

export function loadVisibleColumns(level: ManagerLevel): string[] {
  if (typeof window === "undefined") return getDefaultVisibleColumns(level);
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}-${level}`);
    if (!raw) return getDefaultVisibleColumns(level);
    const parsed = JSON.parse(raw) as string[];
    const valid = new Set(columnsForLevel(level).map((c) => c.id));
    const pinned = pinnedColumnIds(level);
    return [...new Set([...pinned, ...parsed.filter((id) => valid.has(id))])];
  } catch {
    return getDefaultVisibleColumns(level);
  }
}

export function saveVisibleColumns(level: ManagerLevel, ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${STORAGE_PREFIX}-${level}`, JSON.stringify(ids));
}

export function pinnedColumnIds(level: ManagerLevel): string[] {
  return columnsForLevel(level).filter((c) => c.pinned).map((c) => c.id);
}

export function resolveColumns(
  level: ManagerLevel,
  visibleIds: string[]
): MetaColumnDef[] {
  const map = new Map(columnsForLevel(level).map((c) => [c.id, c]));
  const pinned = pinnedColumnIds(level);
  const ordered = [...pinned, ...visibleIds.filter((id) => !pinned.includes(id))];
  const unique = [...new Set(ordered)];
  return unique.map((id) => map.get(id)).filter(Boolean) as MetaColumnDef[];
}
