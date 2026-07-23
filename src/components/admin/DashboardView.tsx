"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  DollarSign,
  Loader2,
  RefreshCw,
  ShoppingCart,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { formatPrice } from "@/lib/catalog";
import type { DashboardData } from "@/lib/dashboard";

export function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/stats");
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading && !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (!data) {
    return <p className="text-muted">Erro ao carregar dashboard.</p>;
  }

  const { kpis, revenueChart, funnel, campaigns, topProducts, stock, alerts, customers, financial, recentOrders, capiStats } = data;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl italic">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Visão geral da loja · atualiza a cada 60s
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs tracking-widest uppercase hover:border-accent"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Atualizar
        </button>
      </div>

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Receita hoje"
          value={formatPrice(kpis.revenueToday)}
          change={kpis.revenueChange}
          icon={DollarSign}
          subtitle={`Ontem: ${formatPrice(kpis.revenueYesterday)}`}
        />
        <KpiCard
          title="Pedidos hoje"
          value={String(kpis.ordersToday)}
          change={kpis.ordersChange}
          icon={ShoppingCart}
          subtitle={`Ontem: ${kpis.ordersYesterday}`}
        />
        <KpiCard
          title="Ticket médio"
          value={formatPrice(kpis.avgTicket)}
          icon={TrendingUp}
          alert={kpis.avgTicketAlert}
          subtitle={
            kpis.avgTicketAlert
              ? "⚠ Caiu vs ontem"
              : `Ontem: ${formatPrice(kpis.avgTicketYesterday)}`
          }
        />
        <KpiCard
          title="ROAS Meta Ads"
          value={`${kpis.roas.toFixed(1)}x`}
          icon={Target}
          alert={!kpis.roasOnTarget}
          subtitle={`Meta: ${kpis.roasTarget}x · Spend: ${formatPrice(kpis.totalMetaSpend)}`}
          success={kpis.roasOnTarget}
        />
      </section>

      {/* CAPI status */}
      <div className="flex flex-wrap items-center gap-4 rounded border border-white/10 bg-white/[0.02] px-4 py-3 text-xs">
        <Zap size={14} className="text-accent" />
        <span className="text-muted">Meta CAPI (server-side):</span>
        <span>{capiStats.serverEvents} eventos server</span>
        <span className="text-muted">·</span>
        <span>{capiStats.browserEvents} browser</span>
        <span className="text-muted">·</span>
        <span className="text-green-400">{capiStats.capiPurchases} purchases CAPI</span>
        <span className="ml-auto text-[10px] text-muted">
          Recupera 30-50% das conversões perdidas pelo pixel
        </span>
      </div>

      {/* Charts row */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Receita — últimos 7 dias">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChart}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4a0a8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d4a0a8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill: "#888", fontSize: 11 }} />
                <YAxis tick={{ fill: "#888", fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
                <Tooltip
                  contentStyle={{ background: "#111", border: "1px solid #333" }}
                  formatter={(v) => [formatPrice(Number(v ?? 0)), "Receita"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#d4a0a8"
                  fill="url(#revGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Funil de vendas (7 dias)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} layout="vertical">
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fill: "#888", fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="stage"
                  tick={{ fill: "#888", fontSize: 11 }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{ background: "#111", border: "1px solid #333" }}
                  formatter={(v, _n, p) => {
                    const payload = p?.payload as { rate?: number } | undefined;
                    return [
                      `${v} (${payload?.rate ?? 0}%)`,
                      "Usuários",
                    ];
                  }}
                />
                <Bar dataKey="count" fill="#d4a0a8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-[10px] text-muted">
            Identifique onde as pessoas desistem no funil
          </p>
        </Panel>
      </section>

      {/* Meta Ads + Top Products */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Campanhas Meta Ads">
          <div className="space-y-3">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-4 border border-white/5 p-3"
              >
                <div
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    c.status === "active" ? "bg-green-400" : "bg-muted"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="text-[10px] text-muted">
                    Spend {formatPrice(c.spend)} · {c.clicks} cliques
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-medium ${
                      c.roas >= kpis.roasTarget ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {c.roas.toFixed(1)}x ROAS
                  </p>
                  <p
                    className={`text-[10px] ${
                      c.recommendation === "Escalar"
                        ? "text-green-400"
                        : c.recommendation === "Pausar"
                          ? "text-red-400"
                          : "text-muted"
                    }`}
                  >
                    {c.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Top 5 produtos (mês)">
          {topProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              Nenhuma venda registrada ainda
            </p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div
                  key={p.productId}
                  className="flex items-center gap-4 border border-white/5 p-3"
                >
                  <span className="text-lg font-serif text-accent/60">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-[10px] text-muted">
                      {p.quantity} unidades vendidas
                    </p>
                  </div>
                  <p className="text-sm font-medium text-accent">
                    {formatPrice(p.revenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </section>

      {/* Alerts */}
      <section>
        <h2 className="mb-4 text-xs font-bold tracking-[0.2em]">ALERTAS INTELIGENTES</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {alerts.map((a, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 border p-4 ${
                a.type === "danger"
                  ? "border-red-500/30 bg-red-500/5"
                  : a.type === "warning"
                    ? "border-yellow-500/30 bg-yellow-500/5"
                    : "border-green-500/30 bg-green-500/5"
              }`}
            >
              {a.type === "danger" ? (
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-400" />
              ) : a.type === "warning" ? (
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-yellow-400" />
              ) : (
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-400" />
              )}
              <p className="text-xs leading-relaxed">{a.message}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom row: Stock, Customers, Financial */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Panel title="Estoque">
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {stock.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{s.productName}</p>
                  <p className="text-muted">{s.variantLabel}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    s.status === "critical"
                      ? "bg-red-500/20 text-red-400"
                      : s.status === "warning"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {s.stock} un
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Clientes">
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Total" value={String(customers.total)} icon={Users} />
            <Stat label="Novos (mês)" value={String(customers.newThisMonth)} />
            <Stat label="Recompra" value={`${customers.repeatRate}%`} />
            <Stat label="LTV médio" value={formatPrice(customers.ltv)} />
          </div>
        </Panel>

        <Panel title="P&L do mês">
          <div className="space-y-2 text-sm">
            <PlRow label="Receita" value={financial.revenue} positive />
            <PlRow label="CMV (35%)" value={-financial.cogs} />
            <PlRow label="Meta Ads" value={-financial.metaSpend} />
            <PlRow label="Frete" value={-financial.shipping} />
            <PlRow label="Taxas pagamento" value={-financial.paymentFees} />
            <PlRow label="Custos fixos" value={-financial.fixedCosts} />
            <div className="border-t border-white/10 pt-2">
              <PlRow
                label="Lucro líquido"
                value={financial.netProfit}
                positive={financial.netProfit > 0}
                bold
              />
              <p className="mt-1 text-[10px] text-muted">
                Margem: {financial.margin.toFixed(1)}%
              </p>
            </div>
          </div>
        </Panel>
      </section>

      {/* Recent orders */}
      <Panel title="Pedidos recentes">
        {recentOrders.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">Nenhum pedido ainda</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-muted">
                  <th className="pb-3 pr-4">Pedido</th>
                  <th className="pb-3 pr-4">Cliente</th>
                  <th className="pb-3 pr-4">Total</th>
                  <th className="pb-3 pr-4">Pagamento</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-white/5">
                    <td className="py-3 pr-4 font-mono text-[10px]">{o.id}</td>
                    <td className="py-3 pr-4">
                      <p>{o.customer.name}</p>
                      <p className="text-muted">{o.customer.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-accent">
                      {formatPrice(o.total)}
                    </td>
                    <td className="py-3 pr-4 uppercase">{o.paymentMethod}</td>
                    <td className="py-3">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  subtitle,
  alert,
  success,
}: {
  title: string;
  value: string;
  change?: number;
  icon: typeof DollarSign;
  subtitle?: string;
  alert?: boolean;
  success?: boolean;
}) {
  return (
    <div
      className={`border p-5 ${
        alert
          ? "border-red-500/30 bg-red-500/5"
          : success
            ? "border-green-500/30 bg-green-500/5"
            : "border-white/10"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] tracking-widest text-muted uppercase">{title}</p>
        <Icon size={16} className="text-accent/60" />
      </div>
      <p className="mt-3 text-2xl font-medium">{value}</p>
      <div className="mt-2 flex items-center gap-2">
        {change !== undefined && (
          <span
            className={`flex items-center gap-0.5 text-xs ${
              change >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {change >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {Math.abs(change)}%
          </span>
        )}
        {subtitle && (
          <span className="text-[10px] text-muted">{subtitle}</span>
        )}
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-white/10 p-5">
      <h2 className="mb-4 text-xs font-bold tracking-[0.2em]">{title.toUpperCase()}</h2>
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Users;
}) {
  return (
    <div className="border border-white/5 p-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-accent/60" />}
        <p className="text-[10px] text-muted">{label}</p>
      </div>
      <p className="mt-1 text-lg font-medium">{value}</p>
    </div>
  );
}

function PlRow({
  label,
  value,
  positive,
  bold,
}: {
  label: string;
  value: number;
  positive?: boolean;
  bold?: boolean;
}) {
  return (
    <div className={`flex justify-between ${bold ? "font-medium" : ""}`}>
      <span className="text-muted">{label}</span>
      <span
        className={
          positive === undefined
            ? ""
            : value >= 0
              ? "text-green-400"
              : "text-red-400"
        }
      >
        {value < 0 ? "−" : ""}
        {formatPrice(Math.abs(value))}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending_payment: "bg-yellow-500/20 text-yellow-400",
    paid: "bg-green-500/20 text-green-400",
    processing: "bg-blue-500/20 text-blue-400",
    shipped: "bg-purple-500/20 text-purple-400",
    delivered: "bg-green-500/20 text-green-400",
    cancelled: "bg-red-500/20 text-red-400",
  };
  const labels: Record<string, string> = {
    pending_payment: "Aguardando",
    paid: "Pago",
    processing: "Processando",
    shipped: "Enviado",
    delivered: "Entregue",
    cancelled: "Cancelado",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] ${colors[status] ?? "bg-white/10"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
