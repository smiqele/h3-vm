import type { ReactNode } from "react";
import styles from "./SpecCard.module.css";

export function Tags({ items = [] }: { items?: unknown[] }) { return <div className={styles.tags}>{items.map((item) => <code key={String(item)}>{String(item)}</code>)}</div>; }
export function SpecCard({ id, title, status = "prototype", children }: { id: string; title: string; status?: string; children?: ReactNode }) { return <article className={styles.card}><div className={styles.meta}><code>{id}</code><span data-status={status}>{status}</span></div><h2>{title}</h2>{children}</article>; }
