"use client";

import { Checkbox, Status, type IconName, type StatusTone } from "@cloud/ui";
import { useState } from "react";
import { ComponentDocumentation, type DocumentationPropRow } from "./ComponentDocumentation";
import styles from "./ComponentDocumentation.module.css";
import statusStyles from "./StatusShowcase.module.css";

const tones = [
  { value: "positive", label: "В норме", description: "Ресурс активен и работает штатно." },
  { value: "neutral", label: "Неактивно", description: "Штатное неактивное состояние без ошибки." },
  { value: "progress", label: "В процессе", description: "Выполняется операция или переход." },
  { value: "warning", label: "Требует внимания", description: "Есть ограничения или условия." },
  { value: "danger", label: "Ошибка", description: "Сбой или недоступность ресурса." },
  { value: "unknown", label: "Нет данных", description: "Состояние неизвестно; используется полый маркер." },
] as const;
const props: DocumentationPropRow[] = [
  { name: "children", type: "ReactNode", description: "Видимая подпись, обязательное свойство." },
  { name: "tone", type: tones.map(item => `"${item.value}"`).join(" | "), defaultValue: '"neutral"', description: "Смысловой тон индикатора." },
  { name: "animated", type: "boolean", defaultValue: "false", description: "Включает пульсацию полупрозрачного фона." },
  { name: "icon", type: "IconName", description: "Опциональная иконка 12 px вместо круглого маркера." },
  { name: "emphasis", type: '"primary" | "secondary"', defaultValue: '"primary"', description: "Цвет подписи без изменения tone маркера." },
  { name: "className", type: "string", description: "Дополнительный CSS-класс." },
];

export function StatusShowcase() {
  const [tone, setTone] = useState<StatusTone>("positive");
  const [label, setLabel] = useState("В норме");
  const [animated, setAnimated] = useState(false);
  const [icon, setIcon] = useState<"" | IconName>("");
  const [emphasis, setEmphasis] = useState<"primary" | "secondary">("primary");
  const [theme, setTheme] = useState("inherit");
  const [narrow, setNarrow] = useState(false);
  const code = ['import { Status } from "@cloud/ui";', "", "<Status", `  tone="${tone}"`, ...(icon ? [`  icon="${icon}"`] : []), ...(emphasis === "secondary" ? ['  emphasis="secondary"'] : []), ...(animated ? ["  animated"] : []), ">", `  {${JSON.stringify(label)}}`, "</Status>"].join("\n");
  const reset = () => { setTone("positive"); setLabel("В норме"); setAnimated(false); setIcon(""); setEmphasis("primary"); setTheme("inherit"); setNarrow(false); };
  const controls = <>
    <label className={styles.control}><span>children<small>Подпись статуса</small></span><input value={label} onChange={event => setLabel(event.target.value)} /></label>
    <label className={styles.control}><span>tone<small>Смысловой тон</small></span><select value={tone} onChange={event => setTone(event.target.value as StatusTone)}>{tones.map(item => <option key={item.value} value={item.value}>{item.value}</option>)}</select></label>
    <label className={styles.control}><span>animated<small>Пульсация фона индикатора</small></span><Checkbox checked={animated} onChange={event => setAnimated(event.target.checked)} /></label>
    <label className={styles.control}><span>icon<small>Иконка вместо точки</small></span><select value={icon} onChange={event => setIcon(event.target.value as "" | IconName)}><option value="">dot</option><option value="check">check</option><option value="triangle-alert">triangle-alert</option></select></label>
    <label className={styles.control}><span>emphasis<small>Цвет подписи</small></span><select value={emphasis} onChange={event => setEmphasis(event.target.value as "primary" | "secondary")}><option value="primary">primary</option><option value="secondary">secondary</option></select></label>
    <label className={styles.control}><span>Узкая область<small>Проверка переноса текста</small></span><Checkbox checked={narrow} onChange={event => setNarrow(event.target.checked)} /></label>
  </>;
  const design = <>
    <div><p className={styles.eyebrow}>DESIGN GUIDELINES</p><h2>Состояние, понятное с первого взгляда</h2><p>Статус объединяет цветовой индикатор и подпись, поэтому смысл не зависит только от цвета.</p></div>
    <div className={statusStyles.tones}>{tones.map(item => <article key={item.value}><Status tone={item.value}>{item.label}</Status><h3>{item.value}</h3><p>{item.description}</p></article>)}</div>
    <div><h2>Anatomy и геометрия</h2><div className={statusStyles.anatomy}><div><strong>16 × 16 px</strong><span>Область</span></div><div><strong>8 / 12 px</strong><span>Точка / иконка</span></div><div><strong>4 px</strong><span>Gap</span></div><div><strong>14 / 16 px</strong><span>Текст</span></div></div><p>Иконка заменяет точку, но не меняет область маркера, gap и положение подписи.</p></div>
    <div className={styles.guidelines}><article><h3>Behavior и motion</h3><div className={statusStyles.motion}><Status tone="progress" animated>В процессе</Status></div><p>Анимация применяется только к выполняющейся операции и отключается при prefers-reduced-motion.</p></article><article><h3>Accessibility и content</h3><p>Маркер скрыт от скринридера, текст явно называет состояние. Для динамических обновлений можно передать role="status".</p></article></div>
    <div><h2>Tokens и связанные компоненты</h2><p>Цвета берутся из `status/*`, геометрия — из `component/status/*`. Для дополнительного пояснения используйте InlineAlert.</p></div>
  </>;
  return <ComponentDocumentation id="primitive.status" title="Status" preview={<div className={statusStyles.sample} data-narrow={narrow || undefined}><Status tone={tone} icon={icon || undefined} emphasis={emphasis} animated={animated}>{label}</Status></div>} feedback={`Область 16 px · ${icon ? "иконка 12 px" : "маркер 8 px"} · gap 4 px`} controls={controls} onReset={reset} theme={theme} onThemeChange={setTheme} design={design} code={code} props={props} codeDescription="Код синхронизирован с Preview; тема и ширина относятся только к preview." codeNote={<p>Поддерживаются стандартные атрибуты span, включая role и aria-*.</p>} />;
}
