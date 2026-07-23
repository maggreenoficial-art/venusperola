import { NextResponse } from "next/server";
import {
  createSessionToken,
  verifyPassword,
} from "@/lib/affiliates/auth";
import { AFFILIATE_SESSION_COOKIE } from "@/lib/affiliates/cookie";
import {
  getAffiliateByEmail,
  getAffiliatePasswordHash,
} from "@/lib/db/affiliates";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const affiliate = await getAffiliateByEmail(body.email);
    if (!affiliate) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    const hash = await getAffiliatePasswordHash(affiliate.id);
    if (!hash || !verifyPassword(body.password, hash)) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    if (affiliate.status === "blocked") {
      return NextResponse.json(
        { error: "Conta suspensa. Entre em contato com o suporte." },
        { status: 403 }
      );
    }

    const token = createSessionToken(affiliate.id);
    const response = NextResponse.json({
      success: true,
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        uniqueCode: affiliate.uniqueCode,
        status: affiliate.status,
      },
    });

    response.cookies.set(AFFILIATE_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Erro ao entrar." }, { status: 500 });
  }
}
