import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const csvPath =
  process.argv[2] ||
  path.join(projectRoot, "data/planilha_precificacao_completa.csv");
const outputPath = path.join(projectRoot, "src/lib/products.ts");

const COLOR_CODES = {
  RS: "Rosa",
  RX: "Roxo",
  AZ: "Azul",
  LL: "Lilás",
  PK: "Pink",
  PT: "Preto",
  VM: "Vermelho",
  DR: "Dourado",
};

const categoryMap = {
  Vibradores: "vibradores",
  "Pênis Realísticos": "penis-realisticos",
  "Plug Anal": "plug-anal",
};

function parseCSV(content) {
  const rows = [];
  let current = "";
  let inQuotes = false;
  const lines = [];

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (current.trim()) lines.push(current);
      current = "";
      if (char === "\r" && content[i + 1] === "\n") i++;
    } else {
      current += char;
    }
  }
  if (current.trim()) lines.push(current);

  for (const line of lines) {
    const fields = [];
    let field = "";
    let quoted = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (quoted && line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = !quoted;
        }
      } else if (char === "," && !quoted) {
        fields.push(field);
        field = "";
      } else {
        field += char;
      }
    }
    fields.push(field);
    rows.push(fields);
  }

  return rows;
}

function parsePrice(value) {
  const cleaned = value
    .replace(/R\$\s?/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return parseFloat(cleaned);
}

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getBaseName(commercialName, groupKey) {
  if (groupKey === "jewel-plug") return "Jewel Plug";
  return commercialName.replace(/\s*\([^)]+\)\s*$/, "").trim();
}

function getVariantLabel(commercialName, supplierCode, subcategory, groupKey) {
  if (groupKey === "jewel-plug") {
    if (commercialName.includes("Jewel Plug P")) return "P · Pedra Vermelha";
    const parenMatch = commercialName.match(/\(([^)]+)\)\s*$/);
    if (parenMatch) return `G · ${parenMatch[1]}`;
    return supplierCode;
  }

  const parenMatch = commercialName.match(/\(([^)]+)\)\s*$/);
  if (parenMatch) return parenMatch[1];

  const suffix = supplierCode.includes("-")
    ? supplierCode.split("-").pop()
    : null;
  if (suffix && COLOR_CODES[suffix]) return COLOR_CODES[suffix];

  if (subcategory.includes("Tamanho P")) return "P";
  if (subcategory.includes("Tamanho G")) return "G";

  return supplierCode;
}

function getGroupKey(supplierCode, commercialName) {
  if (commercialName.startsWith("Jewel Plug")) return "jewel-plug";

  const dashIndex = supplierCode.lastIndexOf("-");
  if (dashIndex > 0) {
    const base = supplierCode.slice(0, dashIndex);
    const suffix = supplierCode.slice(dashIndex + 1);
    if (/^[A-Z]{2}$/.test(suffix)) return base.toLowerCase();
  }

  return supplierCode.toLowerCase();
}

function getVariationType(groupKey, subcategory, variantCount) {
  if (variantCount <= 1) return null;
  if (groupKey === "jewel-plug") return "tamanho";
  if (/tamanho/i.test(subcategory)) return "tamanho";
  return "cor";
}

const content = fs.readFileSync(csvPath, "utf-8");
const rows = parseCSV(content);
const [, ...dataRows] = rows;

const skus = dataRows.map((row) => {
  const [
    supplierCode,
    originalName,
    commercialName,
    category,
    subcategory,
    stock,
    ,
    ,
    salePrice,
    ,
    ,
    simpleDescription,
    fullDescription,
    tags,
    highlights,
  ] = row;

  const categoryId = categoryMap[category];
  if (!categoryId) throw new Error(`Categoria desconhecida: ${category}`);

  return {
    supplierCode,
    originalName,
    commercialName,
    baseName: getBaseName(commercialName, getGroupKey(supplierCode, commercialName)),
    groupKey: getGroupKey(supplierCode, commercialName),
    category: categoryId,
    subcategory,
    stock: parseInt(stock, 10),
    price: parsePrice(salePrice),
    description: simpleDescription,
    fullDescription,
    tags: tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    highlights: highlights
      .split("|")
      .map((h) => h.trim())
      .filter(Boolean),
    image: `/products/${slugify(supplierCode)}.svg`,
    variantLabel: getVariantLabel(
      commercialName,
      supplierCode,
      subcategory,
      getGroupKey(supplierCode, commercialName)
    ),
  };
});

const groups = new Map();
for (const sku of skus) {
  if (!groups.has(sku.groupKey)) groups.set(sku.groupKey, []);
  groups.get(sku.groupKey).push(sku);
}

const usedSlugs = new Set();
const products = [];

for (const [groupKey, items] of groups) {
  const first = items[0];
  let slug =
    groupKey === "jewel-plug" ? "jewel-plug" : slugify(first.baseName);
  if (usedSlugs.has(slug)) slug = `${slug}-${groupKey}`;
  usedSlugs.add(slug);

  const variationType = getVariationType(
    groupKey,
    first.subcategory,
    items.length
  );

  const variants = items.map((item) => ({
    id: item.supplierCode,
    supplierCode: item.supplierCode,
    label: item.variantLabel,
    price: item.price,
    stock: item.stock,
    image: item.image,
    originalName: item.originalName,
  }));

  products.push({
    id: groupKey,
    slug,
    name: groupKey === "jewel-plug" ? "Jewel Plug" : first.baseName,
    category: first.category,
    subcategory:
      groupKey === "jewel-plug" ? "Plug Anal com Pedra Decorativa" : first.subcategory,
    line:
      groupKey === "jewel-plug" ? "Plug Anal com Pedra Decorativa" : first.subcategory,
    description:
      groupKey === "jewel-plug"
        ? "Plug anal de silicone médico com pedra decorativa na base. Disponível em tamanho P para iniciantes e tamanho G para usuários experientes."
        : first.description,
    fullDescription:
      groupKey === "jewel-plug"
        ? "O Jewel Plug combina elegância e prazer em um acessório erótico sofisticado. Feito 100% em silicone médico hipoalergênico, disponível em tamanho P (iniciante) e tamanho G (avançado) com diversas opções de cor e pedra decorativa. A base em formato de joia garante segurança total durante o uso."
        : first.fullDescription,
    tags: first.tags,
    highlights: first.highlights,
    variationType,
    variants,
    featured: products.length < 12,
  });
}

const fixedTs = `export type Category =
  | "vibradores"
  | "penis-realisticos"
  | "plug-anal";

export type VariationType = "cor" | "tamanho";

export interface ProductVariant {
  id: string;
  supplierCode: string;
  label: string;
  price: number;
  stock: number;
  image: string;
  originalName: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  subcategory: string;
  line: string;
  description: string;
  fullDescription: string;
  tags: string[];
  highlights: string[];
  variationType: VariationType | null;
  variants: ProductVariant[];
  featured?: boolean;
}

export const categories: { id: Category; label: string }[] = [
  { id: "vibradores", label: "Vibradores" },
  { id: "penis-realisticos", label: "Pênis Realísticos" },
  { id: "plug-anal", label: "Plug Anal" },
];

export const products: Product[] = ${JSON.stringify(products, null, 2)};

export function getMinPrice(product: Product): number {
  return Math.min(...product.variants.map((v) => v.price));
}

export function getMaxPrice(product: Product): number {
  return Math.max(...product.variants.map((v) => v.price));
}

export function getTotalStock(product: Product): number {
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}

export function getDefaultVariant(product: Product): ProductVariant {
  const inStock = product.variants.find((v) => v.stock > 0);
  return inStock ?? product.variants[0];
}

export function getVariantById(
  product: Product,
  variantId: string
): ProductVariant | undefined {
  return product.variants.find((v) => v.id === variantId);
}

export function formatPriceRange(product: Product): string {
  const min = getMinPrice(product);
  const max = getMaxPrice(product);
  if (min === max) return formatPrice(min);
  return \`A partir de \${formatPrice(min)}\`;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: Category): Product[] {
  return products.filter((p) => p.category === category);
}

export function getProductsInStock(): Product[] {
  return products.filter((p) => getTotalStock(p) > 0);
}

export function formatPrice(price: number): string {
  return price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function getVariationLabel(type: VariationType): string {
  return type === "cor" ? "Cor" : "Tamanho";
}
`;

fs.writeFileSync(outputPath, fixedTs, "utf-8");
console.log(
  `✓ ${products.length} produtos (${skus.length} variações) importados`
);
