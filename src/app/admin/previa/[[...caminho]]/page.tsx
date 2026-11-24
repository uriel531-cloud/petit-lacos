import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { StoreShell } from "@/components/store/layout/store-shell";
import { HomeSections } from "@/components/store/sections/home-sections";
import { ListingView, parseListingParams } from "@/components/store/views/listing-view";
import { ProductView } from "@/components/store/views/product-view";
import { requireAdminPage } from "@/features/auth/session";
import { getCategories, getProductBySlug } from "@/features/catalog/queries";
import { getPublicStoreSettings } from "@/features/store/settings";
import { visibleSlides } from "@/features/theme/normalize";
import { getDraftTheme } from "@/features/theme/queries";

import { PreviewBridge } from "./preview-bridge";

export const metadata: Metadata = { title: "Pré-visualização do rascunho", robots: { index: false } };

const BASE = "/admin/previa";

async function Preview({ params, searchParams }: PageProps<"/admin/previa/[[...caminho]]">) {
  const [{ caminho = [] }, sp] = await Promise.all([params, searchParams]);
  const user = await requireAdminPage(`${BASE}/${caminho.join("/")}`);
  if (!user.can("EDITAR_TEMA")) notFound();

  const [draft, settings, categories] = await Promise.all([getDraftTheme(), getPublicStoreSettings(), getCategories()]);
  const theme = { ...draft, hero: { ...draft.hero, slides: visibleSlides(draft, new Date()) } };

  let content: React.ReactNode;
  if (caminho.length === 0) {
    content = <HomeSections theme={theme} headerOverlay={theme.header.style === "transparente"} />;
  } else if (caminho[0] === "produtos" && caminho.length === 1) {
    content = <ListingView params={parseListingParams(sp)} />;
  } else if (caminho[0] === "produto" && caminho[1]) {
    const product = await getProductBySlug(caminho[1]);
    if (!product) notFound();
    content = <ProductView product={product} theme={theme} />;
  } else {
    notFound();
  }

  return (
    <StoreShell theme={theme} settings={settings} categories={categories} basePath={BASE}>
      {content}
      <PreviewBridge />
    </StoreShell>
  );
}

export default function PreviewPage(props: PageProps<"/admin/previa/[[...caminho]]">) {
  return (
    <Suspense fallback={<div className="grid min-h-svh place-items-center text-muted-foreground">Carregando pré-visualização…</div>}>
      <Preview {...props} />
    </Suspense>
  );
}
