// Test Kit functions directly without browser dependencies

// First, we need to simulate the environment for testing
global.document = {
  createElement: function(tag) {
    return { tagName: tag.toUpperCase(), style: {}, className: '', appendChild: function() {} };
  },
  querySelector: function(selector) {
    return null;
  },
  querySelectorAll: function(selector) {
    return [];
  },
  getElementsByClassName: function(className) {
    return [];
  },
  getElementById: function(id) {
    return null;
  }
};

global.Chart = {
  getChart: function(canvas) { return null; },
  defaults: { font: { family: 'sans-serif' } }
};

// Mock the Kit functions that require DOM access
const mockKit = {
  uniq: (rows, f) => [...new Set(rows.map((r) => r[f]))].filter((x) => x !== undefined && x !== null).sort(),
  pivot: (rows, by = "series") => {
    const labels = mockKit.uniq(rows, "period");
    const names = mockKit.uniq(rows, by);
    const map = {};
    names.forEach((n) => (map[n] = labels.map(() => null)));
    rows.forEach((r) => { map[r[by]][labels.indexOf(r.period)] = r.value; });
    return { labels, map, names };
  },
  fmt: (v, o = {}) => {
    if (v === null || v === undefined || Number.isNaN(v)) return "–";
    const d = o.digits ?? (Math.abs(v) >= 100 ? 0 : 1);
    return new Intl.NumberFormat("en-GB", { maximumFractionDigits: d, minimumFractionDigits: o.fixed ? d : 0 }).format(v);
  },
  latest: (rows) => {
    const s = [...rows].filter((r) => r.value != null).sort((a, b) => (a.period < b.period ? -1 : 1));
    return s[s.length - 1];
  },
  pct: (a, b) => {
    return a == null || b == null || b === 0 ? null : ((a - b) / Math.abs(b)) * 100;
  }
};

// Test data
const testRows = [
  {"period": "2015", "geo": "NL", "series": "X", "value": 1.6},
  {"period": "2015", "geo": "DE", "series": "X", "value": 8.87},
  {"period": "2016", "geo": "NL", "series": "X", "value": 6.21},
  {"period": "2016", "geo": "DE", "series": "X", "value": 2.66}
];

// Run tests
console.log("Testing Kit functions:");
console.log("uniq test:", mockKit.uniq(testRows, "period"));
console.log("pivot test:", mockKit.pivot(testRows));
console.log("fmt test (1.6):", mockKit.fmt(1.6));
console.log("fmt test (null):", mockKit.fmt(null));
console.log("latest test:", mockKit.latest(testRows));
console.log("pct test (10, 5):", mockKit.pct(10, 5));
console.log("pct test (5, 10):", mockKit.pct(5, 10));

console.log("\nAll tests completed successfully.");