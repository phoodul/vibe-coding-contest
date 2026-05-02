# Phase G-02 Recursive Backward Chain — 정답률 A/B 측정 보고서

> 측정일: 2026-04-27 Night (6차 세션 자율)
> 평가셋: `data/kpi-eval-problems.json` — 합성 45 문항 (수능·내신 유형, 9 영역)
> 모드: `pnpm dlx tsx scripts/eval-kpi.ts --full` (baseline) vs `--full --chain` (Phase G-02 ON)
> 시드: 244 도구 / 463 trigger (avg 1.90) — Track 2 보강 후 상태

## 요약

| 지표 | Baseline (chain OFF) | Chain ON | Δ |
|---|---|---|---|
| **난이도 ≥5 정답률** | 9/19 = **47.4%** | 9/19 = **47.4%** | **0pp** |
| 전체 정답률 | 30/45 = 66.7% | 31/45 = 68.9% | +2.2pp (난이도 3 1건 우연 정답) |
| Retriever Hit (top-3) | 68.9% | 68.9% | 0pp |
| Retriever Hit (top-5) | 77.8% | 75.6% | -2.2pp (오차 범위) |
| "왜" 포함률 | 100% | 100% | 0 |
| Manager 분류 성공률 | 100% | 100% | 0 |

**결론**: Phase G-02 Recursive Chain 활성화는 **킬러 문제 정답률을 통계적으로 유의하게 올리지 못했다.**
다만 chain 알고리즘 자체는 **100% 종료 성공 (reached_conditions 19/19)** 으로 robust하게 작동했다.

---

## Recursive Chain 동작 검증

| 항목 | 값 |
|---|---|
| 실행 건수 | 19/45 (난이도 ≥5 게이트 통과한 문항만) |
| 평균 depth | 2.21 |
| depth 분포 | d=1: 5건 / d=2: 7건 / d=3: 5건 / d=4: 2건 / d=5: 0건 |
| 종료 분포 | reached_conditions: **19** / max_depth: 0 / dead_end: 0 / cycle: 0 |
| 조건 도달률 | **100%** |

→ 분해 알고리즘은 모든 케이스에서 깨끗하게 종료. cycle 회피·max_depth cap 모두 잘 작동.

## 문항별 정답 변동 (baseline → chain)

| ID | 난이도 | baseline | chain | 비고 |
|---|---|---|---|---|
| EVAL_08 | 3 | ✗ | ✓ | chain 미실행 (3<5). LLM 단발 변동 |

**난이도 ≥5 19문항 중 정답이 바뀐 케이스: 0건.**

---

## 난이도 ≥5 문항별 chain 데이터 (19건)

| ID | depth | tools | termination | baseline | chain |
|---|---|---|---|---|---|
| EVAL_03 | 1 | 사잇값 정리 (L5) | reached | ✓ | ✓ |
| EVAL_06 | 3 | 삼각함수의 미분 (L5) | reached | ✓ | ✓ |
| EVAL_07 | 2 | 회전체의 부피 (디스크) | reached | ✗ | ✗ |
| EVAL_09 | 2 | 음함수 미분 (L6) | reached | ✗ | ✗ |
| EVAL_10 | 4 | 속도·시간 → 변위·거리 | reached | ✓ | ✓ |
| EVAL_C04 | 2 | 매개변수 미분 | reached | ✗ | ✗ |
| EVAL_M1_03 | 3 | 삼각방정식, 이차방정식 인수분해 | reached | ✗ | ✗ |
| EVAL_M1_05 | 1 | 무한등비급수의 합 | reached | ✗ | ✗ |
| EVAL_M2_03 | 4 | 3차함수 극값, 이계도함수 부호 | reached | ✓ | ✓ |
| EVAL_M2_04 | 1 | (도구 미선정) | reached | ✗ | ✗ |
| EVAL_P02 | 1 | 표준정규분포표 활용 | reached | ✗ | ✗ |
| EVAL_P04 | 2 | 여사건, 독립시행 | reached | ✓ | ✓ |
| EVAL_G03 | 1 | (도구 미선정) | reached | ✓ | ✓ |
| EVAL_G04 | 2 | 점과 평면 거리 | reached | ✗ | ✗ |
| EVAL_CL01 | 3 | 부정적분의 정의 | reached | ✓ | ✓ |
| EVAL_CL02 | 3 | 부분적분 (L6) | reached | ✓ | ✓ |
| EVAL_CL03 | 2 | sin x/x 의 극한 | reached | ✓ | ✓ |
| EVAL_CL04 | 3 | 매개변수 미분법 | reached | ✗ | ✗ |
| EVAL_CL05 | 2 | 회전체 부피 (원판법) | reached | ✗ | ✗ |

---

## 왜 정답률을 못 올렸는가? — 원인 분석

### 1. **Sonnet 4.6 단발 능력이 이미 강함**
   - chain context 없이도 47.4% (9/19) 정답 → Reasoner 가 자력으로 풀어내거나 못 풀거나가 결정적
   - 실패한 10건의 패턴: 풀이 방향은 맞으나 **수학적 계산·기호 조작에서 오류** (chain 이 분해해도 동일 오류)

### 2. **chain 평균 depth 2.21로 너무 얕음**
   - 5/19 가 d=1 (즉 첫 분해에서 reached_conditions 처리)
   - Sonnet 이 conditions 를 훑고 곧바로 "이 도구 하나면 닿는다" 판단 → 깊은 분해 회피 경향
   - 진짜 Tree-of-Thoughts 효과는 depth 4~5 에서 발생 (Yao 2023). 현재 평균 2.21로는 부족

### 3. **chain 결과가 Reasoner systemPrompt 에 inject 되지만 영향력 약함**
   - "위 chain 의 분해 순서를 따라 풀이를 전개하세요" 지시 정도로는 Sonnet 의 자체 추론 흐름 위에 덧붙는 보조 단서
   - Reasoner 가 이미 같은 도구를 자체적으로 떠올렸다면 chain 의 가치 X

### 4. **합성 평가셋의 한계**
   - 45문항 모두 합성 (수능 원문 인용 금지) — 실제 킬러 문제(수능 28~30번)보다 1단계 쉬움
   - difficulty=6 문항 3건만 존재. 진짜 킬러에서는 chain 효과가 더 크게 나타날 가능성

---

## 가치 판단 — chain 을 유지할 것인가?

### ✅ 유지 (현재 결정)
1. **정답률 손실 없음** — 47.4% 동일. 학생 신뢰 측면에서 안전.
2. **학생 코칭 가치** — chain 시각화 (BackwardChain 컴포넌트) 는 정답률과 별개로 "AI 가 어떻게 생각했는지" 가시화 → ChatGPT Study Mode·Khanmigo 가 못하는 차별화
3. **학습 데이터 축적** — Phase G-03 인프라로 chain miss 패턴 누적 → 학생별 약점 진단 정확도 ↑
4. **알고리즘 robust** — 19/19 reached, 0 cycle/dead_end. 안정성 검증 완료
5. **비용 미미** — chain 평균 11s, 19/45 케이스만. 추가 시간 ≈ 220초/45문항 ≈ 5초/문항

### ⏸ 향후 개선 후보 (Phase G-04 가능)
1. **min_depth 강제** — depth=1 에서 reached 처리 시 1회 더 분해 강제 → ToT 효과 살리기
2. **chain inject 강화** — "참고 경로" → "**이 분해 순서를 의무로 따르라**" 로 어조 강화
3. **계산 검증 통합** — 정답을 틀린 10건 중 다수가 계산 오류 → SymPy tool 호출을 chain step 마다 강제
4. **실제 수능 28~30번 평가셋 확보** — 합성 difficulty=6 보다 진짜 킬러로 측정

---

## 부가 발견 — Trigger 보강 효과 (Track 2)

| 지표 | 보강 전 (262 trigger) | 보강 후 (463 trigger) |
|---|---|---|
| Retriever top-3 hit | (이전 측정 없음) | 68.9% |
| Retriever top-5 hit | (이전 측정 없음) | 77.8% |
| 영역별 trigger 평균 | 1.07 | 1.90 |

→ 본 측정에서 Retriever 자체 베이스라인 확립. 향후 trigger 추가 시 비교 가능.

---

## 비용·시간

- baseline: 45 문항 × ~13s = ~10분
- chain: 45 문항 × ~13s + 19 × chain (~7s 추가) = ~12분
- API 비용: Anthropic Sonnet ~$1.5/run + Haiku ~$0.05/run + OpenAI embed ~$0.01 ≈ **$3.1 양 모드 합계**

## 산출물

- `docs/qa/kpi-evaluation-baseline.json` — 45 문항 baseline raw
- `docs/qa/kpi-evaluation-chain.json` — 45 문항 chain ON raw
- `docs/qa/kpi-chain-ab-report.md` — 본 보고서
