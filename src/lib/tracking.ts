"use client";

import { trackPixel } from "@/components/MetaPixel";
import { getMetaEventSourceUrl } from "@/lib/meta-pixel-config";

const SESSION_KEY = "vp-session";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function getFbp(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/_fbp=([^;]+)/);
  return match?.[1];
}

function getFbc(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/_fbc=([^;]+)/);
  return match?.[1];
}

function generateEventId(): string {
  return crypto.randomUUID();
}

async function sendBrowserEvent(
  type: string,
  data: Record<string, unknown> = {}
) {
  const eventId = (data.eventId as string) ?? generateEventId();
  await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      sessionId: getSessionId(),
      eventId,
      ...data,
    }),
  });
  return eventId;
}

async function sendCapiEvent(
  eventName: string,
  eventId: string,
  customData?: Record<string, unknown>,
  userData?: Record<string, unknown>
) {
  await fetch("/api/meta/capi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName,
      eventId,
      eventSourceUrl: getMetaEventSourceUrl(),
      userData: { fbp: getFbp(), fbc: getFbc(), ...userData },
      customData,
    }),
  });
}

export async function trackPageView(path: string) {
  await sendBrowserEvent("page_view", { path });
}

export async function trackViewContent(product: {
  id: string;
  name: string;
  price: number;
  variantId: string;
}) {
  const eventId = generateEventId();
  await sendBrowserEvent("view_content", {
    productId: product.id,
    productName: product.name,
    variantId: product.variantId,
    value: product.price,
    eventId,
  });
  trackPixel(
    "ViewContent",
    {
      content_ids: [product.variantId],
      content_name: product.name,
      value: product.price,
      currency: "BRL",
    },
    eventId
  );
  await sendCapiEvent(
    "ViewContent",
    eventId,
    {
      value: product.price,
      currency: "BRL",
      contentIds: [product.variantId],
      contentName: product.name,
    }
  );
}

export async function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  variantId: string;
}) {
  const eventId = generateEventId();
  await sendBrowserEvent("add_to_cart", {
    productId: product.id,
    productName: product.name,
    variantId: product.variantId,
    value: product.price,
    eventId,
  });
  trackPixel(
    "AddToCart",
    {
      content_ids: [product.variantId],
      content_name: product.name,
      value: product.price,
      currency: "BRL",
    },
    eventId
  );
  await sendCapiEvent("AddToCart", eventId, {
    value: product.price,
    currency: "BRL",
    contentIds: [product.variantId],
    contentName: product.name,
  });
}

export async function trackInitiateCheckout(value: number, numItems: number) {
  const eventId = generateEventId();
  await sendBrowserEvent("initiate_checkout", { value, eventId });
  trackPixel(
    "InitiateCheckout",
    { value, currency: "BRL", num_items: numItems },
    eventId
  );
  await sendCapiEvent("InitiateCheckout", eventId, {
    value,
    currency: "BRL",
    numItems,
  });
}

export async function trackPurchase(
  orderId: string,
  value: number,
  userData?: { email?: string; phone?: string }
) {
  const eventId = orderId;
  trackPixel(
    "Purchase",
    { value, currency: "BRL" },
    eventId
  );
  await sendCapiEvent(
    "Purchase",
    eventId,
    { value, currency: "BRL" },
    userData
  );
}
