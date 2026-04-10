#!/bin/bash
# PostToolUse: Edit/Write 후 TypeScript 타입 체크
# 항상 exit 0 (경고만, 차단 안 함)

PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# 프로젝트 초기화 전이면 스킵
if [ ! -f "$PROJECT_ROOT/package.json" ]; then exit 0; fi
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then exit 0; fi
if [ ! -f "$PROJECT_ROOT/tsconfig.json" ]; then exit 0; fi

# tsc --noEmit 실행, 에러 상위 20줄만 출력
cd "$PROJECT_ROOT"
ERRORS=$(npx tsc --noEmit --pretty 2>&1 | head -20)

if [ $? -ne 0 ]; then
  echo "TypeScript errors detected:" >&2
  echo "$ERRORS" >&2
fi

exit 0
