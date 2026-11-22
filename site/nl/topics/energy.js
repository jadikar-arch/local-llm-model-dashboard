// Energy topic for Netherlands dashboard
window.Topics = window.Topics || {};
Topics.energy = function ({ el, data, Kit }) {
  const rows = data.rows;
  const geos = Kit.uniq(rows, "geo");
  const seriesList = [...new Set(rows.map((r) => r.series))];           // keep file order
  const unitOf = (s) => (data.units && data.units[s]) || data.unit;
  let geo = geos[0];
  let series = seriesList[0];

  const filters = Kit.$('<div class="filters"></div>');
  const kpis = Kit.$('<div class="grid kpis"></div>');
  const charts = Kit.$('<div class="grid charts"></div>');
  el.append(filters, Kit.$(`<div class="insight">${data.story}</div>`), kpis, charts);

  function draw() {
    Kit.destroyAll(); kpis.innerHTML = ""; charts.innerHTML = "";
    const unit = unitOf(series);
    const mine = rows.filter((r) => r.geo === geo && r.series === series && r.value != null).sort((a, b) => (a.period < b.period ? -1 : 1));
    if (!mine.length) { charts.innerHTML = '<div class="empty">No data for this selection. Try another region or measure.</div>'; return; }
    const last = mine[mine.length - 1], prev = mine[mine.length - 2];
    const peak = mine.reduce((m, r) => (r.value > m.value ? r : m), mine[0]);
    const avg = mine.reduce((s, r) => s + r.value, 0) / mine.length;

    const isRate = /%/.test(unit);   // rates change in percentage points, everything else in percent
    Kit.kpi(kpis, { label: `Latest (${last.period})`, value: last.value, unit, delta: prev ? (isRate ? last.value - prev.value : Kit.pct(last.value, prev.value)) : null, deltaUnit: isRate ? " pp" : "%", note: "vs previous period" });
    Kit.kpi(kpis, { label: "Peak", value: peak.value, unit, note: peak.period });
    Kit.kpi(kpis, { label: "Average", value: avg, unit });
    Kit.kpi(kpis, { label: "Periods", value: mine.length, unit: `${mine[0].period} to ${last.period}`, digits: 0 });

    // Chart 1 (trend) - comparing renewable vs total electricity production
    let c = Kit.chartCard(charts, { title: "Electricity Production Trends", sub: `Renewable vs Total, ${mine[0].period} to ${last.period}`, span: 8 });
    const p = Kit.pivot(rows.filter((r) => r.series === 'Renewable electricity production' || r.series === 'Total electricity consumption'), "series");
    Kit.chart(c.canvas, { type: "line", labels: p.labels, series: p.names.map((n) => ({ name: n, data: p.map[n] })), unit, area: false });

    // Chart 2 (compare latest values) - showing renewable share
    c = Kit.chartCard(charts, { title: "Latest Renewable Share", sub: "Percentage of renewable electricity", span: 4 });
    const renewableRows = rows.filter((r) => r.series === 'Renewable electricity production');
    const totalRows = rows.filter((r) => r.series === 'Total electricity consumption');

    // Get latest values for both series
    const latestRenewable = Kit.latest(renewableRows);
    const latestTotal = Kit.latest(totalRows);

    if (latestRenewable && latestTotal) {
      const renewableShare = (latestRenewable.value / latestTotal.value) * 100;
      const shareData = [
        { name: "Renewable", data: [renewableShare] },
        { name: "Non-Renewable", data: [100 - renewableShare] }
      ];
      Kit.chart(c.canvas, { type: "doughnut", labels: ["Renewable", "Non-Renewable"], series: shareData, unit: "%" });
    }

    // Chart 3 (stacked bar) - showing renewable sources breakdown
    c = Kit.chartCard(charts, { title: "Renewable Sources Breakdown", sub: "Distribution of renewable electricity production", span: 12 });

    // Get all renewable data for different time periods
    const renewableData = rows.filter((r) => r.series.includes('Renewable'));
    const renewableSources = [...new Set(renewableData.map((r) => r.series))].filter(s => s !== 'Renewable electricity production');

    if (renewableSources.length > 0) {
      const p2 = Kit.pivot(rows.filter((r) => renewableSources.includes(r.series)), "series");
      Kit.chart(c.canvas, { type: "bar", labels: p2.labels, series: p2.names.map((n) => ({ name: n, data: p2.map[n] })), unit, stacked: true });
    }

    Kit.table(charts, { title: "Data", columns: [{ key: "period", label: "Period" }, { key: "geo", label: "Region" }, { key: "series", label: "Measure" }, { key: "value", label: "Value", fmt: (v) => Kit.fmt(v, { digits: 2 }) }], rows: rows.filter((r) => r.series === series), span: 12 });
  }

  if (geos.length > 1) Kit.select(filters, { label: "Region", options: geos, value: geo, onChange: (v) => { geo = v; draw(); } });
  if (seriesList.length > 1) Kit.select(filters, { label: "Measure", options: seriesList, value: series, onChange: (v) => { series = v; draw(); } });
  draw();
};