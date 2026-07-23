"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function AffiliateLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/affiliates/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fd.get("email"),
          password: fd.get("password"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/afiliados/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}
      <div>
        <label className="text-xs uppercase tracking-widest text-muted">E-mail</label>
        <input name="email" type="email" required className="mt-1 w-full rounded border border-white/10 bg-black px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-xs uppercase tracking-widest text-muted">Senha</label>
        <input name="password" type="password" required className="mt-1 w-full rounded border border-white/10 bg-black px-3 py-2 text-sm" />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded bg-accent py-3 text-sm font-medium text-black"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        Entrar
      </button>
      <p className="text-center text-xs text-muted">
        Novo afiliado?{" "}
        <Link href="/afiliados/cadastro" className="text-accent underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
