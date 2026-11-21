"""Writes throwaway demo data to site/data/demo/ so the kit and qa.mjs can be smoke-tested."""
import json, random, pathlib
out = pathlib.Path("site/data/demo"); out.mkdir(parents=True, exist_ok=True)
for t in "abc":
    rows = [{"period": str(y), "geo": g, "series": "X", "value": round(random.uniform(1, 10), 2)}
            for y in range(2015, 2025) for g in ["NL", "DE", "FR"]]
    (out / f"{t}.json").write_text(json.dumps({"source": "demo", "source_url": "#", "licence": "CC", "fetched": "2026-11-21", "rows": rows}))
