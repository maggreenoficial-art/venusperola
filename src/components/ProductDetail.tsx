"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useRef } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductGallery } from "@/components/ProductGallery";
import { UnboxingExperience } from "@/components/UnboxingExperience";
import { getProductImages, getVariantImage } from "@/lib/product-images";
import {
  formatPrice,
  formatPriceRange,
  getDefaultVariant,
  getTotalStock,
  getVariationLabel,
  type Product,
  type ProductVariant,
} from "@/lib/catalog";
import { trackViewContent } from "@/lib/tracking";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(() =>
    getDefaultVariant(product)
  );

  const inStock = selectedVariant.stock > 0;
  const hasMultipleVariants = product.variants.length > 1;
  const priceDisplay = useMemo(() => {
    if (hasMultipleVariants && product.variants.some((v) => v.price !== selectedVariant.price)) {
      return formatPrice(selectedVariant.price);
    }
    return formatPriceRange(product);
  }, [product, selectedVariant, hasMultipleVariants]);

  const galleryImages = getProductImages(product);
  const variantImage = getVariantImage(product, selectedVariant.image);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    trackViewContent({
      id: product.id,
      name: product.name,
      price: selectedVariant.price,
      variantId: selectedVariant.id,
    });
  }, [product.id, product.name, selectedVariant.id, selectedVariant.price]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10 sm:pb-24">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <ProductGallery
          images={
            galleryImages.length > 1
              ? galleryImages.map((img, i) =>
                  i === 0 ? variantImage : img
                )
              : [variantImage]
          }
          alt={product.name}
        />

        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.25em] text-muted">
            {product.line}
          </p>
          <h1 className="mt-2 text-2xl font-medium sm:text-3xl">
            {product.name}
          </h1>
          <p className="mt-4 text-xl text-accent">{priceDisplay}</p>

          <p className="mt-2 text-xs text-muted">
            Código: {selectedVariant.supplierCode}
            {inStock ? (
              <span className="ml-3 text-green-400">
                {selectedVariant.stock} em estoque
              </span>
            ) : (
              <span className="ml-3 text-red-400">Esgotado</span>
            )}
          </p>

          {hasMultipleVariants && product.variationType && (
            <div className="mt-6">
              <p className="mb-3 text-xs font-bold tracking-[0.2em] uppercase">
                {getVariationLabel(product.variationType)}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => {
                  const isSelected = variant.id === selectedVariant.id;
                  const variantAvailable = variant.stock > 0;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`touch-target rounded-full border px-4 py-2.5 text-xs tracking-wide transition-all ${
                        isSelected
                          ? "border-accent bg-accent text-black"
                          : variantAvailable
                            ? "border-white/20 text-white hover:border-accent"
                            : "border-white/10 text-white/40 line-through"
                      }`}
                    >
                      {variant.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className="mt-6 text-sm leading-relaxed text-muted">
            {product.description}
          </p>

          {product.highlights.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {product.highlights.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-white/10 px-3 py-1 text-[10px] tracking-wide text-white/70"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}

          <AddToCartButton product={product} variant={selectedVariant} />

          <p className="mt-4 text-[10px] leading-relaxed text-muted">
            Embalagem discreta · Silicone médico body-safe · Entrega sem menção
            à loja na caixa ou fatura
          </p>

          {getTotalStock(product) === 0 && (
            <p className="mt-3 text-xs text-red-400">
              Todas as variações estão esgotadas no momento.
            </p>
          )}

          <div className="mt-10 border-t border-white/10 pt-8">
            <h2 className="mb-4 text-xs font-bold tracking-[0.2em]">
              DESCRIÇÃO COMPLETA
            </h2>
            <p className="text-sm leading-relaxed text-muted">
              {product.fullDescription}
            </p>
          </div>

          {product.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/loja?q=${encodeURIComponent(tag)}`}
                  className="text-[10px] text-accent/70 hover:text-accent"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-10">
            <UnboxingExperience />
          </div>

          <Link
            href="/loja"
            className="mt-8 text-xs text-muted underline-offset-4 hover:text-white hover:underline"
          >
            ← Voltar para a loja
          </Link>
        </div>
      </div>
    </div>
  );
}
