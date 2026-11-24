import { DEFAULT_THEME } from "./defaults";
import type { HeroSlide, Theme } from "./schema";

/**
 * Um tema pronto muda só a APARÊNCIA. Conteúdo (textos do hero, menu, seções
 * da Home, rodapé) é mantido quando a dona troca de tema.
 */
export type ThemePreset = {
  key: string;
  name: string;
  description: string;
  /** Cores para a miniatura no editor */
  swatch: [string, string, string, string];
  seasonal?: boolean;
  colors: Theme["colors"];
  typography: Theme["typography"];
  shape: Theme["shape"];
  buttons: Theme["buttons"];
  header: Pick<Theme["header"], "style" | "logo" | "onScroll">;
  productCard: Pick<Theme["productCard"], "style" | "aspect" | "imageBg" | "textAlign" | "gap">;
  productPage: Pick<Theme["productPage"], "gallery" | "stickyBuy">;
  motion: Theme["motion"];
  heroCarousel: Pick<Theme["hero"], "transition" | "progress" | "dots" | "arrows">;
  heroText: Pick<HeroSlide, "font" | "weight" | "letterSpacing" | "textColor" | "uppercase">;
  /** Decoração sazonal (neve, luzinhas…). Sem isso, a decoração é desligada. */
  decor?: Theme["decor"];
};

const NO_DECOR: Theme["decor"] = DEFAULT_THEME.decor;

const classico: ThemePreset = {
  key: "petit-classico",
  name: "Petit Clássico",
  description: "A identidade oficial: azul-bebê, Cormorant Garamond e muita delicadeza.",
  swatch: ["#CEDEEB", "#EEF4F9", "#46667F", "#E8DCCB"],
  colors: DEFAULT_THEME.colors,
  typography: DEFAULT_THEME.typography,
  shape: DEFAULT_THEME.shape,
  buttons: DEFAULT_THEME.buttons,
  header: { style: "solido", logo: "com-fundo", onScroll: "encolher" },
  productCard: { style: "classico", aspect: "4:5", imageBg: "cinza", textAlign: "esquerda", gap: "padrao" },
  productPage: { gallery: "miniaturas-embaixo", stickyBuy: true },
  motion: DEFAULT_THEME.motion,
  heroCarousel: { transition: "fade", progress: false, dots: true, arrows: true },
  heroText: { font: "titulo", weight: 600, letterSpacing: -0.01, textColor: "#1E3042", uppercase: false },
};

/**
 * Minimal Premium — inspirado na estética da Apple (só a estética: sem logos,
 * ícones, imagens, textos ou fontes proprietárias). Inter no lugar da SF Pro.
 */
const minimalPremium: ThemePreset = {
  key: "minimal-premium",
  name: "Minimal Premium",
  description: "Inspirado no estilo Apple: muito branco, títulos grandes, header com desfoque e animações ao rolar.",
  swatch: ["#FFFFFF", "#F5F5F7", "#1D1D1F", "#46667F"],
  colors: {
    background: "#FFFFFF",
    surface: "#FFFFFF",
    surfaceAlt: "#F5F5F7",
    brand: "#F5F5F7",
    foreground: "#1D1D1F",
    muted: "#6E6E73",
    primary: "#46667F",
    primaryForeground: "#FFFFFF",
    border: "#E5E5EA",
    highlight: "#F5F5F7",
    sale: "#B0584E",
    announcementBg: "#F5F5F7",
    announcementFg: "#1D1D1F",
    footerBg: "#F5F5F7",
    footerFg: "#424245",
  },
  typography: {
    heading: "inter",
    body: "inter",
    script: "sacramento",
    scale: "grande",
    headingWeight: 600,
    headingTracking: -0.03,
  },
  shape: { radius: 24, shadow: "nenhuma", density: "espacosa" },
  buttons: { shape: "pilula", style: "preenchido", uppercase: false },
  header: { style: "blur", logo: "simbolo", onScroll: "fixo" },
  productCard: { style: "minimal", aspect: "1:1", imageBg: "cinza", textAlign: "centro", gap: "amplo" },
  productPage: { gallery: "landing", stickyBuy: true },
  motion: {
    level: "suave",
    reveal: "fade-up",
    stagger: 90,
    cardHover: "zoom",
    addToCart: "pulso",
    confetti: false,
    pageTransition: "fade",
    parallax: 45,
    speed: "lenta",
    easing: "suave",
  },
  heroCarousel: { transition: "fade", progress: true, dots: false, arrows: false },
  heroText: { font: "texto", weight: 600, letterSpacing: -0.03, textColor: "#1D1D1F", uppercase: false },
};

const candyPastel: ThemePreset = {
  key: "candy-pastel",
  name: "Candy Pastel",
  description: "Rosa, lilás e creme. Mais lúdico, com cantos bem redondos e animações divertidas.",
  swatch: ["#FCE8EF", "#EFE6FA", "#A24C78", "#FFF6E8"],
  colors: {
    background: "#FFFBFC",
    surface: "#FFFFFF",
    surfaceAlt: "#FCE8EF",
    brand: "#F6D3E1",
    foreground: "#4A2C3D",
    muted: "#765867",
    primary: "#A24C78",
    primaryForeground: "#FFFFFF",
    border: "#F3D9E4",
    highlight: "#EFE6FA",
    sale: "#B3365F",
    announcementBg: "#EFE6FA",
    announcementFg: "#4A2C3D",
    footerBg: "#4A2C3D",
    footerFg: "#FCE8EF",
  },
  typography: {
    heading: "quicksand",
    body: "quicksand",
    script: "dancing-script",
    scale: "padrao",
    headingWeight: 700,
    headingTracking: -0.01,
  },
  shape: { radius: 28, shadow: "media", density: "padrao" },
  buttons: { shape: "pilula", style: "preenchido", uppercase: false },
  header: { style: "solido", logo: "com-fundo", onScroll: "encolher" },
  productCard: { style: "classico", aspect: "1:1", imageBg: "tema", textAlign: "centro", gap: "padrao" },
  productPage: { gallery: "carrossel", stickyBuy: true },
  motion: {
    level: "expressivo",
    reveal: "zoom",
    stagger: 80,
    cardHover: "inclinar",
    addToCart: "voar",
    confetti: true,
    pageTransition: "deslizar",
    parallax: 30,
    speed: "padrao",
    easing: "mola",
  },
  heroCarousel: { transition: "deslizar", progress: false, dots: true, arrows: true },
  heroText: { font: "titulo", weight: 700, letterSpacing: -0.01, textColor: "#4A2C3D", uppercase: false },
};

/**
 * Natal — paleta quente (creme de papel de presente, vermelho-Natal, verde-pinheiro e dourado),
 * neve caindo e varal de luzinhas no cabeçalho. Use com o "Conteúdo de Natal" (fotos).
 */
const natal: ThemePreset = {
  key: "natal",
  name: "Natal",
  description: "Sazonal: creme, vermelho-Natal, verde-pinheiro e dourado, com neve caindo e luzinhas. Agende início e fim.",
  swatch: ["#A3262A", "#1F4D3A", "#C8A24A", "#F8F1E7"],
  seasonal: true,
  colors: {
    background: "#FFFDF9",
    surface: "#FFFFFF",
    surfaceAlt: "#F8F1E7",
    brand: "#F3E3D3",
    foreground: "#2B211E",
    muted: "#665650",
    primary: "#A3262A",
    primaryForeground: "#FFFFFF",
    border: "#EADFD2",
    highlight: "#F2E2B6",
    sale: "#A3262A",
    announcementBg: "#1F4D3A",
    announcementFg: "#FFF8EC",
    footerBg: "#1F4D3A",
    footerFg: "#F8F1E7",
  },
  typography: {
    heading: "cormorant",
    body: "nunito-sans",
    script: "great-vibes",
    scale: "padrao",
    headingWeight: 600,
    headingTracking: 0,
  },
  shape: { radius: 20, shadow: "media", density: "padrao" },
  buttons: { shape: "pilula", style: "preenchido", uppercase: false },
  header: { style: "solido", logo: "com-fundo", onScroll: "encolher" },
  productCard: { style: "classico", aspect: "4:5", imageBg: "tema", textAlign: "esquerda", gap: "padrao" },
  productPage: { gallery: "miniaturas-embaixo", stickyBuy: true },
  motion: { ...DEFAULT_THEME.motion, cardHover: "elevar", confetti: true, parallax: 40 },
  heroCarousel: { transition: "zoom", progress: true, dots: true, arrows: true },
  heroText: { font: "titulo", weight: 600, letterSpacing: -0.01, textColor: "#2B211E", uppercase: false },
  decor: { effect: "neve", intensity: "media", garland: "luzinhas", colorA: "#C9D6E3", colorB: "#D8B56A" },
};

export const PRESETS: ThemePreset[] = [classico, minimalPremium, candyPastel, natal];

export function getPreset(key: string): ThemePreset | undefined {
  return PRESETS.find((p) => p.key === key);
}

/** Aplica a aparência de um tema pronto, preservando o conteúdo. */
export function applyPreset(theme: Theme, preset: ThemePreset): Theme {
  return {
    ...theme,
    preset: preset.key,
    colors: { ...preset.colors },
    typography: { ...preset.typography },
    shape: { ...preset.shape },
    buttons: { ...preset.buttons },
    header: { ...theme.header, ...preset.header },
    productCard: { ...theme.productCard, ...preset.productCard },
    productPage: { ...theme.productPage, ...preset.productPage },
    motion: { ...preset.motion },
    decor: { ...(preset.decor ?? NO_DECOR) },
    hero: {
      ...theme.hero,
      ...preset.heroCarousel,
      slides: theme.hero.slides.map((s) => (s.id.startsWith("natal-") ? s : { ...s, ...preset.heroText })),
    },
  };
}
