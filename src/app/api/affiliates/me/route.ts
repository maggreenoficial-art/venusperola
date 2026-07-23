import { NextResponse } from "next/server";
import { getAffiliateIdFromSession } from "@/lib/affiliates/auth";
import { getAffiliateDashboard } from "@/lib/db/affiliates";

export async function GET() {
  try {
    const affiliateId = await getAffiliateIdFromSession();
    if (!affiliateId) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const dashboard = await getAffiliateDashboard(affiliateId);
    if (!dashboard) {
      return NextResponse.json({ error: "Afiliado não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ dashboard });
  } catch {
    return NextResponse.json({ error: "Erro ao carregar dados." }, { status: 500 });
  }
}
