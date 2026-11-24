import type { Permission, Role } from "@/generated/prisma/enums";

/**
 * Permissões padrão de cada perfil. O dono pode ligar/desligar permissões
 * individuais por usuário (tabela UserPermission), que têm prioridade sobre este padrão.
 */
export const ROLE_DEFAULT_PERMISSIONS: Record<Role, readonly Permission[]> = {
  DONO: [
    "GERENCIAR_PRODUTOS",
    "GERENCIAR_PEDIDOS",
    "VER_TODOS_PEDIDOS",
    "ALTERAR_MODO_VENDA",
    "EDITAR_TEMA",
    "PUBLICAR_TEMA",
    "GERENCIAR_CONTEUDO",
    "GERENCIAR_CUPONS",
    "VER_FINANCEIRO",
    "GERENCIAR_USUARIOS",
  ],
  VENDEDOR: ["GERENCIAR_PRODUTOS", "GERENCIAR_PEDIDOS", "ALTERAR_MODO_VENDA"],
  FUNCIONARIO: ["GERENCIAR_PRODUTOS", "GERENCIAR_PEDIDOS", "VER_TODOS_PEDIDOS", "ALTERAR_MODO_VENDA"],
  CLIENTE: [],
};

/** O dono sempre tem tudo; ninguém pode tirar permissões do dono. */
export function hasPermission(
  role: Role,
  permission: Permission,
  overrides: ReadonlyArray<{ permission: Permission; granted: boolean }> = [],
): boolean {
  if (role === "DONO") return true;
  if (role === "CLIENTE") return false;
  const override = overrides.find((o) => o.permission === permission);
  if (override) return override.granted;
  return ROLE_DEFAULT_PERMISSIONS[role].includes(permission);
}
