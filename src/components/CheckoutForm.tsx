"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, type CartItem } from "@/context/CartContext";
import { useShipping } from "@/context/ShippingContext";
import { useLoyalty } from "@/context/LoyaltyContext";
import { LoyaltyPanel } from "@/components/LoyaltyPanel";
import { formatPrice } from "@/lib/catalog";
import { getVariantImage } from "@/lib/product-images";
import {
  calculatePaymentDiscount,
  checkoutConfig,
  fetchAddressByCep,
  formatCep,
  formatCpf,
  formatPhone,
  paymentMethods,
} from "@/lib/checkout";
import type { ShippingServiceId } from "@/lib/correios";
import { ShippingSelector } from "@/components/ShippingSelector";
import { calculatePearlsEarned, loyalty } from "@/lib/loyalty";
import type { CreateOrderPayload, PaymentMethod } from "@/lib/orders";
import { trackInitiateCheckout, trackPurchase } from "@/lib/tracking";
import { Loader2, Lock, Package, CreditCard, MapPin, User } from "lucide-react";

type Step = "dados" | "entrega" | "pagamento";

const steps: { id: Step; label: string; icon: typeof User }[] = [
  { id: "dados", label: "Dados", icon: User },
  { id: "entrega", label: "Entrega", icon: MapPin },
  { id: "pagamento", label: "Pagamento", icon: CreditCard },
];

export function CheckoutForm() {
  const router = useRouter();
  const { items, totalPrice, clearCart, isHydrated } = useCart();
  const {
    discount: pearlDiscount,
    redeemedPearls,
    redeemPearls,
    clearRedemption,
    addPearlsFromPurchase,
    isMember,
    email: memberEmail,
  } = useLoyalty();

  const [step, setStep] = useState<Step>("dados");
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState(memberEmail ?? "");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");

  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");

  const {
    destinationCep: shippingCep,
    setDestinationCep: setShippingCep,
    quotes: shippingQuotes,
    selectedService: selectedShipping,
    shippingCost: shippingCostValue,
    shippingDays,
    freeShippingApplied,
    loading: shippingLoading,
    isEstimate: shippingIsEstimate,
    selectService,
    refreshShipping,
  } = useShipping();

  const [cep, setCep] = useState(shippingCep);

  useEffect(() => {
    if (shippingCep && shippingCep !== cep) setCep(shippingCep);
  }, [shippingCep]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isHydrated && items.length === 0) {
      router.replace("/loja");
    }
  }, [isHydrated, items.length, router]);

  useEffect(() => {
    if (memberEmail && !email) setEmail(memberEmail);
  }, [memberEmail, email]);

  const paymentDiscount = useMemo(
    () => calculatePaymentDiscount(totalPrice, paymentMethod),
    [totalPrice, paymentMethod]
  );
  const totalDiscount = pearlDiscount + paymentDiscount;
  const finalTotal = Math.max(0, totalPrice + shippingCostValue - totalDiscount);
  const pearlsToEarn = calculatePearlsEarned(finalTotal);

  const checkoutTracked = useRef(false);
  useEffect(() => {
    if (!isHydrated || items.length === 0 || checkoutTracked.current) return;
    checkoutTracked.current = true;
    const numItems = items.reduce((s, i) => s + i.quantity, 0);
    trackInitiateCheckout(finalTotal, numItems);
  }, [isHydrated, items, finalTotal]);

  const handleCepBlur = async () => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setShippingCep(cep);
    setCepLoading(true);
    const data = await fetchAddressByCep(cep);
    setCepLoading(false);
    if (data) {
      setStreet(data.logradouro);
      setNeighborhood(data.bairro);
      setCity(data.localidade);
      setState(data.uf);
    }
    await refreshShipping();
  };

  const validateStep = (s: Step): boolean => {
    setError("");
    if (s === "dados") {
      if (!name.trim()) { setError("Informe seu nome."); return false; }
      if (!email.includes("@")) { setError("E-mail inválido."); return false; }
      if (phone.replace(/\D/g, "").length < 10) { setError("Telefone inválido."); return false; }
    }
    if (s === "entrega") {
      if (cep.replace(/\D/g, "").length !== 8) { setError("CEP inválido."); return false; }
      if (!street.trim()) { setError("Informe o endereço."); return false; }
      if (!number.trim()) { setError("Informe o número."); return false; }
      if (!city.trim()) { setError("Cidade obrigatória."); return false; }
      if (!selectedShipping && shippingQuotes.length === 0) {
        setError("Aguarde o cálculo do frete Correios.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    if (step === "dados") setStep("entrega");
    else if (step === "entrega") setStep("pagamento");
  };

  const handleSubmit = async () => {
    if (!validateStep("dados") || !validateStep("entrega")) {
      setError("Revise os dados do pedido.");
      return;
    }

    setLoading(true);
    setError("");

    const payload: CreateOrderPayload = {
      customer: { name, email, phone, cpf: cpf || undefined },
      shipping: {
        cep,
        street,
        number,
        complement: complement || undefined,
        neighborhood,
        city,
        state,
      },
      paymentMethod,
      items: items.map((i) => ({
        productId: i.product.id,
        productSlug: i.product.slug,
        productName: i.product.name,
        variantId: i.variant.id,
        variantLabel: i.variant.label,
        supplierCode: i.variant.supplierCode,
        price: i.variant.price,
        quantity: i.quantity,
        image: getVariantImage(i.product, i.variant.image),
      })),
      subtotal: totalPrice,
      shippingCost: shippingCostValue,
      discount: totalDiscount,
      redeemedPearls,
      total: finalTotal,
      pearlsEarned: pearlsToEarn,
      shippingService: selectedShipping ?? undefined,
      shippingDeliveryDays: shippingDays || undefined,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao processar pedido.");
        setLoading(false);
        return;
      }

      if (isMember) addPearlsFromPurchase(finalTotal);
      trackPurchase(data.order.id, finalTotal, { email, phone });
      clearCart();
      clearRedemption();
      router.push(`/pedido/${data.order.id}`);
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-32 pt-4 sm:px-6 sm:pb-24 sm:pt-10">
      <h1 className="font-serif text-2xl italic sm:text-3xl md:text-4xl">Checkout</h1>
      <p className="mt-2 text-base text-muted">
        Embalagem 100% discreta · {checkoutConfig.discreetBillingName} na fatura
      </p>

      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:gap-2">
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = s.id === step;
          const isDone =
            (s.id === "dados" && (step === "entrega" || step === "pagamento")) ||
            (s.id === "entrega" && step === "pagamento");
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                if (isDone) setStep(s.id);
              }}
              className={`flex flex-1 items-center justify-center gap-2 border py-3.5 text-xs tracking-widest uppercase transition-colors sm:text-sm ${
                isActive
                  ? "border-accent bg-accent/10 text-accent"
                  : isDone
                    ? "border-white/20 text-white cursor-pointer hover:border-accent"
                    : "border-white/10 text-muted"
              }`}
            >
              <Icon size={16} />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-5 lg:gap-10">
        <div className="lg:col-span-3">
          {/* Resumo compacto no mobile */}
          <details className="mb-6 border border-white/10 p-4 lg:hidden">
            <summary className="cursor-pointer text-sm font-bold tracking-[0.15em]">
              RESUMO · {formatPrice(finalTotal)}
            </summary>
            <CheckoutSummary
              items={items}
              totalPrice={totalPrice}
              shippingCost={shippingCostValue}
              pearlDiscount={pearlDiscount}
              paymentDiscount={paymentDiscount}
              redeemedPearls={redeemedPearls}
              finalTotal={finalTotal}
              pearlsToEarn={pearlsToEarn}
              isMember={isMember}
              onRedeem={() => redeemPearls(loyalty.redeemRate)}
              compact
            />
          </details>
          {step === "dados" && (
            <section className="space-y-5">
              <h2 className="text-xs font-bold tracking-[0.2em]">SEUS DADOS</h2>
              <Field label="Nome completo" value={name} onChange={setName} required />
              <Field label="E-mail" value={email} onChange={setEmail} type="email" required />
              <Field
                label="Telefone / WhatsApp"
                value={phone}
                onChange={(v) => setPhone(formatPhone(v))}
                required
              />
              <Field
                label="CPF (opcional)"
                value={cpf}
                onChange={(v) => setCpf(formatCpf(v))}
              />
            </section>
          )}

          {step === "entrega" && (
            <section className="space-y-5">
              <h2 className="text-xs font-bold tracking-[0.2em]">ENDEREÇO DE ENTREGA</h2>
              <div className="relative">
                <Field
                  label="CEP"
                  value={cep}
                  onChange={(v) => {
                    setCep(formatCep(v));
                    setShippingCep(formatCep(v));
                  }}
                  onBlur={handleCepBlur}
                  required
                />
                {cepLoading && (
                  <Loader2 className="absolute right-3 top-9 animate-spin text-muted" size={16} />
                )}
              </div>
              <Field label="Rua" value={street} onChange={setStreet} required />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Número" value={number} onChange={setNumber} required />
                <Field label="Complemento" value={complement} onChange={setComplement} />
              </div>
              <Field label="Bairro" value={neighborhood} onChange={setNeighborhood} />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Cidade" value={city} onChange={setCity} required />
                <Field label="Estado" value={state} onChange={setState} required />
              </div>

              <div className="border-t border-white/10 pt-6">
                <ShippingSelector
                  quotes={shippingQuotes}
                  selected={selectedShipping}
                  onSelect={(service) =>
                    selectService(service as ShippingServiceId)
                  }
                  loading={shippingLoading}
                  freeShippingApplied={freeShippingApplied}
                  isEstimate={shippingIsEstimate}
                />
              </div>

              <p className="text-[10px] text-muted">
                <Package size={12} className="mr-1 inline" />
                Entrega discreta — embalagem neutra sem identificação da loja
              </p>
            </section>
          )}

          {step === "pagamento" && (
            <section className="space-y-5">
              <h2 className="text-xs font-bold tracking-[0.2em]">FORMA DE PAGAMENTO</h2>
              <div className="space-y-3">
                {paymentMethods.map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex cursor-pointer items-center gap-4 border p-4 transition-colors ${
                      paymentMethod === pm.id
                        ? "border-accent bg-accent/5"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={pm.id}
                      checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id)}
                      className="accent-accent"
                    />
                    <div>
                      <p className="text-sm font-medium">{pm.label}</p>
                      <p className="text-xs text-muted">{pm.description}</p>
                    </div>
                  </label>
                ))}
              </div>
              <p className="flex items-center gap-2 text-[10px] text-muted">
                <Lock size={12} />
                Pagamento seguro · Dados criptografados
              </p>
            </section>
          )}

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <div className="mt-8 hidden gap-4 sm:flex">
            {step !== "dados" && (
              <button
                type="button"
                onClick={() =>
                  setStep(step === "pagamento" ? "entrega" : "dados")
                }
                className="rounded-full border border-white/20 px-8 py-3 text-xs tracking-widest uppercase hover:border-accent"
              >
                Voltar
              </button>
            )}
            {step !== "pagamento" ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 rounded-full bg-white py-3 text-sm font-semibold text-black hover:bg-accent"
              >
                Continuar
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-semibold text-black hover:bg-accent disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Processando...
                  </>
                ) : (
                  `Confirmar pedido · ${formatPrice(finalTotal)}`
                )}
              </button>
            )}
          </div>
        </div>

        <aside className="hidden lg:col-span-2 lg:block">
          <div className="sticky top-24 border border-white/10 p-6">
            <CheckoutSummary
              items={items}
              totalPrice={totalPrice}
              shippingCost={shippingCostValue}
              pearlDiscount={pearlDiscount}
              paymentDiscount={paymentDiscount}
              redeemedPearls={redeemedPearls}
              finalTotal={finalTotal}
              pearlsToEarn={pearlsToEarn}
              isMember={isMember}
              onRedeem={() => redeemPearls(loyalty.redeemRate)}
            />
          </div>
        </aside>
      </div>

      {/* Barra fixa mobile */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/95 p-4 backdrop-blur-md sm:hidden"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-muted">Total</span>
          <span className="font-medium text-accent">{formatPrice(finalTotal)}</span>
        </div>
        <div className="flex gap-3">
          {step !== "dados" && (
            <button
              type="button"
              onClick={() =>
                setStep(step === "pagamento" ? "entrega" : "dados")
              }
              className="touch-target rounded-full border border-white/20 px-5 text-xs tracking-widest uppercase"
            >
              Voltar
            </button>
          )}
          {step !== "pagamento" ? (
            <button
              type="button"
              onClick={nextStep}
              className="touch-target flex-1 rounded-full bg-white py-3.5 text-sm font-semibold text-black"
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="touch-target flex flex-1 items-center justify-center gap-2 rounded-full bg-white py-3.5 text-sm font-semibold text-black disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Confirmar pedido"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckoutSummary({
  items,
  totalPrice,
  shippingCost,
  pearlDiscount,
  paymentDiscount,
  redeemedPearls,
  finalTotal,
  pearlsToEarn,
  isMember,
  onRedeem,
  compact,
}: {
  items: CartItem[];
  totalPrice: number;
  shippingCost: number;
  pearlDiscount: number;
  paymentDiscount: number;
  redeemedPearls: number;
  finalTotal: number;
  pearlsToEarn: number;
  isMember: boolean;
  onRedeem: () => void;
  compact?: boolean;
}) {
  return (
    <>
      <h2 className="text-xs font-bold tracking-[0.2em]">RESUMO</h2>

      <ul className={`mt-6 space-y-4 overflow-y-auto ${compact ? "max-h-40" : "max-h-64"}`}>
        {items.map(({ product, variant, quantity }) => (
          <li key={`${product.id}:${variant.id}`} className="flex gap-3">
            <div className="relative h-14 w-14 shrink-0 bg-white">
              <Image
                src={getVariantImage(product, variant.image)}
                alt={product.name}
                fill
                className="object-contain"
                sizes="56px"
              />
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <p className="truncate font-medium leading-tight">{product.name}</p>
              <p className="text-muted">{variant.label} × {quantity}</p>
              <p className="mt-1 text-accent">
                {formatPrice(variant.price * quantity)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-white/10 pt-4">
        <LoyaltyPanel orderTotal={totalPrice} onRedeem={onRedeem} />
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <Row label="Subtotal" value={formatPrice(totalPrice)} />
        <Row
          label="Frete"
          value={shippingCost === 0 ? "Grátis" : formatPrice(shippingCost)}
        />
        {pearlDiscount > 0 && (
          <Row
            label={`Pérolas (${redeemedPearls}◆)`}
            value={`−${formatPrice(pearlDiscount)}`}
            accent
          />
        )}
        {paymentDiscount > 0 && (
          <Row
            label="Desconto PIX (5%)"
            value={`−${formatPrice(paymentDiscount)}`}
            accent
          />
        )}
        <div className="flex justify-between border-t border-white/10 pt-3 text-base font-medium">
          <span>Total</span>
          <span className="text-accent">{formatPrice(finalTotal)}</span>
        </div>
        {pearlsToEarn > 0 && isMember && (
          <p className="text-[10px] text-muted">
            +{pearlsToEarn} pérolas após confirmação do pagamento
          </p>
        )}
      </div>

      {totalPrice < checkoutConfig.freeShippingThreshold && (
        <p className="mt-4 text-[10px] text-muted">
          Faltam {formatPrice(checkoutConfig.freeShippingThreshold - totalPrice)} para frete grátis
        </p>
      )}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  onBlur?: () => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs tracking-widest text-muted uppercase">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        required={required}
        className="w-full border-b border-white/20 bg-transparent py-3.5 text-base outline-none focus:border-accent"
      />
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={`flex justify-between ${accent ? "text-green-400" : ""}`}>
      <span className="text-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}
