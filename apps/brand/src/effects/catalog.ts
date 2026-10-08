export type EffectDefinition = {
  id:
    | "ascii-clouds"
    | "entropy-fill"
    | "dot-matrix"
    | "threat-hunters"
    | "cell-graph"
    | "loading-states"
    | "character-loop"
    | "smooth-clouds"
    | "harmonic-clouds"
    | "wave-interference"
    | "voronoi-pulse"
    | "voronoi-webgl"
    | "voronoi-webgpu"
    | "arc-flow"
    | "magnetic-field"
    | "triple-junctions";
  title: string;
  description: string;
  loopDurationMs: number;
  renderer: "canvas-2d" | "webgl2" | "webgpu" | "css";
};

export const effects: EffectDefinition[] = [
  {
    id: "ascii-clouds",
    title: "ASCII Clouds",
    description: "Облачное поле из ячеек 24 × 24 и символов DM Mono.",
    loopDurationMs: 24_000,
    renderer: "canvas-2d",
  },
  {
    id: "entropy-fill",
    title: "Entropy Fill",
    description: "Горизонтальный градиент плотности, управляемый связанными осцилляторами.",
    loopDurationMs: 24_000,
    renderer: "canvas-2d",
  },
  {
    id: "dot-matrix",
    title: "Dot Matrix",
    description: "Полноэкранная сетка белых ячеек с чёрными точками.",
    loopDurationMs: 24_000,
    renderer: "canvas-2d",
  },
  {
    id: "threat-hunters",
    title: "Threat Hunters",
    description: "Мини-группы фирменных ячеек ловят красные вредоносные цели.",
    loopDurationMs: 24_000,
    renderer: "canvas-2d",
  },
  {
    id: "cell-graph",
    title: "Cell Graph",
    description: "Маленькие группы ячеек образуют подвижный сетевой граф.",
    loopDurationMs: 24_000,
    renderer: "canvas-2d",
  },
  {
    id: "loading-states",
    title: "Loading States",
    description: "Двенадцать вариантов состояний и загрузки в модулях 3 × 3.",
    loopDurationMs: 24_000,
    renderer: "canvas-2d",
  },
  {
    id: "character-loop",
    title: "Character Loop",
    description: "Модульный персонаж из Figma с циклической фирменной анимацией.",
    loopDurationMs: 6_000,
    renderer: "css",
  },
  {
    id: "smooth-clouds",
    title: "Cloud Cutout",
    description: "Исходное облачное поле с пустой областью вокруг курсора.",
    loopDurationMs: 24_000,
    renderer: "canvas-2d",
  },
  {
    id: "harmonic-clouds",
    title: "Harmonic Clouds",
    description: "Облачное поле из метаболлов, орбит Лиссажу и гармоник.",
    loopDurationMs: 24_000,
    renderer: "canvas-2d",
  },
  {
    id: "wave-interference",
    title: "Wave Interference",
    description: "Суперпозиция волн от движущихся источников.",
    loopDurationMs: 24_000,
    renderer: "canvas-2d",
  },
  {
    id: "voronoi-pulse",
    title: "Voronoi Pulse",
    description: "Пульсирующие границы движущихся областей Вороного.",
    loopDurationMs: 24_000,
    renderer: "canvas-2d",
  },
  {
    id: "voronoi-webgl",
    title: "Voronoi WebGL",
    description: "GPU-версия пульсирующего поля Вороного.",
    loopDurationMs: 24_000,
    renderer: "webgl2",
  },
  {
    id: "voronoi-webgpu",
    title: "Voronoi WebGPU",
    description: "WGSL-версия пульсирующего поля Вороного.",
    loopDurationMs: 24_000,
    renderer: "webgpu",
  },
  {
    id: "arc-flow",
    title: "Arc Flow",
    description: "Расширяющийся поток ячеек по дуге сверху вниз.",
    loopDurationMs: 24_000,
    renderer: "canvas-2d",
  },
  {
    id: "magnetic-field",
    title: "Magnetic Field",
    description: "Силовые линии пары движущихся диполей.",
    loopDurationMs: 24_000,
    renderer: "canvas-2d",
  },
  {
    id: "triple-junctions",
    title: "Triple Junctions",
    description: "Проявление тройных стыков соседних областей.",
    loopDurationMs: 24_000,
    renderer: "canvas-2d",
  },
];

export function getEffect(effectId: string) {
  return effects.find((effect) => effect.id === effectId);
}
