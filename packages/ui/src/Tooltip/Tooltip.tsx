"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./Tooltip.module.css";

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, "content"> {
  content: ReactNode;
  children: ReactNode;
  delay?: number;
}

export function Tooltip({ content, children, delay = 350, className, onKeyDown, ...props }: TooltipProps) {
  const id = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0, placement: "top" as "top" | "bottom" });

  function clearTimers() {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  function show(immediate = false) {
    clearTimers();
    if (immediate || delay === 0) setOpen(true);
    else openTimer.current = setTimeout(() => setOpen(true), delay);
  }

  function hide() {
    clearTimers();
    closeTimer.current = setTimeout(() => setOpen(false), 100);
  }

  useEffect(() => () => clearTimers(), []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !tooltipRef.current) return;
    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const viewportInset = 8;
    const gap = 6;
    const placement = trigger.top >= tooltip.height + gap + viewportInset ? "top" : "bottom";
    const desiredLeft = trigger.left + trigger.width / 2;
    const left = Math.min(window.innerWidth - tooltip.width / 2 - viewportInset, Math.max(tooltip.width / 2 + viewportInset, desiredLeft));
    setPosition({ left, top: placement === "top" ? trigger.top - gap : trigger.bottom + gap, placement });
  }, [open]);

  return <>
    <span
      {...props}
      ref={triggerRef}
      className={[styles.trigger, className].filter(Boolean).join(" ")}
      tabIndex={props.tabIndex ?? 0}
      aria-describedby={open ? id : undefined}
      onPointerEnter={() => show()}
      onPointerLeave={hide}
      onFocus={() => show(true)}
      onBlur={hide}
      onKeyDown={(event) => {
        if (event.key === "Escape") { clearTimers(); setOpen(false); }
        onKeyDown?.(event);
      }}
    >{children}</span>
    {open && createPortal(
      <span
        id={id}
        ref={tooltipRef}
        className={styles.tooltip}
        data-placement={position.placement}
        role="tooltip"
        style={{ left: position.left, top: position.top }}
        onPointerEnter={() => { clearTimers(); setOpen(true); }}
        onPointerLeave={hide}
      >{content}</span>,
      document.body,
    )}
  </>;
}
