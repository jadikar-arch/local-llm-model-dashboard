// Test kit functions manually
const testRows = [
  {period: "2021", geo: "NL", series: "Total", value: 123.45},
  {period: "2022", geo: "NL", series: "Total", value: 156.78},
  {period: "2021", geo: "NL", series: "Agriculture", value: 45.67},
  {period: "2022", geo: "NL", series: "Agriculture", value: 56.78},
  {period: "2021", geo: "DE", series: "Total", value: 234.56},
  {period: "2022", geo: "DE", series: "Total", value: 267.89}
];

// Test Kit.uniq
console.log("Testing Kit.uniq:");
const uniqGeo = (function() {
  const $ = (h) => { const t = document.createElement("template"); t.innerHTML = h.trim(); return t.content.firstChild; };
  const fmt = (v, o = {}) => {
    if (v === null || v === undefined || Number.isNaN(v)) return "–";
    const d = o.digits ?? (Math.abs(v) >= 100 ? 0 : 1);
    return new Intl.NumberFormat("en-GB", { maximumFractionDigits: d, minimumFractionDigits: o.fixed ? d : 0 }).format(v);
  };
  const palette = () => [1, 2, 3, 4, 5, 6].map((i) => getComputedStyle(document.documentElement).getPropertyValue("--c" + i));

  return (rows, f) => [...new Set(rows.map((r) => r[f]))].filter((x) => x !== undefined && x !== null).sort();
})();
console.log("uniq(geo):", uniqGeo(testRows, "geo"));

// Test Kit.pivot
console.log("\nTesting Kit.pivot:");
const pivot = function(rows, by = "series") {
  const labels = uniqGeo(rows, "period");
  const names = uniqGeo(rows, by);
  const map = {};
  names.forEach((n) => (map[n] = labels.map(() => null)));
  rows.forEach((r) => { map[r[by]][labels.indexOf(r.period)] = r.value; });
  return { labels, map, names };
};
const pivotResult = pivot(testRows);
console.log("pivot result:", pivotResult);

// Test Kit.latest
console.log("\nTesting Kit.latest:");
const latest = function(rows) {
  const s = [...rows].filter((r) => r.value != null).sort((a, b) => (a.period < b.period ? -1 : 1));
  return s[s.length - 1];
};
console.log("latest:", latest(testRows));

// Test Kit.pct
console.log("\nTesting Kit.pct:");
const pct = function(a, b) {
  return a == null || b == null || b === 0 ? null : ((a - b) / Math.abs(b)) * 100;
};
console.log("pct(156.78, 123.45):", pct(156.78, 123.45));

// Test Kit.fmt
console.log("\nTesting Kit.fmt:");
const fmt = function(v, o = {}) {
  if (v === null || v === undefined || Number.isNaN(v)) return "–";
  const d = o.digits ?? (Math.abs(v) >= 100 ? 0 : 1);
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: d, minimumFractionDigits: o.fixed ? d : 0 }).format(v);
};
console.log("fmt(123.45):", fmt(123.45));
console.log("fmt(1234.56):", fmt(1234.56));