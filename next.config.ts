import type { NextConfig } from "next";

// O banco local do `prisma dev` (PGlite) aceita poucas conexões ao mesmo tempo.
// Em .env local usamos NEXT_BUILD_CPUS=1 para o build não abrir várias de uma vez.
// Em produção (Neon/Supabase) a variável fica vazia e o Next usa todos os núcleos.
const buildCpus = Number(process.env.NEXT_BUILD_CPUS) || undefined;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  ...(buildCpus ? { experimental: { cpus: buildCpus, staticGenerationMaxConcurrency: 2 } } : {}),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
