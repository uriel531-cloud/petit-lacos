"use client";

import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Switch } from "@/components/ui/switch";
import { createHeroSlide, newId } from "@/features/theme/defaults";
import type { HeroSlide } from "@/features/theme/schema";

import { useEditor } from "./editor-context";
import { ColorField, DateTimeField, Group, ImageField, Segmented, SliderField, SortableList, StringListField, SwitchField, TextAreaField, TextField } from "./fields";

export function TabHero() {
  const { theme, update, images } = useEditor();
  const slides = theme.hero.slides;
  const [selectedId, setSelectedId] = useState(slides[0]?.id ?? "");
  const index = Math.max(0, slides.findIndex((s) => s.id === selectedId));
  const slide = slides[index];
  const h = theme.hero;

  function set(recipe: (s: HeroSlide) => void) {
    update((d) => {
      const target = d.hero.slides[index];
      if (target) recipe(target);
    });
  }

  return (
    <div className="space-y-4">
      <Group title="Slides" description="Arraste para mudar a ordem. Clique no lápis para editar.">
        <SortableList
          items={slides}
          onChange={(items) => update((d) => void (d.hero.slides = items))}
          render={(s, i) => (
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setSelectedId(s.id)} className={`min-w-0 flex-1 truncate text-left text-sm ${s.id === slide?.id ? "font-bold text-primary" : "font-medium"}`}>
                {i + 1}. {s.eyebrow || s.title.replace("{palavras}", "…") || "Slide sem título"}
              </button>
              <Switch
                checked={s.active}
                onCheckedChange={(v) => update((d) => void (d.hero.slides[i]!.active = v))}
                aria-label={s.active ? "Desativar slide" : "Ativar slide"}
              />
              <button type="button" onClick={() => setSelectedId(s.id)} className="grid size-8 place-items-center rounded-md hover:bg-muted" aria-label="Editar slide">
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const copy = { ...structuredClone(s), id: newId("slide") };
                  update((d) => void d.hero.slides.splice(i + 1, 0, copy));
                  setSelectedId(copy.id);
                }}
                disabled={slides.length >= 8}
                className="grid size-8 place-items-center rounded-md hover:bg-muted disabled:opacity-30"
                aria-label="Duplicar slide"
              >
                <Copy className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => update((d) => void d.hero.slides.splice(i, 1))}
                disabled={slides.length <= 1}
                className="grid size-8 place-items-center rounded-md hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                aria-label="Excluir slide"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          )}
        />
        {slides.length < 8 ? (
          <button
            type="button"
            onClick={() => {
              const s = createHeroSlide();
              update((d) => void d.hero.slides.push(s));
              setSelectedId(s.id);
            }}
            className="inline-flex w-fit items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-primary hover:bg-primary/10"
          >
            <Plus className="size-4" /> Adicionar slide
          </button>
        ) : null}
      </Group>

      {slide ? (
        <>
          <Group title={`Textos — slide ${index + 1}`}>
            <TextField label="Texto pequeno acima do título" value={slide.eyebrow} onChange={(v) => set((s) => void (s.eyebrow = v))} />
            <TextAreaField
              label="Título"
              value={slide.title}
              maxLength={200}
              onChange={(v) => set((s) => void (s.title = v))}
              hint="Escreva {palavras} onde as palavras rotativas devem aparecer."
            />
            <TextField label="Palavra/trecho em destaque" value={slide.highlight} onChange={(v) => set((s) => void (s.highlight = v))} hint="Precisa estar escrito igual no título." />
            <Segmented
              label="Estilo do destaque"
              value={slide.highlightStyle}
              onChange={(v) => set((s) => void (s.highlightStyle = v))}
              options={[
                { value: "cor", label: "Outra cor" },
                { value: "script", label: "Letra de assinatura" },
                { value: "sublinhado", label: "Sublinhado à mão" },
              ]}
            />
            <TextAreaField label="Subtítulo" value={slide.subtitle} maxLength={400} onChange={(v) => set((s) => void (s.subtitle = v))} />
            <Segmented
              label="Efeito do texto"
              value={slide.textEffect}
              onChange={(v) => set((s) => void (s.textEffect = v))}
              options={[
                { value: "nenhum", label: "Nenhum" },
                { value: "fade", label: "Surgir" },
                { value: "letra", label: "Palavra a palavra" },
                { value: "maquina", label: "Máquina de escrever" },
                { value: "rotativas", label: "Palavras rotativas" },
              ]}
            />
            {slide.textEffect === "rotativas" || slide.title.includes("{palavras}") ? (
              <StringListField label="Palavras rotativas" values={slide.rotatingWords} onChange={(v) => set((s) => void (s.rotatingWords = v))} placeholder="Ex.: o batizado" />
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Botão principal — texto" value={slide.primaryCta.label} onChange={(v) => set((s) => void (s.primaryCta.label = v))} />
              <TextField label="Botão principal — link" value={slide.primaryCta.href} onChange={(v) => set((s) => void (s.primaryCta.href = v))} />
            </div>
            <SwitchField label="Botão secundário" checked={slide.secondaryCta.enabled} onChange={(v) => set((s) => void (s.secondaryCta.enabled = v))} />
            {slide.secondaryCta.enabled ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Botão secundário — texto" value={slide.secondaryCta.label} onChange={(v) => set((s) => void (s.secondaryCta.label = v))} />
                <TextField label="Botão secundário — link" value={slide.secondaryCta.href} onChange={(v) => set((s) => void (s.secondaryCta.href = v))} />
              </div>
            ) : null}
          </Group>

          <Group title="Estilo da escrita">
            <Segmented
              label="Fonte do título"
              value={slide.font}
              onChange={(v) => set((s) => void (s.font = v))}
              options={[
                { value: "titulo", label: "Títulos" },
                { value: "texto", label: "Textos" },
                { value: "script", label: "Assinatura" },
              ]}
            />
            <SliderField label="Tamanho no celular" value={slide.sizeMobile} min={24} max={72} unit="px" onChange={(v) => set((s) => void (s.sizeMobile = v))} />
            <SliderField label="Tamanho no computador" value={slide.sizeDesktop} min={32} max={120} unit="px" onChange={(v) => set((s) => void (s.sizeDesktop = v))} />
            <Segmented
              label="Peso"
              value={slide.weight}
              onChange={(v) => set((s) => void (s.weight = v))}
              options={[
                { value: 400, label: "Normal" },
                { value: 500, label: "Médio" },
                { value: 600, label: "Semi" },
                { value: 700, label: "Forte" },
              ]}
            />
            <ColorField label="Cor do texto" value={slide.textColor} onChange={(v) => set((s) => void (s.textColor = v))} />
            <SliderField
              label="Espaço entre letras"
              value={slide.letterSpacing}
              min={-0.06}
              max={0.2}
              step={0.005}
              format={(v) => `${(v * 100).toFixed(1)}%`}
              onChange={(v) => set((s) => void (s.letterSpacing = Math.round(v * 1000) / 1000))}
            />
            <SwitchField label="MAIÚSCULAS" checked={slide.uppercase} onChange={(v) => set((s) => void (s.uppercase = v))} />
            <Segmented
              label="Alinhamento"
              value={slide.align}
              onChange={(v) => set((s) => void (s.align = v))}
              options={[
                { value: "esquerda", label: "Esquerda" },
                { value: "centro", label: "Centro" },
                { value: "direita", label: "Direita" },
              ]}
            />
            <Segmented
              label="Posição vertical"
              value={slide.vertical}
              onChange={(v) => set((s) => void (s.vertical = v))}
              options={[
                { value: "topo", label: "Topo" },
                { value: "meio", label: "Meio" },
                { value: "base", label: "Base" },
              ]}
            />
            <Segmented
              label="Altura"
              value={slide.height}
              onChange={(v) => set((s) => void (s.height = v))}
              options={[
                { value: "compacta", label: "Compacta" },
                { value: "media", label: "Média" },
                { value: "cheia", label: "Tela cheia" },
              ]}
            />
          </Group>

          <Group title="Fundo e imagem">
            <Segmented
              label="Tipo de fundo"
              value={slide.background.type}
              onChange={(v) => set((s) => void (s.background.type = v))}
              options={[
                { value: "cor", label: "Cor" },
                { value: "gradiente", label: "Gradiente" },
                { value: "imagem", label: "Imagem" },
                { value: "video", label: "Vídeo" },
              ]}
            />
            {slide.background.type === "cor" ? <ColorField label="Cor de fundo" value={slide.background.color} onChange={(v) => set((s) => void (s.background.color = v))} /> : null}
            {slide.background.type === "gradiente" ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ColorField label="De" value={slide.background.gradientFrom} onChange={(v) => set((s) => void (s.background.gradientFrom = v))} />
                  <ColorField label="Para" value={slide.background.gradientTo} onChange={(v) => set((s) => void (s.background.gradientTo = v))} />
                </div>
                <SliderField label="Direção" value={slide.background.gradientAngle} min={0} max={360} unit="°" onChange={(v) => set((s) => void (s.background.gradientAngle = v))} />
              </>
            ) : null}
            {slide.background.type === "imagem" || slide.background.type === "video" ? (
              <>
                <ImageField
                  label={slide.background.type === "video" ? "Imagem de capa do vídeo" : "Imagem (computador)"}
                  value={slide.background.image}
                  onChange={(v) => set((s) => void (s.background.image = v))}
                  suggestions={images}
                />
                {slide.background.type === "imagem" ? (
                  <ImageField label="Imagem (celular) — opcional" value={slide.background.imageMobile} onChange={(v) => set((s) => void (s.background.imageMobile = v))} suggestions={images} />
                ) : (
                  <TextField label="Endereço do vídeo (.mp4)" value={slide.background.video} onChange={(v) => set((s) => void (s.background.video = v))} placeholder="https://…/video.mp4" hint="Vídeo curto, sem som, em loop." />
                )}
                <SliderField label="Ponto de foco — horizontal" value={slide.background.focusX} min={0} max={100} unit="%" onChange={(v) => set((s) => void (s.background.focusX = v))} />
                <SliderField label="Ponto de foco — vertical" value={slide.background.focusY} min={0} max={100} unit="%" onChange={(v) => set((s) => void (s.background.focusY = v))} />
              </>
            ) : null}
            <Segmented
              label="Camada sobre o fundo"
              value={slide.overlay.tone}
              onChange={(v) => set((s) => void (s.overlay.tone = v))}
              options={[
                { value: "escuro", label: "Escurecer" },
                { value: "claro", label: "Clarear" },
              ]}
            />
            <SliderField label="Intensidade da camada" value={slide.overlay.opacity} min={0} max={90} unit="%" onChange={(v) => set((s) => void (s.overlay.opacity = v))} />
            <ImageField
              label="Imagem de destaque ao lado do texto"
              value={slide.sideImage}
              onChange={(v) => set((s) => void (s.sideImage = v))}
              suggestions={images}
              hint="Ex.: o laço da marca ou a foto de um produto."
            />
          </Group>

          <Group title="Agendamento do slide" description="Deixe vazio para mostrar sempre.">
            <div className="grid gap-3 sm:grid-cols-2">
              <DateTimeField label="Entra no ar em" value={slide.startsAt} onChange={(v) => set((s) => void (s.startsAt = v))} />
              <DateTimeField label="Sai do ar em" value={slide.endsAt} onChange={(v) => set((s) => void (s.endsAt = v))} />
            </div>
          </Group>
        </>
      ) : null}

      <Group title="Carrossel do hero">
        <SwitchField label="Passar sozinho (autoplay)" checked={h.autoplay} onChange={(v) => update((d) => void (d.hero.autoplay = v))} />
        {h.autoplay ? <SliderField label="Tempo por slide" value={h.intervalSeconds} min={2} max={20} unit="s" onChange={(v) => update((d) => void (d.hero.intervalSeconds = v))} /> : null}
        <Segmented
          label="Transição"
          value={h.transition}
          onChange={(v) => update((d) => void (d.hero.transition = v))}
          options={[
            { value: "deslizar", label: "Deslizar" },
            { value: "fade", label: "Esmaecer" },
            { value: "zoom", label: "Zoom suave (Ken Burns)" },
            { value: "parallax", label: "Parallax" },
          ]}
        />
        <SwitchField label="Setas" checked={h.arrows} onChange={(v) => update((d) => void (d.hero.arrows = v))} />
        <SwitchField label="Bolinhas" checked={h.dots} onChange={(v) => update((d) => void (d.hero.dots = v))} />
        <SwitchField label="Barra de progresso" checked={h.progress} onChange={(v) => update((d) => void (d.hero.progress = v))} />
        <SwitchField label="Miniaturas" checked={h.thumbs} onChange={(v) => update((d) => void (d.hero.thumbs = v))} />
        <SwitchField label="Repetir do início (loop)" checked={h.loop} onChange={(v) => update((d) => void (d.hero.loop = v))} />
        <SwitchField label="Pausar com o mouse em cima" checked={h.pauseOnHover} onChange={(v) => update((d) => void (d.hero.pauseOnHover = v))} />
      </Group>
    </div>
  );
}
