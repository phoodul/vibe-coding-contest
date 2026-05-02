# Euler Tutor 2.0 — KPI 검증 절차

> 작성일: 2026-04-26
> 대상: Phase A~D 완료된 Euler Tutor 2.0 의 정식 출시 KPI 4종 검증

---

## 1. 검증 대상 KPI

| # | KPI | 목표 | 측정 방법 |
|---|---|---|---|
| 1 | Retriever Hit Rate | top-3 ≥ 70% | `expected_tools` 가 retrieved 상위 3 안에 포함되는 비율 |
| 2 | 단순 계산 환각 | 0% | Reasoner 답변 vs `expected_answer` 동치 비교 |
| 3 | 코칭 "왜" 포함률 | ≥ 90% | 응답에 `왜냐하면 / 이유는 / 때문에` 포함 비율 |
| 4 | 난이도 ≥ 5 정답률 | ≥ 70% | 난이도 5~6 문항만 정답률 별도 계산 |

---

## 2. 평가 문항

`data/kpi-eval-problems.json` — **합성 10문항** (수능 기출 원문 인용 금지, 유형만 변형, AI 자체 표현)

| 카테고리 | 난이도 | 영역 | 핵심 도구 |
|---|---|---|---|
| EVAL_01 평균값정리 | 4 | 미분법 | MVT |
| EVAL_02 롤의정리 | 4 | 미분법 | Rolle / 1계 부호변화 |
| EVAL_03 사잇값정리 | 5 | 함수의 연속 | IVT / 연속성 판정 |
| EVAL_04 극값 판정 | 4 | 미분법 | 1계 부호변화 / 3차함수 극값 |
| EVAL_05 치환 적분 | 4 | 적분법 | 치환적분 / 한도변환 |
| EVAL_06 부분 적분 | 5 | 적분법 | 부분적분 / 삼각함수 미분 |
| EVAL_07 회전체 부피 | 5 | 적분법 | 원판법 / 넓이=정적분 |
| EVAL_08 연쇄법칙 | 3 | 미분법 | Chain rule / 삼각함수 미분 |
| EVAL_09 음함수 미분 | 5 | 미분법 | 음함수 미분 / 접선 |
| EVAL_10 위치/속도/가속도 | 6 | 적분법 | ∫\|v\|dt / 위치·속도·가속도 |

---

## 3. 실행 절차

### 사전 준비

1. Supabase 마이그레이션 9종 적용 완료 (`supabase/migrations/*`)
2. 시드 32개 도구 적재 완료 (`pnpm dlx tsx scripts/seed-math-tools.ts`)
3. Vercel 환경변수 등록 완료 (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, Supabase 키 3종)

### 실행

```bash
# 1) Mock 모드 — schema 검증 + 시뮬레이션 (env 불필요)
pnpm dlx tsx scripts/eval-kpi.ts --mock

# 2) Full 모드 — 실제 API 호출 (env 필수)
export OPENAI_API_KEY=...
export ANTHROPIC_API_KEY=...
export NEXT_PUBLIC_SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...
pnpm dlx tsx scripts/eval-kpi.ts --full
```

### 출력

- 콘솔: 문항별 표 + 4 KPI 요약 + PASS/FAIL 판정
- 파일: `docs/qa/kpi-evaluation-result.json` — 모든 응답 원문 + 측정값

---

## 4. PASS 기준

| KPI | 기준 |
|---|---|
| Retriever top-3 hit rate | ≥ 70% |
| 난이도 ≥ 5 정답률 | ≥ 70% |
| "왜" 포함률 | ≥ 90% |

3개 모두 PASS 시 정식 출시 가능. 1개라도 FAIL 시 보완 후 재측정.

---

## 5. 미달 시 대응

### Retriever Hit Rate < 70%
1. `data/math-tools-seed.json` 의 trigger `condition` / `goal_pattern` 텍스트 보강 (해당 카테고리 trigger 추가)
2. 임베딩 재생성 (`pnpm dlx tsx scripts/seed-math-tools.ts`)
3. retriever `tool_weight` 조정 (자주 hit되는 핵심 정리는 1.2 이상)
4. 재측정

### 정답률 < 70% (난이도 ≥ 5)
1. **단순 계산 오류**: SymPy μSvc 배포 + Tool calling 활성화 확인 (`EULER_SYMPY_URL` env)
2. **풀이 흐름 오류**: `src/lib/ai/euler-reasoner-prompt.ts` few-shot 예시 추가
3. **도구 미선택**: Manager difficulty 분류 정확도 확인 → Haiku 프롬프트 보강
4. 재측정

### "왜" 포함률 < 90%
1. `src/lib/ai/euler-prompt.ts` 시스템 프롬프트에 `왜냐하면` 강제 패턴 추가
2. Reasoner few-shot 예시에 인과 어구 명시
3. 재측정

---

## 6. 최근 측정 결과

> 첫 측정은 인프라 배포 후 진행. 이 섹션은 측정 시 갱신.

### 측정 #1 — Mock 모드 (스크립트 검증)
- 일시: 2026-04-26
- 결과: 10/10 시뮬레이션 PASS (스키마 정합성만 검증, 실측 아님)
- 비고: `expected_tools` 10문항이 시드 32개 도구 이름과 정확히 매칭됨

### 측정 #2 — Full 모드 (실측)
- 일시: 미정 (Supabase 마이그레이션 + 시드 적재 + Railway 배포 후)
- 결과: TBD

---

## 7. 비용 추정 (Full 모드 1회 측정)

| 항목 | 호출 수 | 단가 | 합계 |
|---|---|---|---|
| Manager (Haiku 4.5) | 10 | ~$0.001/call | ~$0.01 |
| Embedding (text-embedding-3-small) | 20 (forward+backward) | ~$0.00002/call | ~$0.0004 |
| Reasoner (Sonnet 4.6) | 10 | ~$0.015/call | ~$0.15 |
| **합계** | — | — | **~$0.16** |

10문항 1회 측정 비용 < $0.20 — 매주 회귀 측정 권장.
