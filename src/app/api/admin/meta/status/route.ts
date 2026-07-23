import { NextResponse } from "next/server";
import { isMetaSystemTokenConfigured } from "@/lib/meta-marketing-api";

export async function GET() {
  const configured = isMetaSystemTokenConfigured();
  return NextResponse.json({
    configured,
    message: configured
      ? "System User Token configurado."
      : "Adicione META_SYSTEM_USER_TOKEN nas variáveis de ambiente do servidor.",
    scopes: ["ads_read", "ads_management"],
  });
}
