export type MetaCampaignStatus =
  | "ACTIVE"
  | "PAUSED"
  | "DELETED"
  | "ARCHIVED"
  | string;

export interface MetaAdAccount {
  id: string;
  accountId: string;
  name: string;
  currency: string | null;
  accountStatus: number | null;
  timezoneName: string | null;
  amountSpent: number;
  balance: number;
  disableReason: string | null;
  isSelected: boolean;
  syncedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface MetaAdsCampaign {
  id: string;
  adAccountId: string;
  name: string;
  status: MetaCampaignStatus;
  effectiveStatus: string | null;
  objective: string | null;
  dailyBudget: number | null;
  lifetimeBudget: number | null;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpa: number | null;
  syncedAt: string;
  updatedAt: string;
}

export interface MetaAdsAdSet {
  id: string;
  campaignId: string;
  campaignName?: string;
  name: string;
  status: MetaCampaignStatus;
  effectiveStatus: string | null;
  optimizationGoal: string | null;
  dailyBudget: number | null;
  lifetimeBudget: number | null;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpa: number | null;
  updatedAt: string | null;
}

export interface MetaAdsAd {
  id: string;
  adSetId: string;
  adSetName?: string;
  campaignId?: string;
  campaignName?: string;
  name: string;
  status: MetaCampaignStatus;
  effectiveStatus: string | null;
  creativeName: string | null;
  thumbnailUrl: string | null;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpa: number | null;
  updatedAt: string | null;
}

export interface MetaEntityMetrics {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpa: number | null;
}

export interface MetaApiAdAccount {
  id: string;
  account_id: string;
  name: string;
  currency?: string;
  account_status?: number;
  timezone_name?: string;
  amount_spent?: string;
  balance?: string;
  disable_reason?: string;
}

export interface MetaApiCampaign {
  id: string;
  name: string;
  status: string;
  effective_status?: string;
  objective?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  updated_time?: string;
}

export interface MetaApiInsight {
  campaign_id?: string;
  adset_id?: string;
  ad_id?: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  actions?: { action_type: string; value: string }[];
}

export interface MetaApiAdSet {
  id: string;
  name: string;
  status: string;
  effective_status?: string;
  campaign_id?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  optimization_goal?: string;
  updated_time?: string;
}

export interface MetaApiAd {
  id: string;
  name: string;
  status: string;
  effective_status?: string;
  adset_id?: string;
  updated_time?: string;
  creative?: { id?: string; name?: string; thumbnail_url?: string };
}

export interface MetaConnectionStatus {
  configured: boolean;
  message: string;
}

export const META_UTM_TEMPLATES = {
  facebook: {
    label: "Código de UTMs do Facebook",
    params:
      "utm_source=facebook&utm_medium=cpc&utm_campaign={{campaign.name}}&utm_content={{adset.name}}&utm_term={{ad.name}}",
    separateField: "fbclid",
  },
  taboola: {
    label: "Código de UTMs do Taboola",
    params:
      "utm_source=taboola&utm_medium=referral&utm_campaign={{campaign.name}}&utm_content={{ad.name}}",
    separateField: null,
  },
} as const;
