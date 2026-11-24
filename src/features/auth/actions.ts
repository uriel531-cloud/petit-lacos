"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { logActivity } from "@/lib/activity";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

import { createSession, destroySession, getAdminUser } from "./session";

export type LoginState = { error?: string; email?: string };

const loginSchema = z.object({
  email: z.email("Informe um e-mail válido").transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1, "Informe a senha").max(200),
  proximo: z.string().optional(),
});

// Limite simples de tentativas (por e-mail + IP) — 5 erros em 15 minutos
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function safeNext(next: string | undefined) {
  return next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  const { email, password, proximo } = parsed.data;

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = `${email}|${ip}`;
  const now = Date.now();
  const entry = attempts.get(key);
  if (entry && entry.count >= MAX_ATTEMPTS && entry.until > now) {
    const minutes = Math.ceil((entry.until - now) / 60000);
    return { error: `Muitas tentativas. Tente de novo em ${minutes} min.`, email };
  }

  const user = await db.user.findUnique({ where: { email } });
  const valid = user?.passwordHash ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !valid || !user.active || user.role === "CLIENTE") {
    const current = entry && entry.until > now ? entry.count : 0;
    attempts.set(key, { count: current + 1, until: now + WINDOW_MS });
    return { error: "E-mail ou senha incorretos.", email };
  }

  attempts.delete(key);
  await createSession(user.id);
  await logActivity(user.id, "painel.login");
  redirect(safeNext(proximo));
}

export async function logoutAction() {
  const user = await getAdminUser();
  await destroySession();
  if (user) await logActivity(user.id, "painel.logout");
  redirect("/admin/login");
}
