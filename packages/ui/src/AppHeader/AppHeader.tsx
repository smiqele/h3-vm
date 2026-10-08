"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { useAppShell } from "../AppShell/AppShellContext";
import styles from "./AppHeader.module.css";

export interface AppHeaderProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  actions?: ReactNode;
  scrolledActions?: ReactNode;
}

export function AppHeader({ children, actions, scrolledActions, className, ...headerProps }: AppHeaderProps) {
  const { pageActionsOccluded } = useAppShell();

  return (
    <header
      {...headerProps}
      className={[styles.appHeader, className].filter(Boolean).join(" ")}
    >
      <div className={styles.context}>{children}</div>
      {actions && <div className={styles.actions}>{actions}</div>}
      {scrolledActions && (
        <div className={styles.scrolledActions} data-visible={pageActionsOccluded || undefined}>
          {scrolledActions}
        </div>
      )}
    </header>
  );
}
