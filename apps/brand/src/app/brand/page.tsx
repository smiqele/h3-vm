import { TripleJunctions } from "@/effects/math-clouds/MathClouds";
import styles from "./brand.module.css";

const products = [
  { code: "01", title: "Kubernetes", text: "Managed-кластеры без скрытой магии. Предсказуемые обновления, сеть и наблюдаемость уже внутри." },
  { code: "02", title: "Вычисления", text: "Виртуальные машины, GPU и bare metal в одном контуре — от первой сборки до production-нагрузки." },
  { code: "03", title: "Данные", text: "S3, базы и резервные копии, которые собираются в архитектуру, а не в список отдельных услуг." },
];

const metrics = [
  ["99.99%", "SLA платформы"],
  ["< 90 сек", "до рабочего кластера"],
  ["24 / 7", "инженеры на связи"],
];

export default function MarketingBrandPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.logo} href="/brand" aria-label="h3llo cloud — главная">
          <img src="/_logo.svg" alt="h3llo cloud" />
        </a>
        <nav className={styles.nav} aria-label="Основная навигация">
          <a href="#platform">Платформа</a>
          <a href="#products">Продукты</a>
          <a href="#principles">Подход</a>
        </nav>
        <a className={styles.consoleLink} href="#contact">Открыть консоль <span>↗</span></a>
      </header>

      <section className={styles.hero} aria-labelledby="brand-title">
        <div className={styles.heroEffect} aria-hidden="true">
          <TripleJunctions exclusionSelector="#brand-title" exclusionPadding={34} />
        </div>
        <div className={styles.heroMeta}><span>Облачная платформа</span><span>Москва · 55°45′N</span></div>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><i /> Инфраструктура нового поколения</p>
          <h1 id="brand-title">Облако,<br />которое <em>думает</em><br />как инженер.</h1>
          <p className={styles.heroLead}>Kubernetes-native платформа, полный IaaS и ИИ-инструменты — в одном понятном интерфейсе.</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#contact">Начать бесплатно <span>→</span></a>
            <a className={styles.textLink} href="#platform">Посмотреть платформу ↓</a>
          </div>
        </div>
        <div className={styles.coordinates} aria-hidden="true"><span>H3 / CORE</span><span>SYS.ONLINE</span></div>
      </section>

      <section className={styles.statement} id="platform">
        <div className={styles.sectionLabel}><span>01</span> Что мы меняем</div>
        <p>Инфраструктура не должна<br />замедлять <span>мысль.</span></p>
        <div className={styles.statementAside}>Мы убрали лишние слои между идеей и работающим сервисом. Осталась инженерная точность, скорость и контроль.</div>
      </section>

      <section className={styles.signal} aria-label="Принципы платформы">
        <div className={styles.signalGrid} aria-hidden="true">
          {Array.from({ length: 54 }, (_, index) => <i key={index} className={index % 11 === 0 || index === 19 || index === 31 ? styles.activeCell : ""} />)}
        </div>
        <p>Сложное — <span>внутри.</span></p>
        <p>Ясность — снаружи.</p>
        <div className={styles.signalCode}>h3://ready<br />001011101</div>
      </section>

      <section className={styles.products} id="products">
        <div className={styles.sectionLabel}><span>02</span> Единая среда</div>
        <div className={styles.productsHeading}>
          <h2>Всё, что нужно.<br />Ничего лишнего.</h2>
          <p>Один API. Одна сеть. Одна команда поддержки. Сервисы работают вместе с первого запуска.</p>
        </div>
        <div className={styles.productList}>
          {products.map((product) => (
            <article key={product.code} className={styles.productCard}>
              <span className={styles.productCode}>{product.code}</span>
              <h3>{product.title}</h3>
              <p>{product.text}</p>
              <a href="#contact" aria-label={`Подробнее: ${product.title}`}>↗</a>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.principles} id="principles">
        <div className={styles.principleVisual} aria-hidden="true"><div className={styles.orbit}><i /><i /><i /><i /></div><b>h3</b></div>
        <div className={styles.principleCopy}>
          <div className={styles.sectionLabel}><span>03</span> Сделано инженерами</div>
          <h2>Не прячем<br />сложность.<br /><em>Управляем ей.</em></h2>
          <p>Открытая архитектура, прозрачные лимиты и инструменты, с которыми одинаково удобно разработчикам и платформенным командам.</p>
        </div>
      </section>

      <section className={styles.metrics}>
        {metrics.map(([value, label]) => <div key={value}><strong>{value}</strong><span>{label}</span></div>)}
      </section>

      <section className={styles.cta} id="contact">
        <div className={styles.ctaPattern} aria-hidden="true">h3&gt; h3&gt; h3&gt; h3&gt; h3&gt; h3&gt; h3&gt;</div>
        <p>Следующая система<br />начинается здесь.</p>
        <a href="mailto:hello@h3llo.cloud">Обсудить задачу <span>→</span></a>
      </section>

      <footer className={styles.footer}>
        <img src="/_logo.svg" alt="h3llo cloud" />
        <p>Инфраструктура для тех,<br />кто строит будущее.</p>
        <div><a href="#products">Продукты</a><a href="#principles">Подход</a><a href="mailto:hello@h3llo.cloud">Контакты</a></div>
        <small>© 2026 H3 Cloud</small>
      </footer>
    </main>
  );
}
