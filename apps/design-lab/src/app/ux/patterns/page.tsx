import { LabShell } from "@/components/LabShell";
import { SpecCard, Tags } from "@/components/SpecCard";
import { getCatalog } from "@/lib/catalog";

export default function PatternsPage() {
  const patterns = getCatalog().ux.patterns.patterns;
  return <LabShell title="UX-паттерны" description="Поведение отдельно от конкретных страниц."><div className="card-grid">{patterns.map((item) => <SpecCard key={item.id} id={item.id} title={item.name || item.id} status={String(item.status || "prototype")}><p>{String(item.purpose || item.scope || "")}</p><Tags items={item.components as unknown[]}/>{Array.isArray(item.variants) && <div>{(item.variants as Array<Record<string,string>>).map((variant, index) => <div className="transition" key={index}><span>{variant.from}</span><b>→ {variant.intermediate} →</b><span>{variant.to}</span></div>)}</div>}</SpecCard>)}</div></LabShell>;
}
