"use client";

import { useEffect, useRef } from "react";
import { drawTerminalCell, TERMINAL_CELL_GLYPHS } from "../terminal-cell";

const CELL = 24;
const LOOP_DURATION = 24_000;
const GLYPHS = ["h", "3", ">", "=", "+", "{", "#", "&", "[", "]"] as const;

type Point = { x: number; y: number };

function hash(value: number, seed = 0) {
  const result = Math.sin(value * 127.1 + seed * 311.7) * 43_758.5453;
  return result - Math.floor(result);
}

function smoothstep(value: number) {
  return value * value * (3 - 2 * value);
}

function advectedStoneNoise(
  progress: number,
  lateralDistance: number,
  cycle: number,
  seed: number,
) {
  const fade = (value: number) => value * value * (3 - 2 * value);
  const periodicHash = (x: number, y: number, localSeed: number) => {
    const wrappedX = ((x % 48) + 48) % 48;
    return hash(wrappedX * 131 + y * 17, localSeed);
  };
  const valueNoise = (x: number, y: number, localSeed: number) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const tx = fade(x - x0);
    const ty = fade(y - y0);
    const top = periodicHash(x0, y0, localSeed) * (1 - tx) +
      periodicHash(x0 + 1, y0, localSeed) * tx;
    const bottom = periodicHash(x0, y0 + 1, localSeed) * (1 - tx) +
      periodicHash(x0 + 1, y0 + 1, localSeed) * tx;
    return top * (1 - ty) + bottom * ty;
  };

  const travel = (progress - cycle * 1.5) * 32;
  const lateral = lateralDistance / CELL * 0.42;
  const broad = valueNoise(travel, lateral, seed);
  const detail = valueNoise(travel * 2, lateral * 2, seed + 11);
  return broad * 0.72 + detail * 0.28;
}

function cubicBezier(
  progress: number,
  start: Point,
  controlA: Point,
  controlB: Point,
  end: Point,
) {
  const inverse = 1 - progress;
  return {
    x:
      inverse ** 3 * start.x +
      3 * inverse ** 2 * progress * controlA.x +
      3 * inverse * progress ** 2 * controlB.x +
      progress ** 3 * end.x,
    y:
      inverse ** 3 * start.y +
      3 * inverse ** 2 * progress * controlA.y +
      3 * inverse * progress ** 2 * controlB.y +
      progress ** 3 * end.y,
  };
}

function drawCell(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  column: number,
  row: number,
  progress: number,
  lateralDistance: number,
  cycle: number,
  terminal: boolean,
) {
  const shade = advectedStoneNoise(progress, lateralDistance, cycle, 7.3);
  const accent = advectedStoneNoise(progress, lateralDistance + CELL * 2.7, cycle, 23.1);
  const colorSeed = hash(column * 71 + row, 17);
  const mint = accent > 0.73 && colorSeed > 0.34;
  const dark = !mint && shade + colorSeed * 0.12 > 0.58;
  const glyphs = terminal ? TERMINAL_CELL_GLYPHS : GLYPHS;
  const glyph = glyphs[Math.floor(hash(column * 97 + row, 29) * glyphs.length)] ?? "h";
  if (terminal) {
    drawTerminalCell(context, x, y, CELL, mint ? "accent" : dark ? "dark" : "light", glyph);
    return;
  }
  context.fillStyle = mint ? "#7742ff" : dark ? "#171717" : "#ffffff";
  context.fillRect(x, y, CELL, CELL);
  context.strokeStyle = mint ? "#5b2acc" : "#111111";
  context.lineWidth = 1;
  context.strokeRect(x, y, CELL, CELL);
  context.fillStyle = mint || dark ? "#ffffff" : "#111111";
  context.fillText(glyph, x + CELL / 2, y + CELL / 2 + 0.5);
}

function drawFlow(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  cycle: number,
  terminal: boolean,
) {
  const start = { x: Math.min(112, width * 0.13), y: -CELL * 2 };
  const controlA = { x: width * 0.08, y: height * 0.36 };
  const controlB = { x: width * 0.54, y: height * 0.88 };
  const end = { x: width + CELL * 2, y: height + CELL * 2 };

  const columns = Math.ceil(width / CELL);
  const rows = Math.ceil(height / CELL);
  const curveSamples = Array.from({ length: 81 }, (_, index) => {
    const progress = index / 80;
    return { progress, point: cubicBezier(progress, start, controlA, controlB, end) };
  });

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const centerX = column * CELL + CELL / 2;
      const centerY = row * CELL + CELL / 2;
      let nearestDistance = Number.POSITIVE_INFINITY;
      let nearestProgress = 0;

      for (const sample of curveSamples) {
        const distance = Math.hypot(centerX - sample.point.x, centerY - sample.point.y);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestProgress = sample.progress;
        }
      }

      const widthInCells = 3 + smoothstep(nearestProgress) * 7;
      const halfWidth = widthInCells * CELL / 2;
      const edgeReach = CELL * (1 + hash(column * 89 + row, 41) * 3);
      if (nearestDistance > halfWidth + edgeReach) continue;

      const outside = Math.max(0, nearestDistance - halfWidth);
      const edgeFactor = outside / Math.max(edgeReach, 1);
      const ending = smoothstep(Math.max(0, (nearestProgress - 0.74) / 0.26));
      const densityThreshold = 0.25 + edgeFactor * 0.57 + ending * 0.3;
      const stoneNoise = advectedStoneNoise(
        nearestProgress,
        nearestDistance,
        cycle,
        hash(column * 53 + row, 67) * 9,
      );
      if (stoneNoise < densityThreshold) continue;
      drawCell(
        context,
        column * CELL,
        row * CELL,
        column,
        row,
        nearestProgress,
        nearestDistance,
        cycle,
        terminal,
      );
    }
  }
}

export function ArcFlow({ terminal = false }: { terminal?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const drawingCanvas = canvas;
    const drawingContext = context;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
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
      const cycle = reduced ? 0.32 : (time % LOOP_DURATION) / LOOP_DURATION;
      drawingContext.clearRect(0, 0, width, height);
      if (terminal) {
        drawingContext.fillStyle = "#111214";
        drawingContext.fillRect(0, 0, width, height);
      }
      drawFlow(drawingContext, width, height, cycle, terminal);
      if (!reduced) frame = requestAnimationFrame(render);
    }

    resize();
    render(0);
    addEventListener("resize", resize);
    return () => {
      removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
    };
  }, [terminal]);

  return <canvas ref={canvasRef} className="effect-canvas" aria-hidden="true" />;
}
