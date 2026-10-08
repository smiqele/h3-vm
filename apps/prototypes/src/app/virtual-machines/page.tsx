"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ScreenRenderer, type Screen, type ScreenFixture } from "@/components/ScreenRenderer";
import { ConsoleWidthToggle } from "@/components/ConsoleWidthToggle";
import { findById, getConsoleModel } from "@/lib/catalog";
import {
  AppHeader, AppShell, Avatar, Button, ContextPath, DataTable,
  DropdownMenu, DropdownMenuItem, Icon, IconButton, Logo,
  PageHeader, SidebarNav, Status, TextField,
  type DataTableColumn, type IconName, type MetricsSummaryProps, type SidebarNavSection,
} from "@cloud/ui";
import styles from "./page.module.css";

type View = "instances" | "backups" | "ips" | "billing" | "profile" | "support";
type VmRow = ScreenFixture["data"][number];
const projectByVmId: Record<string, string> = {
  "VM-V9H2C4T5B": "Production",
  "VM-J2K4N6M8Z": "Production",
  "VM-L5F7T9B0X": "Production",
  "VM-X7R8Q9L3P": "Development",
  "VM-M3V1E4R9S": "Development",
  "VM-Q8Z6P2L7N": "Development",
};
const initialProjects = ["Production", "Development"];
const monthlyConsumptionByVmId: Record<string, number> = {
  "VM-V9H2C4T5B": 8640,
  "VM-J2K4N6M8Z": 2160,
  "VM-L5F7T9B0X": 6480,
  "VM-X7R8Q9L3P": 4320,
  "VM-M3V1E4R9S": 4320,
  "VM-Q8Z6P2L7N": 4320,
};
const numeric = (value: unknown) => Number(value) || 0;
const formatRub = (value: number) => new Intl.NumberFormat("ru-RU").format(value);

function projectSummary(rows: VmRow[], project: string): MetricsSummaryProps {
  const count = (status: string) => rows.filter(row => row.status === status).length;
  const quotaFor = (name: string) => name === "Production" ? { cpu: 32, ramGb: 128, ip: 8 } : { cpu: 16, ramGb: 64, ip: 4 };
  const quota = quotaFor(project);
  const usedCpu = rows.reduce((total, row) => total + numeric(row.cpu), 0);
  const usedRam = rows.reduce((total, row) => total + numeric(row.ramGb), 0);
  const disk = rows.reduce((total, row) => total + numeric(row.diskGb), 0);
  const diskLimit = rows.reduce((total, row) => total + numeric(row.diskLimitGb), 0);
  const assignedIps = rows.filter(row => Boolean(row.publicIp)).length;
  const consumption = rows.reduce((total, row) => total + numeric(row.consumptionRub), 0);
  return {
    ariaLabel: "Сводка инстансов проекта",
    variant: "default",
    items: [
      { id: "instances", type: "breakdown", label: "Инстансы", value: String(rows.length), segments: [
        { tone: "positive", value: String(count("running")), label: "Работают" },
        { tone: "neutral", value: String(count("stopped")), label: "Остановлены" },
        { tone: "danger", value: String(count("error")), label: "С ошибкой" },
      ] },
      { id: "quotas", type: "value", label: "Квоты", value: <span className={styles.quotaGrid}>
        <span>vCPU <strong>{usedCpu}/{quota.cpu}</strong></span>
        <span>RAM <strong>{usedRam}/{quota.ramGb} ГБ</strong></span>
        <span>Диски <strong>{disk}/{diskLimit} ГБ</strong></span>
        <span>IP <strong>{assignedIps}/{quota.ip}</strong></span>
      </span> },
      { id: "accrued", type: "value", label: "Потребление", value: `${formatRub(consumption)} ₽`, aside: "За месяц · демо-данные" },
    ],
  };
}

const viewLabels: Record<View, string> = {
  instances: "Инстансы", backups: "Бэкапы", ips: "IP-адреса",
  billing: "Биллинг", profile: "Профиль", support: "Поддержка",
};
const serviceViews: { id: View; icon: IconName }[] = [
  { id: "instances", icon: "server" }, { id: "backups", icon: "archive" }, { id: "ips", icon: "globe" },
];
const accountViews: { id: View; icon: IconName }[] = [
  { id: "billing", icon: "billing" }, { id: "profile", icon: "users" },
];
type SimpleRow = { id: string; name: string; detail: string; status: string; tone?: "positive" | "warning" | "danger" };
const simpleColumns: DataTableColumn<SimpleRow>[] = [
  { id: "name", header: "Название", cell: row => <strong>{row.name}</strong>, minWidth: 200 },
  { id: "detail", header: "Ресурс", cell: row => row.detail, minWidth: 200 },
  { id: "status", header: "Состояние", cell: row => <Status tone={row.tone ?? "positive"}>{row.status}</Status>, minWidth: 140 },
];

export default function VirtualMachinesPage() {
  const [view, setView] = useState<View>("instances");
  const [projects, setProjects] = useState(initialProjects);
  const [project, setProject] = useState("Production");
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectError, setProjectError] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const model = useMemo(getConsoleModel, []);
  const baseScreen = findById(model.screens.screens, "screen.compute.vm.list") as unknown as Screen;
  const screen = useMemo<Screen>(() => ({
    ...baseScreen,
    title: "Инстансы",
    blocks: baseScreen.blocks.map(block => {
      if (block.component !== "component.data-table") return block;
      const columns = Array.isArray(block.props?.columns) ? block.props.columns : [];
      return {
        ...block,
        props: {
          ...block.props,
          columns: columns.flatMap(column => {
            const field = String((column as Record<string, unknown>).field);
            if (["network", "subnetIp", "image"].includes(field)) return [];
            return field === "cpu"
              ? [column, { field: "vgpu", label: "vGPU", kind: "text", width: 120 }]
              : [column];
          }).concat([{ field: "consumptionRub", label: "Потребление", kind: "text", unit: "₽", width: 160 }]),
          searchFields: ["name", "id", "publicIp"],
        },
      };
    }),
  }), [baseScreen]);
  const baseFixture = model.fixtures.fixtures[baseScreen.states?.populated ?? "fixture.vm.default"] as ScreenFixture;

  useEffect(() => {
    const storedProjects = localStorage.getItem("vm-prototype-projects");
    let parsedProjects: unknown = null;
    try { parsedProjects = storedProjects ? JSON.parse(storedProjects) : null; } catch { /* Use the default projects if storage is invalid. */ }
    const savedProjects = Array.isArray(parsedProjects) && parsedProjects.length > 0 && parsedProjects.every(item => typeof item === "string") ? parsedProjects as string[] : initialProjects;
    setProjects(savedProjects);
    const savedProject = localStorage.getItem("vm-prototype-project");
    if (savedProject && savedProjects.includes(savedProject)) setProject(savedProject);
    const savedTheme = localStorage.getItem("prototype-theme");
    const initialTheme = savedTheme === "light" ? "light" : "dark";
    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
    const syncView = () => {
      const currentView = location.hash.slice(1);
      setView(currentView in viewLabels ? currentView as View : "instances");
    };
    syncView();
    window.addEventListener("hashchange", syncView);
    return () => window.removeEventListener("hashchange", syncView);
  }, []);

  function selectProject(nextProject: string) {
    setProject(nextProject);
    localStorage.setItem("vm-prototype-project", nextProject);
  }

  function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = projectName.trim();
    if (!name) { setProjectError("Введите название проекта"); return; }
    if (projects.some(item => item.toLocaleLowerCase("ru-RU") === name.toLocaleLowerCase("ru-RU"))) {
      setProjectError("Проект с таким названием уже есть"); return;
    }
    const nextProjects = [...projects, name];
    setProjects(nextProjects);
    localStorage.setItem("vm-prototype-projects", JSON.stringify(nextProjects));
    selectProject(name);
    setProjectName("");
    setProjectError("");
    setCreatingProject(false);
    setView("instances");
    location.hash = "instances";
  }

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("prototype-theme", nextTheme);
  }

  const projectRows: VmRow[] = baseFixture.data.filter(row => projectByVmId[row.id] === project).map(row => ({
    ...row,
    consumptionRub: monthlyConsumptionByVmId[row.id] ?? 0,
  }));
  const projectFixture: ScreenFixture = { ...baseFixture, data: projectRows, metricsSummaries: { ...baseFixture.metricsSummaries, state: projectSummary(projectRows, project) } };
  const backupRows: SimpleRow[] = projectRows.flatMap(row => {
    const signals = Array.isArray(row.healthSignals) ? row.healthSignals : [];
    const backup = signals.find(signal => signal && typeof signal === "object" && "icon" in signal && signal.icon === "archive");
    if (!backup) return [];
    const message = "text" in backup ? String(backup.text) : "";
    const failed = message.includes("Ошибка");
    const outdated = message.includes("устарела");
    return [{ id: `backup-${row.id}`, name: `Копия ${String(row.name)}`, detail: String(row.name), status: failed ? "Ошибка" : outdated ? "Устарела" : "Доступна", tone: failed ? "danger" as const : outdated ? "warning" as const : "positive" as const }];
  });
  const ipRows: SimpleRow[] = projectRows.filter(row => row.publicIp).map(row => ({ id: `ip-${row.id}`, name: String(row.publicIp), detail: String(row.name), status: "Назначен" }));
  const serviceSection = serviceViews.some(item => item.id === view);
  const sidebarSections: SidebarNavSection[] = [
    { id: "service", items: serviceViews.map(item => ({ id: item.id, label: viewLabels[item.id], icon: <Icon name={item.icon} size="inherit" />, href: `#${item.id}` })) },
    { id: "account", label: "Аккаунт", items: accountViews.map(item => ({ id: item.id, label: viewLabels[item.id], icon: <Icon name={item.icon} size="inherit" />, href: `#${item.id}` })) },
  ];
  const projectSwitcher = <DropdownMenu align="start" width={280} ariaLabel="Выбор проекта" trigger={<Button className={styles.projectButton} variant="soft" trailingIcon={<Icon name="chevrons-up-down" size="sm" />} aria-label={`Проект: ${project}. Сменить проект`}>{project}</Button>}>
    {projects.map(item => <DropdownMenuItem key={item} selected={item === project} onClick={() => selectProject(item)}>{item}</DropdownMenuItem>)}
    <DropdownMenuItem leading={<Icon name="plus" size="sm" />} onClick={() => setCreatingProject(true)}>Создать проект</DropdownMenuItem>
  </DropdownMenu>;

  const sidebar = <div className={styles.sidebar}>
    <div className={styles.brand}><Link href="/" aria-label="Sitemap прототипа"><Logo /></Link></div>
    <div className={styles.navigation}>
      <SidebarNav sections={sidebarSections} activeItemId={view} label="Разделы виртуальных машин" renderLink={(item, content, { active }) => <a href={item.href} aria-current={active ? "page" : undefined} onClick={() => setView(item.id as View)}>{content}</a>} />
      <div className={styles.balance}><span>Баланс</span><strong>12 480 ₽</strong><small>Демо-данные аккаунта</small></div>
    </div>
    <div className={styles.footer}>
      <IconButton icon={theme === "dark" ? "sun" : "moon"} label={`Переключить на ${theme === "dark" ? "светлую" : "тёмную"} тему`} title="Сменить тему" onClick={toggleTheme} />
      <ConsoleWidthToggle />
      <IconButton icon="message" label="Поддержка" title="Поддержка" onClick={() => { setView("support"); location.hash = "support"; }} />
    </div>
  </div>;

  return <AppShell className={`${styles.shell} console-app-shell`} sidebar={sidebar} header={<>
    <AppHeader scrolledActions={view === "instances" ? <Button variant="solid">Создать</Button> : undefined}>
      <ContextPath separator="none" items={serviceSection ? [{ label: project, control: projectSwitcher }, { label: viewLabels[view] }] : [{ label: "Аккаунт" }, { label: viewLabels[view] }]} />
    </AppHeader>
    {creatingProject && <form className={styles.projectForm} onSubmit={createProject}>
      <TextField label="Название проекта" value={projectName} onChange={event => { setProjectName(event.target.value); setProjectError(""); }} error={projectError || undefined} autoFocus />
      <div><Button type="submit" variant="solid">Создать</Button><Button variant="ghost" onClick={() => { setCreatingProject(false); setProjectError(""); }}>Отмена</Button></div>
    </form>}
  </>}>
    {view === "instances" ? <div className={styles.instanceScreen}><ScreenRenderer key={project} screen={screen} fixture={projectFixture} presentation="virtual-machines" /></div> : <>
    <PageHeader title={viewLabels[view]} />
    <div className={styles.content}>
      {view === "backups" && <DataTable rows={backupRows} columns={simpleColumns} getRowId={row => row.id} ariaLabel="Бэкапы" emptyState="В этом проекте пока нет бэкапов" />}
      {view === "ips" && <DataTable rows={ipRows} columns={simpleColumns} getRowId={row => row.id} ariaLabel="IP-адреса" emptyState="В этом проекте пока нет публичных IP-адресов" />}
      {view === "billing" && <div className={styles.infoCard}><span>Текущий баланс</span><strong>12 480 ₽</strong><p>Демо-данные аккаунта</p></div>}
      {view === "profile" && <div className={styles.infoCard}><Avatar src="/assets/avatar.png" label="Мария Соколова" /><strong>Мария Соколова</strong><p>Профиль аккаунта · демо-данные</p></div>}
      {view === "support" && <div className={styles.infoCard}><Icon name="message" /><strong>Поддержка</strong><p>Раздел поддержки в этом прототипе пока не подключён.</p></div>}
    </div>
    </>}
  </AppShell>;
}
