"use client";

import { useEffect, useRef } from "react";

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_time;
uniform vec2 u_pointer;
uniform vec4 u_button;
uniform float u_hover;
uniform vec4 u_exclusions[8];
uniform int u_exclusionCount;
uniform sampler2D u_glyphAtlas;
uniform sampler2D u_materialAtlas;
out vec4 outColor;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float seededHash(vec2 p, float seed) {
  return fract(sin(p.x * 127.1 + p.y * 311.7 + seed * 91.3) * 43758.5453);
}

float roundedBox(vec2 p, vec2 size, float radius) {
  vec2 q = abs(p - size * 0.5) - size * 0.5 + radius;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

bool insideRect(vec2 point, vec4 rect, float padding) {
  return point.x >= rect.x - padding && point.x <= rect.x + rect.z + padding
    && point.y >= rect.y - padding && point.y <= rect.y + rect.w + padding;
}

vec3 palette(float t) {
  vec3 a = vec3(0.54, 0.48, 0.62);
  vec3 b = vec3(0.46, 0.42, 0.38);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.02, 0.28, 0.58);
  return a + b * cos(6.28318 * (c * t + d));
}

float tripleJunctions(vec2 point, float t, float development, float energy) {
  vec2 baseCenters[3] = vec2[3](
    vec2(0.16, 0.36),
    vec2(0.78, 0.19),
    vec2(0.59, 0.84)
  );
  vec2 centers[3];
  for (int centerIndex = 0; centerIndex < 3; centerIndex++) {
    float index = float(centerIndex);
    centers[centerIndex] = baseCenters[centerIndex] + vec2(
      cos(t * 0.11 + index * 2.1) * 0.012,
      sin(t * 0.09 + index * 1.7) * 0.012
    );
  }

  float nearest = 10.0;
  float second = 10.0;
  float third = 10.0;
  for (int centerIndex = 0; centerIndex < 3; centerIndex++) {
    int nextIndex = (centerIndex + 1) % 3;
    float center = float(centerIndex);
    float coupling = 0.035 + sin(t * 0.16 + center * 2.3) * 0.025;
    for (int siteIndex = 0; siteIndex < 7; siteIndex++) {
      float site = float(siteIndex);
      float sitePhase = center * 1.73 + site * 6.2831853 / 7.0;
      float speed = 0.24 + site * 0.018 + center * 0.012;
      float chaos = development * (0.45 + energy * 0.85);
      float irregularity = sin(t * 0.67 + site * 1.91 + center) * 0.42 * chaos;
      float angle = t * speed + sitePhase + irregularity;
      float radius = 0.075 + mod(site, 3.0) * 0.032
        + sin(t * 0.39 + site * 2.37) * 0.016 * chaos;
      vec2 sitePoint = centers[centerIndex] + vec2(
        cos(angle) * radius,
        sin(angle * 1.27) * radius * 0.92
      ) + (centers[nextIndex] - centers[centerIndex]) * coupling;
      float distanceToSite = distance(point, sitePoint);
      if (distanceToSite < nearest) {
        third = second;
        second = nearest;
        nearest = distanceToSite;
      } else if (distanceToSite < second) {
        third = second;
        second = distanceToSite;
      } else if (distanceToSite < third) {
        third = distanceToSite;
      }
    }
  }

  float nearestCenter = 10.0;
  float secondCenter = 10.0;
  for (int index = 0; index < 3; index++) {
    float centerDistance = distance(point, centers[index]);
    if (centerDistance < nearestCenter) {
      secondCenter = nearestCenter;
      nearestCenter = centerDistance;
    } else if (centerDistance < secondCenter) {
      secondCenter = centerDistance;
    }
  }
  float junction = clamp(1.0 - (third - nearest) * 30.0, 0.0, 1.0);
  float envelope = clamp(1.0 - nearestCenter / 0.56, 0.0, 1.0);
  float sharedBoundary = clamp(1.0 - (secondCenter - nearestCenter) * 5.0, 0.0, 1.0);
  float breathing = 0.9 + sin(t * 0.19) * 0.1;
  return junction * envelope * (0.72 + sharedBoundary * 0.28) * breathing;
}

void main() {
  vec2 pixel = vec2(gl_FragCoord.x, u_resolution.y * u_pixelRatio - gl_FragCoord.y) / u_pixelRatio;
  float cellSize = 25.0;
  vec2 cell = floor(pixel / cellSize);
  vec2 local = mod(pixel, cellSize);
  vec2 center = (cell + 0.5) * cellSize;
  float seed = seededHash(cell, 97.0);
  float phase = u_time * 0.1518;
  float development = 0.82 + clamp(u_time / 8.0, 0.0, 1.0) * 0.18;
  float introReveal = development * development * (3.0 - 2.0 * development);
  float densityPulse = pow((cos(max(0.0, u_time - 12.0) / 20.0 * 6.2831853) + 1.0) * 0.5, 6.0);
  float densityLevel = development < 0.999 ? introReveal : 0.32 + densityPulse * 0.68;
  float field = tripleJunctions(center / u_resolution, phase, development, densityLevel);
  float threshold = 0.32 - densityLevel * 0.2;
  float density = step(seed, densityLevel) * step(threshold, field);

  float buttonDistance = length((center - (u_button.xy + u_button.zw * 0.5))
    / (u_button.zw * 0.5 + vec2(150.0, 125.0)));
  float hoverField = (1.0 - smoothstep(0.15, 1.0, buttonDistance)) * u_hover;
  density = max(density, hoverField);

  bool protectedArea = false;
  for (int index = 0; index < 8; index++) {
    if (index >= u_exclusionCount) break;
    if (insideRect(center, u_exclusions[index], 25.0)) protectedArea = true;
  }
  if (insideRect(center, u_button, 0.0)) protectedArea = true;

  float cellDistance = roundedBox(local - vec2(1.0), vec2(23.0), 5.0);
  float edgeWidth = max(fwidth(cellDistance), 0.18);
  float shape = 1.0 - smoothstep(-edgeWidth, edgeWidth, cellDistance);
  float visible = step(0.5, density) * shape * (protectedArea ? 0.0 : 1.0);
  if (visible <= 0.0) {
    outColor = vec4(0.0);
    return;
  }

  float paletteRoll = seededHash(cell, 613.0);
  float material = paletteRoll < 0.83 ? 0.0
    : paletteRoll < 0.91 ? 1.0
    : paletteRoll < 0.92 ? 2.0
    : 3.0;
  vec2 materialUv = vec2(
    (material + local.x / cellSize) / 4.0,
    1.0 - local.y / cellSize
  );
  vec3 color = texture(u_materialAtlas, materialUv).rgb;

  float hyper = seededHash(cell, 809.0);
  if (hyper > 0.965) {
    vec2 warp = local / cellSize;
    float flow = sin(warp.x * 5.0 + phase + seed * 8.0)
      + cos(warp.y * 6.0 - phase * 0.8);
    color = palette(fract(u_time * 0.035 + seed + flow * 0.09));
    color *= 1.08;
  } else {
    float glyphIndex = floor(seededHash(cell, 31.0) * 18.0);
    vec2 glyphUv = vec2(
      (glyphIndex + local.x / cellSize) / 18.0,
      1.0 - local.y / cellSize
    );
    float glyph = texture(u_glyphAtlas, glyphUv).a;
    float emptyDark = material < 0.5 && seededHash(cell, 641.0) < 0.01 ? 1.0 : 0.0;
    vec3 ink = material > 1.5 ? vec3(0.055) : vec3(0.94);
    color = mix(color, ink, glyph * 0.9 * (1.0 - emptyDark));
  }

  outColor = vec4(color, visible);
}`;

function createMaterialAtlas() {
  const ratio = 2;
  const cell = 25;
  const atlas = document.createElement("canvas");
  atlas.width = cell * 4 * ratio;
  atlas.height = cell * ratio;
  const atlasContext = atlas.getContext("2d");
  if (!atlasContext) return atlas;
  const materials = [
    { fill: "#19191a", glow: "rgba(255,255,255,.1)", highlight: "rgba(255,255,255,.1)", blur: 25, gradient: false },
    { fill: "#602be8", glow: "rgba(255,255,255,.2)", highlight: "rgba(255,255,255,.15)", blur: 10, gradient: true },
    { fill: "#c2ff29", glow: "rgba(255,255,255,.7)", highlight: "rgba(255,255,255,.5)", blur: 10, gradient: true },
    { fill: "#b2b2b2", glow: "rgba(255,255,255,.4)", highlight: "rgba(255,255,255,.5)", blur: 10, gradient: true },
  ];
  materials.forEach((material, index) => {
    const tile = document.createElement("canvas");
    tile.width = cell * ratio;
    tile.height = cell * ratio;
    const context = tile.getContext("2d");
    if (!context) return;
    context.scale(ratio, ratio);
    context.beginPath();
    context.roundRect(1, 1, 23, 23, 5);
    context.fillStyle = material.fill;
    context.fill();
    if (material.gradient) {
      const gradient = context.createLinearGradient(0, 1, 0, 24);
      gradient.addColorStop(0, "rgba(255,255,255,.1)");
      gradient.addColorStop(1, "rgba(0,0,0,.1)");
      context.fillStyle = gradient;
      context.fill();
    }
    const innerGlow = (color: string, blur: number, offsetY = 0) => {
      context.save();
      context.beginPath();
      context.roundRect(1, 1, 23, 23, 5);
      context.clip();
      context.shadowColor = color;
      context.shadowBlur = blur;
      context.shadowOffsetY = offsetY;
      context.fillStyle = "#fff";
      context.beginPath();
      context.rect(-40, -40, 105, 105);
      context.roundRect(0.25, 0.25, 24.5, 24.5, 5.75);
      context.fill("evenodd");
      context.restore();
    };
    innerGlow(material.glow, material.blur);
    innerGlow(material.highlight, 0, 1.75);
    atlasContext.drawImage(tile, index * cell * ratio, 0);
  });
  return atlas;
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function TerminalV2({
  exclusionSelector,
  hoverSelector,
}: {
  exclusionSelector: string;
  hoverSelector: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl2", { alpha: true, antialias: false });
    if (!canvas || !gl) return;
    const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertex || !fragment) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const resolution = gl.getUniformLocation(program, "u_resolution");
    const pixelRatioUniform = gl.getUniformLocation(program, "u_pixelRatio");
    const time = gl.getUniformLocation(program, "u_time");
    const pointerUniform = gl.getUniformLocation(program, "u_pointer");
    const buttonUniform = gl.getUniformLocation(program, "u_button");
    const hoverUniform = gl.getUniformLocation(program, "u_hover");
    const exclusionUniform = gl.getUniformLocation(program, "u_exclusions[0]");
    const exclusionCountUniform = gl.getUniformLocation(program, "u_exclusionCount");
    const glyphAtlasUniform = gl.getUniformLocation(program, "u_glyphAtlas");
    const materialAtlasUniform = gl.getUniformLocation(program, "u_materialAtlas");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let pointer = { x: innerWidth / 2, y: innerHeight / 2 };
    let hover = 0;
    let frame = 0;

    const glyphCanvas = document.createElement("canvas");
    glyphCanvas.width = 900;
    glyphCanvas.height = 50;
    const glyphContext = glyphCanvas.getContext("2d");
    const glyphTexture = gl.createTexture();
    if (glyphContext && glyphTexture) {
      glyphContext.clearRect(0, 0, glyphCanvas.width, glyphCanvas.height);
      glyphContext.fillStyle = "#fff";
      glyphContext.font = '400 30px "CoFo Sans Mono VF Trial", "DM Mono", monospace';
      glyphContext.textAlign = "center";
      glyphContext.textBaseline = "middle";
      const glyphs = ["h", "c", "3", ">", "=", "+", "{", "}", "#", "&", "~", ";", "@", "%", "*", "?", "\\", "^"];
      const glyphOffsets: Record<string, { x: number; y: number }> = {
        ";": { x: 0, y: -3.3 },
        "{": { x: -0.7, y: -2 },
        "}": { x: 0.7, y: -2 },
        "@": { x: 0, y: -2 },
        "*": { x: 0, y: 6.6 },
        "\\": { x: 0, y: -2 },
        "^": { x: 0, y: 5.3 },
      };
      glyphs.forEach((glyph, index) => {
        const offset = glyphOffsets[glyph] ?? { x: 0, y: 0 };
        glyphContext.fillText(glyph, index * 50 + 25 + offset.x * 2, 26 + offset.y * 2);
      });
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, glyphTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, glyphCanvas);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(glyphAtlasUniform, 0);
    }
    const materialTexture = gl.createTexture();
    if (materialTexture) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, materialTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, createMaterialAtlas());
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(materialAtlasUniform, 1);
      gl.activeTexture(gl.TEXTURE0);
    }

    const resize = () => {
      const ratio = Math.min(devicePixelRatio, 2);
      canvas.width = Math.round(innerWidth * ratio);
      canvas.height = Math.round(innerHeight * ratio);
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const move = (event: PointerEvent) => { pointer = { x: event.clientX, y: event.clientY }; };

    const render = (now: number) => {
      const ratio = canvas.width / innerWidth;
      const button = document.querySelector<HTMLElement>(hoverSelector);
      const buttonRect = button?.getBoundingClientRect();
      hover += (((button?.matches(":hover") ?? false) ? 1 : 0) - hover) * 0.08;
      const exclusions = Array.from(document.querySelectorAll<HTMLElement>(exclusionSelector))
        .slice(0, 8)
        .map((element) => element.getBoundingClientRect());
      const packed = new Float32Array(8 * 4);
      exclusions.forEach((rect, index) => packed.set([rect.left, rect.top, rect.width, rect.height], index * 4));

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(resolution, innerWidth, innerHeight);
      gl.uniform1f(pixelRatioUniform, ratio);
      gl.uniform1f(time, reduced ? 0 : now / 1_000);
      gl.uniform2f(pointerUniform, pointer.x, pointer.y);
      gl.uniform4f(buttonUniform, buttonRect?.left ?? -1000, buttonRect?.top ?? -1000,
        buttonRect?.width ?? 0, buttonRect?.height ?? 0);
      gl.uniform1f(hoverUniform, hover);
      gl.uniform4fv(exclusionUniform, packed);
      gl.uniform1i(exclusionCountUniform, exclusions.length);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduced) frame = requestAnimationFrame(render);
    };

    resize();
    frame = requestAnimationFrame(render);
    addEventListener("resize", resize);
    addEventListener("pointermove", move);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", move);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.deleteBuffer(buffer);
      if (glyphTexture) gl.deleteTexture(glyphTexture);
      if (materialTexture) gl.deleteTexture(materialTexture);
    };
  }, [exclusionSelector, hoverSelector]);

  return <canvas ref={canvasRef} className="effect-canvas terminal-v2-canvas" aria-hidden="true" />;
}
