import { Brush, Package, Store } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { requireAdminPage } from "@/features/auth/session";
import { DEFAULT_WHATSAPP } from "@/features/store/settings";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Painel", robots: { index: false } };

async function Dashboard() {
  const user = await requireAdminPage("/admin");
  const [products, theme, settings] = await Promise.all([
    db.product.count({ where: { status: "PUBLICADO" } }),
    db.themeSettings.findUnique({ where: { id: "default" }, select: { activePreset: true, publishedAt: true } }),
    db.storeSettings.findUnique({ where: { id: "default" }, select: { nationwideShippingEnabled: true, whatsappMain: true } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 lg:p-10">
      <header>
        <p className="text-sm text-muted-foreground">Olá, {user.name.split(" ")[0]}!</p>
        <h1 className="text-4xl">Painel da Petit Laços</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5">
          <Package className="size-5 text-primary" aria-hidden />
          <p className="mt-3 text-3xl font-bold tabular-nums">{products}</p>
          <p className="text-sm text-muted-foreground">produtos publicados</p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <Store className="size-5 text-primary" aria-hidden />
          <p className="mt-3 text-lg font-bold">{settings?.nationwideShippingEnabled ? "Todo o Brasil" : "Venda Local"}</p>
          <p className="text-sm text-muted-foreground">modo de venda ativo</p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <Brush className="size-5 text-primary" aria-hidden />
          <p className="mt-3 text-lg font-bold capitalize">{theme?.activePreset?.replace("-", " ") ?? "Petit Clássico"}</p>
          <p className="text-sm text-muted-foreground">
            {theme?.publishedAt ? `publicado em ${theme.publishedAt.toLocaleDateString("pt-BR")}` : "tema padrão"}
          </p>
        </div>
      </div>

      {!(settings?.whatsappMain || DEFAULT_WHATSAPP) ? (
        <p className="rounded-2xl border border-highlight bg-highlight/40 p-4 text-sm">
          <strong>WhatsApp da loja ainda não configurado.</strong> O botão flutuante e o “Tirar dúvida” aparecem assim que o número for cadastrado
          (tela “Modo de venda”, Fase 5).
        </p>
      ) : null}

      {user.can("GERENCIAR_PRODUTOS") ? (
        <Link href="/admin/produtos" className="flex items-center gap-4 rounded-2xl border bg-card p-6 transition hover:bg-muted">
          <Package className="size-8 text-primary" aria-hidden />
          <span>
            <span className="block text-xl font-bold">Produtos e fotos</span>
            <span className="text-sm text-muted-foreground">Cadastrar, editar preços e estoque, enviar e organizar as fotos</span>
          </span>
        </Link>
      ) : null}

      {user.can("EDITAR_TEMA") ? (
        <Link href="/admin/aparencia" className="flex items-center gap-4 rounded-2xl bg-primary p-6 text-primary-foreground transition hover:opacity-95">
          <Brush className="size-8" aria-hidden />
          <span>
            <span className="block text-xl font-bold">Personalizar a aparência da loja</span>
            <span className="text-sm opacity-90">Temas, cores, fontes, hero, carrossel, animações, layout dos produtos e seções da Home</span>
          </span>
        </Link>
      ) : null}
    </div>
  );
}

export default function AdminHome() {
  return (
    <Suspense fallback={<div className="p-10 text-muted-foreground">Carregando…</div>}>
      <Dashboard />
    </Suspense>
  );
}
