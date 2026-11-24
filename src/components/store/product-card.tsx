"use client";

import { Eye, Heart, Plus } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { ProductSummary } from "@/features/catalog/types";
import { discountPercent } from "@/lib/money";

import { useCart } from "./cart/cart-context";
import { playAddToCart } from "./cart/cart-effects";
import { Price, Stars } from "./price";
import { BowPlaceholder, SmartImage } from "./smart-image";
import { useHref, useStore } from "./store-context";

const ASPECT = { "1:1": "aspect-square", "4:5": "aspect-[4/5]", "3:4": "aspect-[3/4]" } as const;

type CardProps = {
  product: ProductSummary;
  /** Card maior (estilo bento/editorial) */
  featured?: boolean;
  priority?: boolean;
};

function useAddToCart(product: ProductSummary) {
  const { add, setOpen } = useCart();
  const { motion: m } = useStore();
  return (source: HTMLElement | null) => {
    if (!product.defaultVariantId) return;
    add({
      variantId: product.defaultVariantId,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variantName: null,
      priceCents: product.priceCents,
      image: product.images[0]?.url ?? null,
      maxStock: product.stock,
    });
    playAddToCart(m, source, product.images[0]?.url ?? null);
    toast.success(`${product.name} foi para a sacola`, { action: { label: "Ver sacola", onClick: () => setOpen(true) } });
  };
}

function Badges({ product }: { product: ProductSummary }) {
  const { productCard: pc } = useStore();
  if (!pc.show.badges) return null;
  const off = product.compareAtPriceCents ? discountPercent(product.compareAtPriceCents, product.priceCents) : 0;
  const side = pc.badgePosition === "direita" ? "right-2.5 items-end" : "left-2.5 items-start";
  return (
    <div className={`pointer-events-none absolute top-2.5 z-10 flex flex-col gap-1 ${side}`}>
      {product.stock <= 0 ? (
        <span className="rounded-full bg-foreground px-2.5 py-0.5 text-[0.7rem] font-bold text-background">Esgotado</span>
      ) : null}
      {off > 0 ? <span className="rounded-full bg-sale px-2.5 py-0.5 text-[0.7rem] font-bold text-white">-{off}%</span> : null}
      {product.isNew ? (
        <span className="rounded-full bg-highlight px-2.5 py-0.5 text-[0.7rem] font-bold text-highlight-foreground">Novo</span>
      ) : null}
      {product.stock > 0 && product.stock <= 3 ? (
        <span className="rounded-full bg-background/90 px-2.5 py-0.5 text-[0.7rem] font-bold">Últimas {product.stock}</span>
      ) : null}
    </div>
  );
}

export function ProductCard({ product, featured = false, priority = false }: CardProps) {
  const { productCard: pc, motion: m } = useStore();
  const { wishlist, toggleWishlist } = useCart();
  const href = useHref();
  const addToCart = useAddToCart(product);
  const imageRef = useRef<HTMLDivElement>(null);
  const [quickView, setQuickView] = useState(false);

  // Inclinação 3D (hover "inclinar")
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 200, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), { stiffness: 200, damping: 18 });
  const tilt = m.level !== "nenhum" && m.cardHover === "inclinar";

  function onMove(e: MouseEvent<HTMLElement>) {
    if (!tilt) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  const style = pc.style;
  const url = href(`/produto/${product.slug}`);
  const [img1, img2] = product.images;
  const canSwap = Boolean(img2) && (pc.show.secondImage || m.cardHover === "trocar-foto");
  const hoverZoom = m.level !== "nenhum" && (m.cardHover === "zoom" || (m.cardHover === "trocar-foto" && !img2));
  const hoverLift = m.level !== "nenhum" && m.cardHover === "elevar";
  const centered = pc.textAlign === "centro";
  const liked = wishlist.includes(product.id);
  const canBuyDirect = product.variantCount <= 1 && product.stock > 0 && Boolean(product.defaultVariantId);
  const isOverlay = style === "editorial" || (style === "bento" && featured);
  const aspect = style === "bento" && featured ? "h-full min-h-[18rem]" : style === "editorial" ? "aspect-[3/4]" : ASPECT[pc.aspect];

  const image = (
    <div
      ref={imageRef}
      className={`relative overflow-hidden rounded-[var(--radius)] bg-[var(--card-image-bg)] ${style === "lista" ? "aspect-square w-28 shrink-0 sm:w-36" : aspect}`}
    >
      {img1 ? (
        <SmartImage
          src={img1.url}
          alt={img1.alt}
          fill
          priority={priority}
          sizes={featured ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"}
          className={`object-cover transition-[transform,opacity] duration-[var(--motion-duration)] ease-[var(--motion-ease)] ${hoverZoom ? "group-hover:scale-[1.06]" : ""} ${canSwap ? "group-hover:opacity-0" : ""}`}
        />
      ) : (
        <BowPlaceholder />
      )}
      {canSwap && img2 ? (
        <SmartImage
          src={img2.url}
          alt={img2.alt}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover opacity-0 transition-opacity duration-[var(--motion-duration)] group-hover:opacity-100"
        />
      ) : null}
      {isOverlay ? <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" aria-hidden /> : null}
      <Badges product={product} />

      {/* Ações sobre a foto */}
      <div className={`absolute top-2.5 z-10 flex flex-col gap-1.5 ${pc.badgePosition === "direita" ? "left-2.5" : "right-2.5"}`}>
        {pc.show.wishlist ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            className="grid size-9 place-items-center rounded-full bg-background/90 shadow-sm backdrop-blur transition hover:scale-105"
            aria-label={liked ? `Remover ${product.name} dos favoritos` : `Favoritar ${product.name}`}
            aria-pressed={liked}
          >
            <Heart className={`size-4 ${liked ? "fill-sale text-sale" : ""}`} />
          </button>
        ) : null}
        {pc.show.quickView ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setQuickView(true);
            }}
            className="grid size-9 place-items-center rounded-full bg-background/90 shadow-sm backdrop-blur transition hover:scale-105 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
            aria-label={`Espiar ${product.name}`}
          >
            <Eye className="size-4" />
          </button>
        ) : null}
      </div>

      {/* Minimal: "+" aparece no hover (sempre visível no celular) */}
      {style === "minimal" && canBuyDirect ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            addToCart(imageRef.current);
          }}
          className="absolute right-2.5 bottom-2.5 z-10 grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-md transition [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100"
          aria-label={`Adicionar ${product.name} à sacola`}
        >
          <Plus className="size-5" />
        </button>
      ) : null}

      {isOverlay ? (
        <div className={`absolute inset-x-0 bottom-0 z-10 p-4 text-white ${centered ? "text-center" : ""}`}>
          {pc.show.category && product.categoryName ? <p className="text-xs tracking-wider uppercase opacity-80">{product.categoryName}</p> : null}
          <p className={`font-heading leading-tight text-white ${featured ? "text-3xl" : "text-xl"}`}>{product.name}</p>
          <p className="mt-1 font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.priceCents / 100)}</p>
        </div>
      ) : null}
    </div>
  );

  const info = isOverlay ? null : (
    <div className={`flex flex-1 flex-col gap-1 ${style === "lista" ? "" : "pt-3"} ${centered && style !== "lista" ? "items-center text-center" : ""}`}>
      {pc.show.category && product.categoryName ? (
        <p className="text-xs tracking-wider text-muted-foreground uppercase">{product.categoryName}</p>
      ) : null}
      <h3 className={`font-heading leading-tight ${style === "minimal" ? "text-lg" : "text-xl"}`}>
        <Link href={url} className="after:absolute after:inset-0 focus-visible:outline-none">
          {product.name}
        </Link>
      </h3>
      {pc.show.rating && product.ratingAvg ? <Stars value={product.ratingAvg} count={product.ratingCount} /> : null}
      <Price
        priceCents={product.priceCents}
        compareAtPriceCents={product.compareAtPriceCents}
        showPix={pc.show.pixPrice}
        showInstallments={pc.show.installments}
        align={centered && style !== "lista" ? "centro" : "esquerda"}
      />
      {pc.show.buyButton && style !== "minimal" ? (
        <div className={`relative z-10 mt-auto pt-2 ${style === "lista" ? "" : "w-full"}`}>
          {canBuyDirect ? (
            <button type="button" className="btn-theme btn-theme-sm w-full" onClick={() => addToCart(imageRef.current)}>
              Comprar
            </button>
          ) : product.stock <= 0 ? (
            <button type="button" className="btn-theme btn-theme-sm w-full" disabled>
              Esgotado
            </button>
          ) : (
            <Link href={url} className="btn-theme btn-theme-sm w-full">
              Escolher opção
            </Link>
          )}
        </div>
      ) : null}
    </div>
  );

  const cardClass = `group relative flex h-full ${style === "lista" ? "flex-row gap-4 rounded-[var(--radius)] border bg-card p-3" : "flex-col"} ${
    hoverLift ? "transition-[transform,box-shadow] duration-[var(--motion-duration)] ease-[var(--motion-ease)] hover:-translate-y-1.5" : ""
  } ${style === "classico" && hoverLift ? "rounded-[var(--radius)] hover:shadow-[var(--shadow-hover)]" : ""}`;

  return (
    <>
      <motion.article
        className={cardClass}
        style={tilt ? { rotateX, rotateY, transformPerspective: 800 } : undefined}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {isOverlay ? (
          <Link href={url} className="block h-full" aria-label={product.name}>
            {image}
          </Link>
        ) : (
          image
        )}
        {info}
      </motion.article>

      {pc.show.quickView ? (
        <Dialog open={quickView} onOpenChange={setQuickView}>
          <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 sm:max-w-2xl">
            <div className="grid sm:grid-cols-2">
              <div className="relative aspect-square bg-[var(--card-image-bg)]">
                {img1 ? <SmartImage src={img1.url} alt={img1.alt} fill sizes="(min-width: 640px) 336px, 100vw" className="object-cover" /> : <BowPlaceholder />}
              </div>
              <div className="flex flex-col gap-3 p-6">
                {product.categoryName ? <p className="text-xs tracking-wider text-muted-foreground uppercase">{product.categoryName}</p> : null}
                <DialogTitle className="font-heading text-3xl font-[var(--heading-weight)]">{product.name}</DialogTitle>
                <DialogDescription className="sr-only">Detalhes rápidos de {product.name}</DialogDescription>
                <Price priceCents={product.priceCents} compareAtPriceCents={product.compareAtPriceCents} size="lg" />
                <div className="mt-auto grid gap-2 pt-4">
                  {canBuyDirect ? (
                    <button
                      type="button"
                      className="btn-theme w-full"
                      onClick={(e) => {
                        addToCart(e.currentTarget);
                        setQuickView(false);
                      }}
                    >
                      Adicionar à sacola
                    </button>
                  ) : null}
                  <Link href={url} className="btn-theme-secondary w-full" onClick={() => setQuickView(false)}>
                    Ver detalhes
                  </Link>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}
