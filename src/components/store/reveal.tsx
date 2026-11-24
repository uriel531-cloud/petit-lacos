"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { motionTransition, revealVariants, type RevealKind } from "./motion-presets";
import { useStore } from "./store-context";

type RevealProps = {
  children: ReactNode;
  /** Posição na lista — gera o efeito "um depois do outro" (stagger) */
  index?: number;
  /** Sobrescreve o tipo de entrada do tema (seções podem escolher a sua) */
  kind?: RevealKind | "herdar" | "nenhuma";
  className?: string;
  as?: "div" | "li";
};

/** Anima o conteúdo quando ele entra na tela, conforme a aba "Animações" do editor. */
export function Reveal({ children, index = 0, kind = "herdar", className, as = "div" }: RevealProps) {
  const { motion: m } = useStore();
  const resolved: RevealKind = kind === "herdar" ? m.reveal : kind === "nenhuma" ? "nenhum" : kind;

  if (m.level === "nenhum" || resolved === "nenhum") {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const Comp = as === "li" ? motion.li : motion.div;
  return (
    <Comp
      className={className}
      variants={revealVariants(resolved, m.level)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={motionTransition(m, Math.min(index, 12) * (m.stagger / 1000))}
    >
      {children}
    </Comp>
  );
}
