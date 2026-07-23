import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { email, password, fullName } = (await request.json()) as {
    email?: string;
    password?: string;
    fullName?: string;
  };

  if (!email || !password) {
    return NextResponse.json(
      { error: "E-mail e senha são obrigatórios." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, user: data.user });
}
