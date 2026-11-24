"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useRef } from "react";

import type { HeroSlide } from "@/features/theme/schema";

import { SmartImage } from "../smart-image";
import { useHref, useStore } from "../store-context";
import { HeroTitle } from "./hero-title";

const HEIGHT = {
  compacta: "min-h-[22rem] md:min-h-[26rem]",
  media: "min-h-[30rem] md:min-h-[36rem]",
  cheia: "min-h-[calc(100svh-4rem)]",
} as const;

const VERTICAL = { topo: "justify-start", meio: "justify-center", base: "justify-end" } as const;
const ALIGN_TEXT = { esquerda: "items-start text-left", centro: "items-center text-center", direita: "items-end text-right" } as const;

type HeroSlideViewProps = {
  slide: HeroSlide;
  active: boolean;
  first: boolean;
  kenBurns: boolean;
  intervalSeconds: number;
};

export function HeroSlideView({ slide, active, first, kenBurns, intervalSeconds }: HeroSlideViewProps) {
  const { motion: m } = useStore();
  const href = useHref();
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const parallaxPx = m.level === "nenhum" || reduce ? 0 : (m.parallax / 100) * 140;
  const bgY = useTransform(scrollYProgress, [0, 1], [0, parallaxPx]);
  const sideY = useTransform(scrollYProgress, [0, 1], [0, -parallaxPx * 0.6]);

  const bg = slide.background;
  const background: React.CSSProperties =
    bg.type === "cor"
      ? { backgroundColor: bg.color }
      : bg.type === "gradiente"
        ? { backgroundImage: `linear-gradient(${bg.gradientAngle}deg, ${bg.gradientFrom}, ${bg.gradientTo})` }
        : { backgroundColor: bg.color };
  const objectPosition = `${bg.focusX}% ${bg.focusY}%`;
  const hasSide = Boolean(slide.sideImage);
  const sideFirst = slide.align === "direita";

  return (
    <div ref={ref} className={`relative isolate flex h-full w-full overflow-hidden ${HEIGHT[slide.height]}`} style={background}>
      {/* Fundo (com parallax) */}
      <motion.div className="absolute inset-[-12%_0] -z-10" style={{ y: bgY }} data-parallax-layer>
        <div
          key={`${active}`}
          className={`absolute inset-0 ${kenBurns && active ? "animate-kenburns" : ""}`}
          style={{ ["--kenburns-duration" as string]: `${intervalSeconds + 1.5}s` }}
        >
          {bg.type === "imagem" && bg.image ? (
            <>
              <SmartImage
                src={bg.image}
                alt=""
                fill
                priority={first}
                sizes="100vw"
                className={`object-cover ${bg.imageMobile ? "hidden md:block" : ""}`}
                style={{ objectPosition }}
              />
              {bg.imageMobile ? (
                <SmartImage src={bg.imageMobile} alt="" fill priority={first} sizes="100vw" className="object-cover md:hidden" style={{ objectPosition }} />
              ) : null}
            </>
          ) : null}
          {bg.type === "video" && bg.video ? (
            <video
              className="absolute inset-0 size-full object-cover"
              style={{ objectPosition }}
              src={bg.video}
              poster={bg.image || undefined}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden
            />
          ) : null}
        </div>
      </motion.div>
      {slide.overlay.opacity > 0 ? (
        <div
          className="absolute inset-0 -z-10"
          style={{ backgroundColor: slide.overlay.tone === "escuro" ? "#000" : "#fff", opacity: slide.overlay.opacity / 100 }}
          aria-hidden
        />
      ) : null}

      <div
        data-hero-content
        className={`mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 md:px-16 md:py-20 ${
          hasSide && slide.align !== "centro" ? "items-center md:grid-cols-2" : ""
        }`}
      >
        <div className={`flex flex-col gap-5 ${ALIGN_TEXT[slide.align]} ${VERTICAL[slide.vertical]} ${sideFirst && hasSide ? "md:order-2" : ""}`}>
          {hasSide && slide.align === "centro" ? (
            <motion.div style={{ y: sideY }} className="relative h-28 w-56 md:h-36 md:w-72">
              <SmartImage src={slide.sideImage} alt="" fill sizes="288px" className="object-contain" />
            </motion.div>
          ) : null}
          {slide.eyebrow ? (
            <p className="text-xs font-bold tracking-[0.2em] uppercase opacity-80" style={{ color: slide.textColor }}>
              {slide.eyebrow}
            </p>
          ) : null}
          <HeroTitle slide={slide} active={active} as={first ? "h1" : "h2"} />
          {slide.subtitle ? (
            <p className="max-w-xl text-base md:text-lg" style={{ color: slide.textColor, opacity: 0.85 }}>
              {slide.subtitle}
            </p>
          ) : null}
          <div className={`flex flex-wrap gap-3 pt-1 ${slide.align === "centro" ? "justify-center" : slide.align === "direita" ? "justify-end" : ""}`}>
            {slide.primaryCta.label ? (
              <Link href={href(slide.primaryCta.href || "/produtos")} className="btn-theme">
                {slide.primaryCta.label}
              </Link>
            ) : null}
            {slide.secondaryCta.enabled && slide.secondaryCta.label ? (
              <Link href={href(slide.secondaryCta.href || "/produtos")} className="btn-theme-secondary" style={{ color: slide.textColor }}>
                {slide.secondaryCta.label}
              </Link>
            ) : null}
          </div>
        </div>

        {hasSide && slide.align !== "centro" ? (
          <motion.div style={{ y: sideY }} className={`relative aspect-[4/3] w-full ${sideFirst ? "md:order-1" : ""}`}>
            <div
              className={`relative size-full overflow-hidden ${!slide.sideImage.startsWith("/brand") ? "rounded-[calc(var(--radius)*1.6)] shadow-card" : ""}`}
            >
              <SmartImage
                src={slide.sideImage}
                alt=""
                fill
                priority={first}
                sizes="(min-width: 768px) 50vw, 100vw"
                className={!slide.sideImage.startsWith("/brand") ? "object-cover" : "object-contain drop-shadow-xl"}
              />
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
