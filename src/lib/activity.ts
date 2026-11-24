import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

/** Registra no log de atividades quem fez o quê (ex.: "tema.publicado"). */
export async function logActivity(
  userId: string | null,
  action: string,
  details?: { entityType?: string; entityId?: string; data?: Prisma.InputJsonValue },
) {
  try {
    await db.activityLog.create({
      data: { userId, action, entityType: details?.entityType, entityId: details?.entityId, details: details?.data },
    });
  } catch (error) {
    // O log nunca pode impedir a ação principal
    console.error("[log] falha ao registrar atividade", error);
  }
}
