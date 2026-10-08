"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { AppShellProvider } from "./AppShellContext";
import styles from "./AppShell.module.css";

export interface AppShellProps {
  sidebar: ReactNode;
  header: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AppShell({ sidebar, header, aside, children, className }: AppShellProps) {
  const [headerSeparated, setHeaderSeparated] = useState(false);
  const [pageActionsOccluded, setPageActionsOccluded] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateScrollState = () => {
      setHeaderSeparated(window.scrollY > 0);

      const pageActions = mainRef.current?.querySelector<HTMLElement>("[data-ui-page-header-actions]");
      const stickyHeader = headerRef.current;
      setPageActionsOccluded(Boolean(
        pageActions
        && stickyHeader
        && pageActions.getBoundingClientRect().top <= stickyHeader.getBoundingClientRect().bottom,
      ));
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  return (
    <AppShellProvider value={{ pageActionsOccluded }}>
      <div
        className={[styles.appShell, className].filter(Boolean).join(" ")}
        data-has-aside={Boolean(aside)}
      >
        <aside className={styles.sidebar}>{sidebar}</aside>

        <div className={styles.contentArea} data-header-separated={headerSeparated}>
          <div className={styles.header} ref={headerRef}>{header}</div>
          <main className={styles.main} ref={mainRef}>{children}</main>
        </div>

        {aside && <aside className={styles.aside}>{aside}</aside>}
      </div>
    </AppShellProvider>
  );
}
