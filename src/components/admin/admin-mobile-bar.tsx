"use client";

import { LogOut, Menu } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import { logoutAction } from "@/features/auth/actions";

import { AdminNav } from "./admin-nav";
import { AdminThemeToggle } from "./admin-theme";

/** Barra do painel no celular (no computador o menu fica na lateral). */
export function AdminMobileBar() {
  const [open, setOpen] = useState(false);
  return (
    <div className="sticky top-0 z-40 flex items-center gap-2 border-b bg-background px-3 py-2 lg:hidden">
      <button type="button" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-full hover:bg-muted" aria-label="Abrir menu do painel">
        <Menu className="size-5" />
      </button>
      <Image src={siteConfig.logo.withBackground} alt="" width={32} height={32} className="rounded-lg" />
      <span className="font-heading text-xl">Painel</span>
      <div className="ml-auto">
        <AdminThemeToggle compact />
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-xs">
          <SheetHeader>
            <SheetTitle className="font-heading text-2xl">Painel</SheetTitle>
            <SheetDescription className="sr-only">Menu do painel</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-6 px-4 pb-6">
            <AdminNav onNavigate={() => setOpen(false)} />
            <div>
              <p className="mb-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">Tema do painel</p>
              <AdminThemeToggle />
            </div>
            <form action={logoutAction}>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted">
                <LogOut className="size-4" /> Sair
              </button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
