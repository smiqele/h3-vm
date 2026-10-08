"use client";

import { useState } from "react";
import { Button, Icon, Status } from "@cloud/ui";
import { getVmStatusPresentation, type VmStatusValue } from "@cloud/console-runtime";
import styles from "./VmOverviewConcept.module.css";

type Vm = {
  name: string;
  id: string;
  status: VmStatusValue;
  address: string;
  cpu: string;
  ram: string;
  diskUsed: number;
  diskTotal: number;
  signal?: string;
};

const machines: Vm[] = [
  { name: "hot-server-name", id: "VM-V9H2C4T5B", status: "running", address: "185.205.55.25", cpu: "8 vCPU", ram: "64 ГБ", diskUsed: 720, diskTotal: 1000, signal: "CPU выше 80% · 18 мин" },
  { name: "cold-server-01", id: "VM-X7P9D2Q6M", status: "stopped", address: "10.0.0.30", cpu: "4 vCPU", ram: "32 ГБ", diskUsed: 450, diskTotal: 1000 },
  { name: "backup-server", id: "VM-J3D8K7L2N", status: "running", address: "185.205.55.101", cpu: "8 vCPU", ram: "64 ГБ", diskUsed: 750, diskTotal: 1000 },
  { name: "db-primary", id: "VM-R5T1Y8Z9W", status: "error", address: "185.205.55.102", cpu: "12 vCPU", ram: "128 ГБ", diskUsed: 890, diskTotal: 1000, signal: "Диск заполнен на 89%" },
  { name: "web-server-a", id: "VM-F6L2M3Q8R", status: "running", address: "185.205.55.103", cpu: "6 vCPU", ram: "48 ГБ", diskUsed: 350, diskTotal: 1000 },
];

const quotas = [
  { icon: "server" as const, label: "Инстансы", used: 17, limit: 99, unit: "" },
  { icon: "cpu" as const, label: "vCPU", used: 42, limit: 120, unit: "" },
  { icon: "memory" as const, label: "RAM", used: 8, limit: 50, unit: " ГБ" },
  { icon: "network" as const, label: "Публичные IP", used: 65, limit: 200, unit: "" },
  { icon: "hard-drive" as const, label: "Диски", used: 687, limit: 1024, unit: " ГБ" },
];

export function VmOverviewConcept() {
  const [attentionOnly, setAttentionOnly] = useState(false);
  const visibleMachines = attentionOnly ? machines.filter(machine => machine.signal || machine.status === "error") : machines;

  return (
    <div className={styles.discovery}>
      <aside className={styles.hypothesis}>
        <span>Проверяем гипотезу</span>
        <p>Сначала пользователь видит, требует ли инфраструктура внимания. Лимиты остаются рядом, но не маскируются под телеметрию.</p>
      </aside>

      <section className={styles.console} aria-label="Концепт экрана виртуальных машин">
        <header className={styles.pageHeader}>
          <div><p>Compute</p><h2>Виртуальные машины</h2></div>
          <Button variant="solid" leadingIcon={<Icon name="plus" size="inherit" />}>Создать</Button>
        </header>

        <div className={styles.summaryStack}>
          <section className={styles.summaryPanel} aria-labelledby="health-title">
            <header className={styles.summaryHeader}><h3 id="health-title">Состояние</h3><button type="button" aria-label="Действия с состоянием"><Icon name="ellipsis" size="sm"/></button></header>
            <div className={styles.stateGrid}>
              <article><span>Инстансы</span><div className={styles.stateValue}><strong>17</strong><div className={styles.statusLegend}><i data-tone="positive"/>11 <i data-tone="neutral"/>5 <i data-tone="negative"/>2</div></div></article>
              <article><span>Утилизация</span><div className={styles.inlineMetrics}><span><i className={styles.spark}/>CPU <strong>43%</strong></span><span><i className={styles.spark}/>RAM <strong>35%</strong></span></div></article>
              <article><span>Занятое место на дисках</span><div className={styles.diskSummary}><i><b/></i><strong>256 ГБ <small>из 1024 ГБ</small></strong></div></article>
            </div>
          </section>

          <section className={styles.summaryPanel} aria-labelledby="costs-title">
            <header className={styles.summaryHeader}><h3 id="costs-title">Потребление</h3><button type="button" aria-label="Действия с потреблением"><Icon name="ellipsis" size="sm"/></button></header>
            <div className={styles.consumptionGrid}>
              <article><span>Начислено на сегодня</span><div><strong>18 420 ₽</strong><small>1–18 сентября</small></div></article>
              <article><span>Прогноз на месяц</span><div><strong>27 600 ₽</strong><small>↗ 12% к августу</small></div></article>
              <article><span>Основной источник</span><div><strong>32 vCPU</strong><small>11 789 ₽</small><small>64% от проекта</small></div></article>
            </div>
          </section>

          <section className={styles.summaryPanel} aria-labelledby="quota-title">
            <header className={styles.summaryHeader}><h3 id="quota-title">Квоты</h3><button type="button" aria-label="Действия с квотами"><Icon name="ellipsis" size="sm"/></button></header>
            <div className={styles.compactQuotaGrid}>{quotas.map(item => {
            const percent = Math.round(item.used / item.limit * 100);
            return <article key={item.label}>
              <div><span>{item.label}</span><strong>{item.used}{item.unit} <small>из {item.limit}{item.unit}</small></strong></div>
              <div className={styles.progress} role="progressbar" aria-label={item.label} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><i style={{width: `${percent}%`}}/></div>
            </article>;
          })}</div>
          </section>
        </div>

        <section className={styles.tableSection} aria-labelledby="vm-list-title">
          <header className={styles.tableToolbar}>
            <div><h3 id="vm-list-title">Все ВМ</h3><span>{visibleMachines.length} из {machines.length}</span></div>
            <div className={styles.filters} aria-label="Фильтр списка">
              <button type="button" className={!attentionOnly ? styles.activeFilter : undefined} onClick={() => setAttentionOnly(false)}>Все</button>
              <button type="button" className={attentionOnly ? styles.activeFilter : undefined} onClick={() => setAttentionOnly(true)}>Требуют внимания <b>2</b></button>
            </div>
          </header>
          <div className={styles.tableWrap}>
            <table>
              <thead><tr><th>Имя</th><th>Состояние</th><th>Адрес</th><th>Конфигурация</th><th>Диск занят</th><th><span className="sr-only">Действия</span></th></tr></thead>
              <tbody>{visibleMachines.map(machine => {
                const diskPercent = Math.round(machine.diskUsed / machine.diskTotal * 100);
                return <tr key={machine.id}>
                  <td><strong>{machine.name}</strong><small>{machine.id}</small></td>
                  <td><VmStatus status={machine.status} />{machine.signal && <small className={styles.signal}>{machine.signal}</small>}</td>
                  <td>{machine.address}</td>
                  <td><span>{machine.cpu}</span><small>{machine.ram} RAM</small></td>
                  <td><span>{machine.diskUsed} из {machine.diskTotal} ГБ</span><div className={styles.disk}><i style={{width: `${diskPercent}%`}} data-warning={diskPercent >= 80}/><small>{diskPercent}%</small></div></td>
                  <td><button className={styles.iconButton} type="button" aria-label={`Действия: ${machine.name}`}><Icon name="ellipsis" size="sm"/></button></td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        </section>
      </section>
    </div>
  );
}

function VmStatus({ status }: { status: VmStatusValue }) {
  const { label, tone, animated } = getVmStatusPresentation(status);
  return <Status tone={tone} animated={animated}>{label}</Status>;
}
