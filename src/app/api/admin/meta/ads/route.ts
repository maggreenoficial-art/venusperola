import { NextResponse } from "next/server";
import { getSelectedMetaAdAccount } from "@/lib/db/meta-ads";
import {
  fetchMetaAdInsights,
  fetchMetaAdsFromApi,
  isMetaSystemTokenConfigured,
  MetaMarketingApiError,
  metricsFromInsight,
} from "@/lib/meta-marketing-api";
import type { MetaAdsAd } from "@/lib/meta-ads-types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const adSetId = searchParams.get("adSetId") ?? undefined;
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

    const [apiAds, insights] = await Promise.all([
      fetchMetaAdsFromApi(account.accountId, adSetId),
      fetchMetaAdInsights(account.accountId, datePreset, adSetId),
    ]);

    const insightMap = new Map(
      insights.filter((i) => i.ad_id).map((i) => [i.ad_id!, i])
    );

    const ads: MetaAdsAd[] = apiAds.map((ad) => {
      const metrics = metricsFromInsight(insightMap.get(ad.id));
      return {
        id: ad.id,
        adSetId: ad.adset_id ?? "",
        name: ad.name,
        status: ad.status,
        effectiveStatus: ad.effective_status ?? null,
        creativeName: ad.creative?.name ?? null,
        thumbnailUrl: ad.creative?.thumbnail_url ?? null,
        spend: metrics.spend,
        impressions: metrics.impressions,
        clicks: metrics.clicks,
        conversions: metrics.conversions,
        cpa: metrics.cpa,
        updatedAt: ad.updated_time ?? null,
      };
    });

    return NextResponse.json({
      accountId: account.accountId,
      adSetId: adSetId ?? null,
      ads,
      datePreset,
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    const msg =
      err instanceof MetaMarketingApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Erro ao carregar anúncios.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
