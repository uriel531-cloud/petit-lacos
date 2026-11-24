"use client";

import { PRODUCT_PAGE_BLOCKS, type Theme } from "@/features/theme/schema";

import { useEditor } from "./editor-context";
import { Group, Segmented, SliderField, SortableList, SwitchField } from "./fields";

const CARD_STYLES: { value: Theme["productCard"]["style"]; label: string; desc: string }[] = [
  { value: "classico", label: "Clássico", desc: "Foto, nome, preço e botão" },
  { value: "minimal", label: "Minimal", desc: "Sem botão; “+” aparece no hover" },
  { value: "bento", label: "Bento", desc: "Cards de tamanhos variados" },
  { value: "editorial", label: "Editorial", desc: "Foto grande com texto por cima" },
  { value: "lista", label: "Lista", desc: "Foto à esquerda, informações à direita" },
];

function CardStyleIcon({ style }: { style: Theme["productCard"]["style"] }) {
  const box = "rounded-[3px] bg-current";
  switch (style) {
    case "classico":
      return (
        <span className="grid w-10 gap-0.5 opacity-70">
          <span className={`h-7 ${box}`} />
          <span className={`h-1 w-3/4 ${box}`} />
          <span className={`h-1.5 ${box} opacity-60`} />
        </span>
      );
    case "minimal":
      return (
        <span className="grid w-10 justify-items-center gap-0.5 opacity-70">
          <span className={`h-8 w-full ${box}`} />
          <span className={`h-1 w-1/2 ${box}`} />
        </span>
      );
    case "bento":
      return (
        <span className="grid w-10 grid-cols-2 gap-0.5 opacity-70">
          <span className={`col-span-2 h-5 ${box}`} />
          <span className={`h-3 ${box}`} />
          <span className={`h-3 ${box}`} />
        </span>
      );
    case "editorial":
      return <span className={`relative block h-10 w-8 opacity-70 ${box}`} />;
    case "lista":
      return (
        <span className="grid w-10 gap-1 opacity-70">
          {[0, 1].map((i) => (
            <span key={i} className="flex gap-0.5">
              <span className={`size-4 ${box}`} />
              <span className={`h-1.5 flex-1 ${box}`} />
            </span>
          ))}
        </span>
      );
  }
}

const BLOCK_LABEL: Record<(typeof PRODUCT_PAGE_BLOCKS)[number], string> = {
  descricao: "Descrição",
  medidas: "Medidas",
  materiais: "Materiais",
  cuidados: "Cuidados",
  avaliacoes: "Avaliações",
};

export function TabProdutos() {
  const { theme, update } = useEditor();
  const pc = theme.productCard;
  const pp = theme.productPage;
  const c = theme.productCarousel;

  const SHOW: { key: keyof Theme["productCard"]["show"]; label: string }[] = [
    { key: "buyButton", label: "Botão comprar" },
    { key: "secondImage", label: "2ª foto ao passar o mouse" },
    { key: "badges", label: "Selos (Novo, -%, Últimas unidades)" },
    { key: "installments", label: "Parcelamento" },
    { key: "pixPrice", label: "Preço no Pix" },
    { key: "rating", label: "Estrelas de avaliação" },
    { key: "wishlist", label: "Botão favoritar (coração)" },
    { key: "quickView", label: "Compra rápida (espiar)" },
    { key: "category", label: "Nome da categoria" },
  ];

  return (
    <div className="space-y-4">
      <Group title="Estilo do card de produto">
        <div role="radiogroup" aria-label="Estilo do card" className="grid gap-2 sm:grid-cols-2">
          {CARD_STYLES.map((s) => (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={pc.style === s.value}
              onClick={() => update((d) => void (d.productCard.style = s.value))}
              className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition ${pc.style === s.value ? "border-primary bg-primary/5 text-primary" : "hover:border-primary/40"}`}
            >
              <CardStyleIcon style={s.value} />
              <span>
                <span className="block text-sm font-semibold text-foreground">{s.label}</span>
                <span className="block text-xs text-muted-foreground">{s.desc}</span>
              </span>
            </button>
          ))}
        </div>
        <Segmented
          label="Formato da foto"
          value={pc.aspect}
          onChange={(v) => update((d) => void (d.productCard.aspect = v))}
          options={[
            { value: "1:1", label: "Quadrada 1:1" },
            { value: "4:5", label: "Retrato 4:5" },
            { value: "3:4", label: "Alta 3:4" },
          ]}
        />
        <Segmented
          label="Fundo da foto"
          value={pc.imageBg}
          onChange={(v) => update((d) => void (d.productCard.imageBg = v))}
          options={[
            { value: "transparente", label: "Transparente" },
            { value: "cinza", label: "Cinza-claro" },
            { value: "tema", label: "Cor da marca" },
          ]}
        />
      </Group>

      <Group title="Colunas e espaçamento">
        <SliderField label="Colunas no celular" value={pc.columnsMobile} min={1} max={2} onChange={(v) => update((d) => void (d.productCard.columnsMobile = v))} />
        <SliderField label="Colunas no tablet" value={pc.columnsTablet} min={2} max={3} onChange={(v) => update((d) => void (d.productCard.columnsTablet = v))} />
        <SliderField label="Colunas no computador" value={pc.columnsDesktop} min={3} max={5} onChange={(v) => update((d) => void (d.productCard.columnsDesktop = v))} />
        <Segmented
          label="Espaço entre os cards"
          value={pc.gap}
          onChange={(v) => update((d) => void (d.productCard.gap = v))}
          options={[
            { value: "compacto", label: "Compacto" },
            { value: "padrao", label: "Padrão" },
            { value: "amplo", label: "Amplo" },
          ]}
        />
        <Segmented
          label="Alinhamento do texto"
          value={pc.textAlign}
          onChange={(v) => update((d) => void (d.productCard.textAlign = v))}
          options={[
            { value: "esquerda", label: "Esquerda" },
            { value: "centro", label: "Centro" },
          ]}
        />
        <Segmented
          label="Posição dos selos"
          value={pc.badgePosition}
          onChange={(v) => update((d) => void (d.productCard.badgePosition = v))}
          options={[
            { value: "esquerda", label: "Esquerda" },
            { value: "direita", label: "Direita" },
          ]}
        />
      </Group>

      <Group title="O que aparece no card">
        {SHOW.map((s) => (
          <SwitchField key={s.key} label={s.label} checked={pc.show[s.key]} onChange={(v) => update((d) => void (d.productCard.show[s.key] = v))} />
        ))}
      </Group>

      <Group title="Página do produto">
        <Segmented
          label="Galeria de fotos"
          value={pp.gallery}
          onChange={(v) => update((d) => void (d.productPage.gallery = v))}
          options={[
            { value: "miniaturas-embaixo", label: "Miniaturas embaixo" },
            { value: "miniaturas-lateral", label: "Miniaturas ao lado" },
            { value: "grade", label: "Grade de fotos" },
            { value: "carrossel", label: "Carrossel" },
            { value: "landing", label: "Landing (estilo Apple)" },
          ]}
        />
        <SwitchField label="Barra de compra fixa ao rolar" checked={pp.stickyBuy} onChange={(v) => update((d) => void (d.productPage.stickyBuy = v))} />
        <div>
          <p className="mb-2 text-sm font-semibold">Ordem dos blocos (arraste)</p>
          <SortableList
            items={pp.blocks.map((b) => ({ id: b }))}
            onChange={(items) => update((d) => void (d.productPage.blocks = items.map((i) => i.id as (typeof PRODUCT_PAGE_BLOCKS)[number])))}
            render={(item) => <span className="text-sm font-medium">{BLOCK_LABEL[item.id as keyof typeof BLOCK_LABEL]}</span>}
          />
        </div>
      </Group>

      <Group title="Carrossel de produtos" description="Usado nas seções da Home em modo carrossel e em “Você também vai amar”.">
        <SwitchField label="Passar sozinho (autoplay)" checked={c.autoplay} onChange={(v) => update((d) => void (d.productCarousel.autoplay = v))} />
        {c.autoplay ? (
          <SliderField label="Tempo por item" value={c.intervalSeconds} min={2} max={20} unit="s" onChange={(v) => update((d) => void (d.productCarousel.intervalSeconds = v))} />
        ) : null}
        <SliderField label="Itens visíveis no celular" value={c.itemsMobile} min={1} max={3} step={0.1} onChange={(v) => update((d) => void (d.productCarousel.itemsMobile = Math.round(v * 10) / 10))} />
        <SliderField label="Itens visíveis no tablet" value={c.itemsTablet} min={2} max={4} step={0.1} onChange={(v) => update((d) => void (d.productCarousel.itemsTablet = Math.round(v * 10) / 10))} />
        <SliderField label="Itens visíveis no computador" value={c.itemsDesktop} min={3} max={6} step={0.1} onChange={(v) => update((d) => void (d.productCarousel.itemsDesktop = Math.round(v * 10) / 10))} />
        <SwitchField label="Efeito “peek”" hint="Mostra um pedaço do próximo card (use valores quebrados, ex.: 1,6)." checked={c.peek} onChange={(v) => update((d) => void (d.productCarousel.peek = v))} />
        <SwitchField label="Arrastar livre" hint="O carrossel desliza solto, sem parar card a card." checked={c.dragFree} onChange={(v) => update((d) => void (d.productCarousel.dragFree = v))} />
      </Group>
    </div>
  );
}
