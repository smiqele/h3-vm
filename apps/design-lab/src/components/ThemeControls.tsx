"use client";

import { useEffect, useState } from "react";
import { Icon } from "@cloud/ui";
import styles from "./ThemeControls.module.css";

type Theme = "dark" | "light";

export function ThemeControls() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("design-theme") as Theme | null;
    const initialTheme = storedTheme || "dark";

    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("design-theme", theme);
  }, [theme, ready]);

  return (
    <button
      className={styles.control}
      type="button"
      aria-label={`Переключить на ${theme === "dark" ? "светлую" : "тёмную"} тему`}
      aria-pressed={theme === "dark"}
      onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}
    >
      <Icon name={theme === "dark" ? "moon" : "sun"} size="sm" />
      <span>{theme === "dark" ? "Тёмная" : "Светлая"}</span>
    </button>
  );
}
