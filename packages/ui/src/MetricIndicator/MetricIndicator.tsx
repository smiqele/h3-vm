import type { CSSProperties, HTMLAttributes } from "react";
import styles from "./MetricIndicator.module.css";

function normalizedLevel(level: number) {
  return Math.min(Math.max(level, 0), 1);
}

export interface MetricIndicatorProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  level: number;
  label?: string;
}

export function ActivityIndicator({
  level,
  label,
  className,
  ...props
}: MetricIndicatorProps) {
  const activeBars = Math.ceil(normalizedLevel(level) * 5);

  return (
    <span
      {...props}
      className={[styles.activity, className].filter(Boolean).join(" ")}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {[0, 1, 2, 3, 4].map((index) => (
        <i data-active={index < activeBars} key={index} />
      ))}
    </span>
  );
}

export interface MeterIndicatorProps extends MetricIndicatorProps {
  appearance?: "bar" | "ring";
}

export function MeterIndicator({
  level,
  label,
  appearance = "bar",
  className,
  ...props
}: MeterIndicatorProps) {
  const percentage = Math.round(normalizedLevel(level) * 100);

  if (appearance === "ring") {
    return (
      <span
        {...props}
        className={[styles.ring, className].filter(Boolean).join(" ")}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        style={{ "--metric-level": String(percentage) + "%" } as CSSProperties}
      />
    );
  }

  return (
    <span
      {...props}
      className={[styles.meter, className].filter(Boolean).join(" ")}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
    >
      <span style={{ transform: "scaleX(" + percentage / 100 + ")" }} />
    </span>
  );
}
