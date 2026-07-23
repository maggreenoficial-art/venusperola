export const loyalty = {
  programName: "Pérolas de Fidelidade",
  earnRate: 1, // 1 pérola a cada R$10
  earnThreshold: 10,
  redeemRate: 10, // 10 pérolas = R$5 de desconto
  redeemValue: 5,
  minRedeem: 10,
  welcomeBonus: 5,
} as const;

export function calculatePearlsEarned(totalPrice: number): number {
  return Math.floor(totalPrice / loyalty.earnThreshold) * loyalty.earnRate;
}

export function calculateDiscountFromPearls(pearls: number): number {
  const blocks = Math.floor(pearls / loyalty.redeemRate);
  return blocks * loyalty.redeemValue;
}

export function pearlsNeededForDiscount(): number {
  return loyalty.redeemRate;
}
