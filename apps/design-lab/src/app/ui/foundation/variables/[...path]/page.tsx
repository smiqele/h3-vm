import { notFound, redirect } from "next/navigation";
import { Badge } from "@cloud/ui";
import { LabShell } from "@/components/LabShell";
import { getCatalog } from "@/lib/catalog";

type Mode = "light" | "dark";
type Token = { $type?: string; $value: unknown };
type Row = { path: string; token: Token };
type TokenRoot = Record<string, Record<string, unknown>>;

const descriptions: Record<string, string> = {
  semantic: "Семантические роли интерфейса для Light и Dark.",
  core: "Базовые значения, не зависящие от темы.",
  layout: "Размеры и отступы каркаса консоли.",
  components: "Переменные конкретного UI-компонента.",
};

function tokenPages() {
  const root = getCatalog().ui.tokens;
  return [
    ...Object.keys(root.semantic).map(section => ["semantic", section]),
    ...Object.keys(root.core).map(section => ["core", section]),
    ["layout"],
    ...Object.keys(root.components).map(section => ["components", section]),
  ];
}

function flatten(node: unknown, prefix: string[] = [], result: Row[] = []): Row[] {
  if (node && typeof node === "object" && "$value" in node) result.push({ path: prefix.join("."), token: node as Token });
  else if (node && typeof node === "object") for (const [key, child] of Object.entries(node)) if (!key.startsWith("$")) flatten(child, [...prefix, key], result);
  return result;
}

function lookup(root: TokenRoot, reference: string): Token | undefined {
  const parts = reference.slice(1, -1).split(".");
  if (parts[0] === "component") parts[0] = "components";
  return parts.reduce<unknown>((node, key) => node && typeof node === "object" ? (node as Record<string, unknown>)[key] : undefined, root) as Token | undefined;
}

function raw(token: Token, mode: Mode) {
  return token.$value && typeof token.$value === "object" ? (token.$value as Record<Mode, unknown>)[mode] : token.$value;
}

function resolve(root: TokenRoot, token: Token, mode: Mode) {
  let value = raw(token, mode);
  let alias: string | undefined;
  const seen = new Set<string>();
  while (typeof value === "string" && /^\{.+\}$/.test(value) && !seen.has(value)) {
    seen.add(value);
    alias = value;
    const target = lookup(root, value);
    if (!target) break;
    value = raw(target, mode);
  }
  return { alias: alias || String(value), value: String(value) };
}

function isThemed(root: TokenRoot, token: Token, seen = new Set<string>()): boolean {
  if (token.$type === "color") return true;
  const value = token.$value;
  if (value && typeof value === "object" && "light" in value && "dark" in value) return JSON.stringify(value.light) !== JSON.stringify(value.dark);
  if (typeof value !== "string" || !/^\{.+\}$/.test(value) || seen.has(value)) return false;
  seen.add(value);
  const target = lookup(root, value);
  return target ? isThemed(root, target, seen) : false;
}

function Alias({ root, token, mode }: { root: TokenRoot; token: Token; mode: Mode }) {
  const result = resolve(root, token, mode);
  const color = token.$type === "color" && result.value.startsWith("#");
  return <span className="alias-cell">{color && <i style={{ background: result.value }} />}<span><Badge>{result.alias}</Badge>{result.alias !== result.value && <small>{result.value}</small>}</span></span>;
}

function TokenTable({ root, rows, prefix, themed }: { root: TokenRoot; rows: Row[]; prefix: string; themed: boolean }) {
  if (!rows.length) return null;
  return <section className="variable-section">
    <h2>{themed ? "Theme dependent" : "Theme independent"}</h2>
    <div className={`variables-table ${themed ? "is-themed" : "is-single-mode"}`}>
      <div className="variables-row variables-head"><span>Token</span><span>{themed ? "Alias (light)" : "Alias"}</span>{themed && <span>Alias (dark)</span>}</div>
      {rows.map(({ path, token }) => <div className="variables-row" key={path}><span className="token-cell"><Badge>{prefix}.{path}</Badge></span><Alias root={root} token={token} mode="light" />{themed && <Alias root={root} token={token} mode="dark" />}</div>)}
    </div>
  </section>;
}

export function generateStaticParams() {
  return tokenPages().map(path => ({ path }));
}

export default async function VariablePage({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const [group, section] = path;
  const pages = tokenPages();
  if (path.length === 1 && group === "semantic") redirect(`/ui/foundation/variables/semantic/${pages.find(item => item[0] === "semantic")?.[1]}`);
  if (path.length === 1 && group === "core") redirect(`/ui/foundation/variables/core/${pages.find(item => item[0] === "core")?.[1]}`);
  if (path.length === 1 && group === "components") redirect(`/ui/foundation/variables/components/${pages.find(item => item[0] === "components")?.[1]}`);
  if (!pages.some(candidate => candidate.join("/") === path.join("/"))) notFound();

  const root = getCatalog().ui.tokens as TokenRoot;
  const source = (section ? root[group]?.[section] : root[group]) as Record<string, unknown>;
  const rows = flatten(source);
  const themedRows = rows.filter(row => isThemed(root, row.token));
  const invariantRows = rows.filter(row => !isThemed(root, row.token));
  const prefix = [group, section].filter(Boolean).join(".");
  const title = section ? section[0].toUpperCase() + section.slice(1) : "Layout";
  const sourcePath = group === "layout" ? "layout.json" : `${group}/${section}.json`;

  return <LabShell title={title} description={descriptions[group]}>
    <div className="variables-intro"><p>Источник истины</p><code>packages/ui/tokens/{sourcePath}</code><strong>{rows.length} tokens</strong></div>
    <TokenTable root={root} rows={invariantRows} prefix={prefix} themed={false} />
    <TokenTable root={root} rows={themedRows} prefix={prefix} themed />
  </LabShell>;
}
