"use client";

import {
  forwardRef,
  useLayoutEffect,
  useMemo,
  useRef,
  type InputHTMLAttributes,
} from "react";
import styles from "../SelectionControl/SelectionControl.module.css";
import { mergeRefs } from "../utils/mergeRefs";

export interface CheckboxProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "readOnly" | "size" | "type"
  > {
  indeterminate?: boolean;
  size?: "sm" | "md";
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    { className, indeterminate = false, size = "md", ...props },
    forwardedRef,
  ) {
    const inputRef = useRef<HTMLInputElement>(null);
    const mergedRef = useMemo(
      () => mergeRefs(inputRef, forwardedRef),
      [forwardedRef],
    );

    useLayoutEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    return (
      <input
        {...props}
        ref={mergedRef}
        type="checkbox"
        className={[styles.control, styles.checkbox, className]
          .filter(Boolean)
          .join(" ")}
        data-indeterminate={indeterminate || undefined}
        data-size={size}
        aria-checked={indeterminate ? "mixed" : props["aria-checked"]}
      />
    );
  },
);
