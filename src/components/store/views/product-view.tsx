import { ChevronRight } from "lucide-react";

import { listProducts } from "@/features/catalog/queries";
import type { ProductDetail } from "@/features/catalog/types";
import type { Theme } from "@/features/theme/schema";

import { BuyBox } from "../product/buy-box";
import { ProductGallery } from "../product/product-gallery";
import { ProductCarousel } from "../product-carousel";
import { Reveal } from "../reveal";
import { StoreLink } from "../store-link";

const BLOCK_TITLES = {
  descricao: "Descrição",
  medidas: "Medidas",
  materiais: "Materiais",
  cuidados: "Cuidados",
  avaliacoes: "Avaliações",
} as const;

function Blocks({ product, theme }: { product: ProductDetail; theme: Theme }) {
  const content: Record<keyof typeof BLOCK_TITLES, React.ReactNode> = {
    descricao: product.description ? <p className="whitespace-pre-line">{product.description}</p> : null,
    medidas: product.measurements ? <p>{product.measurements}</p> : null,
    materiais: product.materials ? <p>{product.materials}</p> : null,
    cuidados: product.care ? <p>{product.care}</p> : <p>Guarde em local seco. Não lave na máquina. Não deixe ao alcance de bebês sem supervisão.</p>,
    avaliacoes: product.reviews.length ? (
      <ul className="space-y-4">
        {product.reviews.map((r) => (
          <li key={r.id}>
            <p className="text-primary">{"★".repeat(r.rating)}</p>
            {r.comment ? <p>{r.comment}</p> : null}
            <p className="text-sm text-muted-foreground">{r.authorName}</p>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-muted-foreground">Ainda não há avaliações. Comprou? Conte pra gente!</p>
    ),
  };
  const blocks = theme.productPage.blocks.filter((b) => content[b]);
  return (
    <div className="divide-y border-y">
      {blocks.map((b, i) => (
        <details key={b} open={i === 0} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between font-heading text-xl [&::-webkit-details-marker]:hidden">
            {BLOCK_TITLES[b]}
            <ChevronRight className="size-5 transition-transform group-open:rotate-90" aria-hidden />
          </summary>
          <div className="pt-3 text-muted-foreground">{content[b]}</div>
        </details>
      ))}
    </div>
  );
}

export async function ProductView({ product, theme }: { product: ProductDetail; theme: Theme }) {
  const related = (await listProducts({ categoria: product.categorySlug ?? undefined, limit: 10 })).filter((p) => p.id !== product.id).slice(0, 8);
  const landing = theme.productPage.gallery === "landing";

  return (
    <>
      {landing ? (
        // Estilo "landing" (Minimal Premium): nome grande, foto central e detalhes rolando
        <section className="bg-[var(--section-ceu)] px-4 pt-12 pb-10 text-center md:pt-20">
          <Reveal>
            {product.categoryName ? <p className="text-sm font-semibold text-muted-foreground">{product.categoryName}</p> : null}
            <h1 className="mx-auto mt-2 max-w-3xl text-5xl md:text-7xl">{product.name}</h1>
            {product.description ? <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">{product.description}</p> : null}
          </Reveal>
          <Reveal index={1} kind="zoom" className="mx-auto mt-10 max-w-2xl">
            <ProductGallery images={product.images} name={product.name} layout="landing" />
          </Reveal>
        </section>
      ) : (
        <nav aria-label="Você está em" className="mx-auto max-w-7xl px-4 pt-6 text-sm text-muted-foreground sm:px-6 lg:px-8">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <StoreLink href="/" className="hover:underline">
                Início
              </StoreLink>
            </li>
            <li aria-hidden>/</li>
            <li>
              <StoreLink href="/produtos" className="hover:underline">
                Produtos
              </StoreLink>
            </li>
            {product.categorySlug ? (
              <>
                <li aria-hidden>/</li>
                <li>
                  <StoreLink href={`/produtos?categoria=${product.categorySlug}`} className="hover:underline">
                    {product.categoryName}
                  </StoreLink>
                </li>
              </>
            ) : null}
          </ol>
        </nav>
      )}

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 md:grid-cols-2 md:py-12 lg:gap-16 lg:px-8">
        {landing ? (
          <div className="order-2 md:order-1">
            <Blocks product={product} theme={theme} />
          </div>
        ) : (
          <div className="md:sticky md:top-28 md:self-start">
            <ProductGallery images={product.images} name={product.name} layout={theme.productPage.gallery} />
          </div>
        )}
        <div className={landing ? "order-1 md:sticky md:top-28 md:order-2 md:self-start" : "flex flex-col gap-8"}>
          <BuyBox product={product} showTitle={!landing} />
          {landing ? null : <Blocks product={product} theme={theme} />}
        </div>
      </div>

      {related.length ? (
        <section className="section-pad bg-[var(--section-perola)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-3xl md:text-4xl">Você também vai amar</h2>
            <ProductCarousel products={related} />
          </div>
        </section>
      ) : null}
    </>
  );
}
