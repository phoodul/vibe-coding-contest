#!/bin/bash
# =============================================================
# 바이브코딩 2026 — 프로젝트 초기화 자동화 스크립트
# 역할: Day 1에 실행하여 30분 → 5분으로 프로젝트 셋업 단축
#
# 사용법:
#   bash templates/scripts/init-project.sh <프로젝트명>
#
# 예시:
#   bash templates/scripts/init-project.sh my-awesome-app
# =============================================================

set -e

PROJECT_NAME="${1:-vibe-app}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BOILERPLATE="$REPO_ROOT/templates/boilerplate"

echo ""
echo "=========================================="
echo " 바이브코딩 2026 — 프로젝트 초기화"
echo " 프로젝트명: $PROJECT_NAME"
echo "=========================================="
echo ""

# ---------------------------------------------------------
# Step 1: Next.js 15 프로젝트 생성
# ---------------------------------------------------------
echo "[1/8] Next.js 15 프로젝트 생성..."
cd "$REPO_ROOT"

npx create-next-app@latest "$PROJECT_NAME" \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*" \
  --turbopack \
  --skip-install

# 생성된 프로젝트 내부의 파일을 repo root로 이동
echo "[1/8] 프로젝트 파일을 repo root로 이동..."
shopt -s dotglob 2>/dev/null || true
cp -rn "$PROJECT_NAME"/* "$REPO_ROOT"/ 2>/dev/null || true
cp -rn "$PROJECT_NAME"/.* "$REPO_ROOT"/ 2>/dev/null || true
rm -rf "$PROJECT_NAME"

# ---------------------------------------------------------
# Step 2: Shadcn/ui 초기화
# ---------------------------------------------------------
echo "[2/8] Shadcn/ui 설정 복사..."
cp "$BOILERPLATE/components.json" "$REPO_ROOT/components.json"

# ---------------------------------------------------------
# Step 3: 의존성 설치
# ---------------------------------------------------------
echo "[3/8] 의존성 설치..."
cd "$REPO_ROOT"

# Production 의존성
npm install \
  @supabase/supabase-js @supabase/ssr \
  ai @ai-sdk/anthropic \
  framer-motion \
  next-themes \
  sonner \
  zod \
  lucide-react \
  clsx tailwind-merge class-variance-authority \
  tailwindcss-animate

# Dev 의존성
npm install -D \
  lefthook \
  @commitlint/cli @commitlint/config-conventional \
  prettier prettier-plugin-tailwindcss \
  eslint-config-prettier \
  vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom \
  @playwright/test

# ---------------------------------------------------------
# Step 4: Shadcn/ui 필수 컴포넌트 설치
# ---------------------------------------------------------
echo "[4/8] Shadcn/ui 필수 컴포넌트 설치..."
npx shadcn@latest add -y \
  button card dialog toast input label badge skeleton \
  sheet dropdown-menu separator avatar

# ---------------------------------------------------------
# Step 5: 보일러플레이트 파일 복사
# ---------------------------------------------------------
echo "[5/8] 보일러플레이트 파일 복사..."

# lib/supabase/ 클라이언트
mkdir -p "$REPO_ROOT/lib/supabase"
cp "$BOILERPLATE/lib/supabase/client.ts" "$REPO_ROOT/lib/supabase/client.ts"
cp "$BOILERPLATE/lib/supabase/server.ts" "$REPO_ROOT/lib/supabase/server.ts"
cp "$BOILERPLATE/lib/supabase/middleware.ts" "$REPO_ROOT/lib/supabase/middleware.ts"

# lib/utils.ts (cn 헬퍼 — Shadcn이 생성하지만 확실히 덮어씀)
cp "$BOILERPLATE/lib/utils.ts" "$REPO_ROOT/lib/utils.ts"

# 루트 middleware.ts (Supabase Auth)
cp "$BOILERPLATE/middleware.ts" "$REPO_ROOT/middleware.ts"

# .env.example
cp "$BOILERPLATE/.env.example" "$REPO_ROOT/.env.example"

# tailwind.config.ts (디자인 토큰)
cp "$BOILERPLATE/tailwind.config.ts" "$REPO_ROOT/tailwind.config.ts"

# ESLint + Prettier 설정
cp "$BOILERPLATE/eslint.config.mjs" "$REPO_ROOT/eslint.config.mjs"
cp "$BOILERPLATE/prettier.config.js" "$REPO_ROOT/prettier.config.js"

# Vitest 설정 + 테스트 구조
cp "$BOILERPLATE/vitest.config.ts" "$REPO_ROOT/vitest.config.ts"
mkdir -p "$REPO_ROOT/__tests__/unit"
cp "$BOILERPLATE/__tests__/setup.ts" "$REPO_ROOT/__tests__/setup.ts"
cp "$BOILERPLATE/__tests__/unit/utils.test.ts" "$REPO_ROOT/__tests__/unit/utils.test.ts"

# Playwright 설정 + smoke 테스트
cp "$BOILERPLATE/playwright.config.ts" "$REPO_ROOT/playwright.config.ts"
mkdir -p "$REPO_ROOT/e2e"
cp "$BOILERPLATE/e2e/smoke.spec.ts" "$REPO_ROOT/e2e/smoke.spec.ts"

# Lefthook + Commitlint 설정
cp "$BOILERPLATE/lefthook.yml" "$REPO_ROOT/lefthook.yml"
cp "$BOILERPLATE/commitlint.config.js" "$REPO_ROOT/commitlint.config.js"

# globals.css (디자인 시스템 — create-next-app 기본값 덮어씀)
cp "$BOILERPLATE/app/globals.css" "$REPO_ROOT/app/globals.css"

# 로고 파일 복사
mkdir -p "$REPO_ROOT/public"
cp "$REPO_ROOT/public/logo.png" "$REPO_ROOT/public/logo.png" 2>/dev/null || true
cp "$REPO_ROOT/public/logo-nav.png" "$REPO_ROOT/public/logo-nav.png" 2>/dev/null || true
cp "$REPO_ROOT/public/favicon.png" "$REPO_ROOT/public/favicon.png" 2>/dev/null || true

# ---------------------------------------------------------
# Step 6: package.json scripts 추가 + Lefthook 설치
# ---------------------------------------------------------
echo "[6/8] npm scripts 추가 + Lefthook 설치..."

# package.json에 커스텀 스크립트 추가
node -e "
const pkg = require('./package.json');
pkg.scripts = {
  ...pkg.scripts,
  'lint:fix': 'next lint --fix',
  'format': 'prettier --write .',
  'typecheck': 'tsc --noEmit',
  'test': 'vitest run',
  'test:watch': 'vitest',
  'test:coverage': 'vitest run --coverage',
  'test:e2e': 'playwright test',
  'test:e2e:ui': 'playwright test --ui',
  'quality': 'npm run typecheck && npm run lint && npm run test',
  'prepare': 'lefthook install',
};
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"

npx lefthook install

# Playwright 브라우저 설치
npx playwright install chromium

# ---------------------------------------------------------
# Step 7: 디렉토리 구조 생성
# ---------------------------------------------------------
echo "[7/8] 프로젝트 디렉토리 구조 생성..."
mkdir -p "$REPO_ROOT/app/api/chat"
mkdir -p "$REPO_ROOT/app/(auth)/login"
mkdir -p "$REPO_ROOT/app/(auth)/signup"
mkdir -p "$REPO_ROOT/app/dashboard"
mkdir -p "$REPO_ROOT/components/ui"
mkdir -p "$REPO_ROOT/components/layout"
mkdir -p "$REPO_ROOT/components/shared"
mkdir -p "$REPO_ROOT/hooks"
mkdir -p "$REPO_ROOT/lib/ai"
mkdir -p "$REPO_ROOT/types"

# ---------------------------------------------------------
# Step 8: 확인
# ---------------------------------------------------------
echo "[8/8] 설정 확인..."
echo ""

if [ -f "$REPO_ROOT/package.json" ]; then
  echo "  package.json ......... OK"
else
  echo "  package.json ......... MISSING"
fi

if [ -f "$REPO_ROOT/middleware.ts" ]; then
  echo "  middleware.ts ........ OK"
else
  echo "  middleware.ts ........ MISSING"
fi

if [ -f "$REPO_ROOT/lib/supabase/client.ts" ]; then
  echo "  supabase clients ..... OK"
else
  echo "  supabase clients ..... MISSING"
fi

if [ -f "$REPO_ROOT/components.json" ]; then
  echo "  components.json ...... OK"
else
  echo "  components.json ...... MISSING"
fi

if [ -d "$REPO_ROOT/node_modules" ]; then
  echo "  node_modules ......... OK"
else
  echo "  node_modules ......... MISSING"
fi

echo ""
echo "=========================================="
echo " 초기화 완료!"
echo ""
echo " 다음 단계:"
echo "   1. .env 파일에 실제 키 입력"
echo "   2. Vercel에 배포 확인 (git push)"
echo "   3. Supabase 테이블 생성"
echo "   4. 코딩 시작!"
echo "=========================================="
