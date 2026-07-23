import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuideBySlug, guides } from "@/lib/marketing";
import { NewsletterSignup } from "@/components/NewsletterSignup";

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: "Guia não encontrado" };

  return {
    title: guide.title,
    description: guide.excerpt,
    keywords: guide.seoKeywords,
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  return (
    <article className="mx-auto max-w-2xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10 sm:pb-24">
      <Link
        href="/guias"
        className="text-xs text-muted hover:text-accent"
      >
        ← Todos os guias
      </Link>

      <header className="mt-6">
        <div className="flex gap-3 text-[10px] tracking-widest text-muted uppercase">
          <span>{guide.category}</span>
          <span>·</span>
          <span>{guide.readTime} de leitura</span>
        </div>
        <h1 className="mt-4 font-serif text-3xl italic sm:text-4xl">
          {guide.title}
        </h1>
        <p className="mt-4 text-muted">{guide.excerpt}</p>
      </header>

      <div className="mt-12 space-y-10">
        {guide.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-medium">{section.heading}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-16">
        <NewsletterSignup compact />
      </div>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link
          href="/loja"
          className="rounded-full bg-white px-6 py-2.5 text-xs font-semibold tracking-widest text-black uppercase hover:bg-accent"
        >
          Ver produtos
        </Link>
        <Link
          href="/bem-estar"
          className="rounded-full border border-white/20 px-6 py-2.5 text-xs tracking-widest uppercase hover:border-accent"
        >
          Bem-estar íntimo
        </Link>
      </div>
    </article>
  );
}
