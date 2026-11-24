import { StoreShell } from "@/components/store/layout/store-shell";
import { getCategories } from "@/features/catalog/queries";
import { getPublicStoreSettings } from "@/features/store/settings";
import { getPublishedTheme } from "@/features/theme/queries";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [theme, settings, categories] = await Promise.all([getPublishedTheme(), getPublicStoreSettings(), getCategories()]);
  return (
    <StoreShell theme={theme} settings={settings} categories={categories}>
      {children}
    </StoreShell>
  );
}
