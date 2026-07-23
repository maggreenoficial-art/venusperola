import { NextResponse } from "next/server";
import { getMetaSummaryData } from "@/lib/meta-summary";
import { MetaMarketingApiError } from "@/lib/meta-marketing-api";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId") ?? undefined;
    const datePreset = searchParams.get("datePreset") ?? "today";

    const summary = await getMetaSummaryData(accountId, datePreset);
    return NextResponse.json({ summary });
  } catch (err) {
    const msg =
      err instanceof MetaMarketingApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Erro ao carregar resumo.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
