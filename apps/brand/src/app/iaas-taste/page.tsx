import type { Metadata } from "next";
import { ArrowDownIcon, ArrowTopRightIcon, PlusIcon } from "@radix-ui/react-icons";
import { SiteLogoMenu } from "@/components/SiteLogoMenu";
import { MagneticLink, Reveal } from "./Motion";
import { Configurator } from "./Configurator";
import "./taste.css";

export const metadata: Metadata = {
  title: "h3llo cloud — Мощность для дела. Ясность в деталях.",
  description: "Новый взгляд на публичное облако: современное оборудование, понятные ресурсы, простое управление и поддержка 24/7. Концепция h3llo cloud.",
};

const wrap = "taste:mx-auto taste:w-full taste:max-w-[1400px] taste:px-6 taste:md:px-12";
const eyebrow = "taste:font-mono taste:text-[10px] taste:tracking-[.06em] taste:text-muted";
const heading = "taste:text-[34px] taste:font-medium taste:leading-[1.15] taste:tracking-[-.045em] taste:md:text-[46px]";
const faq = [
  ["Для чего это облако?", "Для сайтов, приложений, API и рабочих сред, которыми вы управляете самостоятельно. В основе продукта — виртуальные машины, диски и сети."],
  ["Можно уже запустить сервер?", "Пока это концепция продукта. Здесь можно подобрать ресурсы и сохранить параметры. Доступные конфигурации, цены и самостоятельную регистрацию откроем к запуску."],
  ["Что известно об оборудовании?", "Современное оборудование — одна из опор h3llo cloud. Точные модели CPU, правила выделения vCPU, характеристики хранения и результаты тестов ещё готовятся к публикации."],
  ["Где будут находиться серверы?", "Продукт ориентирован на Россию, с фокусом на Москве. Фактические локации инфраструктуры и площадки будут объявлены отдельно."],
  ["Как будет работать поддержка?", "Планируем круглосуточную помощь по инфраструктуре. Каналы связи, сроки реакции и границы ответственности опубликуем до запуска. Управление вашей ОС и приложением рассматривается отдельно."],
];

export default function TastePage() {
  return <div className="taste-page taste:overflow-clip">
    <a href="#taste-main" className="taste:fixed taste:-top-20 taste:left-5 taste:z-50 taste:rounded taste:bg-ink taste:p-4 taste:text-white taste:focus:top-5">Перейти к содержимому</a>
    <div className={`${wrap} taste:flex taste:items-center taste:justify-between taste:gap-4 taste:border-b taste:border-line taste:py-3`}><span className="taste:flex taste:items-center taste:gap-2 taste:text-[10px] taste:text-muted"><span className="taste:size-1.5 taste:rounded-full taste:bg-accent" />Знакомьтесь: новое публичное облако</span><a href="/iaas" className="taste:flex taste:items-center taste:gap-2 taste:text-[10px] taste:text-muted taste:hover:text-ink">Версия 01<ArrowTopRightIcon aria-hidden="true" /></a></div>
    <header className={`${wrap} taste:flex taste:flex-wrap taste:items-center taste:justify-between taste:gap-y-5 taste:py-7`}><SiteLogoMenu /><nav aria-label="Разделы новой версии" className="taste:order-3 taste:flex taste:w-full taste:justify-between taste:gap-6 taste:text-[12px] taste:md:order-0 taste:md:w-auto"><a href="#taste-approach" className="taste:hover:text-accent">Подход</a><a href="#taste-resources" className="taste:hover:text-accent">Ресурсы</a><a href="#taste-support" className="taste:hover:text-accent">Поддержка</a></nav><a href="#taste-configure" className="taste:flex taste:items-center taste:gap-4 taste:text-[12px] taste:font-medium taste:hover:text-accent">Подобрать сервер<ArrowTopRightIcon width={17} height={17} aria-hidden="true" /></a></header>
    <main id="taste-main">
      <section className={`${wrap} taste:relative taste:grid taste:gap-10 taste:pt-10 taste:pb-8 taste:md:grid-cols-[1.2fr_.8fr] taste:md:items-end taste:md:pt-20 taste:lg:gap-24`}>
        <Reveal className="taste:relative taste:pt-5 taste:md:pt-8">
          <p className={`${eyebrow} taste:mb-9`}>H3LLO CLOUD / ОБЛАЧНЫЕ СЕРВЕРЫ</p>
          <h1 className="taste:max-w-[620px] taste:text-[43px] taste:font-medium taste:leading-[1.08] taste:tracking-[-.055em] taste:lg:text-[64px]">Мощность<br />для дела.<br /><span className="taste:text-accent">Ясность<br className="taste:hidden taste:lg:block" /> в деталях.</span></h1>
          <p className="taste:mt-7 taste:max-w-[355px] taste:text-[14px] taste:leading-[1.8] taste:text-muted">Современное оборудование для ваших приложений. Понятные ресурсы, простое управление и поддержка 24/7.</p>
          <div className="taste:mt-9 taste:flex taste:flex-wrap taste:items-center taste:gap-6"><MagneticLink href="#taste-configure">Выбрать конфигурацию</MagneticLink><a href="#taste-approach" className="taste:flex taste:items-center taste:gap-2 taste:text-[11px] taste:text-muted taste:hover:text-accent">Наш подход<ArrowDownIcon aria-hidden="true" /></a></div>
          <p className="taste:mt-6 taste:text-[10px] taste:text-muted">Концепция продукта. Готовимся к запуску.</p>
        </Reveal>
        <Reveal delay={.15} className="taste:mb-7 taste:border-t taste:border-ink taste:md:mb-2">
          <p className={`${eyebrow} taste:py-5`}>В ОСНОВЕ H3LLO CLOUD</p>
          {[["01", "Характеристики открыты", "Понимайте, какие ресурсы выбираете."], ["02", "Стоимость ясна", "Видите состав тарифа до запуска."], ["03", "Помощь рядом", "Обращайтесь по вопросам инфраструктуры 24/7."]].map(([number, title, text]) => <div key={number} className="taste:grid taste:grid-cols-[34px_1fr] taste:gap-4 taste:border-t taste:border-line taste:py-5"><span className={`${eyebrow} taste:pt-1`}>{number}</span><div><h2 className="taste:text-[15px] taste:font-medium">{title}</h2><p className="taste:mt-1 taste:text-[11px] taste:leading-relaxed taste:text-muted">{text}</p></div></div>)}
        </Reveal>
        <div className="taste:col-span-full taste:mt-8 taste:grid taste:grid-cols-2 taste:gap-5 taste:border-t taste:border-line taste:py-6 taste:md:grid-cols-[1fr_1fr_1fr_auto]"><span className={eyebrow}>ВЫЧИСЛЕНИЯ</span><span className={eyebrow}>ХРАНЕНИЕ</span><span className={eyebrow}>СЕТИ</span><span className={`${eyebrow} taste:flex taste:items-center taste:justify-end taste:gap-3`}>СОБРАНО ВОКРУГ ВАС<ArrowDownIcon aria-hidden="true" /></span></div>
      </section>

      <section id="taste-approach" className={`${wrap} taste:py-18 taste:md:py-28`}>
        <div className="taste:grid taste:gap-9 taste:md:grid-cols-[.7fr_1.3fr]"><p className={eyebrow}>01 / НАША ТОЧКА ЗРЕНИЯ</p><div><h2 className={`${heading} taste:max-w-[710px]`}>Облако должно давать<br />уверенность <span className="taste:text-muted">в каждом<br className="taste:hidden taste:md:block" /> вашем решении.</span></h2><p className="taste:mt-7 taste:max-w-[475px] taste:text-[14px] taste:leading-[1.85] taste:text-muted">Какой сервер выбрать. За что вы платите. Куда обратиться за помощью. Ответы на эти вопросы должны быть частью самого продукта.</p></div></div>
        <div className="taste:mt-14 taste:grid taste:gap-x-12 taste:md:ml-[35%]">
          {[
            ["01", "Оборудование с открытыми характеристиками", "Модель CPU, условия использования ядер, параметры диска и сети. Достаточно деталей, чтобы выбрать ресурсы под свою нагрузку."],
            ["02", "Стоимость, которую можно объяснить", "Понятный состав тарифа и отдельный расчёт дополнительных ресурсов. Что включено, что оплачивается отдельно и когда начинаются начисления."],
            ["03", "Управление, которое легко освоить", "Создание сервера, подключение, изменение ресурсов и контроль расходов. Привычные задачи в последовательном интерфейсе."],
          ].map(([number, title, text]) => <div key={number} className="taste:grid taste:grid-cols-[32px_1fr] taste:gap-4 taste:border-t taste:border-line taste:py-7 taste:md:grid-cols-[40px_1fr_1fr] taste:md:gap-6"><span className={`${eyebrow} taste:pt-1`}>{number}</span><h3 className="taste:text-[17px] taste:font-medium taste:leading-snug taste:tracking-tight">{title}</h3><p className="taste:col-start-2 taste:text-[12px] taste:leading-[1.85] taste:text-muted taste:md:col-start-auto">{text}</p></div>)}
        </div>
      </section>

      <section id="taste-resources" className="taste:bg-ink taste:text-paper"><div className={`${wrap} taste:py-16 taste:md:py-24`}>
        <div className="taste:grid taste:gap-8 taste:md:grid-cols-[1fr_1fr]"><div><p className="taste:mb-9 taste:font-mono taste:text-[10px] taste:tracking-wider taste:text-[#a9b7ae]">02 / КЛАССИКА, ПРОДУМАННАЯ ЗАНОВО</p><h2 className={heading}>Хороший сервер.<br /><span className="taste:text-[#a9b7ae]">И всё вокруг него.</span></h2></div><p className="taste:max-w-[360px] taste:self-end taste:text-[14px] taste:leading-[1.85] taste:text-[#b3c0b7] taste:md:justify-self-end">Вычислять, хранить и соединять. Три понятные задачи, из которых складывается инфраструктура вашего проекта.</p></div>
        <div className="taste:mt-14 taste:border-t taste:border-[#4e5b53]">
          {[["VM", "Вычисления", "Ресурсы для приложения, сайта или среды разработки."], ["VOL", "Диски", "Место для системы, файлов и данных вашего проекта."], ["NET", "Сети", "Внутренняя связность и управление доступом к ресурсам."]].map(([code, title, text]) => <div key={code} className="taste:grid taste:gap-3 taste:border-b taste:border-[#4e5b53] taste:py-7 taste:md:grid-cols-[70px_1fr_1fr] taste:md:items-start taste:md:gap-8 taste:md:py-9"><span className="taste:pt-1 taste:font-mono taste:text-[9px] taste:text-[#a9b7ae]">{code}</span><h3 className="taste:text-[23px] taste:font-medium taste:tracking-tight">{title}</h3><p className="taste:max-w-[340px] taste:text-[12px] taste:leading-[1.8] taste:text-[#b3c0b7]">{text}</p></div>)}
          <p className="taste:mt-5 taste:text-[10px] taste:leading-relaxed taste:text-[#a9b7ae]">Состав сервисов и технические параметры уточняются к запуску.</p>
        </div>
      </div></section>

      <section id="taste-configure" className={`${wrap} taste:py-18 taste:md:py-28`}><div className="taste:mb-12 taste:grid taste:gap-8 taste:md:grid-cols-[.7fr_1.3fr]"><p className={eyebrow}>03 / МЕСТО ДЛЯ ВАШЕГО ПРОЕКТА</p><div><h2 className={heading}>Начните с задачи.<br /><span className="taste:text-muted">Подберите ресурсы.</span></h2><p className="taste:mt-5 taste:max-w-[410px] taste:text-[14px] taste:leading-[1.8] taste:text-muted">Попробуйте конфигурацию на себя. Параметры можно изменить, скопировать или сохранить в файл.</p></div></div><Configurator /></section>

      <section id="taste-support" className="taste:bg-wash"><div className={`${wrap} taste:grid taste:gap-12 taste:py-16 taste:md:grid-cols-[.8fr_1.2fr] taste:md:gap-20 taste:md:py-22`}>
        <div><p className={eyebrow}>04 / НА ДРУГОЙ СТОРОНЕ — ЛЮДИ</p><div className="taste:mt-10 taste:flex taste:items-baseline taste:gap-2 taste:font-mono taste:text-[88px] taste:leading-none taste:tracking-[-.09em] taste:md:text-[116px]">24<span className="taste:text-[#81988a]">/</span>7</div><div className="taste-support-line" aria-hidden="true" /><p className="taste:font-mono taste:text-[9px] taste:tracking-wider taste:text-muted">ПОДДЕРЖКА ИНФРАСТРУКТУРЫ</p></div>
        <div className="taste:self-center"><h2 className={heading}>Вопросы возникают<br />в любое время.<br /><span className="taste:text-accent">Мы это учитываем.</span></h2><p className="taste:mt-6 taste:max-w-[460px] taste:text-[14px] taste:leading-[1.85] taste:text-muted">Круглосуточная поддержка — часть замысла h3llo cloud. С понятными каналами связи, границами помощи и порядком работы с обращениями.</p><p className="taste:mt-7 taste:max-w-[420px] taste:border-t taste:border-[#b8c7bd] taste:pt-5 taste:text-[11px] taste:leading-relaxed taste:text-muted">Регламент и сроки реакции опубликуем до запуска продукта.</p></div>
      </div></section>

      <section id="taste-faq" className={`${wrap} taste:grid taste:gap-10 taste:py-18 taste:md:grid-cols-[.8fr_1.2fr] taste:md:gap-20 taste:md:py-26`}><div><p className={`${eyebrow} taste:mb-8`}>05 / ПРЯМЫЕ ОТВЕТЫ</p><h2 className={heading}>До первого<br /><span className="taste:text-muted">сервера.</span></h2></div><div className="taste:border-t taste:border-line">{faq.map(([q, a]) => <details key={q} className="taste-faq taste:border-b taste:border-line"><summary className="taste:flex taste:items-center taste:justify-between taste:gap-5 taste:py-6 taste:text-[14px] taste:font-medium">{q}<PlusIcon aria-hidden="true" className="taste-plus taste:shrink-0 taste:transition-transform taste:duration-300" /></summary><p className="taste:max-w-[540px] taste:pb-7 taste:text-[13px] taste:leading-[1.9] taste:text-muted">{a}</p></details>)}</div></section>

      <section className={`${wrap} taste:pb-16`}><div className="taste:grid taste:items-end taste:gap-9 taste:border-t taste:border-line taste:pt-12 taste:md:grid-cols-[1fr_auto]"><div><p className={`${eyebrow} taste:mb-5`}>H3LLO, YOUR NEXT PROJECT.</p><h2 className="taste:text-[35px] taste:font-medium taste:leading-[1.15] taste:tracking-[-.045em] taste:md:text-[50px]">Хорошая основа<br />для того, что <span className="taste:text-accent">вы создаёте.</span></h2></div><div className="taste:justify-self-start taste:md:pb-2"><MagneticLink href="#taste-configure">Подобрать свой сервер</MagneticLink></div></div></section>
    </main>
    <footer className="taste:bg-ink taste:text-paper"><div className={`${wrap} taste:grid taste:grid-cols-1 taste:gap-7 taste:py-10 taste:md:grid-cols-[1fr_auto]`}><img src="/_logo.svg" alt="h3llo cloud" width={146} height={20} className="taste:brightness-0 taste:invert" /><nav aria-label="Ссылки в подвале" className="taste:flex taste:flex-wrap taste:gap-7 taste:text-[11px] taste:text-[#b3c0b7]"><a href="/iaas">Первая версия</a><a href="#taste-approach">Наш подход</a><a href="#taste-faq">Вопросы и ответы</a></nav><div className="taste:col-span-full taste:mt-5 taste:flex taste:flex-wrap taste:justify-between taste:gap-4 taste:border-t taste:border-[#46534a] taste:pt-6 taste:font-mono taste:text-[9px] taste:text-[#b3c0b7]"><span>© 2026 H3LLO CLOUD</span><span>РОССИЯ / МОСКВА</span><span>КОНЦЕПЦИЯ ПРОДУКТА</span></div></div></footer>
  </div>;
}
