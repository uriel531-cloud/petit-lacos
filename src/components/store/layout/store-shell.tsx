import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import type { CategoryView } from "@/features/catalog/types";
import type { PublicStoreSettings } from "@/features/store/settings";
import { themeToCss } from "@/features/theme/css";
import type { Theme } from "@/features/theme/schema";

import { CartProvider } from "../cart/cart-context";
import { CartDrawer } from "../cart/cart-drawer";
import { StoreProvider } from "../store-context";
import { PageTransition } from "./page-transition";
import { SeasonalDecor } from "./seasonal-decor";
import { StoreFooter } from "./store-footer";
import { StoreHeader } from "./store-header";
import { WhatsAppFloatingButton } from "./whatsapp-button";

type StoreShellProps = {
  theme: Theme;
  settings: PublicStoreSettings;
  categories: CategoryView[];
  children: ReactNode;
  /** Prefixo de links na pré-visualização do painel */
  basePath?: string;
};

/** Moldura da loja: aplica o tema (variáveis CSS) e monta cabeçalho, rodapé e sacola. */
export function StoreShell({ theme, settings, categories, children, basePath = "" }: StoreShellProps) {
  return (
    <StoreProvider
      value={{
        motion: theme.motion,
        productCard: theme.productCard,
        productPage: theme.productPage,
        productCarousel: theme.productCarousel,
        settings,
        basePath,
      }}
    >
      {/* Valores validados pelo Zod (hex/enums/números) — seguro para <style> */}
      <style id="tema-loja" dangerouslySetInnerHTML={{ __html: themeToCss(theme) }} />
      <CartProvider>
        <div className="flex min-h-svh flex-col bg-background text-foreground">
          <a href="#conteudo" className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
            Pular para o conteúdo
          </a>
          <StoreHeader header={theme.header} announcement={theme.announcement} categories={categories} garland={theme.decor.garland} />
          <main id="conteudo" className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <StoreFooter footer={theme.footer} />
        </div>
        <SeasonalDecor decor={theme.decor} />
        <CartDrawer />
        <WhatsAppFloatingButton />
        <Toaster position="bottom-center" />
      </CartProvider>
    </StoreProvider>
  );
}
