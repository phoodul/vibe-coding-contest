# Workflow Progress — Euler Tutor 2.0

## Last Checkpoint
- Time: 2026-04-26 (4차 세션 종료)
- Phase: **정식 출시 단계 — 시드 8영역 244 도구 / 운영 도구 추가 UI 완성**
- Step: 베타 사용자 풀이 검증 + 영역별 trigger 보강 + LEG-02 자문
- Session: 4차 (시드 영역 확장 직후)

## 운영 상태 — Production 라이브

| 영역 | 상태 | URL/메모 |
|---|---|---|
| Web (Vercel) | ✅ Live | https://vibe-coding-contest.vercel.app |
| DB (Supabase) | ✅ 14 마이그레이션 적용 | wrcpehyvxvgvkdzeiehf |
| 시드 (math_tools) | ✅ **244 도구 / 262 trigger / 524 임베딩** (8영역) | data/math-tools-seed/ + math-tools-seed.json |
| 운영 도구 추가 | ✅ 웹 UI + API | /admin/math-tools |
| μSvc (Railway) | ✅ Live | https://vibe-coding-contest-production.up.railway.app |
| Vercel env | ✅ 19 row 등록 (Production + Preview) | EULER_*, ANTHROPIC_HAIKU, CRON_SECRET 포함 |
| 베타 게이트 | ✅ 동작 검증 | 코드 `EULER2026`, 50명 cap |

## Completed
- [x] Phase 1: Research — `docs/research_raw.md`
- [x] Phase 2: Integration — `docs/integrator_report.md`
- [x] Phase 2: Planning — `docs/architecture.md`, `docs/task.md`, `docs/implementation_plan_euler.md`
- [x] Phase 2: 결정 사항 명문화 — `docs/project-decisions.md`
- [x] **Approval Gate 1**: 통합 보고서 승인 완료
- [x] **Approval Gate 2**: task.md 승인 완료

### Phase A (15/15) ✅ — Critic + 필기 + 베타 게이트
### Phase B (16/16) ✅ — pgvector + Manager + Retriever + 검수 어드민
### Phase C (13/13) ✅ — Reasoner BFS + 약점 리포트 + Free 한도
### Phase D (10/10) ✅ — SymPy μSvc + Family/Academy + Toss

### 법무·운영 (3/4)
- ✅ LEG-01: 이용약관 + 개인정보처리방침 초안
- ⏸ LEG-02: 변호사 자문 (외부, 30~80만원 — 베타 검증 후 진행)
- ✅ LEG-03: 만 14세 미만 부모 동의
- ✅ LEG-04: 졸업 + 1년 PII 익명화 cron + profiles 컬럼 보강

### 3차 세션 추가 작업 (2026-04-26)

**B (KPI 평가)**: `5c559bb`
- 합성 10문항 + standalone eval 스크립트 + 검증 문서

**D (Refactor)**: `ad33aef`
- tryParseJson 5곳 중복 단일화 + difficulty-classifier 죽은 코드 삭제
- layer-stats-updater last_failure_at 버그 수정 + parse-image 인증 가드

**A (배포 자동화)**:
- `e545986` Supabase 마이그레이션 14종 적용 + LEG-04 cron 정정 + 배포 런북

**5개 운영 버그 수정 (베타 시작 직전 발견)**:
- `0d0e48f` SW 외부 origin 가로채기 → fetch 실패 (외부 origin 패스)
- `9a06d9d` SymPy worker thread signal ValueError (graceful skip)
- `b702b29` `/auth/login` 404 → `/login` 정정 (5 파일)
- `2db955b` + `8994eb2` `redeem_euler_beta` SQL ambiguous 참조 (status 컬럼)

**Phase E 통합 UX 개선** (사용자 피드백 기반):
- `7a1b822` 채팅+필기 한 세션 통합 + 🆕 새 문제 + 📊 리포트 진입점
- `ae5fee6` + `2da4ebb` 주 1회 리포트 + 자격 게이트 (7일+10문제)
- `37c7db0` Vision LLM (Claude Sonnet 4.6) + 인라인 패널 + OCR 미리보기·수정
- `4503583` OCR 결과 KaTeX 렌더링 (raw 편집 details 분리)
- `7afdf15` 필기/이미지 펼침 시 마지막 메시지 자동 스크롤

총 3차 세션 14 commits, production 운영 인프라 + UX 개선 모두 완료.

### 4차 세션 추가 작업 (2026-04-26)

**시드 영역 확장**: `1909c54`
- `data/math-tools-seed/` 디렉터리 (8 영역 분리 관리)
- middle 35 / common 34 / math1 29 / math2 30 / probability 30 / geometry 25 / calculus_extra 29 + 기존 32 = **244 도구**
- 262 trigger / 524 임베딩 적재 (≈ \$0.001)
- Manager area enum 8단계 + UI MATH_AREAS 8개 카드

**운영 도구 추가 UI**: `859cdca`
- POST/GET `/api/admin/math-tools` (insert + 임베딩 + 롤백)
- `/admin/math-tools` 헤더 + AddToolForm (동적 trigger N개)
- 운영 중 1건씩 점진 추가 채널 완성

→ 3중 확장 채널 (LLM 시드 / 운영자 UI / Reasoner 자동보고) 완성.

## Next Action (사용자 직접 단계)

1. **베타 사용자 풀이 검증** — 본인 + 지인으로 시나리오 재현
2. **베타 50명 모집** — 코드 `EULER2026` 공유
3. **법무 자문 (LEG-02)** — 변호사 1회 30~80만원 (베타 검증 후)
4. **KPI Full 측정** — `pnpm dlx dotenv-cli -e .env -- pnpm dlx tsx scripts/eval-kpi.ts --full`
5. **풀이 누적 7일+10문제 후 리포트 검증** — 주 1회 자동 갱신

## 다음 세션 첫 Task — Phase F: 외부 도구 통합 ⭐

사용자 결정 (4차 세션 종료): **"선생님이 진짜 답을 정확히 알아야 학생이 믿음을 가진다"**.
시드 도구는 검색용 카드일 뿐 실제 풀이 환각을 막지 못함. 외부 계산 엔진 대거 통합.

### 8 task 자율 진행 계획

| Task | 내용 | 비용 | 효과 |
|---|---|---|---|
| F-01 | SymPy μSvc 6→25 endpoint (summation/inequality/probability/geometry/vector/matrix/trig_simplify/log_simplify/poly_div/series_sum/limit/partial_fraction/complex_solve/numeric) | \$0 | 8영역 즉시 cover |
| F-02 | Wolfram Alpha API 통합 (\$5/월 plan, WOLFRAM_APP_ID env) | \$5/월 | 자연어 query · 모든 영역 백업 |
| F-03 | Z3 SMT solver — 부등식 영역 (SymPy 약점 보완) | \$0 | 공통/수학1·2 부등식 |
| F-04 | matplotlib endpoint (서버 PNG → base64) — /plot_function, /plot_region, /plot_geometry | \$0 | 그래프·도형 시각화 |
| F-05 | cross-check.ts — SymPy + Wolfram 결과 비교 → verified=true 배지 로직 | \$0 | 학생 신뢰 시각화 |
| F-06 | VerifiedBadge.tsx — "✓ 두 엔진 검증" + 그래프 인라인 렌더링 | \$0 | UI 신뢰 표시 |
| F-07 | euler-tools-schema.ts 6→25+ tool, 영역별 임계값 분리 (확통·기하 난이도 4+) | \$0 | Reasoner 자동 호출 |
| F-08 | KPI 평가 8영역×5문항=40문항, hit rate + cross-check 일치율 측정 | \$0 | 영역별 성능 가시화 |

**총 비용:** Wolfram \$5/월 + Railway 메모리 약간 ↑ ≈ \$8/월

**경쟁 차별화:** ChatGPT/Khanmigo/Photomath 모두 단일 LLM/CAS — 우리만 다중 엔진 cross-check

**Tier 2 (Phase G):** GeoGebra · Lean 4 · Desmos
**Tier 3 (장기):** Manim · 자체 fine-tuned 모델

### Phase F 외 후보 (병행 또는 후속)
- 영역별 trigger 보강 (현재 평균 1.1 → 1.5+)
- 베타 사용자 풀이 모니터링 (candidate_tools 채우기)
- 기출문제 DB 영역 확장 (현재 calculus 위주)

## 핵심 산출물 요약

- **마이그레이션 14종 적용** (Supabase MCP 자동)
- **시드 32 도구 / 39 trigger / 78 임베딩** 적재
- **신규 페이지 10종** (/euler/{canvas,beta,report,family,billing}, /admin/{math-tools,academy}, /signup/parental-consent, /legal/{terms,privacy})
- **API 라우트 13종** (인증 가드 일관)
- **lib/euler 14 모듈**
- **컴포넌트**: HandwriteCanvas / InlineHandwritePanel / ThoughtStream / UpsellModal
- **Python μSvc** (services/euler-sympy/, Railway 배포)
- **법무 페이지 3종**
- **KPI 평가 자동화** (10문항 + 4 KPI)
- **배포 런북** (docs/deployment-runbook.md)

## 주요 결정·정책

- **Vision LLM (Claude Sonnet 4.6)** for handwriting OCR (Mathpix 한글 약점 보완)
- **Mathpix** for printed photos/screenshots (인쇄체 강점 유지)
- **주 1회 리포트** (windowDays=7, 첫 풀이 +7일 + 10문제 자격 게이트)
- **베타 50명 cap** + EULER2026 코드
- **LEG-02 자문** — 베타 후 결제 활성화 전 진행
