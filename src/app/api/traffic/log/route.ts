import { NextResponse } from "next/server";
import { logTrafficEvent } from "@/lib/db/traffic";
import type { TrafficAction } from "@/lib/traffic-shield/types";

interface LogBody {
  ipHash?: string;
  userAgent?: string;
  path?: string;
  action?: TrafficAction;
  score?: number;
  reasons?: string[];
  category?: string;
  country?: string;
}

export async function POST(request: Request) {
  const secret = process.env.TRAFFIC_INTERNAL_SECRET ?? "vp-traffic-dev";
  if (request.headers.get("x-traffic-internal") !== secret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as LogBody;
    if (!body.ipHash || !body.path || !body.action) {
      return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
    }

    await logTrafficEvent({
      ipHash: body.ipHash,
      userAgent: body.userAgent,
      path: body.path,
      action: body.action,
      score: body.score ?? 0,
      reasons: body.reasons ?? [],
      category: body.category ?? "human",
      country: body.country,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao registrar log." }, { status: 500 });
  }
}
