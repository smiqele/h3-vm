---
status: in-review
accuracy: reviewed
alignment: aligned
reviewedAt: 2026-09-23
---
# Документация облачной платформы

Документация описывает продуктовую модель облачной платформы и её интерфейсную проекцию. Начните с [обзора продукта](/docs/product/overview), затем используйте архитектуру продукта, документы доменов и исполняемые спецификации.

## Основные документы

- [Обзор продукта](/docs/product/overview)
- [Архитектура продукта](/docs/product/architecture)
- [Модель сущностей продукта](/docs/product/data-model)
- [Открытые вопросы архитектуры](/docs/product/open-questions)
- [Биллинг](/docs/domains/billing)
- [UI-референсы](/docs/ui/ui-reference)
- [Виртуальные машины](/docs/domains/compute/virtual-machines)
- [Управляемые базы данных](/docs/domains/databases/managed-databases)
- [Обзор UX-слоя](/docs/ux/overview)
- [Принципы компонентов](/docs/ui/component-principles)
- [Инструкции для агентов](/docs/agents/overview)

## Живые представления

Design Lab и прототипы используют реальные компоненты из `packages/ui` и данные публичных API пакетов. Design Lab показывает UI, UX, backlog и Markdown-документы. Приложение прототипов исполняет продуктовые экраны и состояния.

Основные маршруты:

- `/compute/vms` в приложении прототипов — экран ВМ;
- `/ui/foundation/variables` — темы и переменные;
- `/ui/components/button` — документация компонента;
- `/ux/patterns` — общие UX-паттерны;
- `/ux/screens` — собранный каталог экранов;
- `/ux/cjm` — customer journeys;
- `/backlog` — задачи и гипотезы.

## Структура источников

- `packages/ui` — компоненты, tokens и UI-контракты;
- `packages/docs/product` — обзор, архитектура и открытые вопросы продукта;
- `packages/docs/domains` — ресурсы, экраны, сценарии и данные конкретных доменов;
- `packages/docs/domains/navigation.yaml` — пункты меню консоли и их связь с экранами;
- `packages/docs/ux/patterns.yaml` — общие UX-паттерны;
- `packages/docs/ui/resource-statuses.yaml` — интерфейсное представление ресурсных статусов;
- `packages/backlog` — гипотезы и исполнимые задачи;
- `packages/docs` — переносимый источник документов и канонических YAML-спецификаций;
- `packages/console-runtime` — сгенерированный API модели для приложений.

Markdown не должен пересказывать YAML. Markdown хранит смысл, цели и причины; YAML — исполняемые сущности и связи.

## Статус документов

Каждый Markdown-файл имеет обязательные метаданные:

- `status`: `draft`, `in-review`, `approved` или `deprecated`;
- `accuracy`: `unverified`, `reviewed` или `verified`;
- `alignment`: `unknown`, `partial` или `aligned`;
- `reviewedAt`: дата содержательной проверки или `null`.

`status` показывает зрелость текста. `accuracy` — степень проверки изложенных фактов. `alignment` — соответствие текущим YAML, коду и прототипам. Генератор отклоняет документ без этих полей.

## Проверка

`npm run check` генерирует производные данные, выполняет typecheck, проверяет specification graph, документацию компонентов и контраст. Проверка структуры не заменяет содержательный review: это различие явно отражено в статусе документа.
