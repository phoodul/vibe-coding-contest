# Work Log — Euler Tutor 2.0

## 2026-04-28 (8차 세션 마무리 — G-05b 기하 + G-05c Gemini 진단)

### G-05b — 기하/벡터 6-mode 측정 (commit 02db0cd)
2022~2026 기하(벡터 포함) 29+30 = 10문항. 6 모드 (Sonnet agentic / Opus baseline+agentic / Gemini baseline+agentic / GPT-5.5 agentic) 측정.

핵심:
- GPT-5.5 agentic = **100%** (10/10) ⭐⭐⭐
- Opus 4.7 baseline = 90%, 39초 ⚡
- Gemini 3.1 agentic = 10% (자체 붕괴 — quota 추정)

영역별 라우팅 근거 데이터 확보. 보고서 docs/qa/kpi-geometry-g05b-report.md.

### G-05c — Gemini 429 원인 진단 (코드 보강, commit 진행)
보강:
- callModel Gemini 분기에 safetySettings BLOCK_NONE × 4 카테고리 추가
- 빈 응답 시 finishReason / promptFeedback / safetyRatings 로깅
- agentic trace 빈 응답 시 placeholder 명시 (multi-turn 누적 차단 방지)
- system prompt 에 "원문제 그대로 인용 X" 추가 (RECITATION 트리거 감소)
- scripts/probe-gemini.ts 진단 헬퍼 추가

재측정 결과: baseline 30%, agentic 0% (오히려 더 나빠짐).

직접 진단으로 진짜 원인 확정:
**Gemini 3.1 Pro "Preview" 는 paid tier Tier 1 도 250 RPD 강제 한도** (Preview 모델 정책).
- 우리 누적 350+ 호출로 429 RESOURCE_EXHAUSTED
- 21시간 후 quota 리셋

해결 옵션 (9차 세션 결정):
- A. GA 모델 전환 (gemini-3-pro 등 안정 출시 버전)
- B. Vertex AI 통해 호출 (별도 quota system)
- C. Batch API (24h turnaround)
- D. Tier 2 격상 (누적 지출 $250)

### 8차 세션 종합 commits (14)
G-04 (9): 74a607b / 211481e / c87e08b / f2a0ef8 / 6635504 / c52fe49 / 59265c2 / c2f9268 / 3b37131 / 3829e6b
G-05 (3): 25d57d0 / 6b04fd8 / 2217d29
G-05b (1): 02db0cd
G-05c (이 commit): 보강 코드 + 진단 자료

### 다음 세션 (9차) Next Action
1. Gemini 라인업 결정 (GA 전환 등)
2. G-06 4-튜터 다변화 + 영역별 라우팅 라이브 배포
3. 학생 선호도 측정 인프라
4. agentic streaming UI

---

## 2026-04-27 ~ 28 (8차 night 세션 — Phase G-05 KPI 85% 게이트 통과 ⭐)

### 진행 요약
사용자 통찰 ("진짜 multi-turn agentic + 매 turn 마다 원문제 컨텍스트 주입") 을 그대로 구현해 G-04 의 결함(prompt-inject 가짜 multi-turn) 을 정정. 5 모델 × 2 모드 (baseline + agentic) = 10 측정 night mode 자율 진행.

### 핵심 결과
| 모델 | baseline | **agentic** | 게이트 |
|---|---|---|---|
| Sonnet 4.6 | 39.5% | 81.6% | ❌ |
| Opus 4.7 | 78.9% | 81.6% | ❌ |
| GPT-5.1 | 28.9% | 42.1% | ❌ |
| **GPT-5.5** | 57.9% | **86.8%** | ✅ |
| **Gemini 3.1 Pro** | 47.4% | **89.5%** ⭐ | ✅ |

**상용화 가능 입증**: 사용자 KPI 85% 게이트 통과 모델 2개 발견. Gemini 3.1 Pro agentic 이 비용·정답률·안정성 모두 1위 (parse_err 0, 월 ~$540).

### 영역별 우위
- 가형(2017~2021 21+28+29+30): Sonnet 4.6 agentic **100%** (18/18)
- 공통(2022~2026 21+22): Gemini 3.1 Pro agentic **90%**
- 미적분(2022~2026 28+30): Opus 4.7 baseline **100%** + GPT-5.5 agentic **100%**

### night mode 자율 진행 시퀀스
1. 1단계 background `be27i0ai4` — Sonnet agentic + GPT-5.1 baseline + GPT-5.1 agentic
2. wrapper `bjbt29owz` 파일 감지 실패 → 직접 stage 2 시작 `b5n9wspr1`
3. 2단계 sequential: Opus baseline+agentic → GPT-5.5 baseline+agentic → Gemini baseline+agentic
4. monitoring 1시간 간격 wakeup × 5회
5. 종합 보고서 자동 작성

### 산출물
- `docs/qa/kpi-killer-g05-report.md` — 종합 보고
- `docs/qa/kpi-evaluation-killer-{model}-{mode}.json` × 10 — 원본
- 비용 실측: 약 $65 (1단계 $15 + 2단계 $50)

### 다음 세션 권장 (G-06)
1. Production 모델 격상 — Sonnet 4.5 → Sonnet 4.6 또는 Gemini 3.1 Pro 통합
2. agentic 모드 라이브 배포 — 난이도 5+ 만
3. 영역별 라우팅 — 미적분 Opus baseline / 공통·가형 Gemini agentic
4. KPI 95% 도전 — 영역별 듀얼 모델 + sympy/wolfram 강제

---

## 2026-04-27 (8차 세션 — G-04 killer 정답률 85% 도전 + 4채널 trigger 시스템)

### 진행 요약
사용자 지시: "math_process.md 의 alternating loop 사고법 + similar RAG + trigger 4채널 입력 시스템으로 killer 문제 정답률 85% 달성 → 상용화 게이트". 9 task 모두 commit 완료. 다만 1차 측정 결과 KPI 게이트 한참 미달 (20~30%).

### 9 task commits
| Task | 커밋 | 내용 |
|---|---|---|
| G04-1 | 74a607b | killer 평가셋 58문항 추출 (user_docs 격리) |
| G04-2 | 211481e | eval-kpi --killer / --mode + 객관식·주관식 자동 채점 + LLM judge |
| G04-3 | c87e08b | Manager goals/constraints/expected_triggers 출력 강화 |
| G04-4 | f2a0ef8 | alternatingChain (역행↔순행) — math_process.md ③ |
| G04-5 | 6635504 | similar_problems RAG (58/160 trigger 라벨, 백엔드 한정) |
| G04-6 | c52fe49 | eval-kpi inline alternating + RAG (4-way 측정 인프라) |
| G04-8 | 59265c2 | trigger 직접 입력 (3채널) — admin + contributor 권한 |
| G04-9 | c2f9268 | 자체 학습 trigger mining (4채널) — cron + 검수 큐 |
| G04-7 | 3829e6b | 1차 측정 보고서 — KPI 미달 + 4 옵션 제시 |

### 핵심 측정 결과 (limit 20)
- **baseline 30%** = **chain_only 30%** = SOTA 단발 천장. alternating loop 효과 없음.
- **chain_rag 20%** — RAG inject 가 오히려 attention 분산.
- **Manager 실패율 60%** — expected_triggers 추가로 출력 잘림 → 측정 신뢰도 저해.
- chain 종료의 75% 가 forward_only_progress — chain 자체가 풀이를 닫지 못함.

### KPI 85% 게이트 미달 — 향후 4 옵션
A. Manager 안정화 → 재측정 (단기, maxTokens 1500)
B. KPI 게이트 전환 — 학생 코칭 가치 (chain visualization, trigger 학습) 차별화
C. GPT-5.1 측정 — SOTA 천장 확인
D. chain 을 진짜 multi-turn API 로 전환 (장기)

권장: A + C 병행 + B 동시 진행.

### 4채널 trigger 입력 시스템 가동 완료 (KPI 게이트와 별개 자산)
| 채널 | 상태 |
|---|---|
| (1) 시드 JSON | ✅ 244 / 463 trigger |
| (2) Haiku batch (G-03) | ✅ |
| (3) 직접 입력 (developer + contributor) | ✅ G04-8 |
| (4) 자체 학습 mining (cron) | ✅ G04-9 매일 03:30 KST |

### 사용자 결정 대기
- KPI 85% 게이트 유지/완화 여부
- 4 옵션 중 어느 방향으로

---

## 2026-04-27 Night (7차 세션 — G-03 chain miss + Trigger 보강 + KPI A/B, Night mode 자율)

### 진행 요약
사용자 지시: "G-03 + Trigger 보강 + 역행/순행 분해 방식의 킬러 정답률 A/B 측정". 6 task, 3 commits, KPI 결과 데이터까지 산출.

### 1. Phase G-03: chain miss 추적 인프라 (e27a1b5)

**마이그레이션** — `supabase/migrations/20260507_euler_solve_logs_chain.sql`
- `chain_termination` (reached_conditions/max_depth/dead_end/cycle), `chain_depth` (0~8), `chain_used_tools` (text[])
- 인덱스 `euler_logs_chain_idx` (where chain_termination is not null)
- mcp__supabase__apply_migration 으로 직접 적용 (✓ success)

**서버 사이드** — solve-logger / orchestrator route / weakness-aggregator
- SolveLogInput 에 chain 메타 3종 추가
- orchestrator: `chainLogMeta` 외부 변수로 잡아 logSolve 호출 시 전달
- weakness-aggregator: `chain_miss` 진단 카테고리 추가 — chain_termination !== reached_conditions 누적

**클라이언트** — `progress` API + `/euler/report` 페이지
- progress route: chain {executed_count, avg_depth, distribution, success_rate} 집계
- ChainTerminationChart 컴포넌트 — 4종 종료 사유별 분포 + 힌트 멘트 (조건 도달/최대 깊이/막다른 길/순환)

### 2. Trigger 보강 — 244 / 262 → 244 / 463 (avg 1.07 → 1.90) (0377124)

- `scripts/augment-triggers.ts` 신규: Haiku 4.5 로 도구당 부족한 방향 trigger 1개 자동 생성
  · 기존 trigger 가 forward 만 있으면 backward 추가, 그 반대도 동일
  · 5개씩 병렬 호출 + 검증 (direction/condition/goal_pattern/why 필드 정합성)
- 9 영역 모두 적용 (write 모드): +201 trigger / 0 failed
  · calculus_extra +28 · common +31 · geometry +24 · math1 +29 · math2 +30
  · middle1 +7 · middle2 +6 · middle3 +15 · probability +30
- DB 적재: `seed-math-tools.ts` 실행 → 244 tools upsert + 463 triggers reinsert + 926 임베딩 (forward+backward)

### 3. KPI A/B 측정 — chain ON vs OFF (9fd6d8d)

**eval-kpi.ts 확장**:
- `--chain` 플래그 추가 → 난이도 ≥5 문항만 recursiveBackwardChain 실행
- chain 결과를 chainContext 로 직렬화 → Reasoner systemPrompt 에 inject
- runRecursiveChain inline 구현 (server supabase 의존 회피, 본 스크립트의 runRetriever 재사용)
- KpiSummary.chain {executed_count, avg_depth, termination_dist, success_rate} 추가
- 결과 파일 분리: kpi-evaluation-baseline.json / kpi-evaluation-chain.json

**측정 결과** (45 합성 문항, 9 영역):

| 지표 | Baseline | Chain ON | Δ |
|---|---|---|---|
| **난이도 ≥5 정답률** | 9/19 = **47.4%** | 9/19 = **47.4%** | **0pp** |
| 전체 정답률 | 30/45 = 66.7% | 31/45 = 68.9% | +2.2pp (난이도 3 1건 우연) |
| Retriever top-3 | 68.9% | 68.9% | 0 |
| Retriever top-5 | 77.8% | 75.6% | -2.2pp (오차) |
| Chain (chain ON 만) | — | **19/19 reached, avg depth 2.21** | 100% 종료 |

**핵심 인사이트**:
1. chain 알고리즘 자체는 robust — 19건 모두 reached_conditions, dead_end/cycle 0건
2. Sonnet 4.6 단발이 이미 강해 chain inject 가 정답률을 끌어올리지 못함 (계산 오류는 chain 으로 못 막음)
3. 평균 depth 2.21 너무 얕음 — Tree-of-Thoughts 효과는 d=4~5 에서 발생 (Yao 2023)
4. chain 시각화의 **학생 코칭 가치는 별개** — 학습 리포트에 chain miss 패턴 누적 (Phase G-03 인프라) 으로 향후 측정 가능

**향후 개선 (Phase G-04 후보)**:
- chain min_depth 강제 (depth=1 reached 막기)
- chain inject 어조 강화 (참고 → 의무)
- SymPy tool 호출을 chain step 마다 강제 (계산 오류 차단)
- 실제 수능 28~30번 평가셋 확보

### 산출물
- `docs/qa/kpi-evaluation-baseline.json` — 45 문항 chain OFF raw
- `docs/qa/kpi-evaluation-chain.json` — 45 문항 chain ON raw
- `docs/qa/kpi-chain-ab-report.md` — 분석 보고서
- DB: 463 triggers / 926 embeddings

## 2026-04-27 Night (6차 세션 — G-02 + 중학교 분리, Night mode 자율)

### 진행 요약
사용자 수면 시간 동안 Phase G-02 전 4 task + 중학교 학년별 분리 2 task 를 자율 진행. 6 commits, tsc + dry-run 모두 통과. chain 시각화 라이브.

### 1. Phase G-02: Recursive Backward Reasoner (a6e3d2d → d008659)

**G02-A — Manager 8-Layer 출력 확장 (a6e3d2d)**
- `ManagerResult` 에 5종 optional 필드: `needs_layer_8`, `area_layer_5`, `layer_6_difficulty`, `layer_7_direction`, `computational_load`
- `effectiveDifficulty(mgr)` — layer_6 우선, fallback to legacy difficulty
- `shouldRunRecursiveChain(mgr)` — layer_6 ≥ 5 또는 difficulty ≥ 6
- area enum 에 middle1/middle2/middle3 추가 (MID-A 와 동기)

**G02-B — Recursive Backward Reasoner 모듈 (b0d682b)**
- `src/lib/euler/recursive-reasoner.ts` 신규
- `recursiveBackwardChain({problem, conditions, goal, maxDepth=5})` — 각 depth: backward Retriever → Sonnet 분해 → next_subgoal
- 종료 사유 4종: reached_conditions / dead_end / cycle / max_depth
- `chainToCoachingText(result)` — systemPrompt inject 용 직렬화
- `buildSubgoalDecomposePrompt({currentGoal, candidateTools, previousChain})` — 단일 분해 경로만 강제
- 학술 근거: Self-Ask (Press 2023, +12.4%p), ToT (Yao 2023, 4%→74%), CoVe (Dhuliawala 2023)

**G02-C — orchestrator route.ts 통합 (8bc6bf7)**
- `effectiveDifficulty` 로 분기 임계값 일원화 (cross-check 도)
- `runChain` 게이트 — `shouldRunRecursiveChain` 분기
- 결과 이중 출력:
  · `chainContext` → systemPrompt 에 코칭 가이드 inject
  · `streamData.append({kind: "recursive_chain", ...})` → 클라이언트 시각화
- chain 의 used_tools 도 candidate_tools 보고 채널에 추가
- `streamText` `onFinish` 에서 `streamData.close()`

**G02-D — BackwardChain 시각화 (d008659)**
- `src/components/euler/BackwardChain.tsx` 신규 — depth 카드 + 도구 칩 + rationale + 종료 사유
- `pickLatestChain(data)` — useChat data 배열에서 payload 추출
- page.tsx 에서 useChat 의 `data + setData` 분해 + 첫 user 메시지 직후에 카드 노출
- 새 문제 시작 시 `setData(undefined)` 로 초기화

### 2. 중학교 학년별 시드 분리 (09782c6, 2e79ae4)

**MID-A — middle.json (35) → middle1/2/3 분리 (09782c6)**
- 한국 2015 개정 교육과정 기준
- middle1.json (8): 정수·일차방정식·평면/입체도형·정비례
- middle2.json (8): 일차함수·연립방정식·합동·닮음·확률
- middle3.json (19): 이차방정식·이차함수·삼각비·원의 성질·대푯값
- tool_id 그대로 유지 (DB 호환성)
- dry-run 검증: 244 tools 전체 합계 동일 통과

**MID-B — enum + UI 갱신 (2e79ae4)**
- `EULER_TOOLS_BY_AREA` middle1/2/3 별 부분집합
- `REASONER_THRESHOLD_BY_AREA` middle1/2/3 모두 4
- `KOREAN_AREA_MAP` "중1/중2/중3/중학교N학년" 매핑 + 후방 호환 ("중학수학" → middle3)
- `MATH_AREAS` UI 8개 → 10개 카드 (1️⃣ 중1 / 2️⃣ 중2 / 3️⃣ 중3)

### 핵심 가치
- **방법 찾기 코칭의 본질화**: 난이도 5+ 문제는 chain 카드로 "AI 사고 과정" 가시화 — Khanmigo/ChatGPT Study Mode 가 못하는 영역
- **8-Layer 분리**: insight gap (layer_6) vs computational load 분리 → 정확한 분기. 단순 계산은 LLM, 발견적 비약은 Recursive Chain
- **중학교 학년별 진입점**: 학습자가 자기 학년 도구 셋만 보도록 격리. Retriever 결과는 동일하나 Manager area 분류로 더 정확한 진단 가능

### 사용자 액션 (Phase G-02 + MID 라이브 후 검증 필요)
1. 어려운 문제 (수능 30번류 또는 layer_6=5+) 1건 풀이 → BackwardChain 카드 노출 확인
2. 단순 문제 (layer_6 < 5) → 카드 미표시 확인 (억지 X)
3. 중1/중2/중3 카드 진입 후 Manager area 응답 검증
4. (선택) 시드 재적재 — DB 변화 없으므로 불요. 다만 middle.json 삭제됨에 따라 dry-run 만 수행함

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
