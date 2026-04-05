#!/bin/bash
# =============================================================
# Claude Code Stop Hook — TypeScript Check
# 역할: Claude가 응답을 마칠 때 TypeScript 타입 에러를 확인
# next build보다 훨씬 빠른 tsc --noEmit 사용
# 프로젝트 초기화 후에만 동작
# =============================================================

PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-/c/Users/JSS/vibe-coding-contest}"

# package.json이 없으면 스킵
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
  exit 0
fi

# node_modules가 없으면 스킵
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
  exit 0
fi

# 최근 변경된 .ts/.tsx 파일이 있는 경우에만 체크
CHANGED=$(git -C "$PROJECT_ROOT" diff --name-only HEAD 2>/dev/null | grep -E '\.(ts|tsx)$' | head -1)
if [ -z "$CHANGED" ]; then
  exit 0
fi

cd "$PROJECT_ROOT"
echo "--- TypeScript Check ---"
npx tsc --noEmit --pretty 2>&1 | tail -15

exit 0
