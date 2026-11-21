// Simple test to validate Kit functions work correctly without browser
const testRows = [
  {"period": "2015", "geo": "NL", "series": "X", "value": 1.6},
  {"period": "2015", "geo": "DE", "series": "X", "value": 8.87},
  {"period": "2016", "geo": "NL", "series": "X", "value": 6.21},
  {"period": "2016", "geo": "DE", "series": "X", "value": 2.66}
];

// Test the uniq function
const uniqResult = Kit.uniq(testRows, "period");
console.log("uniq test (periods):", uniqResult);

// Test the pivot function
const pivotResult = Kit.pivot(testRows);
console.log("pivot test:", pivotResult);

// Test the fmt function with various values
console.log("fmt test (1.6):", Kit.fmt(1.6));
console.log("fmt test (123.456):", Kit.fmt(123.456));
console.log("fmt test (null):", Kit.fmt(null));

// Test the latest function
const latestResult = Kit.latest(testRows);
console.log("latest test:", latestResult);

// Test pct function
console.log("pct test (10, 5):", Kit.pct(10, 5));
console.log("pct test (5, 10):", Kit.pct(5, 10));
console.log("pct test (null, 5):", Kit.pct(null, 5));