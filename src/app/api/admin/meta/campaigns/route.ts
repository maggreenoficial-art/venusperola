import { NextResponse } from "next/server";
import {
  getMetaAdsCampaigns,
  getSelectedMetaAdAccount,
  syncMetaAdsCampaigns,
} from "@/lib/db/meta-ads";
import {
  isMetaSystemTokenConfigured,
  MetaMarketingApiError,
} from "@/lib/meta-marketing-api";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const datePreset = searchParams.get("datePreset") ?? "today";
    const shouldSync = searchParams.get("sync") !== "0";

    if (!isMetaSystemTokenConfigured()) {
      return NextResponse.json(
        { error: "META_SYSTEM_USER_TOKEN não configurado." },
        { status: 400 }
      );
    }

    const account =
      accountId != null
        ? { accountId }
        : await getSelectedMetaAdAccount();

    if (!account) {
      return NextResponse.json(
        { error: "Nenhuma conta de anúncio Meta encontrada. Sincronize as contas primeiro." },
        { status: 400 }
      );
    }

    const campaigns = shouldSync
      ? await syncMetaAdsCampaigns(account.accountId, datePreset)
      : await getMetaAdsCampaigns(account.accountId);

    return NextResponse.json({
      accountId: account.accountId,
      campaigns,
      datePreset,
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    const msg =
      err instanceof MetaMarketingApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Erro ao carregar campanhas Meta.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
