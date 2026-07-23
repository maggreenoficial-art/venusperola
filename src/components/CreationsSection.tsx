import { creations } from "@/lib/brand";

export function CreationsSection() {
  return (
    <section className="border-t border-white/10 bg-white/[0.02] px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-xs tracking-[0.3em] text-muted uppercase">
          As 7 Criações
        </p>
        <h2 className="mt-3 text-center font-serif text-2xl italic sm:text-3xl">
          Fidelização & Conexão
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-sm text-muted">
          Um lugar seguro e acolhedor — para você voltar sempre.
        </p>

        <div className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {creations.map((item) => (
            <article
              key={item.id}
              className="bg-black p-6 transition-colors hover:bg-white/[0.03]"
            >
              <h3 className="font-serif text-lg italic">{item.name}</h3>
              <p className="mt-1 text-[10px] tracking-[0.15em] text-accent uppercase">
                {item.subtitle}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
