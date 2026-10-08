"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckIcon, CopyIcon, DownloadIcon, MinusIcon, PlusIcon, ArrowRightIcon } from "@radix-ui/react-icons";

const examples = [
  { title: "Веб-проект", detail: "Сайты и небольшие сервисы", cpu: 2, ram: 4, disk: 40 },
  { title: "Приложение", detail: "API и серверная логика", cpu: 4, ram: 8, disk: 80 },
  { title: "Рабочая среда", detail: "Разработка и тестирование", cpu: 8, ram: 16, disk: 160 },
];

export function Configurator() {
  const [config, setConfig] = useState(examples[1]);
  const [status, setStatus] = useState<"idle" | "copying" | "copied" | "error" | "downloaded">("idle");
  const reduced = useReducedMotion();
  const selected = examples.findIndex(p => p.cpu === config.cpu && p.ram === config.ram && p.disk === config.disk);
  const summary = () => `h3llo cloud / демонстрационная конфигурация\n\n${config.cpu} vCPU\n${config.ram} ГБ RAM\n${config.disk} ГБ диска\n\nПример ресурсов. Тарифы, оборудование и локации уточняются. Это не заказ сервера.\n`;
  const copy = async () => {
    setStatus("copying");
    try { await navigator.clipboard.writeText(summary()); setStatus("copied"); } catch { setStatus("error"); }
  };
  const download = () => {
    try {
      const url = URL.createObjectURL(new Blob([summary()], { type: "text/plain;charset=utf-8" }));
      const a = document.createElement("a"); a.href = url; a.download = "h3llo-taste-configuration.txt"; a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000); setStatus("downloaded");
    } catch { setStatus("error"); }
  };
  const update = (key: "cpu" | "ram" | "disk", value: number) => { setConfig({ ...config, [key]: value }); setStatus("idle"); };

  return <div className="taste:grid taste:gap-12 taste:lg:grid-cols-[1.55fr_1fr] taste:lg:gap-20">
    <div>
      <div className="taste:mb-5 taste:flex taste:items-center taste:justify-between taste:font-mono taste:text-[10px] taste:text-muted"><span>ОТПРАВНАЯ ТОЧКА</span><span className="taste:rounded-full taste:border taste:border-line taste:px-3 taste:py-1">ПРИМЕРЫ РЕСУРСОВ</span></div>
      <div className="taste:border-t taste:border-line">
        {examples.map((example, i) => <button key={example.title} onClick={() => { setConfig(example); setStatus("idle"); }} aria-pressed={selected === i}
          className="taste:relative taste:grid taste:w-full taste:grid-cols-[1fr_auto] taste:items-center taste:gap-4 taste:border-b taste:border-line taste:px-4 taste:py-6 taste:text-left taste:md:grid-cols-[1fr_100px_100px_24px] taste:active:scale-[0.99]">
          {selected === i && <motion.span layoutId="taste-selected-config" transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 100, damping: 20 }} className="taste:pointer-events-none taste:absolute taste:inset-0 taste:bg-wash" />}
          <span className="taste:relative"><strong className="taste:block taste:text-[16px] taste:font-medium">{example.title}</strong><span className="taste:mt-1 taste:block taste:text-[11px] taste:text-muted">{example.detail}</span></span>
          <span className="taste:relative taste:hidden taste:font-mono taste:text-[12px] taste:md:block">{example.cpu} vCPU</span>
          <span className="taste:relative taste:hidden taste:font-mono taste:text-[12px] taste:md:block">{example.ram} ГБ RAM</span>
          <span className={`taste:relative taste:flex taste:size-6 taste:items-center taste:justify-center taste:rounded-full taste:border ${selected === i ? "taste:border-accent taste:bg-accent taste:text-white" : "taste:border-line"}`}>{selected === i ? <CheckIcon aria-hidden="true" /> : <ArrowRightIcon aria-hidden="true" />}</span>
        </button>)}
      </div>
      <p className="taste:mt-7 taste:max-w-md taste:text-[12px] taste:leading-relaxed taste:text-muted">Начните с близкого сценария и измените ресурсы. Финальные линейки и цены появятся к запуску.</p>
    </div>
    <div className="taste:border-t taste:border-ink taste:pt-5">
      <div className="taste:mb-7 taste:flex taste:items-center taste:justify-between"><h3 className="taste:text-xl taste:font-medium taste:tracking-tight">{selected < 0 ? "Своя конфигурация" : examples[selected].title}</h3><span className="taste:font-mono taste:text-[9px] taste:text-muted">YOUR SETUP</span></div>
      {[{ key: "cpu" as const, label: "Процессор", unit: "vCPU", step: 1, min: 1, max: 16 }, { key: "ram" as const, label: "Память", unit: "ГБ", step: 2, min: 2, max: 64 }, { key: "disk" as const, label: "Диск", unit: "ГБ", step: 20, min: 20, max: 500 }].map(item => <div key={item.key} className="taste:mb-5">
        <label htmlFor={`taste-${item.key}`} className="taste:mb-2 taste:block taste:text-[12px] taste:text-muted">{item.label}</label>
        <div className="taste:flex taste:items-center taste:gap-4 taste:border-b taste:border-line taste:pb-3">
          <input id={`taste-${item.key}`} type="range" min={item.min} max={item.max} step={item.step} value={config[item.key]} aria-valuetext={`${config[item.key]} ${item.unit}`} onChange={event => update(item.key, Number(event.target.value))} className="taste:min-w-0 taste:flex-1 taste:accent-accent" />
          <output htmlFor={`taste-${item.key}`} className="taste:w-19 taste:text-right taste:font-mono taste:text-[13px]">{config[item.key]} {item.unit}</output>
          <div className="taste:flex taste:gap-1">{[-1, 1].map(direction => <button key={direction} aria-label={`${direction < 0 ? "Уменьшить" : "Увеличить"}: ${item.label.toLowerCase()}`} disabled={direction < 0 ? config[item.key] <= item.min : config[item.key] >= item.max} onClick={() => update(item.key, Math.min(item.max, Math.max(item.min, config[item.key] + direction * item.step)))} className="taste:flex taste:size-8 taste:items-center taste:justify-center taste:rounded-full taste:border taste:border-line taste:hover:bg-wash taste:active:scale-95 taste:disabled:opacity-30">{direction < 0 ? <MinusIcon aria-hidden="true" /> : <PlusIcon aria-hidden="true" />}</button>)}</div>
        </div>
      </div>)}
      <div className="taste:mt-7 taste:flex taste:gap-3"><button onClick={copy} disabled={status === "copying"} aria-busy={status === "copying"} className="taste:flex taste:min-h-12 taste:flex-1 taste:items-center taste:justify-between taste:gap-3 taste:rounded-full taste:bg-ink taste:px-5 taste:text-[12px] taste:text-white taste:hover:bg-accent taste:active:scale-[0.98] taste:disabled:opacity-70">{status === "copying" ? <span className="taste:h-3 taste:w-28 taste:animate-pulse taste:rounded taste:bg-white/30" /> : status === "copied" ? "Скопировано" : "Скопировать параметры"}{status === "copied" ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}</button><button onClick={download} aria-label="Скачать конфигурацию" className="taste:flex taste:size-12 taste:shrink-0 taste:items-center taste:justify-center taste:rounded-full taste:border taste:border-line taste:hover:bg-wash taste:active:scale-95"><DownloadIcon width={18} height={18} aria-hidden="true" /></button></div>
      <p role="status" className="taste:mt-3 taste:min-h-9 taste:text-[11px] taste:leading-relaxed taste:text-muted">{status === "error" ? "Не удалось сохранить. Попробуйте скачать файл или повторите действие." : status === "copied" ? "Параметры в буфере обмена — можно сохранить в заметках." : status === "downloaded" ? "Конфигурация сохранена в текстовый файл." : "Демонстрационный подбор. Сервер не создаётся."}</p>
    </div>
  </div>;
}
