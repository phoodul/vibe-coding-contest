#!/bin/bash
# =============================================================
# Claude Code Quality Gate — 통합 품질 검증 + AI 피드백 루프
# 역할: lint + typecheck + test 실행 → 실패 시 결과를 Claude에 재주입
# 사용: PostToolUse(Edit/Write) + Stop hook
#
# 출력이 Claude 컨텍스트에 주입되므로, 실패 내용을 보고
# Claude가 자동으로 수정을 시도한다.
# =============================================================

PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-/c/Users/JSS/vibe-coding-contest}"

# 프로젝트 미초기화 → 스킵
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
  exit 0
fi
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
  exit 0
fi

cd "$PROJECT_ROOT"

ERRORS=""
WARNINGS=""

# ─── 1. TypeScript 타입 체크 ───
TSC_OUTPUT=$(npx tsc --noEmit --pretty 2>&1)
TSC_EXIT=$?
if [ $TSC_EXIT -ne 0 ]; then
  ERRORS="$ERRORS
=== TypeScript Errors ===
$(echo "$TSC_OUTPUT" | head -30)
"
fi

# ─── 2. ESLint (변경된 파일만) ───
CHANGED_FILES=$(git diff --name-only HEAD 2>/dev/null | grep -E '\.(ts|tsx)$' | tr '\n' ' ')
if [ -n "$CHANGED_FILES" ]; then
  LINT_OUTPUT=$(npx eslint $CHANGED_FILES 2>&1)
  LINT_EXIT=$?
  if [ $LINT_EXIT -ne 0 ]; then
    WARNINGS="$WARNINGS
=== ESLint Issues ===
$(echo "$LINT_OUTPUT" | head -20)
"
  fi
fi

# ─── 3. 단위 테스트 (빠른 실행) ───
if [ -f "$PROJECT_ROOT/vitest.config.ts" ]; then
  TEST_OUTPUT=$(npx vitest run --reporter=verbose 2>&1 | tail -20)
  TEST_EXIT=$?
  if [ $TEST_EXIT -ne 0 ]; then
    ERRORS="$ERRORS
=== Test Failures ===
$TEST_OUTPUT
"
  fi
fi

# ─── 결과 출력 (Claude 컨텍스트에 주입) ───
if [ -n "$ERRORS" ]; then
  echo "Quality Gate FAILED — 아래 문제를 수정해주세요:" >&2
  echo "$ERRORS" >&2
  # exit 1: 경고로 Claude에 전달 (작업은 계속)
  exit 1
fi

if [ -n "$WARNINGS" ]; then
  echo "Quality Gate PASSED with warnings:" >&2
  echo "$WARNINGS" >&2
  exit 0
fi

# 모두 통과
exit 0
