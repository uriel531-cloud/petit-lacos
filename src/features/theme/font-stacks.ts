/** Valores de font-family e nomes exibidos — sem next/font, pode ser usado no cliente. */
const SYSTEM_FALLBACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';

/** Chave do tema → valor de font-family. */
export const FONT_STACKS: Record<string, string> = {
  cormorant: 'var(--ff-cormorant), "Cormorant Garamond", Garamond, serif',
  playfair: "var(--ff-playfair), Georgia, serif",
  fraunces: "var(--ff-fraunces), Georgia, serif",
  "dm-serif": "var(--ff-dm-serif), Georgia, serif",
  // Pilha "estilo Apple": usa a fonte do sistema no iPhone/Mac e Inter nos demais
  inter: `-apple-system, BlinkMacSystemFont, var(--ff-inter), "Segoe UI", sans-serif`,
  quicksand: `var(--ff-quicksand), ${SYSTEM_FALLBACK}`,
  "nunito-sans": `var(--ff-nunito-sans), ${SYSTEM_FALLBACK}`,
  lato: `var(--ff-lato), ${SYSTEM_FALLBACK}`,
  poppins: `var(--ff-poppins), ${SYSTEM_FALLBACK}`,
  sacramento: 'var(--ff-sacramento), "Segoe Script", cursive',
  "dancing-script": "var(--ff-dancing-script), cursive",
  "great-vibes": "var(--ff-great-vibes), cursive",
  parisienne: "var(--ff-parisienne), cursive",
};

/** Nomes exibidos no editor. */
export const FONT_LABELS: Record<string, string> = {
  cormorant: "Cormorant Garamond",
  playfair: "Playfair Display",
  fraunces: "Fraunces",
  "dm-serif": "DM Serif Display",
  inter: "Inter (estilo Apple)",
  quicksand: "Quicksand",
  "nunito-sans": "Nunito Sans",
  lato: "Lato",
  poppins: "Poppins",
  sacramento: "Sacramento",
  "dancing-script": "Dancing Script",
  "great-vibes": "Great Vibes",
  parisienne: "Parisienne",
};
