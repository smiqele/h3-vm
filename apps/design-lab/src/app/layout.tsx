import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "./tokens.generated.css";
import "./globals.css";
import { DesignLabHeader } from "@/components/DesignLabHeader";

export const metadata: Metadata = { title: "h3llo cloud — Design Lab", description: "Executable UI, UX and CJM documentation" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru" data-theme="dark"><body><DesignLabHeader/>{children}</body></html>;
}
