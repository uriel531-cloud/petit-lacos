"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { Theme } from "@/features/theme/schema";

import { useHref } from "../store-context";

const DISMISS_KEY = "petit-aviso-fechado";

export function AnnouncementBar({ announcement }: { announcement: Theme["announcement"] }) {
  const href = useHref();
  const messages = announcement.messages.filter(Boolean);
  const [index, setIndex] = useState(0);
  const [hidden, setHidden] = useState(false);
  const signature = messages.join("|");

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lê preferência salva após montar
      setHidden(window.sessionStorage.getItem(DISMISS_KEY) === signature);
    } catch {
      // armazenamento bloqueado: mostra o aviso
    }
  }, [signature]);

  useEffect(() => {
    if (messages.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % messages.length), announcement.rotateSeconds * 1000);
    return () => clearInterval(t);
  }, [messages.length, announcement.rotateSeconds]);

  if (!announcement.enabled || messages.length === 0 || hidden) return null;
  const current = messages[index % messages.length];
  const text = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={current}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.3 }}
        className="block"
      >
        {current}
      </motion.span>
    </AnimatePresence>
  );

  return (
    <div className="relative bg-[var(--announcement-bg)] px-10 py-2 text-center text-sm text-[var(--announcement-fg)]" role="region" aria-label="Avisos da loja">
      <div aria-live="polite">{announcement.link ? <Link href={href(announcement.link)} className="hover:underline">{text}</Link> : text}</div>
      {announcement.dismissible ? (
        <button
          type="button"
          onClick={() => {
            setHidden(true);
            try {
              window.sessionStorage.setItem(DISMISS_KEY, signature);
            } catch {
              // ignora
            }
          }}
          className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-full opacity-70 hover:opacity-100"
          aria-label="Fechar aviso"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
