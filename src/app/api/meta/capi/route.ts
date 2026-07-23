import { NextResponse } from "next/server";
import { sendMetaCapiEvent, getClientIp } from "@/lib/meta-capi";
import { sanitizeMetaEventSourceUrl } from "@/lib/meta-pixel-config";
import { trackEvent } from "@/lib/analytics";

interface CapiBody {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  userData?: {
    email?: string;
    phone?: string;
    firstName?: string;
    fbc?: string;
    fbp?: string;
  };
  customData?: {
    value?: number;
    currency?: string;
    contentIds?: string[];
    contentName?: string;
    numItems?: number;
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CapiBody;
    if (!body.eventName || !body.eventId) {
      return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
    }

    const result = await sendMetaCapiEvent({
      eventName: body.eventName,
      eventId: body.eventId,
      eventSourceUrl: sanitizeMetaEventSourceUrl(body.eventSourceUrl),
      userData: {
        ...body.userData,
        clientIp: getClientIp(request),
        userAgent: request.headers.get("user-agent") ?? undefined,
      },
      customData: body.customData,
    });

    const eventTypeMap: Record<string, "view_content" | "add_to_cart" | "initiate_checkout" | "purchase"> = {
      ViewContent: "view_content",
      AddToCart: "add_to_cart",
      InitiateCheckout: "initiate_checkout",
      Purchase: "purchase",
    };

    const mapped = eventTypeMap[body.eventName];
    if (mapped) {
      await trackEvent({
        type: mapped,
        eventId: body.eventId,
        value: body.customData?.value,
        productName: body.customData?.contentName,
        source: "capi",
      });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Erro CAPI." }, { status: 500 });
  }
}
