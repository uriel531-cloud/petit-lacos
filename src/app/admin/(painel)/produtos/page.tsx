import { Package, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { NoProductPermission } from "@/components/admin/products/no-permission";
import { requireAdminPage } from "@/features/auth/session";
import { db } from "@/lib/db";
import { formatBRL } from "@/lib/money";

export const metadata: Metadata = { title: "Produtos", robots: { index: false } };

const STATUS_LABEL = {
  PUBLICADO: { label: "Publicado", className: "bg-primary/15 text-primary" },
  RASCUNHO: { label: "Rascunho", className: "bg-muted text-muted-foreground" },
  ESGOTADO: { label: "Esgotado", className: "bg-destructive/10 text-destructive" },
  ARQUIVADO: { label: "Arquivado", className: "bg-muted text-muted-foreground" },
} as const;

async function ProductList() {
  const user = await requireAdminPage("/admin/produtos");
  if (!user.can("GERENCIAR_PRODUTOS")) return <NoProductPermission />;

  const products = await db.product.findMany({
    orderBy: [{ updatedAt: "desc" }],
    include: {
      category: { select: { name: true } },
      images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
      variants: { select: { stock: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? "produto" : "produtos"} cadastrados
          </p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="size-4" /> Novo produto
        </Link>
      </header>

      {products.length === 0 ? (
        <div className="grid place-items-center gap-3 rounded-2xl border bg-card p-12 text-center">
          <Package className="size-10 text-muted-foreground" />
          <p className="text-lg font-semibold">Nenhum produto ainda</p>
          <Link href="/admin/produtos/novo" className="text-primary underline">
            Cadastrar o primeiro
          </Link>
        </div>
      ) : (
        <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
          {products.map((p) => {
            const stock = p.variants.reduce((sum, v) => sum + v.stock, 0);
            const status = STATUS_LABEL[p.status];
            return (
              <li key={p.id}>
                <Link href={`/admin/produtos/editar?id=${p.id}`} className="flex items-center gap-4 p-3 transition hover:bg-muted/60">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element -- miniatura da foto enviada
                      <img src={p.images[0].url} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />
                    ) : (
                      <Package className="absolute inset-0 m-auto size-5 text-muted-foreground" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{p.name}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {p.category?.name ?? "Sem categoria"} · {stock} em estoque
                    </span>
                  </span>
                  <span className="hidden text-right font-semibold tabular-nums sm:block">{formatBRL(p.priceCents)}</span>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function ProdutosPage() {
  return (
    <Suspense fallback={<div className="p-10 text-muted-foreground">Carregando produtos…</div>}>
      <ProductList />
    </Suspense>
  );
}
