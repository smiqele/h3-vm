import type { ComponentType } from "react";
import { AsciiClouds } from "./ascii-clouds/AsciiClouds";
import { EntropyFill } from "./entropy-fill/EntropyFill";
import { DotMatrix } from "./dot-matrix/DotMatrix";
import { ThreatHunters } from "./threat-hunters/ThreatHunters";
import { CellGraph } from "./cell-graph/CellGraph";
import { LoadingStates } from "./loading-states/LoadingStates";
import { CharacterLoop } from "./character-loop/CharacterLoop";
import { SmoothClouds } from "./smooth-clouds/SmoothClouds";
import { VoronoiWebGL } from "./voronoi-webgl/VoronoiWebGL";
import { VoronoiWebGPU } from "./voronoi-webgpu/VoronoiWebGPU";
import { ArcFlow } from "./arc-flow/ArcFlow";
import {
  MagneticField,
  HarmonicClouds,
  TripleJunctions,
  VoronoiPulse,
  WaveInterference,
} from "./math-clouds/MathClouds";
import type { EffectDefinition } from "./catalog";

export const effectComponents: Record<EffectDefinition["id"], ComponentType<{ terminal?: boolean }>> = {
  "ascii-clouds": AsciiClouds,
  "entropy-fill": EntropyFill,
  "dot-matrix": DotMatrix,
  "threat-hunters": ThreatHunters,
  "cell-graph": CellGraph,
  "loading-states": LoadingStates,
  "character-loop": CharacterLoop,
  "smooth-clouds": SmoothClouds,
  "harmonic-clouds": HarmonicClouds,
  "wave-interference": WaveInterference,
  "voronoi-pulse": VoronoiPulse,
  "voronoi-webgl": VoronoiWebGL,
  "voronoi-webgpu": VoronoiWebGPU,
  "arc-flow": ArcFlow,
  "magnetic-field": MagneticField,
  "triple-junctions": TripleJunctions,
};
