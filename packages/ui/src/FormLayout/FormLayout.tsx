import type { FormHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import styles from "./FormLayout.module.css";

export interface FormLayoutProps extends FormHTMLAttributes<HTMLFormElement> {
  actions?: ReactNode;
  children: ReactNode;
}

export function FormLayout({ actions, children, className, ...props }: FormLayoutProps) {
  return <form {...props} className={[styles.form, className].filter(Boolean).join(" ")}>
    <div className={styles.body}>{children}</div>
    {actions && <div className={styles.actions}>{actions}</div>}
  </form>;
}

export interface FormSectionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}

export function FormSection({ title, description, children, className, ...props }: FormSectionProps) {
  return <section {...props} className={[styles.section, className].filter(Boolean).join(" ")}>
    {(title || description) && <header>{title && <h2>{title}</h2>}{description && <p>{description}</p>}</header>}
    <div className={styles.fields}>{children}</div>
  </section>;
}
