import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/lib/marketing";

export const metadata: Metadata = {
  title: "Guias de Bem-Estar Íntimo",
  description:
    "Artigos educativos sobre sexual wellness: como escolher produtos, materiais body-safe, higiene, privacidade e saúde sexual.",
  keywords: [
    "guia sexual wellness",
    "como escolher vibrador",
    "materiais body safe",
    "bem-estar íntimo",
  ],
};

export default function GuiasPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10 sm:pb-24">
      <p className="text-xs tracking-[0.3em] text-accent uppercase">
        Educação & SEO
      </p>
      <h1 className="mt-4 font-serif text-4xl italic">Guias de bem-estar</h1>
      <p className="mt-4 text-sm text-muted">
        Conteúdo que desmistifica, educa e posiciona o prazer como saúde — o
        canal mais poderoso quando anúncios pagos são restritos.
      </p>

      <ul className="mt-12 space-y-6">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Link
              href={`/guias/${guide.slug}`}
              className="group block border border-white/10 p-6 transition-colors hover:border-accent/30"
            >
              <div className="flex flex-wrap items-center gap-3 text-[10px] tracking-widest text-muted uppercase">
                <span>{guide.category}</span>
                <span>·</span>
                <span>{guide.readTime}</span>
              </div>
              <h2 className="mt-3 text-lg font-medium group-hover:text-accent">
                {guide.title}
              </h2>
              <p className="mt-2 text-sm text-muted">{guide.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
