import type { HTMLAttributes, ReactNode } from "react";
import styles from "./ContextPath.module.css";

export interface ContextPathItem {
  label: string;
  href?: string;
  control?: ReactNode;
}

export interface ContextPathProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  items: readonly ContextPathItem[];
  label?: string;
  separator?: "dot" | "|" | "none";
}

export function ContextPath({
  items,
  label = "Текущий контекст",
  separator = "dot",
  className,
  ...navigationProps
}: ContextPathProps) {
  return (
    <nav
      {...navigationProps}
      className={[styles.contextPath, className].filter(Boolean).join(" ")}
      aria-label={label}
    >
      <ol>
        {items.map((item, index) => {
          const current = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className={current ? styles.current : styles.ancestor}
              aria-current={current ? "page" : undefined}
            >
              {item.control ?? (item.href && !current
                ? <a className={styles.itemText} href={item.href}>{item.label}</a>
                : <span className={styles.itemText}>{item.label}</span>)}
              {!current && separator !== "none" && <span className={styles.separator} data-pipe={separator === "|" || undefined} aria-hidden="true">{separator === "|" ? "|" : null}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
