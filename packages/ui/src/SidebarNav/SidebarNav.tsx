import type { ReactNode } from "react";
import { NavLink } from "../NavLink/NavLink";
import styles from "./SidebarNav.module.css";

export interface SidebarNavItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  disabled?: boolean;
}

export interface SidebarNavSection {
  id: string;
  label?: string;
  items: readonly SidebarNavItem[];
}

export interface SidebarNavProps {
  sections: readonly SidebarNavSection[];
  activeItemId?: string;
  label?: string;
  renderLink?: (
    item: SidebarNavItem,
    content: ReactNode,
    state: { active: boolean },
  ) => ReactNode;
}

export function SidebarNav({
  sections,
  activeItemId,
  label = "Основная навигация",
  renderLink,
}: SidebarNavProps) {
  return (
    <nav className={styles.navigation} aria-label={label}>
      {sections.map((section) => (
        <section key={section.id}>
          {section.label && <p>{section.label}</p>}
          {section.items.map((item) => {
            const active = item.id === activeItemId;
            return (
              <NavLink
                key={item.id}
                label={item.label}
                icon={item.icon}
                href={item.href}
                active={active}
                disabled={item.disabled}
                renderLink={renderLink ? (content, state) => renderLink(item, content, state) : undefined}
              />
            );
          })}
        </section>
      ))}
    </nav>
  );
}
