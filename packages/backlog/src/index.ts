import source from "./backlog.generated.json";

export type BacklogArea = "ui" | "ux" | "product" | "architecture";
export type BacklogStatus = "backlog" | "ready" | "in-progress" | "blocked" | "done";
export type BacklogPriority = "high" | "medium" | "low";
export type HypothesisStatus = "proposed" | "ready-for-test" | "testing" | "validated" | "invalidated" | "inconclusive" | "parked";

export type BacklogTask = {
  id: string;
  title: string;
  area: BacklogArea;
  kind: string;
  status: BacklogStatus;
  priority: BacklogPriority;
  target: string;
  summary: string;
  acceptance: string[];
  files: string[];
  dependsOn: string[];
  blockedBy?: string;
};

export type HypothesisSignal = {
  metric?: string;
  signal?: string;
  target?: string;
  method: string;
};

export type ProductHypothesis = {
  id: string;
  title: string;
  status: HypothesisStatus;
  owner: string;
  job: { actor: string; context: string; need: string; outcome: string };
  observation: string;
  statement: string;
  solution: { summary: string; patterns: string[]; screens: string[] };
  evaluation: { quantitative: HypothesisSignal[]; qualitative: HypothesisSignal[] };
  evidence: Array<{ summary: string; source?: string; recordedAt?: string }>;
  decision: { state: "pending" | "validated" | "invalidated" | "inconclusive"; rationale: string; decidedAt: string | null };
  tasks: string[];
};

export type Backlog = {
  version: string;
  areas: BacklogArea[];
  statuses: BacklogStatus[];
  tasks: BacklogTask[];
  hypothesisVersion: string;
  hypothesisStatuses: HypothesisStatus[];
  hypotheses: ProductHypothesis[];
};

export function getBacklog(): Backlog {
  return source as Backlog;
}

export function findTask(id: string): BacklogTask | undefined {
  return getBacklog().tasks.find((task) => task.id === id);
}

export function findHypothesis(id: string): ProductHypothesis | undefined {
  return getBacklog().hypotheses.find((hypothesis) => hypothesis.id === id);
}
