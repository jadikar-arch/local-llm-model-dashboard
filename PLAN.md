# Overnight plan: qwen3-coder:30b builds 3 interactive Europa dashboards, unattended

## 1. Design decisions (why it is built this way)
| Problem with a 30B local model | What the plan does |
|---|---|
| ~64k usable context; Claude Code's own prompt and the MCP tool schemas eat 15-20k | **One fresh `claude -p` session per task** (driver loop). State lives on disk (`tasks.md`, `PROGRESS.md`, git), not in the conversation. Unused europa tools are disallowed to shrink the schema. |
| Drifts, forgets, wanders on open-ended goals | Tasks are tiny and typed (DATA, SHELL, TOPIC, QA, POLISH). Each has a 10-line procedure file and a copy-me template. |
| Cannot see images (qwen3-coder is text-only) | `scripts/qa.mjs` drives headless Chromium and prints PASS/FAIL facts (charts drawn, KPIs, console errors, overflow at 1440 and 390px, filter interaction). Playwright MCP is used in text mode (`browser_snapshot`, `browser_evaluate`). Screenshots are saved to `qa/` for YOU in the morning. |
| Claims "done" when it is not | **Objective gates in the driver**: `validate_data.py` for data, `node --check` for JS, `qa.mjs` for pages. A task is only ticked when the gate passes AND the model says `TASK_DONE`. Failure output is fed back into the next attempt. |
| Gets stuck in loops | Max 3 attempts per task, then `[!]` blocked and the queue moves on; per-attempt timeout 45 min; 9 h global deadline. |
| Weak UI taste / inconsistent code | Pre-built design system (`theme.css`) and `Kit` (KPIs, charts, filters, table, dark mode). The model assembles, it does not invent a framework. |
| Might invent numbers | Hard rule: numbers only from europa tool results; `story` text must match the rows; otherwise `TASK_BLOCKED`. |

## 2. One-time setup before sleeping (about 3 minutes)
1. Quit the Ollama menubar app, then in a terminal tab that stays open:
   ```
   OLLAMA_CONTEXT_LENGTH=65536 OLLAMA_KEEP_ALIVE=-1 OLLAMA_FLASH_ATTENTION=1 OLLAMA_KV_CACHE_TYPE=q8_0 ollama serve
   ```
   (18 GB model + ~3.5 GB KV cache fits in 32 GB. If the Mac swaps, use 49152.)
2. Plug in power. Open a second terminal tab:
   ```
   cd /Users/munirdin/Documents/local-llm-model-dashboard
   bash scripts/run-overnight.sh
   ```
   The script keeps the Mac awake (`caffeinate`), starts the web server on :8000, makes branch `overnight/<time>`, commits after every attempt, never pushes.
3. Optional dry run: `DEADLINE_HOURS=0.2 bash scripts/run-overnight.sh` and check `logs/` for the first task.

## 3. Work breakdown (queue in `tasks.md`)
- **T00 SMOKE**: the kit was written but never run in a browser; the model smoke-tests it with demo data and fixes bugs first.
- **Per country (NL, EU, DE)**, 9 tasks each: 3x DATA (real data via europa MCP) -> SHELL -> 3x TOPIC -> QA -> POLISH. Every country ends as a finished, tested dashboard before the next starts, so a late failure never loses earlier work.
- **Topics (hype topics, with fallbacks inside the task text)**
  - NL: housing crisis, energy transition (solar), cost of living (CPI)
  - EU: enterprise AI adoption, renewable energy share, inflation (HICP)
  - DE: electric cars and car industry, Energiewende power mix, inflation and wages
- **HOME-1** landing page, **FIN-1** regression over all pages, **FIN-2** `RESULTS.md` + cleanup of demo files.

## 4. Per-topic minimum ("professional" bar, checked by qa.mjs)
3+ KPI cards with change vs previous period, 2+ charts (trend + comparison), region/measure filter that redraws everything, sortable and searchable table, insight sentence from real numbers, source and licence footer, dark mode toggle, responsive at 390px, zero console errors.

## 5. Morning checklist for you
1. `cat logs/SUMMARY.md` (done / blocked / open) and `tail -30 PROGRESS.md`.
2. `python3 -m http.server 8000`, open http://localhost:8000/site/index.html.
3. Look at `qa/*.png` screenshots (full-page, desktop and mobile) for visual judgement the model could not do.
4. `git log --oneline` on the overnight branch; merge or cherry-pick what you like.
5. For a Claude-grade visual review afterwards, ask me to look at the screenshots and write a polish list for a second local run.

## 6. Known risks (honest)
- The shared kit and `qa.mjs` were written but **not executed** (the sandbox blocked starting a local web server while I wrote them). T00 exists to catch this; if T00 ends `[!]`, fix the kit first.
- `find_data` may rank unexpected datasets; the DATA procedure picks by rule and logs the choice in `PROGRESS.md`. Check dataset ids in `RESULTS.md`.
- Destatis tools are not exposed in the local europa server; DE tasks have Eurostat `geo=DE` fallbacks.
- Env vars `CLAUDE_CODE_AUTO_COMPACT_WINDOW` / `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` may be ignored by your Claude Code version; the per-task fresh session (`--max-turns 70`) is the real context guard.
- Local-model speed: about 20-40 tokens/s means a full run is roughly 6-9 hours; the 9 h deadline is a ceiling, not a target.
