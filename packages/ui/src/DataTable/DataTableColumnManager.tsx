"use client";

import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { Button } from "../Button/Button";
import { DropdownMenu, DropdownMenuItem } from "../DropdownMenu/DropdownMenu";
import { Icon } from "../Icon/Icon";
import styles from "./DataTableColumnManager.module.css";

export interface DataTableColumnManagerItem {
  id: string;
  label: string;
  visible: boolean;
  locked: boolean;
}

export interface DataTableColumnManagerProps {
  items: readonly DataTableColumnManagerItem[];
  onMove: (sourceId: string, targetId: string) => void;
  onToggle: (id: string) => void;
  inline?: boolean;
}

export function DataTableColumnManager({ items, onMove, onToggle, inline = false }: DataTableColumnManagerProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragTargetId, setDragTargetId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  function startPointerDrag(event: ReactPointerEvent<HTMLSpanElement>, sourceId: string) {
    event.preventDefault();
    event.stopPropagation();
    let targetId = sourceId;
    setDraggedId(sourceId);
    setDragTargetId(sourceId);
    setDragPosition({ x: event.clientX, y: event.clientY });

    function move(pointerEvent: PointerEvent) {
      setDragPosition({ x: pointerEvent.clientX, y: pointerEvent.clientY });
      const target = document.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY)?.closest<HTMLElement>("[data-column-id]");
      const nextId = target?.dataset.columnId;
      if (nextId && items.some(item => item.id === nextId && !item.locked)) {
        targetId = nextId;
        setDragTargetId(nextId);
      }
    }

    function finish() {
      if (targetId !== sourceId) onMove(sourceId, targetId);
      setDraggedId(null);
      setDragTargetId(null);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
  }

  function moveWithKeyboard(sourceId: string, direction: -1 | 1) {
    const movableItems = items.filter(item => !item.locked);
    const sourceIndex = movableItems.findIndex(item => item.id === sourceId);
    const target = movableItems[sourceIndex + direction];
    if (target) onMove(sourceId, target.id);
  }

  const draggedItem = items.find(item => item.id === draggedId);
  const draggedIndex = draggedId ? items.findIndex(item => item.id === draggedId) : -1;
  const targetIndex = dragTargetId ? items.findIndex(item => item.id === dragTargetId) : -1;
  const dropEdge = draggedIndex < targetIndex ? "after" : "before";

  const content = <>
    {items.map(item => <DropdownMenuItem
      className={styles.item}
      data-column-id={item.id}
      data-dragging={draggedId === item.id || undefined}
      data-drop-target={draggedId && dragTargetId === item.id && draggedId !== item.id || undefined}
      data-drop-edge={draggedId && dragTargetId === item.id && draggedId !== item.id ? dropEdge : undefined}
      key={item.id}
      selected={item.visible}
      closeOnSelect={false}
      onClick={() => { if (!item.locked) onToggle(item.id); }}
      onKeyDown={event => {
        if (!item.locked && event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
          event.preventDefault();
          moveWithKeyboard(item.id, event.key === "ArrowUp" ? -1 : 1);
        }
      }}
      leading={<span
        className={styles.handle}
        data-locked={item.locked || undefined}
        aria-hidden="true"
        onPointerDown={item.locked ? undefined : event => startPointerDrag(event, item.id)}
      ><Icon name="grip-vertical" size="inherit" /></span>}
      trailing={item.locked
        ? <Icon name="lock" size="sm" />
        : item.visible ? <Icon name="check" size="sm" /> : undefined}
    >{item.label}</DropdownMenuItem>)}
    {draggedItem && <div className={styles.dragPreview} style={{ left: dragPosition.x + 8, top: dragPosition.y + 8 }} aria-hidden="true">
      <Icon name="grip-vertical" size="sm" />
      <span>{draggedItem.label}</span>
    </div>}
  </>;

  if (inline) return content;
  return <DropdownMenu
    ariaLabel="Видимость и порядок колонок"
    trigger={<Button variant="ghost" leadingIcon={<Icon name="columns-3" size="inherit" />}>Колонки</Button>}
  >
    {content}
  </DropdownMenu>;
}
