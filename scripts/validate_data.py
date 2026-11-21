#!/usr/bin/env python3
"""Gate for DATA tasks. Usage: python3 scripts/validate_data.py site/data/nl/housing.json
Prints short, actionable errors. Exit 0 = valid."""
import json, sys, re

def main(path):
    errs = []
    try:
        d = json.load(open(path))
    except Exception as e:
        print(f"FAIL cannot read/parse {path}: {e}"); return 1
    for k in ("title", "source", "source_url", "licence", "fetched", "unit", "rows", "story"):
        if k not in d or d[k] in ("", None):
            errs.append(f"missing top-level key '{k}'")
    rows = d.get("rows", [])
    if not isinstance(rows, list) or len(rows) < 20: errs.append(f"need >=20 rows, have {len(rows) if isinstance(rows, list) else 'n/a'}")
    if isinstance(rows, list) and len(rows) > 600: errs.append("more than 600 rows: aggregate or filter harder")
    bad = [r for r in rows if not (isinstance(r, dict) and {"period", "geo", "series", "value"} <= set(r))]
    if bad: errs.append(f"{len(bad)} rows lack period/geo/series/value, e.g. {bad[0]}")
    good = [r for r in rows if r not in bad]
    nonnum = [r for r in good if r["value"] is not None and not isinstance(r["value"], (int, float))]
    if nonnum: errs.append(f"{len(nonnum)} non-numeric values, e.g. {nonnum[0]}")
    periods = {r["period"] for r in good}
    if len(periods) < 8: errs.append(f"need >=8 distinct periods, have {len(periods)}")
    if any(not re.match(r"^\d{4}(-\d{2}|Q[1-4]|-M\d{2})?$", str(p)) for p in periods):
        errs.append("period must look like 2021, 2021-03 or 2021Q1 (convert 2021MM03 -> 2021-03)")
    vals = {r["value"] for r in good if r["value"] is not None}
    if len(vals) < 5: errs.append("values look constant/empty")
    if not str(d.get("story", "")).strip() or len(str(d.get("story", ""))) < 80:
        errs.append("'story' should be 1-3 sentences (>=80 chars) of plain-language insight written from the real numbers")
    if errs:
        print("FAIL " + path); [print(" - " + e) for e in errs]; return 1
    print(f"OK {path}: {len(rows)} rows, {len(periods)} periods, {len({r['series'] for r in good})} series, {len({r['geo'] for r in good})} geos")
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1]) if len(sys.argv) > 1 else 2)
