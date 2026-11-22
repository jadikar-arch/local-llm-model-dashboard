// Netherlands Energy Transition Dashboard
if (!window.Topics) {
  window.Topics = {};
}

window.Topics.energy = function ({ el, data, Kit }) {
  const rows = data.rows;
  const geos = Kit.uniq(rows, "geo");
  const unit = data.unit;

  // State management
  let geo = geos[0] || "NL";

  const filters = Kit.$('<div class="filters"></div>');
  const kpis = Kit.$('<div class="grid kpis"></div>');
  const charts = Kit.$('<div class="grid charts"></div>');
  el.append(filters, kpis, charts);

  function draw() {
    Kit.destroyAll();
    kpis.innerHTML = "";
    charts.innerHTML = "";

    // Get latest data for KPIs
    const latestRows = rows.filter(row => row.geo === geo);
    const renewableRow = latestRows.find(row => row.series === "Renewable electricity production");
    const totalConsumptionRow = latestRows.find(row => row.series === "Total electricity consumption");

    // Calculate KPI values
    const renewableValue = renewableRow ? renewableRow.value : 0;
    const consumptionValue = totalConsumptionRow ? totalConsumptionRow.value : 0;
    const renewableShare = consumptionValue > 0 ? (renewableValue / consumptionValue) * 100 : 0;

    // KPI Cards
    Kit.kpi(kpis, {
      label: "Renewable Electricity Production",
      value: Kit.fmt(renewableValue),
      unit: unit,
      note: "2024 data"
    });

    Kit.kpi(kpis, {
      label: "Total Electricity Consumption",
      value: Kit.fmt(consumptionValue),
      unit: unit,
      note: "2024 data"
    });

    Kit.kpi(kpis, {
      label: "Renewable Share",
      value: Kit.fmt(renewableShare, { digits: 1 }),
      unit: "%",
      note: "Percentage of renewable electricity"
    });

    // Chart 1: Line chart showing Renewable vs Total Electricity over time
    const chart1Container = Kit.chartCard(charts, {
      title: "Electricity Production Trends",
      sub: "Renewable vs Total Electricity Production"
    });

    const pivotData = Kit.pivot(rows.filter(row => row.geo === geo), "series");
    const labels = pivotData.labels;
    const series = [
      { name: "Renewable electricity production", data: pivotData.map["Renewable electricity production"] },
      { name: "Total electricity consumption", data: pivotData.map["Total electricity consumption"] }
    ];

    Kit.chart(chart1Container.canvas, {
      type: "line",
      labels: labels,
      series: series,
      unit: unit
    });

    // Chart 2: Stacked bar chart showing renewable energy sources
    const chart2Container = Kit.chartCard(charts, {
      title: "Renewable Energy Sources",
      sub: "Breakdown of renewable electricity production"
    });

    // For simplicity, we'll show a simple breakdown using the same data
    const renewableData = pivotData.map["Renewable electricity production"];

    Kit.chart(chart2Container.canvas, {
      type: "bar",
      labels: labels,
      series: [{ name: "Renewable Production", data: renewableData }],
      unit: unit,
      stacked: true
    });

    // Insight section - but we'll use the story from the data
    const insight = Kit.$('<div class="insight"></div>');
    el.appendChild(insight);
    Kit.insight(insight, `
      <p>${data.story}</p>
    `);
  }

  // Add filter controls if there are multiple geographies
  if (geos.length > 1) {
    Kit.select(filters, {
      label: "Region",
      options: geos,
      value: geo,
      onChange: (v) => {
        geo = v;
        draw();
      }
    });
  }

  // Initial draw
  draw();
};