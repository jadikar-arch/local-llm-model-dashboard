// Test edge cases for kit functions

const testRows = [
  {period: "2021", geo: "NL", series: "Total", value: 123.45},
  {period: "2022", geo: "NL", series: "Total", value: null}, // null value
  {period: "2021", geo: "NL", series: "Agriculture", value: 45.67},
  {period: "2022", geo: "NL", series: "Agriculture", value: 56.78},
  {period: "2021", geo: "DE", series: "Total", value: 234.56},
  {period: "2022", geo: "DE", series: "Total", value: 267.89}
];

// Test Kit.latest with null values
function latest(rows) {
  const s = [...rows].filter((r) => r.value != null).sort((a, b) => (a.period < b.period ? -1 : 1));
  return s[s.length - 1];
}

console.log("Testing Kit.latest with null values:");
const latestResult = latest(testRows);
console.log("Latest row:", latestResult);

// Test Kit.pct with null values
function pct(a, b) {
  return a == null || b == null || b === 0 ? null : ((a - b) / Math.abs(b)) * 100;
}

console.log("\nTesting Kit.pct with edge cases:");
console.log("pct(156.78, 123.45):", pct(156.78, 123.45));
console.log("pct(null, 123.45):", pct(null, 123.45));
console.log("pct(156.78, null):", pct(156.78, null));
console.log("pct(156.78, 0):", pct(156.78, 0));

// Test Kit.fmt with edge cases
function fmt(v, o = {}) {
  if (v === null || v === undefined || Number.isNaN(v)) return "–";
  const d = o.digits ?? (Math.abs(v) >= 100 ? 0 : 1);
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: d, minimumFractionDigits: o.fixed ? d : 0 }).format(v);
}

console.log("\nTesting Kit.fmt with edge cases:");
console.log("fmt(null):", fmt(null));
console.log("fmt(undefined):", fmt(undefined));
console.log("fmt(NaN):", fmt(NaN));
console.log("fmt(123.45):", fmt(123.45));
console.log("fmt(-123.45):", fmt(-123.45));

// Test Kit.uniq with edge cases
function uniq(rows, f) {
  return [...new Set(rows.map((r) => r[f]))].filter((x) => x !== undefined && x !== null).sort();
}

console.log("\nTesting Kit.uniq with edge cases:");
const rowsWithNulls = [
  {period: "2021", geo: "NL", series: "Total", value: 123.45},
  {period: "2022", geo: null, series: "Total", value: 156.78}, // null geo
  {period: "2021", geo: "NL", series: "Agriculture", value: 45.67},
  {period: "2022", geo: "", series: "Agriculture", value: 56.78} // empty string geo
];
console.log("uniq(geo) with nulls:", uniq(rowsWithNulls, "geo"));