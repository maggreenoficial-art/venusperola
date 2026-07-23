"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Loader2, LogOut } from "lucide-react";
import { AffiliateTiersPanel } from "@/components/affiliates/AffiliateTiersPanel";
import { AffiliateVenusPlanet } from "@/components/affiliates/AffiliateVenusPlanet";
import { tierConfigById } from "@/lib/affiliates/tiers";
import type { AffiliateDashboard } from "@/lib/affiliates/types";

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function AffiliateDashboardView() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<AffiliateDashboard | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/affiliates/me");
      if (res.status === 401) {
        router.push("/afiliados/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDashboard(data.dashboard);
    } catch {
      router.push("/afiliados/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const logout = async () => {
    await fetch("/api/affiliates/logout", { method: "DELETE" });
    router.push("/afiliados/login");
  };

  const copyLink = async () => {
    if (!dashboard) return;
    await navigator.clipboard.writeText(dashboard.affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-muted" />
      </div>
    );
  }

  if (!dashboard) return null;

  const { affiliate } = dashboard;
  const tierTheme = tierConfigById(affiliate.tier).theme;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-50 transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 0%, ${tierTheme.glow}, transparent 70%)`,
        }}
      />

      <div className="relative mx-auto max-w-4xl space-y-8 px-4 py-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="hidden sm:block">
              <AffiliateVenusPlanet theme={tierTheme} size={72} />
            </div>
            <div>
              <h1 className="font-serif text-3xl italic">Olá, {affiliate.name}!</h1>
              <p
                className="mt-1 text-sm capitalize"
                style={{ color: tierTheme.accent }}
              >
                Tier {affiliate.tier} · {affiliate.commissionPercent}% de comissão
              </p>
            </div>
          </div>
          <button
            onClick={() => void logout()}
            className="flex items-center gap-2 text-xs text-muted hover:text-white"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>

        <AffiliateTiersPanel
          variant="dashboard"
          currentTier={affiliate.tier}
          monthlySales={dashboard.monthlySales}
        />

        <div className="rounded-lg border border-white/10 bg-white/2 p-6">
          <p className="text-xs uppercase tracking-widest text-muted">Seu link de afiliado</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="flex-1 break-all rounded bg-black px-3 py-2 text-sm">
              {dashboard.affiliateLink}
            </code>
            <button
              onClick={() => void copyLink()}
              className="flex items-center gap-2 rounded border border-white/10 px-3 py-2 text-xs hover:bg-white/5"
            >
              <Copy size={14} />
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">
            Código: <strong>{affiliate.uniqueCode}</strong> · Cookie válido por 90 dias
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Cliques", value: dashboard.totalClicks.toLocaleString("pt-BR") },
            { label: "Vendas", value: dashboard.totalSales },
            {
              label: "Conversão",
              value: `${dashboard.conversionRate.toFixed(1)}%`,
            },
            { label: "Receita gerada", value: money(dashboard.totalRevenue) },
            { label: "Sua comissão", value: money(dashboard.totalCommission) },
            { label: "Saldo disponível", value: money(affiliate.balanceAvailable) },
            { label: "Comissão pendente", value: money(dashboard.pendingCommission) },
            { label: "Total recebido", value: money(dashboard.paidCommission) },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-lg border border-white/10 bg-white/2 p-4"
            >
              <p className="text-[10px] uppercase tracking-widest text-muted">{kpi.label}</p>
              <p className="mt-2 text-xl font-light">{kpi.value}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-sm font-medium">Últimas vendas</h2>
          <div className="mt-4 overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-[10px] uppercase tracking-widest text-muted">
                <tr>
                  <th className="p-3">Pedido</th>
                  <th className="p-3">Valor</th>
                  <th className="p-3">Comissão</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentSales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted">
                      Nenhuma venda ainda. Compartilhe seu link!
                    </td>
                  </tr>
                ) : (
                  dashboard.recentSales.map((s) => (
                    <tr key={s.id} className="border-b border-white/5">
                      <td className="p-3 font-mono text-xs">{s.orderId}</td>
                      <td className="p-3">{money(s.orderTotal)}</td>
                      <td className="p-3">{money(s.commissionNet)}</td>
                      <td className="p-3 capitalize">{s.status}</td>
                      <td className="p-3 text-xs text-muted">
                        {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-xs text-muted">
          Pagamentos via PIX toda sexta-feira ·{" "}
          <Link href="/loja" className="text-accent underline">
            Ver loja
          </Link>
        </p>
      </div>
    </div>
  );
}
