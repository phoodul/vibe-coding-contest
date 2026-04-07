#!/bin/bash
# PreToolUse: .env 등 시크릿 파일 수정 차단
# exit 0 = 통과, exit 2 = 차단

INPUT=$(cat)
FILE=$(echo "$INPUT" | grep -oP '"file_path"\s*:\s*"\K[^"]*' 2>/dev/null)

if [ -z "$FILE" ]; then
  exit 0
fi

BASENAME=$(basename "$FILE")

# .env, .env.local, .env.production 등 차단 (.env.example 허용)
if [[ "$BASENAME" =~ ^\.env(\..+)?$ ]] && [[ "$BASENAME" != ".env.example" ]]; then
  echo "BLOCKED: modifying $BASENAME. Edit .env files manually." >&2
  exit 2
fi

# credentials, secrets 파일 차단
if [[ "$BASENAME" =~ (credentials|secrets|\.key|\.pem)$ ]]; then
  echo "BLOCKED: modifying sensitive file $BASENAME." >&2
  exit 2
fi

exit 0
