"use client";

import { Menu, Search, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import type { CategoryView } from "@/features/catalog/types";
import type { Theme } from "@/features/theme/schema";

import { useCart } from "../cart/cart-context";
import { useHref, useStore } from "../store-context";
import { AnnouncementBar } from "./announcement-bar";
import { Garland } from "./seasonal-decor";

const LOGOS = {
  "com-fundo": { src: siteConfig.logo.withBackground, ratio: 1, className: "rounded-[calc(var(--radius)*0.4)]" },
  transparente: { src: siteConfig.logo.transparent, ratio: 600 / 356, className: "logo-contorno" },
  simbolo: { src: siteConfig.logo.avatar, ratio: 1, className: "rounded-full" },
} as const;

type StoreHeaderProps = {
  header: Theme["header"];
  announcement: Theme["announcement"];
  categories: CategoryView[];
  garland: Theme["decor"]["garland"];
};

export function StoreHeader({ header, announcement, categories, garland }: StoreHeaderProps) {
  const { count, setOpen } = useCart();
  const { basePath } = useStore();
  const href = useHref();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [hiddenByScroll, setHiddenByScroll] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = pathname === "/" || pathname === basePath || pathname === `${basePath}/`;
  // "Transparente" só faz sentido sobre o hero da Home; nas outras páginas vira sólido
  const transparent = header.style === "transparente" && isHome && !scrolled;

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (header.onScroll === "esconder") setHiddenByScroll(y > 120 && y > last);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [header.onScroll]);

  const shrink = header.onScroll === "encolher" && scrolled;
  const logo = LOGOS[header.logo];
  const logoStyle = {
    ["--logo-h-m" as string]: `${shrink ? Math.round(header.logoHeightMobile * 0.8) : header.logoHeightMobile}px`,
    ["--logo-h-d" as string]: `${shrink ? Math.round(header.logoHeightDesktop * 0.7) : header.logoHeightDesktop}px`,
  };

  const bar =
    header.style === "blur" || (header.style === "transparente" && !transparent)
      ? "bg-background/72 backdrop-blur-xl backdrop-saturate-150 border-b border-border/60"
      : transparent
        ? "bg-transparent"
        : "bg-background border-b";

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    router.push(href(q ? `/produtos?q=${encodeURIComponent(q)}` : "/produtos"));
  }

  return (
    <header
      className={`${header.style === "transparente" && isHome ? "fixed" : "sticky"} inset-x-0 top-0 z-40 transition-transform duration-300 ${
        hiddenByScroll ? "-translate-y-full" : ""
      }`}
    >
      <AnnouncementBar announcement={announcement} />
      <div className={`relative transition-colors duration-300 ${bar}`}>
        <Garland type={garland} />
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="grid size-10 place-items-center rounded-full hover:bg-muted lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </button>

          <Link href={href("/")} className="shrink-0" aria-label={`${siteConfig.name} — página inicial`}>
            <span
              className="relative block h-[var(--logo-h-m)] transition-[height] duration-300 md:h-[var(--logo-h-d)]"
              style={{ ...logoStyle, aspectRatio: String(logo.ratio) }}
            >
              <Image src={logo.src} alt={siteConfig.name} fill priority sizes="200px" className={`object-contain ${logo.className}`} />
            </span>
          </Link>

          <nav aria-label="Principal" className="hidden flex-1 justify-center lg:flex">
            <ul className="flex flex-wrap items-center gap-1">
              {header.menu.map((item) => (
                <li key={item.id}>
                  <Link href={href(item.href)} className="rounded-full px-3 py-2 text-sm font-semibold transition hover:bg-muted">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1">
            {header.showSearch ? (
              <form onSubmit={onSearch} role="search" className="relative hidden md:block">
                <label htmlFor="busca-topo" className="sr-only">
                  Buscar produto
                </label>
                <input
                  id="busca-topo"
                  name="q"
                  type="search"
                  placeholder="Buscar laço…"
                  className="h-10 w-48 rounded-full border bg-background/80 pr-10 pl-4 text-sm outline-none transition focus:w-64 focus:ring-2 focus:ring-ring/40 xl:w-56"
                />
                <button type="submit" className="absolute top-1/2 right-1 grid size-8 -translate-y-1/2 place-items-center" aria-label="Buscar">
                  <Search className="size-4" />
                </button>
              </form>
            ) : null}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="relative grid size-11 place-items-center rounded-full hover:bg-muted"
              aria-label={`Abrir sacola (${count} ${count === 1 ? "item" : "itens"})`}
            >
              <span data-cart-target className="grid place-items-center">
                <ShoppingBag className="size-5" />
              </span>
              {count > 0 ? (
                <span className="absolute top-1 right-1 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[0.7rem] font-bold text-primary-foreground tabular-nums">
                  {count}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-sm">
          <SheetHeader>
            <SheetTitle className="font-heading text-2xl">Menu</SheetTitle>
            <SheetDescription className="sr-only">Navegação da loja</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-6 px-4 pb-6">
            {header.showSearch ? (
              <form
                onSubmit={(e) => {
                  onSearch(e);
                  setMenuOpen(false);
                }}
                role="search"
              >
                <label htmlFor="busca-menu" className="sr-only">
                  Buscar produto
                </label>
                <input id="busca-menu" name="q" type="search" placeholder="Buscar laço…" className="h-11 w-full rounded-full border px-4" />
              </form>
            ) : null}
            <nav aria-label="Menu do celular">
              <ul className="grid gap-1">
                {header.menu.map((item) => (
                  <li key={item.id}>
                    <Link href={href(item.href)} onClick={() => setMenuOpen(false)} className="block rounded-[calc(var(--radius)*0.6)] px-3 py-3 font-semibold hover:bg-muted">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            {categories.length ? (
              <div>
                <p className="px-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">Categorias</p>
                <ul className="mt-2 grid gap-1">
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={href(`/produtos?categoria=${c.slug}`)}
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-[calc(var(--radius)*0.6)] px-3 py-2.5 hover:bg-muted"
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
