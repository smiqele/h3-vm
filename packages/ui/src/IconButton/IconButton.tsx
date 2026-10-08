import type { ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "../Icon/Icon";
import styles from "./IconButton.module.css";

export type IconButtonSize = "default" | "compact" | "micro";

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> {
  /** Icon from the shared Lucide registry. */
  icon: IconName;
  /** Required accessible name for the icon-only action. */
  label: string;
  size?: IconButtonSize;
}

export function IconButton({
  icon,
  label,
  size = "default",
  type = "button",
  className,
  ...buttonProps
}: IconButtonProps) {
  const classNames = [styles.button, className].filter(Boolean).join(" ");

  return (
    <button
      {...buttonProps}
      className={classNames}
      data-size={size}
      type={type}
      aria-label={label}
    >
      <span className={styles.icon} aria-hidden="true">
        <Icon name={icon} size="inherit" />
      </span>
    </button>
  );
}
