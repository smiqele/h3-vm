"use client";

import { useEffect, useRef } from "react";
import { drawTerminalCell, TERMINAL_CELL_GLYPHS } from "../terminal-cell";

const CELL = 24;
const DURATION = 24_000;
const TAU = Math.PI * 2;
const GLYPHS = ["h", "3", ">", "=", "+", "{", "#", "&"] as const;
type Style = "dark" | "light" | "mint";
type NodePoint = { column: number; row: number };

const ANCHORS = [
  [0.1, 0.3], [0.27, 0.16], [0.47, 0.29], [0.68, 0.14], [0.87, 0.32],
  [0.18, 0.7], [0.39, 0.59], [0.59, 0.76], [0.79, 0.62], [0.48, 0.9],
] as const;
const EDGES = [
  [0, 1], [0, 5], [1, 2], [1, 6], [2, 3], [2, 6], [2, 7], [3, 4], [3, 8],
  [4, 8], [5, 6], [5, 9], [6, 7], [6, 9], [7, 8], [7, 9], [8, 9], [1, 5],
] as const;

function hash(x: number, y: number, seed = 0) {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 91.3) * 43_758.5453;
  return value - Math.floor(value);
}

function draw(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  cycle: number,
  terminal: boolean,
) {
  context.fillStyle = terminal ? "#111214" : "#ffffff";
  context.fillRect(0, 0, width, height);
  const columns = Math.ceil(width / CELL);
  const rows = Math.ceil(height / CELL);
  const angle = cycle * TAU;
  const points: NodePoint[] = ANCHORS.map(([anchorX, anchorY], index) => ({
    column: Math.round(
      anchorX * columns
      + Math.sin(angle * (index % 3 + 1) + index) * 3.2
      + Math.cos(angle * 2 - index * 0.43) * 1.1,
    ),
    row: Math.round(
      anchorY * rows
      + Math.cos(angle * (index % 2 + 1) - index * 0.7) * 2.4
      + Math.sin(angle * 3 + index) * 0.8,
    ),
  }));

  if (!terminal) EDGES.forEach(([startIndex, endIndex], edgeIndex) => {
    const life = (Math.sin(angle * (edgeIndex % 2 + 1) + edgeIndex * 1.71) + 1) / 2;
    if (life < 0.48) return;
    const start = points[startIndex]!;
    const end = points[endIndex]!;
    const opacity = 0.14 + ((life - 0.48) / 0.52) * 0.56;
    context.strokeStyle = `rgb(17 17 17 / ${opacity})`;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(start.column * CELL + CELL / 2, start.row * CELL + CELL / 2);
    context.lineTo(end.column * CELL + CELL / 2, end.row * CELL + CELL / 2);
    context.stroke();
  });

  const cells = new Map<string, Style>();
  const shapePools = [
    [[0, 0], [1, 0], [0, 1], [-1, 0], [1, 1]],
    [[0, 0], [0, -1], [1, 0], [1, -1], [-1, 0]],
    [[0, 0], [-1, 0], [0, 1], [-1, 1], [1, 0]],
    [[0, 0], [1, 0], [2, 0], [1, 1], [1, -1]],
    [[0, 0], [0, 1], [1, 1], [-1, 0], [0, -1]],
  ] as const;
  points.forEach((point, nodeIndex) => {
    const shape = shapePools[nodeIndex % shapePools.length]!;
    const morph = (Math.sin(angle * (nodeIndex % 2 + 1) + nodeIndex * 1.37) + 1) / 2;
    const cellCount = 1 + Math.floor(morph * 4.99);
    shape.slice(0, cellCount).forEach(([offsetColumn, offsetRow], cellIndex) => {
      const color = Math.sin(angle * 2 + nodeIndex * 1.19 + cellIndex * 2.03);
      const style: Style = color > 0.48 ? "mint" : color < -0.2 ? "dark" : "light";
      cells.set(`${point.column + offsetColumn}:${point.row + offsetRow}`, style);
    });
  });

  for (const [key, style] of cells) {
    const [column, row] = key.split(":").map(Number) as [number, number];
    if (terminal) {
      const glyphStep = Math.floor(cycle * 4) % 4;
      const glyph = TERMINAL_CELL_GLYPHS[Math.floor(hash(column, row, 53 + glyphStep * 17) * TERMINAL_CELL_GLYPHS.length)] ?? "h";
      drawTerminalCell(context, column * CELL, row * CELL, CELL, style === "mint" ? "accent" : style === "dark" ? "dark" : "light", glyph);
      continue;
    }
    context.fillStyle = style === "mint" ? "#78ffc6" : style === "dark" ? "#171717" : "#ffffff";
    context.fillRect(column * CELL, row * CELL, CELL, CELL);
  }
  if (terminal) return;
  for (const [key, style] of cells) {
    const [column, row] = key.split(":").map(Number) as [number, number];
    const x = column * CELL;
    const y = row * CELL;
    context.strokeStyle = style === "mint" ? "#38d992" : "#111111";
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
    const glyphStep = Math.floor(cycle * 4) % 4;
    const glyph = GLYPHS[Math.floor(hash(column, row, 53 + glyphStep * 17) * GLYPHS.length)] ?? "h";
    context.fillStyle = style === "dark" ? "#ffffff" : "#111111";
    context.fillText(glyph, x + CELL / 2, y + CELL / 2 + 0.5);
  }
}

export function CellGraph({ terminal = false }: { terminal?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
      draw(drawingContext, width, height, reduced ? 0.18 : (time % DURATION) / DURATION, terminal);
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
  }, [terminal]);
  return <canvas ref={canvasRef} className="effect-canvas" aria-hidden="true" />;
}
