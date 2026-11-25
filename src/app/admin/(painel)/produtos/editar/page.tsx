import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { NoProductPermission } from "@/components/admin/products/no-permission";
import { ProductForm } from "@/components/admin/products/product-form";
import { requireAdminPage } from "@/features/auth/session";
import { getProductForEdit, productFormOptions } from "@/features/products/admin-queries";

export const metadata: Metadata = { title: "Editar produto", robots: { index: false } };

type SearchParams = Promise<{ id?: string | string[] }>;

async function EditProduct({ searchParams }: { searchParams: SearchParams }) {
  const raw = (await searchParams).id;
  const id = Array.isArray(raw) ? raw[0] : raw;
  const user = await requireAdminPage(`/admin/produtos/editar?id=${encodeURIComponent(id ?? "")}`);
  if (!user.can("GERENCIAR_PRODUTOS")) return <NoProductPermission />;

  if (!id) notFound();
  const [product, { categories, collections }] = await Promise.all([getProductForEdit(id), productFormOptions()]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-10">
      <Link href="/admin/produtos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Produtos
      </Link>
      <h1 className="text-4xl">{product.name}</h1>
      <ProductForm key={product.id} initial={product} categories={categories} collections={collections} />
    </div>
  );
}

export default function EditarProdutoPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<div className="p-10 text-muted-foreground">Carregando…</div>}>
      <EditProduct searchParams={searchParams} />
    </Suspense>
  );
}
