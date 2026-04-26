# Work Log — Euler Tutor 2.0

## 2026-04-27 (5차 세션 후속 — Phase F 운영 + G-01 + Phase G 비전 정립)

### 진행 요약
Phase F 코드만 만들어둔 상태에서 사용자가 직접 Wolfram App ID 발급, Vercel/Railway env 등록, 재배포까지 진행. 동시에 운영 중 발견된 문제들을 즉시 패치. 마지막에 사용자와의 깊은 대화로 **Phase G 비전 정립** + **G-01 구현** 으로 마감.

### 1. Wolfram LLM API 통합 (실제 활성화)
- 사용자: Wolfram App ID 발급 + Railway env `WOLFRAM_APP_ID` 등록 + 재배포 성공
- `services/euler-sympy/main.py` Full Results API → **LLM API** 전환 (커밋 72297b1)
- LLM API 응답 구조 (Definite integral, Sum, Roots 등) 17 헤더 인식 + 등호 우변 추출 (커밋 15cc36d)
- 검증 완료: `result: "2"` 깔끔 추출

### 2. F-09 cross-check 실제 통합 (커밋 bc86d51)
- `cross-check.ts` 가 만들어져 있었지만 호출 안 되던 상태 → orchestrator 통합
- `wolfram-query-builder.ts` 신규 — 13 tool 종 → 자연어 query 변환
- difficulty >= EULER_CROSSCHECK_MIN_DIFFICULTY 시 마지막 의미 있는 SymPy tool 결과를 Wolfram 으로 비교
- `EULER_EVENTS.CROSSCHECK` analytics 이벤트 추가

### 3. 운영 디버깅 — Manager area 한글 응답 (커밋 a60453d)
- 발견: mgr=Y 까지만 찍히고 reasoner-with-tools 호출 안 됨
- 원인: Manager Haiku 가 영문 enum 대신 한글 ('미적분', '미분법') 응답 → REASONER_THRESHOLD_BY_AREA 미스매치 → 기본값 6 폴백
- 수정: `normalizeArea()` 헬퍼 + KOREAN_AREA_MAP 22종 + 진단 로그 강화

### 4. 임계값 조정 — 학생 신뢰 vs 응답 속도 균형
- 옵션 A 적용 (math2/calculus=2): 단순 적분도 SymPy 호출 → 32초 (커밋 8e2436d)
- 사용자 피드백: "단순 계산은 LLM 도 잘 푼다. 굳이 SymPy 안 거쳐도 됨"
- 균형 재조정 (커밋 877a735): math2/common/middle/math1=4, calculus=3, free=5
  · diff 2: ~7s (LLM 단독)
  · diff 3+ (calculus): ~17s (SymPy)
  · diff 4+: ~17s
  · diff 6+: ~22s (+ Wolfram cross-check)

### 5. 429 + 속도 패치 (커밋 4deb4c5)
- 429 원인: phoodul@gmail.com 도 Free 일일 10회 제한 적용 → admin bypass 추가
- 속도: BFS 와 reasoner-with-tools 가 sequential 중복 → with-tools 활성 시 BFS skip (~8s 절약)
- maxSteps 5 → 3 (~5s 절약)

### 6. G-01 — 💡 문제 해결 전략 버튼 (커밋 4f790d0)
사용자 통찰: 미적분 29번 풀이 후 직접 "사용된 도구·왜 필요한가" 질문 → LLM 답 품질 우수. 학생이 그 질문을 떠올리지 못함 → **버튼 1개로 자동화**.
- 헤더 우측 💡 버튼: `messages.length === 0 || isLoading` 시 disabled
- `EULER_SYSTEM_PROMPT` 에 4단계 답 가이드 추가:
  · 1️⃣ 사용된 도구 목록 (굵게)
  · 2️⃣ 각 도구의 trigger (왜 떠올라야 했는가 + 함정)
  · 3️⃣ 풀이 chain (조건 → 도구 → 사실 → 답)
  · 4️⃣ 비슷한 문제 유형

### 7. Phase G 비전 정립 (사용자와의 깊은 대화)

핵심 통찰:
1. **"Euler Tutor 의 매력 = 방법 찾기 코칭, 계산 X"**
   - SymPy/Wolfram 은 안전망일 뿐, 본질이 아님
   - 진짜 자산 = math_tools 244 도구의 `why_text` (Layer 6 dictionary) + Reasoner BFS forward/backward (Layer 7)

2. **"난이도란 계산이 아니야"**
   - 현재 Manager 의 difficulty 정의는 계산 복잡도 기반 (잘못됨)
   - 진짜 난이도 = 도구 선택의 비자명성 (insight gap)
   - "곡선·직선 사이 넓이" → 도구 자명 → 쉬움 (계산 복잡해도)
   - 수능 30번 → 보조함수 정의 비자명 → 어려움 (계산 단순해도)

3. **"킬러 문제는 LLM 도 못 푼다"**
   - single-turn 한 번에 답을 묻지 말고 multi-turn 분해 질문
   - "이걸 알려면 무엇? → 또 이걸 알려면? → ..." backward chain
   - 학술 근거: ToT (Yao 2023) / Self-Ask (Press 2023) / CoVe (Dhuliawala 2023)

4. **"chain 시각화는 난이도 5+ 만"**
   - 단순 계산 문제에 chain 은 억지
   - 어려운 문제에서만 "선생님은 이렇게 생각했어요" 노출

5. **8-Layer 인프라가 schema 에만 존재**
   - math_tools.knowledge_layer ✓ / Critic stuck_layer ✓
   - 그러나 Manager 의 분류·Reasoner BFS·Coaching prompt 어디에도 layer 명시 사용 안 됨
   - **Layer 8 (서술형 → 수학화) 분류 자체가 없음** → 모든 문제 동일 처리

→ Phase G 의 의미가 명확해짐: **방법 찾기의 인프라화**. SymPy 확장 (Tier 2) 보다 우선.

### 다음 세션 (6차) 첫 task

**G-02 — Recursive Backward Reasoner + 8-Layer 명시화 + chain 시각화 (난이도 5+)**

이 task 가 완성되면 사용자가 정의한 Euler Tutor 의 본질이 코드로 실체화됨.

---

## 2026-04-26 (5차 세션 — Phase F: 외부 도구 통합)

### 진행 요약
4차 세션 종료 직후 사용자 결정: "선생님이 진짜 답을 정확히 알아야 학생이 믿음을 가진다."
시드 도구는 검색용 카드일 뿐, 실제 풀이 환각을 막지 못함. 외부 계산 엔진 대거 통합.

### Phase F — 8 task 완료
- F-01: SymPy μSvc 6→25 endpoint (summation/limit/probability/geometry/vector/matrix/trig_simplify/log_simplify/poly_div/partial_fraction/complex_solve/numeric/inequality)
- F-02: Wolfram Alpha API (`/wolfram_query` endpoint, WOLFRAM_APP_ID env)
- F-03: Z3 SMT solver — z3-solver 4.13.4 + reduce_inequalities
- F-04: matplotlib 시각화 — `/plot_function`, `/plot_region`, `/plot_geometry` (PNG base64)
- F-05: `cross-check.ts` — SymPy + Wolfram 결과 비교 (loose match → 기호 동치 → 불일치 분기)
- F-06: `VerifiedBadge.tsx` + `PlotImage.tsx` — 컴팩트/풀 모드 + 그래프 인라인
- F-07: euler-tools-schema 6→17 tool, `EULER_TOOLS_BY_AREA` 영역별 부분집합, `REASONER_THRESHOLD_BY_AREA` (확통·기하·미적분 4+, 중학·공통 5+)
- F-08: KPI 평가 35문항 추가 (총 10→45) — 영역별 5문항 + cross_check_query

### 핵심 산출물
- `services/euler-sympy/main.py` 25 endpoint (이전 6 + 19 신규)
- `services/euler-sympy/requirements.txt` scipy/z3-solver/matplotlib/httpx 추가
- `src/lib/euler/sympy-client.ts` SympyOp union 24개로 확장
- `src/lib/euler/cross-check.ts` (신규)
- `src/lib/ai/euler-tools-schema.ts` 17 tool + 영역별 매핑
- `src/components/euler/VerifiedBadge.tsx` (신규) — 학생 신뢰 시각화
- `src/app/api/euler-tutor/route.ts` 영역별 임계값 + area 전달
- `data/kpi-eval-problems.json` 45문항

### 학생 신뢰 차별화
- ChatGPT/Khanmigo/Photomath 모두 단일 LLM 또는 단일 CAS
- 우리: SymPy + Wolfram + Z3 + matplotlib + cross-check 배지
- "✓ SymPy + Wolfram 검증 · 신뢰도 99%" UI 표시

### 비용
- Wolfram Alpha \$5/월 (2K queries) — 핵심 계산만 cross-check
- Railway 메모리 약간 ↑ (z3-solver + matplotlib + scipy)
- 총 ≈ \$8/월

### 다음 세션 후보
- Wolfram WOLFRAM_APP_ID 발급 + Vercel/Railway env 등록
- Reasoner 가 cross-check 결과를 system 에 주입하도록 통합 (현재 cross-check.ts 만 있음)
- VerifiedBadge 를 채팅 메시지에 inject (Vercel AI SDK Data 메시지로)
- Phase G — GeoGebra · Lean 4 · Desmos

---

## 2026-04-26 (4차 세션 — 시드 영역 확장 + 직접 입력 UI)

### 진행 요약
사용자 요청 "미적분만으론 베타 모집 폭이 좁다" 대응. 4차 세션 핵심.

### 1. 시드 영역 확장 (1909c54)
- `data/math-tools-seed/` 디렉터리 도입 (8 영역 분리 관리)
  · middle 35 / common 34 / math1 29 / math2 30
  · probability 30 / geometry 25 / calculus_extra 29
  · 기존 calculus seed 32 와 합산 **244 도구 / 262 trigger**
- `scripts/seed-math-tools.ts` 디렉터리 모드 + `--only=<file>` 옵션 추가
- Manager prompt area enum: 한국 교육과정 8단계로 재편
  (middle/common/math1/math2/calculus/probability/geometry/free)
- `MATH_AREAS` UI 8개 카드 (수학Ⅰ·Ⅱ 분리, 중학 추가)
- Supabase 적재: 244 도구 / 262 trigger / **524 임베딩** (≈ \$0.001)

### 2. 직접 입력 UI (859cdca)
- `POST /api/admin/math-tools` — 검증 + insert + 임베딩 자동 + 롤백
- `GET` — 등록 도구·trigger 카운트
- `/admin/math-tools` 헤더에 카운트 표시 + "➕ 도구 직접 추가" 토글
- AddToolForm: id/name/layer/formula/prerequisites + 동적 trigger N개
  (forward/backward/both 조건별 분기 입력)
- 임베딩 비용 ≈ \$0.000004/도구 (운영 중 점진 확장 부담 0)

### 3중 확장 채널 완성
1. LLM 시드 자동화 (대량)
2. 운영자 웹 UI (1건씩)
3. Reasoner 자동 보고 + 검수 큐 (사용자 풀이로부터)

### 다음 세션 후보
- 영역별 trigger 보강 (현재 평균 1.1, 양방향 1.5+ 목표)
- 영역별 KPI 평가 (8개 영역 각 5문항 합성)
- 베타 사용자 풀이로 Reasoner 자동 보고가 candidate_tools 채우는지 모니터링

---

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
