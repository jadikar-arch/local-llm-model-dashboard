#!/usr/bin/env python3
"""Helpers for the stream-json trace of one claude session (logs/<ID>-attemptN.jsonl).
  python3 scripts/tracelib.py text  <trace.jsonl>   -> final assistant text (used for TASK_DONE detection)
  python3 scripts/tracelib.py tools <trace.jsonl>   -> one line per europa tool call (what the model fetched)
Importable: europa_results(path) -> (concatenated text of all europa tool RESULTS, list of tool names called)."""
import json, sys


def events(path):
    for line in open(path, errors="replace"):
        line = line.strip()
        if not line.startswith("{"):
            continue
        try:
            yield json.loads(line)
        except Exception:
            pass


def _text(content):
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "\n".join(c.get("text", "") for c in content if isinstance(c, dict) and c.get("type") == "text")
    return ""


def final_text(path):
    last_assistant, result = "", None
    for e in events(path):
        if e.get("type") == "result":
            result = e.get("result") or ""
        elif e.get("type") == "assistant":
            for c in e.get("message", {}).get("content", []):
                if isinstance(c, dict) and c.get("type") == "text":
                    last_assistant = c["text"]
    return result if result is not None else last_assistant


def europa_results(path):
    """Only results of mcp__europa__* tools count as provenance (never Bash output the model could have typed itself)."""
    names, ids, chunks = [], {}, []
    for e in events(path):
        msg = e.get("message", {})
        if e.get("type") == "assistant":
            for c in msg.get("content", []):
                if isinstance(c, dict) and c.get("type") == "tool_use":
                    ids[c["id"]] = c["name"]
                    if c["name"].startswith("mcp__europa__"):
                        names.append(c["name"].replace("mcp__europa__", ""))
        elif e.get("type") == "user":
            for c in msg.get("content", []) if isinstance(msg.get("content"), list) else []:
                if isinstance(c, dict) and c.get("type") == "tool_result" and ids.get(c.get("tool_use_id", ""), "").startswith("mcp__europa__"):
                    chunks.append(_text(c.get("content")))
    return "\n".join(chunks), names


def tool_calls(path):
    for e in events(path):
        if e.get("type") == "assistant":
            for c in e.get("message", {}).get("content", []):
                if isinstance(c, dict) and c.get("type") == "tool_use":
                    yield c["name"], c.get("input", {})


def stats(path):
    """one-line research stats: turns, tool calls, max prompt tokens (context pressure), tool errors"""
    seen, maxin, errs, n_tools, n_eu, n_pw = set(), 0, 0, 0, 0, 0
    for e in events(path):
        m = e.get("message", {})
        if e.get("type") == "assistant":
            seen.add(m.get("id") or id(e)); maxin = max(maxin, (m.get("usage") or {}).get("input_tokens") or 0)
        elif e.get("type") == "user" and isinstance(m.get("content"), list):
            errs += sum(1 for c in m["content"] if isinstance(c, dict) and c.get("type") == "tool_result" and c.get("is_error"))
    for name, _ in tool_calls(path):
        n_tools += 1; n_eu += name.startswith("mcp__europa__"); n_pw += name.startswith("mcp__playwright__")
    return f"turns={len(seen)} tools={n_tools} europa={n_eu} playwright={n_pw} tool_errors={errs} max_prompt_tokens={maxin}" + (" CONTEXT_NEAR_LIMIT" if maxin > 58000 else "")


import re as _re
FORBIDDEN_CMD = [
    (r"\bgit\s+(show|checkout|restore|reflog|cat-file|stash|archive|tag|worktree)\b|\bgit\s+log\b.*(-p|--patch|--stat|--all|--follow)", "reading old git history"),
    (r"\b(curl|wget)\b|urllib|urlopen|requests\.(get|post)|http\.client|\bpip3?\s+install|\bnpm\s+(i|install)\b", "network access / installs outside the europa MCP"),
    (r"archive-run2|_legacy|\.state/claude-home", "reading archived or legacy material"),
]
PROTECTED = _re.compile(r"(^|/)(scripts/|\.claude/|CLAUDE\.md$|tasks\.md$|\.mcp\.json$|PLAN\.md$)")


def audit(path):
    """violations of the experiment rules visible in the tool-call trace"""
    bad = []
    for name, inp in tool_calls(path):
        blob = json.dumps(inp)
        if name in ("WebFetch", "WebSearch"):
            bad.append(f"used {name}")
        if name == "Bash":
            for rx, why in FORBIDDEN_CMD:
                if _re.search(rx, inp.get("command", "")):
                    bad.append(f"{why}: {inp.get('command','')[:90]}")
        elif _re.search(r"archive-run2|_legacy", blob):
            bad.append(f"{name} touched archived/legacy material")
        if name in ("Write", "Edit") and PROTECTED.search(inp.get("file_path", "")):
            bad.append(f"edited protected file {inp.get('file_path')}")
    return sorted(set(bad))


if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit("usage: trace.py text|tools <trace.jsonl>")
    if sys.argv[1] == "text":
        print(final_text(sys.argv[2]))
    elif sys.argv[1] == "stats":
        print(stats(sys.argv[2]))
    elif sys.argv[1] == "audit":
        v = audit(sys.argv[2])
        print("\n".join("RULE VIOLATION: " + x for x in v) if v else "audit ok"); sys.exit(1 if v else 0)
    else:
        txt, names = europa_results(sys.argv[2])
        print(f"{len(names)} europa calls: {', '.join(names)}; {len(txt)} chars of results")
