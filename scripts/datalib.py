"""Helpers for the data builders. Numbers are transcribed from europa MCP tool results (see each builder's comments);
this module only reshapes them and computes facts for the 'story' text. No numbers are invented here."""
import json, datetime, pathlib

def series_rows(geo, series, periods, values, scale=1.0, nd=None):
    """Build long rows from aligned lists; None values stay None."""
    out = []
    for p, v in zip(periods, values):
        if v is not None and scale != 1.0: v = v / scale
        if v is not None and nd is not None: v = round(v, nd)
        out.append({"period": p, "geo": geo, "series": series, "value": v})
    return out

def months(y0, m0, n):
    out, y, m = [], y0, m0
    for _ in range(n):
        out.append(f"{y}-{m:02d}"); m += 1
        if m == 13: y, m = y + 1, 1
    return out

def last(rows, geo, series):
    r = [x for x in rows if x["geo"] == geo and x["series"] == series and x["value"] is not None]
    return r[-1]

def first(rows, geo, series):
    r = [x for x in rows if x["geo"] == geo and x["series"] == series and x["value"] is not None]
    return r[0]

def at(rows, geo, series, period):
    return next(x["value"] for x in rows if x["geo"] == geo and x["series"] == series and x["period"] == period)

def pct(a, b): return (a - b) / abs(b) * 100

def save(country, topic, title, unit, units, source, source_url, licence, rows, story, extra=None):
    d = {"title": title, "unit": unit, "units": units, "source": source, "source_url": source_url, "licence": licence,
         "fetched": datetime.date.today().isoformat(), "story": story, "rows": rows}
    if extra: d.update(extra)
    p = pathlib.Path(__file__).resolve().parent.parent / f"site/data/{country}/{topic}.json"; p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(d, ensure_ascii=False, indent=1))
    print("wrote", p, len(rows), "rows")
