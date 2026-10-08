import styles from "./InfrastructureSection.module.css";

const items = [
  {
    title: "Топовое железо",
    lines: ["Xeon 5/6, DDR5, GPU B300, сети 400G/800G.", "Не просто современное, а новейшее."],
  },
  {
    title: "Суверенность",
    lines: ["Реестр отечественного ПО, аккредитация Минцифры,", "Реестр хостингов РКН, серверы в РФ."],
  },
  {
    title: "Надёжность",
    lines: ["SLA 99,97% для одиночного сервиса / 99,99% для HA-конфигураций.", "Финансовая гарантия до 100%."],
  },
  {
    title: "Kubernetes-платформа",
    lines: ["Собственная разработка с нативной поддержкой экосистемы CNCF.", "Не форк, не вендорский конструктор."],
  },
  { title: "400G+", lines: ["Сетевая связность"] },
  {
    title: "Безопасность",
    lines: ["Датацентры Tier III+, ФЗ-152, ФСТЭК, PCI DSS, Cloud Alliance, собственный стандарт ИБ."],
  },
] as const;

export function InfrastructureSection() {
  return <section className={styles.section} aria-labelledby="infrastructure-title">
    <div className={styles.inner}>
      <h2 id="infrastructure-title" className={styles.title}>на чём стоим<br />буквально</h2>
      <div className={styles.cards}>
        {items.map(item => <article className={styles.card} key={item.title}>
          <h3>{item.title}</h3>
          <p>{item.lines.map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</p>
        </article>)}
      </div>
    </div>
  </section>;
}
