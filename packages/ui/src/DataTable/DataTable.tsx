"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Checkbox } from "../Checkbox/Checkbox";
import { IconButton } from "../IconButton/IconButton";
import { DataTableColumnManager } from "./DataTableColumnManager";
import styles from "./DataTable.module.css";

export interface DataTableColumn<Row> {
  id: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  minWidth?: number;
  /** Shares remaining table width equally with other fill columns, while preserving minWidth. */
  fill?: boolean;
  inset?: "compact" | "default";
  pinned?: "start";
  hideable?: boolean;
  reorderable?: boolean;
  sortValue?: (row: Row) => string | number;
}

type SortState = { columnId: string; direction: "ascending" | "descending" } | null;

export interface DataTableProps<Row> {
  rows: readonly Row[];
  columns: readonly DataTableColumn<Row>[];
  getRowId: (row: Row) => string;
  toolbar?: ReactNode | ((controls: { columnManager?: ReactNode; columnManagerItems?: ReactNode }) => ReactNode);
  rowActions?: (row: Row) => ReactNode;
  selection?: "none" | "multiple";
  selectionColumnId?: string;
  columnManagement?: boolean;
  initialHiddenColumnIds?: readonly string[];
  /** Keeps the toolbar and column header below the application header while the page scrolls. */
  stickyHeader?: boolean;
  emptyState?: ReactNode;
  ariaLabel?: string;
}

export function DataTable<Row>({
  rows,
  columns,
  getRowId,
  toolbar,
  rowActions,
  selection = "none",
  selectionColumnId,
  columnManagement = false,
  initialHiddenColumnIds = [],
  stickyHeader = false,
  emptyState = "Нет данных",
  ariaLabel,
}: DataTableProps<Row>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [columnOrder, setColumnOrder] = useState(() => columns.map((column) => column.id));
  const [hiddenColumnIds, setHiddenColumnIds] = useState<Set<string>>(() => new Set(initialHiddenColumnIds));
  const [sort, setSort] = useState<SortState>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const headerScrollerRef = useRef<HTMLDivElement>(null);
  const rowIds = useMemo(() => rows.map(getRowId), [getRowId, rows]);
  const allSelected = rowIds.length > 0 && rowIds.every((id) => selectedIds.has(id));
  const someSelected = rowIds.some((id) => selectedIds.has(id));
  const resolvedSelectionColumnId = selectionColumnId ?? columns[0]?.id;
  const columnsById = useMemo(() => new Map(columns.map((column) => [column.id, column])), [columns]);
  const orderedColumns = useMemo(() => columnOrder.map((id) => columnsById.get(id)).filter((column): column is DataTableColumn<Row> => Boolean(column)), [columnOrder, columnsById]);
  const visibleColumns = useMemo(() => orderedColumns.filter((column) => !hiddenColumnIds.has(column.id)), [orderedColumns, hiddenColumnIds]);
  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const column = columnsById.get(sort.columnId);
    if (!column?.sortValue) return rows;
    const direction = sort.direction === "ascending" ? 1 : -1;
    return [...rows].sort((left, right) => {
      const leftValue = column.sortValue!(left);
      const rightValue = column.sortValue!(right);
      if (typeof leftValue === "number" && typeof rightValue === "number") return (leftValue - rightValue) * direction;
      return String(leftValue).localeCompare(String(rightValue), "ru", { numeric: true, sensitivity: "base" }) * direction;
    });
  }, [columnsById, rows, sort]);

  useEffect(() => {
    const currentIds = new Set(columns.map((column) => column.id));
    setColumnOrder((current) => [...current.filter((id) => currentIds.has(id)), ...columns.map((column) => column.id).filter((id) => !current.includes(id))]);
    setHiddenColumnIds((current) => new Set([...current].filter((id) => currentIds.has(id))));
  }, [columns]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const table = scroller.querySelector("table");
    const updateOverflow = () => {
      setIsOverflowing(scroller.scrollWidth > scroller.clientWidth);
      setIsAtEnd(scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 1);
      if (headerScrollerRef.current) headerScrollerRef.current.scrollLeft = scroller.scrollLeft;
    };
    updateOverflow();
    scroller.addEventListener("scroll", updateOverflow, { passive: true });
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(scroller);
    if (table) observer.observe(table);
    return () => {
      scroller.removeEventListener("scroll", updateOverflow);
      observer.disconnect();
    };
  }, [visibleColumns]);

  function toggleColumn(columnId: string) {
    const column = columnsById.get(columnId);
    if (!column || column.pinned || column.hideable === false) return;
    setHiddenColumnIds((current) => {
      const next = new Set(current);
      next.has(columnId) ? next.delete(columnId) : next.add(columnId);
      return next;
    });
  }

  function moveColumn(sourceId: string, targetId: string) {
    const source = columnsById.get(sourceId);
    const target = columnsById.get(targetId);
    if (!source || !target || source.pinned || target.pinned || source.reorderable === false || target.reorderable === false) return;
    setColumnOrder((current) => {
      const targetIndex = current.indexOf(targetId);
      const next = current.filter((id) => id !== sourceId);
      next.splice(targetIndex, 0, sourceId);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(rowIds));
  }

  function toggleRow(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSort(columnId: string) {
    setSort((current) => current?.columnId === columnId && current.direction === "ascending"
      ? { columnId, direction: "descending" }
      : { columnId, direction: "ascending" });
  }

  const fillColumnCount = visibleColumns.filter((column) => column.fill).length;
  const columnsMinimumWidth = visibleColumns.reduce((total, column) => total + (column.minWidth ?? 140), 0);
  const actionsMinimumWidth = rowActions || columnManagement ? 52 : 0;
  const contentMinimumWidth = columnsMinimumWidth + actionsMinimumWidth;
  const columnStyle = (column: DataTableColumn<Row>) => ({
    "--data-table-column-min-width": `${column.minWidth ?? 140}px`,
    width: column.fill && fillColumnCount
      ? `calc(${column.minWidth ?? 140}px + (100% - ${contentMinimumWidth}px) / ${fillColumnCount})`
      : undefined,
  }) as CSSProperties;

  const columnManagerProps = {
    items: orderedColumns.map((item) => ({ id: item.id, label: typeof item.header === "string" ? item.header : item.id, visible: !hiddenColumnIds.has(item.id), locked: Boolean(item.pinned || item.hideable === false || item.reorderable === false) })),
    onMove: moveColumn,
    onToggle: toggleColumn,
  };
  const columnManager = columnManagement ? <DataTableColumnManager {...columnManagerProps} /> : undefined;
  const columnManagerItems = columnManagement ? <DataTableColumnManager {...columnManagerProps} inline /> : undefined;
  const overflowControl = isOverflowing ? <IconButton
    icon={isAtEnd ? "chevron-left" : "chevron-right"}
    label={isAtEnd ? "К началу таблицы" : "Показать правые колонки"}
    size="compact"
    onClick={() => scrollerRef.current?.scrollTo({ left: isAtEnd ? 0 : scrollerRef.current.scrollWidth, behavior: "smooth" })}
  /> : undefined;
  const toolbarContent = typeof toolbar === "function" ? toolbar({ columnManager, columnManagerItems }) : toolbar;
  const columnManagerInToolbar = typeof toolbar === "function";
  const showActionsColumn = Boolean(rowActions || overflowControl || (columnManagement && !columnManagerInToolbar));

  const header = (
    <thead>
      <tr>
        {visibleColumns.map((column) => (
          <th
            key={column.id}
            style={columnStyle(column)}
            data-inset={column.inset ?? "default"}
            data-pinned={column.pinned}
            aria-sort={sort?.columnId === column.id ? sort.direction : undefined}
          >
            <div className={styles.headerContent}>
              {column.id === resolvedSelectionColumnId && selection === "multiple" && <Checkbox size="sm" checked={allSelected} indeterminate={someSelected && !allSelected} onChange={toggleAll} aria-label="Выбрать все строки" />}
              {column.sortValue ? (
                <button className={styles.sortButton} type="button" onClick={() => toggleSort(column.id)} aria-label={`Сортировать по колонке ${String(column.header)}`} data-active={sort?.columnId === column.id || undefined}>
                  <span>{column.header}</span>
                  {sort?.columnId !== column.id ? <ArrowUpDown size={12} aria-hidden="true" /> : sort.direction === "ascending" ? <ArrowUp size={12} aria-hidden="true" /> : <ArrowDown size={12} aria-hidden="true" />}
                </button>
              ) : <span>{column.header}</span>}
            </div>
          </th>
        ))}
        {showActionsColumn && (
          <th key="__actions" className={styles.actionsCell} aria-label="Действия">
            <div className={styles.actionsContent}>
              {overflowControl}
              {columnManagement && !columnManagerInToolbar && columnManager}
            </div>
          </th>
        )}
      </tr>
    </thead>
  );

  return (
    <section
      className={styles.root}
      data-sticky-header={stickyHeader || undefined}
      data-overflowing={isOverflowing || undefined}
      aria-label={ariaLabel}
    >
      {toolbarContent && <div className={styles.toolbarSlot}>{toolbarContent}</div>}
      {stickyHeader && (
        <div className={styles.stickyHeaderScroller} data-overflowing={isOverflowing || undefined} ref={headerScrollerRef}>
          <table data-fill={fillColumnCount ? true : undefined} style={{ minWidth: contentMinimumWidth }}>
            {header}
          </table>
        </div>
      )}
      <div className={styles.scroller} data-overflowing={isOverflowing || undefined} ref={scrollerRef}>
        <table data-fill={fillColumnCount ? true : undefined} style={{ minWidth: contentMinimumWidth }}>
          {!stickyHeader && header}
          <tbody>
            {sortedRows.map((row) => {
              const id = getRowId(row);
              return (
                <tr key={id} data-selected={selectedIds.has(id)}>
                  {visibleColumns.map((column) => (
                    <td
                      key={column.id}
                      style={columnStyle(column)}
                      data-inset={column.inset ?? "default"}
                      data-pinned={column.pinned}
                      data-primary={column.id === resolvedSelectionColumnId || undefined}
                    >
                      {column.id !== resolvedSelectionColumnId && <span className={styles.mobileLabel} aria-hidden="true">{column.header}</span>}
                      {column.id === resolvedSelectionColumnId && selection === "multiple" ? (
                        <div className={styles.selectionContent}>
                          <Checkbox
                            size="sm"
                            checked={selectedIds.has(id)}
                            onChange={() => toggleRow(id)}
                            aria-label={`Выбрать строку ${id}`}
                          />
                          <span className={styles.cellContent}>{column.cell(row)}</span>
                        </div>
                      ) : column.cell(row)}
                    </td>
                  ))}
                  {showActionsColumn && (
                    <td key="__actions" className={styles.actionsCell} data-actions>
                      <div className={styles.actionsContent}>{rowActions?.(row)}</div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <div className={styles.empty}>{emptyState}</div>}
      </div>
    </section>
  );
}
