import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/lib/db";

import { DEFAULT_THEME } from "./defaults";
import { normalizeTheme, visibleSlides } from "./normalize";
import { applyPreset, getPreset } from "./presets";
import type { Theme } from "./schema";

export const THEME_TAG = "theme";

/**
 * Tema que os clientes veem. Fica em cache e é renovado ao publicar
 * (updateTag) e a cada poucos minutos — para o tema sazonal agendado entrar e sair sozinho.
 */
export async function getPublishedTheme(): Promise<Theme> {
  "use cache";
  cacheTag(THEME_TAG);
  cacheLife("minutes");

  const row = await db.themeSettings.findUnique({ where: { id: "default" } });
  if (!row) return DEFAULT_THEME;

  const { theme, ok } = normalizeTheme(row.published);
  if (!ok) console.error("[tema] JSON publicado inválido — usando o tema padrão.");

  const now = new Date();
  const seasonal = row.scheduledPreset ? getPreset(row.scheduledPreset) : undefined;
  const inWindow =
    seasonal &&
    (!row.scheduleStartsAt || row.scheduleStartsAt <= now) &&
    (!row.scheduleEndsAt || row.scheduleEndsAt >= now);

  const active = inWindow ? applyPreset(theme, seasonal) : theme;
  // Só os slides ativos e dentro do agendamento
  return { ...active, hero: { ...active.hero, slides: visibleSlides(active, now) } };
}

/** Dados completos para o editor (sem cache — só no painel). */
export async function getThemeEditorData() {
  const [row, versions] = await Promise.all([
    db.themeSettings.findUnique({ where: { id: "default" } }),
    db.themeVersion.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, label: true, createdAt: true, createdBy: { select: { name: true } } },
    }),
  ]);
  const published = normalizeTheme(row?.published).theme;
  const draft = row ? normalizeTheme(row.draft).theme : published;
  return {
    draft,
    published,
    publishedAt: row?.publishedAt?.toISOString() ?? null,
    hasUnpublishedChanges: JSON.stringify(draft) !== JSON.stringify(published),
    schedule: {
      preset: row?.scheduledPreset ?? null,
      startsAt: row?.scheduleStartsAt?.toISOString() ?? null,
      endsAt: row?.scheduleEndsAt?.toISOString() ?? null,
    },
    versions: versions.map((v) => ({
      id: v.id,
      label: v.label,
      createdAt: v.createdAt.toISOString(),
      author: v.createdBy?.name ?? null,
    })),
  };
}

export type ThemeEditorData = Awaited<ReturnType<typeof getThemeEditorData>>;

/** Rascunho atual (pré-visualização no painel). */
export async function getDraftTheme(): Promise<Theme> {
  const row = await db.themeSettings.findUnique({ where: { id: "default" } });
  return row ? normalizeTheme(row.draft).theme : DEFAULT_THEME;
}
