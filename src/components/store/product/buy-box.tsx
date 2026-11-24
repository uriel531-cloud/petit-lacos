"use client";

import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import type { ProductDetail } from "@/features/catalog/types";
import { fillTemplate, whatsappLink } from "@/features/whatsapp/links";
import { formatBRL } from "@/lib/money";

import { useCart } from "../cart/cart-context";
import { playAddToCart } from "../cart/cart-effects";
import { WhatsAppIcon } from "../layout/whatsapp-button";
import { Price, Stars } from "../price";
import { useStore } from "../store-context";

export function BuyBox({ product, showTitle = true }: { product: ProductDetail; showTitle?: boolean }) {
  const { settings, productPage, motion: m } = useStore();
  const { add, setOpen } = useCart();
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxVisible, setBoxVisible] = useState(true);

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const price = variant?.priceCents ?? product.priceCents;
  const stock = variant?.stock ?? 0;

  // Barra de compra fixa aparece quando o bloco de compra sai da tela
  useEffect(() => {
    if (!productPage.stickyBuy || !boxRef.current) return;
    const io = new IntersectionObserver(([entry]) => setBoxVisible(Boolean(entry?.isIntersecting)), { rootMargin: "0px 0px -40% 0px" });
    io.observe(boxRef.current);
    return () => io.disconnect();
  }, [productPage.stickyBuy]);

  function addToCart(source: HTMLElement | null) {
    if (!variant || stock <= 0) return;
    add(
      {
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        variantName: product.variants.length > 1 ? variant.name : null,
        priceCents: price,
        image: product.images[0]?.url ?? null,
        maxStock: stock,
      },
      quantity,
    );
    playAddToCart(m, source, product.images[0]?.url ?? null);
    toast.success(`${product.name} foi para a sacola`, { action: { label: "Ver sacola", onClick: () => setOpen(true) } });
  }

  const question = settings.whatsappMain
    ? whatsappLink(
        settings.whatsappMain,
        fillTemplate(settings.whatsappTemplates.duvidaProduto ?? "Olá! Tenho uma dúvida sobre o {produto}.", { produto: product.name }),
      )
    : null;

  return (
    <>
      <div ref={boxRef} className="flex flex-col gap-5">
        {showTitle ? (
          <div>
            {product.categoryName ? <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">{product.categoryName}</p> : null}
            <h1 className="mt-1 text-4xl md:text-5xl">{product.name}</h1>
            {product.ratingAvg ? <Stars value={product.ratingAvg} count={product.ratingCount} className="mt-2" /> : null}
          </div>
        ) : null}

        <Price priceCents={price} compareAtPriceCents={product.compareAtPriceCents} size="lg" />

        {product.variants.length > 1 ? (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Opção</legend>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setVariantId(v.id);
                    setQuantity(1);
                  }}
                  disabled={v.stock <= 0}
                  aria-pressed={v.id === variant?.id}
                  className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition disabled:line-through disabled:opacity-40 ${
                    v.id === variant?.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {stock > 0 && stock <= 3 ? <p className="text-sm font-semibold text-sale">Últimas {stock} unidades!</p> : null}

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-full border" aria-label="Quantidade">
            <button type="button" className="grid size-11 place-items-center" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Diminuir quantidade">
              <Minus className="size-4" />
            </button>
            <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              className="grid size-11 place-items-center disabled:opacity-40"
              onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
              disabled={quantity >= stock}
              aria-label="Aumentar quantidade"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <button ref={buttonRef} type="button" className="btn-theme min-w-48 flex-1" disabled={stock <= 0} onClick={() => addToCart(buttonRef.current)}>
            {stock <= 0 ? "Esgotado" : "Adicionar à sacola"}
          </button>
        </div>

        {question ? (
          <a href={question} target="_blank" rel="noopener noreferrer" className="btn-theme-secondary w-full">
            <WhatsAppIcon className="size-5 text-[#25D366]" /> Tirar dúvida no WhatsApp
          </a>
        ) : null}

        <p className="rounded-[var(--radius)] bg-muted p-4 text-sm text-muted-foreground">
          {settings.nationwideShippingEnabled
            ? "Enviamos para todo o Brasil. O frete é calculado na finalização."
            : "Depois do pagamento, você combina a entrega direto com a gente pelo WhatsApp."}
        </p>
      </div>

      {/* Barra fixa de compra */}
      <AnimatePresence>
        {productPage.stickyBuy && !boxVisible ? (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
          >
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-lg leading-tight">{product.name}</p>
                <p className="text-sm font-bold text-primary">{formatBRL(price)}</p>
              </div>
              <button type="button" className="btn-theme" disabled={stock <= 0} onClick={(e) => addToCart(e.currentTarget)}>
                {stock <= 0 ? "Esgotado" : "Comprar"}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
