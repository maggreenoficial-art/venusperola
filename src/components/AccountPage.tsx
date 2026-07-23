"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLoyalty } from "@/context/LoyaltyContext";
import { formatPrice } from "@/lib/catalog";
import { Loader2, LogOut, User } from "lucide-react";

export function AccountPage() {
  const { user, profile, loading, signIn, signUp, signOut } = useAuth();
  const { pearls, isMember } = useLoyalty();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const err =
      mode === "signup"
        ? await signUp(email, password, fullName)
        : await signIn(email, password);
    if (err) setError(err);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (user && profile) {
    return (
      <div className="mx-auto max-w-lg px-6 pt-6 pb-16 sm:pt-10 sm:pb-24">
        <div className="flex items-center gap-3">
          <User size={24} className="text-accent" />
          <h1 className="font-serif text-3xl italic">Minha conta</h1>
        </div>

        <div className="mt-10 space-y-6 border border-white/10 p-6">
          <div>
            <p className="text-[10px] tracking-widest text-muted uppercase">E-mail</p>
            <p className="mt-1">{profile.email}</p>
          </div>
          {profile.full_name && (
            <div>
              <p className="text-[10px] tracking-widest text-muted uppercase">Nome</p>
              <p className="mt-1">{profile.full_name}</p>
            </div>
          )}
          {isMember && (
            <div>
              <p className="text-[10px] tracking-widest text-muted uppercase">
                Pérolas de Fidelidade
              </p>
              <p className="mt-1 text-2xl text-accent">{pearls} ◆</p>
            </div>
          )}
          {!isMember && (
            <Link
              href="/clube-venus"
              className="inline-block text-sm text-accent underline"
            >
              Entrar no Clube Vênus
            </Link>
          )}
        </div>

        <button
          onClick={signOut}
          className="mt-6 flex items-center gap-2 text-sm text-muted hover:text-red-400"
        >
          <LogOut size={16} />
          Sair da conta
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-6 pt-6 pb-16 sm:pt-10 sm:pb-24">
      <h1 className="font-serif text-3xl italic">Entrar</h1>
      <p className="mt-2 text-sm text-muted">
        Acesse sua conta para acompanhar pedidos e pérolas
      </p>

      <div className="mt-8 flex gap-4 text-xs tracking-widest uppercase">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={mode === "login" ? "text-accent" : "text-muted"}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={mode === "signup" ? "text-accent" : "text-muted"}
        >
          Criar conta
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {mode === "signup" && (
          <Field label="Nome" value={fullName} onChange={setFullName} />
        )}
        <Field label="E-mail" value={email} onChange={setEmail} type="email" />
        <Field label="Senha" value={password} onChange={setPassword} type="password" />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-semibold text-black hover:bg-accent disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="animate-spin" size={18} />
          ) : mode === "signup" ? (
            "Criar conta"
          ) : (
            "Entrar"
          )}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] tracking-widest text-muted uppercase">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        minLength={type === "password" ? 6 : undefined}
        className="w-full border-b border-white/20 bg-transparent py-3 text-sm outline-none focus:border-accent"
      />
    </div>
  );
}
