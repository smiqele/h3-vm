"use client";

import { useState } from "react";
import { MetricsSummary, type MetricsSummaryItem } from "@cloud/ui";
import { ComponentDocumentation, type DocumentationPropRow } from "./ComponentDocumentation";
import styles from "./ComponentDocumentation.module.css";
import localStyles from "./MetricsSummaryShowcase.module.css";

const items: readonly MetricsSummaryItem[] = [
  { id: "instances", type: "breakdown", label: "Инстансы", value: "6", segments: [
    { tone: "positive", value: "4", label: "Работают" },
    { tone: "neutral", value: "2", label: "Остановлены" },
    { tone: "danger", value: "0", label: "С ошибкой" },
  ] },
  { id: "utilization", type: "group", label: "Загрузка", aside: "В пределах нормы", asideTone: "positive", asideIcon: "check", items: [
    { id: "cpu", label: "CPU", value: "43%" },
    { id: "ram", label: "RAM", value: "35%" },
  ] },
  { id: "disk", type: "meter", appearance: "text", label: "Хранение", value: "1,7 ТБ из 1,9 ТБ", level: .895, aside: "Заполнено на", asideTone: "warning", asideIcon: "triangle-alert" },
  { id: "consumption", type: "value", label: "Потребление", value: "18 420 ₽", aside: "1–18 сентября" },
];

const props: DocumentationPropRow[] = [
  { name: "ariaLabel", type: "string", description: "Доступное название всей сводки." },
  { name: "items", type: "readonly MetricsSummaryItem[]", description: "Колонки с типами value, breakdown, meter или group." },
  { name: "variant", type: '"default" | "borderless"', defaultValue: '"default"', description: "Оформление с рамкой или без внешних границ и с одноцветными разделителями." },
];

export function MetricsSummaryShowcase() {
  const [ariaLabel, setAriaLabel] = useState("Состояние виртуальных машин");
  const [variant, setVariant] = useState<"default" | "borderless">("default");
  const [theme, setTheme] = useState<"inherit" | "light" | "dark">("inherit");
  const reset = () => { setAriaLabel("Состояние виртуальных машин"); setVariant("default"); setTheme("inherit"); };
  const code = [
    'import { MetricsSummary } from "@cloud/ui";',
    "",
    `<MetricsSummary ariaLabel=${JSON.stringify(ariaLabel || "Сводка метрик")} items={items}${variant === "borderless" ? ' variant="borderless"' : ""} />`,
  ].join("\n");

  const controls = <>
    <label className={styles.control}><span>ariaLabel<small>Название для ассистивных технологий</small></span><input value={ariaLabel} onChange={event => setAriaLabel(event.target.value)} /></label>
    <label className={styles.control}><span>variant<small>Оформление контейнера и разделителей</small></span><select value={variant} onChange={event => setVariant(event.target.value as typeof variant)}><option value="default">Default</option><option value="borderless">Borderless</option></select></label>
  </>;

  const design = <>
    <div><p className={styles.eyebrow}>DESIGN GUIDELINES</p><h2>Краткая сводка метрик</h2><p>Показывайте связанные показатели в строке под заголовком страницы или секции. Видимый заголовок внутри компонента не нужен.</p></div>
    <div className={localStyles.variants}>
      <article><h3>Default</h3><p>Обособленная поверхность с рамкой и разделителями.</p><MetricsSummary ariaLabel="Пример обычной сводки" items={items} /></article>
      <article><h3>Borderless</h3><p>Сводка на поверхности родительской секции без фона и внешней границы. Колонки разделены тонкой затухающей линией.</p><MetricsSummary ariaLabel="Пример сводки без границ" items={items} variant="borderless" /></article>
    </div>
    <div><h2>Геометрия и состав</h2><p>Каждая колонка содержит label, основное значение и вторичную строку с шагом 6 px. Borderless использует внутренние отступы 24 px по горизонтали и 12 px по вертикали и одноцветный разделитель толщиной 1 px на высоту содержимого элемента без учёта внутренних отступов, использующий border/thin. На узком экране колонки становятся вертикальным списком с горизонтальными разделителями на ширину содержимого элемента без учёта внутренних отступов.</p></div>
    <div className={styles.guidelines}><article><h3>Поведение и доступность</h3><p>ariaLabel именует всю секцию. Breakdown сохраняет tooltip с расшифровкой состояний; его можно открыть указателем или клавиатурой. Вариант не меняет данные и состояния.</p></article><article><h3>Токены и связи</h3><p>Отступы задаются metrics-summary/*, текст и статусы используют semantic tokens. Для отдельных индикаторов используйте MetricIndicator и Status.</p></article></div>
  </>;

  return <ComponentDocumentation
    id="component.metrics-summary"
    title="Metrics summary"
    preview={<div className={localStyles.preview}><MetricsSummary ariaLabel={ariaLabel || "Сводка метрик"} items={items} variant={variant} /></div>}
    controls={controls}
    onReset={reset}
    theme={theme}
    onThemeChange={setTheme}
    design={design}
    code={code}
    props={props}
    codeNote={<p>Передайте массив items с уникальными id. Состояния и подписи сегментов задаются самими элементами.</p>}
  />;
}
