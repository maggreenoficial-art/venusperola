import { ProductGrid } from "@/components/ProductGrid";
import { getAllProducts } from "@/lib/catalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loja",
  description: "Explore todos os produtos OUTBELLE BRASIL.",
};

interface LojaPageProps {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}

export default async function LojaPage({ searchParams }: LojaPageProps) {
  const params = await searchParams;
  const query = params.q?.toLowerCase() ?? "";
  const category = params.categoria;

  let filtered = getAllProducts();

  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (query) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.line.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query)) ||
        p.variants.some((v) => v.label.toLowerCase().includes(query))
    );
  }

  const title = query
    ? `RESULTADOS PARA "${query.toUpperCase()}":`
    : category
      ? `CATEGORIA: ${category.toUpperCase()}`
      : "VER TODOS OS PRODUTOS:";

  return (
    <div className="mx-auto max-w-7xl pt-6 sm:pt-10">
      <ProductGrid products={filtered} title={title} />
    </div>
  );
}
