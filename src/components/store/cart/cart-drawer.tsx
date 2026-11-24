"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { fillTemplate, whatsappLink } from "@/features/whatsapp/links";
import { applyPercentDiscount, formatBRL } from "@/lib/money";

import { SmartImage } from "../smart-image";
import { useHref, useStore } from "../store-context";
import { useCart } from "./cart-context";

export function CartDrawer() {
  const { items, open, setOpen, update, remove, subtotalCents } = useCart();
  const { settings } = useStore();
  const href = useHref();
  const pixTotal = applyPercentDiscount(subtotalCents, settings.pixDiscountPercent);

  const whatsappOrder = settings.whatsappMain
    ? whatsappLink(
        settings.whatsappMain,
        fillTemplate("Olá! Quero fazer este pedido:\n{itens}\nTotal: {total}", {
          itens: items.map((i) => `• ${i.quantity}x ${i.name}${i.variantName ? ` (${i.variantName})` : ""}`).join("\n"),
          total: formatBRL(subtotalCents),
        }),
      )
    : null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b p-5">
          <SheetTitle className="font-heading text-2xl">Sua sacola</SheetTitle>
          <SheetDescription>
            {settings.nationwideShippingEnabled
              ? "Frete calculado na finalização."
              : "Depois do pagamento, a entrega é combinada com a gente pelo WhatsApp."}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="grid flex-1 place-items-center p-8 text-center">
            <div>
              <ShoppingBag className="mx-auto size-10 text-muted-foreground" aria-hidden />
              <p className="mt-3 font-heading text-xl">Sua sacola está vazia</p>
              <Link href={href("/produtos")} onClick={() => setOpen(false)} className="btn-theme mt-5">
                Ver laços
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-3 py-4">
                  <Link
                    href={href(`/produto/${item.slug}`)}
                    onClick={() => setOpen(false)}
                    className="relative size-20 shrink-0 overflow-hidden rounded-[calc(var(--radius)*0.6)] bg-[var(--card-image-bg)]"
                  >
                    {item.image ? <SmartImage src={item.image} alt={item.name} fill sizes="80px" className="object-cover" /> : null}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{item.name}</p>
                    {item.variantName && item.variantName !== "Padrão" ? (
                      <p className="text-xs text-muted-foreground">{item.variantName}</p>
                    ) : null}
                    <p className="text-sm font-bold text-primary">{formatBRL(item.priceCents)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="inline-flex items-center rounded-full border">
                        <button
                          type="button"
                          className="grid size-8 place-items-center"
                          onClick={() => update(item.variantId, item.quantity - 1)}
                          aria-label={`Diminuir quantidade de ${item.name}`}
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm tabular-nums">{item.quantity}</span>
                        <button
                          type="button"
                          className="grid size-8 place-items-center disabled:opacity-40"
                          onClick={() => update(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          aria-label={`Aumentar quantidade de ${item.name}`}
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="ml-auto grid size-8 place-items-center text-muted-foreground hover:text-destructive"
                        onClick={() => remove(item.variantId)}
                        aria-label={`Remover ${item.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t bg-muted/40 p-5">
              <div className="flex items-baseline justify-between">
                <span>Subtotal</span>
                <span className="text-lg font-bold tabular-nums">{formatBRL(subtotalCents)}</span>
              </div>
              {settings.pixDiscountPercent > 0 ? (
                <p className="text-right text-sm text-muted-foreground">
                  ou <strong className="text-foreground">{formatBRL(pixTotal)}</strong> no Pix
                </p>
              ) : null}
              {whatsappOrder ? (
                <a href={whatsappOrder} target="_blank" rel="noopener noreferrer" className="btn-theme w-full">
                  Enviar pedido pelo WhatsApp
                </a>
              ) : (
                <button type="button" className="btn-theme w-full" disabled>
                  Pagamento online em breve
                </button>
              )}
              <button type="button" className="w-full text-sm text-muted-foreground underline-offset-4 hover:underline" onClick={() => setOpen(false)}>
                Continuar comprando
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
