import { AsciiClouds } from "@/effects/ascii-clouds/AsciiClouds";

export default async function EffectsPage({
  searchParams,
}: {
  searchParams: Promise<{ cell?: string }>;
}) {
  const { cell } = await searchParams;
  return (
    <main className="effect-stage effect-stage--ascii-clouds" data-cell-style={cell === "terminal" ? "terminal" : "original"}>
      <AsciiClouds terminal={cell === "terminal"} />
    </main>
  );
}
