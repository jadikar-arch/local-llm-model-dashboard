#!/usr/bin/env bash
# Unattended driver: one FRESH Claude Code session (local qwen3-coder:30b via Ollama) per task.
# Fresh sessions keep the small context window clean; state lives in tasks.md / PROGRESS.md / git.
# Usage:  bash scripts/run-overnight.sh            (see PLAN.md section 2 for the one-time Ollama setup)
set -u
cd "$(dirname "$0")/.."
ROOT="$PWD"
MODEL="${MODEL:-qwen3-coder:30b}"
PORT="${PORT:-8000}"
DEADLINE_HOURS="${DEADLINE_HOURS:-9}"      # hard stop
TASK_TIMEOUT="${TASK_TIMEOUT:-2700}"       # seconds per attempt (45 min)
MAX_ATTEMPTS="${MAX_ATTEMPTS:-3}"
MAX_TURNS="${MAX_TURNS:-45}"
mkdir -p logs .state qa
START=$(date +%s); DEADLINE=$((START + DEADLINE_HOURS*3600))
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
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1 DISABLE_TELEMETRY=1 DISABLE_AUTOUPDATER=1

# ---- background helpers ------------------------------------------------------
caffeinate -dimsu -w $$ >/dev/null 2>&1 &                       # keep the Mac awake
python3 -m http.server "$PORT" >/dev/null 2>&1 & SERVER=$!
trap 'kill $SERVER 2>/dev/null; say "driver stopped"' EXIT
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
  local type="$1" c="$2" topic="$3"
  case "$type" in
    DATA)  python3 scripts/validate_data.py "site/data/$c/$topic.json" ;;
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
  ITER=$((ITER+1)); say "=== $ID ($TYPE $C $TOPIC) attempt $ATT ==="
  FB=""; [ -s ".state/feedback-$ID.txt" ] && FB="
PREVIOUS ATTEMPT FAILED THE AUTOMATIC CHECK. Fix exactly this:
$(tail -c 1800 ".state/feedback-$ID.txt")"
  PROMPT="You are running UNATTENDED overnight. Nobody can answer questions: decide yourself, never ask.
YOUR ONE TASK (do only this, then stop):
$BODY
$FB
Steps: 1) Read .claude/skills/dashboard-builder/references/task-$(echo "$TYPE" | tr 'A-Z' 'a-z').md and follow it. 2) Read the last 25 lines of PROGRESS.md for context. 3) Do the work in small steps, verifying each. 4) Append 3 lines to PROGRESS.md (what you did, decisions, gotchas). 5) Your final message must end with the single word TASK_DONE if finished and verified, or TASK_BLOCKED if impossible (explain why in PROGRESS.md)."
  LOG="logs/$ID-attempt$ATT.log"
  claude -p "$PROMPT" --model "$MODEL" --dangerously-skip-permissions --strict-mcp-config --mcp-config .mcp.json \
         --max-turns "$MAX_TURNS" > "$LOG" 2>&1 &
  CP=$!; ( sleep "$TASK_TIMEOUT"; kill "$CP" 2>/dev/null ) & WD=$!
  wait "$CP"; kill "$WD" 2>/dev/null; pkill -f "@playwright/mcp" 2>/dev/null

  if grep -q "TASK_BLOCKED" "$LOG"; then mark "$ID" '!'; say "$ID reported BLOCKED"; git add -A; git commit -qm "overnight: $ID blocked" ; continue; fi
  GOUT="$(gate "$TYPE" "$C" "$TOPIC" 2>&1)"; GRC=$?
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
