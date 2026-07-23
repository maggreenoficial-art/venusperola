/**
 * Redefine a senha do admin via Service Role (uso local, uma vez).
 *
 * 1. Coloque SUPABASE_SERVICE_ROLE_KEY no .env.local
 * 2. node scripts/reset-admin-password.mjs maggreenoficial@gmail.com NovaSenhaSegura123
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (!m) continue;
      const key = m[1].trim();
      const val = m[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env.local opcional se vars já estiverem no ambiente
  }
}

loadEnv();

const email = process.argv[2]?.trim().toLowerCase();
const password = process.argv[3];

if (!email || !password) {
  console.error(
    "Uso: node scripts/reset-admin-password.mjs email@exemplo.com NovaSenha123"
  );
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: list, error: listError } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});

if (listError) {
  console.error("Erro ao listar usuários:", listError.message);
  process.exit(1);
}

const user = list.users.find(
  (u) => u.email?.toLowerCase() === email
);

if (!user) {
  console.log("Usuário não encontrado em Authentication. Criando...");
  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (createError) {
    console.error("Erro ao criar usuário:", createError.message);
    process.exit(1);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", created.user.id);

  if (profileError) {
    console.error("Usuário criado, mas falhou ao promover admin:", profileError.message);
    process.exit(1);
  }

  console.log("Usuário criado e promovido a admin:", email);
  process.exit(0);
}

const { error: updateError } = await supabase.auth.admin.updateUserById(
  user.id,
  { password, email_confirm: true }
);

if (updateError) {
  console.error("Erro ao redefinir senha:", updateError.message);
  process.exit(1);
}

const { error: profileError } = await supabase
  .from("profiles")
  .update({ role: "admin" })
  .eq("id", user.id);

if (profileError) {
  console.error("Senha atualizada, mas falhou ao promover admin:", profileError.message);
  process.exit(1);
}

console.log("Senha redefinida e role admin confirmado para:", email);
