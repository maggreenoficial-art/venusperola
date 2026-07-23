import { NextResponse } from "next/server";
import {
  listAffiliates,
  listAffiliatePayouts,
  listAffiliateSales,
  updateAffiliateStatus,
} from "@/lib/db/affiliates";
import type { AffiliateStatus } from "@/lib/affiliates/types";

export async function GET() {
  try {
    const [affiliates, sales, payouts] = await Promise.all([
      listAffiliates(),
      listAffiliateSales(),
      listAffiliatePayouts(),
    ]);
    return NextResponse.json({ affiliates, sales, payouts });
  } catch {
    return NextResponse.json({ error: "Erro ao listar afiliados." }, { status: 500 });
  }
}

interface PatchBody {
  id: string;
  status: AffiliateStatus;
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as PatchBody;
    const affiliate = await updateAffiliateStatus(body.id, body.status);
    if (!affiliate) {
      return NextResponse.json({ error: "Afiliado não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ affiliate });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar." }, { status: 500 });
  }
}
