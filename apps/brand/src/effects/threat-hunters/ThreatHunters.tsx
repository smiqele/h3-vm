"use client";

import { useEffect, useRef } from "react";
import { drawTerminalCell, TERMINAL_CELL_GLYPHS } from "../terminal-cell";

const CELL = 24;
const DURATION = 24_000;
const TAU = Math.PI * 2;
const GLYPHS = ["h", "3", ">", "=", "+", "{", "#", "&"] as const;
type CellStyle = "dark" | "light" | "mint" | "threat";
type Incident = {
  phase: number;
  threatX: number;
  threatY: number;
  hunterX: number;
  hunterY: number;
  radiusX: number;
  radiusY: number;
};

function hash(x: number, y: number, seed = 0) {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 91.3) * 43_758.5453;
  return value - Math.floor(value);
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

function ease(value: number) {
  const clamped = clamp(value);
  return clamped * clamped * (3 - 2 * clamped);
}

function getIncident(index: number, cycle: number, width: number, height: number): Incident {
  const phase = (cycle + index * 0.23) % 1;
  const travel = ease(phase / 0.76);
  const pursuit = ease((phase - 0.08) / 0.62);
  const paths = [
    { start: [-0.08, 0.24], end: [0.63, 0.38], hunter: [0.23, 0.72] },
    { start: [1.08, 0.66], end: [0.35, 0.57], hunter: [0.76, 0.2] },
    { start: [0.72, -0.1], end: [0.57, 0.62], hunter: [0.2, 0.31] },
    { start: [0.3, 1.1], end: [0.46, 0.34], hunter: [0.82, 0.78] },
  ] as const;
  const path = paths[index % paths.length]!;
  const bend = Math.sin(travel * Math.PI) * (index % 2 === 0 ? 0.08 : -0.07);
  const threatNX = path.start[0] + (path.end[0] - path.start[0]) * travel
    + (index < 2 ? 0 : bend);
  const threatNY = path.start[1] + (path.end[1] - path.start[1]) * travel
    + (index < 2 ? bend : 0);
  const hunterNX = path.hunter[0] + (threatNX - path.hunter[0]) * pursuit;
  const hunterNY = path.hunter[1] + (threatNY - path.hunter[1]) * pursuit;

  return {
    phase,
    threatX: threatNX * width,
    threatY: threatNY * height,
    hunterX: hunterNX * width,
    hunterY: hunterNY * height,
    radiusX: CELL * (5.2 + index * 0.65),
    radiusY: CELL * (3.4 + (index % 2) * 0.8),
  };
}

function drawCells(
  context: CanvasRenderingContext2D,
  cells: Map<string, CellStyle>,
  terminal: boolean,
) {
  for (const [key, style] of cells) {
    const [column, row] = key.split(":").map(Number) as [number, number];
    const x = column * CELL;
    const y = row * CELL;
    if (terminal) {
      const glyph = style === "threat" ? "*" : TERMINAL_CELL_GLYPHS[Math.floor(hash(column, row, 79) * TERMINAL_CELL_GLYPHS.length)] ?? "h";
      drawTerminalCell(context, x, y, CELL, style === "threat" ? "danger" : style === "mint" ? "accent" : style === "dark" ? "dark" : "light", glyph);
      continue;
    }
    context.fillStyle = style === "threat"
      ? "#ff3b30"
      : style === "mint"
        ? "#78ffc6"
        : style === "dark"
          ? "#171717"
          : "#ffffff";
    context.fillRect(x, y, CELL, CELL);
  }

  if (terminal) return;

  for (const [key, style] of cells) {
    const [column, row] = key.split(":").map(Number) as [number, number];
    const x = column * CELL;
    const y = row * CELL;
    context.strokeStyle = style === "threat" ? "#a81712" : "#111111";
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

    const glyph = style === "threat"
      ? "*"
      : GLYPHS[Math.floor(hash(column, row, 79) * GLYPHS.length)] ?? "h";
    context.fillStyle = style === "dark" || style === "threat" ? "#ffffff" : "#111111";
    context.fillText(glyph, x + CELL / 2, y + CELL / 2 + 0.5);
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
  const columns = Math.ceil(width / CELL);
  const rows = Math.ceil(height / CELL);
  const incidents = Array.from({ length: 4 }, (_, index) => getIncident(index, cycle, width, height));
  const cells = new Map<string, CellStyle>();

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const centerX = column * CELL + CELL / 2;
      const centerY = row * CELL + CELL / 2;
      let strongest = 0;
      let incidentIndex = 0;
      incidents.forEach((incident, index) => {
        if (incident.phase > 0.9) return;
        const dx = (centerX - incident.hunterX) / incident.radiusX;
        const dy = (centerY - incident.hunterY) / incident.radiusY;
        const distance = Math.hypot(dx, dy);
        if (distance > 1.15) return;
        const angle = Math.atan2(dy, dx);
        const interference = (Math.sin(distance * 14 - incident.phase * TAU + angle * (3 + index)) + 1) / 2;
        const texture = hash(column, row, 29 + index * 17);
        const life = ease(incident.phase / 0.12) * (1 - ease((incident.phase - 0.76) / 0.14));
        const strength = (1 - distance / 1.15) * 0.42 + interference * 0.32 + texture * 0.26;
        if (strength * life > strongest) {
          strongest = strength * life;
          incidentIndex = index;
        }
      });
      if (strongest < 0.43) continue;
      const color = hash(column, row, 101 + incidentIndex * 23);
      const style: CellStyle = color > 0.76 ? "mint" : color > 0.42 ? "dark" : "light";
      cells.set(`${column}:${row}`, style);
    }
  }

  incidents.forEach((incident) => {
    if (incident.phase >= 0.77) return;
    const column = Math.floor(incident.threatX / CELL);
    const row = Math.floor(incident.threatY / CELL);
    if (column >= 0 && column < columns && row >= 0 && row < rows) {
      cells.set(`${column}:${row}`, "threat");
    }
  });

  for (const incident of incidents) {
    if (incident.phase < 0.69 || incident.phase > 0.8) continue;
    const centerColumn = Math.floor(incident.threatX / CELL);
    const centerRow = Math.floor(incident.threatY / CELL);
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy], index) => {
      if (hash(centerColumn + dx, centerRow + dy, 151) < 0.34) return;
      cells.set(`${centerColumn + dx}:${centerRow + dy}`, index === 0 ? "mint" : index === 1 ? "dark" : "light");
    });
  }

  drawCells(context, cells, terminal);
}

export function ThreatHunters({ terminal = false }: { terminal?: boolean }) {
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
      draw(drawingContext, width, height, reduced ? 0.16 : (time % DURATION) / DURATION, terminal);
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
