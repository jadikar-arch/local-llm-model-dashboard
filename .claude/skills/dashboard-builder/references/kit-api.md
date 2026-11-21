# Kit API (global `Kit`, file site/shared/kit.js, styles site/shared/theme.css)

Rows are long format `{period, geo, series, value}`.

| Call | Does |
|---|---|
| `Kit.mount({country, title, subtitle, topics:[{id,title,render}]})` | Builds header, theme toggle, topic tabs, footer. Loads `../data/<country>/<id>.json` and calls `render({el, data, Kit})`. |
| `Kit.uniq(rows, "geo")` | Sorted distinct values. |
| `Kit.pivot(rows, by="series")` | `{labels, names, map}`; `map[name]` = values aligned to `labels`. Filter rows to ONE geo first. |
| `Kit.latest(rows)` | Last non-null row by period. |
| `Kit.pct(a, b)` | Percent change from b to a (null-safe). |
| `Kit.fmt(n, {digits})` | Locale number format. |
| `Kit.kpi(parent, {label, value, unit, delta, note})` | KPI card; `delta` = percent change number; parent must be `<div class="grid kpis">`. |
| `Kit.chartCard(parent, {title, sub, span})` | Card with canvas; returns `{card, canvas}`. `span` 4/6/8/12 (12-column grid; parent `<div class="grid charts">`). |
| `Kit.chart(canvas, {type, labels, series:[{name,data}], unit, stacked, horizontal, area})` | `type`: line, bar, doughnut, radar. |
| `Kit.table(parent, {title, columns:[{key,label,fmt}], rows})` | Sortable + searchable. |
| `Kit.select(parent, {label, options, value, onChange})` | Filter control; parent `<div class="filters">`. |
| `Kit.insight(parent, html)` | Highlighted takeaway box. |
| `Kit.destroyAll()` | Destroy all charts (call at start of every redraw). |

Pattern for interactivity: keep state in variables, one `draw()` function that calls `Kit.destroyAll()`, clears the containers (`innerHTML = ""`) and rebuilds KPIs, charts and table. Filters call `draw()`.

CSS helpers: `.grid.kpis`, `.grid.charts`, `.card`, `.span-4/6/8/12`, `.filters`, `.insight`, `.pill`, `.sub`, `.footer`. Colors: `var(--c1)`..`var(--c6)`, `var(--accent)`, `var(--good)`, `var(--bad)`, `var(--muted)`.
