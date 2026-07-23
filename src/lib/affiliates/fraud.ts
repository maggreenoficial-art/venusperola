const ADULT_KEYWORDS = [
  "onlyfans",
  "privacy",
  "conteudo adulto",
  "conteúdo adulto",
  "sex positive",
  "sex-positive",
  "sexpositive",
  "erotico",
  "erótico",
  "sensual",
  "lingerie",
  "fetiche",
  "adulto",
  "18+",
  "nsfw",
];

export function shouldAutoApprove(socialProfile?: string): boolean {
  if (!socialProfile?.trim()) return false;
  const normalized = socialProfile.toLowerCase();
  return ADULT_KEYWORDS.some((kw) => normalized.includes(kw));
}

export function normalizeCpf(cpf?: string): string {
  return (cpf ?? "").replace(/\D/g, "");
}

export function isSelfPurchase(
  affiliateEmail: string,
  affiliateCpf: string | undefined,
  customerEmail: string,
  customerCpf?: string
): boolean {
  if (affiliateEmail.toLowerCase() === customerEmail.toLowerCase()) return true;
  const ac = normalizeCpf(affiliateCpf);
  const cc = normalizeCpf(customerCpf);
  return ac.length >= 11 && cc.length >= 11 && ac === cc;
}

export function isAnomalousPrice(
  orderTotal: number,
  averageProductPrice: number
): boolean {
  if (averageProductPrice <= 0) return false;
  return orderTotal < averageProductPrice * 0.1;
}

import crypto from "crypto";

export function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 32);
}
