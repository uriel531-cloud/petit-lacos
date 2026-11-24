"use client";

import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { Theme } from "@/features/theme/schema";

import { HeroSlideView } from "./hero-slide";

type HeroCarouselProps = { hero: Theme["hero"] };

/** Carrossel do hero (aba Hero → Carrossel). Com um slide só, vira um hero simples. */
export function HeroCarousel({ hero }: HeroCarouselProps) {
  const slides = hero.slides;
  const multiple = slides.length > 1;

  const plugins = useMemo(() => {
    const list = [];
    if (multiple && hero.transition === "fade") list.push(Fade());
    if (multiple && hero.autoplay) {
      list.push(Autoplay({ delay: hero.intervalSeconds * 1000, stopOnInteraction: false, stopOnMouseEnter: hero.pauseOnHover }));
    }
    return list;
  }, [multiple, hero.transition, hero.autoplay, hero.intervalSeconds, hero.pauseOnHover]);

  const [emblaRef, embla] = useEmblaCarousel({ loop: hero.loop && multiple, duration: 32, watchDrag: multiple }, plugins);
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (embla) setSelected(embla.selectedScrollSnap());
  }, [embla]);

  // Parallax entre slides: o fundo anda mais devagar que o slide
  const onScroll = useCallback(() => {
    if (!embla || hero.transition !== "parallax") return;
    const progress = embla.scrollProgress();
    const snaps = embla.scrollSnapList();
    embla.slideNodes().forEach((node, i) => {
      const layer = node.querySelector<HTMLElement>("[data-parallax-layer] > div");
      if (!layer) return;
      const diff = (snaps[i] ?? 0) - progress;
      layer.style.transform = `translateX(${diff * -35}%)`;
    });
  }, [embla, hero.transition]);

  useEffect(() => {
    if (!embla) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincronização inicial com o carrossel (sistema externo)
    onSelect();
    onScroll();
    embla.on("select", onSelect).on("reInit", onSelect).on("scroll", onScroll).on("reInit", onScroll);
    return () => {
      embla.off("select", onSelect).off("reInit", onSelect).off("scroll", onScroll).off("reInit", onScroll);
    };
  }, [embla, onSelect, onScroll]);

  return (
    <section aria-roledescription={multiple ? "carrossel" : undefined} aria-label="Destaques" className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className="flex min-w-0 shrink-0 grow-0 basis-full"
              role={multiple ? "group" : undefined}
              aria-roledescription={multiple ? "slide" : undefined}
              aria-label={multiple ? `${i + 1} de ${slides.length}` : undefined}
            >
              <HeroSlideView
                slide={slide}
                active={i === selected}
                first={i === 0}
                kenBurns={hero.transition === "zoom"}
                intervalSeconds={hero.intervalSeconds}
              />
            </div>
          ))}
        </div>
      </div>

      {multiple && hero.arrows ? (
        <>
          <button
            type="button"
            onClick={() => embla?.scrollPrev()}
            className="absolute top-1/2 left-3 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-background/80 shadow backdrop-blur transition hover:bg-background md:grid"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => embla?.scrollNext()}
            className="absolute top-1/2 right-3 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-background/80 shadow backdrop-blur transition hover:bg-background md:grid"
            aria-label="Próximo slide"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      ) : null}

      {multiple && (hero.dots || hero.progress) ? (
        <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2 px-4">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => embla?.scrollTo(i)}
              aria-label={`Ir para o slide ${i + 1}`}
              aria-current={i === selected}
              className={`relative h-1.5 overflow-hidden rounded-full bg-foreground/20 transition-all ${
                hero.progress ? "w-10" : i === selected ? "w-7 bg-foreground/70" : "w-1.5"
              }`}
            >
              {hero.progress && i === selected ? (
                <span
                  key={`${selected}-${hero.autoplay}`}
                  className={`absolute inset-0 bg-foreground/70 ${hero.autoplay ? "animate-hero-progress" : ""}`}
                  style={{ ["--hero-interval" as string]: `${hero.intervalSeconds}s` }}
                />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {multiple && hero.thumbs ? (
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 scrollbar-none sm:px-6 lg:px-8">
          {slides.map((slide, i) => {
            const b = slide.background;
            const thumbBg: React.CSSProperties =
              b.type === "imagem" && b.image
                ? { backgroundImage: `url("${b.image}")`, backgroundSize: "cover", backgroundPosition: "center" }
                : b.type === "gradiente"
                  ? { backgroundImage: `linear-gradient(${b.gradientAngle}deg, ${b.gradientFrom}, ${b.gradientTo})` }
                  : { backgroundColor: b.color };
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => embla?.scrollTo(i)}
                aria-current={i === selected}
                className={`flex h-14 min-w-40 items-end rounded-[calc(var(--radius)*0.6)] p-2 text-left text-xs font-semibold ring-2 transition ${
                  i === selected ? "ring-primary" : "opacity-70 ring-transparent hover:opacity-100"
                }`}
                style={thumbBg}
              >
                <span className="line-clamp-1 rounded bg-background/80 px-1.5 py-0.5">{slide.eyebrow || slide.title.replace("{palavras}", "…")}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
