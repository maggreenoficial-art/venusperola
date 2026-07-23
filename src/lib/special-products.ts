import type { Product } from "./products";

export const mysteryBox: Product = {
  id: "mystery-box",
  slug: "mystery-box-perola-secreta",
  name: "Mystery Box — Caixa Misteriosa Pérola",
  category: "vibradores",
  subcategory: "Mystery Box",
  line: "Curiosidade",
  description:
    "Uma surpresa curada especialmente para você. Conteúdo secreto com produto premium, brinde sensorial e bilhete selado.",
  fullDescription:
    "A Mystery Box Vênus Pérola é para quem ama a emoção da descoberta. Cada caixa contém um produto surpresa selecionado da nossa curadoria (valor mínimo garantido de R$ 120), um brinde sensorial exclusivo, bilhete selado de empoderamento e o ritual completo de unboxing premium com perfume exclusivo. O conteúdo exato é revelado apenas ao abrir — mas garantimos: só entra o que nós mesmas usaríamos.",
  tags: [
    "mystery box",
    "surpresa",
    "presente",
    "curiosidade",
    "exclusivo",
    "unboxing",
  ],
  highlights: [
    "Produto surpresa premium",
    "Valor mínimo garantido R$ 120",
    "Unboxing ritual completo",
    "Edição limitada",
  ],
  variationType: null,
  variants: [
    {
      id: "mystery-box-std",
      supplierCode: "MYSTERY-01",
      label: "Caixa Única",
      price: 149.9,
      stock: 10,
      image: "/products/mystery-box.svg",
      originalName: "Mystery Box Pérola Secreta",
    },
  ],
  featured: true,
};

export const mysteryBoxHints = [
  "Pode conter algo da Coleção Pérola Secreta...",
  "Estimulação clitoriana é uma aposta segura.",
  "Silicone médico, sempre.",
  "Quem abriu, não se arrependeu.",
] as const;

export function getSpecialProducts(): Product[] {
  return [mysteryBox];
}

export function isMysteryBox(slug: string): boolean {
  return slug === mysteryBox.slug;
}
