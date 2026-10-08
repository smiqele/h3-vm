---
status: approved
accuracy: verified
alignment: aligned
reviewedAt: 2026-09-23
---
# Стандарт страницы компонента

Это обязательный контракт страниц компонентов в Design Lab. Каждая страница строится через общий `ComponentDocumentation` и содержит ровно три верхнеуровневые вкладки.

```text
Component page
├── Preview
│   ├── Canvas
│   │   └── Theme tabs + Reset
│   ├── Interaction feedback, когда применимо
│   └── Properties
├── Design
│   ├── Purpose и границы применения
│   ├── Variants, anatomy и states
│   ├── Geometry, behavior и content
│   ├── Accessibility и tokens
│   └── Related components
└── Code
    ├── Import и синхронизированный пример
    ├── Props, events и state model
    ├── Composition и recipes
    └── Limitations
```

## Preview

- Показывает один управляемый экземпляр, а не галерею.
- Не содержит intro, подпись `PREVIEW` или отдельный заголовок Properties.
- В правом верхнем углу находятся компактные theme controls: системная (`pc-case`), светлая (`sun`) и тёмная (`moon`), затем ghost Button «Сбросить».
- Выбранная тема сообщает состояние через `aria-pressed`.
- Preview получает полный изолированный набор semantic и component tokens. `data-preview-theme` всегда содержит разрешённое значение `light` или `dark`; системный режим явно вычисляет текущую тему Design Lab.
- Properties содержит только полезные публичные props: string — input, boolean — checkbox, enum — select, icon — реестр иконок.
- Reset возвращает props и тему к утверждённым начальным значениям.
- Код во вкладке Code получает значения из того же локального состояния.

## Design

Design объясняет, как выбрать и правильно использовать компонент. Здесь находятся статические варианты, purpose, when to use или avoid, anatomy, применимые states, geometry, behavior, content, accessibility, tokens и related components.

Сведения о публичных props, геометрии, состояниях и доступности интерактивного компонента нельзя убирать. Близкие разделы можно объединить, если компонент прост.

## Code

- Первый пример минимален и синхронизирован с Preview.
- Props table содержит имя, тип, значение по умолчанию и описание.
- Для stateful-компонента описываются events и controlled или uncontrolled модель.
- Для составного компонента документируется composition API.
- Нестандартные ограничения и accessibility-обязательства указываются явно.

## Источники истины

- Публичный API: TypeScript-интерфейс компонента.
- Варианты, состояния и правила: `packages/ui/components.yaml`.
- Геометрия и цвета: `packages/ui/tokens/`.
- Структура страницы: `ComponentDocumentation`.
- Покрытие каталога: `apps/design-lab/src/lib/component-documentation.json`.

Страница не создаёт собственные tabs или panels и не копирует component values в локальный CSS документации.
