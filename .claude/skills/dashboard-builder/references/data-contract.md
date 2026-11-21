# Data JSON contract: `site/data/<country>/<topic>.json`

```json
{
  "title": "Existing home prices, NL",
  "unit": "index 2015=100",
  "source": "CBS StatLine 83913NED",
  "source_url": "https://opendata.cbs.nl/#/CBS/nl/dataset/83913NED",
  "licence": "CC BY 4.0",
  "units": {"optional per-series unit": "% or EUR or index"},
  "fetched": "2026-11-21",
  "story": "1-3 plain sentences with real numbers read from the rows, e.g. Prices rose 7% in 2024 after a dip in 2023.",
  "rows": [
    {"period": "2024-03", "geo": "NL", "series": "Price index", "value": 154.2}
  ],
  "sets": { "optional_second_table": [ {"period": "2024", "geo": "NL", "series": "Permits", "value": 61000} ] }
}
```

Rules
- `rows` is LONG format. `period`: `2021`, `2021-03` or `2021Q1`. Convert CBS `2021MM03` -> `2021-03`, `2021KW01` -> `2021Q1`, `2021JJ00` -> `2021`.
- `geo`: short readable name or ISO code (`NL`, `DE`, `Amsterdam`, `Noord-Holland`). `series`: the measure or category, short English label.
- `value`: number or null. Never strings, never "12,3". Percent as plain number (12.3) with unit "%".
- 40-250 rows (min 20, max 600). At least 4 distinct periods, at least 2 distinct geo OR 2 distinct series (so filters and comparisons have something to do).
- `fetched`: today's date from `date +%F`. `licence`: from the tool result footer ("source:" line); if absent write `Open data, see source`.
- `story`: write it AFTER looking at the final rows, using real numbers. Check it by computing with python.
- Save with a single `Write` call (one row per line keeps it readable), then validate: `python3 scripts/validate_data.py site/data/<c>/<topic>.json`.
