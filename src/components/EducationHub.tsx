import Link from "next/link";
import { guides } from "@/lib/marketing";
import { ArrowRight } from "lucide-react";

export function EducationHub() {
  const featured = guides.slice(0, 3);

  return (
    <section className="page-section py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.3em] text-accent uppercase">
              Educação & SEO
            </p>
            <h2 className="mt-2 font-serif text-3xl italic">Guias de bem-estar</h2>
          </div>
          <Link
            href="/guias"
            className="flex items-center gap-2 text-xs tracking-widest text-muted uppercase hover:text-accent"
          >
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {featured.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guias/${guide.slug}`}
              className="group border border-white/10 p-6 transition-colors hover:border-accent/30"
            >
              <span className="text-[10px] tracking-widest text-muted uppercase">
                {guide.readTime} · {guide.category}
              </span>
              <h3 className="mt-3 font-medium leading-snug group-hover:text-accent">
                {guide.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {guide.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
