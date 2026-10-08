"use client";

import { useEffect, useState } from "react";
import { IconButton } from "@cloud/ui";

const widthModes = ["1680", "1920", "full"] as const;
type WidthMode = typeof widthModes[number];
const widthLabels: Record<WidthMode, string> = {
  "1680": "1680 px",
  "1920": "1920 px",
  full: "Вся ширина",
};

export function ConsoleWidthToggle() {
  const [width, setWidth] = useState<WidthMode>("full");

  useEffect(() => {
    const storedWidth = localStorage.getItem("prototype-width");
    const legacyLimited = localStorage.getItem("prototype-width-limited");
    const initialWidth: WidthMode = widthModes.find(mode => mode === storedWidth)
      ?? (storedWidth === null && legacyLimited === "true" ? "1680" : "full");
    setWidth(initialWidth);
    document.documentElement.dataset.consoleWidth = initialWidth;
    window.dispatchEvent(new Event("resize"));
  }, []);

  const nextWidth = widthModes[(widthModes.indexOf(width) + 1) % widthModes.length];

  function toggleWidth() {
    setWidth(nextWidth);
    document.documentElement.dataset.consoleWidth = nextWidth;
    localStorage.setItem("prototype-width", nextWidth);
    window.dispatchEvent(new Event("resize"));
  }

  const label = `Ширина: ${widthLabels[width]}. Переключить на ${widthLabels[nextWidth]}`;
  return <IconButton icon="columns-3" label={label} title={label} data-width-mode={width} onClick={toggleWidth} />;
}
