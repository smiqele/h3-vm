"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { DocumentEntry } from "@/lib/docs";
import styles from "./AppSidebar.module.css";

type ComponentItem = { id: string; name: string };
export type TokenGroups = { semantic: string[]; core: string[]; components: string[] };
type Props =
  | { variant: "design"; componentItems: ComponentItem[]; tokenGroups: TokenGroups }
  | { variant: "docs"; documents: DocumentEntry[] };

let sidebarPositionedAfterLoad = false;

const componentSlug: Record<string, string> = {
  "primitive.logo": "logo", "primitive.icon": "icon", "primitive.badge": "badge", "primitive.button": "button", "primitive.icon-button": "icon-button", "primitive.avatar": "avatar", "primitive.text-field": "text-field", "primitive.status": "status", "primitive.metric-indicator": "metric-indicator",
  "primitive.stack": "stack", "primitive.checkbox": "checkbox", "primitive.radio": "radio", "component.app-shell": "app-shell", "component.sidebar-nav": "sidebar-nav", "component.nav-link": "nav-link", "component.sidebar-context-switcher": "sidebar-context-switcher", "component.context-path": "context-path", "component.app-header": "app-header", "component.page-header": "page-header", "component.metrics-summary": "metrics-summary", "component.dropdown-menu": "dropdown-menu", "component.data-table": "data-table", "component.form": "form", "component.inline-alert": "inline-alert",
};

function NavLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const active = pathname === href;
  return <Link href={href} className={active ? styles.active : undefined} aria-current={active ? "page" : undefined}>{label}</Link>;
}

function PersistentDetails({ id, label, children, openForCurrentPage = false }: { id: string; label: string; children: ReactNode; openForCurrentPage?: boolean }) {
  const storageKey = `app-sidebar:${id}`;
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const nextOpen = openForCurrentPage || window.localStorage.getItem(storageKey) === "open";
    setOpen(nextOpen);
    if (openForCurrentPage) window.localStorage.setItem(storageKey, "open");
  }, [openForCurrentPage, storageKey]);
  const toggle = () => setOpen(current => {
    const next = !current;
    window.localStorage.setItem(storageKey, next ? "open" : "closed");
    return next;
  });
  return <details open={open}><summary onClick={event => { event.preventDefault(); toggle(); }}>{label}</summary>{children}</details>;
}

function tokenLabel(name: string) {
  return name.split("-").map(part => part[0].toUpperCase() + part.slice(1)).join(" ");
}

function DesignNavigation({ componentItems, tokenGroups, pathname }: { componentItems: ComponentItem[]; tokenGroups: TokenGroups; pathname: string }) {
  const variableLink = (group: string, section?: string) => `/ui/foundation/variables/${group}${section ? `/${section}` : ""}`;
  const onInitialPage = (prefix: string) => !sidebarPositionedAfterLoad && pathname.startsWith(prefix);
  if (pathname.startsWith("/ux")) return <section><p>UX · Правила и сценарии</p><NavLink href="/ux/patterns" label="Паттерны" pathname={pathname}/><NavLink href="/ux/screens" label="Экраны" pathname={pathname}/><NavLink href="/ux/screens/vm-overview-concept" label="Discovery · обзор ВМ" pathname={pathname}/><NavLink href="/ux/cjm" label="CJM" pathname={pathname}/></section>;
  return <section>
    <PersistentDetails id="ui.variables" label="Переменные" openForCurrentPage={onInitialPage("/ui/foundation/variables")}><div className={styles.tree}>
      <PersistentDetails id="ui.variables.semantic" label="Semantic" openForCurrentPage={onInitialPage("/ui/foundation/variables/semantic")}><div className={styles.tree}>{tokenGroups.semantic.map(name => <NavLink key={name} href={variableLink("semantic", name)} label={tokenLabel(name)} pathname={pathname}/>)}</div></PersistentDetails>
      <PersistentDetails id="ui.variables.core" label="Core" openForCurrentPage={onInitialPage("/ui/foundation/variables/core")}><div className={styles.tree}>{tokenGroups.core.map(name => <NavLink key={name} href={variableLink("core", name)} label={tokenLabel(name)} pathname={pathname}/>)}</div></PersistentDetails>
      <NavLink href={variableLink("layout")} label="Layout" pathname={pathname}/>
      <PersistentDetails id="ui.variables.components" label="Component tokens" openForCurrentPage={onInitialPage("/ui/foundation/variables/components")}><div className={styles.tree}>{tokenGroups.components.map(name => <NavLink key={name} href={variableLink("components", name)} label={tokenLabel(name)} pathname={pathname}/>)}</div></PersistentDetails>
    </div></PersistentDetails>
    <PersistentDetails id="ui.typography" label="Типографика" openForCurrentPage={onInitialPage("/ui/foundation/typography")}><div className={styles.tree}>{["Heading", "Body", "Code", "Label", "Caption"].map(label => <NavLink key={label} href={`/ui/foundation/typography/${label.toLowerCase()}`} label={label} pathname={pathname}/>)}</div></PersistentDetails>
    <PersistentDetails id="ui.components" label="Компоненты" openForCurrentPage={onInitialPage("/ui/components")}><div className={styles.tree}>{componentItems.map(item => <NavLink key={item.id} href={`/ui/components/${componentSlug[item.id] || item.id.replaceAll(".", "-")}`} label={item.name} pathname={pathname}/>)}</div></PersistentDetails>
  </section>;
}

function DocsNavigation({ documents, pathname }: { documents: DocumentEntry[]; pathname: string }) {
  const primary = documents.filter(item => !item.group);
  const groups = Object.groupBy(documents.filter(item => item.group), item => item.group!);
  return <section>{primary.map(item => <NavLink key={item.slug} href={`/docs/${item.slug}`} label={item.label} pathname={pathname}/>)}{Object.entries(groups).map(([group, items]) => { const containsCurrentPage = items!.some(item => pathname === `/docs/${item.slug}`); return <PersistentDetails id={`docs.${group.toLowerCase()}`} label={group} key={group} openForCurrentPage={!sidebarPositionedAfterLoad && containsCurrentPage}><div className={styles.tree}>{items!.map(item => <NavLink key={item.slug} href={`/docs/${item.slug}`} label={item.label} pathname={pathname}/>)}</div></PersistentDetails>; })}</section>;
}

export function AppSidebar(props: Props) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (sidebarPositionedAfterLoad) return;
    const sidebar = sidebarRef.current;
    const active = sidebar?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!sidebar || !active) return;
    const positionActiveItem = () => {
      const activeCenter = active.getBoundingClientRect().top + active.offsetHeight / 2;
      const viewportMiddle = window.innerHeight / 2;
      if (activeCenter > viewportMiddle) sidebar.scrollTop += activeCenter - viewportMiddle;
      sidebarPositionedAfterLoad = true;
    };
    const firstFrame = requestAnimationFrame(() => requestAnimationFrame(positionActiveItem));
    return () => cancelAnimationFrame(firstFrame);
  }, []);

  return <aside className={styles.sidebar} ref={sidebarRef}>
    <nav aria-label={props.variant === "docs" ? "Документация" : "Навигация Design Lab"}>
      {props.variant === "docs" ? <DocsNavigation documents={props.documents} pathname={pathname}/> : <DesignNavigation componentItems={props.componentItems} tokenGroups={props.tokenGroups} pathname={pathname}/>} 
    </nav>
    {props.variant === "design" && <footer><span>Next.js · token driven</span><code>v0.3</code></footer>}
  </aside>;
}
