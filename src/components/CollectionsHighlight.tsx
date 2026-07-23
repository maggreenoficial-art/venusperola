import Link from "next/link";
import { collections } from "@/lib/brand";

export function CollectionsHighlight() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-xs tracking-[0.3em] text-accent uppercase">
          Coleções exclusivas
        </p>
        <h2 className="mt-3 text-center font-serif text-2xl italic sm:text-3xl">
          Curadas para o seu tesouro
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/colecoes/${collection.slug}`}
              className="group relative overflow-hidden border border-white/10 bg-black p-8 transition-all hover:border-accent sm:p-10"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/10 blur-2xl transition-all group-hover:bg-accent/20" />
              <p className="text-[10px] tracking-[0.25em] text-accent uppercase">
                {collection.tagline}
              </p>
              <h3 className="mt-2 font-serif text-xl italic sm:text-2xl">
                {collection.name}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {collection.description}
              </p>
              <span className="mt-6 inline-block text-xs tracking-widest text-white/60 uppercase transition-colors group-hover:text-accent">
                Explorar coleção →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
