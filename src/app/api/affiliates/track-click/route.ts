import { NextResponse } from "next/server";
import { getClientIp } from "@/lib/request";
import { trackAffiliateClick } from "@/lib/db/affiliates";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      code?: string;
      referer?: string;
      utmSource?: string;
    };

    if (!body.code?.trim()) {
      return NextResponse.json({ error: "Código inválido." }, { status: 400 });
    }

    const counted = await trackAffiliateClick({
      code: body.code.trim(),
      ip: getClientIp(request) ?? "0.0.0.0",
      userAgent: request.headers.get("user-agent") ?? undefined,
      referer: body.referer,
      utmSource: body.utmSource,
    });

    return NextResponse.json({ success: true, counted });
  } catch {
    return NextResponse.json({ error: "Erro ao registrar clique." }, { status: 500 });
  }
}
