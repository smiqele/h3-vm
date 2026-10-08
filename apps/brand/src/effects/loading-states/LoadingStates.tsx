"use client";

import { useEffect, useRef } from "react";
import { drawTerminalCell, TERMINAL_CELL_GLYPHS } from "../terminal-cell";

const CELL = 24;
const BLOCK = CELL * 3;
const GAP = CELL * 3;
const DURATION = 24_000;
const GLYPHS = ["h", "3", ">", "=", "+", "{", "#", "&"] as const;
type Style = "light" | "dark" | "mint";

function hash(x: number, y: number, seed = 0) {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 91.3) * 43_758.5453;
  return value - Math.floor(value);
}

function getStyle(block: number, column: number, row: number, seconds: number): Style {
  const index = row * 3 + column;
  const perimeter = [0, 1, 2, 5, 8, 7, 6, 3];

  if (block === 0) {
    const step = Math.floor(seconds / 0.3) % 8;
    if (index === perimeter[step]) return "mint";
    if (index === perimeter[(step + 7) % 8]) return "dark";
  }
  if (block === 1) {
    const filled = Math.floor((seconds % 3) / 3 * 10);
    if (index < filled) return index === filled - 1 ? "mint" : "dark";
  }
  if (block === 2) {
    const phase = Math.floor(seconds / 0.6) % 3;
    const distance = Math.abs(column - 1) + Math.abs(row - 1);
    if (distance === phase) return distance === 0 ? "mint" : "dark";
  }
  if (block === 3) {
    const phase = Math.floor(seconds / 0.75) % 2;
    const active = phase === 0 ? column === 1 : row === 1;
    if (active) return index === 4 ? "mint" : "dark";
  }
  if (block === 4) {
    const ring = Math.floor(seconds / 0.6) % 3;
    const distance = Math.max(Math.abs(column - 1), Math.abs(row - 1));
    if (distance === ring % 2) return distance === 0 ? "mint" : "dark";
  }
  if (block === 5) {
    const phase = Math.floor(seconds / 0.75) % 2;
    if ((column + row + phase) % 2 === 0) return index === 4 ? "mint" : "dark";
  }
  if (block === 6) {
    const diagonal = Math.floor(seconds / 0.45) % 5;
    if (column + row === diagonal) return column === 1 ? "mint" : "dark";
  }
  if (block === 7) {
    const snake = [0, 1, 2, 5, 8, 7, 6, 3, 4];
    const filled = Math.floor((seconds % 3) / 3 * 10);
    const position = snake.indexOf(index);
    if (position < filled) return position === filled - 1 ? "mint" : "dark";
  }
  if (block === 8) {
    const arms = [[1, 0], [2, 1], [1, 2], [0, 1]];
    const step = Math.floor(seconds / 0.4) % 4;
    if (index === 4) return "dark";
    if (column === arms[step]![0] && row === arms[step]![1]) return "mint";
  }
  if (block === 9) {
    const phase = Math.floor(seconds / 0.65) % 3;
    const corners = [0, 2, 6, 8];
    const edges = [1, 3, 5, 7];
    if (phase === 0 && corners.includes(index)) return index === 0 ? "mint" : "dark";
    if (phase === 1 && edges.includes(index)) return index === 1 ? "mint" : "dark";
    if (phase === 2 && index === 4) return "mint";
  }
  if (block === 10) {
    const step = Math.floor(seconds / 0.35) % 8;
    const position = perimeter.indexOf(index);
    if (position >= 0 && position !== step && position !== (step + 1) % 8) {
      return position === (step + 4) % 8 ? "mint" : "dark";
    }
  }
  if (block === 11) {
    const phase = Math.floor(seconds / 0.8) % 3;
    const frames = [
      [1, 3, 4, 5, 7],
      [0, 2, 4, 6, 8],
      [0, 1, 2, 3, 5, 6, 7, 8],
    ];
    if (frames[phase]!.includes(index)) return index === 4 ? "mint" : "dark";
  }

  return "light";
}

function drawBlock(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  block: number,
  seconds: number,
  terminal: boolean,
) {
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      const style = getStyle(block, column, row, seconds);
      if (terminal) {
        const glyph = TERMINAL_CELL_GLYPHS[Math.floor(hash(block * 3 + column, row, 47) * TERMINAL_CELL_GLYPHS.length)] ?? "h";
        drawTerminalCell(context, x + column * CELL, y + row * CELL, CELL, style === "mint" ? "accent" : style === "dark" ? "dark" : "light", glyph);
        continue;
      }
      context.fillStyle = style === "mint" ? "#78ffc6" : style === "dark" ? "#171717" : "#ffffff";
      context.fillRect(x + column * CELL, y + row * CELL, CELL, CELL);
    }
  }

  if (!terminal) {
  context.strokeStyle = "#111111";
  context.lineWidth = 1;
  context.beginPath();
  for (let line = 0; line <= 3; line += 1) {
    context.moveTo(x + line * CELL + 0.5, y);
    context.lineTo(x + line * CELL + 0.5, y + BLOCK);
    context.moveTo(x, y + line * CELL + 0.5);
    context.lineTo(x + BLOCK, y + line * CELL + 0.5);
  }
  context.stroke();
  }

  if (terminal) return;
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      const style = getStyle(block, column, row, seconds);
      const glyph = GLYPHS[Math.floor(hash(block * 3 + column, row, 47) * GLYPHS.length)] ?? "h";
      context.fillStyle = style === "dark" ? "#ffffff" : "#111111";
      context.fillText(glyph, x + column * CELL + CELL / 2, y + row * CELL + CELL / 2 + 0.5);
    }
  }
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
  const gridWidth = BLOCK * 4 + GAP * 3;
  const gridHeight = BLOCK * 3 + GAP * 2;
  const left = Math.round((width - gridWidth) / (CELL * 2)) * CELL;
  const top = Math.round((height - gridHeight) / (CELL * 2)) * CELL;
  const seconds = cycle * DURATION / 1000;

  for (let block = 0; block < 12; block += 1) {
    const column = block % 4;
    const row = Math.floor(block / 4);
    drawBlock(
      context,
      left + column * (BLOCK + GAP),
      top + row * (BLOCK + GAP),
      block,
      seconds,
      terminal,
    );
  }
}

export function LoadingStates({ terminal = false }: { terminal?: boolean }) {
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
