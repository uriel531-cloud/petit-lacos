import { getCategories, getCollections, listProducts } from "@/features/catalog/queries";
import type { ProductSort } from "@/features/catalog/types";

import { ProductGrid } from "../product-grid";
import { ListingFilters } from "./listing-filters";

export type ListingParams = { categoria?: string; colecao?: string; ordem?: string; q?: string };

const SORTS: ProductSort[] = ["novidades", "menor-preco", "maior-preco", "promocoes", "destaques", "mais-vendidos"];

function pick(value: string | string[] | undefined) {
  const v = Array.isArray(value) ? value[0] : value;
  return v?.trim().slice(0, 80) || undefined;
}

export function parseListingParams(sp: Record<string, string | string[] | undefined>): ListingParams {
  const ordem = pick(sp.ordem);
  return {
    categoria: pick(sp.categoria),
    colecao: pick(sp.colecao),
    q: pick(sp.q),
    ordem: ordem && SORTS.includes(ordem as ProductSort) ? ordem : undefined,
  };
}

export async function ListingView({ params }: { params: ListingParams }) {
  const [products, categories, collections] = await Promise.all([
    listProducts({ ...params, ordem: params.ordem as ProductSort | undefined }),
    getCategories(),
    getCollections(),
  ]);

  const category = categories.find((c) => c.slug === params.categoria);
  const collection = collections.find((c) => c.slug === params.colecao);
  const title = params.q
    ? `Resultados para “${params.q}”`
    : (collection?.name ?? category?.name ?? (params.ordem === "promocoes" ? "Promoções" : params.ordem === "novidades" ? "Novidades" : "Todos os laços"));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl">{title}</h1>
        <p className="mt-1 text-muted-foreground">
          {products.length} {products.length === 1 ? "produto" : "produtos"}
        </p>
      </header>
      <div className="mb-8">
        <ListingFilters categories={categories} current={params} />
      </div>
      <ProductGrid products={products} priorityCount={4} />
    </div>
  );
}
