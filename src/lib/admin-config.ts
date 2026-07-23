export const adminConfig = {
  targetRoas: Number(process.env.META_TARGET_ROAS ?? "3"),
  cogsPercent: Number(process.env.COGS_PERCENT ?? "0.35"),
  monthlyFixedCosts: Number(process.env.MONTHLY_FIXED_COSTS ?? "2500"),
  shippingCostPerOrder: Number(process.env.AVG_SHIPPING_COST ?? "12"),
  paymentFeePercent: Number(process.env.PAYMENT_FEE_PERCENT ?? "0.03"),
  lowStockThreshold: 3,
  criticalStockThreshold: 1,
} as const;
