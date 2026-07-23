"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Copy, Loader2, QrCode } from "lucide-react";
import { formatPrice } from "@/lib/catalog";
import { checkoutConfig } from "@/lib/checkout";
import type { Order } from "@/lib/orders";

interface OrderConfirmationProps {
  orderId: string;
}

export function OrderConfirmation({ orderId }: OrderConfirmationProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data.order ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  const copyPix = async () => {
    await navigator.clipboard.writeText(checkoutConfig.pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-6 pt-6 pb-16 sm:pt-10 sm:pb-24 text-center">
        <p className="text-muted">Pedido não encontrado.</p>
        <Link href="/loja" className="mt-4 inline-block text-accent underline">
          Voltar à loja
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pt-6 pb-16 sm:pt-10 sm:pb-24">
      <div className="text-center">
        <CheckCircle size={48} className="mx-auto text-accent" />
        <h1 className="mt-6 font-serif text-3xl italic">Pedido confirmado!</h1>
        <p className="mt-2 text-sm text-muted">
          Nº <span className="text-white">{order.id}</span>
        </p>
      </div>

      {order.paymentMethod === "pix" && (
        <div className="mt-10 border border-accent/30 bg-accent/5 p-6">
          <div className="flex items-center gap-3">
            <QrCode size={24} className="text-accent" />
            <div>
              <p className="text-sm font-medium">Pague via PIX</p>
              <p className="text-xs text-muted">
                Escaneie ou copie a chave abaixo
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-2xl font-medium text-accent">
              {formatPrice(order.total)}
            </p>
            <p className="mt-1 text-xs text-muted">
              {checkoutConfig.pixBeneficiary}
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded border border-white/10 bg-black p-3">
            <code className="flex-1 truncate text-xs text-muted">
              {checkoutConfig.pixKey}
            </code>
            <button
              onClick={copyPix}
              className="shrink-0 rounded-full border border-white/20 px-3 py-1.5 text-[10px] tracking-widest uppercase hover:border-accent"
            >
              {copied ? "Copiado!" : <Copy size={14} />}
            </button>
          </div>

          <p className="mt-4 text-center text-[10px] text-muted">
            Após o pagamento, seu pedido será processado em até 24h.
            Referência: {order.paymentReference}
          </p>
        </div>
      )}

      {order.paymentMethod === "boleto" && (
        <div className="mt-10 border border-white/10 p-6 text-center">
          <p className="text-sm">Boleto gerado</p>
          <p className="mt-2 text-xs text-muted">
            Você receberá o boleto em <strong>{order.customer.email}</strong> em
            até 30 minutos. Ref: {order.paymentReference}
          </p>
        </div>
      )}

      {order.paymentMethod === "credit_card" && (
        <div className="mt-10 border border-white/10 p-6 text-center">
          <p className="text-sm">Pagamento com cartão</p>
          <p className="mt-2 text-xs text-muted">
            Nossa equipe entrará em contato via WhatsApp para finalizar o
            pagamento de forma segura.
          </p>
        </div>
      )}

      <div className="mt-10 border border-white/10 p-6">
        <h2 className="text-xs font-bold tracking-[0.2em]">ITENS DO PEDIDO</h2>
        <ul className="mt-4 space-y-4">
          {order.items.map((item) => (
            <li key={`${item.productId}:${item.variantId}`} className="flex gap-3">
              <div className="relative h-14 w-14 shrink-0 bg-white">
                <Image
                  src={item.image}
                  alt={item.productName}
                  fill
                  className="object-contain"
                  sizes="56px"
                />
              </div>
              <div className="text-xs">
                <p className="font-medium">{item.productName}</p>
                <p className="text-muted">
                  {item.variantLabel} × {item.quantity}
                </p>
                <p className="text-accent">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-1 border-t border-white/10 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">
              Frete
              {order.shippingService && (
                <span className="ml-1 uppercase">({order.shippingService})</span>
              )}
            </span>
            <span>
              {order.shippingCost === 0
                ? "Grátis"
                : formatPrice(order.shippingCost)}
            </span>
          </div>
          {order.shippingDeliveryDays ? (
            <p className="text-[10px] text-muted">
              Prazo estimado: {order.shippingDeliveryDays} dia(s) úteis via Correios
            </p>
          ) : null}
          {order.discount > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Descontos</span>
              <span>−{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 font-medium">
            <span>Total</span>
            <span className="text-accent">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 border border-white/10 p-6 text-sm">
        <h2 className="text-xs font-bold tracking-[0.2em]">ENTREGA</h2>
        <p className="mt-3 text-muted">
          {order.customer.name}
          <br />
          {order.shipping.street}, {order.shipping.number}
          {order.shipping.complement && ` — ${order.shipping.complement}`}
          <br />
          {order.shipping.neighborhood} — {order.shipping.city}/{order.shipping.state}
          <br />
          CEP {order.shipping.cep}
        </p>
        <p className="mt-4 text-[10px] text-muted">
          Embalagem discreta com ritual de unboxing premium incluso.
        </p>
      </div>

      {order.pearlsEarned > 0 && (
        <p className="mt-6 text-center text-sm text-accent">
          +{order.pearlsEarned} Pérolas de Fidelidade serão creditadas após
          confirmação do pagamento.
        </p>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/clube-venus"
          className="rounded-full border border-white/20 px-6 py-2 text-xs tracking-widest uppercase hover:border-accent"
        >
          Clube Vênus
        </Link>
        <Link
          href="/loja"
          className="rounded-full bg-white px-6 py-2 text-xs font-semibold tracking-widest text-black uppercase hover:bg-accent"
        >
          Continuar comprando
        </Link>
      </div>
    </div>
  );
}
