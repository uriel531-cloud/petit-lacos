import { readdir } from "node:fs/promises";
import path from "node:path";

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ThemeEditor } from "@/components/admin/theme-editor/theme-editor";
import { siteConfig } from "@/config/site";
import { requireAdminPage } from "@/features/auth/session";
import { getThemeEditorData } from "@/features/theme/queries";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Aparência", robots: { index: false } };

/** Imagens que a dona pode escolher com um clique (marca, demonstração e enviadas). */
async function availableImages(): Promise<string[]> {
  const list: string[] = [siteConfig.logo.withBackground, siteConfig.logo.transparent, siteConfig.logo.symbol, siteConfig.logo.avatar];
  for (const folder of ["natal", "demo", "uploads/tema"]) {
    try {
      const files = await readdir(path.join(process.cwd(), "public", folder));
      list.push(...files.filter((f) => /\.(webp|png|jpe?g|avif)$/i.test(f)).map((f) => `/${folder}/${f}`));
    } catch {
      // pasta ainda não existe
    }
  }
  return list;
}

async function Editor() {
  const user = await requireAdminPage("/admin/aparencia");
  if (!user.can("EDITAR_TEMA")) {
    return (
      <div className="p-10">
        <h1 className="text-3xl">Sem permissão</h1>
        <p className="mt-2 text-muted-foreground">Peça para a dona da loja liberar a edição da aparência.</p>
        <Link href="/admin" className="mt-4 inline-block text-primary underline">
          Voltar
        </Link>
      </div>
    );
  }

  const [data, categories, collections, images, sample] = await Promise.all([
    getThemeEditorData(),
    db.category.findMany({ where: { active: true }, orderBy: { position: "asc" }, select: { slug: true, name: true } }),
    db.collection.findMany({ where: { active: true }, orderBy: { position: "asc" }, select: { slug: true, name: true } }),
    availableImages(),
    db.product.findFirst({ where: { status: "PUBLICADO" }, orderBy: { isFeatured: "desc" }, select: { slug: true } }),
  ]);

  return (
    <ThemeEditor
      data={data}
      canPublish={user.can("PUBLICAR_TEMA")}
      categories={categories}
      collections={collections}
      images={images}
      sampleProductSlug={sample?.slug ?? null}
    />
  );
}

export default function AparenciaPage() {
  return (
    <Suspense fallback={<div className="grid h-svh place-items-center text-muted-foreground">Abrindo o editor…</div>}>
      <Editor />
    </Suspense>
  );
}
