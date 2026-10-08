import type { Screen } from "./ScreenRenderer";
import styles from "./ScreenSpecPanel.module.css";

export function ScreenSpecPanel({ screen }: { screen: Screen }) {
  return (
    <div className={styles.panel}>
      <small>Собрано из YAML</small>
      <strong>{screen.id}</strong>
      <code>{screen.resource}</code>
      <code>{screen.pattern}</code>
      {screen.blocks.map((block) => (
        <code key={block.id}>{block.component}</code>
      ))}
    </div>
  );
}
