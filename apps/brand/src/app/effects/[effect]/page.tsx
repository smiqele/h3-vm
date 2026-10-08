import { notFound } from "next/navigation";
import { effects, getEffect } from "@/effects/catalog";
import { effectComponents } from "@/effects/registry";

export function generateStaticParams() {
  return effects.map((effect) => ({ effect: effect.id }));
}

export default async function EffectPage({
  params,
  searchParams,
}: {
  params: Promise<{ effect: string }>;
  searchParams: Promise<{ cell?: string }>;
}) {
  const { effect: effectId } = await params;
  const { cell } = await searchParams;
  const effect = getEffect(effectId);

  if (!effect) notFound();

  const Effect = effectComponents[effect.id];

  return (
    <main className={`effect-stage effect-stage--${effect.id}`} data-cell-style={cell === "terminal" ? "terminal" : "original"}>
      <Effect terminal={cell === "terminal"} />
    </main>
  );
}
