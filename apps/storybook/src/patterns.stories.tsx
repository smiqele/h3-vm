import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppHeader, AppShell, Button, ContextPath, Icon, PageHeader, SidebarContextSwitcher, SidebarNav } from "@cloud/ui";

const meta = { title: "Patterns/Application shell", parameters: { layout: "fullscreen" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <div className="story-shell">
    <AppShell
      sidebar={<div className="story-sidebar"><SidebarContextSwitcher workspace="Acme Cloud" project="Production" /><SidebarNav activeItemId="vms" sections={[{ id: "compute", label: "Compute", items: [
        { id: "vms", label: "Виртуальные машины", href: "#", icon: <Icon name="server" size="inherit" /> },
        { id: "images", label: "Образы", href: "#", icon: <Icon name="images" size="inherit" /> },
        { id: "networks", label: "Сети", href: "#", icon: <Icon name="network" size="inherit" /> },
      ]}]} /></div>}
      header={<AppHeader actions={<Button variant="ghost">Помощь</Button>}><ContextPath items={[{ label: "Cloud", href: "#" }, { label: "Compute", href: "#" }, { label: "Виртуальные машины" }]} /></AppHeader>}
      aside={<div className="story-aside">Контекстная панель</div>}
    >
      <div className="story-content">
        <PageHeader title="Виртуальные машины" meta="12 ресурсов" actions={<Button variant="solid" leadingIcon={<Icon name="plus" size="inherit" />}>Создать</Button>} />
      </div>
    </AppShell>
  </div>,
};
