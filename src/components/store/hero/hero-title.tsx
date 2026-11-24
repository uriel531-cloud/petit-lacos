"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

import type { HeroSlide } from "@/features/theme/schema";

const PLACEHOLDER = "{palavras}";

/** Aplica o estilo de destaque (cor, script ou sublinhado à mão). */
export function Highlight({ style, children }: { style: HeroSlide["highlightStyle"]; children: ReactNode }) {
  if (style === "script") {
    return <span className="px-[0.06em] font-[family-name:var(--font-assinatura)] text-[1.18em] font-normal tracking-normal normal-case text-primary">{children}</span>;
  }
  if (style === "sublinhado") {
    return (
      <span className="relative inline-block whitespace-nowrap">
        {children}
        <svg
          viewBox="0 0 200 12"
          preserveAspectRatio="none"
          className="pointer-events-none absolute -bottom-[0.12em] left-0 h-[0.28em] w-full text-primary"
          aria-hidden
        >
          <path d="M2 9 C 40 2, 80 2, 110 6 S 170 11, 198 4" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  return <span className="text-primary">{children}</span>;
}

/** Quebra o texto e envolve o trecho destacado. */
function withHighlight(text: string, highlight: string, style: HeroSlide["highlightStyle"]): ReactNode {
  if (!highlight.trim() || !text.includes(highlight)) return text;
  const parts = text.split(highlight);
  return parts.flatMap((part, i) =>
    i < parts.length - 1 ? [part, <Highlight key={i} style={style}>{highlight}</Highlight>] : [part],
  );
}

function RotatingWords({ words, style, active }: { words: string[]; style: HeroSlide["highlightStyle"]; active: boolean }) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!active || words.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % words.length), 2200);
    return () => clearInterval(t);
  }, [active, words.length]);

  if (reduce || words.length < 2) return <Highlight style={style}>{words[0] ?? ""}</Highlight>;
  return (
    <span className="relative inline-grid align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={words[index]}
          initial={{ y: "70%", opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-70%", opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="col-start-1 row-start-1"
        >
          <Highlight style={style}>{words[index]}</Highlight>
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Typewriter({ text, highlight, style, active }: { text: string; highlight: string; style: HeroSlide["highlightStyle"]; active: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reinicia a digitação quando o slide volta a ficar ativo
    setCount(0);
    const t = setInterval(() => setCount((c) => (c >= text.length ? c : c + 1)), 45);
    return () => clearInterval(t);
  }, [active, text]);
  const done = count >= text.length;
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {done ? withHighlight(text, highlight, style) : text.slice(0, count)}
        <span className="animate-caret ml-0.5 inline-block w-[0.06em] bg-current align-[-0.08em]" style={{ height: "0.9em" }} />
      </span>
    </>
  );
}

type HeroTitleProps = { slide: HeroSlide; active: boolean; as: "h1" | "h2" };

export function HeroTitle({ slide, active, as }: HeroTitleProps) {
  const reduce = useReducedMotion();
  const Tag = as;
  const effect = reduce ? "nenhum" : slide.textEffect;
  const hasPlaceholder = slide.title.includes(PLACEHOLDER);
  const words = slide.rotatingWords.filter(Boolean);

  const titleStyle: React.CSSProperties = {
    fontFamily:
      slide.font === "script" ? "var(--font-assinatura)" : slide.font === "texto" ? "var(--font-texto)" : "var(--font-titulo)",
    fontWeight: slide.weight,
    letterSpacing: `${slide.letterSpacing}em`,
    textTransform: slide.uppercase ? "uppercase" : "none",
    color: slide.textColor,
    ["--hs-m" as string]: `${slide.sizeMobile}px`,
    ["--hs-d" as string]: `${slide.sizeDesktop}px`,
  };
  const className = "text-[length:var(--hs-m)] leading-[1.05] text-balance md:text-[length:var(--hs-d)]";

  // Máquina de escrever: digita o título inteiro (sem as palavras rotativas)
  if (effect === "maquina") {
    const plain = slide.title.replace(PLACEHOLDER, words[0] ?? "").trim();
    return (
      <Tag className={className} style={titleStyle}>
        <Typewriter text={plain} highlight={slide.highlight} style={slide.highlightStyle} active={active} />
      </Tag>
    );
  }

  // Monta o título com destaque e (se houver) as palavras rotativas
  const rotating =
    effect === "rotativas" && words.length > 0 ? (
      <RotatingWords words={words} style={slide.highlightStyle} active={active} />
    ) : (
      <Highlight style={slide.highlightStyle}>{words[0] ?? ""}</Highlight>
    );
  const [before, after] = hasPlaceholder ? slide.title.split(PLACEHOLDER) : [slide.title, ""];
  const content = (
    <>
      {withHighlight(before ?? "", slide.highlight, slide.highlightStyle)}
      {hasPlaceholder || (effect === "rotativas" && words.length > 0) ? (
        <>
          {!hasPlaceholder ? " " : null}
          {rotating}
        </>
      ) : null}
      {withHighlight(after ?? "", slide.highlight, slide.highlightStyle)}
    </>
  );

  if (effect === "letra") {
    // Palavra por palavra (mantém o destaque intacto)
    const tokens = (hasPlaceholder ? slide.title.replace(PLACEHOLDER, words[0] ?? "") : slide.title).split(/(\s+)/);
    return (
      <Tag className={className} style={titleStyle} aria-label={tokens.join("")}>
        {tokens.map((token, i) =>
          /^\s+$/.test(token) ? (
            token
          ) : (
            <motion.span
              key={`${i}-${active}`}
              aria-hidden
              className="inline-block"
              initial={{ opacity: 0, y: "0.4em", filter: "blur(6px)" }}
              animate={active ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
              transition={{ duration: 0.5, delay: i * 0.045, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {slide.highlight && token.includes(slide.highlight) ? <Highlight style={slide.highlightStyle}>{token}</Highlight> : token}
            </motion.span>
          ),
        )}
      </Tag>
    );
  }

  if (effect === "fade") {
    return (
      <motion.div
        key={String(active)}
        initial={{ opacity: 0, y: 18 }}
        animate={active ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Tag className={className} style={titleStyle}>
          {content}
        </Tag>
      </motion.div>
    );
  }

  return (
    <Tag className={className} style={titleStyle}>
      {content}
    </Tag>
  );
}
