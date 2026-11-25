"use client";

import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteProduct, saveProduct, uploadProductImage, type ProductInput } from "@/features/products/actions";
import { slugify } from "@/features/products/slug";
import { parseBRLToCents } from "@/lib/money";

export type ProductFormData = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  measurements: string;
  materials: string;
  care: string;
  categoryId: string;
  collectionIds: string[];
  price: string;
  compareAtPrice: string;
  status: "RASCUNHO" | "PUBLICADO" | "ESGOTADO" | "ARQUIVADO";
  isNew: boolean;
  isFeatured: boolean;
  tags: string;
  stock: string;
  images: { url: string; alt: string }[];
};

type Option = { id: string; name: string };

const STATUS_OPTIONS: { value: ProductFormData["status"]; label: string; hint: string }[] = [
  { value: "PUBLICADO", label: "Publicado", hint: "Aparece na loja" },
  { value: "RASCUNHO", label: "Rascunho", hint: "Só no painel" },
  { value: "ESGOTADO", label: "Esgotado", hint: "Aparece, sem compra" },
  { value: "ARQUIVADO", label: "Arquivado", hint: "Escondido" },
];

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

/** Reduz a foto no navegador (até 1600 px, WebP) para o envio ser rápido e caber no limite. */
async function shrinkImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
    if (blob && blob.size > 0) return blob;
  } catch {
    // formato que o navegador não abre (ex.: HEIC fora do iPhone): envia o original
  }
  return file;
}

export function ProductForm({
  initial,
  categories,
  collections,
}: {
  initial: ProductFormData;
  categories: Option[];
  collections: Option[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [uploading, setUploading] = useState(0);
  const [saving, startSaving] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  function set<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onName(name: string) {
    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, 20 - form.images.length);
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        const small = await shrinkImage(file);
        const fd = new FormData();
        fd.append("arquivo", small, file.name.replace(/\.[^.]+$/, "") + (small.type === "image/webp" ? ".webp" : ""));
        const res = await uploadProductImage(fd);
        if (res.ok) {
          setForm((f) => ({ ...f, images: [...f.images, { url: res.url, alt: "" }] }));
        } else {
          toast.error(`${file.name}: ${res.error}`);
        }
      } catch {
        toast.error(`${file.name}: não foi possível enviar. Tente uma foto menor.`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (fileInput.current) fileInput.current.value = "";
  }

  function moveImage(index: number, delta: number) {
    setForm((f) => {
      const images = [...f.images];
      const target = index + delta;
      if (target < 0 || target >= images.length) return f;
      [images[index], images[target]] = [images[target], images[index]];
      return { ...f, images };
    });
  }

  function removeImage(index: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const priceCents = parseBRLToCents(form.price);
    if (!priceCents) {
      toast.error("Informe um preço válido, ex.: 14,90");
      return;
    }
    const compareAt = form.compareAtPrice.trim() ? parseBRLToCents(form.compareAtPrice) : null;
    if (form.compareAtPrice.trim() && !compareAt) {
      toast.error("O preço “de” não é um valor válido.");
      return;
    }
    const stock = Number.parseInt(form.stock || "0", 10);
    if (!Number.isFinite(stock) || stock < 0) {
      toast.error("O estoque precisa ser um número igual ou maior que zero.");
      return;
    }

    const payload: ProductInput = {
      id: form.id,
      name: form.name,
      slug: form.slug,
      description: form.description,
      measurements: form.measurements,
      materials: form.materials,
      care: form.care,
      categoryId: form.categoryId || null,
      collectionIds: form.collectionIds,
      priceCents,
      compareAtPriceCents: compareAt,
      status: form.status,
      isNew: form.isNew,
      isFeatured: form.isFeatured,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      stock,
      images: form.images,
    };

    startSaving(async () => {
      const res = await saveProduct(payload);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(form.id ? "Produto salvo." : "Produto criado.");
      if (!form.id) {
        router.replace(`/admin/produtos/${res.id}`);
      } else {
        setForm((f) => ({ ...f, slug: slugify(f.slug || f.name) }));
        router.refresh();
      }
    });
  }

  function onDelete() {
    if (!form.id) return;
    if (!window.confirm(`Excluir “${form.name}”? Isso não pode ser desfeito.`)) return;
    startDeleting(async () => {
      const res = await deleteProduct(form.id!);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Produto excluído.");
      router.replace("/admin/produtos");
    });
  }

  const busy = saving || deleting || uploading > 0;

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-6">
        <section className="space-y-4 rounded-2xl border bg-card p-5">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={form.name} onChange={(e) => onName(e.target.value)} required maxLength={120} placeholder="Ex.: Laço de Linho Lilás" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="slug">Endereço na loja</Label>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span className="shrink-0">/produto/</span>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", e.target.value);
                }}
                onBlur={() => set("slug", slugify(form.slug || form.name))}
                maxLength={80}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" value={form.description} onChange={(e) => set("description", e.target.value)} rows={5} maxLength={5000} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="measurements">Medidas</Label>
              <Input id="measurements" value={form.measurements} onChange={(e) => set("measurements", e.target.value)} placeholder="Laço 8 cm" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="materials">Materiais</Label>
              <Input id="materials" value={form.materials} onChange={(e) => set("materials", e.target.value)} placeholder="Linho" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="care">Cuidados</Label>
              <Input id="care" value={form.care} onChange={(e) => set("care", e.target.value)} placeholder="Lavar à mão" />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Fotos</h2>
              <p className="text-sm text-muted-foreground">A primeira foto é a capa. Use as setas para mudar a ordem.</p>
            </div>
            <Button type="button" variant="outline" onClick={() => fileInput.current?.click()} disabled={uploading > 0 || form.images.length >= 20}>
              {uploading > 0 ? <Loader2 className="animate-spin" /> : <ImagePlus />}
              {uploading > 0 ? `Enviando ${uploading}…` : "Adicionar fotos"}
            </Button>
            <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => void onFiles(e.target.files)} />
          </div>

          {form.images.length === 0 && uploading === 0 ? (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="grid w-full place-items-center gap-2 rounded-xl border-2 border-dashed p-10 text-sm text-muted-foreground transition hover:bg-muted"
            >
              <ImagePlus className="size-8" />
              Clique para escolher fotos do computador ou do celular
            </button>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {form.images.map((img, i) => (
                <li key={img.url} className="overflow-hidden rounded-xl border bg-background">
                  <div className="relative aspect-square bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element -- foto enviada (Blob ou /uploads) */}
                    <img src={img.url} alt={img.alt || form.name} className="absolute inset-0 size-full object-cover" />
                    {i === 0 ? (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                        <Star className="size-3" /> Capa
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-2 p-2">
                    <Input
                      value={img.alt}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, images: f.images.map((im, j) => (j === i ? { ...im, alt: e.target.value } : im)) }))
                      }
                      placeholder="Descrição da foto"
                      className="h-8 text-xs"
                      maxLength={200}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <Button type="button" size="icon-sm" variant="ghost" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label="Mover para a esquerda">
                          <ArrowLeft />
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => moveImage(i, 1)}
                          disabled={i === form.images.length - 1}
                          aria-label="Mover para a direita"
                        >
                          <ArrowRight />
                        </Button>
                      </div>
                      <Button type="button" size="icon-sm" variant="destructive" onClick={() => removeImage(i)} aria-label="Remover foto">
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
              {uploading > 0
                ? Array.from({ length: uploading }).map((_, i) => (
                    <li key={`up-${i}`} className="grid aspect-square place-items-center rounded-xl border bg-muted">
                      <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </li>
                  ))
                : null}
            </ul>
          )}
        </section>
      </div>

      <aside className="space-y-6">
        <section className="space-y-4 rounded-2xl border bg-card p-5">
          <div className="grid gap-1.5">
            <Label htmlFor="status">Situação</Label>
            <select id="status" className={selectClass} value={form.status} onChange={(e) => set("status", e.target.value as ProductFormData["status"])}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label} — {s.hint}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-primary" checked={form.isNew} onChange={(e) => set("isNew", e.target.checked)} />
            Marcar como novidade
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-primary" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} />
            Destaque na página inicial
          </label>
        </section>

        <section className="space-y-4 rounded-2xl border bg-card p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input id="price" inputMode="decimal" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="14,90" required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="compareAt">Preço “de”</Label>
              <Input id="compareAt" inputMode="decimal" value={form.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value)} placeholder="opcional" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="stock">Estoque</Label>
            <Input id="stock" type="number" min={0} step={1} value={form.stock} onChange={(e) => set("stock", e.target.value)} />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-card p-5">
          <div className="grid gap-1.5">
            <Label htmlFor="category">Categoria</Label>
            <select id="category" className={selectClass} value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {collections.length ? (
            <fieldset className="grid gap-2">
              <legend className="mb-1 text-sm font-medium">Coleções</legend>
              {collections.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={form.collectionIds.includes(c.id)}
                    onChange={(e) =>
                      set("collectionIds", e.target.checked ? [...form.collectionIds, c.id] : form.collectionIds.filter((x) => x !== c.id))
                    }
                  />
                  {c.name}
                </label>
              ))}
            </fieldset>
          ) : null}
          <div className="grid gap-1.5">
            <Label htmlFor="tags">Palavras-chave</Label>
            <Input id="tags" value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="rosa, presilha, natal" />
            <p className="text-xs text-muted-foreground">Separe por vírgula. Ajudam na busca da loja.</p>
          </div>
        </section>

        <div className="flex flex-col gap-2">
          <Button type="submit" size="lg" className="h-11 rounded-full text-base" disabled={busy}>
            {saving ? <Loader2 className="animate-spin" /> : null}
            {saving ? "Salvando…" : form.id ? "Salvar alterações" : "Criar produto"}
          </Button>
          {form.id && form.status !== "RASCUNHO" && form.status !== "ARQUIVADO" ? (
            <Link href={`/produto/${form.slug}`} target="_blank" className="text-center text-sm text-primary underline-offset-4 hover:underline">
              Ver na loja
            </Link>
          ) : null}
          {form.id ? (
            <Button type="button" variant="destructive" onClick={onDelete} disabled={busy}>
              {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
              Excluir produto
            </Button>
          ) : null}
        </div>
      </aside>
    </form>
  );
}
