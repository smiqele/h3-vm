import type { Metadata } from "next";
import { IaasLanding } from "./IaasLanding";

export const metadata: Metadata = {
  title: "h3llo cloud — Сильное железо. Простое облако.",
  description: "Публичное облако для ваших приложений. Современное оборудование, понятные условия и поддержка 24/7. Знакомьтесь с концепцией h3llo cloud.",
};

export default function Page() {
  return <IaasLanding />;
}
