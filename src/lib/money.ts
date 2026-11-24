/** Valores de dinheiro circulam no sistema como inteiros em centavos. */

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** 1490 → "R$ 14,90" */
export function formatBRL(cents: number): string {
  return brl.format(cents / 100);
}

/** "14,90" | "R$ 14,90" | "14.90" → 1490. Retorna null se não for um valor válido. */
export function parseBRLToCents(input: string): number | null {
  const cleaned = input.replace(/[R$\s]/g, "").trim();
  if (!cleaned) return null;
  // "1.234,56" (pt-BR) → "1234.56"; "14.90" continua "14.90"
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * 100);
}

/** Percentual de desconto arredondado, ex.: de 2790 por 2490 → 11 */
export function discountPercent(compareAtCents: number, priceCents: number): number {
  if (compareAtCents <= priceCents || compareAtCents <= 0) return 0;
  return Math.round(((compareAtCents - priceCents) / compareAtCents) * 100);
}

/** Aplica um desconto percentual (ex.: Pix 5%) arredondando para o centavo. */
export function applyPercentDiscount(cents: number, percent: number): number {
  return Math.round(cents * (1 - percent / 100));
}
