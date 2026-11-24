"use client";

import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Switch } from "@/components/ui/switch";
import { createSection, newId } from "@/features/theme/defaults";
import type { HomeSection, HomeSectionType } from "@/features/theme/schema";

import { useEditor } from "./editor-context";
import { DateTimeField, Group, ImageField, Segmented, SelectField, SliderField, SortableList, SwitchField, TextAreaField, TextField } from "./fields";

export const SECTION_LABELS: Record<HomeSectionType, string> = {
  hero: "Hero / carrossel",
  marquee: "Faixa de texto rolando",
  beneficios: "Benefícios",
  produtos: "Produtos",
  categorias: "Categorias",
  bento: "Grade bento",
  "banner-duplo": "Banner duplo",
  "texto-imagem": "Texto + imagem",
  video: "Vídeo",
  depoimentos: "Depoimentos",
  instagram: "Instagram",
  contador: "Contador de promoção",
  newsletter: "Newsletter",
};

type Of<T extends HomeSectionType> = Extract<HomeSection, { type: T }>;

function ItemActions({ onRemove, label }: { onRemove: () => void; label: string }) {
  return (
    <button type="button" onClick={onRemove} className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Remover ${label}`}>
      <Trash2 className="size-3.5" /> Remover
    </button>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex w-fit items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-primary hover:bg-primary/10">
      <Plus className="size-4" /> {label}
    </button>
  );
}

function SectionFields({ section, set }: { section: HomeSection; set: (recipe: (s: HomeSection) => void) => void }) {
  const { categories, collections, images } = useEditor();
  // Helper tipado por tipo de seção
  const edit = <T extends HomeSectionType>(recipe: (s: Of<T>) => void) => set((s) => recipe(s as Of<T>));

  switch (section.type) {
    case "hero":
      return <p className="text-sm text-muted-foreground">Os slides e o carrossel são editados na aba “Hero”.</p>;

    case "marquee":
      return (
        <>
          <TextField label="Texto" value={section.text} onChange={(v) => edit<"marquee">((s) => void (s.text = v))} />
          <SliderField label="Velocidade (segundos por volta)" value={section.speedSeconds} min={5} max={60} unit="s" onChange={(v) => edit<"marquee">((s) => void (s.speedSeconds = v))} />
        </>
      );

    case "beneficios":
      return (
        <>
          {section.items.map((item, i) => (
            <div key={item.id} className="space-y-2 rounded-xl bg-muted/50 p-3">
              <div className="flex items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase">Item {i + 1}</span>
                <ItemActions label={item.title} onRemove={() => edit<"beneficios">((s) => void s.items.splice(i, 1))} />
              </div>
              <SelectField
                label="Ícone"
                value={item.icon}
                onChange={(v) => edit<"beneficios">((s) => void (s.items[i]!.icon = v))}
                options={[
                  { value: "mao", label: "Mão (feito à mão)" },
                  { value: "pix", label: "Pix" },
                  { value: "seguro", label: "Escudo (segurança)" },
                  { value: "whatsapp", label: "WhatsApp" },
                  { value: "caminhao", label: "Caminhão (envio)" },
                  { value: "presente", label: "Presente" },
                  { value: "coracao", label: "Coração" },
                ]}
              />
              <TextField label="Título" value={item.title} onChange={(v) => edit<"beneficios">((s) => void (s.items[i]!.title = v))} />
              <TextField label="Texto" value={item.text} onChange={(v) => edit<"beneficios">((s) => void (s.items[i]!.text = v))} />
            </div>
          ))}
          {section.items.length < 6 ? (
            <AddButton label="Adicionar benefício" onClick={() => edit<"beneficios">((s) => void s.items.push({ id: newId("b"), icon: "coracao", title: "Novo benefício", text: "" }))} />
          ) : null}
        </>
      );

    case "produtos":
      return (
        <>
          <TextField label="Título" value={section.title} onChange={(v) => edit<"produtos">((s) => void (s.title = v))} />
          <TextField label="Subtítulo" value={section.subtitle} onChange={(v) => edit<"produtos">((s) => void (s.subtitle = v))} />
          <SelectField
            label="Quais produtos"
            value={section.source}
            onChange={(v) => edit<"produtos">((s) => void (s.source = v))}
            options={[
              { value: "novidades", label: "Novidades" },
              { value: "destaques", label: "Destaques" },
              { value: "mais-vendidos", label: "Mais vendidos" },
              { value: "promocoes", label: "Promoções" },
              { value: "colecao", label: "Uma coleção" },
              { value: "categoria", label: "Uma categoria" },
            ]}
          />
          {section.source === "colecao" || section.source === "categoria" ? (
            <SelectField
              label={section.source === "colecao" ? "Coleção" : "Categoria"}
              value={section.sourceSlug || "_"}
              onChange={(v) => edit<"produtos">((s) => void (s.sourceSlug = v === "_" ? "" : v))}
              options={[
                { value: "_", label: "Escolha…" },
                ...(section.source === "colecao" ? collections : categories).map((c) => ({ value: c.slug, label: c.name })),
              ]}
            />
          ) : null}
          <Segmented
            label="Exibição"
            value={section.layout}
            onChange={(v) => edit<"produtos">((s) => void (s.layout = v))}
            options={[
              { value: "grade", label: "Grade" },
              { value: "carrossel", label: "Carrossel" },
            ]}
          />
          <SliderField label="Quantidade" value={section.limit} min={2} max={24} onChange={(v) => edit<"produtos">((s) => void (s.limit = v))} />
          <SwitchField label="Link “Ver todos”" checked={section.showViewAll} onChange={(v) => edit<"produtos">((s) => void (s.showViewAll = v))} />
        </>
      );

    case "categorias":
      return (
        <>
          <TextField label="Título" value={section.title} onChange={(v) => edit<"categorias">((s) => void (s.title = v))} />
          <Segmented
            label="Formato"
            value={section.shape}
            onChange={(v) => edit<"categorias">((s) => void (s.shape = v))}
            options={[
              { value: "circulo", label: "Círculos" },
              { value: "cartao", label: "Cartões" },
            ]}
          />
        </>
      );

    case "bento":
      return (
        <>
          <TextField label="Título" value={section.title} onChange={(v) => edit<"bento">((s) => void (s.title = v))} />
          {section.tiles.map((t, i) => (
            <div key={t.id} className="space-y-2 rounded-xl bg-muted/50 p-3">
              <div className="flex items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase">Bloco {i + 1}</span>
                <ItemActions label={t.title} onRemove={() => edit<"bento">((s) => void s.tiles.splice(i, 1))} />
              </div>
              <TextField label="Título" value={t.title} onChange={(v) => edit<"bento">((s) => void (s.tiles[i]!.title = v))} />
              <TextField label="Texto" value={t.text} onChange={(v) => edit<"bento">((s) => void (s.tiles[i]!.text = v))} />
              <TextField label="Link" value={t.href} onChange={(v) => edit<"bento">((s) => void (s.tiles[i]!.href = v))} />
              <ImageField label="Imagem" value={t.image} onChange={(v) => edit<"bento">((s) => void (s.tiles[i]!.image = v))} suggestions={images} />
              <Segmented
                label="Tamanho"
                value={t.size}
                onChange={(v) => edit<"bento">((s) => void (s.tiles[i]!.size = v))}
                options={[
                  { value: "grande", label: "Grande" },
                  { value: "largo", label: "Largo" },
                  { value: "alto", label: "Alto" },
                  { value: "pequeno", label: "Pequeno" },
                ]}
              />
            </div>
          ))}
          {section.tiles.length < 6 ? (
            <AddButton label="Adicionar bloco" onClick={() => edit<"bento">((s) => void s.tiles.push({ id: newId("t"), title: "Novo bloco", text: "", image: "", href: "/produtos", size: "pequeno" }))} />
          ) : null}
        </>
      );

    case "banner-duplo":
      return (
        <>
          {section.banners.map((b, i) => (
            <div key={b.id} className="space-y-2 rounded-xl bg-muted/50 p-3">
              <span className="text-xs font-bold text-muted-foreground uppercase">Banner {i + 1}</span>
              <TextField label="Título" value={b.title} onChange={(v) => edit<"banner-duplo">((s) => void (s.banners[i]!.title = v))} />
              <TextField label="Texto" value={b.text} onChange={(v) => edit<"banner-duplo">((s) => void (s.banners[i]!.text = v))} />
              <TextField label="Texto do link" value={b.cta} onChange={(v) => edit<"banner-duplo">((s) => void (s.banners[i]!.cta = v))} />
              <TextField label="Link" value={b.href} onChange={(v) => edit<"banner-duplo">((s) => void (s.banners[i]!.href = v))} />
              <ImageField label="Imagem" value={b.image} onChange={(v) => edit<"banner-duplo">((s) => void (s.banners[i]!.image = v))} suggestions={images} />
            </div>
          ))}
        </>
      );

    case "texto-imagem":
      return (
        <>
          <TextField label="Texto pequeno" value={section.eyebrow} onChange={(v) => edit<"texto-imagem">((s) => void (s.eyebrow = v))} />
          <TextField label="Título" value={section.title} onChange={(v) => edit<"texto-imagem">((s) => void (s.title = v))} />
          <TextAreaField label="Texto" value={section.text} onChange={(v) => edit<"texto-imagem">((s) => void (s.text = v))} />
          <ImageField label="Imagem" value={section.image} onChange={(v) => edit<"texto-imagem">((s) => void (s.image = v))} suggestions={images} />
          <Segmented
            label="Lado da imagem"
            value={section.imageSide}
            onChange={(v) => edit<"texto-imagem">((s) => void (s.imageSide = v))}
            options={[
              { value: "esquerda", label: "Esquerda" },
              { value: "direita", label: "Direita" },
            ]}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Botão — texto" value={section.cta.label} onChange={(v) => edit<"texto-imagem">((s) => void (s.cta.label = v))} />
            <TextField label="Botão — link" value={section.cta.href} onChange={(v) => edit<"texto-imagem">((s) => void (s.cta.href = v))} />
          </div>
        </>
      );

    case "video":
      return (
        <>
          <TextField label="Título" value={section.title} onChange={(v) => edit<"video">((s) => void (s.title = v))} />
          <TextField label="Vídeo (YouTube ou .mp4)" value={section.url} onChange={(v) => edit<"video">((s) => void (s.url = v))} placeholder="https://youtube.com/watch?v=…" />
          <ImageField label="Capa (para .mp4)" value={section.poster} onChange={(v) => edit<"video">((s) => void (s.poster = v))} suggestions={images} />
        </>
      );

    case "depoimentos":
      return (
        <>
          <TextField label="Título" value={section.title} onChange={(v) => edit<"depoimentos">((s) => void (s.title = v))} />
          {section.items.map((t, i) => (
            <div key={t.id} className="space-y-2 rounded-xl bg-muted/50 p-3">
              <div className="flex items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase">Depoimento {i + 1}</span>
                <ItemActions label={t.name} onRemove={() => edit<"depoimentos">((s) => void s.items.splice(i, 1))} />
              </div>
              <TextField label="Nome" value={t.name} onChange={(v) => edit<"depoimentos">((s) => void (s.items[i]!.name = v))} />
              <TextAreaField label="Depoimento" value={t.text} maxLength={400} onChange={(v) => edit<"depoimentos">((s) => void (s.items[i]!.text = v))} />
              <SliderField label="Estrelas" value={t.rating} min={1} max={5} onChange={(v) => edit<"depoimentos">((s) => void (s.items[i]!.rating = v))} />
            </div>
          ))}
          {section.items.length < 8 ? (
            <AddButton label="Adicionar depoimento" onClick={() => edit<"depoimentos">((s) => void s.items.push({ id: newId("d"), name: "", text: "", rating: 5 }))} />
          ) : null}
          <p className="text-xs text-muted-foreground">Use apenas depoimentos reais de clientes.</p>
        </>
      );

    case "instagram":
      return (
        <>
          <TextField label="Título" value={section.title} onChange={(v) => edit<"instagram">((s) => void (s.title = v))} />
          <TextField label="@ do perfil" value={section.handle} onChange={(v) => edit<"instagram">((s) => void (s.handle = v))} />
          <TextField label="Link do perfil" value={section.url} onChange={(v) => edit<"instagram">((s) => void (s.url = v))} />
          {section.images.map((img, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex-1">
                <ImageField label={`Foto ${i + 1}`} value={img} onChange={(v) => edit<"instagram">((s) => void (s.images[i] = v))} suggestions={images} />
              </div>
              <button type="button" onClick={() => edit<"instagram">((s) => void s.images.splice(i, 1))} className="mb-12 grid size-9 place-items-center rounded-lg hover:bg-destructive/10 hover:text-destructive" aria-label={`Remover foto ${i + 1}`}>
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          {section.images.length < 8 ? <AddButton label="Adicionar foto" onClick={() => edit<"instagram">((s) => void s.images.push(""))} /> : null}
        </>
      );

    case "contador":
      return (
        <>
          <TextField label="Título" value={section.title} onChange={(v) => edit<"contador">((s) => void (s.title = v))} />
          <TextField label="Texto" value={section.text} onChange={(v) => edit<"contador">((s) => void (s.text = v))} />
          <DateTimeField label="Termina em" value={section.endsAt} onChange={(v) => edit<"contador">((s) => void (s.endsAt = v))} />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Botão — texto" value={section.cta.label} onChange={(v) => edit<"contador">((s) => void (s.cta.label = v))} />
            <TextField label="Botão — link" value={section.cta.href} onChange={(v) => edit<"contador">((s) => void (s.cta.href = v))} />
          </div>
        </>
      );

    case "newsletter":
      return (
        <>
          <TextField label="Título" value={section.title} onChange={(v) => edit<"newsletter">((s) => void (s.title = v))} />
          <TextField label="Texto" value={section.text} onChange={(v) => edit<"newsletter">((s) => void (s.text = v))} />
          <TextField label="Texto do botão" value={section.buttonLabel} onChange={(v) => edit<"newsletter">((s) => void (s.buttonLabel = v))} />
          <p className="text-xs text-muted-foreground">O cadastro de e-mails passa a funcionar na Fase 8.</p>
        </>
      );
  }
}

export function TabSecoes() {
  const { theme, update } = useEditor();
  const sections = theme.home.sections;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newType, setNewType] = useState<HomeSectionType>("produtos");
  const index = sections.findIndex((s) => s.id === selectedId);
  const section = index >= 0 ? sections[index] : undefined;

  return (
    <div className="space-y-4">
      <Group title="Seções da página inicial" description="Arraste para reordenar, ligue/desligue, duplique ou edite.">
        <SortableList
          items={sections}
          onChange={(items) => update((d) => void (d.home.sections = items))}
          render={(s, i) => (
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setSelectedId(s.id)} className={`min-w-0 flex-1 truncate text-left text-sm ${s.id === selectedId ? "font-bold text-primary" : "font-medium"} ${s.active ? "" : "opacity-50"}`}>
                {SECTION_LABELS[s.type]}
                {"title" in s && s.title ? <span className="font-normal text-muted-foreground"> — {s.title}</span> : null}
              </button>
              <Switch checked={s.active} onCheckedChange={(v) => update((d) => void (d.home.sections[i]!.active = v))} aria-label={s.active ? "Ocultar seção" : "Mostrar seção"} />
              <button type="button" onClick={() => setSelectedId(s.id)} className="grid size-8 place-items-center rounded-md hover:bg-muted" aria-label="Editar seção">
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const copy = { ...structuredClone(s), id: newId("sec") };
                  update((d) => void d.home.sections.splice(i + 1, 0, copy));
                  setSelectedId(copy.id);
                }}
                className="grid size-8 place-items-center rounded-md hover:bg-muted"
                aria-label="Duplicar seção"
              >
                <Copy className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  update((d) => void d.home.sections.splice(i, 1));
                  if (selectedId === s.id) setSelectedId(null);
                }}
                className="grid size-8 place-items-center rounded-md hover:bg-destructive/10 hover:text-destructive"
                aria-label="Excluir seção"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          )}
        />
        <div className="flex flex-wrap items-end gap-2 border-t pt-4">
          <div className="min-w-48 flex-1">
            <SelectField
              label="Adicionar seção"
              value={newType}
              onChange={setNewType}
              options={(Object.keys(SECTION_LABELS) as HomeSectionType[]).map((t) => ({ value: t, label: SECTION_LABELS[t] }))}
            />
          </div>
          <button
            type="button"
            disabled={sections.length >= 30}
            onClick={() => {
              const s = createSection(newType);
              update((d) => void d.home.sections.push(s));
              setSelectedId(s.id);
            }}
            className="inline-flex h-9 items-center gap-1 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            <Plus className="size-4" /> Adicionar
          </button>
        </div>
      </Group>

      {section ? (
        <Group title={`Editar: ${SECTION_LABELS[section.type]}`}>
          <SectionFields section={section} set={(recipe) => update((d) => recipe(d.home.sections[index]!))} />
          <div className="grid gap-4 border-t pt-4">
            <Segmented
              label="Fundo da seção"
              value={section.background}
              onChange={(v) => update((d) => void (d.home.sections[index]!.background = v))}
              options={[
                { value: "branco", label: "Branco" },
                { value: "ceu", label: "Azul céu" },
                { value: "marca", label: "Cor da marca" },
                { value: "perola", label: "Pérola" },
                { value: "destaque", label: "Destaque" },
              ]}
            />
            <Segmented
              label="Espaçamento"
              value={section.spacing}
              onChange={(v) => update((d) => void (d.home.sections[index]!.spacing = v))}
              options={[
                { value: "compacto", label: "Compacto" },
                { value: "padrao", label: "Padrão" },
                { value: "amplo", label: "Amplo" },
              ]}
            />
            <Segmented
              label="Animação de entrada"
              value={section.animation}
              onChange={(v) => update((d) => void (d.home.sections[index]!.animation = v))}
              options={[
                { value: "herdar", label: "Igual ao tema" },
                { value: "fade-up", label: "Subir" },
                { value: "slide", label: "Deslizar" },
                { value: "zoom", label: "Zoom" },
                { value: "blur", label: "Desfoque" },
                { value: "nenhuma", label: "Nenhuma" },
              ]}
            />
          </div>
        </Group>
      ) : (
        <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">Clique no lápis de uma seção para editar.</p>
      )}
    </div>
  );
}
