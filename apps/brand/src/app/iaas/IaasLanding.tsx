"use client";

import { useState } from "react";
import { SiteLogoMenu } from "@/components/SiteLogoMenu";
import s from "./page.module.css";

const presets = [
  { name: "Веб-проект", text: "Сайт, блог или небольшой сервис", cpu: 2, ram: 4, disk: 40 },
  { name: "Приложение", text: "API, backend и повседневные задачи", cpu: 4, ram: 8, disk: 80 },
  { name: "Рабочая среда", text: "Разработка, сборки и эксперименты", cpu: 8, ram: 16, disk: 160 },
];

const questions = [
  ["Для каких задач подходит h3llo cloud?", "Мы проектируем облако для сайтов, приложений, API и рабочих сред. В основе — виртуальные машины, диски и сети. Вы выбираете ресурсы и самостоятельно управляете своей операционной системой и приложением."],
  ["Уже можно запустить сервер?", "Пока это знакомство с будущим продуктом. Вы можете попробовать подбор ресурсов и сохранить конфигурацию. Регистрация, оплата и создание реальных серверов появятся после открытия запуска."],
  ["Какой процессор будет у сервера?", "Модели процессоров и условия выделения vCPU опубликуем вместе с доступными конфигурациями. Для каждой линейки планируем раскрывать характеристики, ограничения и методику тестирования."],
  ["Где посмотреть цены?", "Тарифы готовятся. До открытия запуска опубликуем стоимость вычислений, дисков, IP-адресов и трафика, а также правила оплаты выключенного сервера. В текущем подборе показаны примеры ресурсов, а не коммерческое предложение."],
  ["Серверы будут в Москве?", "Мы готовим продукт для российского рынка с фокусом на Москве. Точные локации инфраструктуры и доступные площадки сообщим к запуску."],
  ["Что будет входить в поддержку 24/7?", "Круглосуточная поддержка по вопросам инфраструктуры — один из принципов продукта. Каналы связи, сроки реакции и границы помощи опубликуем до запуска. Администрирование приложения и операционной системы требует отдельного согласования."],
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function Label({ number, children }: { number: string; children: React.ReactNode }) {
  return <div className={s.label}><span>{number}</span>{children}</div>;
}

function Hardware() {
  return <div className={s.hardware} aria-hidden="true">
    <div className={s.hardwareTop}><span>H3 / COMPUTE ENGINE</span><span>01 — CPU</span></div>
    <div className={s.board}>
      <svg className={s.circuit} viewBox="0 0 600 600" fill="none">
        {[0, 1, 2, 3].map((rotation) => <g key={rotation} transform={`rotate(${rotation * 90} 300 300)`}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M ${240 + i * 20} 240 V ${190 - i * 10} L ${140 + i * 27} ${90 - i * 5} V 0`} />)}
          {[0, 1, 2, 3].map((i) => <circle key={i} cx={145 + i * 27} cy={85 - i * 5} r="3" />)}
        </g>)}
      </svg>
      <div className={s.chipBase} />
      <div className={s.chip}><span>h3</span><small>CLOUD COMPUTE</small><div className={s.chipMark}>✳</div></div>
      <div className={s.boardTag}>YOUR NEXT BIG THING<br />STARTS HERE.</div>
    </div>
    <div className={s.hardwareBottom}><span><i /> BUILT FOR YOUR WORKLOAD</span><span>h3llo.</span></div>
  </div>;
}

export function IaasLanding() {
  const [cpu, setCpu] = useState(4);
  const [ram, setRam] = useState(8);
  const [disk, setDisk] = useState(80);
  const [saved, setSaved] = useState(false);
  const [menu, setMenu] = useState(false);
  const active = presets.findIndex(p => p.cpu === cpu && p.ram === ram && p.disk === disk);
  const selectPreset = (index: number) => {
    const p = presets[index]; setCpu(p.cpu); setRam(p.ram); setDisk(p.disk); setSaved(false);
  };
  const saveConfiguration = () => {
    const contents = `h3llo cloud — пример конфигурации\n\nvCPU: ${cpu}\nRAM: ${ram} ГБ\nДиск: ${disk} ГБ\n\nЭто демонстрационная конфигурация, не заказ сервера.\nТарифы, модели CPU, типы дисков и локации будут объявлены к запуску.\n`;
    const url = URL.createObjectURL(new Blob([contents], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "h3llo-configuration.txt"; a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000); setSaved(true);
  };

  return <div className={s.page}>
    <a className={s.skip} href="#main">Перейти к содержимому</a>
    <div className={s.announcement}><span className={s.dot} /> Знакомьтесь: h3llo cloud <span className={s.announcementAside}>Концепция нового публичного облака</span><a href="#approach">Наш подход <Arrow /></a></div>
    <header className={s.header}>
      <SiteLogoMenu />
      <nav className={s.nav} aria-label="Навигация по странице"><a href="#hardware">Оборудование</a><a href="#configure">Конфигурации</a><a href="#support">Поддержка</a></nav>
      <a className={s.headerCta} href="#configure">Выбрать сервер <Arrow /></a>
      <button className={s.menuButton} onClick={() => setMenu(!menu)} aria-expanded={menu} aria-controls="iaas-mobile-nav" aria-label={menu ? "Закрыть навигацию" : "Открыть навигацию"}>{menu ? "×" : "☰"}</button>
      {menu && <nav id="iaas-mobile-nav" className={s.mobileNav} aria-label="Мобильная навигация">{[["#hardware", "Оборудование"], ["#configure", "Конфигурации"], ["#support", "Поддержка"], ["#faq", "Вопросы и ответы"]].map(([href, name]) => <a key={href} href={href} onClick={() => setMenu(false)}>{name}<Arrow /></a>)}</nav>}
    </header>

    <main id="main">
      <section className={s.hero} aria-labelledby="hero-title">
        <div className={s.heroCopy}>
          <p className={s.eyebrow}><span /> ОБЛАЧНЫЕ СЕРВЕРЫ ДЛЯ ВАШИХ ИДЕЙ</p>
          <h1 id="hero-title">Сильное <br />железо.<br /><em>Простое <br />облако.</em></h1>
          <p className={s.lead}>Всё начинается с хорошего сервера.<br />Современное оборудование, понятные условия<br className={s.desktopBreak} /> и поддержка, которая рядом 24/7.</p>
          <div className={s.heroActions}><a className={s.primary} href="#configure">Подобрать сервер <Arrow /></a><a className={s.textLink} href="#approach">Познакомиться с облаком <span aria-hidden="true">↓</span></a></div>
        </div>
        <div className={s.heroArt}><Hardware /><div className={s.artCaption}><span>В ОСНОВЕ — ПРОИЗВОДИТЕЛЬНОСТЬ</span><span>В ЦЕНТРЕ — ВАША ЗАДАЧА</span></div></div>
        <div className={s.heroFoot}><span>VM / STORAGE / NETWORK</span><span>МЕНЬШЕ РУТИНЫ. БОЛЬШЕ ВОЗМОЖНОСТЕЙ.</span><span>SCROLL TO EXPLORE ↓</span></div>
      </section>

      <section id="approach" className={s.approach}>
        <Label number="01">ОБЛАКО С ПОНЯТНЫМ ХАРАКТЕРОМ</Label>
        <div className={s.sectionHeading}><h2>Вы занимаетесь проектом.<br /><span>Мы — его основой.</span></h2><p>Серверы, диски и сети. Собираем привычную инфраструктуру так, чтобы с ней было приятно работать каждый день.</p></div>
        <div className={s.principles}>
          {[{ n: "01", icon: "↗", title: "Мощность по делу", text: "Современные процессоры и открытые характеристики. Вы знаете, какие ресурсы выбираете." }, { n: "02", icon: "≡", title: "Всё на виду", text: "Понятный состав тарифа, условия использования и ограничения. Детали помогают принимать решения." }, { n: "03", icon: "⌘", title: "Просто в работе", text: "Короткий путь от выбора конфигурации до подключения. Нужные действия — под рукой." }, { n: "04", icon: "✳", title: "На связи 24/7", text: "Помощь по вопросам инфраструктуры — часть нашего подхода. Днём, ночью и в выходные." }].map(p => <article key={p.n}><div className={s.principleTop}><span>{p.n}</span><b aria-hidden="true">{p.icon}</b></div><h3>{p.title}</h3><p>{p.text}</p></article>)}
        </div>
      </section>

      <section id="hardware" className={s.performance}>
        <div className={s.performanceCopy}><Label number="02">ЧТО ВНУТРИ — ИМЕЕТ ЗНАЧЕНИЕ</Label><h2>За каждой VM —<br />настоящее<br /><em>железо.</em></h2><p>Производительность начинается с оборудования. А доверие — с возможности понять, что именно вы получаете.</p><a className={s.lightLink} href="#specification">Из чего складывается мощность <span aria-hidden="true">↓</span></a></div>
        <div id="specification" className={s.specification}>
          <div className={s.specHeader}><span>INSIDE H3LLO CLOUD</span><span>↙</span></div>
          {[{ name: "CPU", title: "Вычислять быстрее", text: "Модель процессора, поколение и правила выделения vCPU — основа осознанного выбора.", graphic: s.cpuGraphic }, { name: "DISK", title: "Держать данные рядом", text: "Тип хранения, скорость и ограничения диска важны так же, как его объём.", graphic: s.diskGraphic }, { name: "NET", title: "Быть на связи", text: "Пропускная способность, включённый трафик и правила доступа — в понятных условиях.", graphic: s.netGraphic }].map(item => <div className={s.specRow} key={item.name}><div className={`${s.specIcon} ${item.graphic}`} aria-hidden="true"><i /><i /><i /></div><div><small>{item.name}</small><h3>{item.title}</h3><p>{item.text}</p></div></div>)}
          <p className={s.specNote}>Точные модели и результаты тестов опубликуем к запуску.</p>
        </div>
      </section>

      <section id="configure" className={s.configure}>
        <Label number="03">НАЧНИТЕ СО СВОЕЙ ЗАДАЧИ</Label>
        <div className={s.sectionHeading}><h2>Ваш проект.<br /><span>Ваша конфигурация.</span></h2><p>Попробуйте подобрать ресурсы для следующей задачи. Начните с примера и настройте его под себя.</p></div>
        <div className={s.configurator}>
          <div className={s.configControls}>
            <div className={s.configTop}><span>01 / ВЫБЕРИТЕ ОТПРАВНУЮ ТОЧКУ</span><span className={s.demoBadge}>ДЕМО</span></div>
            <div className={s.presets}>{presets.map((p, i) => <button key={p.name} aria-pressed={active === i} onClick={() => selectPreset(i)}><span className={s.radio} /><strong>{p.name}</strong><small>{p.text}</small></button>)}</div>
            <div className={s.configTop}><span>02 / НАСТРОЙТЕ РЕСУРСЫ</span></div>
            <div className={s.sliders}>
              {[{ name: "Процессор", suffix: "vCPU", value: cpu, set: setCpu, min: 1, max: 16, step: 1, id: "cpu" }, { name: "Память", suffix: "ГБ", value: ram, set: setRam, min: 2, max: 64, step: 2, id: "ram" }, { name: "Диск", suffix: "ГБ", value: disk, set: setDisk, min: 20, max: 500, step: 20, id: "disk" }].map(control => <div className={s.slider} key={control.id}><label htmlFor={`iaas-${control.id}`}>{control.name}<output>{control.value} <span>{control.suffix}</span></output></label><input id={`iaas-${control.id}`} type="range" min={control.min} max={control.max} step={control.step} value={control.value} aria-valuetext={`${control.value} ${control.suffix}`} onChange={e => { control.set(Number(e.target.value)); setSaved(false); }} /><div className={s.rangeEnds}><span>{control.min} {control.suffix}</span><span>{control.max} {control.suffix}</span></div></div>)}
            </div>
          </div>
          <aside className={s.configSummary}><div className={s.summaryTop}><span>ВАШ СЕРВЕР</span><span aria-hidden="true">↗</span></div><div className={s.serverGlyph} aria-hidden="true">{[0, 1, 2].map(i => <div key={i}><i /><span /><b>•••</b></div>)}</div><h3>{active < 0 ? "Своя конфигурация" : presets[active].name}</h3><dl><div><dt>Процессор</dt><dd>{cpu} vCPU</dd></div><div><dt>Память</dt><dd>{ram} ГБ</dd></div><div><dt>Диск</dt><dd>{disk} ГБ</dd></div></dl><div className={s.priceNote}><strong>Тарифы скоро</strong><p>Это пример подбора ресурсов. Цены и доступные конфигурации объявим к запуску.</p></div><button className={s.primary} onClick={saveConfiguration}>Сохранить конфигурацию <span aria-hidden="true">↓</span></button><p className={s.saveStatus} role="status">{saved ? "Конфигурация сохранена в текстовый файл" : "Можно скачать и вернуться к ней позже"}</p></aside>
        </div>
      </section>

      <section className={s.simplicity}>
        <div><Label number="04">ПРОСТОТА В КАЖДОМ ДЕЙСТВИИ</Label><h2>Знакомые задачи.<br /><span>Понятный порядок.</span></h2></div>
        <div className={s.steps}>{[{ title: "Выберите ресурсы", text: "Процессор, память и диск под вашу нагрузку." }, { title: "Настройте окружение", text: "Операционная система, сеть и доступ к серверу." }, { title: "Запускайте своё", text: "Подключайтесь и разворачивайте приложение." }].map((step, i) => <div key={step.title}><span>0{i + 1}</span><h3>{step.title}</h3><p>{step.text}</p></div>)}</div>
      </section>

      <section id="support" className={s.support}>
        <div className={s.supportVisual} aria-hidden="true"><div className={s.supportOrbit} /><span className={s.supportStar}>✳</span><strong>24<span>/</span>7</strong><div className={s.supportCaption}><i /> HUMAN SUPPORT</div></div>
        <div className={s.supportCopy}><Label number="05">ЛЮДИ НА ДРУГОМ КОНЦЕ</Label><h2>У серверов<br />нет выходных.<br /><span>У поддержки тоже.</span></h2><p>Когда вопрос касается инфраструктуры, важно знать, куда обратиться. Строим h3llo cloud с круглосуточной поддержкой как частью продукта.</p><a className={s.textLink} href="#support-faq">Как будет работать поддержка <Arrow /></a></div>
      </section>

      <section id="faq" className={s.faq}><div><Label number="06">ДАВАЙТЕ ПРОЯСНИМ</Label><h2>Хорошие <br /><span>вопросы.</span></h2><p>Всё, что полезно знать<br />до знакомства с облаком.</p></div><div className={s.questions}>{questions.map(([question, answer], i) => <details key={question} id={i === 5 ? "support-faq" : undefined}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>

      <section className={s.closing}><p className={s.eyebrow}>H3LLO, NEW POSSIBILITIES.</p><h2>Большие идеи<br />начинаются с <em>h3llo.</em></h2><a className={s.primary} href="#configure">Подобрать свой сервер <Arrow /></a><span className={s.closingStar} aria-hidden="true">✳</span></section>
    </main>
    <footer className={s.footer}><img src="/_logo.svg" alt="h3llo cloud" width="156" height="20" /><p>Хорошая основа для того,<br />что вы создаёте.</p><nav aria-label="Навигация в подвале"><a href="#approach">Об облаке</a><a href="#configure">Конфигурации</a><a href="#faq">Вопросы и ответы</a></nav><div className={s.footerBottom}><span>© {new Date().getFullYear()} h3llo cloud</span><span>РОССИЯ / МОСКВА</span><span>КОНЦЕПЦИЯ · ГОТОВИМСЯ К ЗАПУСКУ</span></div></footer>
  </div>;
}
