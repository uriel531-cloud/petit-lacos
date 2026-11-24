"use client";

import type { ProductSummary } from "@/features/catalog/types";

import { ProductCard } from "./product-card";
import { Reveal } from "./reveal";
import { useStore } from "./store-context";

type ProductGridProps = {
  products: ProductSummary[];
  revealKind?: "herdar" | "nenhuma" | "fade-up" | "slide" | "zoom" | "blur";
  priorityCount?: number;
};

/** Grade de produtos que segue a aba "Produtos" do editor (colunas, espaçamento, estilo). */
export function ProductGrid({ products, revealKind = "herdar", priorityCount = 0 }: ProductGridProps) {
  const { productCard: pc } = useStore();

  if (products.length === 0) {
    return <p className="rounded-[var(--radius)] bg-muted p-8 text-center text-muted-foreground">Nenhum laço encontrado por aqui.</p>;
  }

  // Lista: 1 coluna no celular, 2 no computador. Editorial: no máximo 3 colunas.
  const listOverride =
    pc.style === "lista"
      ? ({ "--cols-m": "1", "--cols-t": "1", "--cols-d": "2" } as React.CSSProperties)
      : pc.style === "editorial"
        ? ({ "--cols-d": String(Math.min(pc.columnsDesktop, 3)), "--cols-m": "1" } as React.CSSProperties)
        : undefined;

  const bento = pc.style === "bento";

  return (
    <ul className={`grid-products ${bento ? "grid-flow-dense" : ""}`} style={listOverride}>
      {products.map((product, i) => {
        // Bento: a cada 5 cards, um ocupa 2x2
        const featured = bento && i % 5 === 0;
        return (
          <Reveal
            key={product.id}
            as="li"
            index={i}
            kind={revealKind}
            className={featured ? "col-span-2 row-span-2" : undefined}
          >
            <ProductCard product={product} featured={featured} priority={i < priorityCount} />
          </Reveal>
        );
      })}
    </ul>
  );
}
