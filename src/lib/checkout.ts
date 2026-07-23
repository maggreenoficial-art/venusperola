export const checkoutConfig = {
  freeShippingThreshold: 150,
  shippingCost: 19.9,
  originCep: "79541-204",
  originCity: "Coxim/MS",
  pixKey: process.env.NEXT_PUBLIC_PIX_KEY ?? "contato@venusperola.com.br",
  pixBeneficiary: process.env.NEXT_PUBLIC_PIX_NAME ?? "OUTBELLE BRASIL",
  discreetBillingName: "VP Comercio Online",
} as const;

export const paymentMethods = [
  {
    id: "pix" as const,
    label: "PIX",
    description: "Aprovação imediata · 5% de desconto",
    discountPercent: 5,
  },
  {
    id: "credit_card" as const,
    label: "Cartão de crédito",
    description: "Em até 3x sem juros",
    discountPercent: 0,
  },
  {
    id: "boleto" as const,
    label: "Boleto bancário",
    description: "Vencimento em 3 dias úteis",
    discountPercent: 0,
  },
];

/** @deprecated Use API /api/shipping com CEP de destino */
export function calculateShipping(subtotal: number): number {
  return subtotal >= checkoutConfig.freeShippingThreshold
    ? 0
    : checkoutConfig.shippingCost;
}

export function calculatePaymentDiscount(
  subtotal: number,
  method: "pix" | "credit_card" | "boleto"
): number {
  const pm = paymentMethods.find((p) => p.id === method);
  if (!pm || pm.discountPercent === 0) return 0;
  return Math.round(subtotal * (pm.discountPercent / 100) * 100) / 100;
}

export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export async function fetchAddressByCep(
  cep: string
): Promise<ViaCepResponse | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    const data = (await res.json()) as ViaCepResponse;
    if (data.erro) return null;
    return data;
  } catch {
    return null;
  }
}
