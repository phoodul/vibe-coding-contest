#!/bin/bash
# =============================================================
# Claude Code PostToolUse Hook — Post-Edit Lint
# 역할: Edit/Write 후 TypeScript 타입 에러를 즉시 피드백
# 주의: Next.js 프로젝트 초기화 후에만 동작 (package.json 필요)
# =============================================================

PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-/c/Users/JSS/vibe-coding-contest}"

# package.json이 없으면 아직 프로젝트 미초기화 → 스킵
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
  exit 0
fi

# node_modules가 없으면 스킵
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
  exit 0
fi

# TypeScript 타입 체크 (빌드 없이 빠른 검증)
cd "$PROJECT_ROOT"
npx tsc --noEmit --pretty 2>&1 | head -20

# exit 0: 경고만 표시, 작업은 계속 진행
exit 0
