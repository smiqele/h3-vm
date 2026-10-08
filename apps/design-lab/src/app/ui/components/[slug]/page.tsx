import { notFound } from "next/navigation";
import { ComponentShowcase } from "@/components/ComponentShowcase";
import { LabShell } from "@/components/LabShell";
import { getCatalog } from "@/lib/catalog";
const slugToId: Record<string,string> = { logo: "primitive.logo", icon: "primitive.icon", badge: "primitive.badge", button: "primitive.button", "icon-button": "primitive.icon-button", avatar: "primitive.avatar", "text-field": "primitive.text-field", status: "primitive.status", "metric-indicator": "primitive.metric-indicator", tooltip: "primitive.tooltip", stack: "primitive.stack", checkbox: "primitive.checkbox", radio: "primitive.radio", "app-shell": "component.app-shell", "sidebar-nav": "component.sidebar-nav", "nav-link": "component.nav-link", "sidebar-context-switcher": "component.sidebar-context-switcher", "context-path": "component.context-path", "app-header": "component.app-header", "page-header": "component.page-header", "metrics-summary": "component.metrics-summary", "dropdown-menu": "component.dropdown-menu", "data-table": "component.data-table", form: "component.form", "inline-alert": "component.inline-alert" };
export function generateStaticParams() { return Object.keys(slugToId).map((slug) => ({ slug })); }
export default async function ComponentPage({ params }: { params: Promise<{slug:string}> }) {
  const { slug } = await params; const id = slugToId[slug]; if (!id) notFound();
  const catalog = getCatalog(); const item = [...catalog.ui.components.primitives, ...catalog.ui.components.components].find((candidate) => candidate.id === id); if (!item) notFound();
  return <LabShell title={item.name || item.id} eyebrow={null}><section className="showcase-panel"><ComponentShowcase componentId={item.id} spec={item}/></section></LabShell>;
}
