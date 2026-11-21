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


if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit("usage: trace.py text|tools <trace.jsonl>")
    if sys.argv[1] == "text":
        print(final_text(sys.argv[2]))
    else:
        txt, names = europa_results(sys.argv[2])
        print(f"{len(names)} europa calls: {', '.join(names)}; {len(txt)} chars of results")
