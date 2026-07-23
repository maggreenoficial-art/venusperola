import type {
  MetaApiAdAccount,
  MetaApiAd,
  MetaApiAdSet,
  MetaApiCampaign,
  MetaApiInsight,
  MetaEntityMetrics,
} from "@/lib/meta-ads-types";

const API_VERSION = process.env.META_API_VERSION?.trim() || "v19.0";
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

export class MetaMarketingApiError extends Error {
  code?: number;
  type?: string;

  constructor(message: string, code?: number, type?: string) {
    super(message);
    this.name = "MetaMarketingApiError";
    this.code = code;
    this.type = type;
  }
}

export function getMetaSystemUserToken(): string | null {
  return process.env.META_SYSTEM_USER_TOKEN?.trim() || null;
}

export function isMetaSystemTokenConfigured(): boolean {
  return Boolean(getMetaSystemUserToken());
}

async function metaFetch<T>(pathOrUrl: string): Promise<T> {
  const token = getMetaSystemUserToken();
  if (!token) {
    throw new MetaMarketingApiError(
      "META_SYSTEM_USER_TOKEN não configurado no servidor."
    );
  }

  const url = pathOrUrl.startsWith("http")
    ? pathOrUrl
    : `${BASE_URL}/${pathOrUrl.replace(/^\//, "")}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const json = (await res.json()) as T & {
    error?: { message: string; code?: number; type?: string };
  };

  if (!res.ok || json.error) {
    throw new MetaMarketingApiError(
      json.error?.message ?? `Erro na Meta API (${res.status})`,
      json.error?.code,
      json.error?.type
    );
  }

  return json;
}

async function paginate<T>(
  initialPath: string
): Promise<T[]> {
  const items: T[] = [];
  let next: string | null = initialPath;

  while (next) {
    type Page = { data: T[]; paging?: { next?: string } };
    const page: Page = await metaFetch<Page>(next);
    items.push(...(page.data ?? []));
    next = page.paging?.next ?? null;
  }

  return items;
}

function toActId(adAccountId: string): string {
  return adAccountId.startsWith("act_") ? adAccountId : `act_${adAccountId}`;
}

function encodeFiltering(
  filters: { field: string; operator: string; value: string }[]
): string {
  return encodeURIComponent(JSON.stringify(filters));
}

export function metricsFromInsight(
  insight?: MetaApiInsight
): MetaEntityMetrics {
  const spend = insight?.spend ? Number(insight.spend) : 0;
  const impressions = insight?.impressions ? Number(insight.impressions) : 0;
  const clicks = insight?.clicks ? Number(insight.clicks) : 0;
  const conversions = extractConversions(insight?.actions);
  return {
    spend,
    impressions,
    clicks,
    conversions,
    cpa: conversions > 0 ? spend / conversions : null,
  };
}

export async function fetchMetaAdAccountsFromApi(): Promise<MetaApiAdAccount[]> {
  return paginate<MetaApiAdAccount>(
    "me/adaccounts?fields=id,account_id,name,currency,account_status,timezone_name,amount_spent,balance,disable_reason&limit=100"
  );
}

export async function fetchMetaCampaignsFromApi(
  adAccountId: string
): Promise<MetaApiCampaign[]> {
  const actId = toActId(adAccountId);
  return paginate<MetaApiCampaign>(
    `${actId}/campaigns?fields=id,name,status,effective_status,objective,daily_budget,lifetime_budget,updated_time&limit=100`
  );
}

export async function fetchMetaAdSetsFromApi(
  adAccountId: string,
  campaignId?: string
): Promise<MetaApiAdSet[]> {
  const fields =
    "id,name,status,effective_status,campaign_id,daily_budget,lifetime_budget,optimization_goal,updated_time";

  if (campaignId) {
    return paginate<MetaApiAdSet>(
      `${campaignId}/adsets?fields=${fields}&limit=100`
    );
  }

  const actId = toActId(adAccountId);
  return paginate<MetaApiAdSet>(`${actId}/adsets?fields=${fields}&limit=100`);
}

export async function fetchMetaAdsFromApi(
  adAccountId: string,
  adSetId?: string
): Promise<MetaApiAd[]> {
  const fields =
    "id,name,status,effective_status,adset_id,updated_time,creative{id,name,thumbnail_url}";

  if (adSetId) {
    return paginate<MetaApiAd>(`${adSetId}/ads?fields=${fields}&limit=100`);
  }

  const actId = toActId(adAccountId);
  return paginate<MetaApiAd>(`${actId}/ads?fields=${fields}&limit=100`);
}

export async function fetchMetaCampaignInsights(
  adAccountId: string,
  datePreset: string = "today"
): Promise<MetaApiInsight[]> {
  const actId = toActId(adAccountId);
  return paginate<MetaApiInsight>(
    `${actId}/insights?level=campaign&fields=campaign_id,spend,impressions,clicks,actions&date_preset=${datePreset}&limit=500`
  );
}

export async function fetchMetaAdSetInsights(
  adAccountId: string,
  datePreset: string = "today",
  campaignId?: string
): Promise<MetaApiInsight[]> {
  const actId = toActId(adAccountId);
  let path = `${actId}/insights?level=adset&fields=adset_id,spend,impressions,clicks,actions&date_preset=${datePreset}&limit=500`;
  if (campaignId) {
    path += `&filtering=${encodeFiltering([
      { field: "campaign.id", operator: "EQUAL", value: campaignId },
    ])}`;
  }
  return paginate<MetaApiInsight>(path);
}

export async function fetchMetaAdInsights(
  adAccountId: string,
  datePreset: string = "today",
  adSetId?: string
): Promise<MetaApiInsight[]> {
  const actId = toActId(adAccountId);
  let path = `${actId}/insights?level=ad&fields=ad_id,spend,impressions,clicks,actions&date_preset=${datePreset}&limit=500`;
  if (adSetId) {
    path += `&filtering=${encodeFiltering([
      { field: "adset.id", operator: "EQUAL", value: adSetId },
    ])}`;
  }
  return paginate<MetaApiInsight>(path);
}

export async function updateMetaObjectStatus(
  objectId: string,
  status: "ACTIVE" | "PAUSED"
): Promise<void> {
  const token = getMetaSystemUserToken();
  if (!token) {
    throw new MetaMarketingApiError("META_SYSTEM_USER_TOKEN não configurado.");
  }

  const url = `${BASE_URL}/${objectId}`;
  const body = new URLSearchParams({ status });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  });

  const json = (await res.json()) as {
    success?: boolean;
    error?: { message: string };
  };
  if (!res.ok || json.error) {
    throw new MetaMarketingApiError(
      json.error?.message ?? `Erro ao atualizar status (${res.status})`
    );
  }
}

export async function updateMetaCampaignStatus(
  campaignId: string,
  status: "ACTIVE" | "PAUSED"
): Promise<void> {
  return updateMetaObjectStatus(campaignId, status);
}

export async function updateMetaCampaignDailyBudget(
  campaignId: string,
  dailyBudgetCents: number
): Promise<void> {
  const token = getMetaSystemUserToken();
  if (!token) {
    throw new MetaMarketingApiError("META_SYSTEM_USER_TOKEN não configurado.");
  }

  const url = `${BASE_URL}/${campaignId}`;
  const body = new URLSearchParams({
    daily_budget: String(dailyBudgetCents),
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  });

  const json = (await res.json()) as { success?: boolean; error?: { message: string } };
  if (!res.ok || json.error) {
    throw new MetaMarketingApiError(
      json.error?.message ?? `Erro ao atualizar orçamento (${res.status})`
    );
  }
}

export function parseMetaMoney(value?: string | null): number {
  if (!value) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n / 100 : 0;
}

export function extractConversions(
  actions?: { action_type: string; value: string }[]
): number {
  if (!actions?.length) return 0;
  const purchase = actions.find(
    (a) =>
      a.action_type === "purchase" ||
      a.action_type === "offsite_conversion.fb_pixel_purchase" ||
      a.action_type === "omni_purchase"
  );
  if (purchase) return Number(purchase.value) || 0;
  const lead = actions.find((a) => a.action_type === "lead");
  return lead ? Number(lead.value) || 0 : 0;
}

export function extractLeads(
  actions?: { action_type: string; value: string }[]
): number {
  if (!actions?.length) return 0;
  const types = ["lead", "onsite_conversion.lead_grouped"];
  const match = actions.find((a) => types.includes(a.action_type));
  return match ? Number(match.value) || 0 : 0;
}

export function extractConversations(
  actions?: { action_type: string; value: string }[]
): number {
  if (!actions?.length) return 0;
  const types = [
    "onsite_conversion.messaging_conversation_started_7d",
    "onsite_conversion.messaging_first_reply",
    "onsite_conversion.total_messaging_connection",
  ];
  let total = 0;
  for (const a of actions) {
    if (types.some((t) => a.action_type.includes("messaging"))) {
      total += Number(a.value) || 0;
    }
  }
  return total;
}

export async function fetchMetaAccountInsights(
  adAccountId: string,
  datePreset: string = "today"
): Promise<MetaApiInsight | null> {
  const actId = toActId(adAccountId);
  const result = await metaFetch<{ data: MetaApiInsight[] }>(
    `${actId}/insights?fields=spend,impressions,clicks,actions,reach&date_preset=${datePreset}`
  );
  return result.data?.[0] ?? null;
}
