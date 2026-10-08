import type { Metadata } from "next";
import Link from "next/link";
import { LESS_LIME_GLYPHS, LESS_LIME_GLYPH_OFFSETS } from "@/effects/math-clouds/glyphs";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Символы тёмных ячеек — h3llo cloud",
};

export default function CellsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>terminal · меньше лайма</p>
            <h1>Символы тёмных ячеек</h1>
            <p className={styles.description}>Все {LESS_LIME_GLYPHS.length} символов на белом фоне.</p>
          </div>
          <Link className={styles.back} href="/">← На главную</Link>
        </header>
        <ul className={styles.grid} aria-label="Варианты символов">
          {LESS_LIME_GLYPHS.map((glyph, index) => (
            <li className={styles.item} key={glyph}>
              <span className={styles.cell} aria-label={`Ячейка с символом ${glyph}`}>
                <span
                  className={styles.glyph}
                  style={{
                    transform: `translate(${LESS_LIME_GLYPH_OFFSETS[glyph]?.x ?? 0}px, ${LESS_LIME_GLYPH_OFFSETS[glyph]?.y ?? 0}px)`,
                  }}
                  aria-hidden="true"
                >
                  {glyph}
                </span>
              </span>
              <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
