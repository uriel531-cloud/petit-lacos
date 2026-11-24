"use client";

import { Info } from "lucide-react";

import { useEditor } from "./editor-context";
import { ColorField, Group, Segmented, SliderField, SwitchField } from "./fields";

export function TabAnimacoes() {
  const { theme, update } = useEditor();
  const m = theme.motion;
  const off = m.level === "nenhum";

  return (
    <div className="space-y-4">
      <Group title="Nível de animação">
        <Segmented
          label="Intensidade geral"
          value={m.level}
          onChange={(v) => update((d) => void (d.motion.level = v))}
          options={[
            { value: "nenhum", label: "Nenhuma" },
            { value: "suave", label: "Suave" },
            { value: "expressivo", label: "Expressiva" },
          ]}
        />
        <p className="flex gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          <Info className="size-4 shrink-0" />
          Quem ativou “reduzir movimento” no celular ou computador não vê animações, independente desta escolha.
        </p>
      </Group>

      <fieldset disabled={off} className={off ? "pointer-events-none space-y-4 opacity-50" : "space-y-4"}>
        <Group title="Entrada ao rolar a página">
          <Segmented
            label="Como os blocos aparecem"
            value={m.reveal}
            onChange={(v) => update((d) => void (d.motion.reveal = v))}
            options={[
              { value: "fade-up", label: "Subir suave" },
              { value: "slide", label: "Deslizar" },
              { value: "zoom", label: "Zoom" },
              { value: "blur", label: "Desfoque" },
              { value: "nenhum", label: "Nenhum" },
            ]}
          />
          <SliderField label="Intervalo entre cards (um depois do outro)" value={m.stagger} min={0} max={300} step={10} unit="ms" onChange={(v) => update((d) => void (d.motion.stagger = v))} />
        </Group>

        <Group title="Cards de produto">
          <Segmented
            label="Ao passar o mouse"
            value={m.cardHover}
            onChange={(v) => update((d) => void (d.motion.cardHover = v))}
            options={[
              { value: "zoom", label: "Zoom na foto" },
              { value: "elevar", label: "Elevar" },
              { value: "trocar-foto", label: "Trocar foto" },
              { value: "inclinar", label: "Inclinação 3D" },
              { value: "nenhum", label: "Nada" },
            ]}
          />
        </Group>

        <Group title="Adicionar à sacola">
          <Segmented
            label="Efeito"
            value={m.addToCart}
            onChange={(v) => update((d) => void (d.motion.addToCart = v))}
            options={[
              { value: "voar", label: "Laço voa até a sacola" },
              { value: "pulso", label: "Sacola pula" },
              { value: "nenhum", label: "Nenhum" },
            ]}
          />
          <SwitchField label="Confete de lacinhos" checked={m.confetti} onChange={(v) => update((d) => void (d.motion.confetti = v))} />
        </Group>

        <Group title="Página e rolagem">
          <Segmented
            label="Transição entre páginas"
            value={m.pageTransition}
            onChange={(v) => update((d) => void (d.motion.pageTransition = v))}
            options={[
              { value: "nenhuma", label: "Nenhuma" },
              { value: "fade", label: "Esmaecer" },
              { value: "deslizar", label: "Deslizar" },
            ]}
          />
          <SliderField label="Parallax no hero" value={m.parallax} min={0} max={100} unit="%" onChange={(v) => update((d) => void (d.motion.parallax = v))} />
        </Group>

        <Group title="Decoração sazonal" description="Enfeites por cima da loja — ideal para o Natal. Desligue quando a data passar (ou use o tema Natal agendado).">
          <Segmented
            label="Efeito na página"
            value={theme.decor.effect}
            onChange={(v) => update((d) => void (d.decor.effect = v))}
            options={[
              { value: "nenhum", label: "Nenhum" },
              { value: "neve", label: "Neve caindo" },
              { value: "estrelas", label: "Estrelinhas piscando" },
            ]}
          />
          {theme.decor.effect !== "nenhum" ? (
            <Segmented
              label="Quantidade"
              value={theme.decor.intensity}
              onChange={(v) => update((d) => void (d.decor.intensity = v))}
              options={[
                { value: "pouca", label: "Pouca" },
                { value: "media", label: "Média" },
                { value: "muita", label: "Muita" },
              ]}
            />
          ) : null}
          <Segmented
            label="Enfeite no cabeçalho"
            value={theme.decor.garland}
            onChange={(v) => update((d) => void (d.decor.garland = v))}
            options={[
              { value: "nenhum", label: "Nenhum" },
              { value: "luzinhas", label: "Luzinhas de Natal" },
              { value: "bandeirinhas", label: "Bandeirinhas" },
            ]}
          />
          {theme.decor.effect !== "nenhum" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <ColorField label="Cor principal dos enfeites" value={theme.decor.colorA} onChange={(v) => update((d) => void (d.decor.colorA = v))} />
              <ColorField label="Cor de brilho" value={theme.decor.colorB} onChange={(v) => update((d) => void (d.decor.colorB = v))} />
            </div>
          ) : null}
        </Group>

        <Group title="Ritmo">
          <Segmented
            label="Velocidade"
            value={m.speed}
            onChange={(v) => update((d) => void (d.motion.speed = v))}
            options={[
              { value: "rapida", label: "Rápida" },
              { value: "padrao", label: "Padrão" },
              { value: "lenta", label: "Lenta" },
            ]}
          />
          <Segmented
            label="Curva"
            value={m.easing}
            onChange={(v) => update((d) => void (d.motion.easing = v))}
            options={[
              { value: "suave", label: "Suave" },
              { value: "mola", label: "Com mola" },
            ]}
          />
        </Group>
      </fieldset>
    </div>
  );
}
