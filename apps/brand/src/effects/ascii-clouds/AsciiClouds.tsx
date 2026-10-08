"use client";

import { useEffect, useRef } from "react";
import { drawTerminalCell, TERMINAL_CELL_GLYPHS } from "../terminal-cell";

type CellStyle = {
  background: string;
  foreground: string;
  border: string;
};

type CloudMass = {
  phase: number;
  laps: number;
  y: number;
  radiusX: number;
  radiusY: number;
  drift: number;
};

type Point = { x: number; y: number };

export type ExclusionRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const CELL_SIZE = 24;
const LOOP_DURATION = 24_000;
const FULL_TURN = Math.PI * 2;
const GLYPHS = TERMINAL_CELL_GLYPHS;

const CELL_STYLES = {
  mint: { background: "#7742ff", foreground: "#ffffff", border: "#5b2acc" },
  light: { background: "#ffffff", foreground: "#111111", border: "#111111" },
  dark: { background: "#121212", foreground: "#ffffff", border: "#111111" },
} satisfies Record<string, CellStyle>;

const CLOUD_MASSES: CloudMass[] = [
  { phase: 0.02, laps: 1, y: 0.2, radiusX: 0.23, radiusY: 0.18, drift: 0.035 },
  { phase: 0.24, laps: 1, y: 0.38, radiusX: 0.3, radiusY: 0.24, drift: 0.026 },
  { phase: 0.49, laps: 1, y: 0.55, radiusX: 0.25, radiusY: 0.22, drift: 0.04 },
  { phase: 0.68, laps: 1, y: 0.73, radiusX: 0.34, radiusY: 0.27, drift: 0.03 },
  { phase: 0.86, laps: 1, y: 0.9, radiusX: 0.27, radiusY: 0.2, drift: 0.024 },
];

function wrap(value: number) {
  return ((value % 1) + 1) % 1;
}

function wrappedDistance(first: number, second: number) {
  const direct = Math.abs(first - second);
  return Math.min(direct, 1 - direct);
}

function hash(column: number, row: number, seed: number) {
  const value =
    Math.sin(column * 127.1 + row * 311.7 + seed * 91.3) * 43_758.5453;
  return value - Math.floor(value);
}

function periodicNoise(
  column: number,
  row: number,
  cycle: number,
  seed: number,
) {
  const angle = cycle * FULL_TURN;
  const first = Math.sin(
    column * 0.39 + Math.cos(angle) * 1.5 + seed * 0.71,
  );
  const second = Math.sin(
    row * 0.47 + Math.sin(angle) * 1.24 + seed * 1.13,
  );
  const third = Math.sin(
    (column + row) * 0.21 + angle * 2 + seed * 0.37,
  );
  const fourth = Math.sin(
    (column - row) * 0.13 - angle + seed * 1.91,
  );

  return (first + second + third + fourth + 4) / 8;
}

function getMassPosition(mass: CloudMass, cycle: number) {
  const angle = (cycle + mass.phase) * FULL_TURN;

  return {
    x: wrap(mass.phase + cycle * mass.laps),
    y: mass.y + Math.sin(angle) * mass.drift,
  };
}

function getCloudEnvelope(x: number, y: number, cycle: number) {
  let envelope = 0;

  for (const mass of CLOUD_MASSES) {
    const position = getMassPosition(mass, cycle);
    const horizontal = wrappedDistance(x, position.x) / mass.radiusX;
    const vertical = Math.abs(y - position.y) / mass.radiusY;
    const distance = Math.sqrt(horizontal * horizontal + vertical * vertical);
    const influence = Math.max(0, 1 - distance);
    envelope = Math.max(envelope, influence);
  }

  return envelope;
}

function getCellStyle(
  column: number,
  row: number,
  columns: number,
  rows: number,
  cycle: number,
): CellStyle | null {
  const x = (column + 0.5) / columns;
  const y = (row + 0.5) / rows;
  const envelope = getCloudEnvelope(x, y, cycle);
  const edgeNoise = periodicNoise(column, row, cycle, 2);
  const density = envelope * 0.84 + edgeNoise * 0.3;

  if (density > 0.46) {
    const shadeNoise = periodicNoise(column, row, cycle, 7);
    const colorNoise = periodicNoise(column, row, cycle, 23);
    const shadowBias = Math.max(0, y - 0.32) * 0.14;

    if (colorNoise > 0.76) {
      return CELL_STYLES.mint;
    }

    return shadeNoise + shadowBias > 0.61
      ? CELL_STYLES.dark
      : CELL_STYLES.light;
  }

  const mintNoise = periodicNoise(column, row, cycle, 13);
  const mintSeed = hash(column, row, 19);
  const nearCloud = envelope > 0.08;

  if (nearCloud && mintNoise > 0.7 && mintSeed > 0.58) {
    return CELL_STYLES.mint;
  }

  return null;
}

function drawCell(
  context: CanvasRenderingContext2D,
  column: number,
  row: number,
  style: CellStyle,
  terminal: boolean,
  offsetX = 0,
  offsetY = 0,
) {
  const x = column * CELL_SIZE + offsetX;
  const y = row * CELL_SIZE + offsetY;

  if (terminal) {
    const glyphIndex = Math.floor(hash(column, row, 31) * GLYPHS.length);
    const glyph = GLYPHS[glyphIndex] ?? "h";
    drawTerminalCell(context, x, y, CELL_SIZE, style === CELL_STYLES.mint ? "accent" : style === CELL_STYLES.dark ? "dark" : "light", glyph);
    return;
  } else {
    context.fillStyle = style.background;
    context.fillRect(x, y, CELL_SIZE, CELL_SIZE);
    context.strokeStyle = style.border;
    context.lineWidth = 1;
    context.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
  }

  const glyphIndex = Math.floor(hash(column, row, 31) * GLYPHS.length);
  const glyph = GLYPHS[glyphIndex] ?? "h";
  context.fillStyle = style.foreground;
  context.fillText(glyph, x + CELL_SIZE / 2, y + CELL_SIZE / 2 + 1);
}

function drawField(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  cycle: number,
  exclusion?: ExclusionRect,
  pointerCutout?: Point,
  hiddenCells?: Map<string, number>,
  time = 0,
  terminal = false,
) {
  const columns = Math.ceil(width / CELL_SIZE);
  const rows = Math.ceil(height / CELL_SIZE);

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const cellX = column * CELL_SIZE;
      const cellY = row * CELL_SIZE;
      if (
        exclusion &&
        cellX < exclusion.x + exclusion.width &&
        cellX + CELL_SIZE > exclusion.x &&
        cellY < exclusion.y + exclusion.height &&
        cellY + CELL_SIZE > exclusion.y
      ) {
        continue;
      }
      const cellKey = `${column}:${row}`;
      let cutOutByPointer = false;
      if (pointerCutout) {
        const pointerColumn = Math.floor(pointerCutout.x / CELL_SIZE);
        const pointerRow = Math.floor(pointerCutout.y / CELL_SIZE);
        const deltaColumn = Math.abs(column - pointerColumn);
        const deltaRow = Math.abs(row - pointerRow);
        const isCenter = deltaColumn === 0 && deltaRow === 0;
        const isChaoticNeighbor =
          deltaColumn <= 1 &&
          deltaRow <= 1 &&
          hash(column, row, pointerColumn * 7 + pointerRow * 13) > 0.48;
        cutOutByPointer = isCenter || isChaoticNeighbor;
        if (cutOutByPointer && hiddenCells) {
          const delay = 2_000 + hash(column, row, 59) * 3_000;
          hiddenCells.set(cellKey, time + delay);
        }
      }
      if (cutOutByPointer || (hiddenCells?.get(cellKey) ?? 0) > time) continue;

      const style = getCellStyle(column, row, columns, rows, cycle);
      if (style) {
        drawCell(context, column, row, style, terminal);
      }
    }
  }
}

export type AsciiCloudsProps = {
  terminal?: boolean;
  hideAtPointer?: boolean;
  getExclusion?: (
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => ExclusionRect;
  overlay?: (
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => void;
};

export function AsciiClouds({ getExclusion, overlay, hideAtPointer = false, terminal = false }: AsciiCloudsProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const drawingCanvas = canvas;
    const drawingContext = context;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let disposed = false;
    let frameId = 0;
    let width = 0;
    let height = 0;
    let pointerActive = false;
    let pointer: Point = { x: 0, y: 0 };
    const hiddenCells = new Map<string, number>();

    function movePointer(event: PointerEvent) {
      pointerActive = event.pointerType === "mouse" || event.pointerType === "pen";
      pointer = { x: event.clientX, y: event.clientY };
    }

    function leavePointer() {
      pointerActive = false;
    }

    function resize() {
      const pixelRatio = Math.min(window.devicePixelRatio, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      drawingCanvas.width = Math.round(width * pixelRatio);
      drawingCanvas.height = Math.round(height * pixelRatio);
      drawingCanvas.style.width = `${width}px`;
      drawingCanvas.style.height = `${height}px`;
      drawingContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drawingContext.font = '400 17px "DM Mono"';
      drawingContext.textAlign = "center";
      drawingContext.textBaseline = "middle";
    }

    function render(time: number) {
      const cycle = reducedMotion ? 0.18 : (time % LOOP_DURATION) / LOOP_DURATION;
      drawingContext.clearRect(0, 0, width, height);
      if (terminal) {
        drawingContext.fillStyle = "#111214";
        drawingContext.fillRect(0, 0, width, height);
      }
      const exclusion = getExclusion?.(drawingContext, width, height);
      for (const [cellKey, hiddenUntil] of hiddenCells) {
        if (hiddenUntil <= time) hiddenCells.delete(cellKey);
      }
      drawField(
        drawingContext,
        width,
        height,
        cycle,
        exclusion,
        hideAtPointer && pointerActive ? pointer : undefined,
        hideAtPointer ? hiddenCells : undefined,
        time,
        terminal,
      );
      overlay?.(drawingContext, width, height);

      if (!reducedMotion && !disposed) {
        frameId = window.requestAnimationFrame(render);
      }
    }

    async function start() {
      await document.fonts.ready;
      if (disposed) return;

      resize();
      render(0);
      window.addEventListener("resize", resize);
      if (hideAtPointer) {
        window.addEventListener("pointermove", movePointer);
        document.documentElement.addEventListener("pointerleave", leavePointer);
      }
    }

    void start();

    return () => {
      disposed = true;
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", movePointer);
      document.documentElement.removeEventListener("pointerleave", leavePointer);
      window.cancelAnimationFrame(frameId);
    };
  }, [getExclusion, overlay, hideAtPointer, terminal]);

  return <canvas ref={canvasRef} className="effect-canvas" aria-hidden="true" />;
}
