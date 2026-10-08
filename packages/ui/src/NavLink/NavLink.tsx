import type { ReactNode } from "react";
import styles from "./NavLink.module.css";

export interface NavLinkProps {
  label: string;
  icon?: ReactNode;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  renderLink?: (content: ReactNode, state: { active: boolean }) => ReactNode;
}

export function NavLink({ label, icon, href, active = false, disabled = false, renderLink }: NavLinkProps) {
  const content = (
    <>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{label}</span>
    </>
  );

  return (
    <div className={styles.root} data-active={active || undefined} data-disabled={disabled || undefined}>
      {href && !disabled
        ? renderLink?.(content, { active }) ?? <a href={href} aria-current={active ? "page" : undefined}>{content}</a>
        : <span className={styles.unavailable} aria-disabled="true">{content}</span>}
    </div>
  );
}
