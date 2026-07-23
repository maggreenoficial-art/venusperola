"use client";

import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";

export function NewsletterSignup({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) {
      setStatus("error");
      setMessage(data.error ?? "Erro ao inscrever.");
      return;
    }

    setStatus("success");
    setMessage("Inscrita! Verifique seu e-mail em breve.");
    setEmail("");
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Seu e-mail"
          required
          className="flex-1 rounded-full border border-white/20 bg-transparent px-4 py-2 text-xs outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 rounded-full bg-white px-4 py-2 text-[10px] font-semibold tracking-widest text-black uppercase hover:bg-accent disabled:opacity-50"
        >
          {status === "loading" ? "..." : "OK"}
        </button>
      </form>
    );
  }

  return (
    <div id="newsletter" className="border border-white/10 p-8 sm:p-12">
      <div className="flex items-center gap-3">
        <Mail size={20} className="text-accent" />
        <p className="text-xs tracking-[0.3em] text-accent uppercase">
          Newsletter exclusiva
        </p>
      </div>
      <h2 className="mt-4 font-serif text-2xl italic sm:text-3xl">
        Conteúdo sem censura, direto no seu e-mail
      </h2>
      <p className="mt-3 max-w-lg text-sm text-muted">
        Guias de bem-estar íntimo, ofertas exclusivas, lançamentos e pérolas de
        fidelidade — um canal próprio, livre das restrições das redes sociais.
      </p>

      {status === "success" ? (
        <div className="mt-6 flex items-center gap-2 text-accent">
          <CheckCircle size={18} />
          <p className="text-sm">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:max-w-md">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            className="flex-1 border-b border-white/20 bg-transparent py-3 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-full bg-white px-8 py-3 text-xs font-semibold tracking-widest text-black uppercase hover:bg-accent disabled:opacity-50"
          >
            {status === "loading" ? "Inscrevendo..." : "Quero receber"}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className="mt-3 text-sm text-red-400">{message}</p>
      )}

      <p className="mt-4 text-[10px] text-muted">
        Sem spam. Cancele quando quiser. +5 Pérolas de Fidelidade ao se inscrever.
      </p>
    </div>
  );
}
