/* Dashboard kit. Global `Kit`. Requires vendor/chart.umd.min.js loaded first.
   Data rows are LONG format: {period:"2021" | "2021-03" | "2021Q1", geo:"NL", series:"Total", value:1.2}
   See .claude/skills/dashboard-builder/references/kit-api.md for usage. */
(function () {
  const $ = (h) => { const t = document.createElement("template"); t.innerHTML = h.trim(); return t.content.firstChild; };
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const palette = () => [1, 2, 3, 4, 5, 6].map((i) => css("--c" + i));
  const charts = [];

  const fmt = (v, o = {}) => {
    if (v === null || v === undefined || Number.isNaN(v)) return "–";
    const d = o.digits ?? (Math.abs(v) >= 1000 ? 0 : 1);
    return new Intl.NumberFormat("en-GB", { maximumFractionDigits: d, minimumFractionDigits: o.fixed ? d : 0 }).format(v);
  };

  const Kit = {
    $, fmt, palette,
    async load(url) {
      const r = await fetch(url);
      if (!r.ok) throw new Error("Cannot load " + url + " (" + r.status + ")");
      return r.json();
    },
    /** distinct sorted values of a row field */
    uniq: (rows, f) => [...new Set(rows.map((r) => r[f]))].filter((x) => x !== undefined && x !== null).sort(),
    /** rows -> {labels:[periods], map:{seriesName:[values aligned to labels]}} */
    pivot(rows, by = "series") {
      const labels = Kit.uniq(rows, "period");
      const names = Kit.uniq(rows, by);
      const map = {};
      names.forEach((n) => (map[n] = labels.map(() => null)));
      rows.forEach((r) => { map[r[by]][labels.indexOf(r.period)] = r.value; });
      return { labels, map, names };
    },
    latest(rows) { // last non-null row by period
      const s = [...rows].filter((r) => r.value != null).sort((a, b) => (a.period < b.period ? -1 : 1));
      return s[s.length - 1];
    },
    /** KPI card. delta = number (percent change) or null */
    kpi(parent, { label, value, unit = "", delta = null, note = "", digits, deltaUnit = "%" }) {
      let d = "";
      if (delta !== null && delta !== undefined) {
        const cls = Math.abs(delta) < 0.05 ? "flat" : delta > 0 ? "up" : "down";
        d = `<div class="delta ${cls}">${delta > 0 ? "▲" : delta < 0 ? "▼" : "■"} ${fmt(Math.abs(delta), { digits: 1 })}${deltaUnit} ${note}</div>`;
      }
      const el = $(`<div class="card kpi"><div class="label">${label}</div><div class="value">${fmt(value, { digits })}<span class="unit">${unit}</span></div>${d}</div>`);
      parent.appendChild(el); return el;
    },
    /** card wrapper with title and a chart canvas. returns {card, canvas} */
    chartCard(parent, { title, sub = "", span = 6, height }) {
      const card = $(`<div class="card span-${span}"><h3>${title}</h3><div class="sub">${sub}</div><div class="chart-box"${height ? ` style="height:${height}px"` : ""}><canvas></canvas></div></div>`);
      parent.appendChild(card); return { card, canvas: card.querySelector("canvas") };
    },
    /** type: line|bar|doughnut|radar. series: [{name, data:[...]}]. */
    chart(canvas, { type = "line", labels, series, unit = "", stacked = false, horizontal = false, area = false }) {
      const pal = palette();
      const datasets = series.map((s, i) => {
        const col = pal[i % pal.length];
        const pie = type === "doughnut" || type === "pie";
        return {
          label: s.name, data: s.data,
          borderColor: pie ? css("--surface") : col,
          backgroundColor: pie ? s.data.map((_, j) => pal[j % pal.length]) : type === "line" ? (area ? col + "33" : col) : col + "cc",
          fill: type === "line" && area, tension: 0.3, borderWidth: type === "line" ? 2.5 : 1, pointRadius: 0, pointHoverRadius: 5, borderRadius: type === "bar" ? 6 : 0,
        };
      });
      const pie = type === "doughnut" || type === "pie";
      const chart = new Chart(canvas, {
        type, data: { labels, datasets },
        options: {
          responsive: true, maintainAspectRatio: false, indexAxis: horizontal ? "y" : "x",
          interaction: { mode: "index", intersect: false },
          animation: { duration: 500 },
          plugins: {
            legend: { display: series.length > 1 || pie, position: "bottom", labels: { usePointStyle: true, boxWidth: 8, boxHeight: 8, color: css("--muted") } },
            tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${fmt(c.parsed.y ?? c.parsed.x ?? c.parsed, { digits: 2 })} ${unit}` } },
          },
          scales: pie ? {} : (() => {
            const cat = { stacked, grid: { display: false }, ticks: { color: css("--muted"), maxTicksLimit: horizontal ? 40 : 10, autoSkip: !horizontal } };
            const val = { stacked, grid: { color: css("--border") }, ticks: { color: css("--muted"), callback: (v) => fmt(v) }, title: { display: !!unit, text: unit, color: css("--muted") } };
            return horizontal ? { x: val, y: cat } : { x: cat, y: val };
          })(),
        },
      });
      charts.push(chart); return chart;
    },
    /** sortable searchable table. columns:[{key,label,fmt?}] */
    table(parent, { columns, rows, search = true, title = "", span = 12 }) {
      const card = $(`<div class="card span-${span}"><h3>${title}</h3><div class="sub"></div>${search ? '<input type="search" placeholder="Search…" style="margin-bottom:10px">' : ""}<div class="table-scroll"><table class="data"></table></div></div>`);
      parent.appendChild(card);
      const tbl = card.querySelector("table"); let sortKey = null, dir = 1, q = "";
      const draw = () => {
        let r = rows.filter((x) => !q || columns.some((c) => String(x[c.key]).toLowerCase().includes(q)));
        if (sortKey) r = [...r].sort((a, b) => (a[sortKey] > b[sortKey] ? 1 : -1) * dir);
        tbl.innerHTML = "<thead><tr>" + columns.map((c) => `<th data-k="${c.key}">${c.label}${sortKey === c.key ? (dir > 0 ? " ▲" : " ▼") : ""}</th>`).join("") + "</tr></thead><tbody>" +
          r.slice(0, 300).map((x) => "<tr>" + columns.map((c) => `<td>${c.fmt ? c.fmt(x[c.key], x) : x[c.key] ?? "–"}</td>`).join("") + "</tr>").join("") + "</tbody>";
        tbl.querySelectorAll("th").forEach((th) => (th.onclick = () => { const k = th.dataset.k; dir = sortKey === k ? -dir : 1; sortKey = k; draw(); }));
      };
      if (search) card.querySelector("input").oninput = (e) => { q = e.target.value.toLowerCase(); draw(); };
      draw(); return card;
    },
    /** labelled <select>. returns the select element. */
    select(parent, { label, options, value, onChange }) {
      const wrap = $(`<label>${label}<select>${options.map((o) => `<option value="${o}"${o === value ? " selected" : ""}>${o}</option>`).join("")}</select></label>`);
      wrap.querySelector("select").onchange = (e) => onChange(e.target.value);
      parent.appendChild(wrap); return wrap.querySelector("select");
    },
    insight(parent, html) { const el = $(`<div class="insight">${html}</div>`); parent.appendChild(el); return el; },
    pct(a, b) { return a == null || b == null || b === 0 ? null : ((a - b) / Math.abs(b)) * 100; },
    destroyAll() { charts.splice(0).forEach((c) => c.destroy()); },

    /** Mount a full dashboard.
     *  cfg = { title, subtitle, country:"nl"|"eu"|"de", topics:[{id,title,render(ctx)}] }
     *  topic.render(ctx): ctx = {el (empty div to fill), data (loaded json), Kit}. data comes from /site/data/<country>/<id>.json  */
    async mount(cfg) {
      const root = document.getElementById("app");
      const nav = ["nl", "eu", "de"].map((c) => `<a href="../${c}/index.html" class="${c === cfg.country ? "active" : ""}">${c.toUpperCase()}</a>`).join("");
      root.innerHTML = `<header class="topbar"><div class="brand"><span class="dot"></span>${cfg.brand || "Europa Insights"}</div>
        <nav class="nav"><a href="../index.html">Home</a>${nav}<button class="btn" id="theme" aria-label="Toggle theme">◐ Theme</button></nav></header>
        <main class="wrap"><section class="hero"><h1>${cfg.title}</h1><p>${cfg.subtitle}</p></section>
        <div class="tabs" role="tablist"></div><div id="panel"></div><footer class="footer" id="foot"></footer></main>`;
      const saved = localStorage.getItem("theme"); if (saved) document.documentElement.dataset.theme = saved;
      document.getElementById("theme").onclick = () => {
        const t = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = t; localStorage.setItem("theme", t); show(current);
      };
      const tabs = root.querySelector(".tabs"), panel = root.querySelector("#panel"); let current = 0;
      const show = async (i) => {
        current = i; Kit.destroyAll();
        tabs.querySelectorAll(".tab").forEach((b, j) => b.setAttribute("aria-selected", j === i));
        const t = cfg.topics[i]; panel.innerHTML = '<div class="empty">Loading…</div>';
        try {
          const data = await Kit.load(`../data/${cfg.country}/${t.id}.json`);
          panel.innerHTML = ""; const el = document.createElement("div"); panel.appendChild(el);
          t.render({ el, data, Kit });
          document.getElementById("foot").innerHTML = `<span>Source: <a href="${data.source_url || "#"}">${data.source || "n/a"}</a></span><span>Licence: ${data.licence || "n/a"}</span><span>Fetched: ${data.fetched || "n/a"}</span>`;
        } catch (e) { panel.innerHTML = `<div class="empty">Could not render this topic: ${e.message}</div>`; console.error(e); }
      };
      cfg.topics.forEach((t, i) => { const b = $(`<button class="tab" role="tab">${t.title}</button>`); b.onclick = () => show(i); tabs.appendChild(b); });
      Chart.defaults.font.family = css("--font");
      await show(0);
    },
  };
  window.Kit = Kit;
})();
