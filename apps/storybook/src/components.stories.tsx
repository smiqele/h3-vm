import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  ContextPath,
  DataActivityCell,
  DataTable,
  DataTableToolbar,
  DataTextCell,
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  FormLayout,
  FormSection,
  Icon,
  InlineAlert,
  MetricsSummary,
  NavLink,
  PageHeader,
  SidebarContextSwitcher,
  SidebarNav,
  TextField,
} from "@cloud/ui";

const meta = { title: "Components/Catalog" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Navigation: Story = {
  render: () => <div className="story-column">
    <ContextPath items={[{ label: "Cloud", href: "#" }, { label: "Compute", href: "#" }, { label: "Виртуальные машины" }]} />
    <SidebarContextSwitcher workspace="Acme Cloud" project="Production" serviceLabel="Compute" />
    <SidebarNav activeItemId="vms" sections={[{ label: "Compute", id: "compute", items: [
      { id: "vms", label: "Виртуальные машины", href: "#", icon: <Icon name="server" size="inherit" /> },
      { id: "images", label: "Образы", href: "#", icon: <Icon name="images" size="inherit" /> },
      { id: "gpu", label: "GPU", disabled: true, icon: <Icon name="cpu" size="inherit" /> },
    ]}]} />
    <NavLink label="Настройки" href="#" icon={<Icon name="settings" size="inherit" />} />
  </div>,
};

export const Menu: Story = {
  render: () => <DropdownMenu align="start" trigger={<Button trailingIcon={<Icon name="chevron-down" size="inherit" />}>Действия</Button>}>
    <DropdownMenuLabel>Виртуальная машина</DropdownMenuLabel>
    <DropdownMenuGroup>
      <DropdownMenuItem leading={<Icon name="terminal" size="sm" />} trailing={<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>}>Открыть консоль</DropdownMenuItem>
      <DropdownMenuItem leading={<Icon name="copy" size="sm" />}>Дублировать</DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuItem destructive leading={<Icon name="x" size="sm" />}>Удалить</DropdownMenuItem>
  </DropdownMenu>,
};

export const Feedback: Story = {
  render: () => <div className="story-column">
    <InlineAlert title="Сеть будет недоступна" tone="warning" actions={<Button variant="ghost">Подробнее</Button>}>Изменение подсети перезапустит виртуальную машину.</InlineAlert>
    <InlineAlert title="Конфигурация сохранена" tone="success" />
  </div>,
};

export const Header: Story = {
  render: () => <div className="story-panel">
    <PageHeader title="Виртуальные машины" meta="12 ресурсов" actions={<Button variant="solid" leadingIcon={<Icon name="plus" size="inherit" />}>Создать</Button>} />
  </div>,
};

export const Metrics: Story = {
  render: () => <div className="story-panel"><MetricsSummary ariaLabel="Использование ресурсов" items={[
    { id: "vms", type: "value", label: "Виртуальные машины", value: "12", aside: "+2", asideTone: "positive" },
    { id: "cpu", type: "meter", label: "CPU", value: "36 из 64", level: 0.56 },
    { id: "ram", type: "meter", label: "RAM", value: "96 ГБ", level: 0.75, appearance: "ring" },
    { id: "status", type: "breakdown", label: "Статус", value: "12", segments: [{ tone: "positive", value: 10, label: "Работают" }, { tone: "danger", value: 2, label: "Ошибка" }] },
  ]} /></div>,
};

const rows = [
  { id: "vm-01", name: "api-production-01", status: "Работает", activity: 0.8, zone: "ru-msk-a" },
  { id: "vm-02", name: "worker-production-02", status: "Работает", activity: 0.45, zone: "ru-msk-b" },
  { id: "vm-03", name: "database-staging", status: "Остановлена", activity: 0, zone: "ru-msk-a" },
];

function TableExample() {
  const [search, setSearch] = useState("");
  const filteredRows = rows.filter(row => row.name.includes(search.toLowerCase()));
  return <DataTable
    ariaLabel="Виртуальные машины"
    rows={filteredRows}
    getRowId={row => row.id}
    selection="multiple"
    columnManagement
    columns={[
      { id: "name", header: "Название", minWidth: 240, fill: true, pinned: "start", cell: row => <DataTextCell text={row.name} href="#" copyable />, sortValue: row => row.name },
      { id: "status", header: "Статус", minWidth: 160, cell: row => row.status },
      { id: "activity", header: "CPU", minWidth: 150, cell: row => <DataActivityCell level={row.activity} label={`CPU ${Math.round(row.activity * 100)}%`}>{Math.round(row.activity * 100)}%</DataActivityCell>, sortValue: row => row.activity },
      { id: "zone", header: "Зона", minWidth: 140, cell: row => row.zone },
    ]}
    toolbar={({ columnManager }) => <DataTableToolbar searchValue={search} onSearchChange={setSearch} actions={columnManager} />}
  />;
}

export const Table: Story = {
  parameters: { layout: "fullscreen" },
  render: () => <div className="storybook-preview story-panel"><TableExample /></div>,
};

export const Form: Story = {
  render: () => <div className="story-panel"><FormLayout actions={<><Button variant="ghost">Отмена</Button><Button variant="solid">Создать</Button></>}>
    <FormSection title="Основные параметры" description="Задайте имя и сетевой адрес.">
      <TextField label="Название" defaultValue="api-production-01" />
      <TextField label="IPv4" placeholder="10.0.0.12" />
    </FormSection>
  </FormLayout></div>,
};
