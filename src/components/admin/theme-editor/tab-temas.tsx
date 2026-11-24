"use client";

import { CalendarClock, Check, Gift, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { saveSeasonalSchedule } from "@/features/theme/actions";
import { addNatalContent, hasNatalContent, removeNatalContent } from "@/features/theme/natal-content";
import { applyPreset, PRESETS } from "@/features/theme/presets";

const NATAL_THUMBS = ["/natal/ursinho-de-trico.webp", "/natal/presente-laco-vermelho.webp", "/natal/arvore-enfeites.webp", "/natal/estrela-dourada.webp"];

import { useEditor } from "./editor-context";
import { DateTimeField, Group, SelectField } from "./fields";

export function TabTemas() {
  const { theme, replace, canPublish, data } = useEditor();
  const [schedule, setSchedule] = useState(data.schedule);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-4">
      <Group title="Temas prontos" description="Mudam só a aparência. Textos, menu, slides e seções continuam iguais. Tudo continua editável depois.">
        <ul className="grid gap-3">
          {PRESETS.map((p) => {
            const active = theme.preset === p.key;
            return (
              <li key={p.key}>
                <button
                  type="button"
                  onClick={() => {
                    if (active) return;
                    replace(applyPreset(theme, p));
                    toast.success(`Tema “${p.name}” aplicado ao rascunho`);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition ${active ? "border-primary bg-primary/5" : "hover:border-primary/40"}`}
                  aria-pressed={active}
                >
                  <span className="grid shrink-0 grid-cols-2 overflow-hidden rounded-lg border">
                    {p.swatch.map((c) => (
                      <span key={c} className="size-5" style={{ backgroundColor: c }} />
                    ))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 font-semibold">
                      {p.name}
                      {p.seasonal ? <span className="rounded-full bg-highlight px-2 py-0.5 text-[0.65rem] font-bold">Sazonal</span> : null}
                    </span>
                    <span className="block text-xs text-muted-foreground">{p.description}</span>
                  </span>
                  {active ? <Check className="size-5 shrink-0 text-primary" aria-label="Em uso" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </Group>

      <Group
        title="Conteúdo de Natal"
        description="Slide do hero com fotos natalinas, faixa “Feliz Natal”, grade com ursinho de tricô e presentes, banners e contagem regressiva até a véspera de Natal."
      >
        <ul className="grid grid-cols-4 gap-1.5" aria-hidden>
          {NATAL_THUMBS.map((src) => (
            <li key={src} className="aspect-square overflow-hidden rounded-lg bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element -- miniatura no editor */}
              <img src={src} alt="" className="size-full object-cover" />
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          {hasNatalContent(theme) ? (
            <button
              type="button"
              onClick={() => {
                replace(removeNatalContent(theme));
                toast.success("Conteúdo de Natal removido do rascunho");
              }}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold hover:border-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" /> Remover conteúdo de Natal
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                const natal = PRESETS.find((p) => p.key === "natal")!;
                const base = theme.preset === "natal" ? theme : applyPreset(theme, natal);
                replace(addNatalContent(base));
                toast.success("Natal aplicado: tema, decoração e conteúdo no rascunho");
              }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <Gift className="size-4" /> Aplicar Natal completo
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Fotos do Unsplash (licença livre para uso comercial). Créditos em <code>public/natal/CREDITOS.md</code>.
        </p>
      </Group>

      <Group
        title="Agendar tema sazonal"
        description="O tema entra sozinho na loja no início e sai no fim. Fora desse período, a loja usa o tema publicado."
      >
        <SelectField
          label="Tema"
          value={schedule.preset ?? "nenhum"}
          onChange={(v) => setSchedule((s) => ({ ...s, preset: v === "nenhum" ? null : v }))}
          options={[{ value: "nenhum", label: "Nenhum agendamento" }, ...PRESETS.map((p) => ({ value: p.key, label: p.name }))]}
        />
        {schedule.preset ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <DateTimeField label="Começa em" value={schedule.startsAt} onChange={(v) => setSchedule((s) => ({ ...s, startsAt: v }))} />
            <DateTimeField label="Termina em" value={schedule.endsAt} onChange={(v) => setSchedule((s) => ({ ...s, endsAt: v }))} />
          </div>
        ) : null}
        <button
          type="button"
          disabled={!canPublish || pending}
          onClick={() =>
            start(async () => {
              const res = await saveSeasonalSchedule(schedule);
              if (res.ok) toast.success(res.message);
              else toast.error(res.error);
            })
          }
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          <CalendarClock className="size-4" />
          {pending ? "Salvando…" : "Salvar agendamento"}
        </button>
        {!canPublish ? <p className="text-xs text-muted-foreground">Só quem pode publicar consegue agendar.</p> : null}
      </Group>
    </div>
  );
}
