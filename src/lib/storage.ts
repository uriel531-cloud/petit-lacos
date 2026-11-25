import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Guarda uma imagem já processada (WebP) e devolve o endereço público.
 *
 * - Na hospedagem (Vercel): usa o Vercel Blob quando BLOB_READ_WRITE_TOKEN existe.
 *   A Vercel cria essa variável sozinha ao conectar um Blob Store ao projeto.
 * - No computador: salva em /public/uploads/<pasta>.
 */
export async function storeImage(folder: string, data: Buffer): Promise<string> {
  const name = `${Date.now()}-${randomBytes(4).toString("hex")}.webp`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`${folder}/${name}`, data, {
      access: "public",
      contentType: "image/webp",
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    return blob.url;
  }

  if (process.env.VERCEL) {
    throw new Error("Armazenamento de imagens não configurado. Conecte um Blob Store ao projeto na Vercel.");
  }

  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), data);
  return `/uploads/${folder}/${name}`;
}

/** Apaga uma imagem enviada (só as do Blob; falhas são ignoradas). */
export async function deleteStoredImage(url: string): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN || !url.includes(".blob.vercel-storage.com/")) return;
  try {
    const { del } = await import("@vercel/blob");
    await del(url);
  } catch (error) {
    console.error("[storage] falha ao apagar imagem", error);
  }
}
