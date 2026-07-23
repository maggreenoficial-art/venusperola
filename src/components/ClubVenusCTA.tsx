import { ClubVenusSignup } from "@/components/ClubVenusSignup";
import Link from "next/link";

export function ClubVenusCTA() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-2xl border border-accent/30 px-8 py-12 sm:px-12">
        <p className="text-center text-xs tracking-[0.3em] text-accent uppercase">
          Clube Vênus
        </p>
        <h2 className="mt-3 text-center font-serif text-2xl italic sm:text-3xl">
          Faça parte da comunidade
        </h2>
        <p className="mt-4 text-center text-sm leading-relaxed text-muted">
          Ganhe {5} Pérolas de boas-vindas, acumule cashback a cada compra e
          receba brindes sensoriais exclusivos.
        </p>

        <div className="mt-8">
          <ClubVenusSignup />
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-4 text-center">
          <Link
            href="/clube-venus"
            className="text-[10px] tracking-widest text-muted uppercase hover:text-accent"
          >
            Saiba mais →
          </Link>
          <Link
            href="/mystery-box"
            className="text-[10px] tracking-widest text-muted uppercase hover:text-accent"
          >
            Mystery Box →
          </Link>
        </div>
      </div>
    </section>
  );
}
