import { ADMIN_THEME_SCRIPT, AdminThemeProvider } from "@/components/admin/admin-theme";

/** Tudo em /admin: aplica o tema claro/escuro do painel (a pré-visualização da loja fica de fora). */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Aplica o tema escuro antes de desenhar a tela, sem "piscar" */}
      <script dangerouslySetInnerHTML={{ __html: ADMIN_THEME_SCRIPT }} />
      <AdminThemeProvider>{children}</AdminThemeProvider>
    </>
  );
}
