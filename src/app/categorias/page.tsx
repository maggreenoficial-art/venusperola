import Link from "next/link";
import { categories } from "@/lib/catalog";
import { getProductsByCategory } from "@/lib/catalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categorias",
  description: "Navegue por categoria e encontre o produto ideal.",
};

export default function CategoriasPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10 sm:pb-24">
      <h1 className="mb-12 text-center text-sm font-bold tracking-[0.25em]">
        COMPRAR POR CATEGORIA:
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const count = getProductsByCategory(cat.id).length;
          return (
            <Link
              key={cat.id}
              href={`/loja?categoria=${cat.id}`}
              className="group flex flex-col items-center justify-center border border-white/10 bg-black px-8 py-16 transition-all hover:border-accent"
            >
              <h2 className="text-lg font-medium tracking-wide transition-colors group-hover:text-accent">
                {cat.label}
              </h2>
              <p className="mt-2 text-xs text-muted">
                {count} {count === 1 ? "produto" : "produtos"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
