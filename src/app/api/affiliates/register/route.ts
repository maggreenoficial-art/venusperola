import { NextResponse } from "next/server";
import { registerAffiliate } from "@/lib/db/affiliates";
import type { RegisterAffiliateInput } from "@/lib/affiliates/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterAffiliateInput;

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
    }
    if (!body.email?.includes("@")) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }
    if (!body.pixKey?.trim()) {
      return NextResponse.json({ error: "Chave PIX é obrigatória." }, { status: 400 });
    }
    if (!body.password || body.password.length < 6) {
      return NextResponse.json(
        { error: "Senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    const { affiliate } = await registerAffiliate(body);
    return NextResponse.json({
      success: true,
      affiliate: {
        id: affiliate.id,
        uniqueCode: affiliate.uniqueCode,
        name: affiliate.name,
        email: affiliate.email,
        status: affiliate.status,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao cadastrar.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
