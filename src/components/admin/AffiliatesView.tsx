"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react";
import { AffiliateTierBadge } from "@/components/affiliates/AffiliateTierBadge";
import { AffiliateAdminProgressList } from "@/components/admin/AffiliateAdminProgressList";
import type {
  Affiliate,
  AffiliatePayout,
  AffiliateSale,
  AffiliateStatus,
} from "@/lib/affiliates/types";

type Tab = "affiliates" | "sales" | "payouts";

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function statusBadge(status: AffiliateStatus | string) {
  const map: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-300",
    approved: "bg-green-500/20 text-green-300",
    blocked: "bg-red-500/20 text-red-300",
    cancelled: "bg-red-500/20 text-red-300",
    review: "bg-orange-500/20 text-orange-300",
    sent: "bg-blue-500/20 text-blue-300",
  };
  return map[status] ?? "bg-white/10 text-muted";
}

export function AffiliatesView() {
  const [tab, setTab] = useState<Tab>("affiliates");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [sales, setSales] = useState<AffiliateSale[]>([]);
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([]);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/affiliates");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAffiliates(data.affiliates ?? []);
      setSales(data.sales ?? []);
      setPayouts(data.payouts ?? []);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (id: string, status: AffiliateStatus) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/affiliates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar.");
      await load();
      setMessage(`Status atualizado para ${status}.`);
    } catch {
      setMessage("Erro ao atualizar afiliado.");
    } finally {
      setActionLoading(false);
    }
  };

  const runPayouts = async () => {
    if (!confirm("Registrar pagamentos PIX para todos com saldo > 0?")) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/affiliates/payouts", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(
        `Pagamentos registrados: ${data.processed} afiliados, ${money(data.totalAmount)}.`
      );
      await load();
    } catch {
      setMessage("Erro ao processar pagamentos.");
    } finally {
      setActionLoading(false);
    }
  };

  const runCron = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/affiliates/cron", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(
        `Cron: ${data.tiers ?? 0} tiers atualizados, ${data.approved ?? 0} aprovados automaticamente.`
      );
      await load();
    } catch {
      setMessage("Erro no cron.");
    } finally {
      setActionLoading(false);
    }
  };

  const totals = {
    affiliates: affiliates.length,
    pending: affiliates.filter((a) => a.status === "pending").length,
    balance: affiliates.reduce((s, a) => s + a.balanceAvailable, 0),
    sales: sales.filter((s) => s.status === "approved").length,
    revenue: sales
      .filter((s) => s.status === "approved")
      .reduce((s, r) => s + r.orderTotal, 0),
  };

  const affiliateName = (id: string) =>
    affiliates.find((a) => a.id === id)?.name ?? id.slice(0, 8);

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl italic">Afiliados</h1>
          <p className="mt-1 text-sm text-muted">
            Cookie → checkout → comissão → PIX semanal
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => void load()}
            disabled={loading}
            className="flex items-center gap-2 rounded border border-white/10 px-3 py-2 text-xs hover:bg-white/5"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Atualizar
          </button>
          <button
            onClick={() => void runCron()}
            disabled={actionLoading}
            className="rounded border border-white/10 px-3 py-2 text-xs hover:bg-white/5"
          >
            Cron (tiers + auto-aprovar)
          </button>
          <button
            onClick={() => void runPayouts()}
            disabled={actionLoading}
            className="flex items-center gap-2 rounded bg-accent px-3 py-2 text-xs text-black"
          >
            <Wallet size={14} />
            Pagar saldos (PIX)
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded border border-white/10 bg-white/5 px-4 py-3 text-sm">
          {message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Afiliados", value: totals.affiliates, icon: Users },
          { label: "Pendentes aprovação", value: totals.pending, icon: CheckCircle2 },
          { label: "Saldo a pagar", value: money(totals.balance), icon: Wallet },
          { label: "Vendas aprovadas", value: totals.sales, icon: CheckCircle2 },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-lg border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="flex items-center gap-2 text-muted">
                <Icon size={14} />
                <span className="text-[10px] uppercase tracking-widest">{kpi.label}</span>
              </div>
              <p className="mt-2 text-2xl font-light">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-2">
        {(
          [
            { id: "affiliates", label: "Afiliados" },
            { id: "sales", label: "Vendas" },
            { id: "payouts", label: "Pagamentos" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm ${
              tab === t.id ? "border-b-2 border-accent text-accent" : "text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-muted" />
        </div>
      ) : tab === "affiliates" ? (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-white/10 text-[10px] uppercase tracking-widest text-muted">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">Código</th>
                <th className="p-3">Tier</th>
                <th className="p-3">Comissão</th>
                <th className="p-3">Cliques</th>
                <th className="p-3">Saldo</th>
                <th className="p-3">Status</th>
                <th className="p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-white/5 transition hover:bg-white/4"
                >
                  <td className="p-3">
                    <div>{a.name}</div>
                    <div className="text-xs text-muted">{a.email}</div>
                  </td>
                  <td className="p-3 font-mono text-xs">{a.uniqueCode}</td>
                  <td className="p-3">
                    <AffiliateTierBadge tier={a.tier} />
                  </td>
                  <td className="p-3">{a.commissionPercent}%</td>
                  <td className="p-3">{a.clicksCount}</td>
                  <td className="p-3">{money(a.balanceAvailable)}</td>
                  <td className="p-3">
                    <span className={`rounded px-2 py-0.5 text-xs ${statusBadge(a.status)}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {a.status !== "approved" && (
                        <button
                          onClick={() => void updateStatus(a.id, "approved")}
                          disabled={actionLoading}
                          className="rounded bg-green-500/20 px-2 py-1 text-xs text-green-300"
                        >
                          Aprovar
                        </button>
                      )}
                      {a.status !== "blocked" && (
                        <button
                          onClick={() => void updateStatus(a.id, "blocked")}
                          disabled={actionLoading}
                          className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-300"
                        >
                          Bloquear
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : tab === "sales" ? (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-white/10 text-[10px] uppercase tracking-widest text-muted">
              <tr>
                <th className="p-3">Pedido</th>
                <th className="p-3">Afiliado</th>
                <th className="p-3">Total</th>
                <th className="p-3">Comissão</th>
                <th className="p-3">Status</th>
                <th className="p-3">Flags</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="border-b border-white/5">
                  <td className="p-3 font-mono text-xs">{s.orderId}</td>
                  <td className="p-3">{affiliateName(s.affiliateId)}</td>
                  <td className="p-3">{money(s.orderTotal)}</td>
                  <td className="p-3">{money(s.commissionNet)}</td>
                  <td className="p-3">
                    <span className={`rounded px-2 py-0.5 text-xs ${statusBadge(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-muted">
                    {s.fraudFlags.length ? s.fraudFlags.join(", ") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-[10px] uppercase tracking-widest text-muted">
              <tr>
                <th className="p-3">Afiliado</th>
                <th className="p-3">Valor</th>
                <th className="p-3">PIX</th>
                <th className="p-3">Status</th>
                <th className="p-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="p-3">{affiliateName(p.affiliateId)}</td>
                  <td className="p-3">{money(p.amount)}</td>
                  <td className="p-3 font-mono text-xs">{p.pixKey}</td>
                  <td className="p-3">
                    <span className={`rounded px-2 py-0.5 text-xs ${statusBadge(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-muted">
                    {new Date(p.createdAt).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "affiliates" && !loading && (
        <AffiliateAdminProgressList affiliates={affiliates} sales={sales} />
      )}
    </div>
  );
}
