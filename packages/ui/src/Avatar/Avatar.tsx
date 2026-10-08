import type { HTMLAttributes } from "react";
import styles from "./Avatar.module.css";

export type AvatarSize = "xs" | "sm" | "md";

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  src?: string;
  label: string;
  fallback?: string;
  size?: AvatarSize;
}

export function Avatar({ src, label, fallback, size = "md", className, ...props }: AvatarProps) {
  const initials = fallback ?? label.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("");

  return (
    <span
      {...props}
      className={[styles.avatar, className].filter(Boolean).join(" ")}
      data-size={size}
      role={src ? undefined : "img"}
      aria-label={src ? undefined : label}
    >
      {src ? <img src={src} alt={label} /> : <span aria-hidden="true">{initials}</span>}
    </span>
  );
}
