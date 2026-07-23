import { NextResponse } from "next/server";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };
    const normalized = email?.trim().toLowerCase() ?? "";

    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }

    if (!hasAdminClient()) {
      return NextResponse.json({
        success: true,
        message: "Inscrição registrada (modo offline).",
      });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("newsletter_subscribers").upsert(
      { email: normalized, source: "website" },
      { onConflict: "email" }
    );

    if (error) {
      return NextResponse.json({ error: "Erro ao inscrever." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Inscrita com sucesso!",
    });
  } catch {
    return NextResponse.json({ error: "Erro ao processar." }, { status: 500 });
  }
}
