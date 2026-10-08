"use client";

import { useEffect, useRef, useState } from "react";
import { drawTerminalCell, TERMINAL_CELL_GLYPHS } from "../terminal-cell";

const CELL = 24;
const ROWS = 6;
const DURATION = 24_000;
const TAU = Math.PI * 2;
const GLYPHS = ["h", "3", ">", "=", "+", "{", "#", "&"] as const;

type CellData = {
  energy: number;
  color: number;
  traveler: "dark" | "mint" | null;
};
type Theme = "standard" | "phosphor";

function hash(column: number, row: number, seed = 0) {
  const value = Math.sin(column * 127.1 + row * 311.7 + seed * 91.3) * 43_758.5453;
  return value - Math.floor(value);
}

function smoothstep(value: number) {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
}

function oscillatorField(column: number, row: number, cycle: number) {
  const phase = cycle * TAU;
  const localPhase = hash(column, row, 11) * TAU;
  const groupPhase = hash(Math.floor(column / 3), Math.floor(row / 2), 37) * TAU;
  const neighboringPhase = hash(Math.floor((column + 2) / 4), Math.floor((row + 1) / 3), 61) * TAU;
  const local = Math.sin(phase * 3 + localPhase);
  const coupled = Math.sin(phase * 2 + groupPhase);
  const slowDrift = Math.cos(phase + neighboringPhase);
  return Math.max(0, Math.min(1, 0.5 + local * 0.23 + coupled * 0.18 + slowDrift * 0.09));
}

function travelerAt(
  column: number,
  row: number,
  columns: number,
  cycle: number,
): "dark" | "mint" | null {
  const x = (column + 0.5) / columns;
  const packets = [
    { phase: 0.08, lane: 1.2, drift: 1.35, color: "dark" as const },
    { phase: 0.44, lane: 3, drift: 1.8, color: "mint" as const },
    { phase: 0.76, lane: 4.5, drift: 1.45, color: "dark" as const },
  ];

  for (const packet of packets) {
    const packetX = (cycle * 2 + packet.phase) % 1;
    const directDistance = Math.abs(x - packetX);
    const horizontalDistance = Math.min(directDistance, 1 - directDistance) * columns;
    const packetRow = packet.lane + Math.sin((cycle * 3 + packet.phase) * TAU) * packet.drift;
    const verticalDistance = Math.abs(row - packetRow);
    const shape = horizontalDistance * horizontalDistance / 3.2 + verticalDistance * verticalDistance / 1.9;
    if (shape < 1 && hash(column, row, 137) > 0.22) return packet.color;
  }

  return null;
}

function drawCell(
  context: CanvasRenderingContext2D,
  column: number,
  row: number,
  top: number,
  data: CellData,
  cells: Map<string, CellData>,
  theme: Theme,
  terminal: boolean,
) {
  const x = column * CELL;
  const y = top + row * CELL;
  const mint = data.traveler === "mint" || (data.traveler === null && data.color > 0.8);
  const dark = data.traveler === "dark" || (data.traveler === null && !mint && data.energy > 0.68);
  const glyphs = terminal ? TERMINAL_CELL_GLYPHS : GLYPHS;
  const glyph = glyphs[Math.floor(hash(column, row, 41) * glyphs.length)] ?? "h";
  if (terminal) {
    drawTerminalCell(context, x, y, CELL, mint ? "accent" : dark ? "dark" : "light", glyph);
    return;
  }

  context.fillStyle = theme === "phosphor"
    ? dark ? "#c9ff68" : mint ? "#58753a" : "#26351f"
    : mint ? "#7742ff" : dark ? "#171717" : "#ffffff";
  context.fillRect(x, y, CELL, CELL);
  context.strokeStyle = theme === "phosphor"
    ? dark ? "#9fcf50" : "#597638"
    : mint ? "#5b2acc" : "#111111";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(x + 0.5, y + CELL);
  context.lineTo(x + 0.5, y + 0.5);
  context.lineTo(x + CELL, y + 0.5);
  if (!cells.has(`${column + 1}:${row}`)) {
    context.moveTo(x + CELL - 0.5, y);
    context.lineTo(x + CELL - 0.5, y + CELL);
  }
  if (!cells.has(`${column}:${row + 1}`)) {
    context.moveTo(x, y + CELL - 0.5);
    context.lineTo(x + CELL, y + CELL - 0.5);
  }
  context.stroke();

  context.fillStyle = theme === "phosphor"
    ? dark ? "#1b2618" : "#c9ff68"
    : mint || dark ? "#ffffff" : "#111111";
  context.fillText(glyph, x + CELL / 2, y + CELL / 2 + 0.5);
}

function draw(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  cycle: number,
  theme: Theme,
  terminal: boolean,
) {
  context.fillStyle = terminal ? "#111214" : theme === "phosphor" ? "#172018" : "#ffffff";
  context.fillRect(0, 0, width, height);
  const columns = Math.ceil(width / CELL);
  const top = Math.round((height - ROWS * CELL) / (CELL * 2)) * CELL;
  const cells = new Map<string, CellData>();

  for (let row = -3; row < ROWS + 3; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = columns <= 1 ? 1 : column / (columns - 1);
      const initialDensity = 0.32 + smoothstep(Math.pow(x, 1.18)) * 0.68;
      const fillPulse = (1 - Math.cos(cycle * TAU)) / 2;
      const coreDensity = initialDensity + (1 - initialDensity) * fillPulse;
      const edgeDistance = row < 0 ? -row : row >= ROWS ? row - ROWS + 1 : 0;
      const edgeChance = edgeDistance === 0 ? 1 : (0.48 - edgeDistance * 0.09);
      const density = coreDensity * edgeChance;
      const field = oscillatorField(column, row, cycle);
      const decision = field * 0.82 + hash(column, row, 73) * 0.18;
      const traveler = travelerAt(column, row, columns, cycle);
      const fullyPacked = edgeDistance === 0 && x > 0.96;
      const active = fullyPacked || decision < density || traveler !== null;
      if (!active) continue;

      cells.set(`${column}:${row}`, {
        energy: Math.max(field * 0.55 + coreDensity * 0.35, hash(column, row, 17) * (0.75 + x * 0.25)),
        color: (oscillatorField(column + 11, row + 3, cycle) + hash(column, row, 29)) / 2,
        traveler,
      });
    }
  }

  context.shadowColor = theme === "phosphor" ? "rgba(198, 255, 104, 0.55)" : "transparent";
  context.shadowBlur = theme === "phosphor" ? 5 : 0;
  for (const [key, data] of cells) {
    const [column, row] = key.split(":").map(Number) as [number, number];
    drawCell(context, column, row, top, data, cells, theme, terminal);
  }
  context.shadowBlur = 0;
}

export function EntropyFill({ terminal = false }: { terminal?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<Theme>("standard");

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const drawingCanvas = canvas;
    const drawingContext = context;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let disposed = false;
    let width = 0;
    let height = 0;

    function resize() {
      const ratio = Math.min(devicePixelRatio, 2);
      width = innerWidth;
      height = innerHeight;
      drawingCanvas.width = Math.round(width * ratio);
      drawingCanvas.height = Math.round(height * ratio);
      drawingCanvas.style.width = `${width}px`;
      drawingCanvas.style.height = `${height}px`;
      drawingContext.setTransform(ratio, 0, 0, ratio, 0, 0);
      drawingContext.font = '400 15px "DM Mono", monospace';
      drawingContext.textAlign = "center";
      drawingContext.textBaseline = "middle";
    }

    function render(time: number) {
      const cycle = reduced ? 0.17 : (time % DURATION) / DURATION;
      draw(drawingContext, width, height, cycle, theme, terminal);
      if (!disposed && !reduced) frame = requestAnimationFrame(render);
    }

    resize();
    render(0);
    addEventListener("resize", resize);
    return () => {
      disposed = true;
      removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
    };
  }, [theme, terminal]);

  return (
    <div className="phosphor-clouds" data-theme={theme}>
      <canvas ref={canvasRef} className="effect-canvas" aria-hidden="true" />
      {!terminal && <button
        className="effect-theme-toggle"
        type="button"
        onClick={() => setTheme((current) => current === "phosphor" ? "standard" : "phosphor")}
      >
        <span>Theme</span>
        <strong>{theme === "phosphor" ? "Phosphor" : "Standard"}</strong>
      </button>}
    </div>
  );
}
