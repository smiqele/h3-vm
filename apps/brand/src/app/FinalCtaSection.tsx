import { Button } from "@cloud/ui";
import { AsciiHand } from "./AsciiHand";
import styles from "./FinalCtaSection.module.css";

export function FinalCtaSection() {
  return <section className={styles.section} aria-labelledby="final-cta-title">
    <AsciiHand className={`${styles.art} ${styles.artLeft}`} />
    <AsciiHand className={`${styles.art} ${styles.artRight}`} />
    <div className={styles.content}>
      <h2 id="final-cta-title">Инстансы ждут, ты готов?</h2>
      <p>Зарегистрируйтесь — и 4 000 ₽ появятся на балансе автоматически. Попробуйте сами, почему люди перестают возвращаться к старым облакам.</p>
      <div className={styles.actions}>
        <Button variant="solid" className={`${styles.button} ${styles.primary}`}>Попробовать бесплатно</Button>
        <Button variant="soft" className={`${styles.button} ${styles.secondary}`}>Поговорить с командой</Button>
      </div>
    </div>
  </section>;
}
