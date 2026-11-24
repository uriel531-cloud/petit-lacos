import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { Permission, Role } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";

export const SESSION_COOKIE = "pl_sessao";
const SESSION_DAYS = 7;

/** O banco guarda só o hash do token: quem ler o banco não consegue entrar. */
function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { sessionToken: hashToken(token), userId, expires } });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { sessionToken: hashToken(token) } });
  store.delete(SESSION_COOKIE);
}

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  can: (permission: Permission) => boolean;
};

/** Usuário do painel (dono/vendedor/funcionário) ou null. */
export async function getAdminUser(): Promise<AdminUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { sessionToken: hashToken(token) },
    include: { user: { include: { permissions: true } } },
  });
  if (!session || session.expires < new Date()) return null;
  const u = session.user;
  if (!u.active || u.role === "CLIENTE") return null;

  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    can: (permission) => hasPermission(u.role, permission, u.permissions),
  };
}

/** Para páginas do painel: manda para o login se não estiver autenticado. */
export async function requireAdminPage(next = "/admin"): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) redirect(`/admin/login?proximo=${encodeURIComponent(next)}`);
  return user;
}

/** Para Server Actions: lança erro se não tiver a permissão. */
export async function requirePermission(permission: Permission): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) throw new Error("Sessão expirada. Entre novamente.");
  if (!user.can(permission)) throw new Error("Você não tem permissão para esta ação.");
  return user;
}
