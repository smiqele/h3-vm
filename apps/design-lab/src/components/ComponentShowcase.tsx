"use client";
import {
  ActivityIndicator,
  Avatar,
  Badge,
  AppHeader,
  AppShell,
  Button,
  Checkbox,
  ContextPath,
  DataActivityCell,
  DataMeterCell,
  DataTable,
  type DataTableColumn,
  DataTableToolbar,
  DataTextCell,
  Icon,
  IconButton,
  InlineAlert,
  Logo,
  MeterIndicator,
  NavLink as UiNavLink,
  PageHeader,
  Radio,
  SidebarNav,
  SidebarContextSwitcher,
  Stack,
  Status,
  TextField,
  Tooltip,
  FormLayout,
  FormSection,
  iconNames,
} from "@cloud/ui";
import { useMemo, useState, type ReactNode } from "react";
import { getVmStatusPresentation } from "@cloud/console-runtime";
import styles from "./ComponentShowcase.module.css";
import { ButtonShowcase } from "./ButtonShowcase";
import { BadgeShowcase } from "./BadgeShowcase";
import { IconButtonShowcase } from "./IconButtonShowcase";
import { StatusShowcase } from "./StatusShowcase";
import { DropdownMenuShowcase } from "./DropdownMenuShowcase";
import { CheckboxShowcase } from "./CheckboxShowcase";
import { MetricsSummaryShowcase } from "./MetricsSummaryShowcase";
import { GenericComponentDocs, type ComponentSpec } from "./GenericComponentDocs";
type TableRow = {
  id: string;
  name: string;
  status: "running" | "stopped";
  network: string;
  cpu: number;
  cpuUtilization: number;
  diskGb: number;
  diskLimitGb: number;
};
const rows: TableRow[] = [
  { id: "VM-01", name: "web-prod-01", status: "running", network: "production-subnet-a", cpu: 4, cpuUtilization: 0.43, diskGb: 72, diskLimitGb: 100 },
  { id: "VM-02", name: "worker-test", status: "stopped", network: "development-subnet-a", cpu: 2, cpuUtilization: 0.08, diskGb: 34, diskLimitGb: 80 },
];
const tableColumns: DataTableColumn<TableRow>[] = [
  { id: "name", header: "Имя · link + copy", cell: (row) => <DataTextCell text={row.name} href={"#" + row.id} copyable />, sortValue: (row) => row.name, inset: "compact", minWidth: 190, pinned: "start" },
  { id: "status", header: "Статус", cell: (row) => {
    const { label, tone, animated } = getVmStatusPresentation(row.status);
    return <Status tone={tone} animated={animated}>{label}</Status>;
  }, sortValue: (row) => row.status, inset: "compact" },
  { id: "id", header: "ID · copy", cell: (row) => <DataTextCell text={row.id} copyable />, inset: "compact" },
  { id: "network", header: "Подсеть · copy", cell: (row) => <DataTextCell text={row.network} copyable />, minWidth: 180 },
  { id: "cpu", header: "vCPU · activity", cell: (row) => <DataActivityCell level={row.cpuUtilization} label={"Утилизация CPU " + row.cpuUtilization * 100 + "%"}>{row.cpu} vCPU</DataActivityCell>, sortValue: (row) => row.cpu },
  { id: "disk", header: "Диск · meter", cell: (row) => <DataMeterCell value={row.diskGb} limit={row.diskLimitGb} unit="ГБ" label="Место на диске" />, sortValue: (row) => row.diskGb, minWidth: 180 },
];
const sidebarSections = [
  {
    id: "compute",
    label: "Вычисление",
    items: [
      { id: "vm", label: "Виртуальные машины", href: "#", icon: <Icon name="server" size="inherit" /> },
      { id: "images", label: "Образы и шаблоны", href: "#", icon: <Icon name="images" size="inherit" /> },
    ],
  },
  {
    id: "storage",
    label: "Хранение",
    items: [
      { id: "disks", label: "Диски", href: "#", icon: <Icon name="hard-drive" size="inherit" /> },
      { id: "snapshots", label: "Снапшоты и бэкапы", href: "#", icon: <Icon name="archive" size="inherit" /> },
    ],
  },
] as const;

function DataTableShowcase() {
  const [query, setQuery] = useState("");
  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ru-RU");
    return rows.filter((row) => !normalizedQuery || [row.name, row.id]
      .some((value) => value.toLocaleLowerCase("ru-RU").includes(normalizedQuery)));
  }, [query]);

  return (
    <DataTable
      rows={visibleRows}
      columns={tableColumns}
      getRowId={(row) => row.id}
      selection="multiple"
      selectionColumnId="name"
      columnManagement
      toolbar={
        <DataTableToolbar
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder="Поиск по имени или ID…"
          filter={
            <Button
              variant="ghost"
              leadingIcon={<Icon name="filter" size="inherit" />}
            >
              Фильтр
            </Button>
          }
          actions={<IconButton icon="ellipsis" label="Настройки таблицы" size="compact" />}
        />
      }
      rowActions={() => (
        <IconButton icon="ellipsis" label="Действия со строкой" size="compact" />
      )}
    />
  );
}

const exampleCode: Record<string, string> = {
  "primitive.logo": '<Logo title="h3llo cloud" />',
  "primitive.icon": '<Icon name="server" size="md" label="Сервер" />',
  "primitive.badge": "<Badge>semantic.surface.default</Badge>",
  "primitive.icon-button": '<IconButton icon="settings" label="Настройки" />',
  "primitive.avatar": '<Avatar label="Мария Соколова" fallback="МС" size="md" />',
  "primitive.text-field": '<TextField label="Имя виртуальной машины" defaultValue="web-prod-01" />',
  "primitive.metric-indicator": '<MeterIndicator appearance="ring" level={0.72} label="Занято 72%" />',
  "primitive.tooltip": '<Tooltip content="Работают"><span tabIndex={0}>4</span></Tooltip>',
  "primitive.stack": "<Stack gap={12}>…</Stack>",
  "primitive.checkbox": '<Checkbox size="md" aria-label="Выбрать строку" />',
  "primitive.radio": '<Radio name="region" aria-label="Москва" />',
  "component.sidebar-nav": '<SidebarNav sections={sections} activeItemId="compute.vm" />',
  "component.nav-link": '<NavLink href="/compute/vms" label="Виртуальные машины" icon={<Icon name="server" />} />',
  "component.sidebar-context-switcher": '<SidebarContextSwitcher workspace="Acme Corp" project="Production" serviceLabel="IaaS" />',
  "component.app-shell": "<AppShell sidebar={sidebar} header={header}>…</AppShell>",
  "component.context-path": '<ContextPath separator="none" items={[{ label: "Production", control: <Button variant="soft" trailingIcon={<Icon name="chevrons-up-down" />}>Production</Button> }, { label: "Инстансы" }]} />',
  "component.app-header": "<AppHeader actions={actions}><ContextPath items={items} /></AppHeader>",
  "component.page-header": '<PageHeader title="Виртуальные машины" actions={<Button>Создать</Button>} />',
  "component.dropdown-menu": '<DropdownMenu trigger={<Button variant="ghost">Открыть</Button>}>…</DropdownMenu>',
  "component.data-table": "<DataTable rows={rows} columns={columns} getRowId={row => row.id} />",
  "component.form": "<FormLayout actions={actions}><FormSection title=\"Основное\">…</FormSection></FormLayout>",
  "component.inline-alert": '<InlineAlert tone="danger" title="Не удалось остановить машину">Сервис недоступен.</InlineAlert>',
};

export function ComponentShowcase({ componentId, spec }: { componentId: string; spec: ComponentSpec }) {
  const documented = (example: ReactNode) => <GenericComponentDocs spec={spec} example={example} code={exampleCode[componentId] ?? `<${spec.name ?? "Component"} />`} />;
  if (componentId === "primitive.logo") return documented(<div className={styles.row}><Logo/><Logo style={{color:"var(--text-secondary)"}} title="h3llo cloud · secondary"/></div>);
  if (componentId === "primitive.icon") return documented(<div className={styles.iconCatalog}>{iconNames.map(name=><article key={name}><Icon name={name}/><Badge>{name}</Badge></article>)}</div>);
  if (componentId === "primitive.badge") return <BadgeShowcase />;
  if (componentId === "primitive.button") return <ButtonShowcase />;
  if (componentId === "primitive.icon-button") return <IconButtonShowcase />;
  if (componentId === "primitive.avatar") return documented(<div className={styles.row}><Avatar label="Мария Соколова" fallback="МС" size="xs"/><Avatar label="Мария Соколова" fallback="МС" size="sm"/><Avatar label="Мария Соколова" fallback="МС" size="md"/></div>);
  if (componentId === "primitive.text-field") return documented(<div className={styles.fields}><TextField label="Имя виртуальной машины" defaultValue="web-prod-01"/><TextField label="Имя с ошибкой" defaultValue="prod server" error="Используйте латинские буквы, цифры и дефисы"/></div>);
  if (componentId === "primitive.status") return <StatusShowcase />;
  if (componentId === "primitive.metric-indicator") return documented(<div className={styles.row}><ActivityIndicator level={.43} label="Активность 43%"/><MeterIndicator level={.72} label="Заполнено 72%"/><MeterIndicator appearance="ring" level={.72} label="Заполнено 72%"/></div>);
  if (componentId === "primitive.tooltip") return documented(<Tooltip content="Работают"><span>Наведите или сфокусируйте</span></Tooltip>);
  if (componentId === "primitive.stack") return documented(<Stack gap={12}><Badge>Первый блок</Badge><Badge>Второй блок</Badge><Badge>Третий блок</Badge></Stack>);
  if (componentId === "primitive.checkbox") return <CheckboxShowcase />;
  if (componentId === "primitive.radio") return documented(<div className={styles.row}><Radio aria-label="Unchecked" name="radio-demo"/><Radio aria-label="Checked" name="radio-demo" defaultChecked/><Radio aria-label="Disabled" name="radio-disabled" disabled/></div>);
  if (componentId === "component.sidebar-nav") return documented(<div className={styles.sidebarNavExample}><SidebarNav sections={sidebarSections} activeItemId="vm" /></div>);
  if (componentId === "component.nav-link") return documented(<div className={styles.sidebarNavExample}><UiNavLink href="#" label="Виртуальные машины" icon={<Icon name="server" size="inherit" />}/><UiNavLink href="#" label="Активный пункт" icon={<Icon name="database" size="inherit" />} active/><UiNavLink label="Недоступный пункт" icon={<Icon name="archive" size="inherit" />} disabled/></div>);
  if (componentId === "component.sidebar-context-switcher") return documented(<div className={styles.sidebarNavExample}><SidebarContextSwitcher workspace="Acme Corp" project="Production" serviceLabel="IaaS" aria-label="Сменить контекст"/></div>);
  if (componentId === "component.app-shell") return documented(<AppShell className={styles.appShellExample} sidebar={<SidebarNav sections={sidebarSections} activeItemId="vm" />} header={<AppHeader><ContextPath items={[{ label: "Acme Corp" }, { label: "Production" }, { label: "Виртуальные машины" }]}/></AppHeader>} aside={<div className={styles.appShellAside}>Aside slot</div>}><PageHeader title="Виртуальные машины" actions={<Button variant="solid">Создать</Button>}/></AppShell>);
  if (componentId === "component.context-path") return documented(<ContextPath separator="none" items={[{ label: "Production", control: <Button variant="soft" trailingIcon={<Icon name="chevrons-up-down" size="sm" />}>Production</Button> }, { label: "Инстансы" }]}/>);
  if (componentId === "component.app-header") return documented(<div className={styles.appHeaderExample}><AppHeader actions={<Button>Действие</Button>}><ContextPath items={[{ label: "Acme Corp" }, { label: "Production" }, { label: "Виртуальные машины" }]}/></AppHeader></div>);
  if (componentId === "component.page-header") return documented(<div className={styles.pageHeaderExamples}><PageHeader title="Заголовок страницы" meta={<div className={styles.pageMeta}><span>Тип страницы</span><i aria-hidden="true">·</i><span className={styles.copyValue}>id-ресурса <Icon name="copy" size="sm" /></span></div>} actions={<><Button>Кнопка 2</Button><Button variant="solid">Кнопка 1</Button></>}/><PageHeader title="Виртуальные машины" actions={<Button variant="solid">Создать</Button>}/></div>);
  if (componentId === "component.metrics-summary") return <MetricsSummaryShowcase />;
  if (componentId === "component.dropdown-menu") return <DropdownMenuShowcase spec={spec} />;
  if (componentId === "component.data-table") return documented(<DataTableShowcase />);
  if (componentId === "component.form") return documented(<FormLayout onSubmit={(event) => event.preventDefault()} actions={<div className={styles.row}><Button variant="solid" type="submit">Создать</Button><Button type="button">Отмена</Button></div>}><FormSection title="Основное" description="Параметры виртуальной машины"><TextField label="Имя" defaultValue="web-prod-01"/><TextField label="Регион" defaultValue="ru-1"/></FormSection></FormLayout>);
  if (componentId === "component.inline-alert") return documented(<InlineAlert tone="danger" title="Не удалось остановить виртуальную машину" actions={<div className={styles.row}><Button variant="solid">Повторить</Button><Button>Подробности</Button></div>}>Сервис временно недоступен. Состояние машины не изменилось.</InlineAlert>);
  return <p>Для компонента еще нет живого примера.</p>;
}
