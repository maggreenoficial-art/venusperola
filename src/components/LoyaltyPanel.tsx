"use client";

import { useLoyalty } from "@/context/LoyaltyContext";
import {
  calculatePearlsEarned,
  loyalty,
  pearlsNeededForDiscount,
} from "@/lib/loyalty";
import { formatPrice } from "@/lib/catalog";

interface LoyaltyPanelProps {
  orderTotal: number;
  onRedeem?: () => void;
}

export function LoyaltyPanel({ orderTotal, onRedeem }: LoyaltyPanelProps) {
  const { pearls, isMember, redeemPearls, redeemedPearls, discount } =
    useLoyalty();
  const pearlsToEarn = calculatePearlsEarned(orderTotal);
  const canRedeem = pearls >= pearlsNeededForDiscount();

  if (!isMember) {
    return (
      <p className="text-[10px] text-muted">
        Entre no{" "}
        <a href="/clube-venus" className="text-accent underline-offset-2 hover:underline">
          Clube Vênus
        </a>{" "}
        e ganhe Pérolas de Fidelidade a cada compra.
      </p>
    );
  }

  return (
    <div className="space-y-3 rounded border border-white/10 p-4">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted">Suas pérolas</span>
        <span className="font-medium text-accent">{pearls} ◆</span>
      </div>

      {pearlsToEarn > 0 && (
        <p className="text-[10px] text-muted">
          +{pearlsToEarn} pérolas neste pedido (1 a cada R${loyalty.earnThreshold})
        </p>
      )}

      {redeemedPearls > 0 ? (
        <p className="text-[10px] text-green-400">
          Desconto aplicado: −{formatPrice(discount)} ({redeemedPearls} pérolas)
        </p>
      ) : (
        canRedeem &&
        onRedeem && (
          <button
            type="button"
            onClick={onRedeem}
            className="w-full rounded-full border border-accent/40 py-2 text-[10px] tracking-widest text-accent uppercase transition-colors hover:bg-accent/10"
          >
            Usar {pearlsNeededForDiscount()} pérolas (−{formatPrice(loyalty.redeemValue)})
          </button>
        )
      )}
    </div>
  );
}
