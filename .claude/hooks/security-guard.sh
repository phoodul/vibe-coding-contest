#!/bin/bash
# PreToolUse: Bash 명령어 실행 전 위험 패턴 차단
# exit 0 = 통과, exit 2 = 차단

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | grep -oP '"command"\s*:\s*"\K[^"]*' 2>/dev/null)

# rm -rf 루트/홈/상위 디렉토리
if echo "$COMMAND" | grep -qE 'rm\s+-rf\s+(/|~|\.\.)'; then
  echo "BLOCKED: rm -rf on critical path" >&2
  exit 2
fi

# git push --force main/master
if echo "$COMMAND" | grep -qE 'git\s+push\s+.*--force.*(main|master)'; then
  echo "BLOCKED: force push to main/master. Use a feature branch instead." >&2
  exit 2
fi

# git reset --hard
if echo "$COMMAND" | grep -qE 'git\s+reset\s+--hard'; then
  echo "BLOCKED: git reset --hard. Use git stash or git checkout <file> instead." >&2
  exit 2
fi

# curl/wget pipe to bash
if echo "$COMMAND" | grep -qE '(curl|wget)\s.*\|\s*(ba)?sh'; then
  echo "BLOCKED: piping remote script to shell. Download and review first." >&2
  exit 2
fi

# cat .env (시크릿 유출)
if echo "$COMMAND" | grep -qE '(cat|less|more|head|tail)\s+\.env'; then
  echo "BLOCKED: reading .env file. Use env variable references instead." >&2
  exit 2
fi

# npm config set (글로벌 설정 변경)
if echo "$COMMAND" | grep -qE 'npm\s+config\s+set'; then
  echo "BLOCKED: modifying global npm config." >&2
  exit 2
fi

exit 0
