# SMOKE task
1. `python3 scripts/make_demo_data.py` then `node scripts/qa.mjs demo`.
2. For each FAIL: open only the relevant function in `site/shared/kit.js` (use `grep -n` to find it, `Read` with offset/limit), fix with `Edit`, rerun.
3. Do not change the public API in `references/kit-api.md`. Done when `QA RESULT: PASS`.
4. Note any kit bug you fixed in PROGRESS.md (one line each).
