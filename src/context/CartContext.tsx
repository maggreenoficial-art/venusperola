"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getAllProducts } from "@/lib/catalog";
import type { Product, ProductVariant } from "@/lib/products";

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

interface StoredCartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

function cartItemKey(productId: string, variantId: string) {
  return `${productId}:${variantId}`;
}

const CART_STORAGE_KEY = "venus-perola-cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const stored = JSON.parse(raw) as StoredCartItem[];
    const products = getAllProducts();

    return stored
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        const variant = product?.variants.find((v) => v.id === item.variantId);
        if (!product || !variant) return null;
        return { product, variant, quantity: item.quantity };
      })
      .filter((i): i is CartItem => i !== null);
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  const stored: StoredCartItem[] = items.map((i) => ({
    productId: i.product.id,
    variantId: i.variant.id,
    quantity: i.quantity,
  }));
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(stored));
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isHydrated: boolean;
  addItem: (product: Product, variant: ProductVariant) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (
    productId: string,
    variantId: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) saveCart(items);
  }, [items, isHydrated]);

  const addItem = useCallback((product: Product, variant: ProductVariant) => {
    if (variant.stock <= 0) return;

    setItems((prev) => {
      const key = cartItemKey(product.id, variant.id);
      const existing = prev.find(
        (i) => cartItemKey(i.product.id, i.variant.id) === key
      );
      if (existing) {
        const newQty = Math.min(existing.quantity + 1, variant.stock);
        return prev.map((i) =>
          cartItemKey(i.product.id, i.variant.id) === key
            ? { ...i, quantity: newQty }
            : i
        );
      }
      return [...prev, { product, variant, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, variantId: string) => {
    const key = cartItemKey(productId, variantId);
    setItems((prev) =>
      prev.filter((i) => cartItemKey(i.product.id, i.variant.id) !== key)
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, variantId: string, quantity: number) => {
      const key = cartItemKey(productId, variantId);
      if (quantity <= 0) {
        setItems((prev) =>
          prev.filter((i) => cartItemKey(i.product.id, i.variant.id) !== key)
        );
        return;
      }
      setItems((prev) =>
        prev.map((i) => {
          if (cartItemKey(i.product.id, i.variant.id) !== key) return i;
          return { ...i, quantity: Math.min(quantity, i.variant.stock) };
        })
      );
    },
    []
  );

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.variant.price * i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      totalItems,
      totalPrice,
      isHydrated,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }),
    [
      items,
      totalItems,
      totalPrice,
      isHydrated,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isOpen,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
