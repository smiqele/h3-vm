import type { HTMLAttributes, ReactNode } from "react";
import styles from "./PageHeader.module.css";

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  meta,
  actions,
  className,
  ...headerProps
}: PageHeaderProps) {
  return (
    <header
      {...headerProps}
      data-ui-page-header=""
      className={[styles.pageHeader, className].filter(Boolean).join(" ")}
    >
      <div className={styles.content}>
        <h1 className={`${styles.title} typography-heading-lg`}>{title}</h1>
        {meta && <div className={`${styles.meta} typography-caption-sm`}>{meta}</div>}
      </div>

      {actions && <div className={styles.actions} data-ui-page-header-actions="">{actions}</div>}
    </header>
  );
}
