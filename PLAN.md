# Research run 3: can qwen3-coder:30b (local) build 3 data dashboards completely alone?

## 0. What this experiment measures
Question: how far does a local 30B model get, unattended, from "find open data" to "finished interactive dashboard"?
The local model does **everything inside the pipeline itself**:
1. choose and fetch real data with the europa MCP (CBS / Eurostat / Destatis),
2. write the data JSON, 3. build the page shell, 4. build 3 topic tabs per country, 5. test with Playwright and fix, 6. polish.
Claude (me) does **no data work and no UI work in this run**. Claude only built the harness (see section 2) and will read the results afterwards.

### What was prepared by Claude beforehand (disclose this when reporting results)
| Prepared by Claude | Why it is allowed | Not prepared by Claude |
|---|---|---|
| `site/shared/kit.js`, `theme.css`, vendored Chart.js (design system, kept from run 2) | so a 30B model is judged on assembling a good dashboard, not on inventing a chart library | any data, any country page, any topic file |
| task procedures and templates in `.claude/skills/dashboard-builder/` | small models need 10-line procedures | dataset choice (the model chooses; the task text only names the topic and fallbacks) |
| automatic gates (`validate_data.py`, `check_provenance.py`, `check_topic.py`, `qa.mjs`) | objective pass/fail instead of trusting "done" | |
Run 2 (UI built by the model on data fetched by Claude) is archived in git tag `archive/run2-claude-data` and `archive-run2-local/`. Run 1 failed because the model invented data.

## 1. Constraints of a local 30B model and what the harness does
| Problem | Mitigation |
|---|---|
| ~64k context, Claude Code prompt costs ~10k | One fresh `claude -p` session per task (driver loop). State lives on disk: `tasks.md`, `PROGRESS.md`, git. Max 60 turns for DATA, 45 for others. |
| Drifts on open goals | 30 small typed tasks (DATA, SHELL, TOPIC, QA, POLISH, HOME, DOCS), each with a procedure file. |
| Cannot see images | `scripts/qa.mjs` (headless Chrome) prints PASS/FAIL facts; Playwright MCP is used in text mode. Screenshots go to `qa/` for the human. |
| Says "done" when it is not | A task is accepted only if the gate passes AND the final message ends with `TASK_DONE`. Failure text is fed into the next attempt. 3 attempts, then `[!]` blocked. |
| **Invents data** (run 1) | Provenance gate, section 3. Web tools are denied in `.claude/settings.json`. |
| Gets stuck | 45 min timeout per attempt, 9 h global deadline. A TOPIC task whose data file is missing is blocked immediately. |

## 2. Setup (3 minutes, before sleeping)
1. Terminal A (stays open), Ollama with the long context:
   `OLLAMA_CONTEXT_LENGTH=65536 OLLAMA_KEEP_ALIVE=-1 OLLAMA_FLASH_ATTENTION=1 OLLAMA_KV_CACHE_TYPE=q8_0 ollama serve`
2. Mac on power. Terminal B:
   `cd /Users/munirdin/Documents/local-llm-model-dashboard && bash scripts/run-overnight.sh`
3. The driver: keeps the Mac awake, serves http://localhost:8000, creates branch `overnight/<time>` from `research/run3-model-fetches-data`, commits after every attempt, never pushes.
4. Watch the first 15 minutes: the first line to wait for is `=== NL-D1 ... DONE` or `not accepted`. `tail -f logs/driver.log`.
Verified before handover: the local model connects to the europa MCP in headless mode, calls `find_data` and receives real results (probe, 57 s).

## 3. Data provenance gate (the key change from run 1)
Every session is recorded as stream-json in `logs/<ID>-attemptN.jsonl`. After a DATA task, `check_provenance.py`:
- takes only results of `mcp__europa__*` tools (Bash/Read output does not count, so typed-in numbers cannot vouch for themselves),
- requires >= 90% of the distinct row values to appear in those results (exact or equal after rounding to the digits kept),
- requires the dataset id in `source` to appear in the results, and at least one real data call.
Tested: real data passes; fully fabricated, half fabricated, and Bash-echoed numbers all fail.
Known limits (the gate cannot catch these): wrong dataset for the topic, wrong unit label, values copied correctly but assigned to the wrong period/region, misleading `story` wording. The human review in the morning covers these.

## 4. Work breakdown (queue in `tasks.md`, 30 tasks, strict order)
Per country (NL, EU, DE): `D1 D2 D3` (data, one per topic) -> `S1` (page shell) -> `V1 V2 V3` (topic tabs) -> `Q` (QA fixing) -> `P` (polish). Then `HOME-1` (landing page), `FIN-1` (regression over all pages), `FIN-2` (`RESULTS.md`).
Each country is finished before the next starts, so a late failure never loses earlier work.
| Country | Topic brief (the model picks the exact table; fallbacks are in the task text) |
|---|---|
| NL | housing crisis, energy transition, cost of living (CBS tools) |
| EU | enterprise AI adoption, renewable energy share, inflation (Eurostat) |
| DE | electric cars and car industry, Energiewende power mix, inflation and wages (Destatis via find_data/govdata_table, Eurostat fallback) |

## 5. Accepted deliverable per task (objective)
- DATA: valid JSON per `data-contract.md` (20-600 rows, >= 4 periods, real units, story from the numbers) + provenance OK.
- SHELL: page and `app.js` exist, `node --check` passes.
- TOPIC: file defines `Topics.<id>`, reads `data.rows`, no hard-coded number arrays, <= 260 lines.
- QA/POLISH: `qa.mjs` PASS at 1440 px and 390 px: exactly 3 tabs, >= 2 drawn charts, >= 3 KPIs, table rows, filter that redraws, insight box, no `undefined`/`NaN`, no overflow, zero console errors, no failed requests.

## 6. What gets recorded for the research (all in the repo or `logs/`)
- `logs/driver.log`: per task accepted / not accepted / blocked, attempts, timing.
- `logs/<ID>-attemptN.jsonl`: the complete tool-call trace; `logs/<ID>-attemptN.log`: final message + list of europa calls.
- `logs/SUMMARY.md`: done / blocked / open counts. `git log`: one commit per attempt.
- `PROGRESS.md`: the model's own notes (dataset ids, decisions).
- `qa/*.png`: screenshots for human judgement.
Suggested metrics: tasks accepted on attempt 1 vs later, blocked tasks by type, number of europa calls per DATA task, provenance failures (fabrication attempts), QA verdicts, time per task.

## 7. Morning checklist
1. `cat logs/SUMMARY.md; tail -30 PROGRESS.md; grep -E "DONE|not accepted|BLOCKED" logs/driver.log`
2. `python3 -m http.server 8000`, open http://localhost:8000/site/index.html (and /site/nl/, /site/eu/, /site/de/).
3. Look at `qa/*.png`; spot-check 3 numbers per dataset against the source link in each footer.
4. Ask Claude to review the screenshots and results, without letting it change the data or UI unless you say so.

## 8. Known risks (honest)
- Large europa tool results can fill the 64k context in a DATA task; the procedure tells the model to filter (<= ~250 rows). Look for `truncated = 1` in the Ollama log.
- The model may pick a table that fits the keywords but not the topic (not caught by the gate).
- Destatis tables are reached through `find_data` / `govdata_table`; the brief names Eurostat fallbacks for Germany.
- Local speed is ~28-30 tok/s: a full run is estimated at 6-9 h; the 9 h deadline is a ceiling.
- The harness itself (kit, gates) was written by Claude and may contain bugs; a failing gate on correct work is a harness bug, not a model failure. Check the gate output before judging the model.
