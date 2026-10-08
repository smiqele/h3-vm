import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const fail = message => { throw new Error(`Component documentation: ${message}`); };

const catalog = parse(read("packages/ui/components.yaml"));
const manifest = JSON.parse(read("apps/design-lab/src/lib/component-documentation.json"));
const catalogIds = [...catalog.primitives, ...catalog.components].map(item => item.id).sort();
const manifestIds = Object.keys(manifest).sort();

const missing = catalogIds.filter(id => !manifestIds.includes(id));
const unknown = manifestIds.filter(id => !catalogIds.includes(id));
if (missing.length) fail(`missing manifest entries: ${missing.join(", ")}`);
if (unknown.length) fail(`unknown manifest entries: ${unknown.join(", ")}`);

const allowedKinds = new Set(["generic", "structured"]);
for (const [id, kind] of Object.entries(manifest)) if (!allowedKinds.has(kind)) fail(`${id} has unsupported documentation kind ${kind}`);

const slugMap = read("apps/design-lab/src/app/ui/components/[slug]/page.tsx");
const showcase = read("apps/design-lab/src/components/ComponentShowcase.tsx");
for (const id of catalogIds) {
  if (!slugMap.includes(`"${id}"`)) fail(`${id} is missing from the component route map`);
  if (!showcase.includes(`componentId === "${id}"`)) fail(`${id} is missing from ComponentShowcase`);
}

const shell = read("apps/design-lab/src/components/ComponentDocumentation.tsx");
const tokenGenerator = read("scripts/generate-token-css.mjs");
for (const tab of ["Preview", "Design", "Code"]) if (!shell.includes(`"${tab}"`)) fail(`shared shell is missing ${tab}`);
for (const section of ["live", "design", "code"]) if (!shell.includes(`data-documentation-section="${section}"`)) fail(`shared shell is missing ${section} section marker`);
for (const icon of ["pc-case", "sun", "moon"]) if (!shell.includes(`icon: "${icon}"`)) fail(`shared shell is missing ${icon} preview theme control`);
if (!shell.includes("resolvedPreviewTheme") || !shell.includes("data-preview-theme={resolvedPreviewTheme}")) fail("shared shell must resolve and explicitly pass the preview theme");
for (const theme of ["light", "dark"]) if (!tokenGenerator.includes(`[data-preview-theme=\"${theme}\"]`)) fail(`token generator must emit a complete ${theme} preview theme scope`);
if (!shell.includes('variant="ghost"') || !shell.includes("Сбросить")) fail("shared shell must place a ghost reset action in preview tools");
for (const legacy of ["liveDescription", "previewLabel", "controlHeading"]) if (shell.includes(legacy)) fail(`shared shell still contains legacy Live Example element ${legacy}`);

for (const file of ["ButtonShowcase.tsx", "BadgeShowcase.tsx", "CheckboxShowcase.tsx", "IconButtonShowcase.tsx", "StatusShowcase.tsx", "GenericComponentDocs.tsx"]) {
  if (!read(`apps/design-lab/src/components/${file}`).includes("ComponentDocumentation")) fail(`${file} must use the shared shell`);
}

for (const file of fs.readdirSync(path.join(root, "apps/design-lab/src/components")).filter(name => name.endsWith("Showcase.tsx"))) {
  const source = read(`apps/design-lab/src/components/${file}`);
  if (source.includes('const tabs = ["Preview"')) fail(`${file} declares a local documentation shell`);
  if (source.includes("Тема примера")) fail(`${file} places the theme control in Properties instead of preview tools`);
}

const rootAgents = read("AGENTS.md");
const labAgents = read("apps/design-lab/AGENTS.md");
const standardPath = "packages/docs/agents/component-documentation.md";
if (!rootAgents.includes(standardPath)) fail("root AGENTS.md must route agents to the standard");
if (!labAgents.includes("packages/docs/agents/component-documentation.md")) fail("Design Lab AGENTS.md must route agents to the standard");

const requiredAgentDocuments = ["overview", "component-documentation", "create-component", "update-component", "audit-component", "tokens", "checks"];
for (const name of requiredAgentDocuments) {
  const file = `packages/docs/agents/${name}.md`;
  if (!fs.existsSync(path.join(root, file))) fail(`missing agent document ${file}`);
}
const docsCatalog = JSON.parse(read("apps/design-lab/src/lib/docs/catalog.generated.json"));
for (const name of requiredAgentDocuments) {
  const entry = docsCatalog.entries.find(item => item.slug === `agents/${name}`);
  if (!entry || entry.group !== "Для агентов") fail(`agents/${name} is missing from the Для агентов navigation group`);
}

console.log(`PASS component documentation: ${catalogIds.length} registered pages, shared shell and agent rules`);
