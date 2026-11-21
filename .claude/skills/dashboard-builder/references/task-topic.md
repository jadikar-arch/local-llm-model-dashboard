# TOPIC task (one tab: KPIs, charts, filter, table, insight)
1. Peek at the data (do not read all): `python3 -c "import json;d=json.load(open('site/data/<c>/<topic>.json'));print({k:d[k] for k in d if k!='rows'});print(d['rows'][:3]);print(sorted({r['geo'] for r in d['rows']}),sorted({r['series'] for r in d['rows']}))"`. The data is final: do not edit it. Note `data.units` (unit per series) and which series/geos exist.
2. Read `references/topic-template.js` and `references/kit-api.md`.
3. Copy the template to `site/<c>/topics/<topic>.js`, rename `Topics.TEMPLATE` to `Topics.<topic>`. Adapt: chart titles/subtitles with real units, which series to plot, KPI labels. Add ONE extra visual that suits this topic (stacked bar of categories, doughnut of shares, or a second line). Keep it under ~150 lines.
4. Make sure `site/<c>/index.html` has `<script src="topics/<topic>.js">` and that `app.js` lists the topic.
5. `node --check site/<c>/topics/<topic>.js`; then `node scripts/qa.mjs <c>` and read only the FAIL lines that mention this topic tab. Fix until this tab has no FAIL (other tabs may still fail).
