# Phase G-04 Killer A/B 측정 보고서 (1차)

> 측정일: 2026-04-27 8차 세션
> 평가셋: 수능 21+29+30번 메인 58문항 중 limit 20 (각 모드 동일 시드)
> 모델: Sonnet 4.6 (오일러 페르소나) + Manager Haiku 4.5
> KPI 게이트: **killer 정답률 ≥ 85%** → 도달 시 상용화 가능 판단

---

## 요약 — KPI 게이트 미달

| 모드 | 전체 정답률 | 21번(d=5) | 29-30번(d=6) | Manager 실패율 | 평균 chain depth | chain reached |
|---|---|---|---|---|---|---|
| **baseline** | **30.0%** (6/20) | 2/8 | 4/12 | 60% (12/20) | — | — |
| **chain_only** (alternating) | **30.0%** (6/20) | 1/8 | 5/12 | 60% (12/20) | 2.50 | 25% (2/8) |
| **chain_rag** (+similar RAG) | **20.0%** (4/20) | 0/8 | 4/12 | 55% (11/20) | 2.63 | 12.5% (1/8) |
| **full** (+expected_triggers) | **20.0%** (4/20) | 0/8 | 4/12 | 45% (9/20) | 2.82 | **36.4% (4/11)** |

**핵심 결론**: 4-way 모두 KPI 85% 게이트 한참 미달. **alternating loop / similar RAG / expected_triggers 모두 정답률 향상에 기여하지 않음**. full 의 chain reached 율 36% (가장 높음) 으로 chain 자체는 더 잘 작동하지만 정답률은 baseline 대비 -10pp.

특이점: full 의 Manager 성공률 55% 가 가장 높은 이유 — expected_triggers 가 출력에 포함되면 JSON 형식이 더 풍부해져 parse 안정성이 ↑하는 것으로 추정. 그러나 풍부한 trigger inject 가 Sonnet 의 풀이 정확도엔 도움 안 됨.

---

## 1. 가설별 검증

### H1: alternating loop (역행↔순행) 가 정답률을 끌어올린다 — **반증**

baseline 30% = chain_only 30%. G-03 측정 결과(chain ON 0pp)와 동일 패턴 재현.
chain 종료 분포가 **forward_only_progress 6/8 (75%)** — backward dead end 후 forward 만 진전, 즉 chain 자체가 풀이를 닫지 못함. Sonnet 단발이 chain 없이도 같은 정답률에 도달하는 것은 **chain 이 prompt-inject 형식이라 실제 reasoning 분기를 만들지 못하기 때문**으로 추정.

### H2: similar_problems RAG 가 풀이 정확도를 보강한다 — **반증 (오히려 해로움)**

chain_rag 20% < baseline 30%. RAG inject 가 system prompt 길이를 늘려 **Sonnet 의 attention 을 분산**시키거나, Haiku 라벨 정확도(70~80% 추정)가 **노이즈로 작용**한 것으로 보임. retrieve top-3 의 trigger 패턴이 현재 문제와 미묘하게 어긋날 때 reasoner 가 잘못된 방향으로 유도될 가능성.

### H3: 같은 사고법(alternating)이 학생 코칭으로 전이 가능 — **별개 검증 필요**

LLM 정답률 무영향 ≠ 학생 코칭 가치 0. chain visualization 카드의 학생 코칭 효과는 사용자 경험 측정이 별도로 필요 (베타 사용자 학습 진척으로 추적).

---

## 2. 측정의 핵심 노이즈 — Manager 실패율 55~60%

전 모드에서 Manager(Haiku 4.5) 가 JSON parse 실패 12/20 = 60% 발생.

원인 추정:
- G04-3 에서 `goals[]`, `constraints[]`, `expected_triggers[]` 추가로 출력 길이 ↑
- maxTokens 800 으로도 expected_triggers 까지 출력 시 잘림 → JSON 비유효
- 일부 문제는 Mathpix LaTeX 가 매우 길어 input 자체도 큼

→ Manager 실패 시 conditions=[] → Retriever 호출 불가 → Chain 호출도 의미 없음 → **측정 신뢰도 자체가 낮음**.

긴급 fix:
- Manager maxTokens 800 → 1500 상향 (출력 잘림 방지)
- 또는 expected_triggers 출력을 Manager 에서 분리 (별도 LLM 호출)
- 또는 Manager 모델을 Sonnet 4.6 으로 격상 (비용 ↑)

---

## 3. SOTA 한계와의 비교

학계·업계 보고에 따르면 **수능 killer 28~30번을 GPT-5.4/Gemini 3.1 단발 호출로 풀면 ~25~35% 정답률**이 보통의 천장이다 (project-decisions.md 의 정답률 목표 참조 — "킬러 77%" 는 단발이 아닌 6계층 풀구현 가정).

우리 Sonnet 4.6 baseline 30% 는 SOTA 단발 한계와 일치. 이는 **현재 아키텍처 (prompt inject 방식의 chain + RAG) 가 단발의 한계를 깨지 못한다**는 강한 시그널.

---

## 4. 향후 방향 옵션 (사용자 결정 필요)

### A. Manager 안정화 → 재측정 (단기, 1 commit)
- Manager maxTokens 1500 + expected_triggers 단순화
- 동일 4-way 측정 재실행 (≈ 2시간 + ~$10)
- **예상 결과**: Manager 실패가 줄어 측정 신뢰도는 ↑하나 정답률 자체는 비슷할 가능성 ↑
- **결정 기준**: 측정 신뢰도 확보 후 진짜 가설 검증

### B. 정답률 KPI 게이트 포기, 학생 코칭 가치로 차별화 (방향 전환)
- "killer 85% 도달" 게이트를 "학생이 trigger 패턴을 학습하면 막힘 빈도 ↓" 로 교체
- chain visualization, trigger 학습 진척, weakness report (l6_trigger_miss) 강화
- 베타 사용자 풀이 누적 → 실제 학습 진척 측정 (KPI: 7일 풀이 후 동일 유형 정답률 ↑)
- **장점**: 실현 가능한 차별화 (Khanmigo·QANDA 도 못 하는 영역). 정답률 단발 SOTA 게임에서 빠짐
- **단점**: 측정 시간 길다 (베타 누적 4~8주)

### C. 모델 업그레이드 — GPT-5.1 (가우스) 측정 (검증)
- useGpt=true 로 동일 4-way 재측정 (가우스 모드)
- **예상 결과**: 25~40% 범위 (SOTA 천장)
- **목적**: 모델 자체의 한계 vs 우리 아키텍처의 한계 분리

### D. chain 을 진짜 multi-turn API 호출로 전환 (장기, 큰 작업)
- 현재: chain 결과를 system prompt 에 inject 만 함
- 신규: chain 단계마다 Sonnet 을 실제 호출 (multi-turn agentic)
- **예상 결과**: 정답률 ↑ 가능성 (학계의 ToT/Self-Ask 효과). 비용 ↑, 응답 시간 ↑
- 작업량: 1~2주

---

## 5. 권장 (Architect 의견)

**A + C 병행** 권장:

1. **즉시 (1 commit)**: Manager 안정화 — maxTokens 1500 + Manager prompt 의 expected_triggers 출력 명시 약화 ("모르면 빈 배열" 강조)
2. **재측정** (1차): 안정화 후 baseline + chain_only 만 재측정 (RAG 는 부정 결과로 보류)
3. **GPT-5.1 측정** (병행): useGpt=true 로 baseline 재측정 → SOTA 천장 확인
4. **결과 분석**: 35% 미만이면 → 옵션 B (방향 전환). 50%+ 이면 → 옵션 D (multi-turn) 검토

**B 는 KPI 게이트와 무관하게 동시에 진행 가치 있음** — chain visualization·trigger 학습 데이터는 베타 검증의 핵심 자산.

---

## 6. 4채널 trigger 입력 시스템 — KPI 별개로 가동 완료

| 채널 | 상태 |
|---|---|
| (1) 시드 JSON | ✅ 244 도구 / 463 trigger |
| (2) Haiku batch | ✅ G-03 augment-triggers |
| (3) 직접 입력 (developer + contributor) | ✅ G04-8 |
| (4) 자체 학습 mining | ✅ G04-9 cron 03:30 KST |

trigger 시스템은 정답률과 별도로 **학생 코칭 자산**으로 누적 가치 있음.

---

## 부록: 측정 데이터 파일

- `docs/qa/kpi-evaluation-killer-baseline.json` (20문항)
- `docs/qa/kpi-evaluation-killer-chain_only.json` (20문항)
- `docs/qa/kpi-evaluation-killer-chain_rag.json` (20문항)
- `docs/qa/kpi-evaluation-killer-full.json` (20문항 측정 완료)
