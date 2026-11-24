"use client";

import { Plus, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { newId } from "@/features/theme/defaults";

import { useEditor } from "./editor-context";
import { Group, Segmented, SliderField, SortableList, StringListField, SwitchField, TextAreaField, TextField } from "./fields";

type Link = { id: string; label: string; href: string };

function LinksEditor({ links, onChange, max = 12 }: { links: Link[]; onChange: (l: Link[]) => void; max?: number }) {
  return (
    <div className="grid gap-2">
      <SortableList
        items={links}
        onChange={onChange}
        render={(item) => (
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <Input value={item.label} aria-label="Texto do link" placeholder="Texto" maxLength={60} onChange={(e) => onChange(links.map((l) => (l.id === item.id ? { ...l, label: e.target.value } : l)))} />
            <Input value={item.href} aria-label="Endereço do link" placeholder="/produtos" maxLength={300} onChange={(e) => onChange(links.map((l) => (l.id === item.id ? { ...l, href: e.target.value } : l)))} />
            <button type="button" onClick={() => onChange(links.filter((l) => l.id !== item.id))} className="grid size-9 place-items-center rounded-lg hover:bg-destructive/10 hover:text-destructive" aria-label={`Remover ${item.label}`}>
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      />
      {links.length < max ? (
        <button type="button" onClick={() => onChange([...links, { id: newId("lnk"), label: "Novo link", href: "/produtos" }])} className="inline-flex w-fit items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-primary hover:bg-primary/10">
          <Plus className="size-4" /> Adicionar link
        </button>
      ) : null}
    </div>
  );
}

export function TabCabecalho() {
  const { theme, update } = useEditor();
  const h = theme.header;
  const a = theme.announcement;
  const f = theme.footer;

  return (
    <div className="space-y-4">
      <Group title="Logo">
        <Segmented
          label="Versão do logo"
          value={h.logo}
          onChange={(v) => update((d) => void (d.header.logo = v))}
          options={[
            { value: "com-fundo", label: "Com fundo azul" },
            { value: "transparente", label: "Sem fundo" },
            { value: "simbolo", label: "Só o laço" },
          ]}
          hint="“Sem fundo” ganha um contorno sutil para o laço branco aparecer em fundos claros."
        />
        <SliderField label="Tamanho no celular" value={h.logoHeightMobile} min={28} max={96} unit="px" onChange={(v) => update((d) => void (d.header.logoHeightMobile = v))} />
        <SliderField label="Tamanho no computador" value={h.logoHeightDesktop} min={32} max={140} unit="px" onChange={(v) => update((d) => void (d.header.logoHeightDesktop = v))} />
      </Group>

      <Group title="Cabeçalho">
        <Segmented
          label="Estilo"
          value={h.style}
          onChange={(v) => update((d) => void (d.header.style = v))}
          options={[
            { value: "solido", label: "Sólido" },
            { value: "transparente", label: "Transparente sobre o hero" },
            { value: "blur", label: "Translúcido com desfoque" },
          ]}
        />
        <Segmented
          label="Ao rolar a página"
          value={h.onScroll}
          onChange={(v) => update((d) => void (d.header.onScroll = v))}
          options={[
            { value: "fixo", label: "Fica fixo" },
            { value: "encolher", label: "Encolhe" },
            { value: "esconder", label: "Esconde ao descer" },
          ]}
        />
        <SwitchField label="Mostrar busca" checked={h.showSearch} onChange={(v) => update((d) => void (d.header.showSearch = v))} />
      </Group>

      <Group title="Menu" description="Arraste para reordenar.">
        <LinksEditor links={h.menu} onChange={(menu) => update((d) => void (d.header.menu = menu))} />
      </Group>

      <Group title="Barra de avisos">
        <SwitchField label="Mostrar barra de avisos" checked={a.enabled} onChange={(v) => update((d) => void (d.announcement.enabled = v))} />
        <StringListField label="Mensagens (giram sozinhas)" values={a.messages} onChange={(v) => update((d) => void (d.announcement.messages = v))} placeholder="Ex.: Pix com 5% de desconto" />
        <SliderField label="Tempo de cada mensagem" value={a.rotateSeconds} min={2} max={20} unit="s" onChange={(v) => update((d) => void (d.announcement.rotateSeconds = v))} />
        <TextField label="Link ao clicar (opcional)" value={a.link} onChange={(v) => update((d) => void (d.announcement.link = v))} placeholder="/produtos?colecao=natal" />
        <SwitchField label="Cliente pode fechar" checked={a.dismissible} onChange={(v) => update((d) => void (d.announcement.dismissible = v))} />
      </Group>

      <Group title="Rodapé">
        <TextAreaField label="Texto sobre a loja" value={f.about} maxLength={400} onChange={(v) => update((d) => void (d.footer.about = v))} />
        {f.columns.map((col, ci) => (
          <div key={col.id} className="space-y-2 rounded-xl bg-muted/50 p-3">
            <div className="flex gap-2">
              <Input value={col.title} aria-label="Título da coluna" maxLength={60} onChange={(e) => update((d) => void (d.footer.columns[ci]!.title = e.target.value))} />
              <button type="button" onClick={() => update((d) => void d.footer.columns.splice(ci, 1))} className="grid size-9 shrink-0 place-items-center rounded-lg hover:bg-destructive/10 hover:text-destructive" aria-label="Remover coluna">
                <Trash2 className="size-4" />
              </button>
            </div>
            <LinksEditor links={col.links} max={8} onChange={(links) => update((d) => void (d.footer.columns[ci]!.links = links))} />
          </div>
        ))}
        {f.columns.length < 4 ? (
          <button
            type="button"
            onClick={() => update((d) => void d.footer.columns.push({ id: newId("col"), title: "Nova coluna", links: [] }))}
            className="inline-flex w-fit items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-primary hover:bg-primary/10"
          >
            <Plus className="size-4" /> Adicionar coluna
          </button>
        ) : null}
        <TextField label="Instagram (endereço)" value={f.instagram} onChange={(v) => update((d) => void (d.footer.instagram = v))} placeholder="https://instagram.com/petitlacos" />
        <SwitchField label="Mostrar redes sociais" checked={f.showSocial} onChange={(v) => update((d) => void (d.footer.showSocial = v))} />
        <SwitchField label="Mostrar formas de pagamento" checked={f.showPayments} onChange={(v) => update((d) => void (d.footer.showPayments = v))} />
        <SwitchField label="Mostrar newsletter" checked={f.showNewsletter} onChange={(v) => update((d) => void (d.footer.showNewsletter = v))} hint="O envio de e-mails chega na Fase 8." />
      </Group>
    </div>
  );
}
