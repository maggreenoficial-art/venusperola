import { createAdminClient } from "@/lib/supabase/admin";
import { calcCommission } from "@/lib/affiliates/commission";
import {
  hashIp,
  isAnomalousPrice,
  isSelfPurchase,
  shouldAutoApprove,
} from "@/lib/affiliates/fraud";
import { tierForMonthlySales } from "@/lib/affiliates/tiers";
import type {
  Affiliate,
  AffiliateDashboard,
  AffiliatePayout,
  AffiliateSale,
  AffiliateSaleStatus,
  AffiliateStatus,
  RegisterAffiliateInput,
} from "@/lib/affiliates/types";
import {
  generateUniqueCode,
  hashPassword,
} from "@/lib/affiliates/auth";

type AffiliateRow = {
  id: string;
  unique_code: string;
  name: string;
  email: string;
  cpf: string | null;
  pix_key: string;
  social_profile: string | null;
  password_hash: string;
  commission_percent: number;
  tier: string;
  status: string;
  balance_available: number;
  total_paid: number;
  clicks_count: number;
  cancelled_sales_count: number;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
};

type SaleRow = {
  id: string;
  affiliate_id: string;
  order_id: string;
  order_total: number;
  commission_percent: number;
  commission_gross: number;
  commission_net: number;
  status: string;
  fraud_flags: string[];
  created_at: string;
  confirmed_at: string | null;
};

type PayoutRow = {
  id: string;
  affiliate_id: string;
  amount: number;
  pix_key: string;
  status: string;
  notes: string | null;
  created_at: string;
};

function rowToAffiliate(row: AffiliateRow): Affiliate {
  return {
    id: row.id,
    uniqueCode: row.unique_code,
    name: row.name,
    email: row.email,
    cpf: row.cpf ?? undefined,
    pixKey: row.pix_key,
    socialProfile: row.social_profile ?? undefined,
    commissionPercent: Number(row.commission_percent),
    tier: row.tier as Affiliate["tier"],
    status: row.status as AffiliateStatus,
    balanceAvailable: Number(row.balance_available),
    totalPaid: Number(row.total_paid),
    clicksCount: row.clicks_count,
    cancelledSalesCount: row.cancelled_sales_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    approvedAt: row.approved_at ?? undefined,
  };
}

function rowToSale(row: SaleRow): AffiliateSale {
  return {
    id: row.id,
    affiliateId: row.affiliate_id,
    orderId: row.order_id,
    orderTotal: Number(row.order_total),
    commissionPercent: Number(row.commission_percent),
    commissionGross: Number(row.commission_gross),
    commissionNet: Number(row.commission_net),
    status: row.status as AffiliateSale["status"],
    fraudFlags: row.fraud_flags ?? [],
    createdAt: row.created_at,
    confirmedAt: row.confirmed_at ?? undefined,
  };
}

function rowToPayout(row: PayoutRow): AffiliatePayout {
  return {
    id: row.id,
    affiliateId: row.affiliate_id,
    amount: Number(row.amount),
    pixKey: row.pix_key,
    status: row.status as AffiliatePayout["status"],
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

function affiliateLink(code: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://venusperola.com.br";
  return `${base}/?ref=${code}`;
}

export async function getAffiliateByCode(code: string): Promise<Affiliate | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("affiliates")
    .select("*")
    .eq("unique_code", code.toUpperCase())
    .maybeSingle();
  if (error || !data) return null;
  return rowToAffiliate(data as AffiliateRow);
}

export async function getAffiliateById(id: string): Promise<Affiliate | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("affiliates")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return rowToAffiliate(data as AffiliateRow);
}

export async function getAffiliateByEmail(email: string): Promise<Affiliate | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("affiliates")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (error || !data) return null;
  return rowToAffiliate(data as AffiliateRow);
}

export async function getAffiliatePasswordHash(
  affiliateId: string
): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("affiliates")
    .select("password_hash")
    .eq("id", affiliateId)
    .maybeSingle();
  if (error || !data) return null;
  return (data as { password_hash: string }).password_hash;
}

export async function listAffiliates(): Promise<Affiliate[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("affiliates")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as AffiliateRow[]).map(rowToAffiliate);
}

export async function registerAffiliate(
  input: RegisterAffiliateInput
): Promise<{ affiliate: Affiliate; tempPassword?: string }> {
  const supabase = createAdminClient();
  const existing = await getAffiliateByEmail(input.email);
  if (existing) throw new Error("E-mail já cadastrado.");

  let code = generateUniqueCode(input.name);
  for (let i = 0; i < 5; i++) {
    const taken = await getAffiliateByCode(code);
    if (!taken) break;
    code = generateUniqueCode(input.name);
  }

  const autoApprove = shouldAutoApprove(input.socialProfile);
  const status: AffiliateStatus = autoApprove ? "approved" : "pending";
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("affiliates")
    .insert({
      unique_code: code,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      cpf: input.cpf?.replace(/\D/g, "") || null,
      pix_key: input.pixKey.trim(),
      social_profile: input.socialProfile?.trim() || null,
      password_hash: hashPassword(input.password),
      commission_percent: 15,
      tier: "iniciante",
      status,
      approved_at: autoApprove ? now : null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return { affiliate: rowToAffiliate(data as AffiliateRow) };
}

export async function updateAffiliateStatus(
  id: string,
  status: AffiliateStatus
): Promise<Affiliate | null> {
  const supabase = createAdminClient();
  const patch: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === "approved") {
    patch.approved_at = new Date().toISOString();
  }
  const { data, error } = await supabase
    .from("affiliates")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) return null;
  return rowToAffiliate(data as AffiliateRow);
}

export async function trackAffiliateClick(params: {
  code: string;
  ip: string;
  userAgent?: string;
  referer?: string;
  utmSource?: string;
}): Promise<boolean> {
  const affiliate = await getAffiliateByCode(params.code);
  if (!affiliate || affiliate.status !== "approved") return false;

  const supabase = createAdminClient();
  const ipHash = hashIp(params.ip);
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("affiliate_clicks")
    .select("*", { count: "exact", head: true })
    .eq("affiliate_id", affiliate.id)
    .eq("ip_hash", ipHash)
    .gte("created_at", dayStart.toISOString());

  const suspicious = (count ?? 0) >= 50;
  const counted = !suspicious;

  await supabase.from("affiliate_clicks").insert({
    affiliate_id: affiliate.id,
    ip_hash: ipHash,
    user_agent: params.userAgent ?? null,
    referer: params.referer ?? null,
    utm_source: params.utmSource ?? null,
    counted,
  });

  if (counted) {
    await supabase
      .from("affiliates")
      .update({
        clicks_count: affiliate.clicksCount + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", affiliate.id);
  }

  return counted;
}

export async function attributeOrderToAffiliate(params: {
  orderId: string;
  orderTotal: number;
  affiliateCode: string;
  customerEmail: string;
  customerCpf?: string;
  averageItemPrice: number;
}): Promise<AffiliateSale | null> {
  const affiliate = await getAffiliateByCode(params.affiliateCode);
  if (!affiliate || affiliate.status !== "approved") return null;

  const supabase = createAdminClient();
  const fraudFlags: string[] = [];
  let status: AffiliateSaleStatus = "pending";
  let commissionNet = 0;
  let commissionGross = 0;

  if (
    isSelfPurchase(
      affiliate.email,
      affiliate.cpf,
      params.customerEmail,
      params.customerCpf
    )
  ) {
    fraudFlags.push("self_purchase");
    status = "review";
    commissionGross = 0;
    commissionNet = 0;
  } else if (isAnomalousPrice(params.orderTotal, params.averageItemPrice)) {
    fraudFlags.push("anomalous_price");
    status = "review";
    const c = calcCommission(params.orderTotal, affiliate.commissionPercent);
    commissionGross = c.gross;
    commissionNet = c.net;
  } else {
    const c = calcCommission(params.orderTotal, affiliate.commissionPercent);
    commissionGross = c.gross;
    commissionNet = c.net;
  }

  const { data, error } = await supabase
    .from("affiliate_sales")
    .insert({
      affiliate_id: affiliate.id,
      order_id: params.orderId,
      order_total: params.orderTotal,
      commission_percent: affiliate.commissionPercent,
      commission_gross: commissionGross,
      commission_net: commissionNet,
      status,
      fraud_flags: fraudFlags,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") return null;
    throw error;
  }
  return rowToSale(data as SaleRow);
}

export async function approveAffiliateSale(orderId: string): Promise<void> {
  const supabase = createAdminClient();
  const { data: saleRow } = await supabase
    .from("affiliate_sales")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (!saleRow) return;
  const sale = rowToSale(saleRow as SaleRow);
  if (sale.status === "approved") return;
  if (sale.status === "cancelled") return;
  if (sale.status === "review" && sale.fraudFlags.includes("self_purchase")) {
    return;
  }

  const affiliate = await getAffiliateById(sale.affiliateId);
  if (!affiliate || affiliate.status === "blocked") return;

  const now = new Date().toISOString();
  await supabase
    .from("affiliate_sales")
    .update({ status: "approved", confirmed_at: now })
    .eq("id", sale.id);

  if (sale.commissionNet > 0) {
    await supabase
      .from("affiliates")
      .update({
        balance_available: affiliate.balanceAvailable + sale.commissionNet,
        updated_at: now,
      })
      .eq("id", affiliate.id);
  }
}

export async function cancelAffiliateSale(orderId: string): Promise<void> {
  const supabase = createAdminClient();
  const { data: saleRow } = await supabase
    .from("affiliate_sales")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (!saleRow) return;
  const sale = rowToSale(saleRow as SaleRow);
  if (sale.status === "cancelled") return;

  const affiliate = await getAffiliateById(sale.affiliateId);
  if (!affiliate) return;

  const now = new Date().toISOString();
  const wasApproved = sale.status === "approved";

  await supabase
    .from("affiliate_sales")
    .update({ status: "cancelled" })
    .eq("id", sale.id);

  if (wasApproved && sale.commissionNet > 0) {
    await supabase
      .from("affiliates")
      .update({
        balance_available: Math.max(
          0,
          affiliate.balanceAvailable - sale.commissionNet
        ),
        cancelled_sales_count: affiliate.cancelledSalesCount + 1,
        updated_at: now,
      })
      .eq("id", affiliate.id);

    await checkAffiliateFraudThreshold(sale.affiliateId);
  }
}

async function checkAffiliateFraudThreshold(affiliateId: string): Promise<void> {
  const supabase = createAdminClient();
  const affiliate = await getAffiliateById(affiliateId);
  if (!affiliate) return;

  const { count: totalSales } = await supabase
    .from("affiliate_sales")
    .select("*", { count: "exact", head: true })
    .eq("affiliate_id", affiliateId);

  const cancelled = affiliate.cancelledSalesCount;
  const total = totalSales ?? 0;
  if (total < 3) return;

  const cancelRate = cancelled / total;
  if (cancelRate > 0.3) {
    await supabase
      .from("affiliates")
      .update({ status: "blocked", updated_at: new Date().toISOString() })
      .eq("id", affiliateId);
  }
}

export async function listAffiliateSales(
  affiliateId?: string
): Promise<AffiliateSale[]> {
  const supabase = createAdminClient();
  let q = supabase
    .from("affiliate_sales")
    .select("*")
    .order("created_at", { ascending: false });
  if (affiliateId) q = q.eq("affiliate_id", affiliateId);
  const { data, error } = await q;
  if (error) throw error;
  return (data as SaleRow[]).map(rowToSale);
}

export async function listAffiliatePayouts(
  affiliateId?: string
): Promise<AffiliatePayout[]> {
  const supabase = createAdminClient();
  let q = supabase
    .from("affiliate_payouts")
    .select("*")
    .order("created_at", { ascending: false });
  if (affiliateId) q = q.eq("affiliate_id", affiliateId);
  const { data, error } = await q;
  if (error) throw error;
  return (data as PayoutRow[]).map(rowToPayout);
}

export async function runAffiliatePayouts(): Promise<{
  processed: number;
  totalAmount: number;
}> {
  const supabase = createAdminClient();
  const affiliates = await listAffiliates();
  let processed = 0;
  let totalAmount = 0;

  for (const aff of affiliates) {
    if (aff.status !== "approved" || aff.balanceAvailable <= 0) continue;

    const amount = aff.balanceAvailable;
    await supabase.from("affiliate_payouts").insert({
      affiliate_id: aff.id,
      amount,
      pix_key: aff.pixKey,
      status: "sent",
      notes: "Pagamento semanal automático (registro manual PIX)",
    });

    await supabase
      .from("affiliates")
      .update({
        balance_available: 0,
        total_paid: aff.totalPaid + amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", aff.id);

    processed++;
    totalAmount += amount;
  }

  return { processed, totalAmount };
}

export async function updateAffiliateTiers(): Promise<number> {
  const supabase = createAdminClient();
  const affiliates = await listAffiliates();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
  let updated = 0;

  for (const aff of affiliates) {
    const { count } = await supabase
      .from("affiliate_sales")
      .select("*", { count: "exact", head: true })
      .eq("affiliate_id", aff.id)
      .eq("status", "approved")
      .gte("confirmed_at", monthStart.toISOString())
      .lt("confirmed_at", monthEnd.toISOString());

    const tier = tierForMonthlySales(count ?? 0);
    if (
      tier.percent !== aff.commissionPercent ||
      tier.tier !== aff.tier
    ) {
      await supabase
        .from("affiliates")
        .update({
          commission_percent: tier.percent,
          tier: tier.tier,
          updated_at: new Date().toISOString(),
        })
        .eq("id", aff.id);
      updated++;
    }
  }

  return updated;
}

export async function autoApprovePendingAffiliates(): Promise<number> {
  const supabase = createAdminClient();
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("affiliates")
    .select("id")
    .eq("status", "pending")
    .lt("created_at", cutoff);

  if (error) throw error;
  const now = new Date().toISOString();
  for (const row of data ?? []) {
    await supabase
      .from("affiliates")
      .update({ status: "approved", approved_at: now, updated_at: now })
      .eq("id", row.id);
  }
  return data?.length ?? 0;
}

export async function getAffiliateDashboard(
  affiliateId: string
): Promise<AffiliateDashboard | null> {
  const affiliate = await getAffiliateById(affiliateId);
  if (!affiliate) return null;

  const supabase = createAdminClient();
  const { data: salesRows } = await supabase
    .from("affiliate_sales")
    .select("*")
    .eq("affiliate_id", affiliateId)
    .order("created_at", { ascending: false });

  const sales = (salesRows as SaleRow[] | null)?.map(rowToSale) ?? [];
  const approved = sales.filter((s) => s.status === "approved");
  const pending = sales.filter((s) => s.status === "pending" || s.status === "review");

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthlySales = approved.filter(
    (s) => s.confirmedAt && new Date(s.confirmedAt) >= monthStart
  ).length;

  const totalRevenue = approved.reduce((s, r) => s + r.orderTotal, 0);
  const totalCommission = approved.reduce((s, r) => s + r.commissionNet, 0);
  const pendingCommission = pending.reduce((s, r) => s + r.commissionNet, 0);
  const totalSales = sales.length;
  const totalClicks = affiliate.clicksCount;
  const conversionRate =
    totalClicks > 0 ? (totalSales / totalClicks) * 100 : 0;

  return {
    affiliate,
    totalClicks,
    totalSales,
    monthlySales,
    conversionRate,
    totalRevenue,
    totalCommission,
    pendingCommission,
    paidCommission: affiliate.totalPaid,
    recentSales: sales.slice(0, 10),
    affiliateLink: affiliateLink(affiliate.uniqueCode),
  };
}

export async function handleOrderStatusChange(
  orderId: string,
  newStatus: string,
  previousStatus?: string
): Promise<void> {
  if (newStatus === "paid" && previousStatus !== "paid") {
    await approveAffiliateSale(orderId);
  }
  if (newStatus === "cancelled" && previousStatus !== "cancelled") {
    await cancelAffiliateSale(orderId);
  }
}
