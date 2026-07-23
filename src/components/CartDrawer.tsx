"use client";

import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useShipping } from "@/context/ShippingContext";
import { useLoyalty } from "@/context/LoyaltyContext";
import { LoyaltyPanel } from "@/components/LoyaltyPanel";
import { ShippingSelector } from "@/components/ShippingSelector";
import { UnboxingExperience } from "@/components/UnboxingExperience";
import { formatPrice } from "@/lib/catalog";
import { getVariantImage } from "@/lib/product-images";
import { calculatePearlsEarned, loyalty } from "@/lib/loyalty";
import { checkoutConfig, formatCep } from "@/lib/checkout";
import type { ShippingServiceId } from "@/lib/correios";

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    totalPrice,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();
  const { discount, redeemedPearls, redeemPearls } = useLoyalty();
  const {
    destinationCep,
    setDestinationCep,
    quotes,
    selectedService,
    shippingCost,
    freeShippingApplied,
    loading: shippingLoading,
    isEstimate,
    error,
    isReady,
    selectService,
  } = useShipping();

  const finalTotal = Math.max(0, totalPrice + shippingCost - discount);

  const handleCheckout = () => {
    if (!isReady) return;
    closeCart();
    router.push("/checkout");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden
      />

      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-black border-l border-white/10 max-md:max-w-full"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="text-lg font-medium tracking-wide">
            Carrinho ({items.length})
          </h2>
          <button
            onClick={closeCart}
            className="text-white/60 transition-colors hover:text-white"
            aria-label="Fechar carrinho"
          >
            <X size={22} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag size={40} className="text-white/20" />
            <p className="text-muted">Seu carrinho está vazio.</p>
            <Link
              href="/loja"
              onClick={closeCart}
              className="text-sm text-accent underline-offset-4 hover:underline"
            >
              Ver produtos
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6 py-4">
              {items.map(({ product, variant, quantity }) => (
                <li
                  key={`${product.id}:${variant.id}`}
                  className="flex gap-4 border-b border-white/5 py-4"
                >
                  <div className="relative h-20 w-20 shrink-0 bg-white">
                    <ProductThumb
                      name={product.name}
                      image={getVariantImage(product, variant.image)}
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-sm font-medium leading-tight">
                        {product.name}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted">
                        {variant.label}
                      </p>
                      <p className="mt-1 text-sm text-accent">
                        {formatPrice(variant.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          updateQuantity(product.id, variant.id, quantity - 1)
                        }
                        className="text-white/50 hover:text-white"
                        aria-label="Diminuir quantidade"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm">{quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(product.id, variant.id, quantity + 1)
                        }
                        disabled={quantity >= variant.stock}
                        className="text-white/50 hover:text-white disabled:opacity-30"
                        aria-label="Aumentar quantidade"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => removeItem(product.id, variant.id)}
                        className="ml-auto text-white/40 hover:text-red-400"
                        aria-label="Remover item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}

              <li className="pt-4">
                <UnboxingExperience compact />
              </li>

              <li className="border-t border-white/10 pt-4">
                <label className="mb-2 block text-[10px] tracking-widest text-muted uppercase">
                  CEP de entrega
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={destinationCep}
                  onChange={(e) => setDestinationCep(formatCep(e.target.value))}
                  placeholder="00000-000"
                  className="w-full border-b border-white/20 bg-transparent py-2.5 text-sm outline-none focus:border-accent"
                />
                <div className="mt-4">
                  <ShippingSelector
                    quotes={quotes}
                    selected={selectedService}
                    onSelect={(service) =>
                      selectService(service as ShippingServiceId)
                    }
                    loading={shippingLoading}
                    freeShippingApplied={freeShippingApplied}
                    isEstimate={isEstimate}
                    compact
                  />
                  {error && (
                    <p className="mt-2 text-[10px] text-yellow-400">{error}</p>
                  )}
                </div>
              </li>
            </ul>

            <div className="border-t border-white/10 px-6 py-5">
              <LoyaltyPanel
                orderTotal={totalPrice}
                onRedeem={() => redeemPearls(loyalty.redeemRate)}
              />

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Frete</span>
                  <span className="text-sm">
                    {!destinationCep.replace(/\D/g, "").match(/^\d{8}$/)
                      ? "Informe o CEP"
                      : shippingLoading
                        ? "Calculando..."
                        : shippingCost === 0 && isReady
                          ? "Grátis"
                          : isReady
                            ? formatPrice(shippingCost)
                            : "Selecione"}
                  </span>
                </div>
                {redeemedPearls > 0 && (
                  <div className="flex items-center justify-between text-sm text-green-400">
                    <span>Pérolas ({redeemedPearls}◆)</span>
                    <span>−{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-muted">Total</span>
                  <span className="text-lg font-medium">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
                {totalPrice < checkoutConfig.freeShippingThreshold && (
                  <p className="text-[10px] text-muted">
                    Faltam{" "}
                    {formatPrice(checkoutConfig.freeShippingThreshold - totalPrice)}{" "}
                    para frete grátis
                  </p>
                )}
                {calculatePearlsEarned(finalTotal) > 0 && (
                  <p className="text-[10px] text-muted">
                    +{calculatePearlsEarned(finalTotal)} pérolas neste pedido
                  </p>
                )}
              </div>

              <button
                onClick={handleCheckout}
                disabled={!isReady}
                className="mt-4 w-full rounded-full bg-white py-3 text-sm font-semibold text-black transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isReady ? "Ir para checkout" : "Calcule o frete para continuar"}
              </button>
              <button
                onClick={clearCart}
                className="mt-3 w-full text-center text-xs text-muted hover:text-white"
              >
                Limpar carrinho
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function ProductThumb({ name, image }: { name: string; image: string }) {
  return (
    <div className="relative h-full w-full">
      <Image
        src={image}
        alt={name}
        fill
        className="object-contain"
        sizes="80px"
      />
    </div>
  );
}
