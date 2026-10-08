import { notFound } from "next/navigation";
import { Badge } from "@cloud/ui";
import { LabShell } from "@/components/LabShell";
import { getCatalog } from "@/lib/catalog";

const sections = ["heading", "body", "code", "label", "caption"] as const;
type Section = (typeof sections)[number];
type Token = { $value: string | number };

const titles: Record<Section, string> = { heading: "Heading", body: "Body", code: "Code", label: "Label", caption: "Caption" };
const propertyLabels: Record<string, string> = { fontFamily: "Font", fontWeight: "Weight", fontSize: "Size", lineHeight: "Line height", letterSpacing: "Letter spacing" };

function tokenAt(root: Record<string, unknown>, reference: string): Token {
  return reference.slice(1, -1).split(".").reduce<unknown>((node, key) => node && typeof node === "object" ? (node as Record<string, unknown>)[key] : undefined, root) as Token;
}

function displayValue(property: string, value: string | number) {
  if (typeof value === "string" || property === "fontWeight") return String(value);
  return `${value}px`;
}

export function generateStaticParams() { return sections.map((section) => ({ section })); }

export default async function TypographyPage({ params }: { params: Promise<{ section: string }> }) {
  const { section: rawSection } = await params;
  if (!sections.includes(rawSection as Section)) notFound();
  const section = rawSection as Section;
  const catalog = getCatalog().ui;
  const styles = catalog.styles.typography[section];
  const tokens = catalog.tokens as Record<string, unknown>;

  return <LabShell title={titles[section]} description={`Составные типографические стили ${titles[section].toLowerCase()}, связанные с токенами.`}>
    <div className="variables-intro"><p>Источник истины</p><code>packages/ui/styles/typography.json</code><strong>{Object.keys(styles).length} styles</strong></div>
    <div className="typography-styles">{Object.entries(styles).map(([size, style]) => <article className="typography-style" key={size}>
      <header><span>Style</span><Badge>{`${section}.${size}`}</Badge></header>
      <div className={`typography-style-preview typography-${section}-${size}`}>Виртуальные машины</div>
      <dl>{Object.entries(style).map(([property, reference]) => <div key={property}><dt>{propertyLabels[property] ?? property}</dt><dd><Badge>{reference.slice(1, -1)}</Badge></dd><dd className="typography-token-value">{displayValue(property, tokenAt(tokens, reference).$value)}</dd></div>)}</dl>
    </article>)}</div>
  </LabShell>;
}
