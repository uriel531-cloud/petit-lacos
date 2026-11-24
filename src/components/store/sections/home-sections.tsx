import { ArrowRight, CreditCard, Gift, Hand, Heart, QrCode, ShieldCheck, Truck } from "lucide-react";

import { getCategories, productsForSection } from "@/features/catalog/queries";
import type { HomeSection, Theme } from "@/features/theme/schema";

import { HeroCarousel } from "../hero/hero-carousel";
import { WhatsAppIcon } from "../layout/whatsapp-button";
import { ProductCarousel } from "../product-carousel";
import { ProductGrid } from "../product-grid";
import { Reveal } from "../reveal";
import { BowPlaceholder, SmartImage } from "../smart-image";
import { StoreLink } from "../store-link";
import { Countdown } from "./countdown";
import { SectionHeading, SectionShell } from "./section-shell";

type SectionOf<T extends HomeSection["type"]> = Extract<HomeSection, { type: T }>;

const BENEFIT_ICONS = {
  mao: Hand,
  pix: QrCode,
  seguro: ShieldCheck,
  caminhao: Truck,
  presente: Gift,
  coracao: Heart,
  cartao: CreditCard,
} as const;

function viewAllHref(s: SectionOf<"produtos">) {
  if (s.source === "colecao" && s.sourceSlug) return `/produtos?colecao=${s.sourceSlug}`;
  if (s.source === "categoria" && s.sourceSlug) return `/produtos?categoria=${s.sourceSlug}`;
  return `/produtos?ordem=${s.source}`;
}

async function ProductsSection({ section }: { section: SectionOf<"produtos"> }) {
  const products = await productsForSection(section.source, section.sourceSlug, section.limit);
  if (products.length === 0) return null;
  return (
    <SectionShell section={section}>
      <SectionHeading
        title={section.title}
        subtitle={section.subtitle}
        animation={section.animation}
        action={
          section.showViewAll ? (
            <StoreLink href={viewAllHref(section)} className="inline-flex items-center gap-1 text-sm font-bold text-primary underline-offset-4 hover:underline">
              Ver todos <ArrowRight className="size-4" />
            </StoreLink>
          ) : null
        }
      />
      {section.layout === "carrossel" ? <ProductCarousel products={products} /> : <ProductGrid products={products} revealKind={section.animation} />}
    </SectionShell>
  );
}

async function CategoriesSection({ section }: { section: SectionOf<"categorias"> }) {
  const categories = await getCategories();
  if (!categories.length) return null;
  return (
    <SectionShell section={section}>
      <SectionHeading title={section.title} animation={section.animation} center />
      <ul className={section.shape === "circulo" ? "flex flex-wrap justify-center gap-6 md:gap-10" : "grid grid-cols-2 gap-4 md:grid-cols-4"}>
        {categories.map((c, i) => {
          const img = c.imageUrl ?? c.productImage;
          return (
            <Reveal as="li" key={c.id} index={i} kind={section.animation}>
              <StoreLink href={`/produtos?categoria=${c.slug}`} className="group flex flex-col items-center gap-3 text-center">
                <span
                  className={`relative block overflow-hidden bg-[var(--card-image-bg)] shadow-card ${
                    section.shape === "circulo" ? "size-28 rounded-full md:size-36" : "aspect-[4/3] w-full rounded-[var(--radius)]"
                  }`}
                >
                  {img ? (
                    <SmartImage src={img} alt="" fill sizes="160px" className="object-cover transition duration-500 group-hover:scale-110" />
                  ) : (
                    <BowPlaceholder />
                  )}
                </span>
                <span className="font-heading text-lg leading-tight">{c.name}</span>
              </StoreLink>
            </Reveal>
          );
        })}
      </ul>
    </SectionShell>
  );
}

const BENTO_SIZE = {
  grande: "col-span-2 row-span-2",
  largo: "col-span-2",
  alto: "row-span-2",
  pequeno: "",
} as const;

function Section({ section, theme, headerOverlay }: { section: HomeSection; theme: Theme; headerOverlay: boolean }) {
  switch (section.type) {
    case "hero":
      return (
        <div className={headerOverlay ? "[&_[data-hero-content]]:pt-28" : undefined}>
          <HeroCarousel hero={theme.hero} />
        </div>
      );

    case "marquee": {
      const text = `${section.text} · `;
      return (
        <SectionShell section={section} full className="overflow-hidden !py-3">
          <div className="flex w-max animate-marquee whitespace-nowrap" style={{ ["--marquee-duration" as string]: `${section.speedSeconds}s` }} aria-label={section.text}>
            {[0, 1].map((k) => (
              <span key={k} aria-hidden className="px-2 font-heading text-lg tracking-wide md:text-xl">
                {text.repeat(4)}
              </span>
            ))}
          </div>
        </SectionShell>
      );
    }

    case "beneficios":
      return (
        <SectionShell section={section}>
          <ul className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {section.items.map((item, i) => {
              const Icon = item.icon === "whatsapp" ? null : BENEFIT_ICONS[item.icon];
              return (
                <Reveal as="li" key={item.id} index={i} kind={section.animation} className="flex flex-col items-center gap-2 text-center">
                  <span className="grid size-14 place-items-center rounded-full bg-[var(--section-marca)] text-foreground">
                    {Icon ? <Icon className="size-6" aria-hidden /> : <WhatsAppIcon className="size-6" />}
                  </span>
                  <p className="font-heading text-lg leading-tight">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </Reveal>
              );
            })}
          </ul>
        </SectionShell>
      );

    case "produtos":
      return <ProductsSection section={section} />;

    case "categorias":
      return <CategoriesSection section={section} />;

    case "bento":
      return (
        <SectionShell section={section}>
          <SectionHeading title={section.title} animation={section.animation} />
          <ul className="grid auto-rows-[11rem] grid-cols-2 gap-[var(--grid-gap)] md:auto-rows-[13rem] md:grid-cols-4">
            {section.tiles.map((tile, i) => (
              <Reveal as="li" key={tile.id} index={i} kind={section.animation} className={BENTO_SIZE[tile.size]}>
                <StoreLink href={tile.href || "/produtos"} className="group relative block size-full overflow-hidden rounded-[calc(var(--radius)*1.3)] bg-[var(--section-ceu)]">
                  {tile.image ? (
                    <SmartImage src={tile.image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  ) : null}
                  <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" aria-hidden />
                  <span className="absolute inset-x-0 bottom-0 p-4 text-white md:p-5">
                    <span className="block font-heading text-2xl leading-tight md:text-3xl">{tile.title}</span>
                    {tile.text ? <span className="text-sm opacity-90">{tile.text}</span> : null}
                  </span>
                </StoreLink>
              </Reveal>
            ))}
          </ul>
        </SectionShell>
      );

    case "banner-duplo":
      return (
        <SectionShell section={section}>
          <ul className="grid gap-[var(--grid-gap)] md:grid-cols-2">
            {section.banners.map((b, i) => (
              <Reveal as="li" key={b.id} index={i} kind={section.animation}>
                <StoreLink href={b.href || "/produtos"} className="group relative flex aspect-[16/10] items-end overflow-hidden rounded-[calc(var(--radius)*1.3)] bg-[var(--section-ceu)] p-6">
                  {b.image ? <SmartImage src={b.image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" /> : null}
                  <span className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" aria-hidden />
                  <span className="relative text-white">
                    <span className="block font-heading text-3xl">{b.title}</span>
                    <span className="block text-sm opacity-90">{b.text}</span>
                    {b.cta ? <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold underline-offset-4 group-hover:underline">{b.cta} <ArrowRight className="size-4" /></span> : null}
                  </span>
                </StoreLink>
              </Reveal>
            ))}
          </ul>
        </SectionShell>
      );

    case "texto-imagem":
      return (
        <SectionShell section={section}>
          <div className="grid items-center gap-10 md:grid-cols-2">
            <Reveal kind={section.animation} className={section.imageSide === "esquerda" ? "md:order-2" : ""}>
              {section.eyebrow ? <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">{section.eyebrow}</p> : null}
              <h2 className="mt-2 text-4xl md:text-5xl">{section.title}</h2>
              <p className="mt-4 max-w-prose text-lg text-muted-foreground">{section.text}</p>
              {section.cta.label ? (
                <StoreLink href={section.cta.href || "/produtos"} className="btn-theme mt-6">
                  {section.cta.label}
                </StoreLink>
              ) : null}
            </Reveal>
            {section.image ? (
              <Reveal kind={section.animation} index={1} className={section.imageSide === "esquerda" ? "md:order-1" : ""}>
                <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[calc(var(--radius)*1.6)] shadow-card">
                  <SmartImage src={section.image} alt="" fill sizes="(min-width: 768px) 448px, 100vw" className="object-cover" />
                </div>
              </Reveal>
            ) : null}
          </div>
        </SectionShell>
      );

    case "video": {
      if (!section.url) return null;
      const yt = section.url.match(/(?:youtu\.be\/|v=|shorts\/)([\w-]{11})/);
      return (
        <SectionShell section={section}>
          <SectionHeading title={section.title} animation={section.animation} center />
          <Reveal kind={section.animation} className="mx-auto max-w-4xl overflow-hidden rounded-[calc(var(--radius)*1.3)] shadow-card">
            {yt ? (
              <iframe
                className="aspect-video w-full"
                src={`https://www.youtube-nocookie.com/embed/${yt[1]}`}
                title={section.title || "Vídeo"}
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <video className="aspect-video w-full bg-black" src={section.url} poster={section.poster || undefined} controls playsInline preload="metadata" />
            )}
          </Reveal>
        </SectionShell>
      );
    }

    case "depoimentos":
      return (
        <SectionShell section={section}>
          <SectionHeading title={section.title} animation={section.animation} center />
          <ul className="grid gap-[var(--grid-gap)] md:grid-cols-3">
            {section.items.map((t, i) => (
              <Reveal as="li" key={t.id} index={i} kind={section.animation} className="rounded-[var(--radius)] bg-card p-6 shadow-card">
                <p className="text-primary" aria-label={`Nota ${t.rating} de 5`}>
                  {"★".repeat(t.rating)}
                  <span className="text-border">{"★".repeat(5 - t.rating)}</span>
                </p>
                <blockquote className="mt-3 text-lg leading-relaxed">“{t.text}”</blockquote>
                <p className="mt-4 font-semibold">{t.name}</p>
              </Reveal>
            ))}
          </ul>
        </SectionShell>
      );

    case "instagram":
      return (
        <SectionShell section={section}>
          <SectionHeading
            title={section.title}
            subtitle={section.handle}
            animation={section.animation}
            center
          />
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {section.images.map((img, i) => (
              <Reveal as="li" key={`${img}-${i}`} index={i} kind={section.animation}>
                <a href={section.url || "#"} target="_blank" rel="noopener noreferrer" className="group relative block aspect-square overflow-hidden rounded-[calc(var(--radius)*0.8)]">
                  <SmartImage src={img} alt={`Post ${i + 1} do Instagram`} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
                </a>
              </Reveal>
            ))}
          </ul>
        </SectionShell>
      );

    case "contador":
      return (
        <SectionShell section={section}>
          <Reveal kind={section.animation} className="flex flex-col items-center gap-5 text-center">
            <h2 className="text-3xl md:text-4xl">{section.title}</h2>
            {section.text ? <p className="text-muted-foreground">{section.text}</p> : null}
            <Countdown endsAt={section.endsAt} />
            {section.cta.label ? (
              <StoreLink href={section.cta.href || "/produtos"} className="btn-theme">
                {section.cta.label}
              </StoreLink>
            ) : null}
          </Reveal>
        </SectionShell>
      );

    case "newsletter":
      return (
        <SectionShell section={section}>
          <Reveal kind={section.animation} className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
            <h2 className="text-3xl md:text-4xl">{section.title}</h2>
            <p className="text-muted-foreground">{section.text}</p>
            <form className="flex w-full max-w-md gap-2" aria-describedby="newsletter-aviso">
              <label htmlFor={`news-${section.id}`} className="sr-only">
                Seu e-mail
              </label>
              <input id={`news-${section.id}`} type="email" placeholder="seu@email.com" className="h-11 flex-1 rounded-full border bg-background px-4" disabled />
              <button type="submit" className="btn-theme" disabled>
                {section.buttonLabel}
              </button>
            </form>
            <p id="newsletter-aviso" className="text-xs text-muted-foreground">
              Cadastro disponível em breve.
            </p>
          </Reveal>
        </SectionShell>
      );
  }
}

export function HomeSections({ theme, headerOverlay }: { theme: Theme; headerOverlay: boolean }) {
  return (
    <>
      {theme.home.sections
        .filter((s) => s.active)
        .map((section) => (
          <Section key={section.id} section={section} theme={theme} headerOverlay={headerOverlay} />
        ))}
    </>
  );
}
