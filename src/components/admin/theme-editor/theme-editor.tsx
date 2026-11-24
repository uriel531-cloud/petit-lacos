"use client";

import {
  Check,
  CloudOff,
  ExternalLink,
  Eye,
  GalleryHorizontal,
  History,
  LayoutGrid,
  Loader2,
  Monitor,
  Palette,
  PanelTop,
  Pencil,
  Redo2,
  Rows3,
  Smartphone,
  Sparkles,
  Tablet,
  Type,
  Undo2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { discardThemeDraft, publishTheme, saveThemeDraft } from "@/features/theme/actions";
import { themeToCss } from "@/features/theme/css";
import type { ThemeEditorData } from "@/features/theme/queries";
import type { Theme } from "@/features/theme/schema";

import { EditorContext, type EditorContextValue } from "./editor-context";
import { TabAnimacoes } from "./tab-animacoes";
import { TabCabecalho } from "./tab-cabecalho";
import { TabCores } from "./tab-cores";
import { TabHero } from "./tab-hero";
import { TabProdutos } from "./tab-produtos";
import { TabSecoes } from "./tab-secoes";
import { TabTemas } from "./tab-temas";
import { TabVersoes } from "./tab-versoes";

const TABS = [
  { id: "temas", label: "Temas", icon: Palette, Comp: TabTemas },
  { id: "cores", label: "Cores e fontes", icon: Type, Comp: TabCores },
  { id: "cabecalho", label: "Cabeçalho e rodapé", icon: PanelTop, Comp: TabCabecalho },
  { id: "produtos", label: "Produtos", icon: LayoutGrid, Comp: TabProdutos },
  { id: "hero", label: "Hero e carrossel", icon: GalleryHorizontal, Comp: TabHero },
  { id: "animacoes", label: "Animações", icon: Sparkles, Comp: TabAnimacoes },
  { id: "secoes", label: "Seções da Home", icon: Rows3, Comp: TabSecoes },
  { id: "versoes", label: "Versões", icon: History, Comp: TabVersoes },
] as const;

const DEVICES = {
  celular: { width: 390, icon: Smartphone, label: "Celular" },
  tablet: { width: 820, icon: Tablet, label: "Tablet" },
  desktop: { width: 1280, icon: Monitor, label: "Computador" },
} as const;

type SaveStatus = "salvo" | "salvando" | "erro";

type ThemeEditorProps = {
  data: ThemeEditorData;
  canPublish: boolean;
  categories: { slug: string; name: string }[];
  collections: { slug: string; name: string }[];
  images: string[];
  sampleProductSlug: string | null;
};

export function ThemeEditor({ data, canPublish, categories, collections, images, sampleProductSlug }: ThemeEditorProps) {
  const router = useRouter();
  // Histórico para desfazer/refazer num único estado (atualizações puras)
  const [history, setHistory] = useState<{ past: Theme[]; present: Theme; future: Theme[] }>({ past: [], present: data.draft, future: [] });
  const theme = history.present;
  const past = history.past;
  const future = history.future;
  const [status, setStatus] = useState<SaveStatus>("salvo");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("temas");
  const [device, setDevice] = useState<keyof typeof DEVICES>("desktop");
  const [page, setPage] = useState("");
  const [mobileView, setMobileView] = useState<"editar" | "previa">("editar");
  const [publishing, startPublish] = useTransition();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const frameBoxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 1000, height: 700 });
  const skipSave = useRef(true);
  const lastServerDraft = useRef(JSON.stringify(data.draft));

  // Quando o servidor manda um rascunho novo (restaurar/importar/descartar), o editor acompanha
  useEffect(() => {
    const incoming = JSON.stringify(data.draft);
    if (incoming !== lastServerDraft.current) {
      lastServerDraft.current = incoming;
      skipSave.current = true;
       
      setHistory({ past: [], present: data.draft, future: [] });
    }
  }, [data.draft]);

  const post = useCallback((message: unknown) => {
    iframeRef.current?.contentWindow?.postMessage(message, window.location.origin);
  }, []);

  // Cores/fontes aplicadas na hora + salvamento automático do rascunho
  useEffect(() => {
    post({ type: "tema-css", css: themeToCss(theme) });
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
     
    setStatus("salvando");
    const timer = setTimeout(async () => {
      const res = await saveThemeDraft(theme);
      if (res.ok) {
        lastServerDraft.current = JSON.stringify(theme);
        setStatus("salvo");
        setSaveError(null);
        post({ type: "tema-atualizado" });
      } else {
        setStatus("erro");
        setSaveError(res.error);
      }
    }, 650);
    return () => clearTimeout(timer);
  }, [theme, post]);

  // Pré-visualização carregada → manda o CSS atual
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin === window.location.origin && (e.data as { type?: string })?.type === "previa-pronta") {
        post({ type: "tema-css", css: themeToCss(theme) });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [theme, post]);

  // Mede o espaço da pré-visualização para escalar o "aparelho"
  useEffect(() => {
    const el = frameBoxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setBox({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [mobileView]);

  // Aviso ao sair com salvamento pendente
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (status === "salvando") e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [status]);

  const update = useCallback<EditorContextValue["update"]>((recipe) => {
    setHistory((h) => {
      const next = structuredClone(h.present);
      recipe(next);
      return { past: [...h.past.slice(-49), h.present], present: next, future: [] };
    });
  }, []);

  const replace = useCallback<EditorContextValue["replace"]>((next) => {
    setHistory((h) => ({ past: [...h.past.slice(-49), h.present], present: next, future: [] }));
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      const previous = h.past.at(-1);
      if (!previous) return h;
      return { past: h.past.slice(0, -1), present: previous, future: [h.present, ...h.future] };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((h) => {
      const [next, ...rest] = h.future;
      if (!next) return h;
      return { past: [...h.past, h.present], present: next, future: rest };
    });
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, [contenteditable]")) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const hasUnpublished = useMemo(() => JSON.stringify(theme) !== JSON.stringify(data.published), [theme, data.published]);

  function publish() {
    startPublish(async () => {
      const saved = await saveThemeDraft(theme);
      if (!saved.ok) {
        toast.error(saved.error);
        return;
      }
      const res = await publishTheme();
      if (res.ok) {
        toast.success(res.message);
        router.refresh();
      } else toast.error(res.error);
    });
  }

  function discard() {
    if (!window.confirm("Descartar todas as alterações não publicadas?")) return;
    startPublish(async () => {
      const res = await discardThemeDraft();
      if (res.ok) {
        toast.success(res.message);
        router.refresh();
        post({ type: "tema-atualizado" });
      } else toast.error(res.error);
    });
  }

  const previewPages = [
    { value: "", label: "Página inicial" },
    { value: "/produtos", label: "Lista de produtos" },
    ...(sampleProductSlug ? [{ value: `/produto/${sampleProductSlug}`, label: "Página de produto" }] : []),
  ];

  const deviceWidth = DEVICES[device].width;
  const scale = Math.min(1, box.width / deviceWidth);
  const ActiveTab = TABS.find((t) => t.id === tab)!.Comp;

  const ctx: EditorContextValue = {
    theme,
    update,
    replace,
    canPublish,
    data,
    categories,
    collections,
    images,
    reload: () => router.refresh(),
  };

  return (
    <EditorContext value={ctx}>
      <div className="flex h-[calc(100svh-3.5rem)] flex-col lg:h-svh">
        {/* Barra superior */}
        <header className="flex flex-wrap items-center gap-2 border-b bg-background px-3 py-2">
          <h1 className="mr-2 font-heading text-2xl">Aparência</h1>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" aria-live="polite" title={saveError ?? undefined}>
            {status === "salvando" ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Salvando rascunho…
              </>
            ) : status === "erro" ? (
              <span className="inline-flex items-center gap-1 text-destructive">
                <CloudOff className="size-3.5" /> {saveError ?? "Erro ao salvar"}
              </span>
            ) : (
              <>
                <Check className="size-3.5" /> Rascunho salvo
              </>
            )}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <button type="button" onClick={undo} disabled={!past.length} className="grid size-9 place-items-center rounded-full hover:bg-muted disabled:opacity-30" aria-label="Desfazer (Ctrl+Z)" title="Desfazer (Ctrl+Z)">
              <Undo2 className="size-4" />
            </button>
            <button type="button" onClick={redo} disabled={!future.length} className="grid size-9 place-items-center rounded-full hover:bg-muted disabled:opacity-30" aria-label="Refazer (Ctrl+Shift+Z)" title="Refazer (Ctrl+Shift+Z)">
              <Redo2 className="size-4" />
            </button>
            <a
              href={`/admin/previa${page}`}
              target="_blank"
              rel="noopener"
              className="hidden items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold hover:border-primary sm:inline-flex"
            >
              <ExternalLink className="size-4" /> Ver rascunho no site
            </a>
            {hasUnpublished ? (
              <button type="button" onClick={discard} disabled={publishing} className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted">
                Descartar
              </button>
            ) : null}
            <button
              type="button"
              onClick={publish}
              disabled={!canPublish || publishing || !hasUnpublished || status === "erro"}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-40"
              title={!canPublish ? "Só quem tem permissão de publicar" : undefined}
            >
              {publishing ? <Loader2 className="size-4 animate-spin" /> : null}
              {hasUnpublished ? "Publicar" : "Publicado"}
            </button>
          </div>
        </header>

        {/* Celular: alterna entre editar e ver */}
        <div className="flex border-b bg-background lg:hidden">
          {(["editar", "previa"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setMobileView(v)}
              aria-pressed={mobileView === v}
              className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-semibold ${mobileView === v ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
            >
              {v === "editar" ? <Pencil className="size-4" /> : <Eye className="size-4" />}
              {v === "editar" ? "Editar" : "Ver prévia"}
            </button>
          ))}
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Painel de controles */}
          <aside className={`${mobileView === "editar" ? "flex" : "hidden"} w-full min-w-0 flex-col border-r bg-sidebar lg:flex lg:w-[26rem] lg:shrink-0 xl:w-[30rem]`}>
            <nav aria-label="Seções do editor" className="flex gap-1 overflow-x-auto border-b bg-background p-2 scrollbar-none lg:flex-wrap">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    aria-current={tab === t.id}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${tab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    <Icon className="size-3.5" aria-hidden />
                    {t.label}
                  </button>
                );
              })}
            </nav>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <ActiveTab />
            </div>
          </aside>

          {/* Pré-visualização */}
          <section aria-label="Pré-visualização" className={`${mobileView === "previa" ? "flex" : "hidden"} min-w-0 flex-1 flex-col bg-muted lg:flex`}>
            <div className="flex flex-wrap items-center gap-2 border-b bg-background px-3 py-2">
              <div role="radiogroup" aria-label="Aparelho" className="flex rounded-full border p-0.5">
                {(Object.keys(DEVICES) as (keyof typeof DEVICES)[]).map((d) => {
                  const Icon = DEVICES[d].icon;
                  return (
                    <button
                      key={d}
                      type="button"
                      role="radio"
                      aria-checked={device === d}
                      onClick={() => setDevice(d)}
                      className={`grid size-8 place-items-center rounded-full ${device === d ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                      aria-label={DEVICES[d].label}
                      title={DEVICES[d].label}
                    >
                      <Icon className="size-4" />
                    </button>
                  );
                })}
              </div>
              <label className="flex items-center gap-2 text-sm">
                <span className="sr-only">Página da pré-visualização</span>
                <select value={page} onChange={(e) => setPage(e.target.value)} className="h-9 rounded-full border bg-background px-3 text-sm font-semibold">
                  {previewPages.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
              <span className="ml-auto hidden text-xs text-muted-foreground md:inline">
                {DEVICES[device].label} · {deviceWidth}px{scale < 1 ? ` · ${Math.round(scale * 100)}%` : ""}
              </span>
            </div>
            <div ref={frameBoxRef} className="relative min-h-0 flex-1 overflow-hidden p-0">
              <div
                className="absolute top-0 left-1/2 origin-top overflow-hidden bg-background shadow-xl"
                style={{
                  width: deviceWidth,
                  height: box.height / scale,
                  transform: `translateX(-50%) scale(${scale})`,
                  borderRadius: device === "desktop" ? 0 : 28 / scale,
                }}
              >
                <iframe ref={iframeRef} key={page} src={`/admin/previa${page}`} title="Pré-visualização do rascunho" className="size-full border-0" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </EditorContext>
  );
}
