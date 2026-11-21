---
name: dashboard-builder
description: Build interactive, professional static dashboards from europa MCP open data (NL CBS, EU Eurostat, DE Destatis) using the shared Kit in site/shared. Use for any task listed in tasks.md of this repo.
---

# Dashboard builder (for a small local model)

Pipeline per country: **SHELL -> TOPIC x3 -> QA -> POLISH**, then HOME and final docs. Data is pre-built (read-only).

1. Open `tasks.md` task given to you. Read `references/task-<type>.md` for that type only.
2. Data is already in `site/data/<c>/<topic>.json` (long format, see `references/data-contract.md`). Never edit it.
3. UI is assembled from the Kit (`references/kit-api.md`). Copy `references/topic-template.js`; do not invent a new structure.
4. Verify objectively with `node scripts/qa.mjs <country>`; the Playwright MCP is for extra text-based inspection only.
5. Record decisions in `PROGRESS.md`, end with `TASK_DONE`.

Quality bar (what "professional" means here): consistent theme, sensible units and number formats, every chart titled with a subtitle that states unit and period, a plain-language insight sentence, KPI cards with change vs previous period, working filter, sortable table, responsive at 390px, dark mode works, source and licence in the footer.
