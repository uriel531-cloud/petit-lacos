import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

import type { CategoryView, ProductDetail, ProductFilters, ProductSort, ProductSummary } from "./types";

export const CATALOG_TAG = "catalogo";

const summaryInclude = {
  category: { select: { name: true, slug: true } },
  images: { orderBy: { position: "asc" }, select: { url: true, alt: true } },
  variants: { where: { active: true }, orderBy: [{ isDefault: "desc" }, { position: "asc" }], select: { id: true, stock: true } },
  reviews: { where: { approved: true }, select: { rating: true } },
} satisfies Prisma.ProductInclude;

type ProductWithSummary = Prisma.ProductGetPayload<{ include: typeof summaryInclude }>;

function toSummary(p: ProductWithSummary): ProductSummary {
  const ratings = p.reviews.map((r) => r.rating);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    categoryName: p.category?.name ?? null,
    categorySlug: p.category?.slug ?? null,
    priceCents: p.priceCents,
    compareAtPriceCents: p.compareAtPriceCents,
    isNew: p.isNew,
    images: p.images.map((i) => ({ url: i.url, alt: i.alt || p.name })),
    defaultVariantId: p.variants[0]?.id ?? null,
    variantCount: p.variants.length,
    stock: p.variants.reduce((sum, v) => sum + v.stock, 0),
    ratingAvg: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
    ratingCount: ratings.length,
  };
}

const VISIBLE: Prisma.ProductWhereInput = { status: { in: ["PUBLICADO", "ESGOTADO"] } };

function orderFor(sort: ProductSort | undefined): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "menor-preco":
      return [{ priceCents: "asc" }];
    case "maior-preco":
      return [{ priceCents: "desc" }];
    case "destaques":
      return [{ isFeatured: "desc" }, { createdAt: "desc" }];
    case "mais-vendidos":
      return [{ orderItems: { _count: "desc" } }, { isFeatured: "desc" }];
    default:
      return [{ isNew: "desc" }, { createdAt: "desc" }];
  }
}

export async function listProducts(filters: ProductFilters = {}): Promise<ProductSummary[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");

  const where: Prisma.ProductWhereInput = { ...VISIBLE };
  if (filters.categoria) where.category = { slug: filters.categoria };
  if (filters.colecao) where.collections = { some: { slug: filters.colecao } };
  if (filters.ordem === "promocoes") where.compareAtPriceCents = { not: null };
  if (filters.q) {
    const q = filters.q.trim().slice(0, 80);
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { tags: { has: q.toLowerCase() } },
    ];
  }

  const products = await db.product.findMany({
    where,
    include: summaryInclude,
    orderBy: orderFor(filters.ordem),
    take: Math.min(filters.limit ?? 60, 100),
  });
  return products.map(toSummary);
}

/** Produtos de uma seção da Home. */
export async function productsForSection(source: string, slug: string, limit: number) {
  switch (source) {
    case "novidades":
      return listProducts({ ordem: "novidades", limit });
    case "destaques":
      return listProducts({ ordem: "destaques", limit });
    case "mais-vendidos":
      return listProducts({ ordem: "mais-vendidos", limit });
    case "promocoes":
      return listProducts({ ordem: "promocoes", limit });
    case "colecao":
      return listProducts({ colecao: slug, limit });
    case "categoria":
      return listProducts({ categoria: slug, limit });
    default:
      return listProducts({ limit });
  }
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  "use cache";
  cacheTag(CATALOG_TAG, `produto-${slug}`);
  cacheLife("hours");

  const p = await db.product.findFirst({
    where: { slug, ...VISIBLE },
    include: {
      ...summaryInclude,
      variants: { where: { active: true }, orderBy: [{ isDefault: "desc" }, { position: "asc" }] },
      reviews: { where: { approved: true }, orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!p) return null;

  return {
    ...toSummary(p),
    description: p.description,
    measurements: p.measurements,
    materials: p.materials,
    care: p.care,
    variants: p.variants.map((v) => ({
      id: v.id,
      name: v.name,
      priceCents: v.priceCents ?? p.priceCents,
      stock: v.stock,
      options: (v.options ?? {}) as Record<string, string>,
    })),
    reviews: p.reviews.map((r) => ({
      id: r.id,
      authorName: r.authorName,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

export async function getPublishedSlugs(): Promise<string[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  const rows = await db.product.findMany({ where: VISIBLE, select: { slug: true } });
  return rows.map((r) => r.slug);
}

export async function getCategories(): Promise<CategoryView[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");

  const categories = await db.category.findMany({
    where: { active: true },
    orderBy: { position: "asc" },
    include: {
      products: {
        where: VISIBLE,
        take: 1,
        orderBy: { isFeatured: "desc" },
        include: { images: { orderBy: { position: "asc" }, take: 1 } },
      },
    },
  });
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    imageUrl: c.imageUrl,
    productImage: c.products[0]?.images[0]?.url ?? null,
  }));
}

export async function getCollections() {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  return db.collection.findMany({ where: { active: true }, orderBy: { position: "asc" }, select: { name: true, slug: true } });
}
