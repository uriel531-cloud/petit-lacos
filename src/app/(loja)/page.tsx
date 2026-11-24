import { HomeSections } from "@/components/store/sections/home-sections";
import { getPublishedTheme } from "@/features/theme/queries";

export default async function HomePage() {
  const theme = await getPublishedTheme();
  return <HomeSections theme={theme} headerOverlay={theme.header.style === "transparente"} />;
}
