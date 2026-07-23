import { checkoutConfig } from "@/lib/checkout";
import {
  estimatePackage,
  fetchCorreiosQuotes,
  getFallbackQuotes,
  type ShippingQuote,
  type ShippingServiceId,
  correiosConfig,
} from "@/lib/correios";

export interface ShippingCalculationInput {
  destinationCep: string;
  itemCount: number;
  subtotal: number;
  selectedService?: ShippingServiceId;
}

export interface ShippingCalculationResult {
  originCep: string;
  destinationCep: string;
  quotes: ShippingQuote[];
  selected: ShippingQuote;
  freeShippingApplied: boolean;
  finalPrice: number;
  package: ReturnType<typeof estimatePackage>;
  isEstimate: boolean;
}

export async function calculateCorreiosShipping(
  input: ShippingCalculationInput
): Promise<ShippingCalculationResult> {
  const destinationCep = input.destinationCep.replace(/\D/g, "");
  const pkg = estimatePackage(input.itemCount);
  const freeShippingApplied =
    input.subtotal >= checkoutConfig.freeShippingThreshold;

  let quotes: ShippingQuote[];
  let isEstimate = false;

  try {
    quotes = await fetchCorreiosQuotes(destinationCep, pkg);
    const validQuotes = quotes.filter((q) => !q.error && q.price > 0);
    if (validQuotes.length === 0) {
      quotes = getFallbackQuotes(input.subtotal);
      isEstimate = true;
    } else {
      quotes = validQuotes;
    }
  } catch (err) {
    console.error("[shipping] Correios:", err);
    quotes = getFallbackQuotes(input.subtotal);
    isEstimate = true;
  }

  const preferred =
    input.selectedService &&
    quotes.find((q) => q.service === input.selectedService && !q.error);
  const selected = preferred ?? quotes.find((q) => !q.error) ?? quotes[0];

  const finalPrice = freeShippingApplied ? 0 : selected.price;

  return {
    originCep: correiosConfig.originCep,
    destinationCep,
    quotes,
    selected,
    freeShippingApplied,
    finalPrice,
    package: pkg,
    isEstimate,
  };
}

/** Valida frete enviado pelo cliente no checkout */
export async function validateOrderShipping(
  destinationCep: string,
  itemCount: number,
  subtotal: number,
  claimedShippingCost: number,
  selectedService?: ShippingServiceId
): Promise<{ valid: boolean; expected: number }> {
  const result = await calculateCorreiosShipping({
    destinationCep,
    itemCount,
    subtotal,
    selectedService,
  });

  const tolerance = 0.02;
  const valid =
    Math.abs(result.finalPrice - claimedShippingCost) <= tolerance;

  return { valid, expected: result.finalPrice };
}

/** Estimativa sem CEP — legado */
export function getShippingEstimateLabel(): string {
  return "Informe o CEP no carrinho";
}
