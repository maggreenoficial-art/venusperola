import { NextResponse } from "next/server";
import { updateMetaAdsCampaignLocal } from "@/lib/db/meta-ads";
import {
  MetaMarketingApiError,
  updateMetaCampaignDailyBudget,
  updateMetaCampaignStatus,
} from "@/lib/meta-marketing-api";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      status?: "ACTIVE" | "PAUSED";
      dailyBudget?: number;
    };

    if (body.status) {
      await updateMetaCampaignStatus(id, body.status);
      await updateMetaAdsCampaignLocal(id, { status: body.status });
    }

    if (body.dailyBudget != null) {
      const cents = Math.round(body.dailyBudget * 100);
      await updateMetaCampaignDailyBudget(id, cents);
      await updateMetaAdsCampaignLocal(id, { dailyBudget: body.dailyBudget });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg =
      err instanceof MetaMarketingApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Erro ao atualizar campanha.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
