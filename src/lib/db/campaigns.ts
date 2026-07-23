import { createAdminClient } from "@/lib/supabase/admin";
import { adminConfig } from "@/lib/admin-config";
import type { MetaCampaign } from "@/lib/dashboard";

export async function getMetaAdsConfig(): Promise<{
  targetRoas: number;
  campaigns: MetaCampaign[];
}> {
  const supabase = createAdminClient();

  const [configRes, campaignsRes] = await Promise.all([
    supabase.from("app_config").select("value").eq("key", "meta_ads").single(),
    supabase.from("meta_campaigns").select("*").order("spend", { ascending: false }),
  ]);

  const targetRoas =
    (configRes.data?.value as { targetRoas?: number } | null)?.targetRoas ??
    adminConfig.targetRoas;

  const campaigns: MetaCampaign[] = (campaignsRes.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    status: c.status as "active" | "paused",
    spend: Number(c.spend),
    impressions: c.impressions,
    clicks: c.clicks,
    conversions: c.conversions,
  }));

  return { targetRoas, campaigns };
}
