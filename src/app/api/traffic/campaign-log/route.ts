import { NextResponse } from "next/server";
import { logCampaignClick } from "@/lib/db/traffic-campaigns";

export async function POST(request: Request) {
  const secret = process.env.TRAFFIC_INTERNAL_SECRET ?? "vp-traffic-dev";
  if (request.headers.get("x-traffic-internal") !== secret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    await logCampaignClick({
      campaignId: body.campaignId,
      destination: body.destination,
      country: body.country,
      device: body.device,
      trafficSource: body.trafficSource,
      ipHash: body.ipHash,
      reasons: body.reasons ?? [],
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao registrar clique." }, { status: 500 });
  }
}
