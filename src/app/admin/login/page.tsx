import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";

import { AdminThemeToggle } from "@/components/admin/admin-theme";
import { siteConfig } from "@/config/site";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar no painel", robots: { index: false } };

async function Form({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  const sp = await searchParams;
  const next = typeof sp.proximo === "string" ? sp.proximo : "/admin";
  return <LoginForm next={next} />;
}

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="relative grid min-h-svh place-items-center bg-muted px-4 py-10 text-foreground">
      <div className="absolute top-4 right-4">
        <AdminThemeToggle compact />
      </div>
      <div className="w-full max-w-sm rounded-[var(--radius)] border bg-card p-8 shadow-[0_20px_50px_-24px_rgb(30_48_66/0.35)]">
        <Image src={siteConfig.logo.withBackground} alt={siteConfig.name} width={88} height={88} className="mx-auto rounded-2xl" priority />
        <h1 className="mt-5 text-center text-3xl">Painel da loja</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">Entre com seu e-mail e senha</p>
        <Suspense fallback={<div className="mt-6 h-52" />}>
          <Form searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
