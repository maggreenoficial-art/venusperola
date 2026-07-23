const PLATFORM_FEE_PERCENT = Number(process.env.AFFILIATE_PLATFORM_FEE_PERCENT ?? 0);

export function calcCommission(
  orderTotal: number,
  commissionPercent: number
): { gross: number; net: number } {
  const gross = Math.round(orderTotal * (commissionPercent / 100) * 100) / 100;
  const fee =
    Math.round(gross * (PLATFORM_FEE_PERCENT / 100) * 100) / 100;
  const net = Math.round((gross - fee) * 100) / 100;
  return { gross, net };
}
