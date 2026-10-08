import { LabShell } from "@/components/LabShell";
import { SpecCard, Tags } from "@/components/SpecCard";
import { getCatalog } from "@/lib/catalog";

export default function ScreensPage() {
  const screens = getCatalog().ux.screens.screens;
  return <LabShell title="Экраны" description="Декларации блоков, состояний и UX-паттернов."><div className="card-grid">{screens.map((item) => { const blocks = item.blocks as Array<{component:string}>; return <SpecCard key={item.id} id={item.id} title={item.title || item.id} status={String(item.status || "prototype")}><p><code>{String(item.route)}</code></p><p className="section-label">Паттерн</p><Tags items={[item.pattern]}/><p className="section-label">Компоненты</p><Tags items={blocks.map((block) => block.component)}/></SpecCard>; })}</div></LabShell>;
}
