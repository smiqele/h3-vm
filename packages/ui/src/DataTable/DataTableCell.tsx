"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconButton } from "../IconButton/IconButton";
import { ActivityIndicator } from "../MetricIndicator/MetricIndicator";
import styles from "./DataTableCell.module.css";

export interface DataTextCellProps {
  text: string;
  href?: string;
  copyable?: boolean;
  size?: "default" | "compact";
}

export function DataTextCell({
  text,
  href,
  copyable = false,
  size = "default",
}: DataTextCellProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }

    setCopied(true);

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 1500);
  }

  return (
    <span className={styles.textCell} data-copyable={copyable || undefined} data-size={size}>
      <span className={styles.valueGroup}>
        {href ? <a href={href}>{text}</a> : <span>{text}</span>}
        {copyable && (
          <span className={styles.copyAction}>
            <IconButton
              icon="copy"
              label={copied ? "Скопировано" : "Копировать"}
              size="micro"
              onClick={copyText}
            />
          </span>
        )}
      </span>
    </span>
  );
}

export interface DataActivityCellProps {
  children: ReactNode;
  level: number;
  label: string;
}

export function DataActivityCell({
  children,
  level,
  label,
}: DataActivityCellProps) {
  return (
    <span className={styles.activityCell}>
      <ActivityIndicator level={level} label={label} />
      <span>{children}</span>
    </span>
  );
}

export interface DataMeterCellProps {
  value: number;
  limit: number;
  unit: string;
  label: string;
}

export function DataMeterCell({
  value,
  limit,
  unit,
  label,
}: DataMeterCellProps) {
  return (
    <span className={styles.meterCell} aria-label={`${label}: ${value} ${unit} из ${limit} ${unit}`}>
      <span>{value} {unit} из {limit} {unit}</span>
    </span>
  );
}
