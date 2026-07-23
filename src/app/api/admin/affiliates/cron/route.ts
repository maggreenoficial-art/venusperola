import { NextResponse } from "next/server";
import {
  autoApprovePendingAffiliates,
  updateAffiliateTiers,
} from "@/lib/db/affiliates";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "tiers") {
      const updated = await updateAffiliateTiers();
      return NextResponse.json({ success: true, updated });
    }

    if (action === "auto-approve") {
      const approved = await autoApprovePendingAffiliates();
      return NextResponse.json({ success: true, approved });
    }

    const [tiers, approved] = await Promise.all([
      updateAffiliateTiers(),
      autoApprovePendingAffiliates(),
    ]);

    return NextResponse.json({ success: true, tiers, approved });
  } catch {
    return NextResponse.json({ error: "Erro no cron de afiliados." }, { status: 500 });
  }
}
