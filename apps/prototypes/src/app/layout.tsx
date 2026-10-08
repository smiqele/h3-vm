import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "./tokens.generated.css";
import "./globals.css";

export const metadata: Metadata = { title: "h3llo cloud — Prototypes", description: "Product interface prototypes" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru" data-theme="dark"><body>{children}</body></html>;
}
