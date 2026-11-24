import { DEFAULT_THEME } from "./defaults";
import { themeSchema, type Theme } from "./schema";

type Plain = Record<string, unknown>;

function isPlainObject(value: unknown): value is Plain {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Mescla objetos recursivamente; arrays e valores simples do "override" substituem os da base. */
export function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override === undefined ? base : override) as T;
  }
  const result: Plain = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    result[key] = key in base ? deepMerge((base as Plain)[key], value) : value;
  }
  return result as T;
}

export type NormalizeResult = { theme: Theme; ok: true } | { theme: Theme; ok: false; issues: string[] };

/**
 * Converte qualquer JSON salvo (inclusive de versões antigas) num Theme válido.
 * Se algo estiver inválido, devolve o tema padrão e a lista de problemas.
 */
export function normalizeTheme(raw: unknown): NormalizeResult {
  const merged = deepMerge(structuredClone(DEFAULT_THEME), isPlainObject(raw) ? { ...raw, version: 2 } : {});
  const parsed = themeSchema.safeParse(merged);
  if (parsed.success) return { theme: parsed.data, ok: true };
  return {
    theme: structuredClone(DEFAULT_THEME),
    ok: false,
    issues: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
  };
}

/** Valida estritamente (usado ao salvar/importar). */
export function parseThemeStrict(raw: unknown) {
  const merged = deepMerge(structuredClone(DEFAULT_THEME), isPlainObject(raw) ? { ...raw, version: 2 } : {});
  return themeSchema.safeParse(merged);
}

/** Slides visíveis agora (respeita ativo e agendamento). */
export function visibleSlides(theme: Theme, now: Date) {
  const slides = theme.hero.slides.filter((s) => {
    if (!s.active) return false;
    if (s.startsAt && new Date(s.startsAt) > now) return false;
    if (s.endsAt && new Date(s.endsAt) < now) return false;
    return true;
  });
  return slides.length > 0 ? slides : theme.hero.slides.slice(0, 1);
}
