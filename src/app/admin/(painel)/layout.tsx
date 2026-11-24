import { LogOut } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";

import { AdminMobileBar } from "@/components/admin/admin-mobile-bar";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminThemeToggle } from "@/components/admin/admin-theme";
import { TooltipProvider } from "@/components/ui/tooltip";
import { siteConfig } from "@/config/site";
import { logoutAction } from "@/features/auth/actions";
import { requireAdminPage } from "@/features/auth/session";

const ROLE_LABEL = { DONO: "Dona/Dono", VENDEDOR: "Vendedor(a)", FUNCIONARIO: "Funcionário(a)", CLIENTE: "Cliente" } as const;

async function UserBox() {
  const user = await requireAdminPage();
  return (
    <div className="flex items-center gap-3 border-t pt-4">
      <span className="grid size-9 place-items-center rounded-full bg-secondary font-bold text-secondary-foreground">{user.name.slice(0, 1).toUpperCase()}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{user.name}</p>
        <p className="text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</p>
      </div>
      <form action={logoutAction}>
        <button type="submit" className="grid size-9 place-items-center rounded-full hover:bg-muted" aria-label="Sair">
          <LogOut className="size-4" />
        </button>
      </form>
    </div>
  );
}

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <div className="min-h-svh bg-sidebar text-foreground lg:grid lg:grid-cols-[15rem_1fr]">
        <aside className="hidden flex-col gap-6 border-r bg-background p-4 lg:sticky lg:top-0 lg:flex lg:h-svh">
          <div className="flex items-center gap-2 px-2">
            <Image src={siteConfig.logo.withBackground} alt="" width={36} height={36} className="rounded-lg" />
            <span className="font-heading text-xl">Painel</span>
          </div>
          <AdminNav />
          <div className="mt-auto space-y-4">
            <div>
              <p className="mb-2 px-1 text-xs font-bold tracking-wider text-muted-foreground uppercase">Tema do painel</p>
              <AdminThemeToggle compact />
            </div>
            <Suspense fallback={<div className="h-14" />}>
              <UserBox />
            </Suspense>
          </div>
        </aside>
        <div className="min-w-0">
          <AdminMobileBar />
          {children}
        </div>
      </div>
    </TooltipProvider>
  );
}
