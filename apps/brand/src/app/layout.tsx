import type { Metadata } from "next";
import "@fontsource/dm-mono/400.css";
import "@fontsource-variable/manrope";
import { EffectNavigation } from "@/components/EffectNavigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "h3llo cloud — Облако, каким оно должно быть сегодня",
  description: "Kubernetes-нативное облако, полнофункциональный IaaS и ИИ-решения из коробки.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <EffectNavigation />
        {children}
      </body>
    </html>
  );
}
