export type AffiliateStatus = "pending" | "approved" | "blocked";

export type AffiliateTier =
  | "iniciante"
  | "bronze"
  | "prata"
  | "ouro"
  | "platina";

export type AffiliateSaleStatus =
  | "pending"
  | "approved"
  | "cancelled"
  | "review";

export type PayoutStatus = "pending" | "sent" | "confirmed";

export interface Affiliate {
  id: string;
  uniqueCode: string;
  name: string;
  email: string;
  cpf?: string;
  pixKey: string;
  socialProfile?: string;
  commissionPercent: number;
  tier: AffiliateTier;
  status: AffiliateStatus;
  balanceAvailable: number;
  totalPaid: number;
  clicksCount: number;
  cancelledSalesCount: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
}

export interface AffiliateClick {
  id: string;
  affiliateId: string;
  ipHash: string;
  userAgent?: string;
  referer?: string;
  utmSource?: string;
  counted: boolean;
  createdAt: string;
}

export interface AffiliateSale {
  id: string;
  affiliateId: string;
  orderId: string;
  orderTotal: number;
  commissionPercent: number;
  commissionGross: number;
  commissionNet: number;
  status: AffiliateSaleStatus;
  fraudFlags: string[];
  createdAt: string;
  confirmedAt?: string;
}

export interface AffiliatePayout {
  id: string;
  affiliateId: string;
  amount: number;
  pixKey: string;
  status: PayoutStatus;
  notes?: string;
  createdAt: string;
}

export interface AffiliateDashboard {
  affiliate: Affiliate;
  totalClicks: number;
  totalSales: number;
  monthlySales: number;
  conversionRate: number;
  totalRevenue: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
  recentSales: AffiliateSale[];
  affiliateLink: string;
}

export interface RegisterAffiliateInput {
  name: string;
  email: string;
  cpf?: string;
  pixKey: string;
  socialProfile?: string;
  password: string;
}
