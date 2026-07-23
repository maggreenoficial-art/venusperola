"use client";

import { Loader2, Truck } from "lucide-react";
import { formatPrice } from "@/lib/catalog";
import { checkoutConfig } from "@/lib/checkout";
import type { ShippingQuote } from "@/lib/correios";

interface ShippingSelectorProps {
  quotes: ShippingQuote[];
  selected: string | null;
  onSelect: (service: string) => void;
  loading: boolean;
  freeShippingApplied: boolean;
  isEstimate: boolean;
  originLabel?: string;
  compact?: boolean;
}

export function ShippingSelector({
  quotes,
  selected,
  onSelect,
  loading,
  freeShippingApplied,
  isEstimate,
  originLabel = checkoutConfig.originCity,
  compact = false,
}: ShippingSelectorProps) {
  if (loading) {
    return (
      <div
        className={`flex items-center gap-2 rounded border border-white/10 text-sm text-muted ${
          compact ? "p-3" : "p-4"
        }`}
      >
        <Loader2 className="animate-spin text-accent" size={16} />
        Calculando frete Correios...
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <p className="text-xs text-muted">
        Informe um CEP válido para calcular o frete via Correios.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[10px] tracking-widest text-muted uppercase">
        <Truck size={14} className="text-accent" />
        Frete Correios · Origem {originLabel} ({checkoutConfig.originCep})
      </div>

      {freeShippingApplied && (
        <p className="rounded border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-400">
          Frete grátis — pedido acima de {formatPrice(checkoutConfig.freeShippingThreshold)}
        </p>
      )}

      {isEstimate && (
        <p className="text-[10px] text-yellow-400">
          Cotação estimada — API dos Correios temporariamente indisponível.
        </p>
      )}

      <div className="space-y-2">
        {quotes.map((quote) => {
          const isSelected = selected === quote.service;
          const displayPrice = freeShippingApplied ? 0 : quote.price;
          return (
            <label
              key={quote.service}
              className={`flex cursor-pointer items-center gap-3 border transition-colors ${
                compact ? "p-3" : "gap-4 p-4"
              } ${
                isSelected
                  ? "border-accent bg-accent/5"
                  : "border-white/10 hover:border-white/20"
              } ${quote.error ? "opacity-50" : ""}`}
            >
              <input
                type="radio"
                name="shipping"
                value={quote.service}
                checked={isSelected}
                disabled={Boolean(quote.error)}
                onChange={() => onSelect(quote.service)}
                className="accent-accent"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{quote.label}</p>
                <p className="text-xs text-muted">
                  {quote.error
                    ? quote.error
                    : `Entrega em até ${quote.deliveryDays} dia(s) úteis`}
                </p>
              </div>
              <p className="text-sm font-medium text-accent">
                {displayPrice === 0 ? "Grátis" : formatPrice(displayPrice)}
              </p>
            </label>
          );
        })}
      </div>
    </div>
  );
}
