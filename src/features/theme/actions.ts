"use server";

import { updateTag } from "next/cache";
import sharp from "sharp";
import { z } from "zod";

import type { Prisma } from "@/generated/prisma/client";
import { requirePermission } from "@/features/auth/session";
import { logActivity } from "@/lib/activity";
import { db } from "@/lib/db";
import { storeImage } from "@/lib/storage";

import { DEFAULT_THEME } from "./defaults";
import { normalizeTheme, parseThemeStrict } from "./normalize";
import { getPreset } from "./presets";
import { THEME_TAG } from "./queries";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

function asJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

async function currentRow() {
  const row = await db.themeSettings.findUnique({ where: { id: "default" } });
  if (row) return row;
  return db.themeSettings.create({ data: { id: "default", draft: asJson(DEFAULT_THEME), published: asJson(DEFAULT_THEME) } });
}

function fail(error: unknown): ActionResult {
  return { ok: false, error: error instanceof Error ? error.message : "Algo deu errado. Tente de novo." };
}

/** Salva o rascunho (chamado automaticamente pelo editor a cada alteração). */
export async function saveThemeDraft(input: unknown): Promise<ActionResult> {
  try {
    await requirePermission("EDITAR_TEMA");
    const parsed = parseThemeStrict(input);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { ok: false, error: `Campo inválido: ${issue?.path.join(" › ")} — ${issue?.message}` };
    }
    await currentRow();
    await db.themeSettings.update({ where: { id: "default" }, data: { draft: asJson(parsed.data) } });
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/** Publica o rascunho: vira o tema da loja e entra no histórico de versões. */
export async function publishTheme(label?: string): Promise<ActionResult> {
  try {
    const user = await requirePermission("PUBLICAR_TEMA");
    const row = await currentRow();
    const { theme, ok } = normalizeTheme(row.draft);
    if (!ok) return { ok: false, error: "O rascunho tem campos inválidos. Revise antes de publicar." };

    await db.$transaction([
      db.themeSettings.update({
        where: { id: "default" },
        data: { published: asJson(theme), activePreset: theme.preset, publishedAt: new Date(), publishedById: user.id },
      }),
      db.themeVersion.create({
        data: { data: asJson(theme), label: label?.trim().slice(0, 80) || `Publicado por ${user.name}`, createdById: user.id },
      }),
    ]);
    updateTag(THEME_TAG);
    await logActivity(user.id, "tema.publicado", { entityType: "tema", data: { preset: theme.preset } });
    return { ok: true, message: "Publicado! A loja já está com a nova aparência." };
  } catch (error) {
    return fail(error);
  }
}

/** Descarta o rascunho e volta para o que está publicado. */
export async function discardThemeDraft(): Promise<ActionResult> {
  try {
    const user = await requirePermission("EDITAR_TEMA");
    const row = await currentRow();
    await db.themeSettings.update({ where: { id: "default" }, data: { draft: asJson(row.published) } });
    await logActivity(user.id, "tema.rascunho-descartado", { entityType: "tema" });
    return { ok: true, message: "Alterações descartadas." };
  } catch (error) {
    return fail(error);
  }
}

/** "Voltar ao padrão": o rascunho recebe o tema original da Petit Laços. */
export async function resetThemeDraft(): Promise<ActionResult> {
  try {
    const user = await requirePermission("EDITAR_TEMA");
    await currentRow();
    await db.themeSettings.update({ where: { id: "default" }, data: { draft: asJson(DEFAULT_THEME) } });
    await logActivity(user.id, "tema.rascunho-padrao", { entityType: "tema" });
    return { ok: true, message: "Rascunho voltou ao tema padrão. Publique para aplicar na loja." };
  } catch (error) {
    return fail(error);
  }
}

/** Restaura uma versão do histórico como rascunho. */
export async function restoreThemeVersion(versionId: string): Promise<ActionResult> {
  try {
    const user = await requirePermission("EDITAR_TEMA");
    const version = await db.themeVersion.findUnique({ where: { id: z.string().min(1).parse(versionId) } });
    if (!version) return { ok: false, error: "Versão não encontrada." };
    const { theme } = normalizeTheme(version.data);
    await currentRow();
    await db.themeSettings.update({ where: { id: "default" }, data: { draft: asJson(theme) } });
    await logActivity(user.id, "tema.versao-restaurada", { entityType: "tema", entityId: version.id });
    return { ok: true, message: "Versão restaurada no rascunho. Publique para aplicar na loja." };
  } catch (error) {
    return fail(error);
  }
}

/** Importa um tema exportado (arquivo JSON) como rascunho. */
export async function importTheme(json: string): Promise<ActionResult> {
  try {
    const user = await requirePermission("EDITAR_TEMA");
    if (json.length > 500_000) return { ok: false, error: "Arquivo muito grande." };
    let raw: unknown;
    try {
      raw = JSON.parse(json);
    } catch {
      return { ok: false, error: "O arquivo não é um JSON válido." };
    }
    const parsed = parseThemeStrict(raw);
    if (!parsed.success) return { ok: false, error: "Esse arquivo não é um tema válido da Petit Laços." };
    await currentRow();
    await db.themeSettings.update({ where: { id: "default" }, data: { draft: asJson(parsed.data) } });
    await logActivity(user.id, "tema.importado", { entityType: "tema" });
    return { ok: true, message: "Tema importado para o rascunho." };
  } catch (error) {
    return fail(error);
  }
}

const scheduleSchema = z
  .object({
    preset: z.string().nullable(),
    startsAt: z.string().nullable(),
    endsAt: z.string().nullable(),
  })
  .refine((s) => !s.preset || getPreset(s.preset), "Tema sazonal inválido")
  .refine((s) => !s.startsAt || !s.endsAt || new Date(s.startsAt) < new Date(s.endsAt), "A data de fim precisa ser depois do início");

/** Agenda (ou cancela) um tema sazonal — entra e sai sozinho da loja. */
export async function saveSeasonalSchedule(input: unknown): Promise<ActionResult> {
  try {
    const user = await requirePermission("PUBLICAR_TEMA");
    const parsed = scheduleSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const { preset, startsAt, endsAt } = parsed.data;
    await currentRow();
    await db.themeSettings.update({
      where: { id: "default" },
      data: {
        scheduledPreset: preset,
        scheduleStartsAt: preset && startsAt ? new Date(startsAt) : null,
        scheduleEndsAt: preset && endsAt ? new Date(endsAt) : null,
      },
    });
    updateTag(THEME_TAG);
    await logActivity(user.id, preset ? "tema.sazonal-agendado" : "tema.sazonal-cancelado", { entityType: "tema", data: { preset, startsAt, endsAt } });
    return { ok: true, message: preset ? "Tema sazonal agendado." : "Agendamento cancelado." };
  } catch (error) {
    return fail(error);
  }
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Envio de imagem para o tema (hero, banners, bento…). Converte para WebP e
 * limita o tamanho. Guarda no Vercel Blob (hospedagem) ou em /public/uploads (computador).
 */
export async function uploadThemeImage(formData: FormData): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const user = await requirePermission("EDITAR_TEMA");
    const file = formData.get("arquivo");
    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Escolha uma imagem." };
    if (!ALLOWED_TYPES.includes(file.type)) return { ok: false, error: "Use JPG, PNG, WebP ou AVIF." };
    if (file.size > MAX_BYTES) return { ok: false, error: "A imagem precisa ter até 8 MB." };

    const input = Buffer.from(await file.arrayBuffer());
    const output = await sharp(input).rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();

    const url = await storeImage("tema", output);
    await logActivity(user.id, "tema.imagem-enviada", { entityType: "arquivo", entityId: url });
    return { ok: true, url };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Falha no envio." };
  }
}
