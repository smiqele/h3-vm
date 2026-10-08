"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, Icon, IconButton, Logo, SidebarContextSwitcher, SidebarNav, type IconName, type SidebarNavSection } from "@cloud/ui";
import { loadConsoleModel } from "@cloud/console-runtime";
import { ConsoleWidthToggle } from "./ConsoleWidthToggle";
import styles from "./ConsoleSidebar.module.css";

type Theme = "light" | "dark";
const icon = (name: IconName) => <Icon name={name} size="inherit" />;

function buildSections(): readonly SidebarNavSection[] {
  const model = loadConsoleModel();
  const screenById = new Map(model.screens.screens.map(screen => [screen.id, screen]));

  return model.navigation.sections.map(section => ({
    id: section.id,
    label: section.label,
    items: section.items.map(item => {
      const screen = item.screen ? screenById.get(item.screen) : undefined;
      const available = item.lifecycle === "available" && typeof screen?.route === "string";
      return {
        id: item.id,
        label: item.label,
        icon: icon(item.icon as IconName),
        href: available ? screen.route : undefined,
        disabled: !available,
      };
    }),
  }));
}

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const storedTheme = localStorage.getItem("prototype-theme") as Theme | null;
    const initialTheme = storedTheme === "light" ? "light" : "dark";
    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("prototype-theme", nextTheme);
  }

  const nextThemeLabel = theme === "dark" ? "светлую" : "тёмную";
  return <IconButton icon={theme === "dark" ? "sun" : "moon"} label={`Переключить на ${nextThemeLabel} тему`} title={`Переключить на ${nextThemeLabel} тему`} onClick={toggleTheme} />;
}

export function ConsoleSidebar() {
  const pathname = usePathname();
  const sections = buildSections();
  const activeItemId = sections.flatMap(section => section.items).find(item => item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`)))?.id;
  return (
    <div className={styles.content}>
      <header>
        <Link href="/" className={styles.homeLink} aria-label="Sitemap прототипа"><Logo /></Link>
        <div><IconButton icon="search" label="Поиск" size="compact" /><IconButton icon="plus" label="Создать" size="compact" /></div>
      </header>

      <div className={styles.contextSwitcher}>
        <SidebarContextSwitcher workspace="Acme Corp" project="Production" serviceLabel="IaaS" aria-label="Сменить workspace или project" />
      </div>

      <SidebarNav sections={sections} activeItemId={activeItemId} label="Навигация облачной консоли" renderLink={(item, content, { active }) => <Link href={item.href!} aria-current={active ? "page" : undefined}>{content}</Link>} />

      <footer>
        <span className={styles.profile}><Avatar src="/assets/avatar.png" label="Профиль пользователя" /></span>
        <IconButton icon="key" label="Ключи доступа" />
        <ThemeToggle />
        <ConsoleWidthToggle />
        <IconButton icon="message" label="Поддержка" />
      </footer>
    </div>
  );
}
