"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function AffiliateRegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/affiliates/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          cpf: fd.get("cpf"),
          pixKey: fd.get("pixKey"),
          socialProfile: fd.get("socialProfile"),
          password: fd.get("password"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(
        `Cadastro realizado! Seu código: ${data.affiliate.uniqueCode}. ${
          data.affiliate.status === "approved"
            ? "Conta aprovada automaticamente."
            : "Aguardando aprovação (até 24h)."
        }`
      );
      setTimeout(() => router.push("/afiliados/login"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar.");
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
      {success && (
        <div className="rounded border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">
          {success}
        </div>
      )}
      <div>
        <label className="text-xs uppercase tracking-widest text-muted">Nome</label>
        <input name="name" required className="mt-1 w-full rounded border border-white/10 bg-black px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-xs uppercase tracking-widest text-muted">E-mail</label>
        <input name="email" type="email" required className="mt-1 w-full rounded border border-white/10 bg-black px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-xs uppercase tracking-widest text-muted">CPF</label>
        <input name="cpf" className="mt-1 w-full rounded border border-white/10 bg-black px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-xs uppercase tracking-widest text-muted">Chave PIX</label>
        <input name="pixKey" required className="mt-1 w-full rounded border border-white/10 bg-black px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-xs uppercase tracking-widest text-muted">Perfil social (Instagram, etc.)</label>
        <input name="socialProfile" placeholder="https://instagram.com/..." className="mt-1 w-full rounded border border-white/10 bg-black px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-xs uppercase tracking-widest text-muted">Senha</label>
        <input name="password" type="password" required minLength={6} className="mt-1 w-full rounded border border-white/10 bg-black px-3 py-2 text-sm" />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded bg-accent py-3 text-sm font-medium text-black"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        Cadastrar
      </button>
      <p className="text-center text-xs text-muted">
        Já tem conta?{" "}
        <Link href="/afiliados/login" className="text-accent underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
