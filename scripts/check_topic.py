#!/usr/bin/env python3
"""Gate for TOPIC tasks: the topic file must render from JSON, never from typed-in numbers."""
import re, sys
p = sys.argv[1]; s = open(p).read(); errs = []
name = p.rsplit("/", 1)[-1][:-3]
if f"Topics.{name}" not in s: errs.append(f"file must define Topics.{name} = function ({{ el, data, Kit }}) {{ ... }}")
if "data.rows" not in s and "rows" not in s: errs.append("must read data.rows")
if re.search(r"\[\s*-?\d+(\.\d+)?\s*(,\s*-?\d+(\.\d+)?\s*){5,}\]", s): errs.append("hard-coded numeric array found: all numbers must come from data.rows (JSON), never typed in")
if len(s.splitlines()) > 260: errs.append("file longer than 260 lines: simplify")
if "Kit.destroyAll" not in s: errs.append("draw() must call Kit.destroyAll() first (otherwise charts leak on filter change)")
if errs: print("FAIL " + p); [print(" - " + e) for e in errs]; sys.exit(1)
print("topic file OK: " + p)
