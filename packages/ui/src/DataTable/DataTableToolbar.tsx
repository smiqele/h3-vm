"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import { IconButton } from "../IconButton/IconButton";
import styles from "./DataTableToolbar.module.css";

export interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filter?: ReactNode;
  actions?: ReactNode;
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Поиск…",
  filter,
  actions,
}: DataTableToolbarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchInputId = useId();
  const [searchFinalized, setSearchFinalized] = useState(false);
  const showClearButton = Boolean(searchValue) && searchFinalized;

  function clearSearch() {
    onSearchChange("");
    setSearchFinalized(false);
    searchInputRef.current?.focus();
  }

  return (
    <div className={styles.toolbar} data-has-actions={Boolean(actions)}>
      <div className={styles.search}>
        <label className={styles.visuallyHidden} htmlFor={searchInputId}>
          Поиск по таблице
        </label>
        <Icon name="search" size="sm" />
        <span className={styles.inputShell} data-finalized={showClearButton || undefined}>
          <span className={styles.inputTrack}>
            <input
              id={searchInputId}
              ref={searchInputRef}
              type="search"
              value={searchValue}
              onChange={(event) => {
                onSearchChange(event.target.value);
                setSearchFinalized(false);
              }}
              onBlur={() => setSearchFinalized(Boolean(searchValue))}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                setSearchFinalized(Boolean(searchValue));
              }}
              placeholder={searchPlaceholder}
            />
            <span className={styles.inputMeasure} aria-hidden="true">{searchValue || searchPlaceholder}</span>
          </span>
          {showClearButton && (
            <IconButton
              icon="x"
              label="Сбросить поиск"
              size="compact"
              onClick={clearSearch}
            />
          )}
        </span>
      </div>

      {(filter || actions) && <div className={styles.controls}>
        {filter && <div className={styles.filter}>{filter}</div>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>}
    </div>
  );
}
