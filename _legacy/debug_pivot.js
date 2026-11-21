// More detailed test of Kit.pivot function to identify issues

const testRows = [
  {period: "2021", geo: "NL", series: "Total", value: 123.45},
  {period: "2022", geo: "NL", series: "Total", value: 156.78},
  {period: "2021", geo: "NL", series: "Agriculture", value: 45.67},
  {period: "2022", geo: "NL", series: "Agriculture", value: 56.78},
  {period: "2021", geo: "DE", series: "Total", value: 234.56},
  {period: "2022", geo: "DE", series: "Total", value: 267.89}
];

// Replicate the exact Kit.pivot function from kit.js
function uniq(rows, f) {
  return [...new Set(rows.map((r) => r[f]))].filter((x) => x !== undefined && x !== null).sort();
}

function pivot(rows, by = "series") {
  const labels = uniq(rows, "period");
  console.log("Labels (periods):", labels);

  const names = uniq(rows, by);
  console.log("Names (by field):", names);

  const map = {};
  names.forEach((n) => (map[n] = labels.map(() => null)));
  console.log("Initial map:", map);

  rows.forEach((r) => {
    console.log(`Processing row: ${JSON.stringify(r)}`);
    console.log(`  map[r[by]] = map[${r[by]}]`);
    console.log(`  labels.indexOf(r.period) = ${labels.indexOf(r.period)}`);
    map[r[by]][labels.indexOf(r.period)] = r.value;
  });

  console.log("Final map:", map);
  return { labels, map, names };
}

console.log("=== Testing Kit.pivot ===");
const result = pivot(testRows);
console.log("Full result:", result);

// Test with filtered data for one geo
console.log("\n=== Testing with NL data only ===");
const nlRows = testRows.filter(r => r.geo === "NL");
const nlResult = pivot(nlRows);
console.log("NL result:", nlResult);