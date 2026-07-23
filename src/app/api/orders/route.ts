import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AFFILIATE_REF_COOKIE } from "@/lib/affiliates/cookie";
import { attributeOrderToAffiliate } from "@/lib/db/affiliates";
import {
  generateOrderId,
  type CreateOrderPayload,
  type Order,
} from "@/lib/orders";
import { trackEvent } from "@/lib/analytics";
import {
  buildPurchaseCapiFromOrder,
  getClientIp,
} from "@/lib/meta-capi";
import { getMetaEventSourceUrl } from "@/lib/meta-pixel-config";
import { createOrder } from "@/lib/db/orders";
import { addPearls } from "@/lib/db/profiles";
import { validateOrderShipping } from "@/lib/shipping";
import type { ShippingServiceId } from "@/lib/correios";

function validatePayload(body: CreateOrderPayload): string | null {
  if (!body.customer?.name?.trim()) return "Nome é obrigatório.";
  if (!body.customer?.email?.includes("@")) return "E-mail inválido.";
  if (!body.customer?.phone?.replace(/\D/g, "").match(/^\d{10,11}$/))
    return "Telefone inválido.";
  if (!body.shipping?.cep?.replace(/\D/g, "").match(/^\d{8}$/))
    return "CEP inválido.";
  if (!body.shipping?.street?.trim()) return "Endereço é obrigatório.";
  if (!body.shipping?.number?.trim()) return "Número é obrigatório.";
  if (!body.shipping?.city?.trim()) return "Cidade é obrigatória.";
  if (!body.items?.length) return "Carrinho vazio.";
  if (body.total < 0) return "Total inválido.";
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderPayload;
    const error = validatePayload(body);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const itemCount = body.items.reduce((s, i) => s + i.quantity, 0);
    const shippingCheck = await validateOrderShipping(
      body.shipping.cep,
      itemCount,
      body.subtotal,
      body.shippingCost,
      body.shippingService as ShippingServiceId | undefined
    );

    if (!shippingCheck.valid) {
      return NextResponse.json(
        {
          error: `Frete inválido. Valor esperado: R$ ${shippingCheck.expected.toFixed(2)}`,
        },
        { status: 400 }
      );
    }

    const expectedTotal =
      body.subtotal + shippingCheck.expected - body.discount;
    if (Math.abs(expectedTotal - body.total) > 0.05) {
      return NextResponse.json({ error: "Total do pedido inválido." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const order: Order = {
      id: generateOrderId(),
      createdAt: new Date().toISOString(),
      status: "pending_payment",
      customer: body.customer,
      shipping: {
        ...body.shipping,
        service: body.shippingService,
        deliveryDays: body.shippingDeliveryDays,
      },
      paymentMethod: body.paymentMethod,
      items: body.items,
      subtotal: body.subtotal,
      shippingCost: body.shippingCost,
      discount: body.discount,
      redeemedPearls: body.redeemedPearls,
      total: body.total,
      pearlsEarned: body.pearlsEarned,
      shippingService: body.shippingService,
      shippingDeliveryDays: body.shippingDeliveryDays,
      paymentReference:
        body.paymentMethod === "pix"
          ? `PIX-${Date.now()}`
          : body.paymentMethod === "boleto"
            ? `BOL-${Date.now()}`
            : undefined,
    };

    await createOrder(order, user?.id ?? null);

    const cookieStore = await cookies();
    const affiliateRef = cookieStore.get(AFFILIATE_REF_COOKIE)?.value;
    if (affiliateRef) {
      const avgPrice =
        body.items.reduce((s, i) => s + i.price * i.quantity, 0) /
        Math.max(1, body.items.reduce((s, i) => s + i.quantity, 0));
      await attributeOrderToAffiliate({
        orderId: order.id,
        orderTotal: order.total,
        affiliateCode: affiliateRef,
        customerEmail: body.customer.email,
        customerCpf: body.customer.cpf,
        averageItemPrice: avgPrice,
      });
    }

    if (user && body.pearlsEarned > 0) {
      await addPearls(user.id, body.pearlsEarned);
    }

    const eventId = order.id;
    await trackEvent({
      type: "purchase",
      orderId: order.id,
      eventId,
      value: order.total,
      source: "server",
    });

    const capiResult = await buildPurchaseCapiFromOrder(order, {
      eventId,
      userData: {
        clientIp: getClientIp(request),
        userAgent: request.headers.get("user-agent") ?? undefined,
        fbc: request.headers.get("x-fbc") ?? undefined,
        fbp: request.headers.get("x-fbp") ?? undefined,
      },
      sourceUrl: getMetaEventSourceUrl(),
    });

    if (capiResult.ok) {
      await trackEvent({
        type: "purchase",
        orderId: order.id,
        eventId,
        value: order.total,
        source: "capi",
      });
    }

    return NextResponse.json({ success: true, order, eventId });
  } catch (err) {
    console.error("Order error:", err);
    return NextResponse.json(
      { error: "Erro ao processar pedido." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Use POST para criar pedidos." }, { status: 405 });
}
