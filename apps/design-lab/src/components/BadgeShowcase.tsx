"use client";

import { Badge, Checkbox, Icon, type IconName } from "@cloud/ui";
import { useState } from "react";
import { ComponentDocumentation, type DocumentationPropRow } from "./ComponentDocumentation";
import styles from "./ComponentDocumentation.module.css";

const glyphs = ["filter", "server", "circle-check", "chevron-right", "x"] as const satisfies readonly IconName[];
const props: DocumentationPropRow[] = [
  { name: "children", type: "ReactNode", description: "Содержимое badge, обязательное свойство." },
  { name: "mono", type: "boolean", defaultValue: "false", description: "Использует моноширинный шрифт." },
  { name: "leadingIcon", type: "ReactNode", description: "Иконка перед текстом." },
  { name: "trailingIcon", type: "ReactNode", description: "Иконка после текста; сюда же передаётся x." },
];

export function BadgeShowcase() {
  const [label, setLabel] = useState("Работает");
  const [mono, setMono] = useState(false);
  const [leading, setLeading] = useState("");
  const [trailing, setTrailing] = useState("");
  const [theme, setTheme] = useState("inherit");
  const code = [
    `import { Badge${leading || trailing ? ", Icon" : ""} } from "@cloud/ui";`, "", "<Badge",
    ...(mono ? ["  mono"] : []),
    ...(leading ? [`  leadingIcon={<Icon name="${leading}" size="inherit" />}`] : []),
    ...(trailing ? [`  trailingIcon={<Icon name="${trailing}" size="inherit" />}`] : []),
    ">", `  {${JSON.stringify(label)}}`, "</Badge>",
  ].join("\n");
  const reset = () => { setLabel("Работает"); setMono(false); setLeading(""); setTrailing(""); setTheme("inherit"); };

  const controls = <>
    <label className={styles.control}><span>children<small>Текст badge</small></span><input value={label} onChange={event => setLabel(event.target.value)} /></label>
    <label className={styles.control}><span>mono<small>Моноширинный текст для технических значений</small></span><Checkbox checked={mono} onChange={event => setMono(event.target.checked)} /></label>
    {([ ["leadingIcon", leading, setLeading, "Иконка перед текстом"], ["trailingIcon", trailing, setTrailing, "Иконка после текста, включая x"] ] as const).map(([name, value, setter, description]) => <label className={styles.control} key={name}><span>{name}<small>{description}</small></span><select value={value} onChange={event => setter(event.target.value)}><option value="">Нет</option>{glyphs.map(glyph => <option key={glyph}>{glyph}</option>)}</select></label>)}
  </>;

  const design = <>
    <div><p className={styles.eyebrow}>DESIGN GUIDELINES</p><h2>Компактная метка состояния или значения</h2><p>Badge сообщает короткий статус, фильтр, категорию или технический идентификатор. Он всегда имеет высоту 32 px и полностью скруглённую форму.</p></div>
    <div className={styles.variantList}>
      <article><div><Badge>Работает</Badge></div><h3>Обычный</h3><p>Для читаемых названий, состояний и выбранных фильтров.</p></article>
      <article><div><Badge mono>VM-V9H2C4T5B</Badge></div><h3>Mono</h3><p>Для ID, алиасов, токенов и технических значений.</p></article>
      <article><div><Badge leadingIcon={<Icon name="server" size="inherit" />} trailingIcon={<Icon name="x" size="inherit" />}>Production</Badge></div><h3>С иконками</h3><p>Иконки уточняют тип или действие. Крестик передаётся через trailingIcon.</p></article>
    </div>
    <div><h2>Геометрия и anatomy</h2><p>Container содержит leading icon, label и trailing icon. Высота — 32 px, текст — 14 px / 500, иконка — 16 px, gap — 6 px. Padding уменьшается с 12 до 8 px со стороны иконки.</p></div>
    <div className={styles.guidelines}><article><h3>Поведение и content</h3><p>Используйте короткие подписи. Для нескольких значений показывайте количество. Если badge сбрасывает фильтр, кликабельна вся его площадь.</p></article><article><h3>Accessibility</h3><p>Интерактивный badge получает role button, tabIndex, доступное имя, focus и обработку Enter и Space.</p></article></div>
    <div><h2>Tokens и связанные компоненты</h2><p>Геометрия задаётся `badge/*`; поверхность и граница — semantic tokens. Для полноценного действия используйте Button, для состояния ресурса — Status.</p></div>
  </>;

  return <ComponentDocumentation
    id="primitive.badge"
    title="Badge"
    preview={<Badge mono={mono} leadingIcon={leading ? <Icon name={leading as IconName} size="inherit" /> : undefined} trailingIcon={trailing ? <Icon name={trailing as IconName} size="inherit" /> : undefined}>{label}</Badge>}
    feedback="Высота 32 px · скругление full"
    controls={controls}
    onReset={reset}
    theme={theme}
    onThemeChange={setTheme}
    design={design}
    code={code}
    props={props}
    codeNote={<p>Компонент принимает стандартные атрибуты span. Интерактивность и доступное имя задаются потребителем.</p>}
  />;
}
