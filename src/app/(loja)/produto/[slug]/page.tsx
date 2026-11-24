import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductView } from "@/components/store/views/product-view";
import { getProductBySlug, getPublishedSlugs } from "@/features/catalog/queries";
import { getPublishedTheme } from "@/features/theme/queries";
import { formatBRL } from "@/lib/money";

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  // Cache Components exige ao menos um parâmetro conhecido
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "exemplo" }];
}

export async function generateMetadata({ params }: PageProps<"/produto/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado" };
  return {
    title: product.name,
    description: `${product.name} por ${formatBRL(product.priceCents)}. ${product.description}`.slice(0, 160),
    openGraph: { images: product.images[0] ? [{ url: product.images[0].url }] : undefined },
  };
}

async function Product({ params }: { params: PageProps<"/produto/[slug]">["params"] }) {
  const { slug } = await params;
  const [product, theme] = await Promise.all([getProductBySlug(slug), getPublishedTheme()]);
  if (!product) notFound();
  return <ProductView product={product} theme={theme} />;
}

export default function ProdutoPage({ params }: PageProps<"/produto/[slug]">) {
  return (
    <Suspense fallback={<div className="mx-auto h-[70vh] max-w-7xl animate-pulse px-4 py-10" aria-busy />}>
      <Product params={params} />
    </Suspense>
  );
}
