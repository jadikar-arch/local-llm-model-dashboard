# QA task
1. `node scripts/qa.mjs <c>`. Fix the first FAIL, rerun. Typical causes: console error (typo, wrong field), canvas not drawn (empty data after a filter), tiny canvas (missing `.chart-box` height), undefined/NaN text (null value passed to fmt), overflow at 390px (wide table: wrap in `.table-scroll`).
2. Then a manual pass with the Playwright MCP: `browser_navigate` to http://localhost:8000/site/<c>/index.html, `browser_snapshot` (text tree), click each tab with `browser_click`, change a filter, `browser_console_messages`. Fix anything odd.
3. Finish only when `QA RESULT: PASS`. If a single check is impossible to satisfy for a good reason, explain it in PROGRESS.md and make the smallest honest fix.
