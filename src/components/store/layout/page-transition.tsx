"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useStore } from "../store-context";

/** Transição entre páginas (aba Animações → Transição entre páginas). */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { motion: m } = useStore();

  if (m.level === "nenhum" || m.pageTransition === "nenhuma") return <>{children}</>;

  const initial = m.pageTransition === "deslizar" ? { opacity: 0, x: 24 } : { opacity: 0 };
  return (
    <motion.div key={pathname} initial={initial} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}>
      {children}
    </motion.div>
  );
}
