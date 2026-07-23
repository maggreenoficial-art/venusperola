import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/ProductGrid";
import { collections, getCollectionBySlug } from "@/lib/brand";
import { getAllProducts } from "@/lib/catalog";
import type { Metadata } from "next";

interface ColecoesPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: ColecoesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) return { title: "Coleção não encontrada" };
  return {
    title: collection.name,
    description: collection.description,
  };
}

export default async function ColecaoPage({ params }: ColecoesPageProps) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) notFound();

  const collectionProducts = getAllProducts().filter((p) =>
    (collection.productSlugs as readonly string[]).includes(p.slug)
  );

  return (
    <div className="pt-6 pb-16 sm:pt-10 sm:pb-24">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-xs tracking-[0.3em] text-accent uppercase">
          {collection.tagline}
        </p>
        <h1 className="mt-3 text-center font-serif text-3xl italic sm:text-4xl">
          {collection.name}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-relaxed text-muted">
          {collection.description}
        </p>
        <Link
          href="/loja"
          className="mt-6 block text-center text-xs text-muted underline-offset-4 hover:text-white hover:underline"
        >
          Ver todos os produtos
        </Link>
      </div>

      <div className="mx-auto mt-12 max-w-7xl">
        <ProductGrid
          products={collectionProducts}
          title=""
          showCount={false}
        />
      </div>
    </div>
  );
}
