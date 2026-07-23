import { NextResponse } from "next/server";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";

const DEFAULT_EMAIL = "maggreenoficial@gmail.com";

export async function POST(request: Request) {
  const secret = request.headers.get("x-setup-secret");
  const expected = process.env.ADMIN_SETUP_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (!hasAdminClient()) {
    return NextResponse.json(
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY não configurada na Vercel. Adicione em Settings → Environment Variables.",
      },
      { status: 500 }
    );
  }

  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = (body.email ?? DEFAULT_EMAIL).trim().toLowerCase();
    const password = body.password ?? process.env.ADMIN_SETUP_PASSWORD;

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Senha obrigatória (mín. 8 caracteres)." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: list, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const user = list.users.find((u) => u.email?.toLowerCase() === email);

    if (!user) {
      const { data: created, error: createError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }

      await supabase.from("profiles").upsert({
        id: created.user.id,
        email,
        role: "admin",
        updated_at: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        action: "created",
        email,
      });
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password, email_confirm: true }
    );

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await supabase.from("profiles").upsert({
      id: user.id,
      email,
      role: "admin",
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      action: "updated",
      email,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao configurar senha." }, { status: 500 });
  }
}
