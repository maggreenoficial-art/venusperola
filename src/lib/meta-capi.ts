import crypto from "crypto";
import type { Order } from "@/lib/orders";
import { getClientIp as getClientIpFromRequest } from "@/lib/request";
import { sanitizeMetaEventSourceUrl } from "@/lib/meta-pixel-config";

export interface MetaUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  clientIp?: string;
  userAgent?: string;
  fbc?: string;
  fbp?: string;
}

export interface MetaCustomData {
  currency?: string;
  value?: number;
  contentIds?: string[];
  contents?: { id: string; quantity: number; item_price?: number }[];
  contentName?: string;
  contentType?: string;
  numItems?: number;
}

export interface MetaCapiPayload {
  eventName: string;
  eventId: string;
  eventTime?: number;
  eventSourceUrl?: string;
  userData?: MetaUserData;
  customData?: MetaCustomData;
}

function hashPii(value: string): string {
  return crypto
    .createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

function buildUserData(data?: MetaUserData) {
  if (!data) return {};
  const result: Record<string, string> = {};
  if (data.email) result.em = hashPii(data.email);
  if (data.phone) result.ph = hashPii(data.phone.replace(/\D/g, ""));
  if (data.firstName) result.fn = hashPii(data.firstName);
  if (data.lastName) result.ln = hashPii(data.lastName);
  if (data.clientIp) result.client_ip_address = data.clientIp;
  if (data.userAgent) result.client_user_agent = data.userAgent;
  if (data.fbc) result.fbc = data.fbc;
  if (data.fbp) result.fbp = data.fbp;
  return result;
}

export async function sendMetaCapiEvent(payload: MetaCapiPayload) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    return { ok: false, skipped: true, reason: "missing_credentials" };
  }

  const event = {
    event_name: payload.eventName,
    event_time: payload.eventTime ?? Math.floor(Date.now() / 1000),
    event_id: payload.eventId,
    action_source: "website",
    event_source_url: sanitizeMetaEventSourceUrl(payload.eventSourceUrl),
    user_data: buildUserData(payload.userData),
    custom_data: payload.customData
      ? {
          currency: payload.customData.currency ?? "BRL",
          value: payload.customData.value,
          content_ids: payload.customData.contentIds,
          contents: payload.customData.contents,
          content_name: payload.customData.contentName,
          content_type: payload.customData.contentType ?? "product",
          num_items: payload.customData.numItems,
        }
      : undefined,
  };

  const body: Record<string, unknown> = {
    data: [event],
    access_token: accessToken,
  };

  const testCode = process.env.META_TEST_EVENT_CODE;
  if (testCode) body.test_event_code = testCode;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const json = await res.json();
    return { ok: res.ok, response: json };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

export function buildPurchaseCapiFromOrder(
  order: Order,
  meta: { eventId: string; userData?: MetaUserData; sourceUrl?: string }
) {
  const [firstName, ...rest] = order.customer.name.split(" ");
  return sendMetaCapiEvent({
    eventName: "Purchase",
    eventId: meta.eventId,
    eventSourceUrl: sanitizeMetaEventSourceUrl(meta.sourceUrl),
    userData: {
      email: order.customer.email,
      phone: order.customer.phone,
      firstName,
      lastName: rest.join(" ") || undefined,
      ...meta.userData,
    },
    customData: {
      currency: "BRL",
      value: order.total,
      contentIds: order.items.map((i) => i.variantId),
      contents: order.items.map((i) => ({
        id: i.variantId,
        quantity: i.quantity,
        item_price: i.price,
      })),
      numItems: order.items.reduce((s, i) => s + i.quantity, 0),
    },
  });
}

export function getClientIp(request: Request): string | undefined {
  return getClientIpFromRequest(request);
}
