"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import type { ProductSummary } from "@/features/catalog/types";

import { ProductCard } from "./product-card";
import { useStore } from "./store-context";

/** Carrossel de produtos (aba Produtos → Carrossel de produtos). */
export function ProductCarousel({ products }: { products: ProductSummary[] }) {
  const { productCarousel: c } = useStore();
  const [emblaRef, embla] = useEmblaCarousel(
    { align: "start", dragFree: c.dragFree, containScroll: "trimSnaps", loop: false },
    c.autoplay ? [Autoplay({ delay: c.intervalSeconds * 1000, stopOnInteraction: false, stopOnMouseEnter: true })] : [],
  );
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback(() => {
    if (!embla) return;
    setCanPrev(embla.canScrollPrev());
    setCanNext(embla.canScrollNext());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincronização inicial com o carrossel (sistema externo)
    sync();
    embla.on("select", sync).on("reInit", sync);
    return () => {
      embla.off("select", sync).off("reInit", sync);
    };
  }, [embla, sync]);

  // Sem "peek", arredonda para baixo para não mostrar card cortado
  const items = (n: number) => String(c.peek ? n : Math.max(1, Math.floor(n)));

  return (
    <div
      className="relative"
      style={
        {
          "--items-m": items(c.itemsMobile),
          "--items-t": items(c.itemsTablet),
          "--items-d": items(c.itemsDesktop),
        } as React.CSSProperties
      }
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <ul className="-ml-[var(--grid-gap)] flex touch-pan-y">
          {products.map((product) => (
            <li
              key={product.id}
              className="min-w-0 shrink-0 grow-0 basis-[calc(100%/var(--items-m))] pl-[var(--grid-gap)] md:basis-[calc(100%/var(--items-t))] lg:basis-[calc(100%/var(--items-d))]"
            >
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>
      {canPrev || canNext ? (
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => embla?.scrollPrev()}
            disabled={!canPrev}
            className="grid size-10 place-items-center rounded-full border bg-background transition disabled:opacity-30"
            aria-label="Anterior"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => embla?.scrollNext()}
            disabled={!canNext}
            className="grid size-10 place-items-center rounded-full border bg-background transition disabled:opacity-30"
            aria-label="Próximo"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
