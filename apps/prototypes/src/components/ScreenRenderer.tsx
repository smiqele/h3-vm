"use client";

import {
  Badge,
  Button,
  DataActivityCell,
  DataMeterCell,
  DataTable,
  type DataTableColumn,
  DataTableToolbar,
  DataTextCell,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  Icon,
  IconButton,
  MetricsSummary,
  type MetricsSummaryProps,
  PageHeader,
  Status,
  Stack,
  Tooltip,
} from "@cloud/ui";
import { getResourceStatusPresentation, type StatusResource } from "@cloud/console-runtime";
import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import styles from "./ScreenRenderer.module.css";

export interface Block {
  id: string;
  component: string;
  props?: Record<string, unknown>;
}

export interface Screen {
  id: string;
  title: string;
  resource: string;
  pattern: string;
  blocks: Block[];
  states?: Record<string, string>;
}

type ResourceRow = Record<string, unknown> & { id: string };
type TableView = "columns" | "grouped";

export interface ScreenFixture {
  data: ResourceRow[];
  metricsSummaries?: Record<string, MetricsSummaryProps>;
}

interface ScreenRendererProps {
  screen: Screen;
  fixture: ScreenFixture;
  metricsVariant?: MetricsSummaryProps["variant"];
  headerActions?: ReactNode;
  presentation?: "default" | "virtual-machines";
}

type CellKind = "text" | "link" | "status" | "activity" | "meter";

interface ColumnSpec {
  field: string;
  label?: string;
  kind?: CellKind;
  width?: number;
  inset?: "compact" | "default";
  pinned?: "start";
  copyable?: boolean;
  href?: string;
  statusResource?: StatusResource;
  levelField?: string;
  limitField?: string;
  unit?: string;
  metricLabel?: string;
  sortable?: boolean;
}

interface TableSpec {
  columns: ColumnSpec[];
  selection?: "none" | "multiple";
  selectionColumnId?: string;
  searchFields?: string[];
  statusField?: string;
  statusOptions?: string[];
}

const stringValue = (row: ResourceRow, field: string) => {
  const value = row[field];
  return value === null || value === undefined || value === "" ? "" : String(value);
};

const numberValue = (row: ResourceRow, field?: string) => {
  if (!field) return 0;
  const value = Number(row[field]);
  return Number.isFinite(value) ? value : 0;
};

function interpolateHref(template: string, row: ResourceRow) {
  return template.replace(/\{([^}]+)\}/g, (_, field: string) => encodeURIComponent(stringValue(row, field)));
}

function operatingSystemAsset(image: string) {
  const normalized = image.toLowerCase();
  if (normalized.includes("ubuntu")) return "/assets/os/ubuntu.svg";
  if (normalized.includes("debian")) return "/assets/os/debian.svg";
  if (normalized.includes("rocky")) return "/assets/os/rocky-linux.svg";
  if (normalized.includes("alma")) return "/assets/os/almalinux.svg";
  return "/assets/os/rocky-linux.svg";
}

function formatStatusAge(value: string) {
  const elapsedMinutes = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
  if (elapsedMinutes < 60) return `${elapsedMinutes} мин.`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} ч.`;
  return `${Math.floor(elapsedHours / 24)} дн.`;
}

function formatStatusChangedAt(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function renderCell(row: ResourceRow, column: ColumnSpec) {
  const value = stringValue(row, column.field);
  const displayValue = value || "—";

  switch (column.kind ?? "text") {
    case "link":
      return <DataTextCell text={displayValue} href={column.href ? interpolateHref(column.href, row) : undefined} copyable={column.copyable && Boolean(value)} />;
    case "status": {
      const presentation = getResourceStatusPresentation(column.statusResource ?? "virtual-machine", value);
      return <Status tone={presentation.tone} animated={presentation.animated}>{presentation.label}</Status>;
    }
    case "activity": {
      const level = numberValue(row, column.levelField);
      const suffix = column.unit ? ` ${column.unit}` : "";
      return <DataActivityCell level={level} label={`${column.metricLabel ?? column.label ?? column.field} ${Math.round(level * 100)}%`}>{displayValue}{suffix}</DataActivityCell>;
    }
    case "meter": {
      const current = numberValue(row, column.field);
      const limit = numberValue(row, column.limitField);
      const unit = column.unit ?? "";
      if (!limit) return `${displayValue}${unit ? ` ${unit}` : ""}`;
      return <DataMeterCell value={current} limit={limit} unit={unit} label={column.metricLabel ?? column.label ?? column.field} />;
    }
    default: {
      const suffix = column.unit && value ? ` ${column.unit}` : "";
      const formattedValue = column.field === "consumptionRub" && value
        ? new Intl.NumberFormat("ru-RU").format(numberValue(row, column.field))
        : displayValue;
      return <DataTextCell text={`${formattedValue}${suffix}`} copyable={column.copyable && Boolean(value)} />;
    }
  }
}

function columnsFrom(spec: TableSpec, presentation: "default" | "virtual-machines" = "default"): DataTableColumn<ResourceRow>[] {
  const virtualMachinesWidths: Record<string, number> = { name: 160, status: 130, publicIp: 120, cpu: 95, ramGb: 95, diskGb: 145, consumptionRub: 130 };
  return spec.columns.map(column => ({
    id: column.field,
    header: column.label ?? column.field,
    minWidth: presentation === "virtual-machines" ? virtualMachinesWidths[column.field] ?? column.width ?? 140 : column.width ?? 140,
    inset: column.inset ?? "default",
    pinned: column.pinned,
    cell: row => presentation === "virtual-machines" && column.field === "diskGb"
      ? <span className={styles.diskValue}><strong>{numberValue(row, "diskGb")} ГБ</strong> / {numberValue(row, "diskLimitGb")} ГБ</span>
      : renderCell(row, column),
    sortValue: column.sortable ? row => typeof row[column.field] === "number" ? Number(row[column.field]) : stringValue(row, column.field) : undefined,
  }));
}

type GroupedLine = { content: ReactNode; tone?: "secondary" | "positive" | "warning" };

type HealthSignal = {
  text: string;
  tone: "neutral" | "positive" | "warning" | "danger";
  icon: "check" | "triangle-alert" | "trending-up" | "network" | "archive";
};

function healthSignals(row: ResourceRow, fallback: readonly HealthSignal[]) {
  const signals = row.healthSignals;
  if (!Array.isArray(signals)) return fallback;
  return signals.filter((signal): signal is HealthSignal => {
    if (!signal || typeof signal !== "object") return false;
    const candidate = signal as Partial<HealthSignal>;
    return typeof candidate.text === "string"
      && ["neutral", "positive", "warning", "danger"].includes(candidate.tone ?? "")
      && ["check", "triangle-alert", "trending-up", "network", "archive"].includes(candidate.icon ?? "");
  }).slice(0, 2);
}

function GroupedCell({ lines, glow }: {
  lines: readonly GroupedLine[];
  glow?: "warning" | "danger" | "accent";
}) {
  return <div
    className={`${styles.groupedCell}${glow === "warning" ? ` ${styles.rowWarning}` : glow === "danger" ? ` ${styles.rowDanger}` : glow === "accent" ? ` ${styles.rowStable}` : ""}`}
  >
    {lines.map((line, index) => <div className={styles.groupedLine} data-tone={line.tone} key={index}>{line.content}</div>)}
  </div>;
}

function ResourceLine({ icon, children }: { icon: "cpu" | "memory" | "hard-drive" | "layers"; children: ReactNode }) {
  return <span className={styles.resourceLine}><span className={styles.resourceIcon}><Icon className={styles.resourceGlyph} name={icon} size="sm" /></span><span>{children}</span></span>;
}

function TruncatedText({ text }: { text: string }) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [truncated, setTruncated] = useState(false);

  useLayoutEffect(() => {
    const element = textRef.current;
    if (!element) return;
    const update = () => setTruncated(element.scrollWidth > element.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text]);

  const value = <span className={styles.toneText} ref={textRef}>{text}</span>;
  return truncated ? <Tooltip className={styles.toneTextTrigger} content={text}>{value}</Tooltip> : value;
}

function groupedColumnsFrom(spec: TableSpec, presentation: "default" | "virtual-machines" = "default"): DataTableColumn<ResourceRow>[] {
  const byField = new Map(spec.columns.map(column => [column.field, column]));
  const column = (field: string) => byField.get(field);
  const isVirtualMachines = presentation === "virtual-machines";

  const columns: DataTableColumn<ResourceRow>[] = [
    {
      id: "identity",
      header: "Инстанс",
      minWidth: isVirtualMachines ? 190 : 228,
      fill: !isVirtualMachines,
      inset: "compact",
      pinned: "start",
      cell: (row) => {
        const nameColumn = column("name");
        return <GroupedCell lines={[
          { content: <DataTextCell size="compact" text={stringValue(row, "name") || "—"} href={nameColumn?.href ? interpolateHref(nameColumn.href, row) : undefined} copyable={Boolean(stringValue(row, "name"))} /> },
          { content: <DataTextCell size="compact" text={stringValue(row, "id")} copyable /> },
          ...(column("image") ? [{ content: <span className={styles.imageLabel}><img className={styles.osImage} src={operatingSystemAsset(stringValue(row, "image"))} alt="" /><span>{stringValue(row, "image") || "—"}</span></span>, tone: "secondary" as const }] : []),
        ]} />;
      },
      sortValue: (row) => stringValue(row, "name"),
    },
    {
      id: "network-group",
      header: column("network") || column("subnetIp") ? "Сеть" : "Публичный IP",
      minWidth: isVirtualMachines ? 140 : 208,
      fill: !isVirtualMachines,
      cell: (row) => {
        const publicIp = stringValue(row, "publicIp");
        return <GroupedCell lines={[
          ...(column("network") ? [{ content: <DataTextCell size="compact" text={stringValue(row, "network") || "—"} copyable={Boolean(stringValue(row, "network"))} /> }] : []),
          ...(column("subnetIp") ? [{ content: <DataTextCell size="compact" text={stringValue(row, "subnetIp") || "—"} copyable={Boolean(stringValue(row, "subnetIp"))} /> }] : []),
          { content: <DataTextCell size="compact" text={publicIp || (isVirtualMachines ? "Нет IP" : "Нет публичного IP")} copyable={Boolean(publicIp)} />, tone: publicIp ? undefined : "secondary" },
        ]} />;
      },
    },
    {
      id: "resources",
      header: "Ресурсы",
      minWidth: 152,
      fill: true,
      cell: (row) => <GroupedCell lines={[
        { content: <ResourceLine icon="cpu">{stringValue(row, "cpu") || "—"} vCPU</ResourceLine> },
        { content: <ResourceLine icon="memory">{stringValue(row, "ramGb") || "—"} ГБ RAM</ResourceLine> },
        ...(column("vgpu") ? [{ content: <ResourceLine icon="layers">vGPU {stringValue(row, "vgpu") || "—"}</ResourceLine> }] : []),
        { content: <ResourceLine icon="hard-drive">{column("diskGb") ? renderCell(row, column("diskGb")!) : "—"}</ResourceLine> },
      ]} />,
      sortValue: (row) => numberValue(row, "cpu"),
    },
    {
      id: "performance",
      header: "Производительность",
      minWidth: 170,
      fill: false,
      cell: (row) => <GroupedCell lines={[
        { content: `${stringValue(row, "cpu") || "—"} vCPU` },
        { content: `${stringValue(row, "ramGb") || "—"} ГБ RAM` },
        { content: `vGPU ${stringValue(row, "vgpu") || "—"}` },
      ]} />,
      sortValue: (row) => numberValue(row, "cpu"),
    },
    {
      id: "storage",
      header: "Диски",
      minWidth: 140,
      fill: false,
      cell: (row) => <div className={styles.storageCell}>
        <span className={styles.diskValue}><strong>{numberValue(row, "diskGb")} ГБ</strong> / {numberValue(row, "diskLimitGb")} ГБ</span>
      </div>,
      sortValue: (row) => numberValue(row, "diskGb"),
    },
    {
      id: "consumption",
      header: "Потребление",
      minWidth: 110,
      fill: false,
      cell: (row) => <strong>{new Intl.NumberFormat("ru-RU").format(numberValue(row, "consumptionRub"))} ₽</strong>,
      sortValue: (row) => numberValue(row, "consumptionRub"),
    },
    {
      id: "resource-state",
      header: "Состояние",
      minWidth: isVirtualMachines ? 170 : 252,
      fill: !isVirtualMachines,
      cell: (row) => {
        const statusColumn = column("status");
        const status = getResourceStatusPresentation(statusColumn?.statusResource ?? "virtual-machine", stringValue(row, "status"));
        const diskColumn = column("diskGb");
        const used = numberValue(row, "diskGb");
        const limit = numberValue(row, diskColumn?.limitField ?? "diskLimitGb");
        const diskLevel = limit ? used / limit : 0;
        const utilization = Math.max(numberValue(row, "cpuUtilization"), numberValue(row, "ramUtilization"));
        const lacksCapacity = utilization >= 0.8;
        const diskIsFilling = diskLevel >= 0.9;
        const resourceStatus = stringValue(row, "status");
        const statusChangedAt = stringValue(row, "statusChangedAt");
        const isStopped = resourceStatus === "stopped";
        const isRunningStable = resourceStatus === "running" && !lacksCapacity && !diskIsFilling;
        const signals = isStopped ? [] : healthSignals(row, [
          { text: lacksCapacity ? "Не хватает мощности" : "Мощности достаточно", tone: lacksCapacity ? "warning" : "neutral", icon: lacksCapacity ? "triangle-alert" : "check" },
          { text: diskIsFilling ? "Диск почти заполнен" : "Места достаточно", tone: diskIsFilling ? "warning" : "neutral", icon: diskIsFilling ? "triangle-alert" : "check" },
        ]);
        const signalGlow = signals.some(signal => signal.tone === "danger")
          ? "danger"
          : signals.some(signal => signal.tone === "warning") ? "warning" : undefined;
        const backupSignal = healthSignals(row, []).find(signal => signal.icon === "archive");
        const backupLabel = backupSignal?.text
          .replace("Резервная копия актуальна", "Копия актуальна")
          .replace("Копия создана ", "Копия ")
          .replace("Ошибка резервного копирования", "Ошибка бэкапа") ?? "Нет данных о бэкапах";
        return <GroupedCell glow={isVirtualMachines ? undefined : resourceStatus === "error" ? "danger" : signalGlow ?? (isRunningStable ? "accent" : undefined)} lines={[
          { content: statusChangedAt ? <Tooltip className={styles.statusTimeTooltip} content={`В этом состоянии с ${formatStatusChangedAt(statusChangedAt)}`}><Status tone={status.tone} animated={status.animated}>{status.label}<span className={styles.statusAge}>· {formatStatusAge(statusChangedAt)}</span></Status></Tooltip> : <Status tone={status.tone} animated={status.animated}>{status.label}</Status> },
          ...(isVirtualMachines
            ? [{ content: <Tooltip content={backupSignal?.text ?? backupLabel}><span className={styles.backupLine}>{backupLabel}</span></Tooltip>, tone: "secondary" as const }]
            : signals.map(signal => ({ content: <Status className={styles.diagnosticStatus} emphasis="secondary" icon={signal.icon} tone={signal.tone}><TruncatedText text={signal.text} /></Status> }))),
        ]} />;
      },
      sortValue: (row) => getResourceStatusPresentation(
        column("status")?.statusResource ?? "virtual-machine",
        stringValue(row, "status"),
      ).label,
    },
  ];

  const order = isVirtualMachines
    ? ["identity", "resource-state", "performance", "storage", "network-group", "consumption"]
    : ["identity", "resource-state", "resources", "network-group"];
  return order.map(id => columns.find(column => column.id === id)!);
}

function ScreenPageHeader({ title, beforeActions }: { title: string; beforeActions?: ReactNode }) {
  return <PageHeader title={title} actions={<>{beforeActions}<Button variant="solid">Создать</Button></>} />;
}

interface TableToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  statuses: readonly string[];
  onStatusToggle: (value: string) => void;
  warningsOnly: boolean;
  onWarningsToggle: () => void;
  onFiltersClear: () => void;
  statusOptions: string[];
  statusResource: StatusResource;
  view: TableView;
  onViewChange: (view: TableView) => void;
  actions?: ReactNode;
  columnManagerItems?: ReactNode;
  presentation?: "default" | "virtual-machines";
}

function filterCountLabel(count: number) {
  const remainder100 = count % 100;
  const remainder10 = count % 10;
  if (remainder100 >= 11 && remainder100 <= 14) return `${count} фильтров`;
  if (remainder10 === 1) return `${count} фильтр`;
  if (remainder10 >= 2 && remainder10 <= 4) return `${count} фильтра`;
  return `${count} фильтров`;
}

function TableToolbar({ query, onQueryChange, statuses, onStatusToggle, warningsOnly, onWarningsToggle, onFiltersClear, statusOptions, statusResource, view, onViewChange, actions, columnManagerItems, presentation = "default" }: TableToolbarProps) {
  const filterCount = statuses.length + (warningsOnly ? 1 : 0);
  const selectedLabel = warningsOnly && statuses.length === 0
    ? "С предупреждениями"
    : statuses.length === 1 && !warningsOnly
    ? getResourceStatusPresentation(statusResource, statuses[0]).label
    : filterCount > 0 ? filterCountLabel(filterCount) : null;

  const selectedFilter = selectedLabel && <Badge
        role="button"
        tabIndex={0}
        aria-label={`Сбросить фильтр: ${selectedLabel}`}
        onClick={onFiltersClear}
        onKeyDown={event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onFiltersClear();
          }
        }}
        trailingIcon={<Icon name="x" size="inherit" />}
      >{selectedLabel}</Badge>;
  const filterMenu = <DropdownMenu
        width={184}
        ariaLabel="Фильтр по статусу"
        trigger={<Button variant="ghost" leadingIcon={<Icon name="filter" size="inherit" />}>Фильтр</Button>}
      >
        <DropdownMenuItem
          selected={warningsOnly}
          closeOnSelect={false}
          leading={<Icon name="triangle-alert" size="sm" />}
          trailing={warningsOnly ? <Icon name="check" size="sm" /> : undefined}
          onClick={onWarningsToggle}
        >С предупреждениями</DropdownMenuItem>
        {statusOptions.map(option => {
          const selected = statuses.includes(option);
          const label = getResourceStatusPresentation(statusResource, option).label;
          return <DropdownMenuItem
            selected={selected}
            closeOnSelect={false}
            trailing={selected ? <Icon name="check" size="sm" /> : undefined}
            key={option}
            onClick={() => onStatusToggle(option)}
          >{label}</DropdownMenuItem>;
        })}
      </DropdownMenu>;
  const viewMenu = <DropdownMenu
        width={presentation === "virtual-machines" ? 260 : 200}
        ariaLabel="Вид таблицы"
        trigger={<Button variant="ghost" leadingIcon={<Icon name="layers" size="inherit" />}>Вид</Button>}
      >
        {presentation === "virtual-machines" && <DropdownMenuLabel>Представление</DropdownMenuLabel>}
        <DropdownMenuItem selected={view === "columns"} trailing={view === "columns" ? <Icon name="check" size="sm" /> : undefined} onClick={() => onViewChange("columns")}>По колонкам</DropdownMenuItem>
        <DropdownMenuItem selected={view === "grouped"} trailing={view === "grouped" ? <Icon name="check" size="sm" /> : undefined} onClick={() => onViewChange("grouped")}>Сгруппированный</DropdownMenuItem>
        {presentation === "virtual-machines" && columnManagerItems && <><DropdownMenuSeparator /><DropdownMenuLabel>Колонки</DropdownMenuLabel>{columnManagerItems}</>}
      </DropdownMenu>;

  if (presentation === "virtual-machines") return <div className={styles.serviceToolbar}>
    <div className={styles.serviceToolbarStart}>
      <label className={styles.serviceSearch}>
        <Icon name="search" size="sm" />
        <input type="search" aria-label="Поиск по таблице" placeholder="Поиск по имени, ID или IP…" value={query} onChange={event => onQueryChange(event.target.value)} />
        {query && <button type="button" aria-label="Сбросить поиск" onClick={() => onQueryChange("")}><Icon name="x" size="sm" /></button>}
      </label>
      {filterMenu}
      {selectedFilter}
    </div>
    <div className={styles.serviceToolbarEnd}>{viewMenu}</div>
  </div>;

  return <DataTableToolbar
    searchValue={query}
    onSearchChange={onQueryChange}
    searchPlaceholder="Поиск по имени, ID или IP…"
    filter={<>{selectedFilter}{filterMenu}</>}
    actions={<>
      {viewMenu}
      {actions}
    </>}
  />;
}

function tableSpecFrom(block: Block): TableSpec {
  const props = block.props ?? {};
  return {
    columns: Array.isArray(props.columns) ? props.columns as ColumnSpec[] : [],
    selection: props.selection === "multiple" ? "multiple" : "none",
    selectionColumnId: typeof props.selectionColumnId === "string" ? props.selectionColumnId : undefined,
    searchFields: Array.isArray(props.searchFields) ? props.searchFields as string[] : [],
    statusField: typeof props.statusField === "string" ? props.statusField : undefined,
    statusOptions: Array.isArray(props.statusOptions) ? props.statusOptions as string[] : [],
  };
}

export function ScreenRenderer({ screen, fixture, metricsVariant, headerActions, presentation = "default" }: ScreenRendererProps) {
  const [query, setQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [warningsOnly, setWarningsOnly] = useState(false);
  const [tableView, setTableView] = useState<TableView>("grouped");
  const tableBlock = screen.blocks.find(block => block.component === "component.data-table");
  const tableSpec = useMemo(() => tableBlock ? tableSpecFrom(tableBlock) : undefined, [tableBlock]);
  const statusColumn = tableSpec?.columns.find(column => column.field === tableSpec.statusField || column.kind === "status");
  const tableColumns = useMemo(() => tableSpec ? columnsFrom(tableSpec, presentation) : [], [tableSpec, presentation]);
  const groupedTableColumns = useMemo(() => tableSpec ? groupedColumnsFrom(tableSpec, presentation) : [], [tableSpec, presentation]);
  const searchableFields = useMemo(() => {
    if (!tableSpec) return [];
    return [...new Set([...(tableSpec.searchFields ?? []), ...tableSpec.columns.map(column => column.field)])];
  }, [tableSpec]);

  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ru-RU");
    return fixture.data.filter(row => {
      const statusValue = statusColumn ? stringValue(row, statusColumn.field) : "";
      const statusLabel = statusColumn && statusValue
        ? getResourceStatusPresentation(statusColumn.statusResource ?? "virtual-machine", statusValue).label
        : "";
      const signals = healthSignals(row, []);
      const matchesQuery = !normalizedQuery
        || searchableFields.some(field => stringValue(row, field).toLocaleLowerCase("ru-RU").includes(normalizedQuery))
        || statusLabel.toLocaleLowerCase("ru-RU").includes(normalizedQuery)
        || signals.some(signal => signal.text.toLocaleLowerCase("ru-RU").includes(normalizedQuery));
      const matchesStatus = statusFilters.length === 0 || !tableSpec?.statusField || statusFilters.includes(stringValue(row, tableSpec.statusField));
      const diskLimit = numberValue(row, "diskLimitGb");
      const hasWarning = Math.max(numberValue(row, "cpuUtilization"), numberValue(row, "ramUtilization")) >= 0.8
        || (diskLimit > 0 && numberValue(row, "diskGb") / diskLimit >= 0.9)
        || signals.some(signal => signal.tone === "warning" || signal.tone === "danger");
      return matchesQuery && matchesStatus && (!warningsOnly || hasWarning);
    });
  }, [fixture.data, query, searchableFields, statusColumn, statusFilters, tableSpec?.statusField, warningsOnly]);

  function toggleStatusFilter(status: string) {
    setStatusFilters(current => current.includes(status)
      ? current.filter(item => item !== status)
      : [...current, status]);
  }

  const headerBlocks = screen.blocks.filter(block => block.component === "component.page-header");
  const summaryBlocks = screen.blocks.filter(block => block.component === "component.metrics-summary");
  const contentBlocks = screen.blocks.filter(block => block.component !== "component.page-header" && block.component !== "component.metrics-summary");
  const summariesAreBorderless = summaryBlocks.every(block =>
    (metricsVariant ?? fixture.metricsSummaries?.[String(block.props?.dataKey ?? "")]?.variant) === "borderless"
  );

  function renderBlock(block: Block) {
    if (block.component === "component.page-header") return <ScreenPageHeader key={block.id} title={screen.title} beforeActions={headerActions} />;
    if (block.component === "component.metrics-summary") {
      const dataKey = String(block.props?.dataKey ?? "");
      const summary = fixture.metricsSummaries?.[dataKey];
      return summary ? <MetricsSummary key={block.id} {...summary} variant={metricsVariant ?? summary.variant} /> : <div key={block.id}>Нет данных для сводки: {dataKey}</div>;
    }
    if (block.component === "component.data-table") {
      const spec = tableSpecFrom(block);
      return <DataTable
        key={`${block.id}-${tableView}`}
        rows={visibleRows}
        columns={tableView === "grouped" ? groupedTableColumns : tableColumns}
        getRowId={row => row.id}
        toolbar={({ columnManager, columnManagerItems }) => <TableToolbar query={query} onQueryChange={setQuery} statuses={statusFilters} onStatusToggle={toggleStatusFilter} warningsOnly={warningsOnly} onWarningsToggle={() => setWarningsOnly(current => !current)} onFiltersClear={() => { setStatusFilters([]); setWarningsOnly(false); }} statusOptions={spec.statusOptions ?? []} statusResource={statusColumn?.statusResource ?? "virtual-machine"} view={tableView} onViewChange={setTableView} actions={columnManager} columnManagerItems={columnManagerItems} presentation={presentation} />}
        selection={spec.selection}
        selectionColumnId={tableView === "grouped" ? "identity" : spec.selectionColumnId}
        columnManagement
        initialHiddenColumnIds={presentation === "virtual-machines" && tableView === "columns" ? ["id", "vgpu"] : undefined}
        stickyHeader={tableView === "grouped"}
        ariaLabel={screen.title}
        rowActions={() => <IconButton icon="ellipsis" label="Действия со строкой" size="compact" />}
      />;
    }
    return <div key={block.id}>Неизвестный компонент: {block.component}</div>;
  }

  return <Stack gap={12}>
    {headerBlocks.map(renderBlock)}
    <Stack gap={24}>
      {summaryBlocks.length > 0 && <Stack className={summariesAreBorderless ? undefined : styles.insetGroup} gap={12}>{summaryBlocks.map(renderBlock)}</Stack>}
      {contentBlocks.map(renderBlock)}
    </Stack>
  </Stack>;
}
