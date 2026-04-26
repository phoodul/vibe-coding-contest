# Work Log — Euler Tutor 2.0

## 2026-04-26 (3차 세션 — 운영 라이브 + 베타 UX 완성)

### 진행 요약
세션 시작: KPI/Refactor/배포 자동화 → 베타 가입 디버깅 → 통합 UX 개선까지.
**production 라이브** 상태로 종료. 14 commits.

### 1. KPI/Refactor (5c559bb / ad33aef)
- 합성 10문항 + standalone eval 스크립트 (Manager+Retriever+Reasoner)
- tryParseJson 5곳 단일화, difficulty-classifier 죽은 코드 삭제
- layer-stats-updater last_failure_at 버그 + parse-image 인증 가드

### 2. Supabase 마이그레이션 + 시드 (e545986)
- 14 마이그레이션 적용 (euler_beta_invites ~ user_subscriptions + profiles 컬럼)
- 시드 32 도구 / 39 trigger / 78 임베딩 적재 ($0.0005)
- LEG-04 cron 컬럼명 정정

### 3. Railway SymPy μSvc 배포
- vibe-coding-contest-production.up.railway.app
- INTERNAL_TOKEN 인증 + 6 endpoints (differentiate/integrate/solve/simplify/factor/series)
- worker thread signal ValueError graceful skip (9a06d9d)

### 4. Vercel env 등록
- 19 row 등록 (8 평문 + 1 시크릿 토큰 × 2 환경 + CRON_SECRET production)
- Production force rebuild 로 NEXT_PUBLIC_* inline 정상화

### 5. 베타 가입 디버깅 — 5개 운영 버그
사용자가 production 첫 시도 시 발견된 일련의 버그들:
- 0d0e48f SW 외부 origin 가로채기
- b702b29 /auth/login 404 (실제는 /login)
- (Vercel build cache로 NEXT_PUBLIC_* inline 누락 — force rebuild)
- 8994eb2 redeem_euler_beta SQL ambiguous status

### 6. 통합 UX 개선 (사용자 피드백 기반)
사용자: "채팅과 필기는 별도 라우트가 아니라 한 세션의 입력 방식이어야"

- 7a1b822 채팅+필기 한 세션 통합 + 🆕 새 문제 + 📊 리포트 진입점
- ae5fee6 + 2da4ebb 주 1회 리포트 + 7일/10문제 자격 게이트
- 37c7db0 Vision LLM (Claude Sonnet 4.6) for 손글씨 한글 OCR
  · Mathpix 는 사진(인쇄체)에서만 사용
  · OCR 결과 미리보기 + 수정 textarea
- 4503583 OCR 결과 KaTeX 렌더링 (raw LaTeX 편집은 details 안)
- 7afdf15 입력창 확장 시 마지막 메시지 자동 스크롤

### 핵심 산출물
- 신규 페이지 + API + lib + 컴포넌트 풀스택 운영
- 배포 런북 (docs/deployment-runbook.md)
- KPI 평가 자동화 (scripts/eval-kpi.ts + data/kpi-eval-problems.json + docs/qa/kpi-evaluation.md)
- 14 마이그레이션 + 32 도구 시드 + Railway μSvc + Vercel 19 env

### 주요 정책
- Vision LLM for 손글씨 (한글+수식+손글씨)
- Mathpix for 사진 (인쇄체)
- 주 1회 리포트 + 자격 게이트 (7일+10문제)
- 베타 50명 cap (EULER2026)

### 다음 세션 시작 시
1. 베타 사용자 풀이 검증
2. 50명 모집 진행
3. 풀이 누적 7일+10문제 → 리포트 자동 표시 확인
4. KPI Full 측정 (~$0.16)
5. LEG-02 변호사 자문 (베타 검증 후)

### Token 효율
- 3차 세션 14 commits, 모두 production push 완료
- 운영 인프라 + UX 개선 + 디버깅 모두 한 세션 내 자율 진행
- 사용자 자율 권한 (Plan Preference) 활용으로 빠른 반복 가능

---

## 2026-04-26 (3차 세션 — KPI/Refactor/배포 자동화)

### 진행 요약 (B → D → A 순)
사용자 지시: "B(KPI 검증) → D(리팩터링) → A(배포 자동화)" 순서로 자율 진행.

**B 단계 (KPI 평가 자동화)**:
- 합성 10문항 + standalone 평가 스크립트 + 검증 문서 — 1 commit (`5c559bb`)
- Mock 모드 검증: expected_tools 10문항 ↔ 시드 32 tools 정확 매칭
- Full 모드는 인프라 동작 시점에 ~$0.16/회 측정 가능

**D 단계 (코드 리뷰)**:
- `tryParseJson` 5개 파일 중복 → `src/lib/euler/json.ts` 단일화
- `difficulty-classifier.ts` 삭제 (Manager 가 difficulty 분류 흡수, 호출처 없음)
- `layer-stats-updater.ts` ternary 우선순위 버그 수정 (`last_failure_at` 항상 null 이던 문제)
- `parse-image/route.ts` 인증 가드 추가 (Mathpix/Upstage 봇 어뷰징 방지) — 1 commit (`ad33aef`)
- tsc 0 errors + production build 통과

**A 단계 (배포 자동화)**:
- Supabase MCP 로 마이그레이션 13종 적용 (euler_beta_invites ~ user_subscriptions)
- profiles 에 graduated_at + anonymized_at 추가 마이그레이션 신규 작성 + 적용
- LEG-04 cron 코드의 컬럼명 정정 (`user_id` → `id`)
- Security advisor 권고 반영: `set_updated_at` search_path 명시
- `.env.example` 보강 (`SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`)
- `docs/deployment-runbook.md` 신규 — 시드/Railway/Vercel/베타/법무/KPI/모니터링 가이드

### 핵심 산출물 (3차 세션)
- `data/kpi-eval-problems.json`: 합성 10문항
- `scripts/eval-kpi.ts`: Manager+Retriever+Reasoner standalone 호출 + 4 KPI 측정
- `docs/qa/kpi-evaluation.md`: 검증 절차 + PASS 기준 + 미달 대응
- `docs/qa/kpi-evaluation-result.json`: mock 결과
- `src/lib/euler/json.ts`: tryParseJson 단일화
- `supabase/migrations/20260506_profiles_graduation_columns.sql`: LEG-04 전제
- `docs/deployment-runbook.md`: 운영 단계 런북

### Supabase 적용된 마이그레이션 (총 14)
20260426001412 ~ 20260426001610 — 13종 + set_updated_at 보안 패치

### 다음 세션 시작 시 (사용자 수동 단계)
1. 시드 적재 (env 필요): `pnpm dlx tsx scripts/seed-math-tools.ts`
2. Railway 배포 (`services/euler-sympy/`)
3. Vercel env 등록 (런북 §4)
4. KPI Full 측정: `pnpm dlx tsx scripts/eval-kpi.ts --full`
5. 베타 50명 모집 (`EULER2026`)
6. 법무 자문 (LEG-02, 30~80만원)

---

## 2026-04-26 (Night mode — 자율 작업)

### 진행 요약
- 단일 세션에서 Phase A~D + 법무 3종 모두 자율 완료
- 58 commits / 57 task (LEG-02 외부 변호사 자문만 보류)
- production build 통과 + `npx tsc --noEmit` 0 errors

### 핵심 산출물
- **마이그레이션 12종** (supabase/migrations/)
- **시드 32개 도구** (data/math-tools-seed.json)
- **2 시드 스크립트** (scripts/seed-math-tools.ts, seed-from-image.ts)
- **체크리스트 4종** (docs/qa/phase-{a,b,c,d}-checklist.md)
- **신규 페이지 10종**: /euler/{canvas, beta, report, family, billing}, /admin/{math-tools, academy}, /signup/parental-consent, /legal/{terms, privacy}
- **API 라우트 13종**: /api/euler-tutor/{critic, manager, diagnose, sympy, tools/search, tools/report, report/weakness, report/progress}, /api/billing/toss/confirm, /api/admin/academy/students, /api/cron/anonymize-graduated
- **lib 모듈 13개**: critic-client, canvas-stroke-encoder, embed, retriever, tool-reporter, reasoner, reasoner-with-tools, sympy-client, solve-logger, skill-stats-updater, layer-stats-updater, weakness-aggregator, usage-quota
- **AI 프롬프트 3종**: euler-critic-prompt, euler-manager-prompt, euler-reasoner-prompt
- **컴포넌트 4종**: HandwriteCanvas, ThoughtStream, UpsellModal, AnthropicToolDef
- **Python μSvc**: services/euler-sympy/ (FastAPI + SymPy + Dockerfile)

### 주요 결정 변경
- architecture.md 와 project-decisions.md 가 충돌하던 "Manager 모델" 결정 → project-decisions.md (Haiku 4.5) 우선 적용
- recharts 의존 추가 회피 → SVG + Framer Motion 만으로 차트 직접 구현
- zod 의존 추가 회피 → Anthropic tool calling 은 raw JSON Schema 사용
- 정기결제(빌링키)는 Phase E 로 이월 → Phase D-08 은 1회 결제 우선

### 미완료 / 보류
- **LEG-02**: 변호사 1회 자문 (외부, 30~80만원, 운영 시점에 진행)
- profiles.graduated_at / anonymized_at 컬럼 마이그레이션 별도 필요 (LEG-04 cron 의 전제)
- 정기결제(Toss billing key) — Phase E
- Tier 3 외부 데이터셋(ProofWiki) 임포트 — 사용자 1,000+ 후
- 음성 입력 — Phase A~D 후 결정

### 다음 세션 시작 시 우선 작업

1. **마이그레이션 적용** — Supabase 대시보드 SQL editor 또는 `supabase db push`
2. **시드 적재**: `pnpm dlx tsx scripts/seed-math-tools.ts --dry-run` 후 실제 적재
3. **Railway 배포** (`services/euler-sympy/README.md` 절차)
4. **Vercel env 등록**: 모든 EULER_* 키 + Toss 키 + CRON_SECRET + SUPABASE_SERVICE_ROLE_KEY
5. **베타 50명 모집** (invite 코드: `EULER2026`)
6. **법무 자문(LEG-02) 의뢰** — 변호사 1회 검토

### 토큰 사용 메모

- 1 세션에서 58 commits 진행. 모든 task 가 1 commit 단위로 격리됨.
- task 별 검증 (typecheck + commit) 즉시 진행 — 빚 누적 0
- 마지막에 production build 1회 검증 통과
