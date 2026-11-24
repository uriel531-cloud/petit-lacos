import type { Transition, Variants } from "motion/react";

import type { MotionSettings } from "@/features/theme/schema";

const DURATION = { rapida: 0.35, padrao: 0.6, lenta: 0.9 } as const;

export function motionTransition(m: MotionSettings, delay = 0): Transition {
  if (m.easing === "mola") {
    return { type: "spring", stiffness: m.speed === "rapida" ? 260 : m.speed === "lenta" ? 120 : 180, damping: 18, delay };
  }
  return { duration: DURATION[m.speed], ease: [0.25, 0.1, 0.25, 1], delay };
}

export type RevealKind = MotionSettings["reveal"];

/** Estados "escondido" → "visível" de cada tipo de entrada ao rolar. */
export function revealVariants(kind: RevealKind, level: MotionSettings["level"]): Variants {
  const k = level === "expressivo" ? 2 : 1;
  const hidden: Record<RevealKind, Variants["hidden"]> = {
    "fade-up": { opacity: 0, y: 20 * k },
    slide: { opacity: 0, x: -28 * k },
    zoom: { opacity: 0, scale: 1 - 0.05 * k },
    blur: { opacity: 0, filter: `blur(${6 * k}px)`, y: 8 },
    nenhum: { opacity: 1 },
  };
  return {
    hidden: hidden[kind],
    visible: { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" },
  };
}
