import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateLoginForm } from "@/components/affiliates/AffiliateLoginForm";

export const metadata: Metadata = {
  title: "Login Afiliado | Vênus Pérola",
};

export default function AffiliateLoginPage() {
  return (
    <div className="min-h-screen bg-black px-4 py-16 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/afiliados" className="text-xs text-muted hover:text-white">
          ← Voltar
        </Link>
        <h1 className="mt-6 font-serif text-3xl italic">Área do Afiliado</h1>
        <p className="mt-2 text-sm text-muted">Acesse seu painel de comissões.</p>
        <div className="mt-8">
          <AffiliateLoginForm />
        </div>
      </div>
    </div>
  );
}
