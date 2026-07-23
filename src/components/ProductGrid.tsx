import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/products";

interface ProductGridProps {
  products: Product[];
  title?: string;
  showCount?: boolean;
}

export function ProductGrid({
  products,
  title = "VER TODOS OS PRODUTOS:",
  showCount = true,
}: ProductGridProps) {
  return (
    <section className="page-section pb-16 sm:pb-24">
      {title && (
        <h2 className="mb-8 text-center text-sm font-bold tracking-[0.25em]">
          {title}
        </h2>
      )}

      {showCount && (
        <p className="mb-6 text-xs text-muted">
          Mostrando 1–{products.length} de {products.length}{" "}
          {products.length === 1 ? "resultado" : "resultados"}
        </p>
      )}

      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
