import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const read = (file) => parse(fs.readFileSync(path.join(root, file), "utf8"));
const findFiles = (directory, fileName) => {
  const absoluteDirectory = path.join(root, directory);
  if (!fs.existsSync(absoluteDirectory)) return [];
  return fs.readdirSync(absoluteDirectory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? findFiles(entryPath, fileName) : entry.name === fileName ? [entryPath] : [];
  });
};
const collectList = (files, key) => files.flatMap((file) => read(file)[key] ?? []);
const collectMap = (files, key) => Object.assign({}, ...files.map((file) => read(file)[key] ?? {}));
const ui = read("packages/ui/components.yaml");
const coreTokens = Object.fromEntries(fs.readdirSync(path.join(root, "packages/ui/tokens/core")).filter((file) => file.endsWith(".json")).map((file) => [path.basename(file, ".json"), JSON.parse(fs.readFileSync(path.join(root, "packages/ui/tokens/core", file), "utf8"))]));
const readJsonGroup = (directory) => Object.fromEntries(fs.readdirSync(path.join(root, directory)).filter((file) => file.endsWith(".json")).map((file) => [path.basename(file, ".json"), JSON.parse(fs.readFileSync(path.join(root, directory, file), "utf8"))]));
const semanticTokens = readJsonGroup("packages/ui/tokens/semantic");
const componentTokens = readJsonGroup("packages/ui/tokens/components");
const layoutTokens = JSON.parse(fs.readFileSync(path.join(root, "packages/ui/tokens/layout.json"), "utf8"));
const typographyStyles = JSON.parse(fs.readFileSync(path.join(root, "packages/ui/styles/typography.json"), "utf8"));
const domainRoot = "packages/docs/domains";
const resources = collectList(findFiles(domainRoot, "resource.yaml"), "resources");
const navigation = read("packages/docs/domains/navigation.yaml").sections;
const navigationItems = navigation.flatMap((section) => section.items ?? []);
const screens = collectList(findFiles(domainRoot, "screens.yaml"), "screens");
const patterns = collectList(["packages/docs/ux/patterns.yaml", ...findFiles(domainRoot, "patterns.yaml")], "patterns");
const journeys = collectList(findFiles(domainRoot, "journeys.yaml"), "journeys");
const fixtures = collectMap(findFiles(domainRoot, "fixtures.yaml"), "fixtures");
const statuses = read("packages/docs/ui/resource-statuses.yaml");
const backlog = read("packages/backlog/tasks.yaml");
const hypothesisBacklog = read("packages/backlog/hypotheses.yaml");
const ids = (items) => new Set(items.map((item) => item.id));

const primitiveIds = ids(ui.primitives);
const componentIds = ids(ui.components);
const resourceIds = ids(resources);
const resourceById = new Map(resources.map((resource) => [resource.id, resource]));
const screenIds = ids(screens);
const patternIds = ids(patterns);
const uiIds = new Set([...primitiveIds, ...componentIds]);
const errors = [];
const tokenRoot = { core: coreTokens, semantic: semanticTokens, component: componentTokens, layout: layoutTokens };
const tokenExists = (reference) => reference.slice(1, -1).split(".").reduce((node, key) => node?.[key], tokenRoot)?.$value !== undefined;
const catalogTokenExists = (pathValue) => {
  const parts = pathValue.split("/");
  const wildcard = parts.at(-1) === "*";
  if (wildcard) parts.pop();
  const candidates = parts[0] === "component"
    ? [parts.slice(1).reduce((node, key) => node?.[key], componentTokens)]
    : parts[0] === "layout"
      ? [parts.slice(1).reduce((node, key) => node?.[key], layoutTokens)]
      : [componentTokens, semanticTokens, coreTokens].map(rootNode => parts.reduce((node, key) => node?.[key], rootNode));
  return candidates.some(node => wildcard ? node && typeof node === "object" : node?.$value !== undefined);
};
const visitTokens = (node, pathParts = []) => {
  if (!node || typeof node !== "object") return;
  if ("$value" in node) {
    if (["semantic", "component"].includes(pathParts[0]) && node.$type === "color" && !(node.$value && typeof node.$value === "object" && "light" in node.$value && "dark" in node.$value)) errors.push(`${pathParts.join(".")}: color token must declare light and dark modes`);
    const values = node.$value && typeof node.$value === "object" ? Object.values(node.$value) : [node.$value];
    for (const candidate of values) if (typeof candidate === "string" && /^\{.+\}$/.test(candidate) && !tokenExists(candidate)) errors.push(`${pathParts.join(".")}: unknown token ${candidate}`);
    return;
  }
  for (const [key, child] of Object.entries(node)) visitTokens(child, [...pathParts, key]);
};

for (const component of [...ui.primitives, ...ui.components]) {
  for (const id of component.builtFrom || []) if (!uiIds.has(id)) errors.push(`${component.id}: unknown UI dependency ${id}`);
  for (const token of component.tokens || []) if (!catalogTokenExists(token)) errors.push(`${component.id}: unknown catalog token ${token}`);
}
if (ids(navigationItems).size !== navigationItems.length) errors.push("navigation: item IDs must be unique");
for (const item of navigationItems) {
  if (!item.id || !item.label || !item.icon) errors.push(`navigation: item ${item.id ?? "without ID"} requires id, label and icon`);
  if (!["available", "prototype", "planned"].includes(item.lifecycle)) errors.push(`${item.id}: unknown lifecycle ${item.lifecycle}`);
  if (item.screen && !screenIds.has(item.screen)) errors.push(`${item.id}: unknown screen ${item.screen}`);
  if (item.lifecycle === "available" && !item.screen) errors.push(`${item.id}: available item must declare screen`);
}
for (const screen of screens) {
  if (!resourceIds.has(screen.resource)) errors.push(`${screen.id}: unknown resource ${screen.resource}`);
  if (!patternIds.has(screen.pattern)) errors.push(`${screen.id}: unknown pattern ${screen.pattern}`);
  for (const block of screen.blocks || []) if (!componentIds.has(block.component)) errors.push(`${screen.id}: unknown component ${block.component}`);
  for (const fixture of Object.values(screen.states || {})) if (!(fixture in fixtures)) errors.push(`${screen.id}: unknown fixture ${fixture}`);
  const resourceFields = new Set((resourceById.get(screen.resource)?.fields || []).map((field) => field.id));
  for (const block of screen.blocks || []) {
    if (block.component !== "component.data-table") continue;
    const columns = block.props?.columns || [];
    if (!Array.isArray(columns) || columns.length === 0) errors.push(`${screen.id}.${block.id}: table columns are required`);
    for (const column of columns) {
      if (typeof column === "string") {
        if (!resourceFields.has(column)) errors.push(`${screen.id}.${block.id}: unknown column field ${column}`);
        continue;
      }
      if (!resourceFields.has(column.field)) errors.push(`${screen.id}.${block.id}: unknown column field ${column.field}`);
      for (const related of [column.levelField, column.limitField]) if (related && !resourceFields.has(related)) errors.push(`${screen.id}.${block.id}.${column.field}: unknown related field ${related}`);
      if (column.statusResource && !(column.statusResource in statuses)) errors.push(`${screen.id}.${block.id}.${column.field}: unknown status vocabulary ${column.statusResource}`);
    }
    for (const field of block.props?.searchFields || []) if (!resourceFields.has(field)) errors.push(`${screen.id}.${block.id}: unknown search field ${field}`);
    if (block.props?.statusField && !resourceFields.has(block.props.statusField)) errors.push(`${screen.id}.${block.id}: unknown status field ${block.props.statusField}`);
  }
}
for (const pattern of patterns) for (const id of pattern.components || []) if (!uiIds.has(id)) errors.push(`${pattern.id}: unknown UI item ${id}`);
for (const journey of journeys) for (const stage of journey.stages || []) if (!screenIds.has(stage.touchpoint) && !patternIds.has(stage.touchpoint)) errors.push(`${journey.id}: unknown touchpoint ${stage.touchpoint}`);
visitTokens(tokenRoot);
for (const [group, variants] of Object.entries(typographyStyles)) for (const [variant, style] of Object.entries(variants)) for (const [property, reference] of Object.entries(style)) {
  if (typeof reference !== "string" || !/^\{.+\}$/.test(reference) || !tokenExists(reference)) errors.push(`${group}.${variant}: ${property} references unknown token ${reference}`);
}

const taskIds = ids(backlog.tasks);
if (taskIds.size !== backlog.tasks.length) errors.push("backlog: task IDs must be unique");
for (const task of backlog.tasks) {
  if (!backlog.areas.includes(task.area)) errors.push(`${task.id}: unknown backlog area ${task.area}`);
  if (!backlog.statuses.includes(task.status)) errors.push(`${task.id}: unknown backlog status ${task.status}`);
  if (!Array.isArray(task.acceptance) || task.acceptance.length === 0) errors.push(`${task.id}: acceptance criteria are required`);
  for (const dependency of task.dependsOn || []) if (!taskIds.has(dependency)) errors.push(`${task.id}: unknown task dependency ${dependency}`);
}
const hypothesisIds = ids(hypothesisBacklog.hypotheses);
if (hypothesisIds.size !== hypothesisBacklog.hypotheses.length) errors.push("backlog: hypothesis IDs must be unique");
for (const hypothesis of hypothesisBacklog.hypotheses) {
  if (!hypothesisBacklog.statuses.includes(hypothesis.status)) errors.push(`${hypothesis.id}: unknown hypothesis status ${hypothesis.status}`);
  if (!hypothesis.statement || !hypothesis.job?.need || !hypothesis.job?.outcome) errors.push(`${hypothesis.id}: statement and job are required`);
  if (!hypothesis.evaluation?.quantitative?.length && !hypothesis.evaluation?.qualitative?.length) errors.push(`${hypothesis.id}: evaluation signals are required`);
  for (const id of hypothesis.solution?.patterns || []) if (!patternIds.has(id)) errors.push(`${hypothesis.id}: unknown pattern ${id}`);
  for (const id of hypothesis.solution?.screens || []) if (!screenIds.has(id)) errors.push(`${hypothesis.id}: unknown screen ${id}`);
  for (const id of hypothesis.tasks || []) if (!taskIds.has(id)) errors.push(`${hypothesis.id}: unknown task ${id}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
const typographyCount = Object.values(typographyStyles).reduce((count, variants) => count + Object.keys(variants).length, 0);
console.log(`PASS specification graph: ${ui.primitives.length} primitives, ${ui.components.length} components, ${typographyCount} typography styles, ${navigationItems.length} navigation items, ${patterns.length} patterns, ${screens.length} screens, ${journeys.length} journeys, ${backlog.tasks.length} backlog tasks, ${hypothesisBacklog.hypotheses.length} hypotheses`);
if (!coreTokens.text || !coreTokens.font) throw new Error("Core typography tokens are missing");
