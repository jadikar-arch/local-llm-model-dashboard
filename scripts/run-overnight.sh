#!/usr/bin/env bash
# Unattended driver: one FRESH Claude Code session (local qwen3-coder:30b via Ollama) per task.
# Fresh sessions keep the small context window clean; state lives in tasks.md / PROGRESS.md / git.
# Usage:  bash scripts/run-overnight.sh            (see PLAN.md section 2 for the one-time Ollama setup)
set -u
cd "$(dirname "$0")/.."
ROOT="$(pwd -P)"      # real path: Claude Code resolves symlinks (e.g. /tmp -> /private/tmp) when it checks project trust
MODEL="${MODEL:-qwen3-coder:30b}"
PORT="${PORT:-8000}"
DEADLINE_HOURS="${DEADLINE_HOURS:-9}"      # hard stop
TASK_TIMEOUT="${TASK_TIMEOUT:-2700}"       # seconds per attempt (45 min)
MAX_ATTEMPTS="${MAX_ATTEMPTS:-3}"
MAX_TURNS="${MAX_TURNS:-45}"
DATA_TURNS="${DATA_TURNS:-60}"          # data tasks explore tools first
mkdir -p logs .state qa
START=$(date +%s); DEADLINE=$(awk -v s="$START" -v h="$DEADLINE_HOURS" 'BEGIN{printf "%d", s + h*3600}')   # DEADLINE_HOURS may be decimal, e.g. 0.2
say() { echo "[$(date +%H:%M:%S)] $*" | tee -a logs/driver.log; }

# ---- preflight -------------------------------------------------------------
command -v claude >/dev/null || { echo "claude CLI not found"; exit 1; }
curl -sf http://localhost:11434/api/tags | grep -q "$MODEL" || { echo "Ollama not running or $MODEL missing (ollama pull $MODEL)"; exit 1; }
[ -d node_modules/playwright-core ] || npm install >/dev/null 2>&1
git rev-parse --git-dir >/dev/null 2>&1 || git init -q
BR="overnight/$(date +%Y%m%d-%H%M)"; git checkout -q -b "$BR" 2>/dev/null; say "branch $BR, model $MODEL, deadline ${DEADLINE_HOURS}h"

# ---- environment for Claude Code -> Ollama ----------------------------------
export ANTHROPIC_BASE_URL="http://localhost:11434" ANTHROPIC_AUTH_TOKEN="ollama" ANTHROPIC_API_KEY=""
export ANTHROPIC_MODEL="$MODEL" ANTHROPIC_DEFAULT_OPUS_MODEL="$MODEL" ANTHROPIC_DEFAULT_SONNET_MODEL="$MODEL" \
       ANTHROPIC_DEFAULT_HAIKU_MODEL="$MODEL" CLAUDE_CODE_SUBAGENT_MODEL="$MODEL"
# Isolate the local model from the human's personal Claude setup (plugins like superpowers, hooks, global CLAUDE.md, 16k tokens of noise):
CFG="$ROOT/.state/claude-home"; mkdir -p "$CFG"
python3 - "$CFG" "$ROOT" <<'PY'
import json,sys; cfg,root=sys.argv[1:]
json.dump({"hasCompletedOnboarding":True,"projects":{root:{"hasTrustDialogAccepted":True,"allowedTools":[]}}},open(cfg+"/.claude.json","w"))
PY
export CLAUDE_CONFIG_DIR="$CFG" MAX_MCP_OUTPUT_TOKENS=12000    # a single tool result may not exceed ~12k tokens (64k window)
TOOLS="Bash,Read,Edit,Write,Glob,Grep,ToolSearch"
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1 DISABLE_TELEMETRY=1 DISABLE_AUTOUPDATER=1

# ---- background helpers ------------------------------------------------------
caffeinate -dimsu -w $$ >/dev/null 2>&1 &                       # keep the Mac awake
python3 -m http.server "$PORT" >/dev/null 2>&1 & SERVER=$!
trap 'exit 130' INT TERM
trap '[ -n "${CP:-}" ] && kill -TERM -- -"$CP" 2>/dev/null; kill $SERVER 2>/dev/null; say "driver stopped"' EXIT   # CP = process group of the current claude session
sleep 1


next_task() { grep -m1 -E '^- \[ \] ' tasks.md; }
field() { echo "$1" | awk -F'|' -v n="$2" '{gsub(/^[ \t]+|[ \t]+$/,"",$n); print $n}'; }
mark() { # mark ID char
  python3 - "$1" "$2" <<'PY'
import sys,re
i,c=sys.argv[1],sys.argv[2]; t=open("tasks.md").read()
t=re.sub(r"^- \[.\] "+re.escape(i)+r" ", f"- [{c}] {i} ", t, flags=re.M); open("tasks.md","w").write(t)
PY
}

gate() { # returns 0 if the deliverable passes the objective check for this task type
  local type="$1" c="$2" topic="$3" trace="${4:-}"
  case "$type" in
    DATA)  python3 scripts/validate_data.py "site/data/$c/$topic.json" && python3 scripts/check_provenance.py "site/data/$c/$topic.json" "$trace" ;;
    SHELL) [ -f "site/$c/index.html" ] && [ -f "site/$c/app.js" ] && node --check "site/$c/app.js" && echo OK ;;
    TOPIC) node --check "site/$c/topics/$topic.js" && python3 scripts/check_topic.py "site/$c/topics/$topic.js" ;;
    QA|POLISH) node scripts/qa.mjs "$c" "$PORT" ;;
    HOME)  node scripts/qa.mjs home "$PORT" ;;
    SMOKE) node scripts/qa.mjs demo "$PORT" ;;
    DOCS)  [ -s RESULTS.md ] && echo OK ;;
    *)     echo OK ;;
  esac
}

ITER=0
while :; do
  NOW=$(date +%s); [ "$NOW" -ge "$DEADLINE" ] && { say "deadline reached"; break; }
  LINE="$(next_task)" || true; [ -z "${LINE:-}" ] && { say "no open tasks"; break; }
  BODY="${LINE#- \[ \] }"; ID="$(field "$BODY" 1)"; TYPE="$(field "$BODY" 2)"; C="$(field "$BODY" 3)"; TOPIC="$(field "$BODY" 4)"
  ATT_FILE=".state/attempts-$ID"; ATT=$(( $(cat "$ATT_FILE" 2>/dev/null || echo 0) + 1 )); echo "$ATT" > "$ATT_FILE"
  if [ "$ATT" -gt "$MAX_ATTEMPTS" ]; then mark "$ID" '!'; say "$ID BLOCKED after $MAX_ATTEMPTS attempts"; continue; fi
  if [ "$TYPE" = "TOPIC" ] && [ ! -s "site/data/$C/$TOPIC.json" ]; then mark "$ID" '!'; say "$ID BLOCKED: no data file site/data/$C/$TOPIC.json (its DATA task failed)"; continue; fi
  ITER=$((ITER+1)); say "=== $ID ($TYPE $C $TOPIC) attempt $ATT ==="
  FB=""; [ -s ".state/feedback-$ID.txt" ] && FB="
PREVIOUS ATTEMPT FAILED THE AUTOMATIC CHECK. Fix exactly this:
$(tail -c 1800 ".state/feedback-$ID.txt")"
  PROMPT="You are running UNATTENDED overnight. Nobody can answer questions: decide yourself, never ask.
YOUR ONE TASK (do only this, then stop):
$BODY
$FB
Steps: 1) Read .claude/skills/dashboard-builder/references/task-$(echo "$TYPE" | tr 'A-Z' 'a-z').md and follow it. 2) Read the last 25 lines of PROGRESS.md for context. 3) Do the work in small steps, verifying each. 4) Append 3 lines to PROGRESS.md (what you did, decisions, gotchas). 5) Your final message must end with the single word TASK_DONE if finished and verified, or TASK_BLOCKED if impossible (explain why in PROGRESS.md).
Write TASK_DONE (or TASK_BLOCKED) only as the last word of your final reply; never run echo TASK_DONE in Bash. Do not edit files under .claude/ , scripts/ , tasks.md or CLAUDE.md.
This session is recorded to logs/$ID-attempt$ATT.jsonl (used by the automatic data check; do not open that file, only pass its path to scripts)."
  cp tasks.md .state/tasks.before
  TRACE="logs/$ID-attempt$ATT.jsonl"; LOG="logs/$ID-attempt$ATT.log"      # TRACE = full tool-call record (proves where data came from)
  TURNS="$MAX_TURNS"; [ "$TYPE" = "DATA" ] && TURNS="$DATA_TURNS"
  # DATA tasks see only the europa MCP with all tool schemas loaded up front (no deferred ToolSearch guessing); every other task sees only Playwright.
  MCPCFG=".mcp.ui.json"; TSEARCH="true"; [ "$TYPE" = "DATA" ] && { MCPCFG=".mcp.data.json"; TSEARCH="false"; }
  # The session runs in its OWN process group (setsid), so cleanup kills exactly its MCP servers and nothing else on the machine.
  ENABLE_TOOL_SEARCH="$TSEARCH" python3 -c 'import os,sys; os.setsid(); os.execvp(sys.argv[1], sys.argv[1:])' \
    claude -p "$PROMPT" --model "$MODEL" --dangerously-skip-permissions --strict-mcp-config --mcp-config "$MCPCFG" \
         --setting-sources project,local --tools "$TOOLS" --max-turns "$TURNS" --output-format stream-json --verbose < /dev/null > "$TRACE" 2> "$LOG.err" &
  CP=$!; ( sleep "$TASK_TIMEOUT"; kill -TERM -- -"$CP" 2>/dev/null ) & WD=$!
  wait "$CP"; kill "$WD" 2>/dev/null; kill -TERM -- -"$CP" 2>/dev/null; sleep 1; kill -KILL -- -"$CP" 2>/dev/null; CP=""
  python3 scripts/tracelib.py text "$TRACE" > "$LOG" 2>&1; python3 scripts/tracelib.py tools "$TRACE" >> "$LOG" 2>&1

  say "$ID stats: $(python3 scripts/tracelib.py stats "$TRACE")"
  TAMPER=""
  if ! cmp -s tasks.md .state/tasks.before; then TAMPER="$TAMPER tasks.md"; cp .state/tasks.before tasks.md; fi
  # HIGH severity (fails the attempt): changes to the gates / harness. LOW (reverted + logged, attempt still judged on its deliverable): edits to the skill docs.
  HIGHP="scripts CLAUDE.md PLAN.md .mcp.json .mcp.data.json .mcp.ui.json .claude/settings.json"
  CH="$(git status --porcelain -- $HIGHP | awk '{print $2}' | tr '\n' ' ')"
  if [ -n "$CH" ]; then TAMPER="$TAMPER $CH"; git ls-files -m -d -- $HIGHP | xargs git checkout -q -- 2>/dev/null; git clean -fdq -- scripts 2>/dev/null; fi
  CHL="$(git status --porcelain -- .claude/skills | awk '{print $2}' | tr '\n' ' ')"
  if [ -n "$CHL" ]; then say "$ID NOTE: reverted edits to skill docs: $CHL"; git ls-files -m -d -- .claude/skills | xargs git checkout -q -- 2>/dev/null; git clean -fdq -- .claude/skills 2>/dev/null; fi
  AUDIT="$(python3 scripts/tracelib.py audit "$TRACE" 2>&1)"; ARC=$?
  echo "$AUDIT" | grep -q "^NOTE" && say "$ID $(echo "$AUDIT" | grep "^NOTE" | tr '\n' ' ' | cut -c1-300)"
  [ -n "$TAMPER" ] && { AUDIT="$AUDIT
RULE VIOLATION: you modified protected files (reverted):$TAMPER"; ARC=1; }
  [ "$ARC" -ne 0 ] && say "$ID VIOLATION: $(echo "$AUDIT" | tr '\n' ' ' | cut -c1-300)"
  if grep -q "TASK_BLOCKED" "$LOG"; then mark "$ID" '!'; say "$ID reported BLOCKED"; git add -A; git commit -qm "overnight: $ID blocked" ; continue; fi
  GOUT="$(gate "$TYPE" "$C" "$TOPIC" "$TRACE" 2>&1)"; GRC=$?
  [ "$ARC" -ne 0 ] && { GRC=1; GOUT="$AUDIT
$GOUT"; }
  if [ "$GRC" -eq 0 ] && grep -q "TASK_DONE" "$LOG"; then
    mark "$ID" x; rm -f ".state/feedback-$ID.txt"; say "$ID DONE"
  else
    printf '%s\n' "$GOUT" | tail -c 2000 > ".state/feedback-$ID.txt"
    [ "$GRC" -eq 0 ] && echo "The checks pass but you did not finish with TASK_DONE; verify your work and end with TASK_DONE." >> ".state/feedback-$ID.txt"
    say "$ID not accepted (gate rc=$GRC); will retry"
  fi
  git add -A; git commit -qm "overnight: $ID attempt $ATT" 2>/dev/null
done

DONE=$(grep -c '^- \[x\]' tasks.md); BLK=$(grep -c '^- \[!\]' tasks.md); OPEN=$(grep -c '^- \[ \]' tasks.md)
{ echo "# Overnight run summary ($(date))"; echo "done=$DONE blocked=$BLK open=$OPEN iterations=$ITER"; grep '^- \[!\]' tasks.md; } > logs/SUMMARY.md
say "finished: done=$DONE blocked=$BLK open=$OPEN"; git add -A; git commit -qm "overnight: summary" 2>/dev/null
