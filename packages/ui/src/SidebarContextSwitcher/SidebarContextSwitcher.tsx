import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import styles from "./SidebarContextSwitcher.module.css";

export interface SidebarContextSwitcherProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  workspace: string;
  project: string;
  serviceLabel?: ReactNode;
}

export function SidebarContextSwitcher({ workspace, project, serviceLabel, className, ...props }: SidebarContextSwitcherProps) {
  return (
    <Button
      {...props}
      variant="soft"
      className={[styles.switcher, className].filter(Boolean).join(" ")}
      leadingIcon={<Icon name="cloud" size="inherit" />}
      trailingIcon={<Icon name="chevrons-up-down" size="inherit" />}
    >
      <span className={styles.content}>
        <span className={styles.names}>
          <span>{workspace}</span>
          <span className={styles.project}>⌙ {project}</span>
        </span>
        {serviceLabel && <span className={styles.service}>{serviceLabel}</span>}
      </span>
    </Button>
  );
}
