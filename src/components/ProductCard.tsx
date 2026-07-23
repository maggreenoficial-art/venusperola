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
    <article className="group flex min-w-0 w-full flex-col">
      <Link href={`/produto/${product.slug}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-white">
          <ProductImage
            name={product.name}
            image={image}
          />
          {!inStock && (
            <span className="absolute left-2 top-2 rounded-full bg-black/80 px-2.5 py-1 text-xs tracking-wide uppercase text-white/80 sm:left-3 sm:top-3">
              Esgotado
            </span>
          )}
          {hasMultipleVariants && inStock && (
            <span className="absolute right-2 top-2 rounded-full bg-black/80 px-2.5 py-1 text-xs tracking-wide uppercase text-white/80 sm:right-3 sm:top-3">
              {product.variants.length} opções
            </span>
          )}
        </div>
      </Link>

      <div className="mt-3 flex flex-col gap-1.5 sm:mt-4">
        <p className="text-xs uppercase tracking-[0.15em] text-muted sm:text-sm">
          {product.line}
        </p>
        <Link href={`/produto/${product.slug}`}>
          <h3 className="text-base font-medium leading-snug transition-colors group-hover:text-accent sm:text-lg">
            {product.name}
          </h3>
        </Link>
        <p className="text-base text-accent sm:text-lg">{formatPriceRange(product)}</p>
        <Link
          href={`/produto/${product.slug}`}
          className="touch-target mt-1 flex w-full items-center justify-center rounded-full border border-white/20 py-3 text-center text-sm tracking-widest uppercase transition-all hover:border-accent hover:bg-accent hover:text-black"
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
