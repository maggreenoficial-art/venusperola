import { adminConfig } from "@/lib/admin-config";
import { getAllEvents, type AnalyticsEvent } from "@/lib/analytics";
import { getAllProducts, formatPrice } from "@/lib/catalog";
import { getAllOrders } from "@/lib/db/orders";
import { getMetaAdsConfig } from "@/lib/db/campaigns";
import type { Order } from "@/lib/orders";

export interface MetaCampaign {
  id: string;
  name: string;
  status: "active" | "paused";
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface DashboardData {
  kpis: {
    revenueToday: number;
    revenueYesterday: number;
    revenueChange: number;
    ordersToday: number;
    ordersYesterday: number;
    ordersChange: number;
    avgTicket: number;
    avgTicketYesterday: number;
    avgTicketAlert: boolean;
    roas: number;
    roasTarget: number;
    roasOnTarget: boolean;
    totalMetaSpend: number;
  };
  revenueChart: { date: string; label: string; revenue: number; orders: number }[];
  funnel: { stage: string; count: number; rate: number }[];
  campaigns: (MetaCampaign & { roas: number; cpa: number; recommendation: string })[];
  topProducts: { name: string; revenue: number; quantity: number; productId: string }[];
  stock: {
    productName: string;
    variantLabel: string;
    stock: number;
    status: "critical" | "warning" | "ok";
  }[];
  alerts: { type: "danger" | "warning" | "success"; message: string }[];
  customers: {
    total: number;
    newThisMonth: number;
    repeatRate: number;
    ltv: number;
  };
  financial: {
    revenue: number;
    cogs: number;
    metaSpend: number;
    shipping: number;
    paymentFees: number;
    fixedCosts: number;
    netProfit: number;
    margin: number;
  };
  recentOrders: Order[];
  capiStats: {
    totalEvents: number;
    serverEvents: number;
    browserEvents: number;
    purchases: number;
    capiPurchases: number;
  };
}

async function readOrders(): Promise<Order[]> {
  try {
    return await getAllOrders();
  } catch {
    return [];
  }
}

async function readMetaAds(): Promise<{ targetRoas: number; campaigns: MetaCampaign[] }> {
  try {
    return await getMetaAdsConfig();
  } catch {
    return { targetRoas: adminConfig.targetRoas, campaigns: [] };
  }
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function validOrders(orders: Order[]) {
  return orders.filter((o) => o.status !== "cancelled");
}

function revenueForDay(orders: Order[], day: Date) {
  return validOrders(orders)
    .filter((o) => isSameDay(new Date(o.createdAt), day))
    .reduce((s, o) => s + o.total, 0);
}

function ordersForDay(orders: Order[], day: Date) {
  return validOrders(orders).filter((o) =>
    isSameDay(new Date(o.createdAt), day)
  ).length;
}

function monthOrders(orders: Order[]) {
  const now = new Date();
  return validOrders(orders).filter((o) => {
    const d = new Date(o.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
}

export async function getDashboardData(): Promise<DashboardData> {
  const [orders, events, metaAds] = await Promise.all([
    readOrders(),
    getAllEvents(),
    readMetaAds(),
  ]);

  const now = new Date();
  const today = startOfDay(now);
  const yesterday = startOfDay(new Date(now.getTime() - 86400000));

  const revenueToday = revenueForDay(orders, today);
  const revenueYesterday = revenueForDay(orders, yesterday);
  const ordersToday = ordersForDay(orders, today);
  const ordersYesterday = ordersForDay(orders, yesterday);

  const avgTicket = ordersToday > 0 ? revenueToday / ordersToday : 0;
  const avgTicketYesterday =
    ordersYesterday > 0 ? revenueYesterday / ordersYesterday : 0;
  const avgTicketAlert =
    avgTicketYesterday > 0 && avgTicket < avgTicketYesterday * 0.9;

  const monthRev = monthOrders(orders).reduce((s, o) => s + o.total, 0);
  const activeCampaigns = metaAds.campaigns.filter((c) => c.status === "active");
  const totalMetaSpend = activeCampaigns.reduce((s, c) => s + c.spend, 0);
  const roas = totalMetaSpend > 0 ? monthRev / totalMetaSpend : 0;
  const roasTarget = metaAds.targetRoas ?? adminConfig.targetRoas;

  const revenueChart = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dayOrders = validOrders(orders).filter((o) =>
      isSameDay(new Date(o.createdAt), d)
    );
    return {
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" }),
      revenue: dayOrders.reduce((s, o) => s + o.total, 0),
      orders: dayOrders.length,
    };
  });

  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const recentEvents = events.filter(
    (e) => new Date(e.timestamp) >= sevenDaysAgo
  );

  const funnelCounts = {
    visitantes: countUniqueSessions(recentEvents, "page_view"),
    carrinho: recentEvents.filter((e) => e.type === "add_to_cart").length,
    checkout: recentEvents.filter((e) => e.type === "initiate_checkout").length,
    pedido: recentEvents.filter((e) => e.type === "purchase").length,
  };

  const funnelBase = funnelCounts.visitantes || 1;
  const funnel = [
    { stage: "Visitantes", count: funnelCounts.visitantes, rate: 100 },
    {
      stage: "Carrinho",
      count: funnelCounts.carrinho,
      rate: Math.round((funnelCounts.carrinho / funnelBase) * 100),
    },
    {
      stage: "Checkout",
      count: funnelCounts.checkout,
      rate: Math.round((funnelCounts.checkout / funnelBase) * 100),
    },
    {
      stage: "Pedido",
      count: funnelCounts.pedido,
      rate: Math.round((funnelCounts.pedido / funnelBase) * 100),
    },
  ];

  const productRevenue = new Map<string, { name: string; revenue: number; quantity: number }>();
  for (const order of monthOrders(orders)) {
    for (const item of order.items) {
      const key = item.productId;
      const existing = productRevenue.get(key) ?? {
        name: item.productName,
        revenue: 0,
        quantity: 0,
      };
      existing.revenue += item.price * item.quantity;
      existing.quantity += item.quantity;
      productRevenue.set(key, existing);
    }
  }

  const topProducts = [...productRevenue.entries()]
    .map(([productId, data]) => ({ productId, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const stock = getAllProducts().flatMap((p) =>
    p.variants.map((v) => {
      let status: "critical" | "warning" | "ok" = "ok";
      if (v.stock <= adminConfig.criticalStockThreshold) status = "critical";
      else if (v.stock <= adminConfig.lowStockThreshold) status = "warning";
      return {
        productName: p.name,
        variantLabel: v.label,
        stock: v.stock,
        status,
      };
    })
  ).sort((a, b) => a.stock - b.stock);

  const campaigns = metaAds.campaigns.map((c) => {
    const attributedRevenue =
      c.conversions > 0
        ? (monthRev / Math.max(validOrders(orders).length, 1)) * c.conversions
        : 0;
    const campaignRoas = c.spend > 0 ? attributedRevenue / c.spend : 0;
    const cpa = c.conversions > 0 ? c.spend / c.conversions : c.spend;
    let recommendation = "Manter";
    if (c.status === "active" && campaignRoas >= roasTarget * 1.2)
      recommendation = "Escalar";
    else if (c.status === "active" && campaignRoas < roasTarget * 0.7)
      recommendation = "Pausar";
    else if (c.status === "active" && campaignRoas < roasTarget)
      recommendation = "Otimizar";

    return { ...c, roas: campaignRoas, cpa, recommendation };
  });

  const alerts = buildAlerts({
    roas,
    roasTarget,
    funnelCounts,
    campaigns,
    stock,
    orders,
  });

  const customerMap = new Map<string, { orders: number; revenue: number; firstOrder: Date }>();
  for (const order of validOrders(orders)) {
    const email = order.customer.email.toLowerCase();
    const existing = customerMap.get(email) ?? {
      orders: 0,
      revenue: 0,
      firstOrder: new Date(order.createdAt),
    };
    existing.orders += 1;
    existing.revenue += order.total;
    if (new Date(order.createdAt) < existing.firstOrder)
      existing.firstOrder = new Date(order.createdAt);
    customerMap.set(email, existing);
  }

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = [...customerMap.values()].filter(
    (c) => c.firstOrder >= monthStart
  ).length;
  const repeatCustomers = [...customerMap.values()].filter((c) => c.orders > 1).length;
  const totalCustomers = customerMap.size;
  const repeatRate =
    totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;
  const ltv =
    totalCustomers > 0
      ? [...customerMap.values()].reduce((s, c) => s + c.revenue, 0) / totalCustomers
      : 0;

  const monthOrderList = monthOrders(orders);
  const monthOrderCount = monthOrderList.length;
  const cogs = monthRev * adminConfig.cogsPercent;
  const shipping = monthOrderCount * adminConfig.shippingCostPerOrder;
  const paymentFees = monthRev * adminConfig.paymentFeePercent;
  const fixedCosts = adminConfig.monthlyFixedCosts;
  const netProfit = monthRev - cogs - totalMetaSpend - shipping - paymentFees - fixedCosts;
  const margin = monthRev > 0 ? (netProfit / monthRev) * 100 : 0;

  const capiStats = {
    totalEvents: events.length,
    serverEvents: events.filter((e) => e.source === "server" || e.source === "capi").length,
    browserEvents: events.filter((e) => e.source === "browser").length,
    purchases: events.filter((e) => e.type === "purchase").length,
    capiPurchases: events.filter((e) => e.type === "purchase" && e.source === "capi").length,
  };

  return {
    kpis: {
      revenueToday,
      revenueYesterday,
      revenueChange: pctChange(revenueToday, revenueYesterday),
      ordersToday,
      ordersYesterday,
      ordersChange: pctChange(ordersToday, ordersYesterday),
      avgTicket,
      avgTicketYesterday,
      avgTicketAlert: avgTicketAlert,
      roas,
      roasTarget,
      roasOnTarget: roas >= roasTarget,
      totalMetaSpend,
    },
    revenueChart,
    funnel,
    campaigns,
    topProducts,
    stock: stock.slice(0, 12),
    alerts,
    customers: { total: totalCustomers, newThisMonth, repeatRate, ltv },
    financial: {
      revenue: monthRev,
      cogs,
      metaSpend: totalMetaSpend,
      shipping,
      paymentFees,
      fixedCosts,
      netProfit,
      margin,
    },
    recentOrders: validOrders(orders).slice(0, 8),
    capiStats,
  };
}

function countUniqueSessions(events: AnalyticsEvent[], type: AnalyticsEvent["type"]) {
  const sessions = new Set(
    events.filter((e) => e.type === type && e.sessionId).map((e) => e.sessionId!)
  );
  if (sessions.size > 0) return sessions.size;
  return events.filter((e) => e.type === type).length;
}

function buildAlerts(input: {
  roas: number;
  roasTarget: number;
  funnelCounts: { visitantes: number; carrinho: number; checkout: number; pedido: number };
  campaigns: { name: string; roas: number; recommendation: string }[];
  stock: { productName: string; status: string }[];
  orders: Order[];
}): DashboardData["alerts"] {
  const alerts: DashboardData["alerts"] = [];

  if (input.roas < input.roasTarget * 0.8) {
    alerts.push({
      type: "danger",
      message: `ROAS abaixo da meta (${input.roas.toFixed(1)}x vs ${input.roasTarget}x). Revise criativos e público.`,
    });
  }

  const checkoutAbandon =
    input.funnelCounts.checkout > 0
      ? 1 - input.funnelCounts.pedido / input.funnelCounts.checkout
      : 0;
  if (checkoutAbandon > 0.6 && input.funnelCounts.checkout >= 3) {
    alerts.push({
      type: "warning",
      message: `Abandono de checkout alto (${Math.round(checkoutAbandon * 100)}%). Teste PIX com desconto ou simplifique o formulário.`,
    });
  }

  const scaleOp = input.campaigns.find((c) => c.recommendation === "Escalar");
  if (scaleOp) {
    alerts.push({
      type: "success",
      message: `Oportunidade: campanha "${scaleOp.name}" com ROAS ${scaleOp.roas.toFixed(1)}x — considere aumentar budget.`,
    });
  }

  const killCamp = input.campaigns.find((c) => c.recommendation === "Pausar");
  if (killCamp) {
    alerts.push({
      type: "danger",
      message: `CPA elevado em "${killCamp.name}" (ROAS ${killCamp.roas.toFixed(1)}x). Considere pausar.`,
    });
  }

  const critical = input.stock.filter((s) => s.status === "critical");
  if (critical.length > 0) {
    alerts.push({
      type: "danger",
      message: `${critical.length} variante(s) com estoque crítico — repor imediatamente.`,
    });
  }

  const pending = input.orders.filter((o) => o.status === "pending_payment").length;
  if (pending >= 3) {
    alerts.push({
      type: "warning",
      message: `${pending} pedidos aguardando pagamento. Envie lembrete PIX.`,
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      type: "success",
      message: "Tudo sob controle. Métricas dentro do esperado.",
    });
  }

  return alerts;
}

export { formatPrice };
