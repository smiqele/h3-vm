"use client";

import { useEffect, useRef, useState } from "react";
import { drawTerminalCell, TERMINAL_CELL_GLYPHS } from "../terminal-cell";

const CELL = 24;
const DOT_RADIUS = 1;
const DURATION = 24_000;
const TAU = Math.PI * 2;
const GLYPHS = ["h", "3", ">", "=", "+", "{", "#", "&"] as const;
type CellStyle = "dark" | "mint" | "light";
type Theme = "standard" | "phosphor";

function hash(column: number, row: number, seed = 0) {
  const value = Math.sin(column * 127.1 + row * 311.7 + seed * 91.3) * 43_758.5453;
  return value - Math.floor(value);
}

function wrappedDistance(value: number, center: number, period: number) {
  const direct = Math.abs(value - center);
  return Math.min(direct, Math.abs(value - center + period), Math.abs(value - center - period));
}

function getMovingCell(
  column: number,
  row: number,
  columns: number,
  height: number,
  cycle: number,
): CellStyle | null {
  const x = column * CELL + CELL / 2;
  const y = row * CELL + CELL / 2;
  const period = height + CELL * 16;
  const groups = [
    { phase: 0.01, lane: 0.12, radiusX: 4.1, radiusY: 2.4, lobes: 3, skew: 0.18 },
    { phase: 0.15, lane: 0.34, radiusX: 5.4, radiusY: 2.1, lobes: 2, skew: -0.32 },
    { phase: 0.29, lane: 0.67, radiusX: 3.3, radiusY: 3.4, lobes: 5, skew: 0.08 },
    { phase: 0.43, lane: 0.88, radiusX: 4.6, radiusY: 2.7, lobes: 4, skew: 0.38 },
    { phase: 0.57, lane: 0.48, radiusX: 3.7, radiusY: 2.2, lobes: 6, skew: -0.16 },
    { phase: 0.71, lane: 0.22, radiusX: 5.8, radiusY: 3.1, lobes: 3, skew: 0.27 },
    { phase: 0.85, lane: 0.76, radiusX: 4.2, radiusY: 3.8, lobes: 7, skew: -0.24 },
  ];

  let strongest = 0;
  let groupIndex = 0;
  for (let index = 0; index < groups.length; index += 1) {
    const group = groups[index]!;
    const centerY = -CELL * 8 + ((cycle + group.phase) % 1) * period;
    const centerX = columns * CELL * group.lane
      + Math.sin((cycle * 2 + group.phase) * TAU) * CELL * 2.2;
    const rawDx = (x - centerX) / (group.radiusX * CELL);
    const dy = wrappedDistance(y, centerY, period) / (group.radiusY * CELL);
    const dx = rawDx + dy * group.skew;
    const angle = Math.atan2(dy, dx);
    const lobeWarp = 1 + Math.sin(angle * group.lobes + index * 1.31) * (0.08 + (index % 3) * 0.035);
    const distance = Math.hypot(dx, dy) * lobeWarp;
    const interference =
      Math.sin(distance * (13 + index % 4 * 2) - cycle * TAU + index * 1.7) * 0.11
      + Math.cos(angle * group.lobes + group.phase * TAU) * 0.1;
    const granular = (hash(column, row, index * 19) - 0.5) * 0.18;
    const strength = 1 - distance + interference + granular;
    if (strength > strongest) {
      strongest = strength;
      groupIndex = index;
    }
  }

  if (strongest < 0.17) return null;
  const color = hash(column, row, groupIndex * 31);
  if (color > 0.78) return "mint";
  if (color > 0.43) return "dark";
  return "light";
}

function drawGrid(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  cycle: number,
  theme: Theme,
  terminal: boolean,
) {
  const columns = Math.ceil(width / CELL);
  const rows = Math.ceil(height / CELL);
  const movingCells = new Map<string, CellStyle>();

  context.fillStyle = terminal ? "#111214" : theme === "phosphor" ? "#172018" : "#ffffff";
  context.fillRect(0, 0, width, height);

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const style = getMovingCell(column, row, columns, height, cycle);
      if (!style) continue;
      movingCells.set(`${column}:${row}`, style);
      if (terminal) {
        const glyph = TERMINAL_CELL_GLYPHS[Math.floor(hash(column, row, 47) * TERMINAL_CELL_GLYPHS.length)] ?? "h";
        drawTerminalCell(context, column * CELL, row * CELL, CELL, style === "mint" ? "accent" : style === "dark" ? "dark" : "light", glyph);
        continue;
      }
      context.fillStyle = theme === "phosphor"
        ? style === "dark" ? "#c9ff68" : style === "mint" ? "#58753a" : "#26351f"
        : style === "mint" ? "#7742ff" : style === "dark" ? "#171717" : "#ffffff";
      context.fillRect(column * CELL, row * CELL, CELL, CELL);
    }
  }

  if (terminal) return;
  context.strokeStyle = theme === "phosphor" ? "#597638" : "#111111";
  context.lineWidth = 1;
  context.beginPath();
  for (let column = 0; column <= columns; column += 1) {
    const x = column * CELL + 0.5;
    context.moveTo(x, 0);
    context.lineTo(x, height);
  }
  for (let row = 0; row <= rows; row += 1) {
    const y = row * CELL + 0.5;
    context.moveTo(0, y);
    context.lineTo(width, y);
  }
  context.stroke();

  context.shadowColor = theme === "phosphor" ? "rgba(198, 255, 104, 0.5)" : "transparent";
  context.shadowBlur = theme === "phosphor" ? 4 : 0;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const movingStyle = movingCells.get(`${column}:${row}`);
      if (movingStyle) {
        const glyph = GLYPHS[Math.floor(hash(column, row, 47) * GLYPHS.length)] ?? "h";
        context.fillStyle = theme === "phosphor"
          ? movingStyle === "dark" ? "#1b2618" : "#c9ff68"
          : movingStyle === "mint" || movingStyle === "dark" ? "#ffffff" : "#111111";
        context.fillText(glyph, column * CELL + CELL / 2, row * CELL + CELL / 2 + 0.5);
        continue;
      }
      context.fillStyle = theme === "phosphor" ? "#789b49" : "#111111";
      context.beginPath();
      context.arc(
        column * CELL + CELL / 2,
        row * CELL + CELL / 2,
        DOT_RADIUS,
        0,
        Math.PI * 2,
      );
      context.fill();
    }
  }
  context.shadowBlur = 0;
}

export function DotMatrix({ terminal = false }: { terminal?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoBlockRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<Theme>("standard");

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const drawingCanvas = canvas;
    const drawingContext = context;
    const logoBlock = logoBlockRef.current;
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
      if (logoBlock) {
        logoBlock.style.left = `${Math.round((width - CELL * 7) / (CELL * 2)) * CELL}px`;
        logoBlock.style.top = `${Math.round((height - CELL) / (CELL * 2)) * CELL}px`;
      }
    }

    function render(time: number) {
      const cycle = reduced ? 0.18 : (time % DURATION) / DURATION;
      drawGrid(drawingContext, width, height, cycle, theme, terminal);
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
      {!terminal && <div ref={logoBlockRef} className="dot-matrix-logo-block">
        <img className="dot-matrix-logo" src="/_logo.svg" alt="h3llo cloud" />
      </div>}
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
