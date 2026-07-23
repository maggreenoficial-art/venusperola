"use client";

import Image from "next/image";
import Link from "next/link";
import {
  formatPriceRange,
  getDefaultVariant,
  getTotalStock,
  type Product,
} from "@/lib/catalog";
import { getVariantImage } from "@/lib/product-images";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const defaultVariant = getDefaultVariant(product);
  const image = getVariantImage(product, defaultVariant.image);
  const totalStock = getTotalStock(product);
  const inStock = totalStock > 0;
  const hasMultipleVariants = product.variants.length > 1;

  return (
    <article className="group flex flex-col">
      <Link href={`/produto/${product.slug}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-white">
          <ProductImage
            name={product.name}
            image={image}
          />
          {!inStock && (
            <span className="absolute left-3 top-3 rounded-full bg-black/80 px-2 py-1 text-[10px] tracking-widest uppercase text-white/60">
              Esgotado
            </span>
          )}
          {hasMultipleVariants && inStock && (
            <span className="absolute right-3 top-3 rounded-full bg-black/80 px-2 py-1 text-[10px] tracking-widest uppercase text-white/60">
              {product.variants.length} opções
            </span>
          )}
        </div>
      </Link>

      <div className="mt-4 flex flex-col gap-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
          {product.line}
        </p>
        <Link href={`/produto/${product.slug}`}>
          <h3 className="text-sm font-medium leading-snug transition-colors group-hover:text-accent">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-accent">{formatPriceRange(product)}</p>
        <Link
          href={`/produto/${product.slug}`}
          className="touch-target mt-2 flex w-full items-center justify-center rounded-full border border-white/20 py-2.5 text-center text-xs tracking-widest uppercase transition-all hover:border-accent hover:bg-accent hover:text-black"
        >
          {hasMultipleVariants ? "Escolher opção" : inStock ? "Ver produto" : "Esgotado"}
        </Link>
      </div>
    </article>
  );
}

function ProductImage({ name, image }: { name: string; image: string }) {
  const isRealPhoto = image.endsWith(".jpg") || image.endsWith(".png") || image.endsWith(".webp");

  return (
    <div className="relative h-full w-full">
      <Image
        src={image}
        alt={name}
        fill
        className="object-contain transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
        }}
      />
      {!isRealPhoto && <PlaceholderFallback name={name} />}
    </div>
  );
}

function PlaceholderFallback({ name }: { name: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
      <div className="h-24 w-24 rounded-full border border-white/10 bg-gradient-to-br from-white/5 to-transparent" />
      <span className="text-center text-[10px] leading-tight text-white/30">
        {name}
      </span>
    </div>
  );
}
