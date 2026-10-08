"use client";

import { useState, type ReactNode } from "react";
import { ComponentDocumentation, type DocumentationPropRow } from "./ComponentDocumentation";
import styles from "./ComponentDocumentation.module.css";
import localStyles from "./GenericComponentDocs.module.css";

export type ComponentSpec = {
  id: string;
  name?: string;
  status?: string;
  properties?: Record<string, unknown>;
  states?: readonly string[];
  rules?: readonly string[];
  tokens?: readonly string[];
  builtFrom?: readonly string[];
  usedBy?: readonly string[];
};

function formatType(value: unknown) {
  if (Array.isArray(value)) return value.map(item => JSON.stringify(item)).join(" | ");
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return "boolean";
  return JSON.stringify(value);
}

export function GenericComponentDocs({ spec, example, code }: { spec: ComponentSpec; example: ReactNode; code: string }) {
  const [theme, setTheme] = useState("inherit");
  const propRows: DocumentationPropRow[] = Object.entries(spec.properties ?? {}).map(([name, value]) => ({
    name,
    type: formatType(value),
    description: "Публичное свойство.",
  }));
  const controls = <>
    {Object.entries(spec.properties ?? {}).map(([name, value]) => <div className={styles.control} key={name}><span>{name}<small>Информационный control; интерактивный control добавляется при миграции страницы</small></span><code>{formatType(value)}</code></div>)}
  </>;
  const design = <>
    <div><p className={styles.eyebrow}>DESIGN GUIDELINES · {spec.status?.toUpperCase()}</p><h2>{spec.name}</h2><p>Компонент следует общей системе поверхностей, состояний, размеров и доступности.</p></div>
    {spec.rules?.length ? <div><h2>Поведение и правила применения</h2><ul className={localStyles.rules}>{spec.rules.map(rule => <li key={rule}>{rule}</li>)}</ul></div> : null}
    {spec.states?.length ? <div><h2>Состояния</h2><div className={localStyles.pills}>{spec.states.map(state => <code key={state}>{state}</code>)}</div></div> : null}
    {spec.builtFrom?.length ? <div><h2>Anatomy и композиция</h2><p>Собран из: {spec.builtFrom.join(", ")}.</p></div> : null}
    <div><h2>Геометрия и токены</h2><div className={localStyles.tokens}>{(spec.tokens ?? []).map(token => <code key={token}>{token}</code>)}</div></div>
    <div className={styles.guidelines}><article><h3>Accessibility</h3><p>Семантика, keyboard и focus должны соответствовать публичному поведению компонента.</p></article><article><h3>Связанные компоненты</h3><p>{spec.usedBy?.length ? `Используется в: ${spec.usedBy.join(", ")}.` : "Связи задаются через builtFrom и usedBy в каталоге."}</p></article></div>
  </>;

  return <ComponentDocumentation
    id={spec.id}
    title={spec.name ?? spec.id}
    preview={<div className={localStyles.example}>{example}</div>}
    controls={controls}
    onReset={() => setTheme("inherit")}
    theme={theme}
    onThemeChange={setTheme}
    design={design}
    code={code}
    props={propRows}
  />;
}
