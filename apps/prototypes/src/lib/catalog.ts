import { loadConsoleModel, type ConsoleModel } from "@cloud/console-runtime";

type CatalogItem = Record<string, unknown> & { id: string };
export function getConsoleModel(): ConsoleModel {
  return loadConsoleModel();
}

export function findById(items: CatalogItem[], id: string) {
  const item = items.find(candidate => candidate.id === id);
  if (!item) throw new Error(`Unknown specification id: ${id}`);
  return item;
}
