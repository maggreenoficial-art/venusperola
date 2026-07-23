"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLoyalty } from "@/context/LoyaltyContext";
import { loyalty } from "@/lib/loyalty";
import { Loader2 } from "lucide-react";

interface ClubVenusSignupProps {
  compact?: boolean;
}

export function ClubVenusSignup({ compact = false }: ClubVenusSignupProps) {
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { joinClub, isMember, email, pearls } = useLoyalty();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [inputEmail, setInputEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleAuthAndJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const authFn = mode === "signup" ? signUp : signIn;
    const authError = await authFn(inputEmail, password);
    if (authError) {
      setStatus("error");
      setMessage(authError);
      return;
    }

    const joined = await joinClub();
    if (joined) {
      setStatus("success");
      setMessage("Bem-vinda ao Clube Vênus! Suas pérolas foram creditadas.");
    } else {
      setStatus("error");
      setMessage("Conta criada, mas não foi possível entrar no clube. Tente novamente.");
    }
  };

  const handleJoinExisting = async () => {
    setStatus("loading");
    const ok = await joinClub();
    setStatus(ok ? "success" : "error");
    setMessage(ok ? "Bem-vinda ao Clube Vênus!" : "Erro ao entrar no clube.");
  };

  if (authLoading) {
    return <Loader2 className="mx-auto animate-spin text-accent" size={24} />;
  }

  if (isMember && compact) {
    return (
      <p className="text-xs text-accent">
        Membra do Clube · {pearls} pérolas · {email}
      </p>
    );
  }

  if (isMember && !compact) {
    return (
      <div className="rounded border border-accent/30 p-6 text-center">
        <p className="font-serif text-lg italic">Você já é do Clube Vênus</p>
        <p className="mt-2 text-sm text-muted">{email}</p>
        <p className="mt-4 text-2xl text-accent">{pearls} pérolas</p>
        <p className="mt-2 text-xs text-muted">
          Use {loyalty.redeemRate} pérolas para R$ {loyalty.redeemValue} de desconto
        </p>
        <Link href="/conta" className="mt-4 inline-block text-xs text-accent underline">
          Ver minha conta
        </Link>
      </div>
    );
  }

  if (user && !isMember) {
    return (
      <div className={compact ? "" : "text-center"}>
        <p className="mb-4 text-sm text-muted">
          Olá, {user.email}! Entre no Clube para ganhar pérolas.
        </p>
        <button
          onClick={handleJoinExisting}
          disabled={status === "loading"}
          className="rounded-full bg-white px-8 py-3 text-xs font-semibold tracking-widest text-black uppercase hover:bg-accent disabled:opacity-50"
        >
          {status === "loading" ? "Entrando..." : "Entrar no Clube Vênus"}
        </button>
        {message && (
          <p className={`mt-3 text-xs ${status === "error" ? "text-red-400" : "text-accent"}`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleAuthAndJoin}
      className={compact ? "flex flex-col gap-3" : "flex flex-col gap-4"}
    >
      <div className="flex gap-2 text-[10px] tracking-widest uppercase">
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={mode === "signup" ? "text-accent" : "text-muted"}
        >
          Criar conta
        </button>
        <span className="text-muted">·</span>
        <button
          type="button"
          onClick={() => setMode("login")}
          className={mode === "login" ? "text-accent" : "text-muted"}
        >
          Já tenho conta
        </button>
      </div>

      <input
        type="email"
        value={inputEmail}
        onChange={(e) => setInputEmail(e.target.value)}
        placeholder="Seu melhor e-mail"
        required
        className={`border border-white/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent ${
          compact ? "rounded-full" : "w-full"
        }`}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha (mín. 6 caracteres)"
        required
        minLength={6}
        className={`border border-white/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent ${
          compact ? "rounded-full" : "w-full"
        }`}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className={`rounded-full bg-white px-8 py-3 text-xs font-semibold tracking-widest text-black uppercase transition-colors hover:bg-accent disabled:opacity-50 ${
          compact ? "" : "w-full sm:w-auto"
        }`}
      >
        {status === "loading"
          ? "Processando..."
          : mode === "signup"
            ? "Criar conta e entrar no Clube"
            : "Entrar no Clube"}
      </button>
      {message && (
        <p className={`text-xs ${status === "error" ? "text-red-400" : "text-accent"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
