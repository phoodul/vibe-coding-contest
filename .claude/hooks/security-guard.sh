#!/bin/bash
# =============================================================
# Claude Code PreToolUse Hook — Security Guard
# 역할: 위험한 Bash 명령어를 실행 전에 차단 (exit 2 = 차단)
# =============================================================

# stdin으로 tool input JSON이 들어온다
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | grep -oP '"command"\s*:\s*"\K[^"]*' 2>/dev/null || echo "$INPUT")

# --- 차단 목록 (exit 2 = 실행 거부) ---

# 1. 파일시스템 파괴
if echo "$COMMAND" | grep -qE 'rm\s+(-rf|--force|-fr)\s+(/|~|\.\.)'; then
  echo "BLOCKED: 루트/홈/상위 디렉토리 삭제 시도" >&2
  exit 2
fi

# 2. Git 위험 명령어
if echo "$COMMAND" | grep -qE 'git\s+push\s+--force\s+(origin\s+)?(main|master)'; then
  echo "BLOCKED: main/master에 force push 시도" >&2
  exit 2
fi
if echo "$COMMAND" | grep -qE 'git\s+reset\s+--hard'; then
  echo "BLOCKED: git reset --hard 시도 — 데이터 손실 위험" >&2
  exit 2
fi

# 3. 원격 스크립트 실행
if echo "$COMMAND" | grep -qE 'curl.*\|\s*(ba)?sh|wget.*\|\s*(ba)?sh'; then
  echo "BLOCKED: 원격 스크립트 파이프 실행 시도" >&2
  exit 2
fi

# 4. 환경 변수/시크릿 유출
if echo "$COMMAND" | grep -qE '(cat|echo|print).*\.(env|key|pem|secret)'; then
  echo "BLOCKED: 시크릿 파일 내용 출력 시도" >&2
  exit 2
fi

# 5. 패키지 매니저 설정 변경
if echo "$COMMAND" | grep -qE 'npm\s+config\s+set|npmrc.*min-release-age'; then
  echo "BLOCKED: npm 글로벌 설정 변경 시도" >&2
  exit 2
fi

# 통과
exit 0
