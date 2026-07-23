import type { Product } from "./products";
import { getDefaultVariant } from "./products";

const FOTO_COELHINHO = "/products/foto-produto-1";

/** Imagens por slug — apontam direto para a pasta original */
export const productImageGallery: Record<string, string[]> = {
  "coelhinho-estimulador-duplo-edicao-luxo": [
    `${FOTO_COELHINHO}/1229-4.jpg`,
    `${FOTO_COELHINHO}/1228-4.jpg`,
    `${FOTO_COELHINHO}/1230-4.jpg`,
    `${FOTO_COELHINHO}/1231-4.jpg`,
    `${FOTO_COELHINHO}/1232-4.jpg`,
  ],
};

export const productMainImage: Record<string, string> = {
  "coelhinho-estimulador-duplo-edicao-luxo": `${FOTO_COELHINHO}/1229-4.jpg`,
};

export function getProductImages(product: Product): string[] {
  if (productImageGallery[product.slug]) {
    return productImageGallery[product.slug];
  }
  return [getDefaultVariant(product).image];
}

export function getVariantImage(product: Product, variantImage: string): string {
  return productMainImage[product.slug] ?? variantImage;
}
