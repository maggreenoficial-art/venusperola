import { NextResponse } from "next/server";
import { trackEvent, type AnalyticsEventType } from "@/lib/analytics";
import { analyzeTraffic } from "@/lib/traffic-shield/detector";
import { getTrafficConfig } from "@/lib/db/traffic";
import { getClientIp } from "@/lib/request";

interface EventBody {
  type: AnalyticsEventType;
  sessionId?: string;
  path?: string;
  productId?: string;
  productName?: string;
  variantId?: string;
  value?: number;
  orderId?: string;
  eventId?: string;
}

const ALLOWED: AnalyticsEventType[] = [
  "page_view",
  "view_content",
  "add_to_cart",
  "initiate_checkout",
  "purchase",
];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EventBody;
    if (!body.type || !ALLOWED.includes(body.type)) {
      return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
    }

    const config = await getTrafficConfig();
    const ip = getClientIp(request);
    const analysis = analyzeTraffic(
      {
        ip,
        userAgent: request.headers.get("user-agent") ?? undefined,
        path: body.path ?? "/",
        method: "POST",
        acceptLanguage: request.headers.get("accept-language") ?? undefined,
        accept: request.headers.get("accept") ?? undefined,
      },
      config
    );

    if (
      config.enabled &&
      (analysis.action === "block" ||
        analysis.action === "safe_page" ||
        (analysis.action === "suspicious" && config.mode === "strict"))
    ) {
      return NextResponse.json(
        { success: false, filtered: true, reason: "traffic_shield" },
        { status: 403 }
      );
    }

    const event = await trackEvent({
      type: body.type,
      sessionId: body.sessionId,
      path: body.path,
      productId: body.productId,
      productName: body.productName,
      variantId: body.variantId,
      value: body.value,
      orderId: body.orderId,
      eventId: body.eventId,
      source: "browser",
    });

    return NextResponse.json({ success: true, eventId: event.eventId ?? event.id });
  } catch {
    return NextResponse.json({ error: "Erro ao registrar evento." }, { status: 500 });
  }
}
