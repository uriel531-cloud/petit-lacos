"use server";

import { randomBytes } from "node:crypto";

import { updateTag } from "next/cache";
import sharp from "sharp";
import { z } from "zod";

import { requirePermission } from "@/features/auth/session";
import { CATALOG_TAG } from "@/features/catalog/queries";
import { logActivity } from "@/lib/activity";
import { db } from "@/lib/db";
import { deleteStoredImage, storeImage } from "@/lib/storage";

import { slugify } from "./slug";

export type SaveProductResult = { ok: true; id: string } | { ok: false; error: string };
export type SimpleResult = { ok: true } | { ok: false; error: string };

function fail(error: unknown): { ok: false; error: string } {
  return { ok: false, error: error instanceof Error ? error.message : "Algo deu errado. Tente de novo." };
}

const optionalText = z
  .string()
  .trim()
  .max(2000)
  .transform((v) => (v ? v : null))
  .nullable()
  .optional();

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Dê um nome ao produto").max(120),
  slug: z.string().trim().max(120).optional(),
  description: z.string().trim().max(5000).default(""),
  measurements: optionalText,
  materials: optionalText,
  care: optionalText,
  categoryId: z.string().nullable().optional(),
  collectionIds: z.array(z.string()).max(50).default([]),
  priceCents: z.number().int().min(1, "Informe o preço").max(10_000_000),
  compareAtPriceCents: z.number().int().min(0).max(10_000_000).nullable().optional(),
  status: z.enum(["RASCUNHO", "PUBLICADO", "ESGOTADO", "ARQUIVADO"]),
  isNew: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string().trim().toLowerCase().min(1).max(40)).max(30).default([]),
  stock: z.number().int().min(0).max(100_000),
  images: z
    .array(z.object({ url: z.string().min(1).max(1000), alt: z.string().trim().max(200).default("") }))
    .max(20, "Use no máximo 20 fotos"),
});

export type ProductInput = z.input<typeof productSchema>;

/** Cria ou atualiza um produto (dados, coleções, fotos e estoque da variação padrão). */
export async function saveProduct(input: ProductInput): Promise<SaveProductResult> {
  try {
    const user = await requirePermission("GERENCIAR_PRODUTOS");
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const data = parsed.data;

    const slug = slugify(data.slug || data.name);
    if (!slug) return { ok: false, error: "Não foi possível gerar o endereço do produto. Ajuste o nome." };

    const clash = await db.product.findUnique({ where: { slug }, select: { id: true } });
    if (clash && clash.id !== data.id) {
      return { ok: false, error: `Já existe um produto com o endereço "${slug}". Troque o nome ou o endereço.` };
    }

    if (data.compareAtPriceCents && data.compareAtPriceCents <= data.priceCents) {
      return { ok: false, error: "O preço “de” (riscado) precisa ser maior que o preço de venda." };
    }

    const existing = data.id
      ? await db.product.findUnique({
          where: { id: data.id },
          select: { id: true, slug: true, publishedAt: true, images: { select: { url: true } } },
        })
      : null;
    if (data.id && !existing) return { ok: false, error: "Produto não encontrado. Ele pode ter sido excluído." };

    const fields = {
      name: data.name,
      slug,
      description: data.description,
      measurements: data.measurements ?? null,
      materials: data.materials ?? null,
      care: data.care ?? null,
      status: data.status,
      isNew: data.isNew,
      isFeatured: data.isFeatured,
      priceCents: data.priceCents,
      compareAtPriceCents: data.compareAtPriceCents || null,
      tags: [...new Set(data.tags)],
      publishedAt: data.status === "PUBLICADO" ? (existing?.publishedAt ?? new Date()) : (existing?.publishedAt ?? null),
    };
    const categoryId = data.categoryId || null;
    const images = data.images.map((img, position) => ({ url: img.url, alt: img.alt, position }));

    const id = await db.$transaction(async (tx) => {
      let productId: string;
      if (existing) {
        await tx.product.update({
          where: { id: existing.id },
          data: {
            ...fields,
            category: categoryId ? { connect: { id: categoryId } } : { disconnect: true },
            collections: { set: data.collectionIds.map((cid) => ({ id: cid })) },
          },
        });
        productId = existing.id;
        await tx.productImage.deleteMany({ where: { productId } });
      } else {
        const created = await tx.product.create({
          data: {
            ...fields,
            ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
            collections: { connect: data.collectionIds.map((cid) => ({ id: cid })) },
          },
          select: { id: true },
        });
        productId = created.id;
      }

      if (images.length) {
        await tx.productImage.createMany({ data: images.map((img) => ({ ...img, productId })) });
      }

      const variant = await tx.productVariant.findFirst({
        where: { productId },
        orderBy: [{ isDefault: "desc" }, { position: "asc" }],
        select: { id: true },
      });
      if (variant) {
        await tx.productVariant.update({ where: { id: variant.id }, data: { stock: data.stock } });
      } else {
        const baseSku = `PL-${slug.toUpperCase()}`.slice(0, 60);
        const skuTaken = await tx.productVariant.findUnique({ where: { sku: baseSku }, select: { id: true } });
        const sku = skuTaken ? `${baseSku}-${randomBytes(2).toString("hex").toUpperCase()}` : baseSku;
        await tx.productVariant.create({
          data: { productId, sku, name: "Padrão", isDefault: true, stock: data.stock },
        });
      }
      return productId;
    });

    // Fotos que saíram do produto: apaga do armazenamento
    if (existing) {
      const kept = new Set(images.map((i) => i.url));
      await Promise.all(existing.images.filter((i) => !kept.has(i.url)).map((i) => deleteStoredImage(i.url)));
    }

    updateTag(CATALOG_TAG);
    updateTag(`produto-${slug}`);
    if (existing && existing.slug !== slug) updateTag(`produto-${existing.slug}`);

    await logActivity(user.id, existing ? "produto.editado" : "produto.criado", { entityType: "produto", entityId: id });
    return { ok: true, id };
  } catch (error) {
    return fail(error);
  }
}

/** Exclui um produto (pedidos antigos continuam com o nome e o preço registrados). */
export async function deleteProduct(id: string): Promise<SimpleResult> {
  try {
    const user = await requirePermission("GERENCIAR_PRODUTOS");
    const product = await db.product.findUnique({ where: { id }, select: { slug: true, name: true, images: { select: { url: true } } } });
    if (!product) return { ok: false, error: "Produto não encontrado." };

    await db.product.delete({ where: { id } });
    await Promise.all(product.images.map((i) => deleteStoredImage(i.url)));

    updateTag(CATALOG_TAG);
    updateTag(`produto-${product.slug}`);
    await logActivity(user.id, "produto.excluido", { entityType: "produto", entityId: id, data: { nome: product.name } });
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif"];
const MAX_BYTES = 8 * 1024 * 1024;

/** Recebe uma foto do produto, converte para WebP (até 1600 px) e devolve o endereço. */
export async function uploadProductImage(formData: FormData): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    await requirePermission("GERENCIAR_PRODUTOS");
    const file = formData.get("arquivo");
    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Escolha uma imagem." };
    if (file.type && !ALLOWED_TYPES.includes(file.type)) return { ok: false, error: "Use fotos JPG, PNG, WebP ou HEIC." };
    if (file.size > MAX_BYTES) return { ok: false, error: "A foto precisa ter até 8 MB." };

    const input = Buffer.from(await file.arrayBuffer());
    const output = await sharp(input)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const url = await storeImage("produtos", output);
    return { ok: true, url };
  } catch (error) {
    return fail(error);
  }
}
