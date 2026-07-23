"use client";

import { useMemo } from "react";
import { AffiliateTierBadge } from "@/components/affiliates/AffiliateTierBadge";
import { tierProgress } from "@/lib/affiliates/tier-progress";
import type { Affiliate, AffiliateSale } from "@/lib/affiliates/types";

function monthStart(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function monthlySalesByAffiliate(sales: AffiliateSale[]): Map<string, number> {
  const start = monthStart();
  const map = new Map<string, number>();
  for (const s of sales) {
    if (s.status !== "approved" || !s.confirmedAt) continue;
    if (new Date(s.confirmedAt) < start) continue;
    map.set(s.affiliateId, (map.get(s.affiliateId) ?? 0) + 1);
  }
  return map;
}

export function AffiliateAdminProgressList({
  affiliates,
  sales,
}: {
  affiliates: Affiliate[];
  sales: AffiliateSale[];
}) {
  const salesMap = useMemo(() => monthlySalesByAffiliate(sales), [sales]);

  if (affiliates.length === 0) {
    return (
      <p className="rounded-lg border border-white/10 p-6 text-center text-sm text-muted">
        Nenhum afiliado cadastrado.
      </p>
    );
  }

  return (
    <section className="rounded-lg border border-white/10 bg-white/2 p-6">
      <div className="mb-5">
        <h2 className="text-sm font-medium">Progresso de tier</h2>
        <p className="mt-1 text-xs text-muted">
          Vendas aprovadas neste mês · recalculado no dia 1º
        </p>
      </div>

      <div className="space-y-4">
        {affiliates.map((affiliate) => {
          const monthly = salesMap.get(affiliate.id) ?? 0;
          const progress = tierProgress(affiliate.tier, monthly);

          return (
            <div
              key={affiliate.id}
              className="rounded-lg border border-white/8 bg-black/30 px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{affiliate.name}</p>
                  <p className="truncate text-xs text-muted">{affiliate.email}</p>
                </div>
                <AffiliateTierBadge tier={affiliate.tier} />
              </div>

              {progress.next ? (
                <>
                  <div className="mt-3 mb-1.5 flex justify-between text-[10px] uppercase tracking-widest text-muted">
                    <span>{progress.current.label}</span>
                    <span>{progress.next.label}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress.progressPercent}%`,
                        background: `linear-gradient(90deg, ${progress.current.theme.accent}, ${progress.next.theme.accent})`,
                        boxShadow: `0 0 10px ${progress.current.theme.glow}`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {monthly} vendas este mês · faltam{" "}
                    <strong className="text-white">{progress.salesToNext}</strong> para{" "}
                    {progress.next.label} ({progress.next.percent}%)
                  </p>
                </>
              ) : (
                <>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full w-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${progress.current.theme.bodyMid}, ${progress.current.theme.accent})`,
                        boxShadow: `0 0 10px ${progress.current.theme.glow}`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {monthly} vendas este mês · tier máximo ({progress.current.percent}%)
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
