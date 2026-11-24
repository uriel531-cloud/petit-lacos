/**
 * "Conteúdo de Natal": slide do hero + seções com fotos natalinas
 * (Unsplash, licença livre — créditos em public/natal/CREDITOS.md).
 * Tudo com id "natal-…" para poder adicionar e remover de uma vez.
 */
import { DEFAULT_HERO_SLIDE } from "./defaults";
import type { HeroSlide, HomeSection, Theme } from "./schema";

const N = "/natal";

export const NATAL_PREFIX = "natal-";

export const NATAL_SLIDE: HeroSlide = {
  ...DEFAULT_HERO_SLIDE,
  id: "natal-hero",
  eyebrow: "Natal Petit Laços",
  title: "Laços que viram {palavras}",
  highlight: "",
  highlightStyle: "script",
  subtitle: "Ursinhos, vermelho e dourado feitos à mão para as fotos mais lindas do ano.",
  rotatingWords: ["presente", "lembrança", "tradição", "carinho"],
  textEffect: "rotativas",
  primaryCta: { label: "Ver coleção de Natal", href: "/produtos?colecao=natal" },
  secondaryCta: { enabled: true, label: "Presentes até R$ 20", href: "/produtos?ordem=menor-preco" },
  font: "titulo",
  sizeMobile: 42,
  sizeDesktop: 76,
  weight: 600,
  textColor: "#FFF8EC",
  letterSpacing: -0.01,
  align: "esquerda",
  vertical: "meio",
  background: {
    ...DEFAULT_HERO_SLIDE.background,
    type: "imagem",
    image: `${N}/arvore-luzes.webp`,
    imageMobile: "",
    color: "#1F2A24",
    focusX: 50,
    focusY: 40,
  },
  overlay: { tone: "escuro", opacity: 45 },
  sideImage: `${N}/presente-laco-vermelho.webp`,
  height: "media",
};

export const NATAL_SECTIONS: HomeSection[] = [
  {
    id: "natal-faixa",
    type: "marquee",
    active: true,
    background: "destaque",
    spacing: "compacto",
    animation: "nenhuma",
    text: "Feliz Natal · Laços feitos à mão · Presente embrulhado com carinho · Entrega combinada pelo WhatsApp",
    speedSeconds: 32,
  },
  {
    id: "natal-bento",
    type: "bento",
    active: true,
    background: "ceu",
    spacing: "padrao",
    animation: "herdar",
    title: "Clima de Natal",
    tiles: [
      { id: "natal-t1", title: "Primeira foto de Natal", text: "Ursinhos e tricô para os pequenos", image: `${N}/ursinho-de-trico.webp`, href: "/produtos?colecao=natal", size: "grande" },
      { id: "natal-t2", title: "Embrulhado com carinho", text: "Pronto para presentear", image: `${N}/presente-luzes.webp`, href: "/produtos?colecao=kits-para-presente", size: "largo" },
      { id: "natal-t3", title: "Brilho de festa", text: "Dourado e vermelho", image: `${N}/estrela-dourada.webp`, href: "/produtos?colecao=natal", size: "pequeno" },
      { id: "natal-t4", title: "Docinhos de Natal", text: "Laços que combinam", image: `${N}/biscoitos-estrela.webp`, href: "/produtos", size: "pequeno" },
    ],
  },
  {
    id: "natal-banners",
    type: "banner-duplo",
    active: true,
    background: "branco",
    spacing: "padrao",
    animation: "herdar",
    banners: [
      { id: "natal-b1", title: "Presente pronto", text: "Laço + embalagem de Natal", image: `${N}/presente-laco-vermelho.webp`, href: "/produtos?colecao=kits-para-presente", cta: "Ver kits" },
      { id: "natal-b2", title: "Look de Natal", text: "Vermelho, xadrez e dourado", image: `${N}/arvore-enfeites.webp`, href: "/produtos?colecao=natal", cta: "Ver coleção" },
    ],
  },
  {
    id: "natal-contador",
    type: "contador",
    active: true,
    background: "destaque",
    spacing: "padrao",
    animation: "herdar",
    title: "Falta pouco para o Natal",
    text: "Garanta o laço da foto de Natal",
    endsAt: "2026-12-24T21:00:00.000Z", // 24/12, 18h (Brasília)
    cta: { label: "Escolher meu laço", href: "/produtos?colecao=natal" },
  },
];

export function hasNatalContent(theme: Theme) {
  return theme.hero.slides.some((s) => s.id.startsWith(NATAL_PREFIX)) || theme.home.sections.some((s) => s.id.startsWith(NATAL_PREFIX));
}

/** Coloca o slide de Natal em primeiro e as seções logo depois do hero. */
export function addNatalContent(theme: Theme): Theme {
  const clean = removeNatalContent(theme);
  const sections = [...clean.home.sections];
  // Faixa "Feliz Natal" só entra se a loja ainda não tiver uma faixa rolando (evita duas seguidas)
  if (!sections.some((s) => s.type === "marquee" && s.active)) {
    const heroIndex = sections.findIndex((s) => s.type === "hero");
    sections.splice(heroIndex + 1, 0, structuredClone(NATAL_SECTIONS[0]!));
  }
  // bento, banners e contador entram depois da primeira seção de produtos
  const productsIndex = sections.findIndex((s) => s.type === "produtos");
  sections.splice(productsIndex >= 0 ? productsIndex + 1 : sections.length, 0, ...structuredClone(NATAL_SECTIONS.slice(1)));
  return {
    ...clean,
    hero: { ...clean.hero, slides: [structuredClone(NATAL_SLIDE), ...clean.hero.slides].slice(0, 8) },
    home: { sections: sections.slice(0, 30) },
  };
}

export function removeNatalContent(theme: Theme): Theme {
  const slides = theme.hero.slides.filter((s) => !s.id.startsWith(NATAL_PREFIX));
  return {
    ...theme,
    hero: { ...theme.hero, slides: slides.length ? slides : [DEFAULT_HERO_SLIDE] },
    home: { sections: theme.home.sections.filter((s) => !s.id.startsWith(NATAL_PREFIX)) },
  };
}
