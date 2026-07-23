import Link from "next/link";
import { sins } from "@/lib/brand";

export function SinsSection() {
  return (
    <section className="border-t border-white/10 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-xs tracking-[0.3em] text-muted uppercase">
          Os 7 Pecados Capitais
        </p>
        <h2 className="mt-3 text-center font-serif text-2xl italic sm:text-3xl">
          Atração & Compra
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-sm text-muted">
          Impulsos transformados em desejo imediato — quebrando tabus com
          sofisticação.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sins.map((sin) => (
            <article
              key={sin.id}
              className="flex flex-col border border-white/10 p-6 transition-colors hover:border-accent/50"
            >
              <p className="text-[10px] tracking-[0.2em] text-accent uppercase">
                {sin.role}
              </p>
              <h3 className="mt-2 font-serif text-lg italic">{sin.name}</h3>
              <p className="mt-3 text-sm font-medium leading-snug">
                {sin.headline}
              </p>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-muted">
                {sin.description}
              </p>
              <Link
                href={sin.href}
                className="mt-4 text-[10px] tracking-widest text-white/50 uppercase transition-colors hover:text-accent"
              >
                {sin.cta} →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
