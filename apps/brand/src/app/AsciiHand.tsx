"use client";

import { useEffect, useRef } from "react";

const columns = 78;
const rows = 30;
const cellWidth = 12;
const cellHeight = 18;
const glyphs = "·:h30@";

export function AsciiHand({ className }: { className: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    const sample = document.createElement("canvas");
    sample.width = columns;
    sample.height = rows;
    const sampleContext = sample.getContext("2d", { willReadFrequently: true });
    if (!context || !sampleContext) return;

    canvas.width = columns * cellWidth;
    canvas.height = rows * cellHeight;
    context.font = `16px "CoFo Sans Mono VF Trial", monospace`;
    context.textBaseline = "top";

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const draw = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        sampleContext.drawImage(video, 0, 0, columns, rows);
        const pixels = sampleContext.getImageData(0, 0, columns, rows).data;
        context.clearRect(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < rows; y += 1) {
          for (let x = 0; x < columns; x += 1) {
            const offset = (y * columns + x) * 4;
            const luminance = pixels[offset] * .2126 + pixels[offset + 1] * .7152 + pixels[offset + 2] * .0722;
            if (luminance < 48) continue;
            const strength = Math.min(1, (luminance - 48) / 207);
            const glyph = glyphs[Math.min(glyphs.length - 1, Math.floor(strength * glyphs.length))];
            context.fillStyle = `rgba(255,255,255,${.24 + strength * .76})`;
            context.fillText(glyph, x * cellWidth, y * cellHeight);
          }
        }
      }

      if (!reducedMotion) frame = window.requestAnimationFrame(draw);
    };

    const start = () => {
      void video.play().catch(() => undefined);
      draw();
    };
    video.addEventListener("loadeddata", start, { once: true });
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) start();

    return () => {
      video.removeEventListener("loadeddata", start);
      window.cancelAnimationFrame(frame);
      video.pause();
    };
  }, []);

  return <span className={className} aria-hidden="true">
    <video ref={videoRef} src="/final/ascii-hand.mp4" muted loop playsInline preload="auto" />
    <canvas ref={canvasRef} />
  </span>;
}
