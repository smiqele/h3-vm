import type { HTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "../Icon/Icon";
import styles from "./Status.module.css";

export type StatusTone = "positive" | "neutral" | "progress" | "warning" | "danger" | "unknown";

export interface StatusProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  children: ReactNode;
  tone?: StatusTone;
  animated?: boolean;
  /** Replaces the dot while preserving the marker area's geometry and tone. */
  icon?: IconName;
  emphasis?: "primary" | "secondary";
}

export function Status({
  children,
  tone = "neutral",
  animated = false,
  icon,
  emphasis = "primary",
  className,
  ...props
}: StatusProps) {
  return (
    <span
      {...props}
      className={[styles.status, className].filter(Boolean).join(" ")}
      data-tone={tone}
      data-animated={animated || undefined}
      data-emphasis={emphasis}
    >
      <span className={styles.marker} data-icon={icon || undefined} aria-hidden="true">
        {icon && <span className={styles.markerIcon}><Icon name={icon} size="inherit" /></span>}
      </span>
      <span className={styles.label}>{children}</span>
    </span>
  );
}
