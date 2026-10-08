"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Button, DataTable, DropdownMenu, DropdownMenuItem, Logo, PageHeader,
  type DataTableColumn,
} from "@cloud/ui";
import styles from "./page.module.css";

type Screen = {
  href: string;
  title: string;
  description: string;
  service: string;
  section: string;
};

const screens: Screen[] = [
  { href: "/virtual-machines", title: "Виртуальные машины — новая версия", description: "Проекты, инстансы, бэкапы, IP-адреса и аккаунт в одной консоли.", service: "Виртуальные машины", section: "Инстансы" },
  { href: "/compute/vms", title: "Виртуальные машины — без границ", description: "Текущая версия со сводкой метрик без внешней рамки.", service: "Виртуальные машины", section: "Инстансы" },
  { href: "/compute/vms/bordered", title: "Виртуальные машины — с границами", description: "Отдельная версия со сводкой метрик в рамке.", service: "Виртуальные машины", section: "Инстансы" },
];
const columns: DataTableColumn<Screen>[] = [
  { id: "title", header: "Заголовок", cell: screen => <Link href={screen.href} className={styles.rowLink} title={screen.title}><span className={styles.cellText}>{screen.title}</span></Link>, minWidth: 290 },
  { id: "description", header: "Описание", cell: screen => <span className={styles.cellText} title={screen.description}>{screen.description}</span>, minWidth: 390, fill: true },
  { id: "url", header: "URL", cell: screen => <code className={styles.cellText} title={screen.href}>{screen.href}</code>, minWidth: 220 },
  { id: "service", header: "Сервис", cell: screen => screen.service, minWidth: 180 },
  { id: "section", header: "Раздел", cell: screen => screen.section, minWidth: 150 },
];
const services = [...new Set(screens.map(screen => screen.service))];
const getScreenId = (screen: Screen) => screen.href;

export default function PrototypeSitemap() {
  const [service, setService] = useState("");
  const [section, setSection] = useState("");
  const sections = [...new Set(screens.filter(screen => !service || screen.service === service).map(screen => screen.section))];
  const visibleScreens = screens.filter(screen => (!service || screen.service === service) && (!section || screen.section === section));

  return (
    <main className={styles.sitemap}>
      <div className={styles.brand}><Logo /></div>
      <PageHeader title="Sitemap" className={styles.heading} />
      <div className={styles.table}>
        <DataTable
          rows={visibleScreens}
          columns={columns}
          getRowId={getScreenId}
          ariaLabel="Sitemap прототипа"
          emptyState="Нет экранов для выбранных фильтров"
          toolbar={<div className={styles.toolbar}>
            <DropdownMenu align="start" ariaLabel="Фильтр по сервису" trigger={<Button variant="soft" aria-label={`Сервис: ${service || "Все сервисы"}`}>{service || "Все сервисы"}</Button>}>
              <DropdownMenuItem selected={!service} onClick={() => { setService(""); setSection(""); }}>Все сервисы</DropdownMenuItem>
              {services.map(value => <DropdownMenuItem key={value} selected={service === value} onClick={() => { setService(value); setSection(""); }}>{value}</DropdownMenuItem>)}
            </DropdownMenu>
            <DropdownMenu align="start" ariaLabel="Фильтр по разделу" trigger={<Button variant="soft" aria-label={`Раздел: ${section || "Все разделы"}`}>{section || "Все разделы"}</Button>}>
              <DropdownMenuItem selected={!section} onClick={() => setSection("")}>Все разделы</DropdownMenuItem>
              {sections.map(value => <DropdownMenuItem key={value} selected={section === value} onClick={() => setSection(value)}>{value}</DropdownMenuItem>)}
            </DropdownMenu>
            <Button variant="ghost" disabled={!service && !section} onClick={() => { setService(""); setSection(""); }}>Сбросить</Button>
            <span className={styles.count} role="status">Показано: {visibleScreens.length} из {screens.length}</span>
          </div>}
        />
      </div>
    </main>
  );
}
