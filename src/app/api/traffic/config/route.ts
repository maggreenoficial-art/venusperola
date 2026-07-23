import { NextResponse } from "next/server";
import { getTrafficConfig } from "@/lib/db/traffic";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getTrafficConfig();
    return NextResponse.json(config, {
      headers: { "Cache-Control": "public, max-age=30" },
    });
  } catch {
    return NextResponse.json({ enabled: false });
  }
}
