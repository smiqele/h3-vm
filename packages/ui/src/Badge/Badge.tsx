import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Badge.module.css";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  mono?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function Badge({ children, mono = false, leadingIcon, trailingIcon, className, ...props }: BadgeProps) {
  return <span
    {...props}
    className={[styles.badge, className].filter(Boolean).join(" ")}
    data-mono={mono || undefined}
    data-icon-leading={Boolean(leadingIcon) || undefined}
    data-icon-trailing={Boolean(trailingIcon) || undefined}
  >
    {leadingIcon && <span className={styles.icon}>{leadingIcon}</span>}
    <span className={styles.label}>{children}</span>
    {trailingIcon && <span className={styles.icon}>{trailingIcon}</span>}
  </span>;
}
