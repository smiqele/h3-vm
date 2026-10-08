import styles from "./SiteFooter.module.css";

const legal = [
  "Лицензионное соглашение",
  "Политика конфиденциальности",
  "Политика использования файлов Cookie",
  "Оферта для юридических лиц",
  "Оферта акции \"Бесплатные лимиты\"",
];

export function SiteFooter() {
  return <footer className={styles.footer}>
    <div className={styles.top}>
      <div className={styles.brand}>
        <img src="/final/footer-logo.svg" width={125} height={16} alt="h3llo.cloud" />
        <p>Строим облачный<br />гиперскейлер на<br />максималках</p>
      </div>
      <div className={styles.links}>
        <div className={styles.column}>
          <h2>Юридическая информация</h2>
          <div className={styles.list}>{legal.map(item => <a key={item} href="#">{item}</a>)}</div>
        </div>
        <div className={styles.column}>
          <h2>Поддержка</h2>
          <div className={styles.list}>
            <a href="#">Центр помощи</a>
            <a href="#">Статус системы</a>
          </div>
        </div>
      </div>
    </div>
    <p className={styles.copyright}>h3llo.cloud © 2025 Все права защищены</p>
  </footer>;
}
