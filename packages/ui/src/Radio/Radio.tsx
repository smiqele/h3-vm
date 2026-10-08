"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import styles from "../SelectionControl/SelectionControl.module.css";

export type RadioProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "readOnly" | "size" | "type"
>;

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  function Radio({ className, ...props }, ref) {
    return (
      <input
        {...props}
        ref={ref}
        type="radio"
        className={[styles.control, styles.radio, className]
          .filter(Boolean)
          .join(" ")}
      />
    );
  },
);
