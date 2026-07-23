import { NextResponse } from "next/server";
import { getSelectedMetaAdAccount } from "@/lib/db/meta-ads";
import {
  fetchMetaAdSetInsights,
  fetchMetaAdSetsFromApi,
  isMetaSystemTokenConfigured,
  MetaMarketingApiError,
  metricsFromInsight,
  parseMetaMoney,
} from "@/lib/meta-marketing-api";
import type { MetaAdsAdSet } from "@/lib/meta-ads-types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const campaignId = searchParams.get("campaignId") ?? undefined;
    const datePreset = searchParams.get("datePreset") ?? "today";

    if (!isMetaSystemTokenConfigured()) {
      return NextResponse.json(
        { error: "META_SYSTEM_USER_TOKEN não configurado." },
        { status: 400 }
      );
    }

    const account =
      accountId != null
        ? { accountId }
        : await getSelectedMetaAdAccount();

    if (!account) {
      return NextResponse.json(
        { error: "Nenhuma conta de anúncio encontrada." },
        { status: 400 }
      );
    }

    const [apiAdSets, insights] = await Promise.all([
      fetchMetaAdSetsFromApi(account.accountId, campaignId),
      fetchMetaAdSetInsights(account.accountId, datePreset, campaignId),
    ]);

    const insightMap = new Map(
      insights.filter((i) => i.adset_id).map((i) => [i.adset_id!, i])
    );

    const adSets: MetaAdsAdSet[] = apiAdSets.map((adSet) => {
      const metrics = metricsFromInsight(insightMap.get(adSet.id));
      return {
        id: adSet.id,
        campaignId: adSet.campaign_id ?? "",
        name: adSet.name,
        status: adSet.status,
        effectiveStatus: adSet.effective_status ?? null,
        optimizationGoal: adSet.optimization_goal ?? null,
        dailyBudget: adSet.daily_budget
          ? parseMetaMoney(adSet.daily_budget)
          : null,
        lifetimeBudget: adSet.lifetime_budget
          ? parseMetaMoney(adSet.lifetime_budget)
          : null,
        spend: metrics.spend,
        impressions: metrics.impressions,
        clicks: metrics.clicks,
        conversions: metrics.conversions,
        cpa: metrics.cpa,
        updatedAt: adSet.updated_time ?? null,
      };
    });

    return NextResponse.json({
      accountId: account.accountId,
      campaignId: campaignId ?? null,
      adSets,
      datePreset,
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    const msg =
      err instanceof MetaMarketingApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Erro ao carregar conjuntos.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
