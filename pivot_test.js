// Test the pivot function with different data scenarios to check for bugs

const mockKit = {
  uniq: (rows, f) => [...new Set(rows.map((r) => r[f]))].filter((x) => x !== undefined && x !== null).sort(),
  pivot: (rows, by = "series") => {
    const labels = mockKit.uniq(rows, "period");
    const names = mockKit.uniq(rows, by);
    const map = {};
    names.forEach((n) => (map[n] = labels.map(() => null)));
    rows.forEach((r) => {
      const periodIndex = labels.indexOf(r.period);
      if (periodIndex !== -1) {
        map[r[by]][periodIndex] = r.value;
      }
    });
    return { labels, map, names };
  }
};

// Test case 1: Normal data
const testRows1 = [
  {"period": "2015", "geo": "NL", "series": "X", "value": 1.6},
  {"period": "2015", "geo": "DE", "series": "X", "value": 8.87},
  {"period": "2016", "geo": "NL", "series": "X", "value": 6.21},
  {"period": "2016", "geo": "DE", "series": "X", "value": 2.66}
];

console.log("Test 1 - Normal data:");
console.log("Result:", mockKit.pivot(testRows1));

// Test case 2: Data with different series
const testRows2 = [
  {"period": "2015", "geo": "NL", "series": "A", "value": 1.6},
  {"period": "2015", "geo": "DE", "series": "B", "value": 8.87},
  {"period": "2016", "geo": "NL", "series": "A", "value": 6.21},
  {"period": "2016", "geo": "DE", "series": "B", "value": 2.66}
];

console.log("\nTest 2 - Different series:");
console.log("Result:", mockKit.pivot(testRows2));

// Test case 3: Data with null values
const testRows3 = [
  {"period": "2015", "geo": "NL", "series": "X", "value": 1.6},
  {"period": "2015", "geo": "DE", "series": "X", "value": null},
  {"period": "2016", "geo": "NL", "series": "X", "value": 6.21}
];

console.log("\nTest 3 - With null values:");
console.log("Result:", mockKit.pivot(testRows3));

// Test case 4: Data with string periods that look like numbers
const testRows4 = [
  {"period": "2015", "geo": "NL", "series": "X", "value": 1.6},
  {"period": "2016", "geo": "DE", "series": "X", "value": 8.87},
  {"period": "2017", "geo": "NL", "series": "X", "value": 6.21}
];

console.log("\nTest 4 - String periods:");
console.log("Result:", mockKit.pivot(testRows4));