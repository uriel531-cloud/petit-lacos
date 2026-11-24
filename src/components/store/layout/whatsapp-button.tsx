"use client";

import { fillTemplate, whatsappLink } from "@/features/whatsapp/links";

import { useStore } from "../store-context";

export function WhatsAppIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.13c-.24.68-1.42 1.3-1.95 1.34-.5.05-.97.23-3.27-.68-2.77-1.09-4.52-3.92-4.66-4.1-.13-.18-1.12-1.49-1.12-2.84 0-1.35.71-2.01.96-2.29.25-.27.54-.34.72-.34h.52c.17 0 .39-.06.61.46.23.54.77 1.89.84 2.02.07.14.11.3.02.48-.09.18-.14.29-.27.45-.14.16-.29.36-.41.48-.14.14-.28.29-.12.56.16.27.71 1.17 1.52 1.9 1.05.93 1.93 1.22 2.2 1.36.27.14.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.61-.14.25.09 1.58.75 1.85.88.27.14.45.2.52.32.07.11.07.66-.17 1.33Z" />
    </svg>
  );
}

/** Botão flutuante — só aparece quando há WhatsApp configurado na loja. */
export function WhatsAppFloatingButton() {
  const { settings } = useStore();
  if (!settings.whatsappMain) return null;
  const message = settings.whatsappTemplates.geral ?? "Olá! Vim pelo site da Petit Laços.";
  return (
    <a
      href={whatsappLink(settings.whatsappMain, fillTemplate(message, {}))}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
      aria-label="Falar com a gente no WhatsApp"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
