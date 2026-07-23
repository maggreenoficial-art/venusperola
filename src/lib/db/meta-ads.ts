import { createAdminClient } from "@/lib/supabase/admin";
import {
  extractConversions,
  fetchMetaAdAccountsFromApi,
  fetchMetaCampaignInsights,
  fetchMetaCampaignsFromApi,
  parseMetaMoney,
} from "@/lib/meta-marketing-api";
import type {
  MetaAdAccount,
  MetaAdsCampaign,
} from "@/lib/meta-ads-types";

type AccountRow = {
  id: string;
  account_id: string;
  name: string;
  currency: string | null;
  account_status: number | null;
  timezone_name: string | null;
  amount_spent: number;
  balance: number;
  disable_reason: string | null;
  is_selected: boolean;
  synced_at: string;
  created_at: string;
  updated_at: string;
};

type CampaignRow = {
  id: string;
  ad_account_id: string;
  name: string;
  status: string;
  effective_status: string | null;
  objective: string | null;
  daily_budget: number | null;
  lifetime_budget: number | null;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpa: number | null;
  synced_at: string;
  updated_at: string;
};

function rowToAccount(row: AccountRow): MetaAdAccount {
  return {
    id: row.id,
    accountId: row.account_id,
    name: row.name,
    currency: row.currency,
    accountStatus: row.account_status,
    timezoneName: row.timezone_name,
    amountSpent: Number(row.amount_spent),
    balance: Number(row.balance),
    disableReason: row.disable_reason,
    isSelected: row.is_selected,
    syncedAt: row.synced_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToCampaign(row: CampaignRow): MetaAdsCampaign {
  return {
    id: row.id,
    adAccountId: row.ad_account_id,
    name: row.name,
    status: row.status,
    effectiveStatus: row.effective_status,
    objective: row.objective,
    dailyBudget: row.daily_budget != null ? Number(row.daily_budget) : null,
    lifetimeBudget:
      row.lifetime_budget != null ? Number(row.lifetime_budget) : null,
    spend: Number(row.spend),
    impressions: row.impressions,
    clicks: row.clicks,
    conversions: Number(row.conversions),
    cpa: row.cpa != null ? Number(row.cpa) : null,
    syncedAt: row.synced_at,
    updatedAt: row.updated_at,
  };
}

export async function getMetaAdAccounts(): Promise<MetaAdAccount[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("meta_ad_accounts")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data as AccountRow[]).map(rowToAccount);
}

export async function getSelectedMetaAdAccount(): Promise<MetaAdAccount | null> {
  const accounts = await getMetaAdAccounts();
  return accounts.find((a) => a.isSelected) ?? accounts[0] ?? null;
}

export async function setSelectedMetaAdAccount(
  accountId: string
): Promise<MetaAdAccount> {
  const supabase = createAdminClient();
  await supabase
    .from("meta_ad_accounts")
    .update({ is_selected: false })
    .neq("account_id", accountId);
  const { data, error } = await supabase
    .from("meta_ad_accounts")
    .update({ is_selected: true, updated_at: new Date().toISOString() })
    .eq("account_id", accountId)
    .select("*")
    .single();
  if (error) throw error;
  return rowToAccount(data as AccountRow);
}

export async function syncMetaAdAccounts(): Promise<MetaAdAccount[]> {
  const apiAccounts = await fetchMetaAdAccountsFromApi();
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const existing = await getMetaAdAccounts();
  const selectedId =
    existing.find((a) => a.isSelected)?.accountId ??
    (apiAccounts[0]
      ? apiAccounts[0].id.startsWith("act_")
        ? apiAccounts[0].id
        : `act_${apiAccounts[0].account_id}`
      : undefined);

  for (const account of apiAccounts) {
    const actId = account.id.startsWith("act_")
      ? account.id
      : `act_${account.account_id}`;

    const { error } = await supabase.from("meta_ad_accounts").upsert(
      {
        id: actId,
        account_id: actId,
        name: account.name,
        currency: account.currency ?? null,
        account_status: account.account_status ?? null,
        timezone_name: account.timezone_name ?? null,
        amount_spent: parseMetaMoney(account.amount_spent),
        balance: parseMetaMoney(account.balance),
        disable_reason: account.disable_reason ?? null,
        is_selected: actId === selectedId || account.account_id === selectedId,
        synced_at: now,
        updated_at: now,
      },
      { onConflict: "account_id" }
    );
    if (error) throw error;
  }

  return getMetaAdAccounts();
}

export async function getMetaAdsCampaigns(
  adAccountId?: string
): Promise<MetaAdsCampaign[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from("meta_ads_campaigns")
    .select("*")
    .order("spend", { ascending: false });
  if (adAccountId) {
    query = query.eq("ad_account_id", adAccountId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data as CampaignRow[]).map(rowToCampaign);
}

export async function syncMetaAdsCampaigns(
  adAccountId: string,
  datePreset: string = "today"
): Promise<MetaAdsCampaign[]> {
  const [apiCampaigns, insights] = await Promise.all([
    fetchMetaCampaignsFromApi(adAccountId),
    fetchMetaCampaignInsights(adAccountId, datePreset),
  ]);

  const insightMap = new Map(
    insights
      .filter((i) => i.campaign_id)
      .map((i) => [i.campaign_id!, i])
  );

  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const normalized = adAccountId.startsWith("act_")
    ? adAccountId
    : `act_${adAccountId}`;

  for (const campaign of apiCampaigns) {
    const insight = insightMap.get(campaign.id);
    const spend = insight?.spend ? Number(insight.spend) : 0;
    const impressions = insight?.impressions
      ? Number(insight.impressions)
      : 0;
    const clicks = insight?.clicks ? Number(insight.clicks) : 0;
    const conversions = extractConversions(insight?.actions);
    const cpa = conversions > 0 ? spend / conversions : null;

    const { error } = await supabase.from("meta_ads_campaigns").upsert(
      {
        id: campaign.id,
        ad_account_id: normalized,
        name: campaign.name,
        status: campaign.status,
        effective_status: campaign.effective_status ?? null,
        objective: campaign.objective ?? null,
        daily_budget: campaign.daily_budget
          ? parseMetaMoney(campaign.daily_budget)
          : null,
        lifetime_budget: campaign.lifetime_budget
          ? parseMetaMoney(campaign.lifetime_budget)
          : null,
        spend,
        impressions,
        clicks,
        conversions,
        cpa,
        synced_at: now,
        updated_at: now,
      },
      { onConflict: "id" }
    );
    if (error) throw error;
  }

  return getMetaAdsCampaigns(normalized);
}

export async function updateMetaAdsCampaignLocal(
  campaignId: string,
  patch: Partial<{
    status: string;
    dailyBudget: number;
  }>
): Promise<void> {
  const supabase = createAdminClient();
  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.dailyBudget !== undefined) update.daily_budget = patch.dailyBudget;
  const { error } = await supabase
    .from("meta_ads_campaigns")
    .update(update)
    .eq("id", campaignId);
  if (error) throw error;
}
