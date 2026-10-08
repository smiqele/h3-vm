import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ActivityIndicator,
  Avatar,
  Badge,
  Button,
  Checkbox,
  Icon,
  IconButton,
  MeterIndicator,
  Radio,
  Stack,
  Status,
  TextField,
  Tooltip,
  iconNames,
} from "@cloud/ui";

const meta = {
  title: "Primitives/Catalog",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Buttons: Story = {
  render: () => <div className="story-row">
    <Button variant="solid" leadingIcon={<Icon name="plus" size="inherit" />}>Создать</Button>
    <Button variant="soft">Настроить</Button>
    <Button variant="ghost" trailingIcon={<Icon name="chevron-down" size="inherit" />}>Действия</Button>
    <Button loading>Сохранить</Button>
    <IconButton icon="settings" label="Настройки" />
  </div>,
};

export const LabelsAndStatus: Story = {
  render: () => <div className="story-row">
    <Badge leadingIcon={<Icon name="cloud" size="inherit" />}>Cloud</Badge>
    <Badge mono>vm-01-prod</Badge>
    <Status tone="positive">Работает</Status>
    <Status tone="progress" animated>Создаётся</Status>
    <Status tone="warning" icon="triangle-alert">Требует внимания</Status>
    <Status tone="danger">Ошибка</Status>
  </div>,
};

export const FormControls: Story = {
  render: () => <div className="story-column">
    <TextField label="Название виртуальной машины" placeholder="vm-production-01" />
    <TextField label="IP-адрес" defaultValue="10.0.0.12" error="Адрес уже занят" />
    <label className="story-field"><Checkbox defaultChecked /><span>Автоматические резервные копии</span></label>
    <label className="story-field"><Checkbox indeterminate /><span>Выбрана часть ресурсов</span></label>
    <div className="story-row">
      <label className="story-field"><Radio name="region" defaultChecked /><span>Москва</span></label>
      <label className="story-field"><Radio name="region" /><span>Казань</span></label>
    </div>
  </div>,
};

export const Indicators: Story = {
  render: () => <div className="story-row">
    <Avatar label="Анна Смирнова" />
    <ActivityIndicator level={0.6} label="Средняя активность" />
    <div style={{ width: 160 }}><MeterIndicator level={0.72} label="Занято 72%" /></div>
    <MeterIndicator appearance="ring" level={0.72} label="Занято 72%" />
    <Tooltip content="Дополнительная информация"><Button variant="ghost">Наведи на меня</Button></Tooltip>
  </div>,
};

export const Icons: Story = {
  render: () => <div className="story-row" style={{ maxWidth: 720 }}>
    {iconNames.map((name) => <Tooltip key={name} content={name} delay={0}><Icon name={name} label={name} /></Tooltip>)}
  </div>,
};

export const Spacing: Story = {
  render: () => <Stack gap={16}>
    <Badge>Первый элемент</Badge>
    <Badge>Второй элемент</Badge>
    <Badge>Третий элемент</Badge>
  </Stack>,
};
