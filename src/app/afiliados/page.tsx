import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateTiersPanel } from "@/components/affiliates/AffiliateTiersPanel";

export const metadata: Metadata = {
  title: "Programa de Afiliados | Vênus Pérola",
  description:
    "Ganhe comissão indicando produtos Vênus Pérola. Cookie de 90 dias, pagamento via PIX toda sexta.",
};

export default function AffiliatesLandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black px-4 py-20 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(212,160,168,0.15), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted">
            Programa de Afiliados
          </p>
          <h1 className="mt-4 font-serif text-4xl italic md:text-5xl">
            Indique. Converta. Receba.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-muted">
            Compartilhe seu link exclusivo, acompanhe cliques e vendas em tempo real e
            receba comissões via PIX toda sexta-feira. Evolua de tier e aumente sua
            comissão de 15% até 35%.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/afiliados/cadastro"
              className="rounded bg-accent px-8 py-3 text-sm font-medium text-black transition hover:bg-accent-hover"
            >
              Quero ser afiliado
            </Link>
            <Link
              href="/afiliados/login"
              className="rounded border border-white/20 px-8 py-3 text-sm transition hover:bg-white/5"
            >
              Já sou afiliado
            </Link>
          </div>
        </div>

        <AffiliateTiersPanel variant="landing" className="mt-20" />

        <div className="mt-16 grid gap-6 text-left sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Cadastre-se",
              desc: "Receba seu código único e link ?ref= personalizado.",
            },
            {
              step: "2",
              title: "Divulgue",
              desc: "Cookie de 90 dias rastreia cada visitante que clicar no seu link.",
            },
            {
              step: "3",
              title: "Receba",
              desc: "Comissão creditada na confirmação do pagamento. PIX semanal.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-lg border border-white/10 bg-white/[0.02] p-6 transition hover:border-white/15"
            >
              <span className="text-2xl font-light text-accent">{item.step}</span>
              <h2 className="mt-2 font-medium">{item.title}</h2>
              <p className="mt-2 text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
