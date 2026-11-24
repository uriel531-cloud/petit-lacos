/** Tipos do catálogo seguros para Client Components (sem dados internos como custo). */

export type ProductImageView = { url: string; alt: string };

export type ProductSummary = {
  id: string;
  slug: string;
  name: string;
  categoryName: string | null;
  categorySlug: string | null;
  priceCents: number;
  compareAtPriceCents: number | null;
  isNew: boolean;
  images: ProductImageView[];
  /** Variação padrão (para "comprar" direto do card) */
  defaultVariantId: string | null;
  variantCount: number;
  stock: number;
  ratingAvg: number | null;
  ratingCount: number;
};

export type ProductVariantView = {
  id: string;
  name: string;
  priceCents: number;
  stock: number;
  options: Record<string, string>;
};

export type ProductDetail = ProductSummary & {
  description: string;
  measurements: string | null;
  materials: string | null;
  care: string | null;
  variants: ProductVariantView[];
  reviews: { id: string; authorName: string; rating: number; comment: string | null; createdAt: string }[];
};

export type CategoryView = { id: string; name: string; slug: string; imageUrl: string | null; productImage: string | null };

export type ProductSort = "novidades" | "menor-preco" | "maior-preco" | "promocoes" | "destaques" | "mais-vendidos";

export type ProductFilters = {
  categoria?: string;
  colecao?: string;
  ordem?: ProductSort;
  q?: string;
  limit?: number;
};
