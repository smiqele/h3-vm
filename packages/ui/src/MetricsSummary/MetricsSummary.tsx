import { type CSSProperties, type ReactNode } from "react";
import type { IconName } from "../Icon/Icon";
import {
  ActivityIndicator as SharedActivityIndicator,
  MeterIndicator,
} from "../MetricIndicator/MetricIndicator";
import styles from "./MetricsSummary.module.css";
import { Status } from "../Status/Status";
import { Tooltip } from "../Tooltip/Tooltip";

export type MetricsSummaryTone = "positive" | "neutral" | "warning" | "danger";

interface MetricsSummaryItemBase {
  id: string;
  label: ReactNode;
  asideTone?: MetricsSummaryTone;
  asideIcon?: IconName;
}

export interface ValueMetricItem extends MetricsSummaryItemBase {
  type: "value";
  value: ReactNode;
  aside?: ReactNode;
}

export interface BreakdownMetricItem extends MetricsSummaryItemBase {
  type: "breakdown";
  value: ReactNode;
  segments: readonly {
    tone: MetricsSummaryTone;
    value: ReactNode;
    label?: string;
  }[];
}

export interface MeterMetricItem extends MetricsSummaryItemBase {
  type: "meter";
  value: ReactNode;
  level: number;
  aside?: ReactNode;
  appearance?: "bar" | "ring" | "text";
}

export interface MetricGroupItem extends MetricsSummaryItemBase {
  type: "group";
  aside?: ReactNode;
  items: readonly {
    id: string;
    label: ReactNode;
    value: ReactNode;
    level?: number;
    indicator?: "activity";
  }[];
}

export type MetricsSummaryItem =
  | ValueMetricItem
  | BreakdownMetricItem
  | MeterMetricItem
  | MetricGroupItem;

export interface MetricsSummaryProps {
  ariaLabel: string;
  items: readonly MetricsSummaryItem[];
  variant?: "default" | "borderless";
}

function Meter({ level, label, appearance = "bar" }: {
  level: number;
  label: string;
  appearance?: "bar" | "ring";
}) {
  return (
    <MeterIndicator
      appearance={appearance}
      className={appearance === "ring" ? styles.ringMeter : styles.meter}
      label={label}
      level={level}
    />
  );
}

function ActivityIndicator({ level = 0.6 }: { level?: number }) {
  return <SharedActivityIndicator level={level} />;
}

function ValueMetric({ item }: { item: ValueMetricItem }) {
  return (
    <>
      <dd className="typography-body-lg">{item.value}</dd>
      {item.aside && (
        item.asideTone || item.asideIcon
          ? <Status tone={item.asideTone} icon={item.asideIcon}>{item.aside}</Status>
          : <span className={styles.metricAside}>{item.aside}</span>
      )}
    </>
  );
}

function BreakdownMetric({ item }: { item: BreakdownMetricItem }) {
  const description = item.segments
    .filter(segment => segment.label)
    .map(segment => `${segment.label}: ${String(segment.value)}`)
    .join(", ");

  return (
    <>
      <dd className="typography-body-lg">{item.value}</dd>
      <Tooltip
        content={<span className={styles.breakdownTooltip}>{item.segments.map((segment, index) => <span key={index}><span>{segment.label}</span><strong>{segment.value}</strong></span>)}</span>}
        className={styles.breakdownTrigger}
        aria-label={description}
      >
        <span className={styles.breakdown}>
          {item.segments.map((segment, index) => (
            <Status tone={segment.tone} key={index}>{segment.value}</Status>
          ))}
        </span>
      </Tooltip>
    </>
  );
}

function MeterMetric({ item }: { item: MeterMetricItem }) {
  if (item.appearance === "text") {
    return (
      <>
        <dd className="typography-body-lg">{item.value}</dd>
        <Status tone={item.asideTone} icon={item.asideIcon}>
          {item.aside ?? "Занято"} {Math.round(item.level * 100)}%
        </Status>
      </>
    );
  }

  const valueStyle = item.appearance === "ring"
    ? "typography-body-lg"
    : "typography-caption-md";

  return (
    <div className={styles.meterValue} data-appearance={item.appearance ?? "bar"}>
      <dd className={valueStyle}>{item.value}</dd>
      <Meter level={item.level} label={String(item.label)} appearance={item.appearance} />
    </div>
  );
}

function GroupMetric({ item }: { item: MetricGroupItem }) {
  return (
    <>
      <dd className={styles.group}>
        {item.items.map((groupItem, index) => (
          <span className={styles.groupEntry} key={groupItem.id}>
            {index > 0 && <i className={styles.groupSeparator} aria-hidden="true" />}
            <span className={styles.groupItem}>
              {groupItem.indicator === "activity" && <ActivityIndicator level={groupItem.level} />}
              {!groupItem.indicator && groupItem.level !== undefined && (
                <Meter level={groupItem.level} label={String(groupItem.label)} />
              )}
              <span className="typography-body-lg">{groupItem.label}</span>
              <span className="typography-body-lg">{groupItem.value}</span>
            </span>
          </span>
        ))}
      </dd>
      {item.aside && <Status tone={item.asideTone} icon={item.asideIcon}>{item.aside}</Status>}
    </>
  );
}

function MetricContent({ item }: { item: MetricsSummaryItem }) {
  switch (item.type) {
    case "value":
      return <ValueMetric item={item} />;
    case "breakdown":
      return <BreakdownMetric item={item} />;
    case "meter":
      return <MeterMetric item={item} />;
    case "group":
      return <GroupMetric item={item} />;
  }
}

export function MetricsSummary({ ariaLabel, items, variant = "default" }: MetricsSummaryProps) {
  return (
    <section className={styles.summary} aria-label={ariaLabel} data-variant={variant}>
      <dl
        className={styles.metrics}
        style={{ "--metrics-summary-columns": items.length } as CSSProperties}
      >
        {items.map((item) => (
          <div
            className={styles.metric}
            key={item.id}
            data-type={item.type}
            data-appearance={item.type === "meter" ? item.appearance ?? "bar" : undefined}
          >
            <dt>{item.label}</dt>
            <MetricContent item={item} />
          </div>
        ))}
      </dl>
    </section>
  );
}
