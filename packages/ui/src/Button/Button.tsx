import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "solid" | "soft" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
}

export function Button({
  children,
  variant = "soft",
  leadingIcon,
  trailingIcon,
  loading = false,
  disabled = false,
  type = "button",
  className,
  ...buttonProps
}: ButtonProps) {
  const classNames = [styles.button, className].filter(Boolean).join(" ");
  const isDisabled = disabled || loading;
  const label = loading ? "Загрузка…" : children;

  return (
    <button
      {...buttonProps}
      className={classNames}
      data-variant={variant}
      data-icon-leading={Boolean(leadingIcon)}
      data-icon-trailing={Boolean(trailingIcon)}
      disabled={isDisabled}
      type={type}
      aria-busy={loading || undefined}
    >
      <span className={styles.material} aria-hidden="true" />
      <span className={styles.finish} aria-hidden="true" />

      <span className={styles.content}>
        {leadingIcon && (
          <span className={`${styles.icon} ${styles.leadingIcon}`}>
            {leadingIcon}
          </span>
        )}

        <span className={styles.label}>{label}</span>

        {trailingIcon && (
          <span className={`${styles.icon} ${styles.trailingIcon}`}>
            {trailingIcon}
          </span>
        )}
      </span>
    </button>
  );
}
