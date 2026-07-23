import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { joinClub } from "@/lib/db/profiles";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Faça login para entrar no Clube Vênus." },
        { status: 401 }
      );
    }

    const email = user.email?.toLowerCase() ?? "";
    if (!email) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }

    const { welcomeBonus } = await joinClub(user.id, email);

    return NextResponse.json({
      success: true,
      message:
        welcomeBonus > 0
          ? "Bem-vinda ao Clube Vênus!"
          : "Você já faz parte do Clube Vênus!",
      welcomeBonus,
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao processar inscrição." },
      { status: 500 }
    );
  }
}
