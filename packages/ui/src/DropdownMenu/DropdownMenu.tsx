"use client";

import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import styles from "./DropdownMenu.module.css";

type MenuContextValue = { close: () => void };
const MenuContext = createContext<MenuContextValue | null>(null);

export interface DropdownMenuProps {
  trigger: ReactElement;
  children: ReactNode;
  align?: "start" | "end";
  ariaLabel?: string;
  width?: number;
}

export function DropdownMenu({ trigger, children, align = "end", ariaLabel = "Меню", width = 244 }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const rootRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const positionMenu = () => {
      const bounds = rootRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const preferredLeft = align === "start" ? bounds.left : bounds.right - width;
      setPosition({
        left: Math.max(8, Math.min(preferredLeft, window.innerWidth - width - 8)),
        top: bounds.bottom + 4,
      });
    };
    positionMenu();
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    return () => {
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
  }, [align, open, width]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !contentRef.current?.contains(target)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        (rootRef.current?.firstElementChild as HTMLElement | null)?.focus();
      }
      if ((event.key === "ArrowDown" || event.key === "ArrowUp") && contentRef.current?.contains(document.activeElement)) {
        const items = [...contentRef.current.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([disabled])')];
        const current = items.indexOf(document.activeElement as HTMLElement);
        const delta = event.key === "ArrowDown" ? 1 : -1;
        items[(current + delta + items.length) % items.length]?.focus();
        event.preventDefault();
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", handleKeyDown);
    requestAnimationFrame(() => contentRef.current?.querySelector<HTMLElement>('[role^="menuitem"]')?.focus());
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const triggerProps = {
    "aria-expanded": open,
    "aria-haspopup": "menu" as const,
    onClick: (event: ReactMouseEvent) => {
      const original = (trigger.props as { onClick?: (event: ReactMouseEvent) => void }).onClick;
      original?.(event);
      if (!event.defaultPrevented) setOpen(current => !current);
    },
  };

  return <MenuContext.Provider value={{ close: () => setOpen(false) }}>
    <span className={styles.root} ref={rootRef}>{isValidElement(trigger) ? cloneElement(trigger, triggerProps) : trigger}</span>
    {open && typeof document !== "undefined" ? createPortal(
      <div
        className={styles.content}
        ref={contentRef}
        role="menu"
        aria-label={ariaLabel}
        style={{ left: position.left, top: position.top, width }}
      >{children}</div>,
      document.body,
    ) : null}
  </MenuContext.Provider>;
}

export function DropdownMenuGroup(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={[styles.group, props.className].filter(Boolean).join(" ")} role="group" />;
}

export function DropdownMenuLabel(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={[styles.label, props.className].filter(Boolean).join(" ")} />;
}

export function DropdownMenuSeparator(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={[styles.separator, props.className].filter(Boolean).join(" ")} role="separator" />;
}

export interface DropdownMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  leading?: ReactNode;
  trailing?: ReactNode;
  selected?: boolean;
  destructive?: boolean;
  closeOnSelect?: boolean;
}

export function DropdownMenuItem({ leading, trailing, selected, destructive, closeOnSelect = true, className, children, onClick, ...props }: DropdownMenuItemProps) {
  const menu = useContext(MenuContext);
  return <button
    {...props}
    type="button"
    role={selected === undefined ? "menuitem" : "menuitemcheckbox"}
    aria-checked={selected}
    className={[styles.item, className].filter(Boolean).join(" ")}
    data-destructive={destructive || undefined}
    onClick={event => {
      onClick?.(event);
      if (!event.defaultPrevented && closeOnSelect) menu?.close();
    }}
  >
    {leading && <span className={styles.leading}>{leading}</span>}
    <span className={styles.itemLabel}>{children}</span>
    {trailing && <span className={styles.trailing}>{trailing}</span>}
  </button>;
}

export function DropdownMenuShortcut({ children, className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} className={[styles.shortcut, className].filter(Boolean).join(" ")}>{children}</span>;
}
