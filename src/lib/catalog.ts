import { getSpecialProducts } from "./special-products";
import {
  products,
  type Category,
  type Product,
  type ProductVariant,
  type VariationType,
  getMinPrice,
  getMaxPrice,
  getTotalStock,
  getDefaultVariant,
  getVariantById,
  formatPriceRange,
  formatPrice,
  getVariationLabel,
  categories,
} from "./products";

export {
  type Category,
  type Product,
  type ProductVariant,
  type VariationType,
  getMinPrice,
  getMaxPrice,
  getTotalStock,
  getDefaultVariant,
  getVariantById,
  formatPriceRange,
  formatPrice,
  getVariationLabel,
  categories,
  products,
};

export function getAllProducts(): Product[] {
  return [...products, ...getSpecialProducts()];
}

export function getCatalogProductBySlug(slug: string): Product | undefined {
  return getAllProducts().find((p) => p.slug === slug);
}

export function getProductsByCategory(category: Category): Product[] {
  return getAllProducts().filter((p) => p.category === category);
}

export function getProductsInStock(): Product[] {
  return getAllProducts().filter((p) => getTotalStock(p) > 0);
}
