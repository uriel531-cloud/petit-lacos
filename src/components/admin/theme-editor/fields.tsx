"use client";

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ImageUp, Loader2, Plus, Trash2 } from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { uploadThemeImage } from "@/features/theme/actions";

export function Group({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4">
      <header>
        <h3 className="font-sans text-sm font-bold tracking-wide text-foreground uppercase">{title}</h3>
        {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function TextField({ label, value, onChange, hint, placeholder, maxLength = 160 }: { label: string; value: string; onChange: (v: string) => void; hint?: string; placeholder?: string; maxLength?: number }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <Input id={id} value={value} placeholder={placeholder} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function TextAreaField({ label, value, onChange, hint, maxLength = 1000 }: { label: string; value: string; onChange: (v: string) => void; hint?: string; maxLength?: number }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <Textarea id={id} value={value} maxLength={maxLength} rows={3} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function SwitchField({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <Label htmlFor={id} className="text-sm font-semibold">
          {label}
        </Label>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  hint,
  format,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  hint?: string;
  format?: (v: number) => string;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-3">
        <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0] ?? value)} aria-label={label} className="flex-1" />
        <span className="w-14 text-right text-sm font-semibold tabular-nums">{format ? format(value) : `${value}${unit}`}</span>
      </div>
    </Field>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: readonly { value: T; label: string }[];
  hint?: string;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <Select value={value} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

/** Botões lado a lado (escolha única), mais rápidos que um select para poucas opções. */
export function Segmented<T extends string | number>({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: readonly { value: T; label: string; icon?: ReactNode }[];
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={o.value === value}
            onClick={() => onChange(o.value)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
              o.value === value ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary/50"
            }`}
          >
            {o.icon}
            {o.label}
          </button>
        ))}
      </div>
    </Field>
  );
}

export function ColorField({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  const id = useId();
  const [text, setText] = useState(value);
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setText(value);
  }
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          aria-label={`${label} — seletor`}
          className="size-10 shrink-0 cursor-pointer rounded-lg border bg-transparent p-0.5"
        />
        <Input
          id={id}
          value={text}
          maxLength={7}
          className="font-mono uppercase"
          onChange={(e) => {
            const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
            setText(v);
            if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v.toUpperCase());
          }}
        />
      </div>
    </Field>
  );
}

/** Imagem: escolher da galeria do site, colar um endereço ou enviar do computador/celular. */
export function ImageField({ label, value, onChange, hint, suggestions = [] }: { label: string; value: string; onChange: (v: string) => void; hint?: string; suggestions?: string[] }) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.set("arquivo", file);
    const res = await uploadThemeImage(fd);
    setUploading(false);
    if (res.ok) {
      onChange(res.url);
      toast.success("Imagem enviada");
    } else toast.error(res.error);
  }

  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <div className="flex items-center gap-2">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border bg-muted">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- miniatura no editor
            <img src={value} alt="" className="size-full object-cover" />
          ) : null}
        </div>
        <Input id={id} value={value} placeholder="/demo/foto.webp ou https://…" onChange={(e) => onChange(e.target.value)} maxLength={500} />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs font-semibold hover:border-primary/50"
        >
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <ImageUp className="size-3.5" />}
          Enviar imagem
        </button>
        {value ? (
          <button type="button" onClick={() => onChange("")} className="rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:text-destructive">
            Remover
          </button>
        ) : null}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
            e.target.value = "";
          }}
        />
      </div>
      {suggestions.length ? (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange(s)}
              className={`relative size-11 shrink-0 overflow-hidden rounded-md border-2 ${s === value ? "border-primary" : "border-transparent"}`}
              aria-label={`Usar ${s}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- miniatura no editor */}
              <img src={s} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </Field>
  );
}

/** Lista de textos (mensagens da barra, palavras rotativas…). */
export function StringListField({ label, values, onChange, max = 8, placeholder, hint }: { label: string; values: string[]; onChange: (v: string[]) => void; max?: number; placeholder?: string; hint?: string }) {
  return (
    <Field label={label} hint={hint}>
      <div className="grid gap-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={v}
              maxLength={160}
              placeholder={placeholder}
              aria-label={`${label} ${i + 1}`}
              onChange={(e) => onChange(values.map((x, j) => (j === i ? e.target.value : x)))}
            />
            <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))} className="grid size-9 shrink-0 place-items-center rounded-lg hover:bg-destructive/10 hover:text-destructive" aria-label="Remover">
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        {values.length < max ? (
          <button type="button" onClick={() => onChange([...values, ""])} className="inline-flex w-fit items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-primary hover:bg-primary/10">
            <Plus className="size-4" /> Adicionar
          </button>
        ) : null}
      </div>
    </Field>
  );
}

function SortableRow({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 rounded-xl border bg-background p-2 ${isDragging ? "z-10 shadow-lg ring-2 ring-primary" : ""}`}
    >
      <button type="button" {...attributes} {...listeners} className="grid size-8 shrink-0 cursor-grab touch-none place-items-center rounded-md text-muted-foreground hover:bg-muted active:cursor-grabbing" aria-label="Arrastar para reordenar">
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  );
}

/** Lista que reordena arrastando (mouse, dedo ou teclado: espaço + setas). */
export function SortableList<T extends { id: string }>({ items, onChange, render }: { items: T[]; onChange: (items: T[]) => void; render: (item: T, index: number) => ReactNode }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    onChange(arrayMove(items, from, to));
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="grid gap-2">
          {items.map((item, i) => (
            <SortableRow key={item.id} id={item.id}>
              {render(item, i)}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

export function datetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DateTimeField({ label, value, onChange, hint }: { label: string; value: string | null; onChange: (iso: string | null) => void; hint?: string }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <Input id={id} type="datetime-local" value={datetimeLocal(value)} onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)} />
    </Field>
  );
}
