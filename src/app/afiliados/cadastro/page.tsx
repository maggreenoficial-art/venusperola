import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateRegisterForm } from "@/components/affiliates/AffiliateRegisterForm";

export const metadata: Metadata = {
  title: "Cadastro de Afiliado | Vênus Pérola",
};

export default function AffiliateRegisterPage() {
  return (
    <div className="min-h-screen bg-black px-4 py-16 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/afiliados" className="text-xs text-muted hover:text-white">
          ← Voltar
        </Link>
        <h1 className="mt-6 font-serif text-3xl italic">Programa de Afiliados</h1>
        <p className="mt-2 text-sm text-muted">
          Ganhe comissão indicando a Vênus Pérola. Cadastro gratuito.
        </p>
        <div className="mt-8">
          <AffiliateRegisterForm />
        </div>
      </div>
    </div>
  );
}
