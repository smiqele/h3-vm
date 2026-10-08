"use client";

import { useEffect, useRef } from "react";
import { VoronoiPulse } from "../math-clouds/MathClouds";

const CELL = 24;
const LOOP_DURATION = 24_000;
const GLYPHS = ["h", "3", ">", "=", "+", "{", "#", "&", "[", "]"];

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_phase;
uniform float u_cell;
uniform sampler2D u_glyphs;
out vec4 outColor;

float hash(vec2 value, float seed) {
  return fract(sin(dot(value, vec2(127.1, 311.7)) + seed * 91.3) * 43758.5453);
}

float voronoiValue(vec2 cell) {
  vec2 center = (cell * u_cell + u_cell * 0.5 - u_resolution * 0.5) / u_resolution.y;
  float nearest = 10.0;
  float second = 10.0;

  for (int index = 0; index < 7; index++) {
    float fi = float(index);
    float angle = u_phase * (0.35 + fi * 0.025) + fi * 2.17;
    float lane = 0.15 + mod(fi, 3.0) * 0.11;
    vec2 site = vec2(
      cos(angle) * lane * (u_resolution.x / u_resolution.y),
      sin(angle * 1.31) * lane * 1.15
    );
    float distance = length(center - site);
    if (distance < nearest) {
      second = nearest;
      nearest = distance;
    } else if (distance < second) {
      second = distance;
    }
  }

  float edge = clamp(1.0 - (second - nearest) * 34.0, 0.0, 1.0);
  float pulse = 0.72 + sin((nearest + second) * 60.0 - u_phase) * 0.28;
  return edge * pulse;
}

void main() {
  vec2 screen = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);
  vec2 cell = floor(screen / u_cell);
  vec2 local = fract(screen / u_cell);
  float value = voronoiValue(cell);
  if (value < 0.34) {
    outColor = vec4(1.0);
    return;
  }

  float random = hash(cell, 17.0);
  bool mint = value > 0.82 || hash(cell, 23.0) > 0.91;
  bool dark = !mint && (value > 0.68 || random > 0.54);
  vec3 fill = mint ? vec3(0.467, 0.259, 1.0) : dark ? vec3(0.09) : vec3(1.0);
  vec3 ink = (mint || dark) ? vec3(1.0) : vec3(0.07);
  vec3 border = mint ? vec3(0.357, 0.165, 0.8) : vec3(0.07);
  float borderPixel = 1.0 / ${CELL}.0;
  bool rightVisible = voronoiValue(cell + vec2(1.0, 0.0)) >= 0.34;
  bool bottomVisible = voronoiValue(cell + vec2(0.0, 1.0)) >= 0.34;
  if (
    local.x <= borderPixel ||
    local.y <= borderPixel ||
    (!rightVisible && local.x >= 1.0 - borderPixel) ||
    (!bottomVisible && local.y >= 1.0 - borderPixel)
  ) {
    fill = border;
  }

  float glyphIndex = floor(hash(cell, 31.0) * 10.0);
  vec2 glyphUv = vec2((glyphIndex + local.x) / 10.0, 1.0 - local.y);
  float glyphAlpha = texture(u_glyphs, glyphUv).a;
  fill = mix(fill, ink, glyphAlpha);
  outColor = vec4(fill, 1.0);
}`;

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create WebGL shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "WebGL shader compilation failed");
  }
  return shader;
}

function createGlyphAtlas() {
  const canvas = document.createElement("canvas");
  const glyphSize = 128;
  canvas.width = glyphSize * GLYPHS.length;
  canvas.height = glyphSize;
  const context = canvas.getContext("2d");
  if (!context) return canvas;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  context.font = '400 80px "DM Mono", monospace';
  context.textAlign = "center";
  context.textBaseline = "middle";
  GLYPHS.forEach((glyph, index) => {
    context.fillText(glyph, index * glyphSize + glyphSize / 2, glyphSize / 2 + 1);
  });
  return canvas;
}

function VoronoiWebGLRenderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl2", { alpha: false, antialias: false });
    if (!canvas || !gl) return;
    const drawingCanvas = canvas;
    const drawingGl = gl;
    const program = gl.createProgram();
    if (!program) return;
    const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? "WebGL program link failed");
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, createGlyphAtlas());

    const resolution = gl.getUniformLocation(program, "u_resolution");
    const phase = gl.getUniformLocation(program, "u_phase");
    const cellSize = gl.getUniformLocation(program, "u_cell");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let pixelRatio = 1;

    function resize() {
      const ratio = Math.min(devicePixelRatio, 2);
      pixelRatio = ratio;
      const width = innerWidth;
      const height = innerHeight;
      drawingCanvas.width = Math.round(width * ratio);
      drawingCanvas.height = Math.round(height * ratio);
      drawingCanvas.style.width = `${width}px`;
      drawingCanvas.style.height = `${height}px`;
      drawingGl.viewport(0, 0, drawingCanvas.width, drawingCanvas.height);
    }

    function render(time: number) {
      drawingGl.uniform2f(resolution, drawingCanvas.width, drawingCanvas.height);
      drawingGl.uniform1f(cellSize, CELL * pixelRatio);
      const cycle = reduced ? 0.17 : (time % LOOP_DURATION) / LOOP_DURATION;
      drawingGl.uniform1f(phase, cycle * Math.PI * 2);
      drawingGl.drawArrays(drawingGl.TRIANGLES, 0, 3);
      if (!reduced) frame = requestAnimationFrame(render);
    }

    void document.fonts.ready.then(() => {
      drawingGl.bindTexture(drawingGl.TEXTURE_2D, texture);
      drawingGl.texImage2D(
        drawingGl.TEXTURE_2D,
        0,
        drawingGl.RGBA,
        drawingGl.RGBA,
        drawingGl.UNSIGNED_BYTE,
        createGlyphAtlas(),
      );
      resize();
      render(0);
    });
    addEventListener("resize", resize);
    return () => {
      removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.deleteProgram(program);
    };
  }, []);

  return <canvas ref={canvasRef} className="effect-canvas" aria-hidden="true" />;
}

export function VoronoiWebGL({ terminal = false }: { terminal?: boolean }) {
  return terminal ? <VoronoiPulse terminal /> : <VoronoiWebGLRenderer />;
}
