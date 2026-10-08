"use client";

import { useState, type CSSProperties } from "react";
import { Button } from "@cloud/ui";
import styles from "./VirtualMachineCalculator.module.css";

type Period = "month" | "year" | "day";

const periods: { id: Period; label: string }[] = [
  { id: "month", label: "Месяц" },
  { id: "year", label: "Год" },
  { id: "day", label: "День" },
];

const currency = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
const ramNumber = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });
const cpuSteps = [0.25, 0.5, 1, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64] as const;
const diskSteps = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 200, 256, 320, 384, 512, 640, 768, 896, 1024] as const;
const ramMultipliers = [1, 2, 3, 4] as const;
const ramLimit = 256;
const gpuModel = "GPU 16 ГБ";
const monthlyRates = {
  cpu: 1.24 * 720,
  ram: 0.33 * 720,
  ssd: 8.99,
  gpu: 21999.36,
  publicIp: 0.26352 * 720,
  backupVm: 280.8,
  backupStorage: 4.968,
} as const;
const configurationChips = [
  { label: "совсем простенький", icon: "/calculator/preset-simple.svg", cpu: 8, memoryMultiplier: 1, disk: 60 },
  { label: "как у всех", icon: "/calculator/preset-medium.svg", cpu: 16, memoryMultiplier: 2, disk: 200 },
  { label: "что-то намечается", icon: "/calculator/preset-medium.svg", cpu: 32, memoryMultiplier: 3, disk: 512 },
  { label: "мощь", icon: "/calculator/preset-power.svg", cpu: 48, memoryMultiplier: 4, disk: 896 },
] as const;

function ResourceSlider({ label, value, onChange, min, max, step, reference, referencePosition, display, values, minimumValue }: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  reference: number;
  referencePosition: number;
  display: string;
  values?: readonly number[];
  minimumValue?: number;
}) {
  const selectedIndex = values?.indexOf(value) ?? -1;
  const minimumIndex = values && minimumValue !== undefined ? Math.max(0, values.indexOf(minimumValue)) : 0;
  const position = values
    ? selectedIndex / (values.length - 1) * 100
    : value <= reference
    ? (value - min) / (reference - min) * referencePosition
    : referencePosition + (value - reference) / (max - reference) * (100 - referencePosition);
  const setValue = (next: number) => onChange(values
    ? values.slice(minimumIndex).reduce((closest, option) => Math.abs(option - next) < Math.abs(closest - next) ? option : closest)
    : Math.max(min, Math.min(max, next)));
  const stepBy = (direction: number) => {
    if (values) onChange(values[Math.max(minimumIndex, Math.min(values.length - 1, selectedIndex + direction))]);
    else setValue(value + direction * step);
  };
  const updateFromPosition = (nextPosition: number) => {
    if (values) {
      onChange(values[Math.max(minimumIndex, Math.round(nextPosition / 100 * (values.length - 1)))]);
      return;
    }
    const raw = nextPosition <= referencePosition
      ? min + nextPosition / referencePosition * (reference - min)
      : reference + (nextPosition - referencePosition) / (100 - referencePosition) * (max - reference);
    setValue(min + Math.round((raw - min) / step) * step);
  };

  const constrained = Boolean(values && minimumIndex > 0);
  const markWidth = label === "SSD" ? 6 : 8;
  const boundary = (position: number, markWidth: number) => {
    const fraction = position / ((values?.length ?? 1) - 1);
    return `calc(${fraction * 100}% + ${markWidth / 2 - fraction * markWidth}px)`;
  };
  const constraintStyle = values ? {
    "--current-position": boundary(selectedIndex, markWidth),
    "--available-start": boundary(minimumIndex - 0.5, markWidth),
    "--available-end": boundary(values.length - 0.5, markWidth),
    "--available-start-mobile": boundary(minimumIndex - 0.5, markWidth),
    "--available-end-mobile": boundary(values.length - 0.5, markWidth),
  } as CSSProperties : undefined;

  return <div className={styles.resourceSlider}>
    <span className={styles.resourceLabel}>{label}</span>
    <div className={values ? `${styles.stepScale} ${label === "SSD" ? styles.ssdScale : ""}` : styles.scale} data-modified={!values && value !== reference || undefined} data-constrained={constrained || undefined} style={{ "--progress": position + "%", ...constraintStyle } as CSSProperties}>
      {values ? <>
        <span className={styles.stepMarks} aria-hidden="true">
          {values.map((option, index) => <span key={option} className={`${styles.stepMark} ${index === selectedIndex ? styles.activeCurrentStep : ""}`} data-filled={index >= minimumIndex && index <= selectedIndex || undefined}>
          </span>)}
        </span>
        <span className={styles.activeStep} aria-hidden="true">
          <img className={styles.topActive} src="/calculator/top-active.svg" width={2} height={8} alt="" />
          <img className={styles.bottomActive} src="/calculator/bottom-active.svg" width={2} height={8} alt="" />
        </span>
        {label === "CPU" && <>
          <span className={`${styles.blockArea} ${styles.blockLeft}`} aria-hidden="true" />
          <span className={styles.activeArea} aria-hidden="true" />
        </>}
      </> : <img src="/calculator/scale.svg" width={247} height={52} alt="" aria-hidden="true" />}
      <input
        type="range"
        min={0}
        max={values ? values.length - 1 : 100}
        step={values ? 1 : 0.1}
        value={values ? selectedIndex : position}
        onChange={event => values ? onChange(values[Math.max(minimumIndex, Number(event.target.value))]) : updateFromPosition(Number(event.target.value))}
        onKeyDown={event => {
          const direction = event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : 0;
          if (direction) { event.preventDefault(); stepBy(direction); }
          if (event.key === "Home" || event.key === "End") { event.preventDefault(); onChange(event.key === "Home" ? (values?.[minimumIndex] ?? min) : (values?.[values.length - 1] ?? max)); }
        }}
        aria-label={label}
        aria-valuetext={display}
      />
    </div>
    <div className={styles.resourceControls}>
      <output className={styles.resourceValue}>{display}</output>
      <button type="button" className={styles.adjust} onClick={() => stepBy(-1)} disabled={values ? selectedIndex === minimumIndex : value <= min} aria-label={"Уменьшить " + label}>
        <img src="/calculator/minus.svg" width={20} height={20} alt="" />
      </button>
      <button type="button" className={styles.adjust} onClick={() => stepBy(1)} disabled={values ? selectedIndex === values.length - 1 : value >= max} aria-label={"Увеличить " + label}>
        <img src="/calculator/plus.svg" width={20} height={20} alt="" />
      </button>
    </div>
  </div>;
}

function RamSlider({ cpu, multiplier, onChange }: {
  cpu: number;
  multiplier: number;
  onChange: (multiplier: number) => void;
}) {
  const available = ramMultipliers.filter(option => cpu * option <= ramLimit);
  const cpuIndex = cpuSteps.indexOf(cpu as typeof cpuSteps[number]);
  const firstMark = Math.round(Math.pow(cpuIndex / (cpuSteps.length - 1), 1.2) * (cpuSteps.length - ramMultipliers.length));
  const lastMark = firstMark + available.length - 1;
  const selectedMark = firstMark + available.indexOf(multiplier as typeof ramMultipliers[number]);
  const memory = cpu * multiplier;
  const display = ramNumber.format(memory) + " ГБ";
  const boundary = (position: number, markWidth: number) => {
    const fraction = position / (cpuSteps.length - 1);
    return `calc(${fraction * 100}% + ${markWidth / 2 - fraction * markWidth}px)`;
  };
  const availableStart = boundary(firstMark - 0.5, 8);
  const availableEnd = boundary(lastMark + 0.5, 8);
  const availableStartMobile = boundary(firstMark - 0.5, 8);
  const availableEndMobile = boundary(lastMark + 0.5, 8);
  const setMark = (mark: number) => onChange(available[Math.max(0, Math.min(available.length - 1, mark - firstMark))]);
  const stepBy = (direction: number) => setMark(selectedMark + direction);

  return <div className={styles.resourceSlider}>
    <span className={styles.resourceLabel}>RAM</span>
    <div className={`${styles.stepScale} ${styles.ramScale}`} style={{
      "--current-position": boundary(selectedMark, 8),
      "--available-start": availableStart,
      "--available-end": availableEnd,
      "--available-start-mobile": availableStartMobile,
      "--available-end-mobile": availableEndMobile,
    } as CSSProperties}>
      <span className={styles.stepMarks} aria-hidden="true">
        {cpuSteps.map((_, index) => <span key={index} className={`${styles.stepMark} ${index === selectedMark ? styles.activeCurrentStep : ""}`} data-filled={index >= firstMark && index <= selectedMark || undefined}>
        </span>)}
      </span>
      <span className={styles.activeStep} aria-hidden="true">
        <img className={styles.topActive} src="/calculator/top-active.svg" width={2} height={8} alt="" />
        <img className={styles.bottomActive} src="/calculator/bottom-active.svg" width={2} height={8} alt="" />
      </span>
      {firstMark > 0 && <span className={`${styles.blockArea} ${styles.blockLeft}`} aria-hidden="true" />}
      {lastMark < 15 && <span className={`${styles.blockArea} ${styles.blockRight}`} aria-hidden="true" />}
      <span className={styles.activeArea} aria-hidden="true" />
      <input
        type="range"
        min={0}
        max={15}
        step={1}
        value={selectedMark}
        onChange={event => setMark(Number(event.target.value))}
        onKeyDown={event => {
          const direction = event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : 0;
          if (direction) { event.preventDefault(); stepBy(direction); }
          if (event.key === "Home" || event.key === "End") { event.preventDefault(); onChange(event.key === "Home" ? available[0] : available[available.length - 1]); }
        }}
        aria-label="RAM"
        aria-valuetext={`${display}, ${multiplier}× vCPU`}
      />
    </div>
    <div className={styles.resourceControls}>
      <output className={styles.resourceValue}>{display}</output>
      <button type="button" className={styles.adjust} onClick={() => stepBy(-1)} disabled={multiplier === available[0]} aria-label="Уменьшить RAM">
        <img src="/calculator/minus.svg" width={20} height={20} alt="" />
      </button>
      <button type="button" className={styles.adjust} onClick={() => stepBy(1)} disabled={multiplier === available[available.length - 1]} aria-label="Увеличить RAM">
        <img src="/calculator/plus.svg" width={20} height={20} alt="" />
      </button>
    </div>
  </div>;
}

export function VirtualMachineCalculator() {
  const [cpu, setCpu] = useState(8);
  const [memoryMultiplier, setMemoryMultiplier] = useState(2);
  const [disk, setDisk] = useState(200);
  const [gpu, setGpu] = useState(false);
  const [backups, setBackups] = useState(true);
  const [period, setPeriod] = useState<Period>("month");
  const [launched, setLaunched] = useState(false);
  const memory = cpu * memoryMultiplier;
  const memoryDisplay = ramNumber.format(memory);
  const cpuLevel = cpuSteps.indexOf(cpu as typeof cpuSteps[number]) / (cpuSteps.length - 1);
  const memoryLevel = memory / ramLimit;
  const diskLevel = diskSteps.indexOf(disk as typeof diskSteps[number]) / (diskSteps.length - 1);
  const configurationLevel = cpuLevel * 0.5 + memoryLevel * 0.25 + diskLevel * 0.25;
  const activeChip = configurationLevel < 0.32 ? 0 : configurationLevel < 0.55 ? 1 : configurationLevel < 0.78 ? 2 : 3;
  const changeCpu = (nextCpu: number) => {
    setCpu(nextCpu);
  };
  const changeGpu = (enabled: boolean) => {
    setGpu(enabled);
    if (enabled && cpu < 8) changeCpu(8);
  };
  const applyConfigurationChip = (chip: typeof configurationChips[number]) => {
    setCpu(chip.cpu);
    setMemoryMultiplier(chip.memoryMultiplier);
    setDisk(chip.disk);
  };

  // Public cloud rates are used as a reference for the calculator prototype.
  const periodFactor = period === "year" ? 12 : period === "day" ? 1 / 30 : 1;
  const monthlyPriceRows: { label: string; monthlyCost: number; disabled?: boolean }[] = [
    { label: `${cpu} vCPU`, monthlyCost: cpu * monthlyRates.cpu },
    { label: `${memoryDisplay} ГБ RAM`, monthlyCost: memory * monthlyRates.ram },
    { label: `${disk} ГБ SSD`, monthlyCost: disk * monthlyRates.ssd },
    { label: gpuModel, monthlyCost: gpu ? monthlyRates.gpu : 0, disabled: !gpu },
    { label: "Публичный IP", monthlyCost: monthlyRates.publicIp },
    ...(backups ? [{ label: "Автобэкапы", monthlyCost: monthlyRates.backupVm + disk * monthlyRates.backupStorage }] : []),
  ];
  const priceRows = monthlyPriceRows.map(row => ({ ...row, cost: Math.round(row.monthlyCost * periodFactor) }));
  const price = priceRows.reduce((total, row) => total + row.cost, 0);

  return <section id="calculator" className={styles.calculator} aria-labelledby="calculator-title">
    <header className={styles.heading}>
      <h2 id="calculator-title">соберите свой сервер</h2>
      <p>Платишь только за использованные ресурсы. С точностью до секунды</p>
    </header>
    <div className={styles.configuration}>
      <div className={styles.chips} aria-label="Уровень конфигурации">
        {configurationChips.map((chip, index) => <button type="button" key={chip.label} className={styles.chip} data-active={index === activeChip || undefined} aria-pressed={index === activeChip} onClick={() => applyConfigurationChip(chip)}>
          {chip.label}<img src={chip.icon} alt="" />
        </button>)}
      </div>
    <div className={styles.layout}>
      <div className={styles.resources}>
        <ResourceSlider label="CPU" value={cpu} onChange={changeCpu} min={0.25} max={64} step={1} reference={6} referencePosition={66} display={cpu + " vCPU"} values={cpuSteps} minimumValue={gpu ? 8 : undefined} />
        <RamSlider cpu={cpu} multiplier={memoryMultiplier} onChange={setMemoryMultiplier} />
        <ResourceSlider label="SSD" value={disk} onChange={setDisk} min={10} max={1024} step={1} reference={200} referencePosition={66} display={disk + " ГБ"} values={diskSteps} />
        <label className={styles.switchRow}>
          <input className={styles.switchInput} type="checkbox" checked={gpu} onChange={event => changeGpu(event.target.checked)} />
          <span className={styles.switchVisual} aria-hidden="true"><span className={styles.switchThumb} /></span>
          <span>{gpuModel}</span>
        </label>
        <label className={styles.switchRow}>
          <input className={styles.switchInput} type="checkbox" checked={backups} onChange={event => setBackups(event.target.checked)} />
          <span className={styles.switchVisual} aria-hidden="true"><span className={styles.switchThumb} /></span>
          <span>Авто бэкапы</span>
        </label>
      </div>
      <div className={styles.summary}>
        <div className={styles.periods} role="group" aria-label="Период расчёта">
          {periods.map(option => <button key={option.id} type="button" className={styles.period} data-selected={period === option.id || undefined} aria-pressed={period === option.id} onClick={() => setPeriod(option.id)}>{option.label}</button>)}
        </div>
        <output className={styles.price} aria-live="polite" aria-label="Стоимость">{currency.format(price)} ₽</output>
        <div className={styles.specs} aria-label="Выбранная конфигурация">
          {priceRows.map(row => <div key={row.label} className={styles.specRow}>
            <span>{row.label}</span>
            <span className={styles.specCost}>{row.disabled ? "Выкл" : `${currency.format(row.cost)} ₽`}</span>
          </div>)}
        </div>
        <Button variant="solid" className={styles.launch} onClick={() => setLaunched(true)}>Запустить</Button>
      </div>
    </div>
    </div>
    {launched && <p className={styles.notice} role="status">Конфигурация подготовлена. Запуск сервера в прототипе пока недоступен.</p>}
  </section>;
}
