#!/bin/bash
# Stop: Claude 응답 완료 시 .ts/.tsx 변경이 있으면 타입 체크
# 항상 exit 0 (경고만, 차단 안 함)

PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# 프로젝트 초기화 전이면 스킵
if [ ! -f "$PROJECT_ROOT/package.json" ]; then exit 0; fi
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then exit 0; fi

# .ts/.tsx 파일 변경 확인
cd "$PROJECT_ROOT"
CHANGED=$(git diff --name-only 2>/dev/null | grep -E '\.(ts|tsx)$')

if [ -z "$CHANGED" ]; then exit 0; fi

# tsc --noEmit (next build보다 가볍고 빠름)
ERRORS=$(npx tsc --noEmit --pretty 2>&1 | tail -10)

if [ $? -ne 0 ]; then
  echo "TypeScript errors on changed files:" >&2
  echo "$ERRORS" >&2
fi

exit 0
