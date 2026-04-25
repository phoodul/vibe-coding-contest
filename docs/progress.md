# Workflow Progress — Euler Tutor 2.0

## Last Checkpoint
- Time: 2026-04-26 (Night mode 자율 작업 완료 시점)
- Phase: **Phase A~D + 법무 모두 완료 (LEG-02 외부 자문만 보류)**
- Step: 정식 출시 준비 완료
- Session: 2차 세션 (Night mode)

## Completed
- [x] Phase 1: Research — `docs/research_raw.md`
- [x] Phase 2: Integration — `docs/integrator_report.md` (승인 완료)
- [x] Phase 2: Planning — `docs/architecture.md`, `docs/task.md`, `docs/implementation_plan_euler.md` (승인 완료)
- [x] Phase 2: 결정 사항 명문화 — `docs/project-decisions.md`
- [x] **Approval Gate 1**: 통합 보고서 승인 완료
- [x] **Approval Gate 2**: task.md 승인 완료

### Phase A (15/15) ✅
A-01 ~ A-15 모두 완료. Critic Agent + 필기 모드(PWA) + 베타 게이트.
체크리스트: `docs/qa/phase-a-checklist.md`

### Phase B (16/16) ✅
B-01 ~ B-16 모두 완료. pgvector + math_tools 32개 시드 + Manager + Retriever + 검수 어드민.
체크리스트: `docs/qa/phase-b-checklist.md`

### Phase C (13/13) ✅
C-01 ~ C-13 모두 완료. Reasoner BFS + 7종 진단 + WeaknessReport + ProgressDashboard + Free 한도.
체크리스트: `docs/qa/phase-c-checklist.md`
학원 자료: `docs/sales/academy-pitch.md`

### Phase D (10/10) ✅
D-01 ~ D-10 모두 완료. Railway SymPy μSvc + Tool calling + Family 잠금 + Academy 대시보드 + Toss Payments + UpsellModal.
체크리스트: `docs/qa/phase-d-checklist.md`

### 법무·운영 (3/4)
- ✅ LEG-01: 이용약관 + 개인정보처리방침 초안
- ⏸ LEG-02: 변호사 자문 (외부 — 운영 시점에 진행)
- ✅ LEG-03: 만 14세 미만 부모 동의
- ✅ LEG-04: 졸업 + 1년 PII 익명화 cron

## Next Action (정식 출시 절차)

1. **마이그레이션 적용**: `supabase/migrations/*` 9개 모두 Supabase 대시보드 SQL editor 또는 `supabase db push`
   - euler_beta_invites / math_tools / math_tool_triggers / candidate_tools / match RPC / candidate review RPC / euler_solve_logs / user_skill_stats / user_layer_stats / euler_family_settings / parental_consents / user_subscriptions
2. **시드 적재**: `pnpm dlx tsx scripts/seed-math-tools.ts --dry-run` 후 실제 적재
3. **Railway 배포**: `services/euler-sympy/` (D-01 README 절차)
4. **env 등록 (Vercel production)**:
   - 모든 EULER_* 키
   - EULER_SYMPY_URL / EULER_SYMPY_INTERNAL_TOKEN
   - SUPABASE_SERVICE_ROLE_KEY (cron 익명화용)
   - CRON_SECRET (Vercel 자동 발급)
   - NEXT_PUBLIC_TOSS_CLIENT_KEY / TOSS_SECRET_KEY (운영 키)
5. **법무 자문 (LEG-02)**: 변호사 1회 검토 30~80만원
6. **베타 50명 모집**: invite 코드 'EULER2026' 공유

## 핵심 KPI 검증 (출시 전 측정)

- [ ] 단순 계산 환각 0% (수능 미적분 28번 5문항)
- [ ] Retriever hit rate 70%+ (28번 5문항)
- [ ] 코칭 응답 "왜" 포함 90%+
- [ ] 28~30번 정답률 70%+
- [ ] 결제 → 가족 잠금 → 교사 대시보드 end-to-end 통과

## 산출물 요약

- **마이그레이션 9종** (supabase/migrations/)
- **시드 32개 도구** (data/math-tools-seed.json)
- **2 시드 스크립트** (scripts/)
- **체크리스트 4종** (docs/qa/)
- **신규 페이지 10종** (/euler/canvas, /euler/beta, /euler/report, /euler/family, /euler/billing, /admin/math-tools, /admin/academy, /signup/parental-consent, /legal/terms, /legal/privacy)
- **API 라우트 13종** (/api/euler-tutor/* 9, /api/billing/toss/confirm, /api/admin/academy/students, /api/cron/anonymize-graduated)
- **lib/ai 프롬프트 3종** (euler-critic / manager / reasoner)
- **lib/euler 13 모듈** (critic-client / canvas-stroke-encoder / embed / retriever / tool-reporter / reasoner / reasoner-with-tools / sympy-client / solve-logger / skill-stats / layer-stats / weakness-aggregator / usage-quota)
- **컴포넌트 4종** (HandwriteCanvas / ThoughtStream / UpsellModal / etc)
- **법무 페이지 3종**
- **Python μSvc** (services/euler-sympy/)

## 토큰 효율 메모

전체 58 task 중 57 task (LEG-02 제외) 1 세션 자율 진행 완료.
build production 통과 + tsc 0 errors.
