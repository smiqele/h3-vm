import { LESS_LIME_GLYPHS, LESS_LIME_GLYPH_OFFSETS } from "./math-clouds/glyphs";

export const TERMINAL_CELL_GLYPHS = LESS_LIME_GLYPHS;

function hash(column: number, row: number, seed: number) {
  const value = Math.sin(column * 127.1 + row * 311.7 + seed * 91.3) * 43_758.5453;
  return value - Math.floor(value);
}

function drawInnerShadow(context: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, blur: number, offsetY = 0) {
  const margin = 36;
  context.save();
  context.beginPath();
  context.roundRect(x, y, size, size, 5);
  context.clip();
  context.shadowColor = color;
  context.shadowBlur = blur;
  context.shadowOffsetY = offsetY;
  context.fillStyle = "#ffffff";
  context.beginPath();
  context.rect(x - margin, y - margin, size + margin * 2, size + margin * 2);
  context.roundRect(x - 0.75, y - 0.75, size + 1.5, size + 1.5, 5.75);
  context.fill("evenodd");
  context.restore();
}

export function drawTerminalCell(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  tone: "light" | "dark" | "accent" | "danger",
  glyph: string,
) {
  const column = Math.round(x / size);
  const row = Math.round(y / size);
  const roll = hash(column, row, 613);
  const paletteIndex = tone === "danger" ? 4 : roll < 0.83 ? 0 : roll < 0.91 ? 1 : roll < 0.92 ? 2 : 3;
  const palette = [
    { fill: "#1e1e1e", ink: "#fff", highlight: "rgba(255,255,255,.1)", glow: "rgba(255,255,255,.1)", blur: 25, gradient: false },
    { fill: "#602be8", ink: "#fff", highlight: "rgba(255,255,255,.15)", glow: "rgba(255,255,255,.2)", blur: 10, gradient: true },
    { fill: "#c2ff29", ink: "rgba(14,14,14,.8)", highlight: "rgba(255,255,255,.5)", glow: "rgba(255,255,255,.7)", blur: 10, gradient: true },
    { fill: "#b2b2b2", ink: "rgba(14,14,14,.8)", highlight: "rgba(255,255,255,.5)", glow: "rgba(255,255,255,.4)", blur: 10, gradient: true },
    { fill: "#b8322a", ink: "#fff", highlight: "rgba(255,255,255,.18)", glow: "rgba(255,100,90,.28)", blur: 10, gradient: true },
  ] as const;
  const material = palette[paletteIndex] ?? palette[0];
  const inset = 1;
  const tileSize = size - 2;
  context.fillStyle = material.fill;
  context.beginPath();
  context.roundRect(x + inset, y + inset, tileSize, tileSize, 5);
  context.fill();
  if (material.gradient) {
    const gradient = context.createLinearGradient(0, y + inset, 0, y + inset + tileSize);
    gradient.addColorStop(0, "rgba(255,255,255,.1)");
    gradient.addColorStop(1, "rgba(0,0,0,.1)");
    context.fillStyle = gradient;
    context.fill();
  }
  drawInnerShadow(context, x + inset, y + inset, tileSize, material.glow, material.blur);
  drawInnerShadow(context, x + inset, y + inset, tileSize, material.highlight, 0, 1.75);
  const offset = LESS_LIME_GLYPH_OFFSETS[glyph] ?? { x: 0, y: 0 };
  const scale = size / 76;
  context.fillStyle = material.ink;
  context.fillText(glyph, x + size / 2 + offset.x * scale, y + size / 2 + 0.5 + offset.y * scale);
}
