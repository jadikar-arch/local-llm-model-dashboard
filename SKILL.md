---
name: cbs-mcp-builder
description: Build a token-efficient FastMCP (Python) server for the CBS Dutch open data OData v4 API (datasets.cbs.nl/odata/v1). Use when creating, extending or debugging CBS data-extraction MCP tools.
---

# CBS OData → MCP server

Base URL: `https://datasets.cbs.nl/odata/v1`

## Phase 1 — Learn the API before writing code

Probe with `curl -s URL | head -c 1500`. Never dump full responses, and always add `$top=3`.

| Probe | URL |
|---|---|
| Service root | `/` → entity sets `Datasets`, `Catalogs`, `ReleaseCalendar` |
| Dataset list | `/Datasets?$top=3` and `/Catalogs` |
| One dataset | `/CBS/{id}` (try `83625NED`) |
| Dataset sets | `MeasureCodes`, `Dimensions`, `{Dim}Codes`, `{Dim}Groups`, `Observations`, `Properties` (singleton) |
| Observations | `/CBS/{id}/Observations?$top=3` |

Rules:
- **Code-set names vary per dataset.** Examples are `RegioSCodes` and `PeriodenCodes`. Read them from `/CBS/{id}` and `Dimensions`. Never hardcode them.
- Confirm which OData options work: `$filter`, `$select`, `$top`, `$skip`, `$count=true`, `$orderby`, and paging via `@odata.nextLink`.
- Write the findings to `NOTES.md` in 15 lines or fewer: field names, filter syntax that works, paging, and limits.
- **Stop.** Propose the tool list to the user and wait for approval.

## Phase 2 — Tools (the default set; adjust to the findings)

1. `search_datasets(query, catalog="CBS", limit=10)` returns `id, title, period` only.
2. `describe_dataset(id)` returns title, a short summary, measures (code→title), and dimensions with code-set names and value counts. It does not return the full code lists.
3. `list_codes(id, dimension, query=None, limit=50)` returns `code→title` lookups, such as finding `GM0363` for Amsterdam.
4. `get_observations(id, measures, filters: dict[dim, list[code]], limit=500)` returns tidy rows: `{dim titles..., measure, value}`.
5. Optional: `upcoming_releases(days=14)`, sourced from `ReleaseCalendar`.

## Token-efficiency rules (mandatory)

- Always send `$select` with only the needed fields. Never return raw OData envelopes.
- Strip `@odata.*` keys, nulls and empty strings, and map codes to titles server-side.
- Cap every tool with a `limit`. When a result is truncated, return `{"rows": [...], "truncated": true, "total": n, "hint": "narrow filters"}`.
- Require at least one filter in `get_observations` for large tables. Reject unfiltered calls with a helpful hint.
- Cache metadata (dimensions, codes, measures) in memory with `functools.lru_cache` or a TTL dict.
- Keep tool docstrings to 3 lines or fewer and make them say when to use the tool. Keep parameter descriptions short.
- Prefer compact rows (lists or CSV-like strings) over nested JSON for large results.

## Implementation

- Layout: `src/cbs_mcp/{server.py, client.py}` and `tests/`. Use uv, `fastmcp`, `httpx` (async), and the `respx` test library.
- `client.py` holds one shared `httpx.AsyncClient` with a timeout of 30s, retry on 429/5xx (3 attempts with backoff), and nextLink paging up to `limit`.
- Build `$filter` safely: `Dim eq 'X' or Dim eq 'Y'`, with values quoted and escaped. Verify the syntax against the live API.
- Return errors as short strings, e.g. `"Unknown dimension 'Regio'. Valid: RegioS, Perioden"`. Never return tracebacks.
- Run stdio by default, and HTTP via `--transport http`. **Never print to stdout**; log to stderr.
- `pyproject.toml`: `[project.scripts] cbs-mcp = "cbs_mcp.server:main"`.

## Verify (definition of done)

- `pytest` passes, with mocked HTTP plus one live smoke test marked `@pytest.mark.live`.
- `npx @modelcontextprotocol/inspector uvx --from . cbs-mcp` runs every tool successfully.
- An end-to-end check passes: "population of Amsterdam latest year" resolves in 4 or fewer tool calls, and each response is under about 2k tokens.
- The README has config snippets for Claude Code (`claude mcp add cbs -- uvx cbs-mcp`), VS Code (`.vscode/mcp.json`), OpenCode (`opencode.json`) and Cursor. Check each against its current docs.
