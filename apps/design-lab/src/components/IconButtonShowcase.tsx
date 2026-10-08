"use client";

import { Checkbox, IconButton, iconNames, type IconButtonSize, type IconName } from "@cloud/ui";
import { useState } from "react";
import { ComponentDocumentation, type DocumentationPropRow } from "./ComponentDocumentation";
import styles from "./ComponentDocumentation.module.css";
import localStyles from "./IconButtonShowcase.module.css";

const sizes = ["default", "compact", "micro"] as const satisfies readonly IconButtonSize[];
const sizeLabel = (size: IconButtonSize) => size === "default" ? "32" : size === "compact" ? "28" : "24";
const props: DocumentationPropRow[] = [
  { name: "icon", type: "IconName", description: "Иконка из общего реестра, обязательное свойство." },
  { name: "label", type: "string", description: "Доступное название, обязательное свойство." },
  { name: "size", type: '"default" | "compact" | "micro"', defaultValue: '"default"', description: "Размер 32, 28 или 24 px; иконка 16 px." },
  { name: "disabled", type: "boolean", defaultValue: "false", description: "Отключает взаимодействие." },
  { name: "type", type: '"button" | "submit" | "reset"', defaultValue: '"button"', description: "Поведение внутри формы." },
];

export function IconButtonShowcase() {
  const [icon, setIcon] = useState<IconName>("settings");
  const [label, setLabel] = useState("Настройки");
  const [size, setSize] = useState<IconButtonSize>("default");
  const [disabled, setDisabled] = useState(false);
  const [theme, setTheme] = useState("inherit");
  const [clicks, setClicks] = useState(0);
  const code = ['import { IconButton } from "@cloud/ui";', "", "<IconButton", `  icon="${icon}"`, `  label="${label}"`, ...(size !== "default" ? [`  size="${size}"`] : []), ...(disabled ? ["  disabled"] : []), "/>"].join("\n");
  const reset = () => { setIcon("settings"); setLabel("Настройки"); setSize("default"); setDisabled(false); setTheme("inherit"); setClicks(0); };
  const controls = <>
    <label className={styles.control}><span>icon<small>Иконка из общего реестра</small></span><select value={icon} onChange={event => setIcon(event.target.value as IconName)}>{iconNames.map(name => <option key={name}>{name}</option>)}</select></label>
    <label className={styles.control}><span>label<small>Обязательное доступное название</small></span><input value={label} onChange={event => setLabel(event.target.value)} /></label>
    <label className={styles.control}><span>size<small>Размер области кнопки</small></span><select value={size} onChange={event => setSize(event.target.value as IconButtonSize)}>{sizes.map(value => <option key={value}>{value}</option>)}</select></label>
    <label className={styles.control}><span>disabled<small>Недоступное действие</small></span><Checkbox checked={disabled} onChange={event => setDisabled(event.target.checked)} /></label>
  </>;
  const design = <>
    <div><p className={styles.eyebrow}>DESIGN GUIDELINES</p><h2>Компактное действие без подписи</h2><p>IconButton подходит для общеизвестных действий, когда текстовая кнопка заняла бы лишнее место. Если иконка неоднозначна, используйте Button.</p></div>
    <div><h2>Варианты и геометрия</h2><div className={styles.sizeExamples}>{sizes.map(value => <div key={value}><IconButton icon="settings" label={`Настройки, ${value}`} size={value} /><code>{value} · {sizeLabel(value)} px</code></div>)}</div><p>Default используется самостоятельно, compact — в headers и toolbar, micro — для вторичных действий внутри плотного контента, например copy в таблице. Иконка во всех размерах остаётся 16 px.</p></div>
    <div className={styles.guidelines}><article><h3>Anatomy, states и behavior</h3><p>Кнопка содержит material, finish и одну icon. Поддерживает default, hover, pressed, focus и disabled.</p></article><article><h3>Content и accessibility</h3><p>Label описывает действие: «Настройки», «Удалить», «Скопировать», а не внешний вид символа.</p></article></div>
    <div><h2>Tokens и связанные компоненты</h2><p>Размеры задаются `icon-button/*`. Для действия с видимой подписью используйте Button.</p></div>
  </>;
  return <ComponentDocumentation id="primitive.icon-button" title="IconButton" preview={<div className={localStyles.hitAreaPreview}><IconButton icon={icon} label={label || "Действие"} size={size} disabled={disabled} onClick={() => setClicks(value => value + 1)} /><span>{sizeLabel(size)} × {sizeLabel(size)} px</span></div>} feedback={clicks ? `Нажатий: ${clicks}` : "Наведите курсор или нажмите на кнопку"} controls={controls} onReset={reset} theme={theme} onThemeChange={setTheme} design={design} code={code} props={props} codeNote={<p>Принимает стандартные атрибуты HTML-кнопки, кроме children и aria-label.</p>} />;
}
