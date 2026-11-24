import Image from "next/image";

import { siteConfig } from "@/config/site";
import type { Theme } from "@/features/theme/schema";

import { StoreLink } from "../store-link";

export function StoreFooter({ footer }: { footer: Theme["footer"] }) {
  return (
    <footer className="mt-auto bg-[var(--footer-bg)] text-[var(--footer-fg)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div className="space-y-4">
          <Image src={siteConfig.logo.withBackground} alt={siteConfig.name} width={96} height={96} className="rounded-[calc(var(--radius)*0.5)]" />
          <p className="max-w-xs text-sm opacity-85">{footer.about}</p>
          {footer.showSocial && footer.instagram ? (
            <a href={footer.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline">
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
              Instagram
            </a>
          ) : null}
        </div>

        {footer.columns.map((col) => (
          <nav key={col.id} aria-label={col.title}>
            <p className="font-heading text-lg text-[var(--footer-fg)]">{col.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.id}>
                  <StoreLink href={l.href} className="opacity-85 underline-offset-4 hover:underline hover:opacity-100">
                    {l.label}
                  </StoreLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {footer.showNewsletter ? (
          <div>
            <p className="font-heading text-lg text-[var(--footer-fg)]">Novidades por e-mail</p>
            <p className="mt-2 text-sm opacity-85">Cadastro de newsletter disponível em breve.</p>
          </div>
        ) : null}
      </div>

      <div className="border-t border-current/15">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs opacity-80 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {siteConfig.name} · {siteConfig.slogan}
            {" · "}
            <a href="/admin" className="underline-offset-4 hover:underline">
              Área do funcionário
            </a>
          </p>
          {footer.showPayments ? (
            <ul className="flex flex-wrap gap-1.5" aria-label="Formas de pagamento">
              {["Pix", "Visa", "Mastercard", "Elo", "Boleto", "Mercado Pago"].map((p) => (
                <li key={p} className="rounded border border-current/25 px-2 py-0.5 font-semibold">
                  {p}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
