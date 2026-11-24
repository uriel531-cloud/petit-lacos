"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

import type { ProductImageView } from "@/features/catalog/types";
import type { Theme } from "@/features/theme/schema";

import { BowPlaceholder, SmartImage } from "../smart-image";

type GalleryProps = { images: ProductImageView[]; name: string; layout: Theme["productPage"]["gallery"] };

function Frame({ image, name, priority, className = "aspect-square" }: { image?: ProductImageView; name: string; priority?: boolean; className?: string }) {
  return (
    <div className={`group relative overflow-hidden rounded-[var(--radius)] bg-[var(--card-image-bg)] ${className}`}>
      {image ? (
        <SmartImage
          src={image.url}
          alt={image.alt || name}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <BowPlaceholder />
      )}
    </div>
  );
}

/** Galeria da página do produto (aba Produtos → Página do produto). */
export function ProductGallery({ images, name, layout }: GalleryProps) {
  const [active, setActive] = useState(0);
  const [emblaRef, embla] = useEmblaCarousel({ loop: images.length > 1 });

  const onSelect = useCallback(() => embla && setActive(embla.selectedScrollSnap()), [embla]);
  useEffect(() => {
    if (!embla) return;
    embla.on("select", onSelect);
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla, onSelect]);

  if (images.length <= 1) return <Frame image={images[0]} name={name} priority />;

  if (layout === "grade") {
    return (
      <ul className="grid grid-cols-2 gap-3">
        {images.map((img, i) => (
          <li key={img.url} className={i === 0 ? "col-span-2" : ""}>
            <Frame image={img} name={name} priority={i === 0} />
          </li>
        ))}
      </ul>
    );
  }

  if (layout === "carrossel" || layout === "landing") {
    return (
      <div>
        <div className="overflow-hidden rounded-[var(--radius)]" ref={emblaRef}>
          <div className="flex">
            {images.map((img, i) => (
              <div key={img.url} className="min-w-0 shrink-0 grow-0 basis-full">
                <Frame image={img} name={name} priority={i === 0} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex justify-center gap-2">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => embla?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all ${i === active ? "w-7 bg-foreground/70" : "w-1.5 bg-foreground/25"}`}
              aria-label={`Foto ${i + 1}`}
              aria-current={i === active}
            />
          ))}
        </div>
      </div>
    );
  }

  const side = layout === "miniaturas-lateral";
  return (
    <div className={side ? "grid grid-cols-[4.5rem_1fr] gap-3" : "grid gap-3"}>
      <Frame image={images[active]} name={name} priority className={`aspect-square ${side ? "order-2" : ""}`} />
      <ul className={side ? "order-1 flex flex-col gap-2" : "flex gap-2 overflow-x-auto scrollbar-none"}>
        {images.map((img, i) => (
          <li key={img.url}>
            <button
              type="button"
              onClick={() => setActive(i)}
              className={`relative block size-[4.5rem] shrink-0 overflow-hidden rounded-[calc(var(--radius)*0.5)] ring-2 transition ${i === active ? "ring-primary" : "ring-transparent opacity-70 hover:opacity-100"}`}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === active}
            >
              <SmartImage src={img.url} alt="" fill sizes="72px" className="object-cover" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
