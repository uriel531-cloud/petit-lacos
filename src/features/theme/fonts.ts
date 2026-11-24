/**
 * Fontes disponíveis no Editor de Aparência (Google Fonts, hospedadas pelo next/font).
 * Todas declaram uma variável CSS; o tema escolhe qual variável vira --font-titulo,
 * --font-texto e --font-assinatura. O navegador só baixa as fontes realmente usadas.
 */
import {
  Cormorant_Garamond,
  Dancing_Script,
  DM_Serif_Display,
  Fraunces,
  Great_Vibes,
  Inter,
  Lato,
  Nunito_Sans,
  Parisienne,
  Playfair_Display,
  Poppins,
  Quicksand,
  Sacramento,
} from "next/font/google";

const cormorant = Cormorant_Garamond({ variable: "--ff-cormorant", subsets: ["latin"], weight: ["500", "600", "700"], style: ["normal", "italic"], display: "swap" });
const nunitoSans = Nunito_Sans({ variable: "--ff-nunito-sans", subsets: ["latin"], display: "swap" });
const sacramento = Sacramento({ variable: "--ff-sacramento", subsets: ["latin"], weight: "400", display: "swap" });

const playfair = Playfair_Display({ variable: "--ff-playfair", subsets: ["latin"], display: "swap", preload: false });
const fraunces = Fraunces({ variable: "--ff-fraunces", subsets: ["latin"], display: "swap", preload: false });
const dmSerif = DM_Serif_Display({ variable: "--ff-dm-serif", subsets: ["latin"], weight: "400", display: "swap", preload: false });
const inter = Inter({ variable: "--ff-inter", subsets: ["latin"], display: "swap", preload: false });
const quicksand = Quicksand({ variable: "--ff-quicksand", subsets: ["latin"], display: "swap", preload: false });
const lato = Lato({ variable: "--ff-lato", subsets: ["latin"], weight: ["400", "700"], display: "swap", preload: false });
const poppins = Poppins({ variable: "--ff-poppins", subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", preload: false });
const dancing = Dancing_Script({ variable: "--ff-dancing-script", subsets: ["latin"], display: "swap", preload: false });
const greatVibes = Great_Vibes({ variable: "--ff-great-vibes", subsets: ["latin"], weight: "400", display: "swap", preload: false });
const parisienne = Parisienne({ variable: "--ff-parisienne", subsets: ["latin"], weight: "400", display: "swap", preload: false });

/** Classe para o <html> com todas as variáveis de fonte. */
export const fontVariablesClassName = [
  cormorant,
  nunitoSans,
  sacramento,
  playfair,
  fraunces,
  dmSerif,
  inter,
  quicksand,
  lato,
  poppins,
  dancing,
  greatVibes,
  parisienne,
]
  .map((f) => f.variable)
  .join(" ");
