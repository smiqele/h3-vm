"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { effects } from "@/effects/catalog";

export function EffectNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [cellStyle, setCellStyle] = useState<"original" | "terminal">("original");
  const currentEffect = effects.find((effect) =>
    pathname.endsWith(`/effects/${effect.id}`),
  );

  useEffect(() => {
    setCellStyle(new URLSearchParams(window.location.search).get("cell") === "terminal" ? "terminal" : "original");
  }, [pathname]);

  if (!pathname.startsWith("/effects")) return null;

  const effectPath = currentEffect ? `/effects/${currentEffect.id}` : "/effects/";
  const withCellStyle = (path: string, style = cellStyle) =>
    style === "terminal" ? `${path}?cell=terminal` : path;

  return (
    <div className="effect-navigation">
      <label><span>Effect</span>
        <select
          aria-label="Effect"
          value={currentEffect?.id ?? effects[0].id}
          onChange={(event) => router.push(withCellStyle(`/effects/${event.target.value}`))}
        >
          {effects.map((effect) => (
            <option key={effect.id} value={effect.id}>{effect.title}</option>
          ))}
        </select>
      </label>
      <label><span>Cell</span>
        <select
          aria-label="Cell"
          value={cellStyle}
          onChange={(event) => {
            const style = event.target.value as "original" | "terminal";
            setCellStyle(style);
            router.push(withCellStyle(effectPath, style));
          }}
        >
          <option value="original">Original</option>
          <option value="terminal">Terminal v1</option>
        </select>
      </label>
    </div>
  );
}
