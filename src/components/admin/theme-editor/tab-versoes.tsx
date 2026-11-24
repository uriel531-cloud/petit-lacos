"use client";

import { Download, History, RotateCcw, Upload } from "lucide-react";
import { useRef, useTransition } from "react";
import { toast } from "sonner";

import { importTheme, resetThemeDraft, restoreThemeVersion, type ActionResult } from "@/features/theme/actions";

import { useEditor } from "./editor-context";
import { Group } from "./fields";

export function TabVersoes() {
  const { theme, data, reload } = useEditor();
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function run(action: () => Promise<ActionResult>, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    start(async () => {
      const res = await action();
      if (res.ok) {
        toast.success(res.message ?? "Pronto!");
        reload();
      } else toast.error(res.error);
    });
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tema-petit-lacos-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <Group title="Histórico de versões publicadas" description="“Restaurar” coloca a versão no rascunho. Publique para aplicar na loja.">
        {data.versions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma versão publicada ainda.</p>
        ) : (
          <ul className="divide-y">
            {data.versions.map((v) => (
              <li key={v.id} className="flex items-center gap-3 py-2.5">
                <History className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{v.label ?? "Versão"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(v.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    {v.author ? ` · ${v.author}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => restoreThemeVersion(v.id), "Substituir o rascunho atual por esta versão?")}
                  className="rounded-full border px-3 py-1 text-xs font-semibold hover:border-primary"
                >
                  Restaurar
                </button>
              </li>
            ))}
          </ul>
        )}
      </Group>

      <Group title="Backup do tema" description="Baixe o tema como arquivo para guardar ou levar para outra loja.">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={exportJson} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold hover:border-primary">
            <Download className="size-4" /> Exportar tema (.json)
          </button>
          <button type="button" disabled={pending} onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold hover:border-primary">
            <Upload className="size-4" /> Importar tema
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              const text = await f.text();
              run(() => importTheme(text), "Importar este tema para o rascunho? As alterações não publicadas serão substituídas.");
            }}
          />
        </div>
      </Group>

      <Group title="Voltar ao padrão" description="Coloca no rascunho o tema original da Petit Laços (Petit Clássico com as seções iniciais).">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(resetThemeDraft, "Voltar o rascunho para o tema padrão? As alterações não publicadas serão perdidas.")}
          className="inline-flex items-center gap-2 rounded-full border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"
        >
          <RotateCcw className="size-4" /> Voltar ao padrão
        </button>
      </Group>
    </div>
  );
}
