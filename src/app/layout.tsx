import type { Metadata, Viewport } from "next";

import { siteConfig } from "@/config/site";
import { fontVariablesClassName } from "@/features/theme/fonts";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: `${siteConfig.name} · Laços e acessórios infantis`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: siteConfig.name,
  },
};

export const viewport: Viewport = {
  themeColor: "#cedeeb",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: o script do painel pode pôr a classe "dark" no <html> antes do React
    <html lang="pt-BR" className={`${fontVariablesClassName} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
