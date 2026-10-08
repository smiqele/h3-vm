"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import localFont from "next/font/local";
import { VirtualMachineCalculator } from "./VirtualMachineCalculator";
import { InfrastructureSection } from "./InfrastructureSection";
import { SupportSection } from "./SupportSection";
import { FinalCtaSection } from "./FinalCtaSection";
import { SiteFooter } from "./SiteFooter";
import styles from "./home.module.css";

const asset = "/iaas-hero";
const pragmatica = localFont({
  src: "../../public/fonts/pragmatica-book.otf",
  weight: "500",
  style: "normal",
  display: "block",
  preload: true,
  variable: "--font-pragmatica",
});
const rotatingWords = ["проектов", "приложений", "сервисов", "сайтов"];

type Stage = "intro" | "text";

type Server = {
  id: string;
  name: string;
  ip: string;
  cpu: string;
  memory: string;
  disk: string;
  price: string;
};

const servers: Server[] = [
  { id: "alpha", name: "performance-server-alpha", ip: "185.45.10.21", cpu: "8 vCPU", memory: "24 ГБ RAM", disk: "1 ТБ SSD", price: "8 576 ₽ / мес" },
  { id: "postgres", name: "postgres-db-2099", ip: "185.45.10.22", cpu: "4 vCPU", memory: "16 ГБ RAM", disk: "500 ГБ SSD", price: "5 390 ₽ / мес" },
  { id: "worker", name: "worker-node-03", ip: "185.45.10.23", cpu: "2 vCPU", memory: "8 ГБ RAM", disk: "160 ГБ SSD", price: "2 590 ₽ / мес" },
];

function Specification({ icon, children }: { icon: string; children: React.ReactNode }) {
  return <span className={styles.specification}><img src={`${asset}/${icon}.svg`} alt="" />{children}</span>;
}

function ServerCard({ server, index }: { server: Server; index: number }) {
  const status = "Работает";

  return <div className={`${styles.serverCard} ${[styles.cardOne, styles.cardTwo, styles.cardThree][index]}`} tabIndex={0} role="group" aria-label={`${server.name}: ${status}`}>
    <div className={styles.cardTop}>
      <span className={styles.serverName}><span className={styles.statusDot} />{server.name}</span>
      <span className={styles.cardMeta}><span className={styles.cardStatus}>{status}</span><span className={styles.cardIp}><Specification icon="globe">{server.ip}</Specification></span></span>
    </div>
    <div className={styles.cardBottom}>
      <div className={styles.specifications}>
        <Specification icon="cpu">{server.cpu}</Specification>
        <Specification icon="memory">{server.memory}</Specification>
        <Specification icon="disk">{server.disk}</Specification>
      </div>
      <span className={styles.price}>{server.price}</span>
    </div>
  </div>;
}

export default function HomePage() {
  const [stage, setStage] = useState<Stage>("intro");
  const [activeWord, setActiveWord] = useState({ current: 0, previous: -1 });
  const [wordWidths, setWordWidths] = useState<number[]>([]);
  const wordMeasureRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const textTimer = window.setTimeout(() => setStage("text"), 100);
    return () => window.clearTimeout(textTimer);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      setActiveWord(({ current }) => ({ current: (current + 1) % rotatingWords.length, previous: current }));
    }, 3200);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let active = true;
    const measureWords = () => {
      if (!active) return;
      const widths = wordMeasureRefs.current.map((element) => element?.getBoundingClientRect().width ?? 0);
      if (widths.every((width) => width > 0)) setWordWidths(widths);
    };

    document.fonts.ready.then(measureWords);
    window.addEventListener("resize", measureWords);
    return () => {
      active = false;
      window.removeEventListener("resize", measureWords);
    };
  }, []);

  return <main className={`${styles.page} ${pragmatica.variable}`} data-stage={stage}>
    <div className={styles.stage}>
      <header className={styles.header}>
        <Link href="/" aria-label="h3llo cloud — главная" className={styles.brand}>
          <img src={`${asset}/logo.svg`} alt="h3llo cloud" width={102} height={13} />
        </Link>
        <div className={styles.headerRight}>
          <span className={styles.availability}><span className={styles.availabilityDot} />Все сервисы доступны</span>
          <button className={styles.consoleButton} type="button" disabled title="Консоль готовится к запуску">В консоль</button>
        </div>
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <h1 id="hero-title" className={styles.title} aria-label="Быстрые виртуальные машины для ваших проектов, приложений, сайтов и сервисов">
            быстрые виртуальные
            <span className={styles.secondLine} aria-hidden="true">
              <span className={styles.secondLinePrefix}>машины для ваших</span>
              <span className={styles.wordSlot} style={wordWidths.length ? { width: wordWidths[activeWord.current] } : undefined}>
                <span className={styles.wordMeasure}>{rotatingWords[activeWord.current]}</span>
                {rotatingWords.map((word, index) => <span key={word} className={styles.word} data-word-state={index === activeWord.current ? "current" : index === activeWord.previous ? "previous" : "future"}>{word}</span>)}
              </span>
            </span>
            <span className={styles.wordMetrics} aria-hidden="true">
              {rotatingWords.map((word, index) => <span key={word} ref={(element) => { wordMeasureRefs.current[index] = element; }}>{word}</span>)}
            </span>
          </h1>
          <p className={styles.features}>Intel Xeon 5/6, GPU, DDR5, бэкапы и поддержка 24/7<br />Без лишних сервисов и сложных условий</p>
          <div className={styles.actions}>
            <button className={styles.primaryAction} type="button" disabled title="Консоль готовится к запуску">Сразу в консоль</button>
            <Link className={styles.secondaryAction} href="#calculator">Потыкать калькулятор</Link>
          </div>
        </div>

        <div className={styles.cardStack} role="group" aria-label="Ваши виртуальные серверы">
          <div className={styles.hoverBridge} aria-hidden="true" />
          {servers.map((server, index) => <ServerCard key={server.id} server={server} index={index} />)}
        </div>
      </section>
    </div>
    <VirtualMachineCalculator />
    <InfrastructureSection />
    <SupportSection />
    <FinalCtaSection />
    <SiteFooter />
  </main>;
}
