"use client";

import { Checkbox } from "@cloud/ui";
import { useState, type ComponentProps } from "react";
import { ComponentDocumentation, type DocumentationPropRow } from "./ComponentDocumentation";
import styles from "./ComponentDocumentation.module.css";

type CheckboxState = "unchecked" | "checked" | "indeterminate";
type CheckboxSize = NonNullable<ComponentProps<typeof Checkbox>["size"]>;

const props: DocumentationPropRow[] = [
  { name: "indeterminate", type: "boolean", defaultValue: "false", description: "Показывает смешанное состояние и синхронизирует одноимённое DOM-свойство input." },
  { name: "size", type: '"sm" | "md"', defaultValue: '"md"', description: "Размер визуального контрола: 16 или 20 px." },
  { name: "checked", type: "boolean", description: "Текущее значение в controlled-сценарии." },
  { name: "defaultChecked", type: "boolean", defaultValue: "false", description: "Начальное значение в uncontrolled-сценарии." },
  { name: "onChange", type: "ChangeEventHandler<HTMLInputElement>", description: "Вызывается при изменении значения нативного input." },
  { name: "disabled", type: "boolean", defaultValue: "false", description: "Отключает изменение значения и исключает контрол из отправки формы." },
  { name: "aria-invalid", type: "boolean | \"true\" | \"false\"", defaultValue: "false", description: "Включает визуальное состояние ошибки; текст ошибки связывается отдельно." },
];

export function CheckboxShowcase() {
  const [state, setState] = useState<CheckboxState>("unchecked");
  const [size, setSize] = useState<CheckboxSize>("md");
  const [disabled, setDisabled] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [theme, setTheme] = useState("inherit");

  const checked = state === "checked";
  const indeterminate = state === "indeterminate";
  const code = [
    'import { Checkbox } from "@cloud/ui";',
    "",
    "<Checkbox",
    `  size="${size}"`,
    ...(checked ? ["  checked"] : []),
    ...(indeterminate ? ["  indeterminate"] : []),
    ...(disabled ? ["  disabled"] : []),
    ...(invalid ? ['  aria-invalid="true"'] : []),
    '  aria-label="Выбрать строку"',
    "  onChange={handleChange}",
    "/>",
  ].join("\n");

  const reset = () => {
    setState("unchecked");
    setSize("md");
    setDisabled(false);
    setInvalid(false);
    setTheme("inherit");
  };

  const controls = <>
    <label className={styles.control}><span>state<small>Визуальное и логическое состояние</small></span><select value={state} onChange={event => setState(event.target.value as CheckboxState)}><option value="unchecked">unchecked</option><option value="checked">checked</option><option value="indeterminate">indeterminate</option></select></label>
    <label className={styles.control}><span>size<small>Размер видимого контрола</small></span><select value={size} onChange={event => setSize(event.target.value as CheckboxSize)}><option value="sm">sm · 16 px</option><option value="md">md · 20 px</option></select></label>
    <label className={styles.control}><span>disabled<small>Запрещает изменение значения</small></span><Checkbox checked={disabled} onChange={event => setDisabled(event.target.checked)} /></label>
    <label className={styles.control}><span>aria-invalid<small>Визуальное состояние ошибки</small></span><Checkbox checked={invalid} onChange={event => setInvalid(event.target.checked)} /></label>
  </>;

  const design = <>
    <div><p className={styles.eyebrow}>DESIGN GUIDELINES</p><h2>Независимый выбор нескольких значений</h2><p>Checkbox включает или выключает параметр либо выбирает элементы в наборе. Для взаимоисключающего выбора используйте Radio, для немедленного переключения настройки — Switch.</p></div>
    <div className={styles.variantList}>
      <article><div><Checkbox aria-label="Не выбрано" /></div><h3>Unchecked</h3><p>Параметр или элемент не выбран.</p></article>
      <article><div><Checkbox aria-label="Выбрано" defaultChecked /></div><h3>Checked</h3><p>Параметр или элемент выбран.</p></article>
      <article><div><Checkbox aria-label="Выбрано частично" indeterminate /></div><h3>Indeterminate</h3><p>Родительский пункт содержит и выбранные, и невыбранные элементы.</p></article>
    </div>
    <div><h2>Anatomy и геометрия</h2><p>Компонент — нативный input без встроенной подписи. Размер sm — 16×16 px, md — 20×20 px; radius — 4 px. Check mark — 14/18 px, indeterminate mark — 8/10×2 px. В форме помещайте контрол и текст в общий label с интерактивной областью не менее 44×44 px.</p></div>
    <div className={styles.guidelines}><article><h3>States и behavior</h3><p>Поддерживаются unchecked, checked, indeterminate, hover, focus, invalid и disabled. Клик по indeterminate переводит контрол в checked или unchecked; дальнейшее состояние хранит потребитель.</p></article><article><h3>Content и accessibility</h3><p>Видимая подпись должна описывать выбранное значение. Без подписи обязателен aria-label. Space меняет значение; focus-visible остаётся заметным. Ошибку связывайте через aria-describedby.</p></article></div>
    <div><h2>Tokens и связанные компоненты</h2><p>Размер, marks, radius, border, surface, focus, disabled и motion задаются `selection-control/*`. Radio применяется для единственного выбора, DataTable использует Checkbox для выбора строк.</p></div>
  </>;

  return <ComponentDocumentation
    id="primitive.checkbox"
    title="Checkbox"
    preview={<Checkbox size={size} checked={checked} indeterminate={indeterminate} disabled={disabled} aria-invalid={invalid || undefined} aria-label="Выбрать строку" onChange={event => setState(event.target.checked ? "checked" : "unchecked")} />}
    feedback={`Состояние: ${state} · ${size === "sm" ? "16" : "20"} px`}
    controls={controls}
    onReset={reset}
    theme={theme}
    onThemeChange={setTheme}
    design={design}
    code={code}
    props={props}
    codeNote={<><p>Checkbox принимает остальные атрибуты нативного input, включая name, value, required и form. Свойство readOnly намеренно исключено: для запрета изменения используйте disabled.</p><p>В controlled-сценарии обновляйте checked в onChange. Indeterminate — отдельное визуально-семантическое состояние; компонент выставляет DOM property и aria-checked=&quot;mixed&quot;.</p></>}
  />;
}
