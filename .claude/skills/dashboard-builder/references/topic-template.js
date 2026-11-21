// TEMPLATE for site/<country>/topics/<topic>.js. Copy it, rename TEMPLATE, adapt labels and units. Keep under ~150 lines.
window.Topics = window.Topics || {};
Topics.TEMPLATE = function ({ el, data, Kit }) {
  const rows = data.rows;
  const geos = Kit.uniq(rows, "geo");
  const seriesList = Kit.uniq(rows, "series");
  let geo = geos[0];
  let series = seriesList[0];

  const filters = Kit.$('<div class="filters"></div>');
  const kpis = Kit.$('<div class="grid kpis"></div>');
  const charts = Kit.$('<div class="grid charts"></div>');
  el.append(filters, Kit.$(`<div class="insight">${data.story}</div>`), kpis, charts);

  function draw() {
    Kit.destroyAll(); kpis.innerHTML = ""; charts.innerHTML = "";
    const mine = rows.filter((r) => r.geo === geo && r.series === series).sort((a, b) => (a.period < b.period ? -1 : 1));
    const vals = mine.filter((r) => r.value != null);
    if (!vals.length) { charts.innerHTML = '<div class="empty">No data for this selection.</div>'; return; }
    const last = vals[vals.length - 1], prev = vals[vals.length - 2];
    const peak = vals.reduce((m, r) => (r.value > m.value ? r : m), vals[0]);
    const avg = vals.reduce((s, r) => s + r.value, 0) / vals.length;

    // 4 KPI cards
    Kit.kpi(kpis, { label: `Latest (${last.period})`, value: last.value, unit: data.unit, delta: prev ? Kit.pct(last.value, prev.value) : null, note: "vs previous" });
    Kit.kpi(kpis, { label: "Peak", value: peak.value, unit: data.unit, note: peak.period });
    Kit.kpi(kpis, { label: "Average", value: avg, unit: data.unit });
    Kit.kpi(kpis, { label: "Periods covered", value: vals.length, unit: `${vals[0].period} to ${last.period}`, digits: 0 });

    // Chart 1: trend of selected geo (all series if few, else the selected one)
    const geoRows = rows.filter((r) => r.geo === geo);
    const p = Kit.pivot(seriesList.length <= 4 ? geoRows : mine);
    let c = Kit.chartCard(charts, { title: `Trend: ${geo}`, sub: `${data.unit}, ${vals[0].period} to ${last.period}`, span: 8 });
    Kit.chart(c.canvas, { type: "line", labels: p.labels, series: p.names.map((n) => ({ name: n, data: p.map[n] })), unit: data.unit, area: p.names.length === 1 });

    // Chart 2: compare geos at the latest period of the selected series
    const cmp = geos.map((g) => ({ g, r: Kit.latest(rows.filter((r) => r.geo === g && r.series === series)) })).filter((x) => x.r).sort((a, b) => b.r.value - a.r.value);
    c = Kit.chartCard(charts, { title: `Compare: ${series}`, sub: `Latest period per region, ${data.unit}`, span: 4 });
    Kit.chart(c.canvas, { type: "bar", horizontal: true, labels: cmp.map((x) => x.g), series: [{ name: series, data: cmp.map((x) => x.r.value) }], unit: data.unit });

    // Table of the selection
    Kit.table(charts, { title: "Data", columns: [{ key: "period", label: "Period" }, { key: "geo", label: "Region" }, { key: "series", label: "Measure" }, { key: "value", label: data.unit, fmt: (v) => Kit.fmt(v, { digits: 2 }) }], rows: rows.filter((r) => r.series === series), span: 12 });
  }

  if (geos.length > 1) Kit.select(filters, { label: "Region", options: geos, value: geo, onChange: (v) => { geo = v; draw(); } });
  if (seriesList.length > 1) Kit.select(filters, { label: "Measure", options: seriesList, value: series, onChange: (v) => { series = v; draw(); } });
  draw();
};
