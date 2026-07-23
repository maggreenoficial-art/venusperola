"use client";

import { useCallback, useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Loader2 } from "lucide-react";
import type { MetaSummaryData } from "@/lib/meta-summary";

const PIE_COLORS = ["#c9a87c", "#60a5fa", "#a78bfa", "#6b7280"];

interface MetaSummaryPanelProps {
  accountId: string;
  datePreset: string;
  accounts: { accountId: string; name: string }[];
  onAccountChange: (id: string) => void;
  onDatePresetChange: (preset: string) => void;
  datePresets: { id: string; label: string }[];
}

export function MetaSummaryPanel({
  accountId,
  datePreset,
  accounts,
  onAccountChange,
  onDatePresetChange,
  datePresets,
}: MetaSummaryPanelProps) {
  const [summary, setSummary] = useState<MetaSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      accountId,
      datePreset,
    });
    const res = await fetch(`/api/admin/meta/summary?${params}`);
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Erro ao carregar resumo.");
      setLoading(false);
      return;
    }
    setSummary(json.summary ?? null);
    setLoading(false);
  }, [accountId, datePreset]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !summary) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-red-500/30 bg-red-500/5 p-4 text-xs text-red-300">
        {error}
      </div>
    );
  }

  if (!summary) return null;

  const paymentChart = summary.salesByPayment
    .filter((p) => p.count > 0)
    .map((p) => ({ name: p.label, value: p.count }));

  const paymentTotal = paymentChart.reduce((s, p) => s + p.value, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <FilterBox label="Período">
          <select
            value={datePreset}
            onChange={(e) => onDatePresetChange(e.target.value)}
            className="bg-transparent text-xs outline-none"
          >
            {datePresets.map((p) => (
              <option key={p.id} value={p.id} className="bg-black">
                {p.label}
              </option>
            ))}
          </select>
        </FilterBox>
        <FilterBox label="Conta de anúncio">
          <select
            value={accountId}
            onChange={(e) => onAccountChange(e.target.value)}
            className="max-w-[200px] bg-transparent text-xs outline-none"
          >
            {accounts.map((a) => (
              <option key={a.accountId} value={a.accountId} className="bg-black">
                {a.name}
              </option>
            ))}
          </select>
        </FilterBox>
        <p className="text-[10px] text-muted">
          {summary.period.label} · {summary.paidOrders} vendas aprovadas
        </p>
      </div>

      {/* Linha principal — destaque */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <HeroMetric label="Faturamento Líquido" value={formatBRL(summary.netRevenue)} />
        <HeroMetric label="Gastos com anúncios" value={formatBRL(summary.adSpend)} />
        <HeroMetric
          label="ROAS"
          value={summary.roas != null ? `${summary.roas.toFixed(2)}x` : "N/A"}
          accent
        />
        <HeroMetric
          label="Lucro"
          value={formatBRL(summary.profit)}
          positive={summary.profit >= 0}
        />
      </div>

      {/* Segunda linha */}
      <div className="grid gap-3 lg:grid-cols-6">
        <div className="border border-white/10 p-4 lg:col-span-2">
          <p className="text-[10px] tracking-widest text-muted uppercase">
            Vendas por pagamento
          </p>
          {paymentTotal > 0 ? (
            <div className="mt-3 flex items-center gap-4">
              <div className="h-28 w-28 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentChart}
                      dataKey="value"
                      innerRadius={28}
                      outerRadius={48}
                      paddingAngle={2}
                    >
                      {paymentChart.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#111",
                        border: "1px solid rgba(255,255,255,0.1)",
                        fontSize: 11,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 text-[10px]">
                {summary.salesByPayment.map((p, i) => (
                  <div key={p.method} className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        background: PIE_COLORS[i % PIE_COLORS.length],
                      }}
                    />
                    <span className="text-muted">{p.label}</span>
                    <span className="ml-auto font-medium">{p.count}</span>
                  </div>
                ))}
                <p className="pt-1 text-muted">Total: {paymentTotal}</p>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-center text-xs text-muted">
              Nenhuma venda no período
            </p>
          )}
        </div>

        <MetricCard label="Vendas Pendentes" value={formatBRL(summary.pendingSales)} />
        <MetricCard label="Vendas Reembolsadas" value={formatBRL(summary.refundedSales)} />
        <MetricCard
          label="ROI"
          value={summary.roi != null ? `${summary.roi.toFixed(1)}%` : "N/A"}
        />
        <MetricCard
          label="Margem"
          value={summary.margin != null ? `${summary.margin.toFixed(1)}%` : "N/A"}
        />
        <MetricCard
          label="Chargeback"
          value={`${summary.chargebackRate.toFixed(1)}%`}
        />
      </div>

      {/* Custos */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Custos de Produto" value={formatBRL(summary.productCosts)} />
        <MetricCard
          label="Despesas adicionais"
          value={formatBRL(summary.additionalExpenses)}
        />
        <MetricCard label="Imposto sobre vendas" value={formatBRL(summary.salesTax)} />
        <MetricCard label="Taxas" value={formatBRL(summary.paymentFees)} />
        <MetricCard label="Imposto Meta Ads" value={formatBRL(summary.metaAdsTax)} />
      </div>

      {/* Performance */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <MetricCard
          label="CPA"
          value={summary.cpa != null ? formatBRL(summary.cpa) : "N/A"}
        />
        <MetricCard label="Conversas" value={String(summary.conversations)} />
        <MetricCard
          label="Custo por Conversa"
          value={
            summary.costPerConversation != null
              ? formatBRL(summary.costPerConversation)
              : "N/A"
          }
        />
        <MetricCard
          label="ARPU"
          value={summary.arpu != null ? formatBRL(summary.arpu) : "N/A"}
        />
        <div className="border border-white/10 p-4 lg:col-span-2">
          <p className="text-[10px] tracking-widest text-muted uppercase">
            Taxa de aprovação
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px]">
            {summary.approvalRates.map((r) => (
              <div key={r.method}>
                <p className="text-muted">{r.label}</p>
                <p className="mt-1 text-sm font-medium">
                  {r.rate != null ? `${r.rate.toFixed(0)}%` : "N/A"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leads + listas */}
      <div className="grid gap-3 lg:grid-cols-3">
        <MetricCard label="Leads (Meta)" value={String(summary.leads)} tall />
        <ListCard
          title="Vendas por produto"
          empty="Nenhuma venda por aqui"
          items={summary.salesByProduct.map((p) => ({
            label: p.name,
            value: `${p.count} · ${formatBRL(p.revenue)}`,
          }))}
        />
        <ListCard
          title="Vendas por fonte"
          empty="Nenhuma venda por aqui"
          items={summary.salesBySource.map((s) => ({
            label: s.source,
            value: `${s.count} · ${formatBRL(s.revenue)}`,
          }))}
        />
      </div>

      {/* Métricas Meta extras */}
      <div className="grid gap-3 sm:grid-cols-4">
        <MetricCard label="Impressões" value={formatCount(summary.impressions)} />
        <MetricCard label="Cliques" value={formatCount(summary.clicks)} />
        <MetricCard label="Conversões Meta" value={String(summary.metaConversions)} />
        <MetricCard label="Frete (custo)" value={formatBRL(summary.shippingCosts)} />
      </div>
    </div>
  );
}

function FilterBox({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 border border-white/10 px-3 py-2">
      <span className="text-[10px] text-muted uppercase">{label}</span>
      {children}
    </div>
  );
}

function HeroMetric({
  label,
  value,
  accent,
  positive,
}: {
  label: string;
  value: string;
  accent?: boolean;
  positive?: boolean;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-5">
      <p className="text-[10px] tracking-widest text-muted uppercase">{label}</p>
      <p
        className={`mt-2 font-serif text-3xl italic ${
          accent
            ? "text-accent"
            : positive === false
              ? "text-red-400"
              : positive === true
                ? "text-emerald-400"
                : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  tall,
}: {
  label: string;
  value: string;
  tall?: boolean;
}) {
  return (
    <div
      className={`border border-white/10 p-4 ${tall ? "flex flex-col justify-center" : ""}`}
    >
      <p className="text-[10px] tracking-widest text-muted uppercase">{label}</p>
      <p className={`font-medium text-white ${tall ? "mt-3 text-2xl" : "mt-2 text-lg"}`}>
        {value}
      </p>
    </div>
  );
}

function ListCard({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: { label: string; value: string }[];
}) {
  return (
    <div className="border border-white/10 p-4">
      <p className="text-[10px] tracking-widest text-muted uppercase">{title}</p>
      {items.length === 0 ? (
        <p className="mt-6 text-center text-xs text-muted">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li
              key={item.label}
              className="flex items-start justify-between gap-2 text-xs"
            >
              <span className="truncate text-muted">{item.label}</span>
              <span className="shrink-0 font-medium">{item.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatCount(n: number): string {
  return n.toLocaleString("pt-BR");
}
