# Sonnet baseline 재채점 결과 (15 parse_error 케이스)

**일자**: 2026-04-29
**목적**: sub-killer 50문항 측정에서 `parse_error=true` 로 자동 오답 처리된 15건이 실제로는 Sonnet 이 맞췄을 가능성을 Haiku judge 로 재확인. Tier 1 모델 결정 (Opus vs Sonnet) 의 근거 보강.

## 핵심 결과

- **재채점 정답: 12 / 15** (모호 0 건, 80.0 %)
- **Sonnet 진짜 정답률 (sub-killer 50)**: (33 + 12) / 50 = **45 / 50 = 90.0 %**
- 기존 보고된 정답률 33 / 35 = 94.3 % 는 parse_error 15 건을 평가 대상에서 빼고 계산한 값 → 본 재채점이 정정한 "전체 50건 기준" 진짜 정답률은 **90.0 %**.

> 참고: 측정 파일 `kpi-evaluation-geometry-sonnet-baseline.json` 의 `summary.reasoner_accuracy = 0.943` 은 `total: 35` 표기와 모순되지 않으나, 결과 배열에는 50 건이 모두 포함되어 있으며 parse_error 15 건은 모두 오답 카운트되어 있다.

## Judge 모델

- Haiku 4.5 (`claude-haiku-4-5-20251001`), max_tokens 250, system = 보기 매핑 전담.
- 입력: `problem_latex` (보기 ①~⑤ 포함) + Sonnet 풀이 마지막 700자.
- 비용: 15 회 × ~700 token ≈ 0.005 USD.

## 케이스별 결과

| ID | 정답 | Sonnet 답 (실제 값) | 매칭 보기 | 정답 여부 |
|---|---|---|---|---|
| 2022-공통-12 | 3 | 3/2 | 3 | OK |
| 2022-공통-9 | 4 | 17/3 | 4 | OK |
| 2022-미적분-24 | 4 | e/4 | 4 | OK |
| 2022-미적분-26 | 3 | ln 5/3 | 3 | OK |
| 2023-공통-12 | 2 | 1/2 | 3 | x |
| 2023-미적분-26 | 4 | √3 + ln 2 | 4 | OK |
| 2023-확률과통계-27 | 2 | 7 | 4 | x |
| 2024-공통-12 | 3 | 129/4 | 3 | OK |
| 2024-공통-14 | 1 | 51 | 1 | OK |
| 2024-공통-9 | 4 | 5/3 | 4 | OK |
| 2024-기하-27 | 3 | 108√2 | 3 | OK |
| 2025-공통-14 | 4 | 36 + 30√3 | 4 | OK |
| 2025-미적분-26 | 1 | ln(e+1) | 1 | OK |
| 2026-공통-14 | 4 | 6√15/5 | 1 | x |
| 2026-기하-27 | 4 | √21 | 4 | OK |

### 오답 3건 검증 (Haiku 매핑 신뢰도 확인)

3건 모두 Haiku 매핑은 정확하며, Sonnet 본인이 도출한 답이 보기 정답과 다른 진짜 오답이다.

- **2023-공통-12** (정답 ② = -1/2). Sonnet 도출값 = +1/2 → Haiku 가 보기 ③ (= +1/2) 로 매핑. **부호 오류**.
- **2023-확률과통계-27** (정답 ② = 6). Sonnet 도출값 = 7 → 보기 ④ (= 7) 로 매핑. **연립 풀이 계산 오류**.
- **2026-공통-14** (정답 ④ = 32√15/25). Sonnet 도출값 = 6√15/5 → 보기 ① 로 매핑. **외접원 반지름 산출 오류**.

모호 (matched_choice = "?") 케이스는 0 건 — Haiku 매핑은 모든 케이스에서 결정적이었다.

## Tier 1 결정 권고

| Sonnet 진짜 정답률 | 결정 |
|---|---|
| ≥ 95 % | Tier 1 = Sonnet 즉시 채택 (5 배 비용 절감) |
| 90 % ~ 95 % | **현재 위치 (90.0 %)** — 비용·정확도 트레이드오프 필요. **Sonnet + Critic / Self-Consistency 옵션 검토 권고** |
| < 90 % | Opus 유지 |

### 결론 — Sonnet + Critic 1-pass 검증 우선 검토

- 현재 Sonnet baseline = 90.0 % 는 95 % 게이트보다 5 %p 낮다 → 단독 베이스라인으로 Tier 1 채택은 보류.
- 단, 오답 3 건 (2023-공통-12 부호, 2023-확률과통계-27 연립 계산, 2026-공통-14 외접원 반지름) 은 모두 **풀이 마지막 단계의 산수·부호 실수** 유형 → Critic Haiku 1-pass 검증으로 회수 가능성 높음.
- 권고: Sonnet baseline + Haiku Critic (검산 1-pass) 조합으로 50 문항 재측정 → 정답률 95 % 이상이면 Sonnet 라인 Tier 1 확정 (Opus 대비 비용 약 1/5).

## 재현

```bash
pnpm dlx dotenv-cli -e .env -- pnpm dlx tsx scripts/rejudge-parse-errors.ts
# 출력: docs/qa/sonnet-rejudge-15-cases.json
```

## 관련 파일

- 입력: `docs/qa/kpi-evaluation-geometry-sonnet-baseline.json`
- 평가셋: `user_docs/suneung-math/eval/sub-killer-eval.json`
- 스크립트: `scripts/rejudge-parse-errors.ts`
- 결과 JSON: `docs/qa/sonnet-rejudge-15-cases.json`
