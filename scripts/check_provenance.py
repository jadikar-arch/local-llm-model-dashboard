#!/usr/bin/env python3
"""Gate for DATA tasks: are the numbers in the JSON really from europa tool results of THIS session?
Usage: python3 scripts/check_provenance.py site/data/nl/housing.json logs/<ID>-attemptN.jsonl
Rule: >= 90% of the distinct row values must appear (exactly, or equal after rounding to the digits the model kept)
in the text returned by mcp__europa__* tools. Output of Bash/Read does NOT count, so typed-in numbers cannot vouch for themselves."""
import json, re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from tracelib import europa_results

THRESH = 0.90


def candidates(text):
    out = set()
    for tok in re.findall(r"-?\d+(?:[.,\s]\d+)*", text):
        tok = tok.strip()
        forms = {tok, tok.replace(" ", ""), tok.replace(",", ""), tok.replace(",", "."), tok.replace(".", "").replace(",", ".")}
        for f in forms:
            try:
                out.add(float(f))
            except ValueError:
                pass
        for part in re.split(r"[\s]", tok):  # "1 234" style: also each piece
            try:
                out.add(float(part.replace(",", ".")))
            except ValueError:
                pass
    return out


def decimals(v):
    s = repr(float(v))
    return min(len(s.split(".")[1].rstrip("0")) if "." in s else 0, 3)


def main(path, trace):
    try:
        d = json.load(open(path))
    except Exception as e:
        print(f"FAIL cannot read {path}: {e}"); return 1
    text, calls = europa_results(trace)
    errs = []
    if len(text) < 300:
        errs.append("no europa data tool result in this session: you must call the europa MCP tools (find_data, then cbs_data / eurostat_data / govdata_table) and copy numbers from their output")
        print("FAIL provenance"); [print(" - " + e) for e in errs]; return 1
    cands = candidates(text)
    rounded = {k: {round(c, k) for c in cands} for k in range(0, 4)}
    vals = sorted({r["value"] for r in d.get("rows", []) if isinstance(r.get("value"), (int, float))})
    miss = [v for v in vals if round(v, decimals(v)) not in rounded[decimals(v)] and v not in cands]
    ratio = 1 - len(miss) / max(len(vals), 1)
    # chance level: how many values that are certainly NOT in the data would also "match" (small integers etc.)
    fake = [round(v * 1.0731 + 0.37, decimals(v)) for v in vals]
    chance = sum(1 for v in fake if v in rounded[decimals(v)] or v in cands) / max(len(fake), 1)
    need = 0.98 if chance >= 0.5 else THRESH
    if ratio < need:
        errs.append(f"only {ratio:.0%} of the {len(vals)} distinct values appear in the europa tool results (need {need:.0%}, chance level {chance:.0%}). Not found, e.g.: {miss[:8]}. Copy numbers unchanged from the tool output; never invent, estimate, interpolate or compute new values")
    # period assignment: in long-format tool output ("2018|4609") a row's value must sit on a line that also shows the row's year
    lines = [l for l in text.split("\n") if re.search(r"\b(19|20)\d{2}\b", l)]
    lsets = [(l, candidates(l)) for l in lines]
    def on_line(v, year):
        d = decimals(v)
        return any(year in l and (v in c or round(v, d) in {round(x, d) for x in c}) for l, c in lsets)
    carried = [v for v in vals if any(v in c or round(v, decimals(v)) in {round(x, decimals(v)) for x in c} for _, c in lsets)]
    if len(carried) >= 0.7 * max(len(vals), 1):          # long format with periods on the same line -> enforce pairing
        bad = [r for r in d.get("rows", []) if isinstance(r.get("value"), (int, float)) and not on_line(r["value"], str(r["period"])[:4])]
        if len(bad) > 0.1 * len(d["rows"]):
            ex = []
            for r in bad[:4]:
                yrs = sorted({y for l, c in lsets for y in re.findall(r"\b(?:19|20)\d{2}\b", l) if r["value"] in c})[:3]
                ex.append(f"{r['period']} -> {r['value']} (the tool results show this value for {', '.join(yrs) or 'no year'})")
            errs.append(f"{len(bad)} of {len(d['rows'])} rows put a value under the wrong period, e.g. " + "; ".join(ex) + ". Copy each value together with ITS OWN period from the tool output; if the data starts later than the brief says, use the periods that exist")
    ids = [t for t in re.findall(r"[A-Za-z0-9_\-]{5,}", str(d.get("source", ""))) if re.search(r"\d|_", t)]
    if ids and not any(i.lower() in text.lower() for i in ids):
        errs.append(f"dataset id from 'source' ({ids}) never appears in the tool results: use the id the tool returned")
    if errs:
        print("FAIL provenance " + path); [print(" - " + e) for e in errs]; return 1
    print(f"OK provenance {path}: {ratio:.0%} of {len(vals)} distinct values found in {len(calls)} europa calls ({', '.join(sorted(set(calls)))})")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1], sys.argv[2]) if len(sys.argv) > 2 else 2)
