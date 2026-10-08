import styles from "./SupportSection.module.css";

export function SupportSection() {
  return <section className={styles.section} aria-labelledby="support-title">
    <div className={styles.inner}>
      <h2 id="support-title" className={styles.number}>24/7</h2>
      <div className={styles.content}>
        <p className={styles.lead}>Вопросы возникают в любое время.<br />Мы это учитываем.</p>
        <p className={styles.description}>Отвечают люди, не боты. Шутка, боты тоже отвечают, только умные. Круглосуточная поддержка с понятными каналами связи, границами помощи и порядком работы с обращениями.</p>
      </div>
    </div>
  </section>;
}
