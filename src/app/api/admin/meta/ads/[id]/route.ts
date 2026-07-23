import { NextResponse } from "next/server";
import {
  MetaMarketingApiError,
  updateMetaObjectStatus,
} from "@/lib/meta-marketing-api";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { status?: "ACTIVE" | "PAUSED" };
    if (!body.status) {
      return NextResponse.json({ error: "Status obrigatório." }, { status: 400 });
    }
    await updateMetaObjectStatus(id, body.status);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg =
      err instanceof MetaMarketingApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Erro ao atualizar anúncio.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
