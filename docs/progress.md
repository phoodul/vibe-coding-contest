# Workflow Progress — Euler Tutor 2.0

## Last Checkpoint
- Time: 2026-04-27 Night (6차 세션 자율 진행)
- Phase: **Phase G-02 완료 + 중학교 시드 학년별 분리**
- Step: 다음 세션 — 베타 사용자 피드백 + chain UX 검증 + Phase G-03 후보 (LayerStuckChart 에 chain miss 패턴 표시)
- Session: 6차 (G-02 Recursive Chain + Middle 분리, Night mode 자율)

## 운영 상태 — Production 라이브

| 영역 | 상태 | URL/메모 |
|---|---|---|
| Web (Vercel) | ✅ Live | https://vibe-coding-contest.vercel.app |
| DB (Supabase) | ✅ 14 마이그레이션 적용 | wrcpehyvxvgvkdzeiehf |
| 시드 (math_tools) | ✅ **244 도구 / 262 trigger / 524 임베딩** (8영역) | data/math-tools-seed/ + math-tools-seed.json |
| 운영 도구 추가 | ✅ 웹 UI + API | /admin/math-tools |
| 외부 도구 (Phase F) | ✅ SymPy 25 + Z3 + matplotlib | services/euler-sympy/ |
| Wolfram Alpha | ⏸ 코드 완료 / WOLFRAM_APP_ID 발급 대기 | $5/월 plan |
| KPI 평가셋 | ✅ 45문항 8영역 + cross_check_query | data/kpi-eval-problems.json |
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

## 6차 세션 완료 (2026-04-27 Night, 자율)

### Phase G-02 — Recursive Backward Reasoner + 8-Layer + chain 시각화

| 커밋 | 내용 |
|---|---|
| a6e3d2d | G02-A: Manager 8-Layer 출력 (needs_layer_8/area_layer_5/layer_6_difficulty/layer_7_direction/computational_load) + effectiveDifficulty/shouldRunRecursiveChain |
| b0d682b | G02-B: recursive-reasoner.ts 모듈 + buildSubgoalDecomposePrompt + chainToCoachingText (Self-Ask/ToT/CoVe 학술 근거) |
| 8bc6bf7 | G02-C: orchestrator route.ts 통합 — chainContext systemPrompt inject + StreamData payload (시각화용) |
| d008659 | G02-D: BackwardChain 컴포넌트 + page.tsx 첫 user 메시지 직후 노출 ("선생님은 이렇게 생각했어요") |

### 중학교 시드 학년별 분리

| 커밋 | 내용 |
|---|---|
| 09782c6 | MID-A: middle.json (35) → middle1.json (8) + middle2.json (8) + middle3.json (19) — 한국 2015 개정 교육과정 |
| 2e79ae4 | MID-B: Manager area enum + EULER_TOOLS_BY_AREA + REASONER_THRESHOLD_BY_AREA + KOREAN_AREA_MAP + MATH_AREAS UI 8→10 카드 |

### 핵심 가치
- **방법 찾기 코칭의 본질화**: 난이도 5+ 문제는 chain 카드로 "왜 이렇게 생각했는지" 가시화
- **8-Layer 분리**: insight gap (layer_6) vs computational load 분리 → 정확한 분기
- **중학교 학년별 진입점**: 학습자가 자기 학년 도구 셋만 보도록 격리 (Retriever 결과는 동일하나 UX 분리)

### 사용자 검증 대기
- 어려운 문제 (수능 30번류) 1건 → chain 5 depth 도출 + 시각화 카드 노출 확인
- chain 데이터가 streamData 로 도착하는지 useChat 클라이언트 검증
- middle1/2/3 카드 진입 후 Manager 가 정확히 학년 area 반환하는지

## 5차 세션 완료 (2026-04-26 ~ 27)

### Phase F (외부 도구 통합) — 단일 커밋 + 후속 패치
| 커밋 | 내용 |
|---|---|
| 8787d0b | Phase F 8 task: SymPy 25 + Wolfram + Z3 + matplotlib + cross-check + KPI 45 |
| 72297b1 | Wolfram endpoint Full Results → LLM API 전환 |
| 15cc36d | LLM API 결과 섹션 추출 강화 (17 헤더 인식) |
| bc86d51 | F-09 cross-check 를 orchestrator 통합 + wolfram-query-builder |
| a60453d | Manager area 한글 응답 정규화 + 진단 로그 |
| 8e2436d | Reasoner 임계값 공격적 하향 (학생 신뢰 우선) |
| 4deb4c5 | 429 admin bypass + BFS skip when tools + maxSteps 5→3 |
| 877a735 | 임계값 균형 재조정 (단순 = LLM 단독, calculus 만 3+) |

### Phase G-01 (방법 찾기 코칭 본질 회복)
| 커밋 | 내용 |
|---|---|
| 4f790d0 | 💡 문제 해결 전략 버튼 + EULER_SYSTEM_PROMPT 4단계 가이드 |

### 사용자 작업 (배포·키)
- ✅ Wolfram App ID 발급 + Railway env 등록 + 재배포 검증
- ✅ Vercel env `EULER_CROSSCHECK_ENABLED=true` 등록
- ✅ Manager 정상 동작 확인 (area="math2", reasoner=Y, with-tools 호출)

### 운영 검증
- 단순 정적분 (difficulty 2): LLM 단독 — 빠름
- 어려운 문제 (difficulty 5+): SymPy 검증 + Wolfram cross-check (호출 임계값 5+)
- 모든 영역 area enum 정규화 동작

## 다음 세션 (6차) 첫 Task — Phase G-02 ⭐

**핵심 통찰 (사용자 정립)**:
- "Euler Tutor 의 진짜 매력 = 방법 찾기 코칭, 계산 X"
- "난이도 = 도구 선택의 비자명성 (Layer 6 + Layer 7), 계산 복잡도 X"
- "킬러 문제는 LLM 도 못 푼다 — multi-turn 분해 질문이 정답률 ↑"
- "chain 시각화는 난이도 5+ 만 (단순엔 억지)"

### G-02 구현 (예상 단일 세션)

1. **Recursive Backward Reasoner**
   - `recursiveBackwardChain({problem, conditions, goal, maxDepth=5})`
   - 각 depth: Layer 6 retrieve → Sonnet 분해 질문 → 다음 subgoal
   - 종료: subgoal 이 conditions 와 매칭

2. **Manager 8-Layer 명시화**
   - 출력: `needs_layer_8` / `area_layer_5` / `layer_6_difficulty` / `layer_7_direction` / `computational_load`
   - difficulty 단일 값 → 두 차원 분리 (insight gap + computational load)

3. **chain 시각화 (난이도 5+ 만)**
   - "선생님은 이렇게 생각했어요" 형식
   - 학생 막힘 시 chain 의 다음 노드 1개만 질문으로 노출

4. **학술 근거 적용**
   - ToT (Yao 2023, GPT-4 24-game 4%→74%)
   - Self-Ask (Press 2023)
   - CoVe (Dhuliawala 2023)

### 기타 후보 (Phase G 외)
- 영역별 trigger 보강 (현재 평균 1.1 → 1.5+)
- 베타 사용자 풀이 모니터링 (candidate_tools 채우기)
- 기출문제 DB 영역 확장 (현재 calculus 위주)
- Tier 2 (Phase H): GeoGebra · Lean 4 · Desmos · Manim

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
