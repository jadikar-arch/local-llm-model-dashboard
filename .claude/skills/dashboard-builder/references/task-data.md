# DATA task (fetch real numbers with the europa MCP, save one JSON)
Goal file: `site/data/<country>/<topic>.json`, contract in `references/data-contract.md`. Budget: about 12 tool calls.
1. Call `country_guide` with the country code (nl, eu or de) ONCE and skim the workflow lines.
2. Call `find_data` with a short topic phrase from your brief (English for eu, Dutch for nl, German for de). The user is asleep: do NOT wait for a choice. Choose the best candidate yourself: latest period within the last 2 years, at least 8 periods, a clear unit, breakdown by region or category. Note the dataset id.
3. Describe it (`cbs_describe` / `eurostat_describe` / matching tool) to learn dimensions. Use `*_codes` to look up the codes you want. Never pull everything: filter to 2-5 regions or categories and a period range.
4. Fetch with `*_data` using filters and a row limit (<= 300). Check the "fixed:" line (unit, sex, age) and the dataset title to make sure it answers the brief.
5. If the first dataset fails or is wrong, try the next find_data candidate (max 3 candidates, then use the fallback in the brief, else TASK_BLOCKED).
6. Convert to long rows (period/geo/series/value) mentally or with a short python script written to `.state/convert_<topic>.py` (inputs pasted as a python literal). Save the JSON with one `Write`.
7. Compute 1-3 facts from the saved rows with python (change, peak, ranking) and write the `story` field from them. Facts must match the rows.
8. `python3 scripts/validate_data.py site/data/<country>/<topic>.json`. Fix until `OK`.
9. PROGRESS.md: dataset id, filters used, unit, period range.
