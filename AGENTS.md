# Repository agent instructions

Changes to `packages/ui` or `apps/design-lab` must follow:

- `packages/docs/agents/component-documentation.md`
- `packages/docs/agents/tokens.md`

When a public prop, variant, state, behavior, or component token changes, update the matching Design Lab documentation in the same change. Run `npm run docs:check` and `npm run check` before finishing.

Do not build a component documentation page with bespoke tabs or tab panels. Use the shared `ComponentDocumentation` shell. Preview contains one configurable component instance; static variant galleries belong in Design.
