import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const tokensDir = path.join(root, "packages", "ui", "tokens");
const stylesDir = path.join(root, "packages", "ui", "styles");
const outputs = [
  path.join(root, "apps", "design-lab", "src", "app", "tokens.generated.css"),
  path.join(root, "apps", "prototypes", "src", "app", "tokens.generated.css"),
  path.join(root, "apps", "storybook", "src", "tokens.generated.css"),
];
const read = (name) => JSON.parse(fs.readFileSync(path.join(tokensDir, `${name}.json`), "utf8"));
const readGroup = (name) => Object.fromEntries(fs.readdirSync(path.join(tokensDir, name)).filter((file) => file.endsWith(".json")).sort().map((file) => [path.basename(file, ".json"), JSON.parse(fs.readFileSync(path.join(tokensDir, name, file), "utf8"))]));
const cssName = (pathParts) => `--${pathParts.join("-").replace(/[^a-zA-Z0-9-]/g, "-")}`;
const referenceName = (reference) => { const parts=reference.slice(1,-1).split("."); if(parts[0]==="semantic")parts.shift(); return cssName(parts); };
const value = (token, parts, mode) => {
  const modeValue = token.$value && typeof token.$value === "object" && "light" in token.$value && "dark" in token.$value;
  const raw = modeValue ? token.$value[mode ?? "light"] : token.$value;
  if (typeof raw === "string" && /^\{.+\}$/.test(raw)) return `var(${referenceName(raw)})`;
  if (typeof raw === "number") return parts.join("/").includes("font/weight") || parts.join("/").includes("strokeWeight") ? String(raw) : `${raw}px`;
  if (raw && typeof raw === "object") return null;
  return String(raw);
};
const flatten = (node, prefix = [], out = []) => {
  if (node && typeof node === "object" && "$value" in node) out.push([prefix, node]);
  else if (node && typeof node === "object") for (const [key, child] of Object.entries(node)) if (key !== "$extensions") flatten(child, [...prefix, key], out);
  return out;
};
const coreTokens = readGroup("core");
const semanticTokens = readGroup("semantic");
const componentTokens = readGroup("components");
const tokenRoot = { core: coreTokens, semantic: semanticTokens, component: componentTokens, layout: read("layout") };
const lookupToken = (reference) => reference.slice(1, -1).split(".").reduce((node, key) => node?.[key], tokenRoot);
const isThemedToken = (token, seen = new Set()) => {
  if (token?.$type === "color") return true;
  const raw = token?.$value;
  if (raw && typeof raw === "object" && "light" in raw && "dark" in raw) return JSON.stringify(raw.light) !== JSON.stringify(raw.dark);
  if (typeof raw !== "string" || !/^\{.+\}$/.test(raw) || seen.has(raw)) return false;
  seen.add(raw);
  return isThemedToken(lookupToken(raw), seen);
};
const block = (selector, sets, mode, include = () => true) => `${selector} {\n${sets.flatMap(([prefix, data, source]) => flatten(data).map(([parts, token]) => { if (!include(token, source)) return null; const resolved=value(token,[...prefix,...parts],mode); return resolved===null?null:`  ${cssName([...prefix,...parts])}: ${resolved};`; }).filter(Boolean)).join("\n")}\n}`;
const typography = JSON.parse(fs.readFileSync(path.join(stylesDir, "typography.json"), "utf8"));
const cssProperty = (name) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
const typographyBlocks = Object.entries(typography).flatMap(([group, variants]) => Object.entries(variants).map(([variant, style]) => `.typography-${group}-${variant} {\n${Object.entries(style).map(([property, reference]) => `  ${cssProperty(property)}: var(${referenceName(reference)});`).join("\n")}\n}`)).join("\n\n");
const css = [
  "/* Generated from packages/ui/tokens. Do not edit by hand. */",
  block(":root", [[["core"], coreTokens, "core"], [["layout"], tokenRoot.layout, "layout"], [[], semanticTokens, "semantic"], [["component"], componentTokens, "component"]], undefined, (token, source) => !["semantic", "component"].includes(source) || !isThemedToken(token)),
  block('html[data-theme="light"], [data-preview-theme="light"]', [[[], semanticTokens, "semantic"], [["component"], componentTokens, "component"]], "light", token => isThemedToken(token)),
  block('html[data-theme="dark"], html:not([data-theme]), [data-preview-theme="dark"]', [[[], semanticTokens, "semantic"], [["component"], componentTokens, "component"]], "dark", token => isThemedToken(token)),
  typographyBlocks,
].join("\n\n") + "\n";
for (const output of outputs) fs.writeFileSync(output, css);
console.log(`Generated tokens for ${outputs.map(output => path.relative(root, output)).join(", ")}`);
