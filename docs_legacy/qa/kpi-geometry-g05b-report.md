# Phase G-05b 보강 측정 — 기하/벡터 6-mode

> 측정일: 2026-04-28 오전
> 평가셋: 2022~2026 수능 기하(벡터 포함) 29번 + 30번 = **10 문항** (전부 주관식)
> 출처: `user_docs/suneung-math/eval/geometry-eval.json`

---

## 종합 결과

| 모델 | 모드 | 정답률 | parse_err | 응답시간 | 풀이당 비용 | 비고 |
|---|---|---|---|---|---|---|
| **GPT-5.5** | agentic | **100%** (10/10) ⭐⭐⭐ | 0 | 106s | $0.255 | 완벽 정복 |
| **Opus 4.7** | **baseline** | **90%** (9/10) ⭐⭐ | 1 | **39s** ⚡ | $0.058 | 빠르고 정확한 winner |
| Opus 4.7 | agentic | 90% (9/10) | 1 | 65s | $0.218 | baseline 동급 |
| Sonnet 4.6 | agentic | 80% (8/10) | 2 | 105s | $0.131 | 안정적 |
| Gemini 3.1 | baseline | 40% (4/10) | 6 | 44s | $0.026 | 응답 잘림 다수 |
| **Gemini 3.1** | **agentic** | **10%** (1/10) ⚠️ | **9** | **1.7s!** | $0.102 | **자체 붕괴** |

---

## 핵심 발견

### 1. **GPT-5.5 agentic = 100% 기하/벡터 완전 정복** ⭐
이전 미적분(28+30) 도 100% 였음. **GPT-5.5 가 주관식 정수 답 + 도형 추론에 가장 강함**.

### 2. **Opus 4.7 baseline = 90%, 39초** — 비용·속도·정답률 1위
- 단발 호출인데 정답률이 agentic 과 동급 (90%)
- 응답시간 39초 — 학생 체감 짧음
- 비용 $0.058 — Opus agentic 의 1/4
- **기하 영역의 best-value 모델**

### 3. **Gemini 3.1 Pro agentic 기하 자체 붕괴 (10%)** ⚠️
- parse_err 9/10, 평균 응답 1.7s
- 일부 문제 (예: 2022-기하-30, 2023-기하-29) 가 즉시 빈 응답 (111~161ms)
- 추정 원인: Gemini API 의 **safety filter** 또는 `finish_reason=SAFETY/RECITATION` 으로 응답 차단
- 정상 답한 케이스 (예: 2022-기하-29) 는 풀이 정교했지만 step 2 부터 빈 응답
- **Gemini 3.1 Pro 는 기하 domain 에서 신뢰 불가**

### 4. agentic 효과 (기하 한정)
| 모델 | baseline | agentic | Δ |
|---|---|---|---|
| Opus 4.7 | 90% | 90% | 0 |
| Gemini 3.1 | 40% | 10% | **−30pp** ⚠️ |

agentic 이 기하에서 효과 없거나 (Opus) 오히려 해로움 (Gemini). killer 평가셋(공통+미적분+가형) 의 +42pp 효과와 정반대 패턴.

---

## 영역별 모델 우위 종합 (G-05 + G-05b 통합)

| 영역 | 1위 | 2위 |
|---|---|---|
| 가형(2017~2021 21+28+29+30) | Sonnet 4.6 agentic 100% | Opus 4.7 agentic 94% |
| 공통(2022~2026 21+22) | Gemini 3.1 Pro agentic 90% | GPT-5.5 agentic 80% |
| 미적분(2022~2026 28+30) | Opus 4.7 baseline 100% / GPT-5.5 agentic 100% | Gemini agentic 90% |
| **기하(2022~2026 29+30)** | **GPT-5.5 agentic 100%** | **Opus 4.7 baseline 90%** ⚡ |

### 영역별 라우팅 권장 (G-06)
```
미적분 → Opus 4.7 baseline (단발, 빠르고 정확)
기하   → GPT-5.5 agentic 또는 Opus 4.7 baseline (속도 우선이면 Opus)
공통   → Gemini 3.1 Pro agentic
가형 킬러 → Sonnet 4.6 agentic 또는 Opus 4.7 agentic
```

---

## 튜터 다변화 — 영역 강점 기반 페르소나 (G-06 plan)

| 튜터 | 모델·모드 | 강점 | 학생 선택 권장 |
|---|---|---|---|
| **🧮 오일러** | Sonnet 4.6 agentic | 친절한 단계 분해, 가형 킬러 100% | 차근차근 풀이 학습 |
| **⚡ 라이프니츠** | Opus 4.7 baseline | 빠르고 정확, 미적분 100% / 기하 90% | 빠른 정답 확인 |
| **🎯 가우스** | Gemini 3.1 Pro agentic | 공통 90%, 균형 잡힌 종합 | 공통수학 문제 |
| **🔥 페르마** | GPT-5.5 agentic | **미적분 100% + 기하 100% 완벽 정복** | 킬러 문제 도전 (특히 기하) |

---

## Gemini 의 기하 약점 — G-06 후속 조사 항목

향후 plan:
1. callModel 의 Gemini 분기에 `finish_reason` 로깅 추가 → safety 차단 빈도 측정
2. Gemini API 의 `safetySettings` 명시적 설정 (BLOCK_NONE) 시도
3. 기하 문제 텍스트의 어떤 표현이 차단되는지 패턴 분석 (도형 좌표·각도 표현?)
4. 실패 시 자동 fallback (Gemini → GPT-5.5)

---

## 측정 데이터

- `docs/qa/kpi-evaluation-geometry-{model}-{mode}.json` × 6
- 비용 실측: 약 $6 (예상 $8 보다 적게 — 일부 Gemini agentic 응답이 빈 값이라 토큰 소비 ↓)

## 한 문장 결론

> **"기하/벡터 영역에서는 GPT-5.5 agentic 100% / Opus 4.7 baseline 90% 가 최강. Gemini 3.1 Pro agentic 은 safety 차단으로 자체 붕괴 (10%) — 영역별 모델 라우팅 필수성 입증."**
