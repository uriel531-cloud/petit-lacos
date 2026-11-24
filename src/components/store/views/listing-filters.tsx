"use client";

import { useRouter } from "next/navigation";

import type { CategoryView } from "@/features/catalog/types";

import { useHref } from "../store-context";

const SORTS = [
  { value: "novidades", label: "Novidades" },
  { value: "destaques", label: "Destaques" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "promocoes", label: "Promoções" },
] as const;

type Props = {
  categories: CategoryView[];
  current: { categoria?: string; colecao?: string; ordem?: string; q?: string };
};

export function ListingFilters({ categories, current }: Props) {
  const router = useRouter();
  const href = useHref();

  function go(next: Partial<Props["current"]>) {
    const params = new URLSearchParams();
    const merged = { ...current, ...next };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const qs = params.toString();
    router.push(href(`/produtos${qs ? `?${qs}` : ""}`), { scroll: false });
  }

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/60"}`;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none md:mx-0 md:flex-wrap md:px-0" aria-label="Categorias">
        <li>
          <button type="button" className={chip(!current.categoria)} onClick={() => go({ categoria: undefined })} aria-pressed={!current.categoria}>
            Todos
          </button>
        </li>
        {categories.map((c) => (
          <li key={c.id}>
            <button type="button" className={chip(current.categoria === c.slug)} onClick={() => go({ categoria: c.slug })} aria-pressed={current.categoria === c.slug}>
              {c.name}
            </button>
          </li>
        ))}
      </ul>
      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Ordenar</span>
        <select
          value={current.ordem ?? "novidades"}
          onChange={(e) => go({ ordem: e.target.value })}
          className="h-10 rounded-full border bg-background px-3 font-semibold"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
