"use client";

import { useMemo, useState } from "react";
import type { Backlog, BacklogArea, BacklogStatus, HypothesisStatus, ProductHypothesis } from "@cloud/backlog";
import styles from "./BacklogBoard.module.css";

type AreaFilter = BacklogArea | "all";
type StatusFilter = BacklogStatus | "all";

const areaLabels: Record<BacklogArea, string> = {
  ui: "UI",
  ux: "UX",
  product: "Product",
  architecture: "Architecture",
};

const statusLabels: Record<BacklogStatus, string> = {
  backlog: "Backlog",
  ready: "Ready",
  "in-progress": "In progress",
  blocked: "Blocked",
  done: "Done",
};

const statusOrder: BacklogStatus[] = ["in-progress", "ready", "backlog", "blocked", "done"];
const priorityOrder = { high: 0, medium: 1, low: 2 } as const;

const hypothesisStatusLabels: Record<HypothesisStatus, string> = {
  proposed: "Предложена",
  "ready-for-test": "Готова к проверке",
  testing: "Проверяется",
  validated: "Подтверждена",
  invalidated: "Опровергнута",
  inconclusive: "Недостаточно данных",
  parked: "Отложена",
};

export function BacklogBoard({ backlog }: { backlog: Backlog }) {
  const [view, setView] = useState<"tasks" | "hypotheses">("hypotheses");
  const [area, setArea] = useState<AreaFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const tasks = useMemo(() => backlog.tasks
    .filter((task) => area === "all" || task.area === area)
    .filter((task) => status === "all" || task.status === status)
    .toSorted((first, second) => {
      const statusDifference = statusOrder.indexOf(first.status) - statusOrder.indexOf(second.status);
      return statusDifference || priorityOrder[first.priority] - priorityOrder[second.priority];
    }), [area, backlog.tasks, status]);

  const readyCount = backlog.tasks.filter((task) => task.status === "ready").length;
  const activeCount = backlog.tasks.filter((task) => task.status === "in-progress").length;

  return <main className={styles.page}>
    <header className={styles.intro}>
      <div>
        <p className={styles.eyebrow}>Repository backlog · v{backlog.version}</p>
        <h1>Backlog</h1>
        <p className={styles.description}>Продуктовые гипотезы и связанная с ними очередь реализации.</p>
      </div>
      <dl className={styles.summary}>
        <div><dt>Гипотез</dt><dd>{backlog.hypotheses.length}</dd></div>
        <div><dt>Задач</dt><dd>{backlog.tasks.length}</dd></div>
        <div><dt>Готовы</dt><dd>{readyCount}</dd></div>
        <div><dt>В работе</dt><dd>{activeCount}</dd></div>
      </dl>
    </header>

    <nav className={styles.viewSwitch} aria-label="Раздел backlog">
      <button type="button" aria-current={view === "hypotheses" ? "page" : undefined} onClick={() => setView("hypotheses")}>Гипотезы <span>{backlog.hypotheses.length}</span></button>
      <button type="button" aria-current={view === "tasks" ? "page" : undefined} onClick={() => setView("tasks")}>Задачи <span>{backlog.tasks.length}</span></button>
    </nav>

    {view === "tasks" ? <>
      <section className={styles.controls} aria-label="Фильтры backlog">
        <FilterGroup label="Область" value={area} options={["all", ...backlog.areas]} getLabel={(value) => value === "all" ? "Все" : areaLabels[value]} onChange={setArea}/>
        <FilterGroup label="Статус" value={status} options={["all", ...statusOrder]} getLabel={(value) => value === "all" ? "Все" : statusLabels[value]} onChange={setStatus}/>
      </section>

      <div className={styles.listHeader}>
        <span>{tasks.length} задач</span>
        <code>packages/backlog/tasks.yaml</code>
      </div>

      <section className={styles.list} aria-label="Задачи">
        {tasks.map((task) => <article className={styles.task} key={task.id}>
          <div className={styles.taskMain}>
            <div className={styles.identity}>
              <code>{task.id}</code>
              <span data-status={task.status}>{statusLabels[task.status]}</span>
            </div>
            <div className={styles.body}>
              <h2>{task.title}</h2>
              <p>{task.summary}</p>
              <div className={styles.meta}>
                <span>{areaLabels[task.area]}</span>
                <span>{task.kind}</span>
                <span>{task.priority}</span>
                <code>{task.target}</code>
              </div>
            </div>
          </div>
          <details className={styles.details}>
            <summary>Критерии и контекст</summary>
            <div className={styles.detailsGrid}>
              <div><h3>Готово, когда</h3><ul>{task.acceptance.map((item) => <li key={item}>{item}</li>)}</ul></div>
              <div><h3>Предполагаемые файлы</h3><ul>{task.files.map((file) => <li key={file}><code>{file}</code></li>)}</ul>{task.dependsOn.length > 0 && <><h3>Зависит от</h3><p>{task.dependsOn.join(", ")}</p></>}</div>
            </div>
          </details>
        </article>)}
        {tasks.length === 0 && <p className={styles.empty}>Для выбранных фильтров задач нет.</p>}
      </section>
    </> : <>
      <div className={styles.listHeader}>
        <span>{backlog.hypotheses.length} гипотеза</span>
        <code>packages/backlog/hypotheses.yaml</code>
      </div>
      <section className={styles.hypothesisList} aria-label="Продуктовые гипотезы">
        {backlog.hypotheses.map((hypothesis) => <HypothesisCard hypothesis={hypothesis} key={hypothesis.id}/>) }
      </section>
    </>}
  </main>;
}

function HypothesisCard({ hypothesis }: { hypothesis: ProductHypothesis }) {
  return <article className={styles.hypothesis}>
    <header className={styles.hypothesisHeader}>
      <div className={styles.hypothesisIdentity}>
        <div><code>{hypothesis.id}</code><span data-status={hypothesis.status}>{hypothesisStatusLabels[hypothesis.status]}</span></div>
        <h2>{hypothesis.title}</h2>
        <span className={styles.owner}>{hypothesis.owner}</span>
      </div>
    </header>

    <section className={styles.jobCard}>
      <p className={styles.sectionLabel}>Задача пользователя</p>
      <dl><div><dt>Кто</dt><dd>{hypothesis.job.actor}</dd></div><div><dt>Когда</dt><dd>{hypothesis.job.context}</dd></div><div><dt>Хочет</dt><dd>{hypothesis.job.need}</dd></div><div><dt>Чтобы</dt><dd>{hypothesis.job.outcome}</dd></div></dl>
    </section>

    <section className={styles.narrativeSection}><p className={styles.sectionLabel}>Наблюдение</p><p>{hypothesis.observation}</p></section>
    <section className={styles.narrativeSection}><p className={styles.sectionLabel}>Гипотеза</p><p>{hypothesis.statement}</p></section>
    <section className={styles.narrativeSection}>
      <p className={styles.sectionLabel}>Предлагаемое решение</p>
      <p>{hypothesis.solution.summary}</p>
      <div className={styles.references}>{[...hypothesis.solution.patterns, ...hypothesis.solution.screens].map((reference) => <code key={reference}>{reference}</code>)}</div>
    </section>

    <section className={styles.evaluation}>
      <div className={styles.evaluationHeader}><p className={styles.sectionLabel}>Как поймём, что это работает</p><h3>Критерии проверки</h3><span>{hypothesis.evaluation.quantitative.length + hypothesis.evaluation.qualitative.length} сигналов</span></div>
      <div className={styles.metricGrid}>
        <div><p className={styles.metricType}>Количественные</p>{hypothesis.evaluation.quantitative.map((item) => <div className={styles.metric} key={item.metric}><strong>{item.metric}</strong><span>{item.target}</span><small>{item.method}</small></div>)}</div>
        <div><p className={styles.metricType}>Качественные</p>{hypothesis.evaluation.qualitative.map((item) => <div className={styles.metric} key={item.signal}><strong>{item.signal}</strong><small>{item.method}</small></div>)}</div>
      </div>
    </section>

    <footer className={styles.decision}>
      <div><span>Решение</span><strong>Ожидает данных</strong><p>{hypothesis.decision.rationale}</p></div>
      <dl><div><dt>Свидетельства</dt><dd>{hypothesis.evidence.length}</dd></div><div><dt>Связанные задачи</dt><dd>{hypothesis.tasks.length}</dd></div></dl>
    </footer>
  </article>;
}

function FilterGroup<T extends string>({ label, value, options, getLabel, onChange }: {
  label: string;
  value: T;
  options: T[];
  getLabel: (option: T) => string;
  onChange: (option: T) => void;
}) {
  return <div className={styles.filterGroup}>
    <span>{label}</span>
    <div>{options.map((option) => <button key={option} type="button" aria-pressed={option === value} onClick={() => onChange(option)}>{getLabel(option)}</button>)}</div>
  </div>;
}
