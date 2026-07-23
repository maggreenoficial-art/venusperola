import { NextResponse } from "next/server";
import { runAffiliatePayouts } from "@/lib/db/affiliates";

export async function POST() {
  try {
    const result = await runAffiliatePayouts();
    return NextResponse.json({ success: true, ...result });
  } catch {
    return NextResponse.json({ error: "Erro ao processar pagamentos." }, { status: 500 });
  }
}
