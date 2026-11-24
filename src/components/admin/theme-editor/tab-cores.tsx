"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { contrastChecks } from "@/features/theme/css";
import { FONT_LABELS, FONT_STACKS } from "@/features/theme/font-stacks";
import { BODY_FONTS, HEADING_FONTS, SCRIPT_FONTS, type Theme } from "@/features/theme/schema";

import { useEditor } from "./editor-context";
import { ColorField, Group, Segmented, SelectField, SliderField, SwitchField } from "./fields";

const COLOR_FIELDS: { key: keyof Theme["colors"]; label: string; hint?: string }[] = [
  { key: "background", label: "Fundo da página" },
  { key: "surface", label: "Cartões" },
  { key: "surfaceAlt", label: "Fundo de seções", hint: "Azul Céu na identidade" },
  { key: "brand", label: "Cor da marca", hint: "Azul Petit na identidade" },
  { key: "foreground", label: "Textos e títulos" },
  { key: "muted", label: "Texto secundário" },
  { key: "primary", label: "Botões, links e preços" },
  { key: "primaryForeground", label: "Texto do botão" },
  { key: "border", label: "Bordas" },
  { key: "highlight", label: "Destaque (selos)" },
  { key: "sale", label: "Promoção (-%)" },
  { key: "announcementBg", label: "Barra de avisos — fundo" },
  { key: "announcementFg", label: "Barra de avisos — texto" },
  { key: "footerBg", label: "Rodapé — fundo" },
  { key: "footerFg", label: "Rodapé — texto" },
];

function FontPreview({ fontKey, text }: { fontKey: string; text: string }) {
  return (
    <p className="truncate rounded-lg bg-muted px-3 py-2 text-xl" style={{ fontFamily: FONT_STACKS[fontKey] }}>
      {text}
    </p>
  );
}

export function TabCores() {
  const { theme, update } = useEditor();
  const checks = contrastChecks(theme);
  const failing = checks.filter((c) => !c.ok);

  return (
    <div className="space-y-4">
      <Group title="Cores" description="Mude qualquer cor e veja na hora na pré-visualização.">
        <div className="grid gap-4 sm:grid-cols-2">
          {COLOR_FIELDS.map((f) => (
            <ColorField key={f.key} label={f.label} hint={f.hint} value={theme.colors[f.key]} onChange={(v) => update((d) => void (d.colors[f.key] = v))} />
          ))}
        </div>
      </Group>

      <Group title="Contraste (leitura)" description="Verificação automática do nível AA (4,5:1) para textos.">
        {failing.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="size-4" /> Todas as combinações estão com boa leitura.
          </p>
        ) : (
          <ul className="grid gap-2">
            {failing.map((c) => (
              <li key={c.label} className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm">
                <AlertTriangle className="size-4 shrink-0 text-destructive" />
                <span className="flex-1">{c.label}</span>
                <span className="rounded px-1.5 py-0.5 text-xs font-bold" style={{ background: c.bg, color: c.fg }}>
                  Aa
                </span>
                <span className="font-mono text-xs tabular-nums">{c.ratio.toFixed(1)}:1</span>
              </li>
            ))}
          </ul>
        )}
      </Group>

      <Group title="Tipografia">
        <SelectField
          label="Fonte dos títulos"
          value={theme.typography.heading}
          onChange={(v) => update((d) => void (d.typography.heading = v))}
          options={HEADING_FONTS.map((f) => ({ value: f, label: FONT_LABELS[f] ?? f }))}
        />
        <FontPreview fontKey={theme.typography.heading} text="Novidades da semana" />
        <SelectField
          label="Fonte dos textos"
          value={theme.typography.body}
          onChange={(v) => update((d) => void (d.typography.body = v))}
          options={BODY_FONTS.map((f) => ({ value: f, label: FONT_LABELS[f] ?? f }))}
        />
        <FontPreview fontKey={theme.typography.body} text="Laço de cetim com presilha" />
        <SelectField
          label="Fonte de assinatura (destaques)"
          value={theme.typography.script}
          onChange={(v) => update((d) => void (d.typography.script = v))}
          options={SCRIPT_FONTS.map((f) => ({ value: f, label: FONT_LABELS[f] ?? f }))}
          hint="Use só em 2 ou 3 palavras, nunca em parágrafos."
        />
        <FontPreview fontKey={theme.typography.script} text="feito à mão" />
        <Segmented
          label="Tamanho dos textos"
          value={theme.typography.scale}
          onChange={(v) => update((d) => void (d.typography.scale = v))}
          options={[
            { value: "compacta", label: "Compacto" },
            { value: "padrao", label: "Padrão" },
            { value: "grande", label: "Grande" },
          ]}
        />
        <Segmented
          label="Peso dos títulos"
          value={theme.typography.headingWeight}
          onChange={(v) => update((d) => void (d.typography.headingWeight = v))}
          options={[
            { value: 500, label: "Leve" },
            { value: 600, label: "Médio" },
            { value: 700, label: "Forte" },
          ]}
        />
        <SliderField
          label="Espaço entre letras dos títulos"
          value={theme.typography.headingTracking}
          min={-0.06}
          max={0.1}
          step={0.005}
          format={(v) => `${(v * 100).toFixed(1)}%`}
          onChange={(v) => update((d) => void (d.typography.headingTracking = Math.round(v * 1000) / 1000))}
          hint="Negativo deixa os títulos mais “premium” (estilo Apple)."
        />
      </Group>

      <Group title="Forma e estilo">
        <SliderField label="Arredondamento" value={theme.shape.radius} min={0} max={32} unit="px" onChange={(v) => update((d) => void (d.shape.radius = v))} />
        <Segmented
          label="Sombras"
          value={theme.shape.shadow}
          onChange={(v) => update((d) => void (d.shape.shadow = v))}
          options={[
            { value: "nenhuma", label: "Nenhuma" },
            { value: "suave", label: "Suave" },
            { value: "media", label: "Média" },
            { value: "forte", label: "Forte" },
          ]}
        />
        <Segmented
          label="Espaçamento entre seções"
          value={theme.shape.density}
          onChange={(v) => update((d) => void (d.shape.density = v))}
          options={[
            { value: "compacta", label: "Compacto" },
            { value: "padrao", label: "Padrão" },
            { value: "espacosa", label: "Espaçoso" },
          ]}
        />
      </Group>

      <Group title="Botões">
        <Segmented
          label="Formato"
          value={theme.buttons.shape}
          onChange={(v) => update((d) => void (d.buttons.shape = v))}
          options={[
            { value: "pilula", label: "Pílula" },
            { value: "arredondado", label: "Arredondado" },
            { value: "reto", label: "Reto" },
          ]}
        />
        <Segmented
          label="Estilo"
          value={theme.buttons.style}
          onChange={(v) => update((d) => void (d.buttons.style = v))}
          options={[
            { value: "preenchido", label: "Preenchido" },
            { value: "contorno", label: "Contorno" },
            { value: "ghost", label: "Suave" },
          ]}
        />
        <SwitchField label="Texto em MAIÚSCULAS" checked={theme.buttons.uppercase} onChange={(v) => update((d) => void (d.buttons.uppercase = v))} />
      </Group>
    </div>
  );
}
