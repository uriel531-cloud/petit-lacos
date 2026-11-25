"use client";

import { Brush, LayoutDashboard, Package, Settings2, ShoppingCart, Store, Tags, Truck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Início", icon: LayoutDashboard, ready: true },
  { href: "/admin/aparencia", label: "Aparência", icon: Brush, ready: true },
  { href: "/admin/produtos", label: "Produtos", icon: Package, ready: true },
  { href: "#", label: "Pedidos", icon: ShoppingCart, ready: false, phase: "Fase 7" },
  { href: "#", label: "Cupons", icon: Tags, ready: false, phase: "Fase 4" },
  { href: "#", label: "Modo de venda", icon: Truck, ready: false, phase: "Fase 5" },
  { href: "#", label: "Usuários", icon: Users, ready: false, phase: "Fase 2" },
  { href: "#", label: "Configurações", icon: Settings2, ready: false, phase: "Fase 5" },
] as const;

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Painel" className="grid gap-1">
      {ITEMS.map((item) => {
        const active = item.ready && (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href));
        const Icon = item.icon;
        if (!item.ready) {
          return (
            <span key={item.label} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground/70" aria-disabled>
              <Icon className="size-4" aria-hidden />
              {item.label}
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-semibold">{item.phase}</span>
            </span>
          );
        }
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            <Icon className="size-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
      <Link href="/" target="_blank" className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted">
        <Store className="size-4" aria-hidden />
        Ver loja
      </Link>
    </nav>
  );
}
