# Workflow Progress — Euler Tutor 2.0

## Last Checkpoint
- Time: 2026-04-26 (3차 세션 종료)
- Phase: **정식 출시 단계 — 운영 인프라 완료, 베타 50명 모집 준비**
- Step: 베타 사용자 검증 + LEG-02 변호사 자문 진행
- Session: 3차 (베타 모집 직전)

## 운영 상태 — Production 라이브

| 영역 | 상태 | URL/메모 |
|---|---|---|
| Web (Vercel) | ✅ Live | https://vibe-coding-contest.vercel.app |
| DB (Supabase) | ✅ 14 마이그레이션 적용 | wrcpehyvxvgvkdzeiehf |
| 시드 (math_tools) | ✅ 32 도구 / 39 trigger / 78 임베딩 | data/math-tools-seed.json |
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

## Next Action (사용자 직접 단계)

1. **베타 사용자 풀이 검증** — 본인 + 지인으로 시나리오 재현
   - 텍스트 / 사진 / 필기 모드 자유 전환 확인
   - "새 문제" 버튼 + "리포트" 진입점 동작
   - Vision LLM 한글 OCR 만족도

2. **베타 50명 모집** — 코드 `EULER2026` 공유
   - 인스타/X/학원/지인 채널
   - 50명 도달 시 자동 마감

3. **법무 자문 (LEG-02)** — 변호사 1회 검토 30~80만원
   - 베타 50명 검증 후 결제 활성화 직전 진행

4. **KPI Full 측정**:
   ```powershell
   pnpm dlx dotenv-cli -e .env -- pnpm dlx tsx scripts/eval-kpi.ts --full
   ```

5. **풀이 누적 7일+10문제 후 리포트 검증** — 주 1회 자동 갱신

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
