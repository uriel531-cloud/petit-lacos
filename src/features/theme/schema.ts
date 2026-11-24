/**
 * Tema da loja — tudo o que o Editor de Aparência (/admin/aparencia) controla.
 * Fica salvo como JSON em ThemeSettings.draft / ThemeSettings.published.
 *
 * Regra: o JSON salvo é sempre "mesclado" sobre o DEFAULT_THEME antes de validar
 * (ver normalizeTheme), então versões antigas ganham as opções novas automaticamente.
 */
import { z } from "zod";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida (use #RRGGBB)");
const id = z.string().min(1).max(64);
const shortText = z.string().max(160);
const href = z.string().max(500);
const isoDate = z.string().max(40).nullable();

// ── Fontes ──────────────────────────────────────────────────────────────
export const HEADING_FONTS = ["cormorant", "playfair", "fraunces", "dm-serif", "inter", "quicksand"] as const;
export const BODY_FONTS = ["nunito-sans", "inter", "quicksand", "lato", "poppins"] as const;
export const SCRIPT_FONTS = ["sacramento", "dancing-script", "great-vibes", "parisienne"] as const;

// ── Partes do tema ──────────────────────────────────────────────────────
export const colorsSchema = z.object({
  background: hex,
  surface: hex,
  surfaceAlt: hex,
  brand: hex,
  foreground: hex,
  muted: hex,
  primary: hex,
  primaryForeground: hex,
  border: hex,
  highlight: hex,
  sale: hex,
  announcementBg: hex,
  announcementFg: hex,
  footerBg: hex,
  footerFg: hex,
});

export const typographySchema = z.object({
  heading: z.enum(HEADING_FONTS),
  body: z.enum(BODY_FONTS),
  script: z.enum(SCRIPT_FONTS),
  scale: z.enum(["compacta", "padrao", "grande"]),
  headingWeight: z.union([z.literal(500), z.literal(600), z.literal(700)]),
  /** em "em", ex.: -0.02 */
  headingTracking: z.number().min(-0.06).max(0.1),
});

export const shapeSchema = z.object({
  /** px, 0–32 */
  radius: z.number().int().min(0).max(32),
  shadow: z.enum(["nenhuma", "suave", "media", "forte"]),
  density: z.enum(["compacta", "padrao", "espacosa"]),
});

export const buttonsSchema = z.object({
  shape: z.enum(["pilula", "arredondado", "reto"]),
  style: z.enum(["preenchido", "contorno", "ghost"]),
  uppercase: z.boolean(),
});

export const menuItemSchema = z.object({ id, label: shortText, href });

export const headerSchema = z.object({
  logo: z.enum(["transparente", "com-fundo", "simbolo"]),
  logoHeightMobile: z.number().int().min(28).max(96),
  logoHeightDesktop: z.number().int().min(32).max(140),
  style: z.enum(["solido", "transparente", "blur"]),
  onScroll: z.enum(["fixo", "encolher", "esconder"]),
  showSearch: z.boolean(),
  menu: z.array(menuItemSchema).max(12),
});

export const announcementSchema = z.object({
  enabled: z.boolean(),
  messages: z.array(shortText).max(8),
  rotateSeconds: z.number().int().min(2).max(20),
  link: href,
  dismissible: z.boolean(),
});

export const footerSchema = z.object({
  about: z.string().max(400),
  columns: z
    .array(z.object({ id, title: shortText, links: z.array(menuItemSchema).max(8) }))
    .max(4),
  showSocial: z.boolean(),
  showPayments: z.boolean(),
  showNewsletter: z.boolean(),
  instagram: href,
});

export const productCardSchema = z.object({
  style: z.enum(["classico", "minimal", "bento", "editorial", "lista"]),
  aspect: z.enum(["1:1", "4:5", "3:4"]),
  imageBg: z.enum(["transparente", "cinza", "tema"]),
  columnsMobile: z.number().int().min(1).max(2),
  columnsTablet: z.number().int().min(2).max(3),
  columnsDesktop: z.number().int().min(3).max(5),
  gap: z.enum(["compacto", "padrao", "amplo"]),
  textAlign: z.enum(["esquerda", "centro"]),
  badgePosition: z.enum(["esquerda", "direita"]),
  show: z.object({
    buyButton: z.boolean(),
    secondImage: z.boolean(),
    badges: z.boolean(),
    installments: z.boolean(),
    pixPrice: z.boolean(),
    rating: z.boolean(),
    wishlist: z.boolean(),
    quickView: z.boolean(),
    category: z.boolean(),
  }),
});

export const PRODUCT_PAGE_BLOCKS = ["descricao", "medidas", "materiais", "cuidados", "avaliacoes"] as const;

export const productPageSchema = z.object({
  gallery: z.enum(["miniaturas-embaixo", "miniaturas-lateral", "grade", "carrossel", "landing"]),
  stickyBuy: z.boolean(),
  blocks: z.array(z.enum(PRODUCT_PAGE_BLOCKS)),
});

export const motionSchema = z.object({
  level: z.enum(["nenhum", "suave", "expressivo"]),
  reveal: z.enum(["fade-up", "slide", "zoom", "blur", "nenhum"]),
  /** ms entre cards aparecendo em sequência */
  stagger: z.number().int().min(0).max(300),
  cardHover: z.enum(["zoom", "elevar", "trocar-foto", "inclinar", "nenhum"]),
  addToCart: z.enum(["voar", "pulso", "nenhum"]),
  confetti: z.boolean(),
  pageTransition: z.enum(["nenhuma", "fade", "deslizar"]),
  /** 0–100 */
  parallax: z.number().int().min(0).max(100),
  speed: z.enum(["rapida", "padrao", "lenta"]),
  easing: z.enum(["suave", "mola"]),
});

/** Decoração sazonal (ex.: Natal): efeito caindo/piscando e enfeite pendurado no cabeçalho. */
export const decorSchema = z.object({
  effect: z.enum(["nenhum", "neve", "estrelas"]),
  intensity: z.enum(["pouca", "media", "muita"]),
  garland: z.enum(["nenhum", "luzinhas", "bandeirinhas"]),
  colorA: hex,
  colorB: hex,
});

export const heroSlideSchema = z.object({
  id,
  active: z.boolean(),
  startsAt: isoDate,
  endsAt: isoDate,
  // Textos
  eyebrow: shortText,
  title: z.string().max(200),
  /** Palavra/trecho do título que recebe destaque */
  highlight: shortText,
  highlightStyle: z.enum(["cor", "script", "sublinhado"]),
  subtitle: z.string().max(400),
  /** Para o efeito "palavras rotativas": substituem {palavras} no título */
  rotatingWords: z.array(shortText).max(8),
  textEffect: z.enum(["nenhum", "fade", "letra", "maquina", "rotativas"]),
  primaryCta: z.object({ label: shortText, href }),
  secondaryCta: z.object({ enabled: z.boolean(), label: shortText, href }),
  // Estilo da escrita
  font: z.enum(["titulo", "texto", "script"]),
  sizeMobile: z.number().int().min(24).max(72),
  sizeDesktop: z.number().int().min(32).max(120),
  weight: z.union([z.literal(400), z.literal(500), z.literal(600), z.literal(700)]),
  textColor: hex,
  letterSpacing: z.number().min(-0.06).max(0.2),
  uppercase: z.boolean(),
  align: z.enum(["esquerda", "centro", "direita"]),
  vertical: z.enum(["topo", "meio", "base"]),
  // Fundo
  background: z.object({
    type: z.enum(["imagem", "video", "cor", "gradiente"]),
    image: href,
    imageMobile: href,
    video: href,
    color: hex,
    gradientFrom: hex,
    gradientTo: hex,
    gradientAngle: z.number().int().min(0).max(360),
    /** ponto de foco da imagem, 0–100 */
    focusX: z.number().int().min(0).max(100),
    focusY: z.number().int().min(0).max(100),
  }),
  overlay: z.object({
    tone: z.enum(["escuro", "claro"]),
    opacity: z.number().int().min(0).max(90),
  }),
  /** Imagem de destaque ao lado do texto (ex.: foto de produto ou o laço da marca) */
  sideImage: href,
  height: z.enum(["compacta", "media", "cheia"]),
});

export const heroSchema = z.object({
  slides: z.array(heroSlideSchema).min(1).max(8),
  autoplay: z.boolean(),
  intervalSeconds: z.number().int().min(2).max(20),
  transition: z.enum(["deslizar", "fade", "zoom", "parallax"]),
  arrows: z.boolean(),
  dots: z.boolean(),
  progress: z.boolean(),
  thumbs: z.boolean(),
  loop: z.boolean(),
  pauseOnHover: z.boolean(),
});

export const productCarouselSchema = z.object({
  autoplay: z.boolean(),
  intervalSeconds: z.number().int().min(2).max(20),
  itemsMobile: z.number().min(1).max(3),
  itemsTablet: z.number().min(2).max(4),
  itemsDesktop: z.number().min(3).max(6),
  peek: z.boolean(),
  dragFree: z.boolean(),
});

// ── Seções da Home ──────────────────────────────────────────────────────
const sectionBase = {
  id,
  active: z.boolean(),
  background: z.enum(["branco", "ceu", "marca", "perola", "destaque"]),
  spacing: z.enum(["compacto", "padrao", "amplo"]),
  animation: z.enum(["herdar", "nenhuma", "fade-up", "slide", "zoom", "blur"]),
};

const productSourceSchema = z.enum(["novidades", "destaques", "mais-vendidos", "promocoes", "colecao", "categoria"]);

export const homeSectionSchema = z.discriminatedUnion("type", [
  z.object({ ...sectionBase, type: z.literal("hero") }),
  z.object({
    ...sectionBase,
    type: z.literal("beneficios"),
    items: z.array(z.object({ id, icon: z.enum(["mao", "pix", "seguro", "whatsapp", "caminhao", "presente", "coracao"]), title: shortText, text: shortText })).max(6),
  }),
  z.object({ ...sectionBase, type: z.literal("marquee"), text: shortText, speedSeconds: z.number().int().min(5).max(60) }),
  z.object({
    ...sectionBase,
    type: z.literal("produtos"),
    title: shortText,
    subtitle: shortText,
    source: productSourceSchema,
    /** slug da coleção/categoria quando source = colecao/categoria */
    sourceSlug: z.string().max(80),
    layout: z.enum(["grade", "carrossel"]),
    limit: z.number().int().min(2).max(24),
    showViewAll: z.boolean(),
  }),
  z.object({ ...sectionBase, type: z.literal("categorias"), title: shortText, shape: z.enum(["circulo", "cartao"]) }),
  z.object({
    ...sectionBase,
    type: z.literal("bento"),
    title: shortText,
    tiles: z.array(z.object({ id, title: shortText, text: shortText, image: href, href, size: z.enum(["grande", "largo", "alto", "pequeno"]) })).max(6),
  }),
  z.object({
    ...sectionBase,
    type: z.literal("banner-duplo"),
    banners: z.array(z.object({ id, title: shortText, text: shortText, image: href, href, cta: shortText })).max(2),
  }),
  z.object({
    ...sectionBase,
    type: z.literal("texto-imagem"),
    eyebrow: shortText,
    title: shortText,
    text: z.string().max(1000),
    image: href,
    imageSide: z.enum(["esquerda", "direita"]),
    cta: z.object({ label: shortText, href }),
  }),
  z.object({ ...sectionBase, type: z.literal("video"), title: shortText, url: href, poster: href }),
  z.object({
    ...sectionBase,
    type: z.literal("depoimentos"),
    title: shortText,
    items: z.array(z.object({ id, name: shortText, text: z.string().max(400), rating: z.number().int().min(1).max(5) })).max(8),
  }),
  z.object({ ...sectionBase, type: z.literal("instagram"), title: shortText, handle: shortText, url: href, images: z.array(href).max(8) }),
  z.object({ ...sectionBase, type: z.literal("contador"), title: shortText, text: shortText, endsAt: isoDate, cta: z.object({ label: shortText, href }) }),
  z.object({ ...sectionBase, type: z.literal("newsletter"), title: shortText, text: shortText, buttonLabel: shortText }),
]);

export type HomeSection = z.infer<typeof homeSectionSchema>;
export type HomeSectionType = HomeSection["type"];

// ── Tema completo ───────────────────────────────────────────────────────
export const themeSchema = z.object({
  version: z.literal(2),
  preset: z.string().max(40),
  colors: colorsSchema,
  typography: typographySchema,
  shape: shapeSchema,
  buttons: buttonsSchema,
  header: headerSchema,
  announcement: announcementSchema,
  footer: footerSchema,
  productCard: productCardSchema,
  productPage: productPageSchema,
  motion: motionSchema,
  decor: decorSchema,
  hero: heroSchema,
  productCarousel: productCarouselSchema,
  home: z.object({ sections: z.array(homeSectionSchema).max(30) }),
});

export type Theme = z.infer<typeof themeSchema>;
export type ThemeColors = Theme["colors"];
export type HeroSlide = z.infer<typeof heroSlideSchema>;
export type ProductCardSettings = Theme["productCard"];
export type MotionSettings = Theme["motion"];
export type DecorSettings = Theme["decor"];
