import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/lib/db";

export const SETTINGS_TAG = "store-settings";

/** Só o que a vitrine precisa saber (dados seguros para ir ao navegador). */
export type PublicStoreSettings = {
  storeName: string;
  whatsappMain: string | null;
  whatsappTemplates: Record<string, string>;
  nationwideShippingEnabled: boolean;
  pixDiscountPercent: number;
  maxInstallmentsNoInterest: number;
  servedAreas: string[];
  instagramUrl: string | null;
};

export async function getPublicStoreSettings(): Promise<PublicStoreSettings> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  cacheLife("hours");

  const s = await db.storeSettings.findUnique({ where: { id: "default" } });
  const templates = (s?.whatsappTemplates ?? {}) as Record<string, unknown>;
  return {
    storeName: s?.storeName ?? "Petit Laços",
    whatsappMain: s?.whatsappMain ?? null,
    whatsappTemplates: Object.fromEntries(
      Object.entries(templates).filter((e): e is [string, string] => typeof e[1] === "string"),
    ),
    nationwideShippingEnabled: s?.nationwideShippingEnabled ?? false,
    pixDiscountPercent: s?.pixDiscountPercent ?? 5,
    maxInstallmentsNoInterest: s?.maxInstallmentsNoInterest ?? 3,
    servedAreas: s?.servedAreas ?? [],
    instagramUrl: s?.instagramUrl ?? null,
  };
}
