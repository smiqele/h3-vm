import { loadUiCatalog } from "@cloud/ui/catalog";
import { loadConsoleModel } from "@cloud/console-runtime";

export type CatalogItem = Record<string, unknown> & { id: string; name?: string; title?: string };
export type Catalog = {
  ui: { tokens: Record<string, Record<string, unknown>>; styles: { typography: Record<string, Record<string, Record<string, string>>> }; components: { primitives: CatalogItem[]; components: CatalogItem[] } };
  ux: { resources: { resources: CatalogItem[] }; contexts: Record<string, unknown>; screens: { screens: CatalogItem[] }; patterns: { patterns: CatalogItem[] }; journeys: { journeys: CatalogItem[] }; fixtures: { fixtures: Record<string, unknown> } };
};

export function getCatalog(): Catalog {
  const ui=loadUiCatalog();const model=loadConsoleModel();
  return {
    ui: { tokens: ui.tokens, styles: ui.styles, components: ui.components } as Catalog["ui"],
    ux: model as unknown as Catalog["ux"],
  };
}

export function findById(items: CatalogItem[], id: string) {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Unknown specification id: ${id}`);
  return item;
}
