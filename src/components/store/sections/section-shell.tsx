import type { ReactNode } from "react";

import type { HomeSection } from "@/features/theme/schema";

import { Reveal } from "../reveal";

const BG: Record<HomeSection["background"], string> = {
  branco: "bg-[var(--section-branco)]",
  ceu: "bg-[var(--section-ceu)]",
  marca: "bg-[var(--section-marca)]",
  perola: "bg-[var(--section-perola)]",
  destaque: "bg-[var(--section-destaque)]",
};

const SPACE: Record<HomeSection["spacing"], string> = {
  compacto: "py-8 md:py-10",
  padrao: "section-pad",
  amplo: "py-[calc(var(--section-space)*1.5)] lg:py-[calc(var(--section-space-lg)*1.4)]",
};

export function SectionShell({
  section,
  children,
  full = false,
  className = "",
}: {
  section: HomeSection;
  children: ReactNode;
  full?: boolean;
  className?: string;
}) {
  return (
    <section className={`${BG[section.background]} ${SPACE[section.spacing]} ${className}`} data-section={section.type}>
      {full ? children : <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>}
    </section>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
  animation,
  center = false,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  animation: HomeSection["animation"];
  center?: boolean;
}) {
  if (!title && !subtitle && !action) return null;
  return (
    <Reveal kind={animation} className={`mb-8 flex gap-3 ${center ? "flex-col items-center text-center" : "flex-wrap items-end justify-between"}`}>
      <div>
        {title ? <h2 className="text-3xl md:text-4xl">{title}</h2> : null}
        {subtitle ? <p className="mt-1 text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </Reveal>
  );
}
