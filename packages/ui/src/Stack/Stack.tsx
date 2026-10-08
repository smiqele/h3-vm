import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Stack.module.css";

export type StackGap = 4 | 6 | 8 | 12 | 16 | 20 | 24 | 32;

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  gap?: StackGap;
}

export function Stack({ children, gap = 12, className, ...props }: StackProps) {
  return (
    <div
      {...props}
      className={[styles.stack, className].filter(Boolean).join(" ")}
      data-gap={gap}
    >
      {children}
    </div>
  );
}
