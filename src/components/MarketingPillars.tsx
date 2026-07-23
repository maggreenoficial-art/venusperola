import Link from "next/link";
import { marketingStrategies } from "@/lib/marketing";

export function MarketingPillars() {
  return (
    <section className="page-section border-t border-white/10 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-xs tracking-[0.3em] text-accent uppercase">
          Nossa abordagem
        </p>
        <h2 className="mt-4 text-center font-serif text-3xl italic">
          Sexual wellness com estratégia
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-muted">
          Quando anúncios pagos são restritos, conteúdo, comunidade e confiança
          se tornam os canais mais poderosos.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {marketingStrategies.map((s) => (
            <Link
              key={s.id}
              href={s.href}
              className="group border border-white/10 p-6 transition-colors hover:border-accent/40 hover:bg-accent/5"
            >
              <p className="text-[10px] tracking-widest text-muted uppercase">
                {s.reference}
              </p>
              <h3 className="mt-2 text-sm font-medium group-hover:text-accent">
                {s.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {s.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
