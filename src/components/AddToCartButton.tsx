"use client";

import { useCart } from "@/context/CartContext";
import { trackAddToCart } from "@/lib/tracking";
import type { Product, ProductVariant } from "@/lib/products";

interface AddToCartButtonProps {
  product: Product;
  variant: ProductVariant;
}

export function AddToCartButton({ product, variant }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const inStock = variant.stock > 0;

  const handleClick = () => {
    addItem(product, variant);
    trackAddToCart({
      id: product.id,
      name: product.name,
      price: variant.price,
      variantId: variant.id,
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={!inStock}
      className="mt-8 w-full max-w-sm rounded-full bg-white py-3.5 text-sm font-semibold tracking-wide text-black transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-12"
    >
      {inStock ? "Adicionar ao carrinho" : "Variação esgotada"}
    </button>
  );
}
