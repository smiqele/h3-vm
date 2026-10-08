import type { HTMLAttributes, ReactNode } from "react";
import styles from "./InlineAlert.module.css";

export type InlineAlertTone = "info" | "success" | "warning" | "danger";

export interface InlineAlertProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  tone?: InlineAlertTone;
  actions?: ReactNode;
  children?: ReactNode;
}

export function InlineAlert({ title, tone = "info", actions, children, className, ...props }: InlineAlertProps) {
  return (
    <section
      {...props}
      className={[styles.alert, className].filter(Boolean).join(" ")}
      data-tone={tone}
      role={tone === "danger" ? "alert" : props.role}
    >
      <div className={styles.content}>
        <strong>{title}</strong>
        {children && <div className={styles.description}>{children}</div>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </section>
  );
}
