// Housing topic for Netherlands dashboard
Topics.housing = ({ el, data, Kit }) => {
  // Clear the element
  el.innerHTML = '';

  // Get unique geographies for filtering
  const geos = Kit.uniq(data.rows, "geo");

  // State for filtering
  let selectedGeo = geos[0] || "Nederland";

  // Function to redraw everything
  function draw() {
    Kit.destroyAll();
    el.innerHTML = '';

    // Filter data by selected geography
    const filteredRows = data.rows.filter(r => r.geo === selectedGeo);

    // Create header with filter
    const header = document.createElement('div');
    header.className = 'grid charts';
    el.appendChild(header);

    // Add region filter (only if we have multiple geographies)
    if (geos.length > 1) {
      const filters = document.createElement('div');
      filters.className = 'filters';
      header.appendChild(filters);

      Kit.select(filters, {
        label: "Region:",
        options: geos.map(g => ({ value: g, label: g })),
        value: selectedGeo,
        onChange: (value) => {
          selectedGeo = value;
          draw();
        }
      });
    }

    // Create KPIs
    const kpis = document.createElement('div');
    kpis.className = 'grid kpis';
    el.appendChild(kpis);

    // Get latest values for KPIs
    const latestRows = Kit.latest(filteredRows);

    // KPI 1: Average house price (if available)
    if (latestRows.find(r => r.series === "Gemiddelde verkoopprijs")) {
      const avgPriceRow = latestRows.find(r => r.series === "Gemiddelde verkoopprijs");
      Kit.kpi(kpis, {
        label: "Average House Price",
        value: Kit.fmt(avgPriceRow.value),
        unit: "€"
      });
    }

    // KPI 2: Price Index (if available)
    if (latestRows.find(r => r.series === "Prijsindex verkoopprijzen")) {
      const priceIndexRow = latestRows.find(r => r.series === "Prijsindex verkoopprijzen");
      Kit.kpi(kpis, {
        label: "House Price Index",
        value: Kit.fmt(priceIndexRow.value),
        unit: ""
      });
    }

    // KPI 3: Count of data points (as a third KPI)
    const totalDataPoints = filteredRows.length;
    Kit.kpi(kpis, {
      label: "Data Points",
      value: Kit.fmt(totalDataPoints),
      unit: ""
    });

    // Create charts container
    const charts = document.createElement('div');
    charts.className = 'grid charts';
    el.appendChild(charts);

    // Chart 1: Line chart of house prices over time
    const priceChartCard = Kit.chartCard(charts, {
      title: "House Prices Over Time",
      sub: "Average house prices in " + selectedGeo
    });

    // Pivot data for charting (filter by price series)
    const pricePivot = Kit.pivot(filteredRows.filter(r => r.series.includes("verkoopprijs")), "series");

    if (pricePivot.names.length > 0) {
      Kit.chart(priceChartCard.canvas, {
        type: "line",
        labels: pricePivot.labels,
        series: pricePivot.names.map((name, i) => ({
          name: name,
          data: pricePivot.map[name]
        })),
        unit: "€"
      });
    }

    // Chart 2: Bar chart of price index vs time
    const indexChartCard = Kit.chartCard(charts, {
      title: "House Price Index Over Time",
      sub: "Price index in " + selectedGeo
    });

    const indexPivot = Kit.pivot(filteredRows.filter(r => r.series.includes("Prijsindex")), "series");

    if (indexPivot.names.length > 0) {
      Kit.chart(indexChartCard.canvas, {
        type: "bar",
        labels: indexPivot.labels,
        series: indexPivot.names.map((name, i) => ({
          name: name,
          data: indexPivot.map[name]
        })),
        unit: ""
      });
    }

    // Table
    const tableContainer = document.createElement('div');
    tableContainer.className = 'grid charts';
    el.appendChild(tableContainer);

    // Create a sample table structure
    const tableTitle = document.createElement('h3');
    tableTitle.textContent = "Housing Data by Period";
    tableContainer.appendChild(tableTitle);

    // Table columns based on the actual data
    const columns = [
      { key: "period", label: "Period" },
      { key: "series", label: "Series" },
      { key: "value", label: "Value" }
    ];

    // Create table with filtered rows
    Kit.table(tableContainer, {
      title: "Housing Data",
      columns: columns,
      rows: filteredRows.map(r => ({
        period: r.period,
        series: r.series,
        value: r.value
      }))
    });

    // Insight section
    const insight = document.createElement('div');
    insight.className = 'insight';
    el.appendChild(insight);

    Kit.insight(insight, `
      <p>Housing prices in the Netherlands have shown significant changes over recent years.
      The data indicates trends in both average prices and price indices that reflect the
      changing dynamics of the Dutch housing market.</p>
    `);
  }

  // Initial draw
  draw();
};