# DATA task: fetch REAL data with the europa MCP tools and save it as JSON
Output: `site/data/<country>/<topic>.json` (format: `references/data-contract.md`). Read the task brief for the topic and the preferred tables.

## Your data tools (the ONLY allowed source of numbers)
`mcp__europa__find_data`, `cbs_search`, `cbs_describe`, `cbs_codes`, `cbs_data` (NL), `eurostat_search`, `eurostat_describe`, `eurostat_codes`, `eurostat_data` (EU, and any country), `govdata_search`, `govdata_table` (DE Destatis).
They may be deferred: if a tool name is not callable, run ToolSearch with query `select:mcp__europa__find_data` (or the tool you need) once.
No WebFetch, no WebSearch, no numbers from memory, no estimates.

## Steps
1. **Find**: use the search tool named in the brief (NL: `cbs_search`, EU: `eurostat_search` or `find_data`, DE: `find_data`). Pick ONE table that matches the brief; note its id.
2. **Describe**: `cbs_describe` / `eurostat_describe` on that id to see the dimensions (time, region, measure). Use `*_codes` to get exact codes for the filters you want. If the table is unusable (no recent periods, no values), try the next candidate; after 3 failed tables use the fallback in the brief.
3. **Fetch small**: call `cbs_data` / `eurostat_data` / `govdata_table` WITH filters (regions, measures, period range) so the result is at most ~250 rows. Never request a whole table. If the answer is huge or cut off, narrow the filters and call again.
4. **Write the JSON** with ONE `Write` call. Copy every `value` exactly as the tool returned it (same digits). Unavailable values are `null`, never filled in. Convert periods: `2021MM03`->`2021-03`, `2021KW01`->`2021Q1`, `2021JJ00`->`2021`. If series have different units add `"units": {"<series>": "<unit>"}` and keep `"unit"` for the main one.
5. **Story**: run a short python snippet that prints the first and last value, the change and the maximum per series; then `Edit` the `story` field with 1-3 sentences that use exactly those numbers.
6. **Check** (both must print OK; fix and rerun until they do):
   - `python3 scripts/validate_data.py site/data/<c>/<topic>.json`
   - `python3 scripts/check_provenance.py site/data/<c>/<topic>.json <session trace path given in your task prompt>`
   The provenance check compares every number with what the europa tools returned in THIS session. Numbers you typed, estimated, rounded differently, interpolated or computed will fail it. Re-call the data tool if you need the values again.
7. `PROGRESS.md`: append the dataset id, the filters you used and any fallback you took. Finish with `TASK_DONE`.

## Stop conditions
- A tool errors: read the message, fix the parameter, retry (max 3 times per tool), then switch table.
- Nothing usable after the fallback: do NOT invent data. End with `TASK_BLOCKED` and say why in `PROGRESS.md`.
