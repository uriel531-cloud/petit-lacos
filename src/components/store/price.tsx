"use client";

import { Star } from "lucide-react";

import { applyPercentDiscount, formatBRL } from "@/lib/money";

import { useStore } from "./store-context";

type PriceProps = {
  priceCents: number;
  compareAtPriceCents?: number | null;
  showPix?: boolean;
  showInstallments?: boolean;
  size?: "sm" | "md" | "lg";
  align?: "esquerda" | "centro";
};

export function Price({ priceCents, compareAtPriceCents, showPix = true, showInstallments = true, size = "md", align = "esquerda" }: PriceProps) {
  const { settings } = useStore();
  const pix = applyPercentDiscount(priceCents, settings.pixDiscountPercent);
  const installments = Math.max(1, settings.maxInstallmentsNoInterest);
  const main = size === "lg" ? "text-3xl" : size === "sm" ? "text-sm" : "text-base";

  return (
    <div className={align === "centro" ? "text-center" : ""}>
      <p className={`font-bold text-primary tabular-nums ${main}`}>
        {compareAtPriceCents && compareAtPriceCents > priceCents ? (
          <s className="mr-1.5 text-[0.8em] font-normal text-muted-foreground">{formatBRL(compareAtPriceCents)}</s>
        ) : null}
        {formatBRL(priceCents)}
      </p>
      {showPix && settings.pixDiscountPercent > 0 ? (
        <p className="text-xs text-muted-foreground">
          <strong className="font-semibold text-foreground">{formatBRL(pix)}</strong> no Pix ({settings.pixDiscountPercent}% off)
        </p>
      ) : null}
      {showInstallments && installments > 1 && priceCents >= installments * 500 ? (
        <p className="text-xs text-muted-foreground">
          ou {installments}x de {formatBRL(Math.ceil(priceCents / installments))} sem juros
        </p>
      ) : null}
    </div>
  );
}

export function Stars({ value, count, className = "" }: { value: number; count?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs text-muted-foreground ${className}`} aria-label={`Nota ${value.toFixed(1)} de 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`size-3.5 ${i < Math.round(value) ? "fill-current text-primary" : "text-border"}`} aria-hidden />
      ))}
      {count !== undefined ? <span className="ml-1">({count})</span> : null}
    </span>
  );
}
