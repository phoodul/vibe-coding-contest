# Work Log — Euler Tutor 2.0

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
