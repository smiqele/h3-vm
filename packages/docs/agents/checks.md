---
status: approved
accuracy: verified
alignment: aligned
reviewedAt: 2026-09-23
---
# Проверки и готовность

## Обязательные команды

```bash
npm run docs:check
npm run check
```

`docs:check` проверяет покрытие каталога, общий shell, вкладки Preview, Design и Code, theme controls и правила для агентов. `check` генерирует производные данные и tokens, выполняет typecheck приложений, проверяет specification graph, документацию и контраст.

## Визуальная проверка

- Preview показывает один экземпляр без обрезания и лишнего служебного текста.
- System, light и dark корректно переключают весь локальный theme scope.
- Reset возвращает props и тему.
- Controls работают, а Code меняется синхронно.
- Design и Code читаются на узком и широком viewport.
- Keyboard, focus и screen-reader semantics соответствуют публичному поведению.

## Definition of Done

- Реализация, YAML, tokens и документация согласованы.
- Страница использует `ComponentDocumentation`.
- Публичные props описаны.
- Design guidance соответствует реализации.
- Компонент проверен отдельно и в релевантном контексте.
- Автоматические проверки проходят без ошибок.
- Оставшиеся ограничения перечислены явно.
