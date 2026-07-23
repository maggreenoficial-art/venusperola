import { adminConfig } from "@/lib/admin-config";
import { getAllOrders } from "@/lib/db/orders";
import { getSelectedMetaAdAccount } from "@/lib/db/meta-ads";
import {
  extractConversations,
  extractConversions,
  extractLeads,
  fetchMetaAccountInsights,
  isMetaSystemTokenConfigured,
  metricsFromInsight,
} from "@/lib/meta-marketing-api";
import type { Order, PaymentMethod } from "@/lib/orders";

export interface MetaSummaryData {
  period: {
    preset: string;
    label: string;
    since: string;
    until: string;
  };
  netRevenue: number;
  adSpend: number;
  roas: number | null;
  profit: number;
  pendingSales: number;
  refundedSales: number;
  roi: number | null;
  margin: number | null;
  chargebackRate: number;
  productCosts: number;
  additionalExpenses: number;
  salesTax: number;
  paymentFees: number;
  metaAdsTax: number;
  shippingCosts: number;
  cpa: number | null;
  conversations: number;
  costPerConversation: number | null;
  arpu: number | null;
  leads: number;
  paidOrders: number;
  metaConversions: number;
  impressions: number;
  clicks: number;
  salesByPayment: {
    method: string;
    label: string;
    count: number;
    revenue: number;
  }[];
  approvalRates: {
    method: string;
    label: string;
    rate: number | null;
  }[];
  salesByProduct: { name: string; count: number; revenue: number }[];
  salesBySource: { source: string; count: number; revenue: number }[];
}

const PERIOD_LABELS: Record<string, string> = {
  today: "Hoje",
  yesterday: "Ontem",
  last_7d: "Últimos 7 dias",
  last_30d: "Últimos 30 dias",
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix: "Pix",
  credit_card: "Cartão",
  boleto: "Boleto",
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function getPeriodRange(preset: string): {
  since: Date;
  until: Date;
  label: string;
} {
  const now = new Date();
  const label = PERIOD_LABELS[preset] ?? preset;

  if (preset === "yesterday") {
    const day = new Date(now);
    day.setDate(day.getDate() - 1);
    return { since: startOfDay(day), until: endOfDay(day), label };
  }

  if (preset === "last_7d") {
    const since = startOfDay(now);
    since.setDate(since.getDate() - 6);
    return { since, until: endOfDay(now), label };
  }

  if (preset === "last_30d") {
    const since = startOfDay(now);
    since.setDate(since.getDate() - 29);
    return { since, until: endOfDay(now), label };
  }

  return { since: startOfDay(now), until: endOfDay(now), label: label };
}

function periodDays(preset: string): number {
  if (preset === "today" || preset === "yesterday") return 1;
  if (preset === "last_7d") return 7;
  if (preset === "last_30d") return 30;
  return 1;
}

function ordersInPeriod(orders: Order[], since: Date, until: Date) {
  return orders.filter((o) => {
    const d = new Date(o.createdAt);
    return d >= since && d <= until;
  });
}

const PAID_STATUSES = new Set([
  "paid",
  "processing",
  "shipped",
  "delivered",
]);

export async function getMetaSummaryData(
  accountId?: string,
  datePreset: string = "today"
): Promise<MetaSummaryData> {
  const { since, until, label } = getPeriodRange(datePreset);
  const orders = await getAllOrders().catch(() => []);
  const periodOrders = ordersInPeriod(orders, since, until);

  const paidOrders = periodOrders.filter((o) => PAID_STATUSES.has(o.status));
  const pendingOrders = periodOrders.filter((o) => o.status === "pending_payment");
  const refundedOrders = periodOrders.filter((o) => o.status === "cancelled");

  const netRevenue = paidOrders.reduce((s, o) => s + o.total, 0);
  const pendingSales = pendingOrders.reduce((s, o) => s + o.total, 0);
  const refundedSales = refundedOrders.reduce((s, o) => s + o.total, 0);

  let adSpend = 0;
  let impressions = 0;
  let clicks = 0;
  let metaConversions = 0;
  let metaLeads = 0;
  let conversations = 0;

  const resolvedAccountId =
    accountId ?? (await getSelectedMetaAdAccount())?.accountId;

  if (isMetaSystemTokenConfigured() && resolvedAccountId) {
    try {
      const insight = await fetchMetaAccountInsights(
        resolvedAccountId,
        datePreset
      );
      const metrics = metricsFromInsight(insight ?? undefined);
      adSpend = metrics.spend;
      impressions = metrics.impressions;
      clicks = metrics.clicks;
      metaConversions = extractConversions(insight?.actions);
      metaLeads = extractLeads(insight?.actions);
      conversations = extractConversations(insight?.actions);
    } catch {
      // Mantém zeros se a API falhar — pedidos da loja ainda aparecem
    }
  }

  const paidCount = paidOrders.length;
  const orderCount = paidCount || 1;
  const avgOrderValue = paidCount > 0 ? netRevenue / paidCount : 0;

  const productCosts = netRevenue * adminConfig.cogsPercent;
  const shippingCosts = paidCount * adminConfig.shippingCostPerOrder;
  const paymentFees = netRevenue * adminConfig.paymentFeePercent;
  const salesTaxPercent = Number(process.env.SALES_TAX_PERCENT ?? "0");
  const metaAdsTaxPercent = Number(process.env.META_ADS_TAX_PERCENT ?? "0");
  const salesTax = netRevenue * salesTaxPercent;
  const metaAdsTax = adSpend * metaAdsTaxPercent;
  const additionalExpenses =
    (adminConfig.monthlyFixedCosts / 30) * periodDays(datePreset);

  const totalCosts =
    productCosts +
    adSpend +
    shippingCosts +
    paymentFees +
    salesTax +
    metaAdsTax +
    additionalExpenses;

  const profit = netRevenue - totalCosts;
  const roas = adSpend > 0 ? netRevenue / adSpend : null;
  const roi = totalCosts > 0 ? (profit / totalCosts) * 100 : null;
  const margin = netRevenue > 0 ? (profit / netRevenue) * 100 : null;
  const conversionsForCpa =
    metaConversions > 0 ? metaConversions : paidCount;
  const cpa = conversionsForCpa > 0 ? adSpend / conversionsForCpa : null;
  const costPerConversation =
    conversations > 0 ? adSpend / conversations : null;

  const uniqueCustomers = new Set(
    paidOrders.map((o) => o.customer.email.toLowerCase())
  ).size;
  const arpu = uniqueCustomers > 0 ? netRevenue / uniqueCustomers : null;

  const paymentMethods: PaymentMethod[] = ["pix", "credit_card", "boleto"];
  const salesByPayment: MetaSummaryData["salesByPayment"] = paymentMethods.map(
    (method) => {
      const methodPaid = paidOrders.filter((o) => o.paymentMethod === method);
      return {
        method,
        label: PAYMENT_LABELS[method],
        count: methodPaid.length,
        revenue: methodPaid.reduce((s, o) => s + o.total, 0),
      };
    }
  );

  const othersRevenue = paidOrders
    .filter((o) => !paymentMethods.includes(o.paymentMethod))
    .reduce((s, o) => s + o.total, 0);
  const othersCount = paidOrders.filter(
    (o) => !paymentMethods.includes(o.paymentMethod)
  ).length;
  if (othersCount > 0) {
    salesByPayment.push({
      method: "other",
      label: "Outros",
      count: othersCount,
      revenue: othersRevenue,
    });
  }

  const approvalRates = paymentMethods.map((method) => {
    const attempted = periodOrders.filter((o) => o.paymentMethod === method);
    const approved = attempted.filter((o) => PAID_STATUSES.has(o.status));
    return {
      method,
      label: PAYMENT_LABELS[method],
      rate:
        attempted.length > 0
          ? (approved.length / attempted.length) * 100
          : null,
    };
  });

  const productMap = new Map<string, { name: string; count: number; revenue: number }>();
  for (const order of paidOrders) {
    for (const item of order.items) {
      const existing = productMap.get(item.productId) ?? {
        name: item.productName,
        count: 0,
        revenue: 0,
      };
      existing.count += item.quantity;
      existing.revenue += item.price * item.quantity;
      productMap.set(item.productId, existing);
    }
  }

  const salesByProduct = [...productMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const metaAttributedRevenue =
    metaConversions > 0
      ? Math.min(netRevenue, metaConversions * avgOrderValue)
      : 0;
  const organicRevenue = Math.max(0, netRevenue - metaAttributedRevenue);
  const metaAttributedCount =
    metaConversions > 0
      ? Math.min(paidCount, Math.round(metaConversions))
      : 0;
  const organicCount = Math.max(0, paidCount - metaAttributedCount);

  const salesBySource = [
    {
      source: "Meta Ads",
      count: metaAttributedCount,
      revenue: metaAttributedRevenue,
    },
    {
      source: "Orgânico / Direto",
      count: organicCount,
      revenue: organicRevenue,
    },
  ].filter((s) => s.count > 0 || s.revenue > 0);

  return {
    period: {
      preset: datePreset,
      label,
      since: since.toISOString(),
      until: until.toISOString(),
    },
    netRevenue,
    adSpend,
    roas,
    profit,
    pendingSales,
    refundedSales,
    roi,
    margin,
    chargebackRate: 0,
    productCosts,
    additionalExpenses,
    salesTax,
    paymentFees,
    metaAdsTax,
    shippingCosts,
    cpa,
    conversations,
    costPerConversation,
    arpu,
    leads: metaLeads,
    paidOrders: paidCount,
    metaConversions,
    impressions,
    clicks,
    salesByPayment,
    approvalRates,
    salesByProduct,
    salesBySource,
  };
}
