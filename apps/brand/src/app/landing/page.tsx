"use client";

import { useEffect, useLayoutEffect } from "react";
import { Button } from "@cloud/ui";
import { SiteLogoMenu } from "@/components/SiteLogoMenu";
import { TripleJunctions } from "@/effects/math-clouds/MathClouds";

const products = [
  { number: "01", title: "Kubernetes", text: "Managed-кластеры, сеть и наблюдаемость уже собраны в рабочую платформу." },
  { number: "02", title: "Вычисления", text: "Виртуальные машины, GPU и bare metal в одном инфраструктурном контуре." },
  { number: "03", title: "Данные", text: "S3, базы и резервные копии работают вместе, а не как набор отдельных услуг." },
];

const metrics = [
  ["99.99%", "SLA платформы"],
  ["< 90 сек", "до рабочего кластера"],
  ["24 / 7", "инженеры на связи"],
];

export default function LandingPage() {
  useEffect(() => {
    const glowPoints = Array.from(
      document.querySelectorAll<HTMLElement>(".landing-page__glow-point"),
    );
    let frame = 0;

    const updateGlow = () => {
      frame = 0;
      const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = window.scrollY / scrollRange;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const perimeter = Math.max(1, 2 * (width + height));

      glowPoints.forEach((point, index) => {
        let distance = ((progress * 1.1 + index / glowPoints.length) % 1) * perimeter;
        let x = 0;
        let y = 0;
        if (distance <= width) {
          x = distance;
        } else if ((distance -= width) <= height) {
          x = width;
          y = distance;
        } else if ((distance -= height) <= width) {
          x = width - distance;
          y = height;
        } else {
          distance -= width;
          y = height - distance;
        }
        const pulse = 0.7 + Math.sin(progress * Math.PI * 4 + index * 1.7) * 0.3;
        point.style.setProperty("--landing-glow-x", `${x}px`);
        point.style.setProperty("--landing-glow-y", `${y}px`);
        point.style.setProperty("--landing-glow-opacity", `${0.12 + pulse * 0.16}`);
      });
    };

    const scheduleGlowUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateGlow);
    };
    updateGlow();
    window.addEventListener("scroll", scheduleGlowUpdate, { passive: true });
    window.addEventListener("resize", scheduleGlowUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleGlowUpdate);
      window.removeEventListener("resize", scheduleGlowUpdate);
    };
  }, []);

  useLayoutEffect(() => {
    const alignButtonToGrid = () => {
      const elements = document.querySelectorAll<HTMLElement>(".landing-grid-aligned");
      for (const element of elements) {
        element.style.setProperty("--grid-x", "0px");
        element.style.setProperty("--grid-y", "0px");
        const cell = 25;
        const inset = 1;
        if (element.classList.contains("landing-contact__cell")) {
          element.style.removeProperty("--grid-cell-width");
          const availableWidth = element.getBoundingClientRect().width;
          element.style.setProperty(
            "--grid-cell-width",
            `${Math.max(cell * 10, Math.floor(availableWidth / cell) * cell)}px`,
          );
        }
        const rect = element.getBoundingClientRect();
        const targetLeft = Math.round((rect.left - inset) / cell) * cell + inset;
        const targetTop = Math.round((rect.top - inset) / cell) * cell + inset;
        element.style.setProperty("--grid-x", `${targetLeft - rect.left}px`);
        element.style.setProperty("--grid-y", `${targetTop - rect.top}px`);
      }
    };
    alignButtonToGrid();
    window.addEventListener("resize", alignButtonToGrid);
    return () => window.removeEventListener("resize", alignButtonToGrid);
  }, []);

  return (
    <main className="landing-page">
      <div className="landing-page__glow site-home__glow" aria-hidden="true">
        <span className="landing-page__glow-point site-home__glow-point site-home__glow-point--one" />
        <span className="landing-page__glow-point site-home__glow-point site-home__glow-point--two" />
        <span className="landing-page__glow-point site-home__glow-point site-home__glow-point--three" />
        <span className="landing-page__glow-point site-home__glow-point site-home__glow-point--four" />
      </div>
      <div className="landing-page__effect" aria-hidden="true">
        <TripleJunctions
          visualStyle="terminal-rounded"
          mediaCells
          figmaMediaColors
          lessLimeCells
          documentFlow
          hoverClusterSelector=".landing-button"
          denseSelector=".landing-contact"
          exclusionSelector=".landing-effect-protected"
          exclusionPadding={25}
          exclusionBoxSelector=".landing-header"
          exclusionBoxPadding={8}
        />
      </div>

      <header className="site-header landing-header">
        <SiteLogoMenu dark />
        <nav className="site-header__nav" aria-label="Основная навигация">
          <a href="#platform">Платформа</a>
          <a href="#products">Продукты</a>
          <a href="#approach">Подход</a>
          <a href="#contact">Контакты</a>
        </nav>
        <a className="landing-header__console" href="#contact">Открыть консоль ↗</a>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero__copy">
          <h1 className="landing-effect-protected" id="landing-title">Сделали облако для тебя</h1>
          <p className="landing-effect-protected">Всё необходимое для современной инфраструктуры. Kubernetes, полноценный IaaS и ИИ-инструменты.</p>
          <Button className="landing-button landing-grid-aligned" variant="solid">Начать бесплатно</Button>
        </div>
      </section>

      <section className="landing-section landing-statement" id="platform">
        <div className="landing-statement__copy landing-effect-protected">
          <h2>Инфраструктура не должна замедлять мысль.</h2>
          <p>Мы убрали лишние слои между идеей и работающим сервисом. Остались скорость, инженерная точность и контроль.</p>
        </div>
      </section>

      <section className="landing-section landing-products" id="products">
        <header className="landing-products__heading landing-effect-protected">
          <h2>Всё, что нужно.<br />Ничего лишнего.</h2>
          <p>Один API, одна сеть и одна команда поддержки. Сервисы готовы работать вместе с первого запуска.</p>
        </header>
        <div className="landing-products__grid">
          {products.map((product) => (
            <article className="landing-card landing-effect-protected" key={product.number}>
              <span>{product.number}</span>
              <h3>{product.title}</h3>
              <p>{product.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-approach" id="approach">
        <div className="landing-approach__copy landing-effect-protected">
          <h2>Сложное — внутри.<br /><em>Ясность — снаружи.</em></h2>
          <p>Не прячем устройство платформы. Показываем лимиты, состояние ресурсов и стоимость так, чтобы решения можно было принимать уверенно.</p>
        </div>
      </section>

      <section className="landing-section landing-proof">
        <div className="landing-proof__grid">
          {metrics.map(([value, label]) => (
            <div className="landing-metric landing-effect-protected" key={value}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section landing-contact" id="contact">
        <div className="landing-contact__cell landing-grid-aligned">
          <h2>Давай соберём вместе</h2>
          <Button className="landing-contact__button landing-grid-aligned" variant="solid">Вперед</Button>
        </div>
      </section>
    </main>
  );
}
