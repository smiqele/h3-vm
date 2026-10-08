"use client";

import { Button, Checkbox, Icon, type IconName } from "@cloud/ui";
import { useState, type ComponentProps } from "react";
import { ComponentDocumentation, type DocumentationPropRow } from "./ComponentDocumentation";
import styles from "./ComponentDocumentation.module.css";

const variants = ["solid", "soft", "ghost"] as const;
const glyphs = ["plus", "chevron-right", "copy", "settings", "search"] as const satisfies readonly IconName[];
type ButtonProps = ComponentProps<typeof Button>;
const props: DocumentationPropRow[] = [
  { name: "children", type: "ReactNode", description: "Содержимое кнопки, обязательное свойство." },
  { name: "variant", type: '"solid" | "soft" | "ghost"', defaultValue: '"soft"', description: "Визуальный приоритет." },
  { name: "leadingIcon", type: "ReactNode", description: "Иконка перед текстом." },
  { name: "trailingIcon", type: "ReactNode", description: "Иконка после текста." },
  { name: "loading", type: "boolean", defaultValue: "false", description: "Меняет подпись, блокирует кнопку и выставляет aria-busy." },
  { name: "disabled", type: "boolean", defaultValue: "false", description: "Отключает взаимодействие." },
  { name: "type", type: '"button" | "submit" | "reset"', defaultValue: '"button"', description: "Поведение внутри формы." },
];

export function ButtonShowcase() {
  const [variant, setVariant] = useState<ButtonProps["variant"]>("solid");
  const [label, setLabel] = useState("Создать машину");
  const [leading, setLeading] = useState("");
  const [trailing, setTrailing] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("inherit");
  const [clicks, setClicks] = useState(0);
  const code = [
    `import { Button${leading || trailing ? ", Icon" : ""} } from "@cloud/ui";`, "", "<Button",
    `  variant="${variant}"`,
    ...(leading ? [`  leadingIcon={<Icon name="${leading}" size="inherit" />}`] : []),
    ...(trailing ? [`  trailingIcon={<Icon name="${trailing}" size="inherit" />}`] : []),
    ...(disabled ? ["  disabled"] : []), ...(loading ? ["  loading"] : []),
    ">", `  {${JSON.stringify(label)}}`, "</Button>",
  ].join("\n");
  const reset = () => { setVariant("solid"); setLabel("Создать машину"); setLeading(""); setTrailing(""); setDisabled(false); setLoading(false); setTheme("inherit"); setClicks(0); };

  const controls = <>
    <label className={styles.control}><span>children<small>Текст кнопки</small></span><input value={label} onChange={event => setLabel(event.target.value)} /></label>
    <label className={styles.control}><span>variant<small>Визуальный приоритет</small></span><select value={variant} onChange={event => setVariant(event.target.value as ButtonProps["variant"])}>{variants.map(value => <option key={value}>{value}</option>)}</select></label>
    {([ ["leadingIcon", leading, setLeading, "Иконка перед текстом"], ["trailingIcon", trailing, setTrailing, "Иконка после текста"] ] as const).map(([name, value, setter, description]) => <label className={styles.control} key={name}><span>{name}<small>{description}</small></span><select value={value} onChange={event => setter(event.target.value)}><option value="">Нет</option>{glyphs.map(glyph => <option key={glyph}>{glyph}</option>)}</select></label>)}
    <label className={styles.control}><span>disabled<small>Недоступное действие</small></span><Checkbox checked={disabled} onChange={event => setDisabled(event.target.checked)} /></label>
    <label className={styles.control}><span>loading<small>Выполнение действия</small></span><Checkbox checked={loading} onChange={event => setLoading(event.target.checked)} /></label>
  </>;

  const design = <>
    <div><p className={styles.eyebrow}>DESIGN GUIDELINES</p><h2>Действие с понятным приоритетом</h2><p>Кнопка запускает действие. Подпись описывает результат нажатия; для навигации используйте ссылку.</p></div>
    <div className={styles.variantList}>{variants.map((value, index) => <article key={value}><div><Button variant={value}>Создать машину</Button></div><h3>{value}</h3><p>{["Главное действие. Используйте одну акцентную кнопку в группе.", "Вторичное действие рядом с главным.", "Низкий приоритет для toolbar и компактных групп."][index]}</p></article>)}</div>
    <div><h2>Anatomy и геометрия</h2><p>Material и finish формируют поверхность; content содержит leading icon, label и trailing icon. Высота — 32 px, текст — 14 px, иконка — 16 px, gap — 6 px.</p></div>
    <div className={styles.guidelines}><article><h3>States и behavior</h3><p>Default, hover, pressed, focus, disabled и loading дают обратную связь. Loading блокирует повторное действие.</p></article><article><h3>Content и accessibility</h3><p>Начинайте подпись с глагола. Для кнопки без текста используйте IconButton с доступным именем.</p></article></div>
    <div><h2>Tokens и связанные компоненты</h2><p>Геометрия и материал задаются `button/*`. Для действия без текста используйте IconButton, для выбора состояния — соответствующий selection control.</p></div>
  </>;

  return <ComponentDocumentation
    id="primitive.button"
    title="Button"
    preview={<Button variant={variant} disabled={disabled} loading={loading} leadingIcon={leading ? <Icon name={leading as IconName} size="inherit" /> : undefined} trailingIcon={trailing ? <Icon name={trailing as IconName} size="inherit" /> : undefined} onClick={() => setClicks(value => value + 1)}>{label}</Button>}
    feedback={clicks ? `Нажатий: ${clicks}` : "Наведите курсор или нажмите на кнопку"}
    controls={controls}
    onReset={reset}
    theme={theme}
    onThemeChange={setTheme}
    design={design}
    code={code}
    props={props}
    codeNote={<p>Компонент принимает стандартные атрибуты HTML-кнопки. Для onClick в Next.js используйте клиентский компонент.</p>}
  />;
}
