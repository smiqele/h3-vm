"use client";

import { useState } from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  Icon,
} from "@cloud/ui";
import { GenericComponentDocs, type ComponentSpec } from "./GenericComponentDocs";
import styles from "./DropdownMenuShowcase.module.css";

function MenuExamples() {
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(false);

  return <div className={styles.examples}>
    <article><h3>Базовое</h3><DropdownMenu trigger={<Button variant="ghost">Открыть</Button>}>
      <DropdownMenuLabel>Проект</DropdownMenuLabel>
      <DropdownMenuItem>Настройки</DropdownMenuItem>
      <DropdownMenuItem>Участники</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem destructive>Удалить проект</DropdownMenuItem>
    </DropdownMenu></article>

    <article><h3>Иконки и shortcuts</h3><DropdownMenu trigger={<Button variant="ghost">Действия</Button>}>
      <DropdownMenuGroup>
        <DropdownMenuItem leading={<Icon name="copy" size="sm" />} trailing={<DropdownMenuShortcut>⌘C</DropdownMenuShortcut>}>Копировать</DropdownMenuItem>
        <DropdownMenuItem leading={<Icon name="settings" size="sm" />} trailing={<DropdownMenuShortcut>⌘,</DropdownMenuShortcut>}>Настройки</DropdownMenuItem>
        <DropdownMenuItem leading={<Icon name="archive" size="sm" />} disabled>Архивировать</DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenu></article>

    <article><h3>Выбор</h3><DropdownMenu trigger={<Button variant="ghost">Уведомления</Button>}>
      <DropdownMenuItem selected={notifications} closeOnSelect={false} onClick={() => setNotifications(value => !value)} trailing={notifications ? <Icon name="check" size="sm" /> : undefined}>Уведомления</DropdownMenuItem>
      <DropdownMenuItem selected={sound} closeOnSelect={false} onClick={() => setSound(value => !value)} trailing={sound ? <Icon name="check" size="sm" /> : undefined}>Звук</DropdownMenuItem>
    </DropdownMenu></article>

    <article><h3>Drag · меню колонок</h3><p>Рабочий вариант встроен в пример Data Table: пункты выбираются всей строкой, а порядок меняется за grip.</p></article>
  </div>;
}

export function DropdownMenuShowcase({ spec }: { spec: ComponentSpec }) {
  return <GenericComponentDocs
    spec={spec}
    example={<MenuExamples />}
    code={'<DropdownMenu trigger={<Button variant="ghost">Открыть</Button>}><DropdownMenuItem>Пункт</DropdownMenuItem></DropdownMenu>'}
  />;
}
