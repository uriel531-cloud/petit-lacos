"use client";

import { MotionConfig } from "motion/react";
import { createContext, use, type ReactNode } from "react";

import type { PublicStoreSettings } from "@/features/store/settings";
import type { Theme } from "@/features/theme/schema";

export type StoreContextValue = {
  motion: Theme["motion"];
  productCard: Theme["productCard"];
  productPage: Theme["productPage"];
  productCarousel: Theme["productCarousel"];
  settings: PublicStoreSettings;
  /** Na pré-visualização do painel, links internos ganham este prefixo */
  basePath: string;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ value, children }: { value: StoreContextValue; children: ReactNode }) {
  return (
    <StoreContext value={value}>
      {/* "user": respeita automaticamente o "reduzir movimento" do celular/computador */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </StoreContext>
  );
}

export function useStore(): StoreContextValue {
  const ctx = use(StoreContext);
  if (!ctx) throw new Error("useStore precisa estar dentro de <StoreProvider>");
  return ctx;
}

/** Prefixa links internos quando estamos na pré-visualização do rascunho. */
export function useHref() {
  const { basePath } = useStore();
  return (href: string) => (basePath && href.startsWith("/") ? `${basePath}${href === "/" ? "" : href}` : href);
}
