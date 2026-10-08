"use client";

import { useEffect, useRef, useState } from "react";
import { VoronoiPulse } from "../math-clouds/MathClouds";

const CELL = 24;
const LOOP_DURATION = 24_000;
const GLYPHS = ["h", "3", ">", "=", "+", "{", "#", "&", "[", "]"];

const SHADER = `
struct Uniforms {
  resolution: vec2f,
  phase: f32,
  cell: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var glyphTexture: texture_2d<f32>;
@group(0) @binding(2) var glyphSampler: sampler;

fn hash(value: vec2f, seed: f32) -> f32 {
  return fract(sin(dot(value, vec2f(127.1, 311.7)) + seed * 91.3) * 43758.5453);
}

fn voronoiValue(cell: vec2f) -> f32 {
  let center = (cell * uniforms.cell + uniforms.cell * 0.5 - uniforms.resolution * 0.5) / uniforms.resolution.y;
  var nearest = 10.0;
  var second = 10.0;
  for (var index = 0; index < 7; index += 1) {
    let fi = f32(index);
    let angle = uniforms.phase * (0.35 + fi * 0.025) + fi * 2.17;
    let lane = 0.15 + f32(index % 3) * 0.11;
    let site = vec2f(
      cos(angle) * lane * (uniforms.resolution.x / uniforms.resolution.y),
      sin(angle * 1.31) * lane * 1.15
    );
    let distance = length(center - site);
    if (distance < nearest) {
      second = nearest;
      nearest = distance;
    } else if (distance < second) {
      second = distance;
    }
  }
  let edge = clamp(1.0 - (second - nearest) * 34.0, 0.0, 1.0);
  let pulse = 0.72 + sin((nearest + second) * 60.0 - uniforms.phase) * 0.28;
  return edge * pulse;
}

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
  let positions = array<vec2f, 3>(
    vec2f(-1.0, -1.0),
    vec2f(3.0, -1.0),
    vec2f(-1.0, 3.0)
  );
  return vec4f(positions[index], 0.0, 1.0);
}

@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
  let screen = position.xy;
  let cell = floor(screen / uniforms.cell);
  let local = fract(screen / uniforms.cell);
  let value = voronoiValue(cell);
  if (value < 0.34) { return vec4f(1.0); }

  let mint = value > 0.82 || hash(cell, 23.0) > 0.91;
  let dark = !mint && (value > 0.68 || hash(cell, 17.0) > 0.54);
  var fill = select(select(vec3f(1.0), vec3f(0.09), dark), vec3f(0.467, 0.259, 1.0), mint);
  let ink = select(vec3f(0.07), vec3f(1.0), mint || dark);
  let border = select(vec3f(0.07), vec3f(0.357, 0.165, 0.8), mint);
  let borderPixel = 1.0 / ${CELL}.0;
  let rightVisible = voronoiValue(cell + vec2f(1.0, 0.0)) >= 0.34;
  let bottomVisible = voronoiValue(cell + vec2f(0.0, 1.0)) >= 0.34;
  if (
    local.x <= borderPixel || local.y <= borderPixel ||
    (!rightVisible && local.x >= 1.0 - borderPixel) ||
    (!bottomVisible && local.y >= 1.0 - borderPixel)
  ) { fill = border; }

  let glyphIndex = floor(hash(cell, 31.0) * 10.0);
  let glyphUv = vec2f((glyphIndex + local.x) / 10.0, local.y);
  let glyphAlpha = textureSample(glyphTexture, glyphSampler, glyphUv).a;
  fill = mix(fill, ink, glyphAlpha);
  return vec4f(fill, 1.0);
}`;

function glyphAtlas() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size * GLYPHS.length;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return canvas;
  context.fillStyle = "#ffffff";
  context.font = '400 80px "DM Mono", monospace';
  context.textAlign = "center";
  context.textBaseline = "middle";
  GLYPHS.forEach((glyph, index) => {
    context.fillText(glyph, index * size + size / 2, size / 2 + 1);
  });
  return canvas;
}

function VoronoiWebGPURenderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gpu = (navigator as Navigator & { gpu?: any }).gpu;
    if (!canvas || !gpu) { setUnsupported(true); return; }
    let disposed = false;
    let frame = 0;

    async function start() {
      const adapter = await gpu.requestAdapter();
      if (!adapter || disposed) { setUnsupported(true); return; }
      const device = await adapter.requestDevice();
      const context = canvas!.getContext("webgpu" as never) as any;
      if (!context || disposed) { setUnsupported(true); return; }
      const format = gpu.getPreferredCanvasFormat();
      context.configure({ device, format, alphaMode: "opaque" });
      canvas!.dataset.renderer = "webgpu";

      const module = device.createShaderModule({ code: SHADER });
      const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: { module, entryPoint: "vertexMain" },
        fragment: { module, entryPoint: "fragmentMain", targets: [{ format }] },
        primitive: { topology: "triangle-list" },
      });
      const uniformBuffer = device.createBuffer({
        size: 16,
        usage: 0x40 | 0x08,
      });

      await document.fonts.ready;
      const atlas = glyphAtlas();
      const texture = device.createTexture({
        size: [atlas.width, atlas.height],
        format: "rgba8unorm",
        usage: 0x02 | 0x04,
      });
      device.queue.copyExternalImageToTexture(
        { source: atlas },
        { texture },
        [atlas.width, atlas.height],
      );
      const sampler = device.createSampler({ minFilter: "linear", magFilter: "linear" });
      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: uniformBuffer } },
          { binding: 1, resource: texture.createView() },
          { binding: 2, resource: sampler },
        ],
      });
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      let ratio = 1;

      function resize() {
        ratio = Math.min(devicePixelRatio, 2);
        canvas!.width = Math.round(innerWidth * ratio);
        canvas!.height = Math.round(innerHeight * ratio);
        canvas!.style.width = `${innerWidth}px`;
        canvas!.style.height = `${innerHeight}px`;
      }
      function render(time: number) {
        if (disposed) return;
        const cycle = reduced ? 0.17 : (time % LOOP_DURATION) / LOOP_DURATION;
        device.queue.writeBuffer(
          uniformBuffer,
          0,
          new Float32Array([canvas!.width, canvas!.height, cycle * Math.PI * 2, CELL * ratio]),
        );
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
          colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 1, g: 1, b: 1, a: 1 },
            loadOp: "clear",
            storeOp: "store",
          }],
        });
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.draw(3);
        pass.end();
        device.queue.submit([encoder.finish()]);
        if (!reduced) frame = requestAnimationFrame(render);
      }
      resize();
      addEventListener("resize", resize);
      render(0);
      if (disposed) removeEventListener("resize", resize);
    }

    void start().catch(() => setUnsupported(true));
    return () => { disposed = true; cancelAnimationFrame(frame); };
  }, []);

  if (unsupported) return <VoronoiPulse />;
  return <canvas ref={canvasRef} className="effect-canvas" aria-hidden="true" />;
}

export function VoronoiWebGPU({ terminal = false }: { terminal?: boolean }) {
  return terminal ? <VoronoiPulse terminal /> : <VoronoiWebGPURenderer />;
}
