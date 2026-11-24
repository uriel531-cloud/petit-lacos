"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { createContext, use, useCallback, useEffect, useState, type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";

/**
 * Tema claro/escuro do PAINEL. A escolha fica salva neste navegador.
 * "Automático" segue o tema do celular/computador. A loja não é afetada:
 * a classe .dark sai do <html> quando a pessoa deixa o painel.
 */
export type AdminThemeMode = "claro" | "escuro" | "auto";

export const ADMIN_THEME_KEY = "petit-painel-tema";

/** Roda antes de pintar a tela (sem "piscar" claro → escuro). */
export const ADMIN_THEME_SCRIPT = `(function(){try{if(location.pathname.indexOf('/admin/previa')===0)return;var m=localStorage.getItem('${ADMIN_THEME_KEY}')||'auto';var d=m==='escuro'||(m==='auto'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}})();`;

function readMode(): AdminThemeMode {
  try {
    const v = window.localStorage.getItem(ADMIN_THEME_KEY);
    return v === "claro" || v === "escuro" ? v : "auto";
  } catch {
    return "auto";
  }
}

function resolveDark(mode: AdminThemeMode) {
  return mode === "escuro" || (mode === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

type Ctx = { mode: AdminThemeMode; dark: boolean; setMode: (m: AdminThemeMode) => void };
const AdminThemeContext = createContext<Ctx | null>(null);

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  // A pré-visualização mostra a LOJA (sempre clara). Começa "true" e só libera no navegador.
  const [skip, setSkip] = useState(true);
  const [mode, setModeState] = useState<AdminThemeMode>("auto");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- só o navegador sabe o endereço sem bloquear a pré-renderização
    setSkip(window.location.pathname.startsWith("/admin/previa"));
  }, []);

  useEffect(() => {
    if (skip) return;
    const apply = () => {
      const d = resolveDark(readMode());
      document.documentElement.classList.toggle("dark", d);
      setDark(d);
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lê a preferência salva no navegador
    setModeState(readMode());
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      document.documentElement.classList.remove("dark");
    };
  }, [skip]);

  const setMode = useCallback((m: AdminThemeMode) => {
    try {
      window.localStorage.setItem(ADMIN_THEME_KEY, m);
    } catch {
      // armazenamento bloqueado: vale só nesta visita
    }
    setModeState(m);
    const d = resolveDark(m);
    document.documentElement.classList.toggle("dark", d);
    setDark(d);
  }, []);

  return (
    <AdminThemeContext value={{ mode, dark, setMode }}>
      {children}
      {skip ? null : <Toaster position="top-center" richColors theme={dark ? "dark" : "light"} />}
    </AdminThemeContext>
  );
}

export function useAdminTheme() {
  const ctx = use(AdminThemeContext);
  if (!ctx) throw new Error("useAdminTheme fora do AdminThemeProvider");
  return ctx;
}

const OPTIONS = [
  { value: "claro", label: "Claro", icon: Sun },
  { value: "escuro", label: "Escuro", icon: Moon },
  { value: "auto", label: "Automático", icon: Monitor },
] as const;

/** Seletor acessível (grupo de rádio) do tema do painel. */
export function AdminThemeToggle({ compact = false }: { compact?: boolean }) {
  const { mode, setMode } = useAdminTheme();
  return (
    <div role="radiogroup" aria-label="Tema do painel" className="flex rounded-full border bg-background p-0.5">
      {OPTIONS.map((o) => {
        const Icon = o.icon;
        const active = mode === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`Tema ${o.label.toLowerCase()}`}
            title={`Tema ${o.label.toLowerCase()}`}
            onClick={() => setMode(o.value)}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition ${
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="size-3.5" aria-hidden />
            {compact ? null : o.label}
          </button>
        );
      })}
    </div>
  );
}
