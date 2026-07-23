import { NextResponse } from "next/server";
import {
  getMetaAdAccounts,
  setSelectedMetaAdAccount,
  syncMetaAdAccounts,
} from "@/lib/db/meta-ads";
import {
  isMetaSystemTokenConfigured,
  MetaMarketingApiError,
} from "@/lib/meta-marketing-api";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shouldSync = searchParams.get("sync") !== "0";

    if (!isMetaSystemTokenConfigured()) {
      const accounts = await getMetaAdAccounts().catch(() => []);
      return NextResponse.json({
        configured: false,
        accounts,
        message:
          "Configure META_SYSTEM_USER_TOKEN no servidor para sincronizar contas.",
      });
    }

    const accounts = shouldSync
      ? await syncMetaAdAccounts()
      : await getMetaAdAccounts();

    return NextResponse.json({
      configured: true,
      accounts,
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    const msg =
      err instanceof MetaMarketingApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Erro ao carregar contas Meta.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isMetaSystemTokenConfigured()) {
      return NextResponse.json(
        { error: "META_SYSTEM_USER_TOKEN não configurado." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    if (body.action === "select" && body.accountId) {
      const account = await setSelectedMetaAdAccount(body.accountId);
      return NextResponse.json({ account });
    }

    const accounts = await syncMetaAdAccounts();
    return NextResponse.json({
      accounts,
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    const msg =
      err instanceof MetaMarketingApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Erro ao sincronizar contas Meta.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
