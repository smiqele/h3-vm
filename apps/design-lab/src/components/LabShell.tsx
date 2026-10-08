import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import styles from "./LabShell.module.css";
import { getCatalog } from "@/lib/catalog";

export function LabShell({ title, description, eyebrow = "Design Lab", children }: { title: string; description?: string; eyebrow?: string | null; children: ReactNode; controls?: boolean }) {
  const catalog = getCatalog();
  const componentItems = [...catalog.ui.components.primitives, ...catalog.ui.components.components].map((item) => ({ id: item.id, name: item.name || item.id }));
  const tokenGroups = {
    semantic: Object.keys(catalog.ui.tokens.semantic),
    core: Object.keys(catalog.ui.tokens.core),
    components: Object.keys(catalog.ui.tokens.components),
  };
  return <><AppSidebar variant="design" componentItems={componentItems} tokenGroups={tokenGroups}/><main className={styles.shell}><header className={styles.header}><div>{eyebrow&&<p>{eyebrow}</p>}<h1>{title}</h1>{description&&<span>{description}</span>}</div></header><div className={styles.content}>{children}</div></main></>;
}
