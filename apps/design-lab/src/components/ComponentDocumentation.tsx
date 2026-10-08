"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button, IconButton } from "@cloud/ui";
import styles from "./ComponentDocumentation.module.css";

export interface DocumentationPropRow {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
}

export interface ComponentDocumentationProps {
  id: string;
  title: string;
  preview: ReactNode;
  controls: ReactNode;
  onReset: () => void;
  design: ReactNode;
  code: string;
  props: readonly DocumentationPropRow[];
  theme?: string;
  onThemeChange?: (theme: "inherit" | "light" | "dark") => void;
  feedback?: ReactNode;
  codeDescription?: string;
  codeNote?: ReactNode;
}

const tabs = ["Preview", "Design", "Code"];

const previewThemes = [
  { value: "inherit", icon: "pc-case", label: "Системная тема" },
  { value: "light", icon: "sun", label: "Светлая тема" },
  { value: "dark", icon: "moon", label: "Тёмная тема" },
] as const;

export function ComponentDocumentation({ id, title, preview, controls, onReset, design, code, props, theme = "inherit", onThemeChange, feedback, codeDescription = "Пример синхронизирован с параметрами из Preview.", codeNote }: ComponentDocumentationProps) {
  const [active, setActive] = useState(0);
  const [copyStatus, setCopyStatus] = useState("");
  const [designLabTheme, setDesignLabTheme] = useState<"light" | "dark">("dark");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const prefix = id.replaceAll(".", "-");
  const resolvedPreviewTheme = theme === "inherit" ? designLabTheme : theme;

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => setDesignLabTheme(root.dataset.theme === "light" ? "light" : "dark");
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return <div className={styles.root} data-documentation-shell="true">
    <div className={styles.tabs} role="tablist" aria-label={`Документация ${title}`}>
      {tabs.map((tab, index) => <button key={tab} role="tab" id={`${prefix}-tab-${index}`} aria-controls={`${prefix}-panel-${index}`} aria-selected={active === index} tabIndex={active === index ? 0 : -1} ref={node => { tabRefs.current[index] = node; }} onClick={() => setActive(index)} onKeyDown={event => {
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault(); setActive(next); tabRefs.current[next]?.focus();
      }}>{tab}</button>)}
    </div>

    <section role="tabpanel" id={`${prefix}-panel-0`} aria-labelledby={`${prefix}-tab-0`} hidden={active !== 0} tabIndex={0} data-documentation-section="live">
      <div className={styles.playground}>
        <div className={styles.preview} data-preview-theme={resolvedPreviewTheme} data-preview-theme-mode={theme}>
          <div className={styles.previewTools}>
            <div className={styles.themeTabs} role="group" aria-label="Тема примера">
              {previewThemes.map(item => <IconButton key={item.value} className={styles.themeTab} icon={item.icon} label={item.label} size="compact" aria-pressed={theme === item.value} onClick={() => onThemeChange?.(item.value)} />)}
            </div>
            <Button variant="ghost" onClick={onReset}>Сбросить</Button>
          </div>
          {preview}
          {feedback && <span className={styles.feedback} role="status">{feedback}</span>}
        </div>
        <div className={styles.controls}>
          {controls}
        </div>
      </div>
    </section>

    <section className={styles.docs} role="tabpanel" id={`${prefix}-panel-1`} aria-labelledby={`${prefix}-tab-1`} hidden={active !== 1} tabIndex={0} data-documentation-section="design">{design}</section>

    <section className={styles.docs} role="tabpanel" id={`${prefix}-panel-2`} aria-labelledby={`${prefix}-tab-2`} hidden={active !== 2} tabIndex={0} data-documentation-section="code">
      <div><p className={styles.eyebrow}>REACT COMPONENT</p><h2>Использование</h2><p>{codeDescription}</p></div>
      <div className={styles.codeBlock}><div className={styles.codeHeading}><span>{title}.tsx</span><button onClick={async () => { try { await navigator.clipboard.writeText(code); setCopyStatus("Скопировано"); } catch { setCopyStatus("Не удалось скопировать. Выделите код вручную."); } }}>Копировать код</button></div><pre><code>{code}</code></pre><span className={styles.copyStatus} role="status">{copyStatus}</span></div>
      <div><h2>Props</h2><div className={styles.tableScroll}><table><thead><tr><th>Свойство</th><th>Тип</th><th>По умолчанию</th><th>Описание</th></tr></thead><tbody>{props.map(row => <tr key={row.name}><td><code>{row.name}</code></td><td><code>{row.type}</code></td><td><code>{row.defaultValue ?? "—"}</code></td><td>{row.description}</td></tr>)}</tbody></table></div>{codeNote}</div>
    </section>
  </div>;
}
