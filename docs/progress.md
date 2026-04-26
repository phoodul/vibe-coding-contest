# Workflow Progress — Euler Tutor 2.0

## Last Checkpoint
- Time: 2026-04-26 (3차 세션 — KPI/Refactor/배포 자동화 종료 시점)
- Phase: **Phase A~D + 법무 3종 + KPI 평가 시스템 + Supabase 마이그레이션 13종 적용 완료**
- Step: 시드 적재 + Railway 배포 + Vercel env 등록만 남음 (수동, env 필요)
- Session: 3차 세션

## Completed
- [x] Phase 1: Research — `docs/research_raw.md`
- [x] Phase 2: Integration — `docs/integrator_report.md` (승인 완료)
- [x] Phase 2: Planning — `docs/architecture.md`, `docs/task.md`, `docs/implementation_plan_euler.md` (승인 완료)
- [x] Phase 2: 결정 사항 명문화 — `docs/project-decisions.md`
- [x] **Approval Gate 1**: 통합 보고서 승인 완료
- [x] **Approval Gate 2**: task.md 승인 완료

### Phase A (15/15) ✅
A-01 ~ A-15. Critic Agent + 필기 모드(PWA) + 베타 게이트.
체크리스트: `docs/qa/phase-a-checklist.md`

### Phase B (16/16) ✅
B-01 ~ B-16. pgvector + math_tools 32개 시드 + Manager + Retriever + 검수 어드민.
체크리스트: `docs/qa/phase-b-checklist.md`

### Phase C (13/13) ✅
C-01 ~ C-13. Reasoner BFS + 7종 진단 + WeaknessReport + ProgressDashboard + Free 한도.
체크리스트: `docs/qa/phase-c-checklist.md`
학원 자료: `docs/sales/academy-pitch.md`

### Phase D (10/10) ✅
D-01 ~ D-10. Railway SymPy μSvc + Tool calling + Family 잠금 + Academy 대시보드 + Toss Payments + UpsellModal.
체크리스트: `docs/qa/phase-d-checklist.md`

### 법무·운영 (3/4)
- ✅ LEG-01: 이용약관 + 개인정보처리방침 초안
- ⏸ LEG-02: 변호사 자문 (외부 — 운영 시점에 진행)
- ✅ LEG-03: 만 14세 미만 부모 동의
- ✅ LEG-04: 졸업 + 1년 PII 익명화 cron (profiles 컬럼 보강 + 코드 정정 포함)

### 3차 세션 추가 산출물

**B (KPI 평가 자동화)**:
- `data/kpi-eval-problems.json` — 합성 10문항 (난이도 3~6, 미적분 핵심)
- `scripts/eval-kpi.ts` — Manager+Retriever+Reasoner 파이프라인 standalone 호출, 4 KPI 자동 측정
- `docs/qa/kpi-evaluation.md` — 검증 절차 + PASS 기준 + 미달 대응
- Mock 모드 검증: 10/10 expected_tools ↔ 시드 32 tools 정확히 매칭

**D (코드 리뷰/리팩터링)**:
- `src/lib/euler/json.ts` — `tryParseJson` 헬퍼 단일화 (5개 파일 중복 제거)
- `src/lib/euler/difficulty-classifier.ts` 삭제 (호출처 없음 — Manager 가 흡수)
- `layer-stats-updater.ts` 버그 수정 — `last_failure_at` ternary 우선순위 + select 컬럼명 정정
- `parse-image/route.ts` 인증 가드 추가 — Mathpix/Upstage 봇 어뷰징 방지

**A (배포 자동화)**:
- Supabase MCP 로 마이그레이션 13종 + 보안 권고 패치 1종 적용 완료
- `supabase/migrations/20260506_profiles_graduation_columns.sql` 신규 — LEG-04 cron 의 전제
- `src/app/api/cron/anonymize-graduated/route.ts` 컬럼명 정정 (`user_id` → `id`)
- `.env.example` 보강 — `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`
- `docs/deployment-runbook.md` 신규 — 시드 적재 / Railway / Vercel env / 베타 모집 / 모니터링

## Next Action (사용자 수동 단계)

런북: `docs/deployment-runbook.md`

1. **시드 적재** (env 필요):
   ```bash
   pnpm dlx tsx scripts/seed-math-tools.ts
   ```

2. **Railway 배포** (`services/euler-sympy/`):
   - GitHub 연결 후 INTERNAL_TOKEN 등록 → 도메인 발급

3. **Vercel env 등록**: 런북 §4 의 환경변수 표 참조

4. **KPI Full 측정**:
   ```bash
   pnpm dlx tsx scripts/eval-kpi.ts --full
   ```

5. **베타 50명 모집**: invite 코드 `EULER2026`

6. **법무 자문 (LEG-02)**: 변호사 1회 검토 30~80만원

## 핵심 KPI 검증 (출시 전 측정)

- [ ] 단순 계산 환각 0% (수능 미적분 28번 5문항)
- [ ] Retriever hit rate 70%+ (28번 5문항)
- [ ] 코칭 응답 "왜" 포함 90%+
- [ ] 28~30번 정답률 70%+
- [ ] 결제 → 가족 잠금 → 교사 대시보드 end-to-end 통과

KPI 자동 측정: `pnpm dlx tsx scripts/eval-kpi.ts --full`

## 산출물 요약

- **마이그레이션 14종 적용** (Supabase MCP 자동, 13종 + 보안 권고 1)
- **시드 32개 도구** (data/math-tools-seed.json)
- **시드 + 평가 스크립트 3종** (seed-math-tools, seed-from-image, eval-kpi)
- **체크리스트 + KPI 문서 5종** (docs/qa/)
- **신규 페이지 10종** (/euler/canvas, /euler/beta, /euler/report, /euler/family, /euler/billing, /admin/math-tools, /admin/academy, /signup/parental-consent, /legal/terms, /legal/privacy)
- **API 라우트 13종** (인증 가드 일관)
- **lib/euler 14 모듈** (difficulty-classifier 제거, json 추가, 13 → 14 — 정확히는 13 활성)
- **컴포넌트 4종**
- **법무 페이지 3종**
- **Python μSvc** (services/euler-sympy/)
- **배포 런북** (docs/deployment-runbook.md)
