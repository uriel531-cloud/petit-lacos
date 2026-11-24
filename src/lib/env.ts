import "server-only";

import { z } from "zod";

/**
 * Variáveis de ambiente do servidor, validadas na inicialização.
 * Só DATABASE_URL é obrigatória agora; as demais entram como obrigatórias
 * na fase em que forem usadas (ver .env.example).
 */
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.url({ message: "DATABASE_URL ausente ou inválida — veja o .env.example" }),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  /** Máximo de conexões por processo (o banco local do prisma dev aceita poucas) */
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(50).default(10),

  // Fase 2 — login do painel
  AUTH_SECRET: z.string().min(32).optional(),

  // Fase 6 — Mercado Pago
  MERCADOPAGO_ACCESS_TOKEN: z.string().optional(),
  MERCADOPAGO_WEBHOOK_SECRET: z.string().optional(),

  // Fase 7B — Melhor Envio (só no modo "Vender para todo o Brasil")
  MELHOR_ENVIO_TOKEN: z.string().optional(),
  MELHOR_ENVIO_SANDBOX: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),

  // Fase 8 — e-mails
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
});

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Variáveis de ambiente inválidas:", z.flattenError(parsed.error).fieldErrors);
  throw new Error("Variáveis de ambiente inválidas. Confira o arquivo .env.");
}

export const env = parsed.data;
