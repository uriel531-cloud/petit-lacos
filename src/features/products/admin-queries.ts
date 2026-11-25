import "server-only";

import type { ProductFormData } from "@/components/admin/products/product-form";
import { db } from "@/lib/db";

/** Categorias e coleções para os campos do formulário. */
export async function productFormOptions() {
  const [categories, collections] = await Promise.all([
    db.category.findMany({ orderBy: { position: "asc" }, select: { id: true, name: true } }),
    db.collection.findMany({ orderBy: { position: "asc" }, select: { id: true, name: true } }),
  ]);
  return { categories, collections };
}

function centsToInput(cents: number | null | undefined) {
  if (cents == null) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

export const EMPTY_PRODUCT: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  measurements: "",
  materials: "",
  care: "",
  categoryId: "",
  collectionIds: [],
  price: "",
  compareAtPrice: "",
  status: "PUBLICADO",
  isNew: true,
  isFeatured: false,
  tags: "",
  stock: "10",
  images: [],
};

export async function getProductForEdit(id: string): Promise<ProductFormData | null> {
  const p = await db.product.findUnique({
    where: { id },
    include: {
      collections: { select: { id: true } },
      images: { orderBy: { position: "asc" }, select: { url: true, alt: true } },
      variants: { orderBy: [{ isDefault: "desc" }, { position: "asc" }], select: { stock: true }, take: 1 },
    },
  });
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    measurements: p.measurements ?? "",
    materials: p.materials ?? "",
    care: p.care ?? "",
    categoryId: p.categoryId ?? "",
    collectionIds: p.collections.map((c) => c.id),
    price: centsToInput(p.priceCents),
    compareAtPrice: centsToInput(p.compareAtPriceCents),
    status: p.status,
    isNew: p.isNew,
    isFeatured: p.isFeatured,
    tags: p.tags.join(", "),
    stock: String(p.variants[0]?.stock ?? 0),
    images: p.images,
  };
}
