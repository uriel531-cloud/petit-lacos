/**
 * Tema → variáveis CSS. Função pura (roda no servidor e no editor, no navegador).
 * Todos os valores vêm de campos validados pelo Zod (hex, enums, números),
 * então não há risco de injeção de CSS.
 */
import { FONT_STACKS } from "./font-stacks";
import type { Theme } from "./schema";

function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgba(hex: string, alpha: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgb(${r} ${g} ${b} / ${alpha})`;
}

const SHADOWS: Record<Theme["shape"]["shadow"], (c: string) => string> = {
  nenhuma: () => "none",
  suave: (c) => `0 1px 2px ${rgba(c, 0.05)}, 0 10px 24px -14px ${rgba(c, 0.22)}`,
  media: (c) => `0 2px 4px ${rgba(c, 0.06)}, 0 16px 32px -14px ${rgba(c, 0.3)}`,
  forte: (c) => `0 4px 8px ${rgba(c, 0.08)}, 0 24px 48px -16px ${rgba(c, 0.4)}`,
};

const SECTION_SPACE: Record<Theme["shape"]["density"], [string, string]> = {
  compacta: ["2.25rem", "3.25rem"],
  padrao: ["3.25rem", "5rem"],
  espacosa: ["4.5rem", "7.5rem"],
};

const SCALE: Record<Theme["typography"]["scale"], string> = {
  compacta: "0.94",
  padrao: "1",
  grande: "1.08",
};

const DURATION: Record<Theme["motion"]["speed"], string> = {
  rapida: "0.35s",
  padrao: "0.6s",
  lenta: "0.9s",
};

const EASING: Record<Theme["motion"]["easing"], string> = {
  suave: "cubic-bezier(0.25, 0.1, 0.25, 1)",
  mola: "cubic-bezier(0.34, 1.56, 0.64, 1)",
};

export function themeToCssVars(theme: Theme): Record<string, string> {
  const c = theme.colors;
  const radius = theme.shape.radius;

  const btnRadius =
    theme.buttons.shape === "pilula" ? "999px" : theme.buttons.shape === "arredondado" ? `${Math.max(8, Math.round(radius * 0.6))}px` : "4px";

  const btn =
    theme.buttons.style === "preenchido"
      ? { bg: c.primary, fg: c.primaryForeground, border: c.primary, hoverBg: rgba(c.primary, 0.88), hoverFg: c.primaryForeground }
      : theme.buttons.style === "contorno"
        ? { bg: "transparent", fg: c.primary, border: c.primary, hoverBg: c.primary, hoverFg: c.primaryForeground }
        : { bg: rgba(c.primary, 0.08), fg: c.primary, border: "transparent", hoverBg: rgba(c.primary, 0.16), hoverFg: c.primary };

  const [spaceMobile, spaceDesktop] = SECTION_SPACE[theme.shape.density];

  return {
    // Tokens semânticos (shadcn/ui + componentes da loja)
    "--background": c.background,
    "--foreground": c.foreground,
    "--card": c.surface,
    "--card-foreground": c.foreground,
    "--popover": c.surface,
    "--popover-foreground": c.foreground,
    "--primary": c.primary,
    "--primary-foreground": c.primaryForeground,
    "--secondary": c.brand,
    "--secondary-foreground": c.foreground,
    "--muted": c.surfaceAlt,
    "--muted-foreground": c.muted,
    "--accent": c.surfaceAlt,
    "--accent-foreground": c.foreground,
    "--highlight": c.highlight,
    "--highlight-foreground": c.foreground,
    "--destructive": c.sale,
    "--sale": c.sale,
    "--border": c.border,
    "--input": c.border,
    "--ring": c.primary,
    "--brand": c.brand,
    "--surface-alt": c.surfaceAlt,
    "--announcement-bg": c.announcementBg,
    "--announcement-fg": c.announcementFg,
    "--footer-bg": c.footerBg,
    "--footer-fg": c.footerFg,
    // Fundos das seções da Home
    "--section-branco": c.background,
    "--section-ceu": c.surfaceAlt,
    "--section-marca": c.brand,
    "--section-perola": `color-mix(in srgb, ${c.surfaceAlt} 45%, ${c.background})`,
    "--section-destaque": c.highlight,
    // Tipografia
    "--font-titulo": FONT_STACKS[theme.typography.heading] ?? FONT_STACKS.cormorant!,
    "--font-texto": FONT_STACKS[theme.typography.body] ?? FONT_STACKS["nunito-sans"]!,
    "--font-assinatura": FONT_STACKS[theme.typography.script] ?? FONT_STACKS.sacramento!,
    "--heading-weight": String(theme.typography.headingWeight),
    "--heading-tracking": `${theme.typography.headingTracking}em`,
    "--type-scale": SCALE[theme.typography.scale],
    // Forma
    "--radius": `${radius}px`,
    "--shadow-card": SHADOWS[theme.shape.shadow](c.foreground),
    "--shadow-hover": SHADOWS[theme.shape.shadow === "nenhuma" ? "suave" : "forte"](c.foreground),
    "--section-space": spaceMobile,
    "--section-space-lg": spaceDesktop,
    // Botões
    "--btn-radius": btnRadius,
    "--btn-bg": btn.bg,
    "--btn-fg": btn.fg,
    "--btn-border": btn.border,
    "--btn-hover-bg": btn.hoverBg,
    "--btn-hover-fg": btn.hoverFg,
    "--btn-transform": theme.buttons.uppercase ? "uppercase" : "none",
    "--btn-tracking": theme.buttons.uppercase ? "0.06em" : "0",
    // Movimento
    "--motion-duration": theme.motion.level === "nenhum" ? "0s" : DURATION[theme.motion.speed],
    "--motion-ease": EASING[theme.motion.easing],
    // Layout dos produtos
    "--cols-m": String(theme.productCard.columnsMobile),
    "--cols-t": String(theme.productCard.columnsTablet),
    "--cols-d": String(theme.productCard.columnsDesktop),
    "--grid-gap": theme.productCard.gap === "compacto" ? "0.75rem" : theme.productCard.gap === "amplo" ? "2rem" : "1.25rem",
    "--card-image-bg":
      theme.productCard.imageBg === "transparente" ? "transparent" : theme.productCard.imageBg === "tema" ? c.brand : c.surfaceAlt,
  };
}

/** CSS pronto para um <style>. */
export function themeToCss(theme: Theme, selector = ":root"): string {
  const vars = Object.entries(themeToCssVars(theme))
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
  return `${selector}{${vars}}`;
}

// ── Contraste (WCAG) ────────────────────────────────────────────────────
function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Pares de cores que precisam de contraste AA (4,5:1). */
export function contrastChecks(theme: Theme) {
  const c = theme.colors;
  return [
    { label: "Texto sobre o fundo", fg: c.foreground, bg: c.background },
    { label: "Texto secundário sobre o fundo", fg: c.muted, bg: c.background },
    { label: "Texto do botão", fg: c.primaryForeground, bg: c.primary },
    { label: "Preço/link sobre o fundo", fg: c.primary, bg: c.background },
    { label: "Texto sobre a cor da marca", fg: c.foreground, bg: c.brand },
    { label: "Texto sobre fundo de seção", fg: c.foreground, bg: c.surfaceAlt },
    { label: "Barra de avisos", fg: c.announcementFg, bg: c.announcementBg },
    { label: "Rodapé", fg: c.footerFg, bg: c.footerBg },
  ].map((p) => ({ ...p, ratio: contrastRatio(p.fg, p.bg), ok: contrastRatio(p.fg, p.bg) >= 4.5 }));
}
