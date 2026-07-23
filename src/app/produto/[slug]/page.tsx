import { ProductDetail } from "@/components/ProductDetail";
import { getCatalogProductBySlug, getAllProducts } from "@/lib/catalog";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface ProdutoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: ProdutoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getCatalogProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado" };
  return {
    title: product.name,
    description: product.description,
    keywords: product.tags,
  };
}

export default async function ProdutoPage({ params }: ProdutoPageProps) {
  const { slug } = await params;
  const product = getCatalogProductBySlug(slug);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
