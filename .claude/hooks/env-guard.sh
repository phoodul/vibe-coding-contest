#!/bin/bash
# =============================================================
# Claude Code PreToolUse Hook — Env File Guard
# 역할: .env, .key, .pem 등 시크릿 파일의 Edit/Write를 차단
# 매칭: Edit, Write 도구
# =============================================================

INPUT=$(cat)
FILE=$(echo "$INPUT" | grep -oP '"file_path"\s*:\s*"\K[^"]*' 2>/dev/null)

if [ -z "$FILE" ]; then
  exit 0
fi

# .env.example은 시크릿이 아니므로 허용
if echo "$FILE" | grep -qE '\.env\.example$'; then
  exit 0
fi

# .env 파일 수정 차단
if echo "$FILE" | grep -qE '\.(env|env\..+|key|pem|secret|credentials)$'; then
  echo "BLOCKED: 시크릿 파일($FILE) 수정 시도. 직접 수정하세요." >&2
  exit 2
fi

# serviceAccountKey 등 차단
if echo "$FILE" | grep -qiE '(serviceaccount|credential|secret).*\.(json|yaml|yml)$'; then
  echo "BLOCKED: 인증 파일($FILE) 수정 시도. 직접 수정하세요." >&2
  exit 2
fi

exit 0
