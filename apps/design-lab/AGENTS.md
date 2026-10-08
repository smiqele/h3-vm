<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Component documentation

Before creating, updating, or reviewing a component page, read `../../packages/docs/agents/component-documentation.md` completely and then the matching create, update, or audit workflow in that directory.

Every component page must use the shared `ComponentDocumentation` shell and its three-tab contract: Preview, Design, and Code. When a public prop, token, variant, state, or behavior changes, update every affected section and run `npm run docs:check`.
