import { testimonials } from "@/lib/brand";

export function TestimonialsSection() {
  return (
    <section id="depoimentos" className="px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-xs tracking-[0.3em] text-muted uppercase">
          Prova social
        </p>
        <h2 className="mt-3 text-center font-serif text-2xl italic sm:text-3xl">
          Quem já descobriu a pérola
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <blockquote
              key={item.id}
              className="flex flex-col justify-between border border-white/10 p-8"
            >
              <p className="text-sm leading-relaxed text-white/80 italic">
                &ldquo;{item.text}&rdquo;
              </p>
              <footer className="mt-6 text-xs tracking-wide text-muted">
                — {item.author}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
