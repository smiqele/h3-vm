import model from "./model.generated.json";
const sources=["navigation","resources","contexts","screens","patterns","journeys","fixtures"] as const;
export type ConsoleModelSource=typeof sources[number];

export type ServiceLifecycle = "available" | "prototype" | "planned";
export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  lifecycle: ServiceLifecycle;
  screen?: string;
}
export interface NavigationSection {
  id: string;
  label?: string;
  items: NavigationItem[];
}
export interface ConsoleModel {
  navigation: { version: string; sections: NavigationSection[] };
  resources: { version: string; resources: Array<Record<string, unknown> & { id: string }> };
  screens: { version: string; screens: Array<Record<string, unknown> & { id: string; route?: string }> };
  contexts: Record<string, unknown>;
  patterns: Record<string, unknown>;
  journeys: Record<string, unknown>;
  fixtures: { version: string; fixtures: Record<string, unknown> };
}

export function loadConsoleModel(){return model as ConsoleModel;}

export * from "./statuses";
