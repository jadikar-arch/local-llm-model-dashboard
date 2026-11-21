# Europa dashboards: rules for the unattended local model

You are a small local model with a ~64k token window, running headless and alone. Every session = ONE task from `tasks.md` (the driver gives it to you). Nobody answers questions. Decide, act, verify.

## Hard rules
1. **Never ask the user anything.** Pick the sensible default, note it in `PROGRESS.md`, continue.
2. **Numbers come only from the europa MCP tools, in THIS session.** DATA tasks fetch real data with `mcp__europa__*` (find_data, cbs_*, eurostat_*, govdata_table) and copy values unchanged into `site/data/<country>/<topic>.json`. Never invent, estimate, mock, sample or compute data values; no web search, no memory. An automatic check compares your JSON with the tool results and rejects anything that does not match. UI code (topics, shell) never contains data numbers: it reads `data.rows`. Only DATA tasks may write `site/data/*`.
3. **Small steps, small files.** Max ~150 lines per file. Write one file, check it, then the next. Never paste a whole file back to yourself. Use `Edit` for changes, not rewrites.
4. **Do not read big things.** Never open `site/shared/vendor/*`, `package-lock.json`, `node_modules`, `logs/*`, or whole data JSON files (use `head -c 600` or `python3 -c` to peek). Read only the files your task type names.
5. **Stay in your lane.** Touch only files for your task. Do not change `site/shared/kit.js`, `theme.css` or `scripts/*` unless your task says so (SMOKE/QA may fix kit bugs surgically).
6. **You cannot see images.** Judge pages with `node scripts/qa.mjs <country>` and the Playwright MCP text tools (`browser_snapshot`, `browser_evaluate`, `browser_console_messages`). Never call a screenshot tool and try to interpret it.
7. **Offline-safe.** No CDN links. Use only `site/shared/vendor/chart.umd.min.js` and `site/shared/kit.js`. No npm frameworks, no build step: plain HTML, CSS, JS.
8. **No git push, no sudo, no deleting outside `site/`, `qa/`, `logs/`, `.state/`.** The driver commits for you.
9. Finish by appending 3 lines to `PROGRESS.md` and ending your final message with exactly `TASK_DONE` or `TASK_BLOCKED`. Write that word in your reply; never run `echo TASK_DONE`. Do not edit anything under `.claude/`, `scripts/`, `tasks.md` or `CLAUDE.md`: the driver reverts it and logs a violation.

## Where things are
- Data files: `site/data/nl|eu|de/*.json` (written by DATA tasks). Peek with python (`print` keys and 3 rows), never read whole.
- Task procedure: `.claude/skills/dashboard-builder/references/task-<type>.md` (read it first, it is short)
- Kit API cheat sheet: `.claude/skills/dashboard-builder/references/kit-api.md`
- Data JSON contract: `.claude/skills/dashboard-builder/references/data-contract.md`
- Copy-me examples: `references/topic-template.js`, `references/shell-template.html`, `references/app-template.js`
- Site: `site/<nl|eu|de>/index.html`, `site/<c>/topics/*.js`, `site/data/<c>/*.json`, shared kit in `site/shared/`
- Dev server runs at http://localhost:8000 (driver started it). Dashboards: `/site/nl/index.html` etc.

## Debug loop (use it, do not guess)
`node scripts/qa.mjs nl` prints only FAIL lines plus a verdict. Fix the first FAIL, rerun. If the same FAIL survives 3 fixes, simplify the code instead of patching it again.
