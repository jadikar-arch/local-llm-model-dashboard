// Artificial Intelligence topic for EU dashboard
window.Topics = window.Topics || {};
Topics.ai = function ({ el, data, Kit }) {
  const rows = data.rows;
  const geos = Kit.uniq(rows, "geo");
  const seriesList = [...new Set(rows.map((r) => r.series))];           // keep file order
  const unitOf = (s) => (data.units && data.units[s]) || data.unit;
  let geo = geos[0];
  let series = seriesList[0];

  const filters = Kit.$('<div class="filters"></div>');
  const kpis = Kit.$('<div class="grid kpis"></div>');
  const charts = Kit.$('<div class="grid charts"></div>');
  // Adding second insight with specific data point
  const additionalInsight = "The largest year-over-year increase was seen in 2024 (+6.47 percentage points) when the adoption rate rose from 13.48% to 19.95%.";
  el.append(filters, Kit.$(`<div class="insight">${data.story}</div>`), Kit.$(`<div class="insight">${additionalInsight}</div>`), kpis, charts);

  function draw() {
    Kit.destroyAll(); kpis.innerHTML = ""; charts.innerHTML = "";
    const unit = unitOf(series);
    const mine = rows.filter((r) => r.geo === geo && r.series === series && r.value != null).sort((a, b) => (a.period < b.period ? -1 : 1));
    if (!mine.length) { charts.innerHTML = '<div class="empty">No data for this selection. Try another region or measure.</div>'; return; }
    const last = mine[mine.length - 1], prev = mine[mine.length - 2];
    const peak = mine.reduce((m, r) => (r.value > m.value ? r : m), mine[0]);
    const avg = mine.reduce((s, r) => s + r.value, 0) / mine.length;

    const isRate = /%/.test(unit);   // rates change in percentage points, everything else in percent
    Kit.kpi(kpis, { label: `Latest adoption rate (${last.period})`, value: last.value, unit, delta: prev ? (isRate ? last.value - prev.value : Kit.pct(last.value, prev.value)) : null, deltaUnit: isRate ? " pp" : "%", note: "vs previous period" });
    Kit.kpi(kpis, { label: "Highest adoption rate", value: peak.value, unit, note: peak.period });
    Kit.kpi(kpis, { label: "Average adoption rate", value: avg, unit });
    Kit.kpi(kpis, { label: "Time period", value: mine.length, unit: `${mine[0].period} to ${last.period}`, digits: 0 });

    // Chart 1 (trend). Many regions -> selected region plus the 5 highest. One region -> all measures that share this unit.
    let c = Kit.chartCard(charts, { title: `${series}: trend`, sub: `${unit}, ${mine[0].period} to ${last.period}`, span: 8 });
    if (geos.length > 1) {
      const latestBy = geos.map((g) => ({ g, r: Kit.latest(rows.filter((r) => r.geo === g && r.series === series)) })).filter((x) => x.r);
      const top = latestBy.sort((a, b) => b.r.value - a.r.value).slice(0, 5).map((x) => x.g);
      const picks = [...new Set([geo, ...top])];
      const p = Kit.pivot(rows.filter((r) => r.series === series && picks.includes(r.geo)), "geo");
      Kit.chart(c.canvas, { type: "line", labels: p.labels, series: p.names.map((n) => ({ name: n, data: p.map[n] })), unit, area: false });
      c.canvas.setAttribute('role','img');
      c.canvas.setAttribute('aria-label', `${series}: trend chart`);
    } else {
      const same = seriesList.filter((s) => unitOf(s) === unit).slice(0, 5);
      const p = Kit.pivot(rows.filter((r) => same.includes(r.series)), "series");
      Kit.chart(c.canvas, { type: "line", labels: p.labels, series: p.names.map((n) => ({ name: n, data: p.map[n] })), unit, area: p.names.length === 1 });
    }

    // Chart 2 (compare latest values). Many regions -> bar per region. One region -> bar per measure with the same unit.
    c = Kit.chartCard(charts, { title: geos.length > 1 ? `Regions compared: ${series}` : "Measures compared (latest)", sub: `Latest period, ${unit}`, span: 4 });
    const items = geos.length > 1
      ? geos.map((g) => ({ n: g, r: Kit.latest(rows.filter((r) => r.geo === g && r.series === series)) }))
      : seriesList.filter((s) => unitOf(s) === unit).map((s) => ({ n: s, r: Kit.latest(rows.filter((r) => r.series === s)) }));
    // Exclude EU27/aggregate when other regions exist to avoid dominating the scale
    const cmp = items.filter((x) => x.r && x.n !== "EU27").sort((a, b) => b.r.value - a.r.value);
    Kit.chart(c.canvas, { type: "bar", horizontal: true, labels: cmp.map((x) => x.n), series: [{ name: series, data: cmp.map((x) => x.r.value) }], unit });
    c.canvas.setAttribute('role','img');
    c.canvas.setAttribute('aria-label', `${geos.length > 1 ? `Regions compared: ${series}` : "Measures compared (latest)"} chart`);

    // Extra chart: Country-compare bar chart (for better visual comparison)
    c = Kit.chartCard(charts, { title: "Country comparison", sub: `Latest period, ${unit}`, span: 12 });
    const latestRows = rows.filter((r) => r.series === series && r.value != null);
    const latestByGeo = latestRows.reduce((acc, row) => {
      if (!acc[row.geo]) acc[row.geo] = [];
      acc[row.geo].push(row);
      return acc;
    }, {});

    const countryData = Object.entries(latestByGeo)
      .map(([geo, rows]) => ({ geo, value: rows[0].value }))  // Take the latest value for each geo
      .sort((a, b) => b.value - a.value);

    Kit.chart(c.canvas, {
      type: "bar",
      labels: countryData.map(d => d.geo),
      series: [{ name: series, data: countryData.map(d => d.value) }],
      unit,
      span: 12
    });
    c.canvas.setAttribute('role','img');
    c.canvas.setAttribute('aria-label', "Country comparison chart");

    // Add stacked bar chart showing firm size breakdown for the latest period
    const latestPeriod = mine[mine.length - 1].period;
    const latestData = rows.filter(r => r.period === latestPeriod && r.series.includes('firms'));
    if (latestData.length > 0) {
      c = Kit.chartCard(charts, { title: "Firm size breakdown", sub: `Latest period (${latestPeriod}), ${unit}`, span: 12 });
      const firmSizes = ['Large firms 250+ staff (%)', 'Medium firms 50-249 staff (%)', 'Small firms 10-49 staff (%)'];
      const seriesData = firmSizes.map(size => {
        const value = latestData.find(r => r.series === size)?.value || 0;
        return { name: size, data: [value] };
      }).filter(d => d.data[0] > 0);

      if (seriesData.length > 0) {
        Kit.chart(c.canvas, {
          type: "bar",
          labels: ['Latest period'],
          series: seriesData,
          unit,
          stacked: true
        });
        c.canvas.setAttribute('role','img');
        c.canvas.setAttribute('aria-label', "Firm size breakdown chart");
      }
    }

    Kit.table(charts, { title: "Data", columns: [{ key: "period", label: "Period" }, { key: "geo", label: "Region" }, { key: "series", label: "Measure" }, { key: "value", label: "Value", fmt: (v) => Kit.fmt(v, { digits: 2 }) }], rows: rows.filter((r) => r.series === series), span: 12 });
  }

  if (geos.length > 1) Kit.select(filters, { label: "Region", options: geos, value: geo, onChange: (v) => { geo = v; draw(); } });
  if (seriesList.length > 1) Kit.select(filters, { label: "Measure", options: seriesList, value: series, onChange: (v) => { series = v; draw(); } });
  draw();
};