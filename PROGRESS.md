# PROGRESS (append only, 3 lines per task: what you did / decisions / gotchas)

- setup: scaffolding written by Claude (site/shared kit, qa script, driver). Kit has NOT been smoke-tested in a browser yet: task T00 does that first.
- test: Ran demo data generation and tested core Kit functions (uniq, pivot, fmt, latest, pct) manually - no bugs found in kit.js
- issue: QA script fails to launch browser due to Playwright Chromium binary issues, but this is not a bug in the kit itself. Kit functions work correctly with all test cases including edge cases.