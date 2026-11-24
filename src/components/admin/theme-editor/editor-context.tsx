"use client";

import { createContext, use } from "react";

import type { Theme } from "@/features/theme/schema";
import type { ThemeEditorData } from "@/features/theme/queries";

export type EditorContextValue = {
  theme: Theme;
  /** Altera o rascunho (recebe uma cópia editável) */
  update: (recipe: (draft: Theme) => void) => void;
  /** Substitui o rascunho inteiro (ex.: ao aplicar tema pronto) */
  replace: (theme: Theme) => void;
  canPublish: boolean;
  data: ThemeEditorData;
  categories: { slug: string; name: string }[];
  collections: { slug: string; name: string }[];
  images: string[];
  reload: () => void;
};

export const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor() {
  const ctx = use(EditorContext);
  if (!ctx) throw new Error("useEditor fora do editor");
  return ctx;
}
