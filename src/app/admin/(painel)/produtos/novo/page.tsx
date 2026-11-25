import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { NoProductPermission } from "@/components/admin/products/no-permission";
import { ProductForm } from "@/components/admin/products/product-form";
import { requireAdminPage } from "@/features/auth/session";
import { EMPTY_PRODUCT, productFormOptions } from "@/features/products/admin-queries";

export const metadata: Metadata = { title: "Novo produto", robots: { index: false } };

async function NewProduct() {
  const user = await requireAdminPage("/admin/produtos/novo");
  if (!user.can("GERENCIAR_PRODUTOS")) return <NoProductPermission />;
  const { categories, collections } = await productFormOptions();

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-10">
      <Link href="/admin/produtos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Produtos
      </Link>
      <h1 className="text-4xl">Novo produto</h1>
      <ProductForm initial={EMPTY_PRODUCT} categories={categories} collections={collections} />
    </div>
  );
}

export default function NovoProdutoPage() {
  return (
    <Suspense fallback={<div className="p-10 text-muted-foreground">Carregando…</div>}>
      <NewProduct />
    </Suspense>
  );
}
