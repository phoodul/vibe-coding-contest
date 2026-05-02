# Phase 0 — P0-01 베타 1명 사용 데이터 분석 결과

> 작성일: 2026-05-03 / Phase: 0 / Task: P0-01
> 데이터 출처: Supabase MCP execute_sql + 코드 audit
> 베타 사용자 user_id prefix: `e4e9c230` (PII 마스킹)

## 1. 베타 사용자 식별

| 항목 | 값 |
|---|---|
| 학년 | high3 (고3) |
| 신청서 area | calculus (미적분) |
| 신청·승인 | 2026-05-01 (동일일자) |
| invite 만료 | 2026-05-31 (D-29) |
| 사용 시작 | 2026-05-02 (1일 차) |
| 가드레일 위반 | 0 ✅ |

## 2. 사용 통계 (1일 차 시점)

| 영역 | 횟수 | 평가 |
|---|---|---|
| euler_solve_logs | 2 | 풀이 시도 있음 |
| legend_tutor_sessions | **0** | ⚠️ Legend 라우팅 미작동 |
| legend_routing_decisions | **0** | ⚠️ 3-Stage Adaptive Router 우회 |
| per_problem_reports (R1 카드) | **0** | ⚠️ 풀이 정리·trigger_motivation 미생성 |
| beta_reviews | 0 | 정상 (1일 차) |
| guardrail_violations | 0 | ✅ 좋음 |
| candidate_triggers (자동 누적) | 0 | ⚠️ Δ23 인프라 미동작 (또는 발견 X) |
| candidate_tools | 9 | ✅ Reasoner 자동 발굴 OK |

## 3. 근본 결함 — `area: '자유 질문'` 하드코딩 (P1 critical)

베타 사용자의 풀이 2건 모두 다음 필드가 null 또는 우회:

| 필드 | 값 |
|---|---|
| area | `'자유 질문'` (수학 영역 미분류) |
| difficulty | null |
| is_correct | null (채점 자체 미수행) |
| chain_termination | null |
| chain_depth | null |
| final_answer | null |
| legend_session_id | **null** (Legend 라우팅 우회) |
| critic_passed | null |

### 원인 (코드 위치)

**`src/components/legend/BetaChat.tsx:96`**:

```tsx
body: { area: '자유 질문', useGpt, input_mode: 'text' },
```

**`src/components/legend/TrialChat.tsx:43`** — 동일 패턴.

베타 사용자가 어떤 문제를 입력하든 `area='자유 질문'` 으로 하드코딩되어 전송됨.

### 영향 (이게 가장 critical)

**우리가 자랑하는 차별화 무기가 베타 사용자에게 단 한 번도 노출되지 않았음**:

- ❌ Manager (Stage 1, Haiku) 가 문제 영역 자동 분류 X
- ❌ Legend 라우팅 (3-Stage Adaptive Router) 우회 → 5 거장 페르소나 시스템 미작동
- ❌ chain (Recursive Backward Reasoner) 우회 → "선생님은 이렇게 생각했어요" 카드 미노출
- ❌ R1 카드 (per_problem_reports) 미생성 → trigger_motivation, 정직성 vs 학습 코치, 학생 막힘 5 차원, "왜 정답인지" 명제 모두 미노출
- ❌ Trigger 자동 누적 (Δ23) 미동작 → 학습 데이터 자산화 X

→ 베타 사용자가 받은 가치 = **단순 LLM 채팅 응답** (ChatGPT 와 차별 없음).

## 4. 결함 후보 분류

| ID | 결함 | 우선순위 | 매핑 task |
|---|---|---|---|
| **D1** | BetaChat / TrialChat area 하드코딩 → Legend·chain·R1 모두 우회 | **P1 critical** | **신규 P0-01b (P0-02 보다 우선)** |
| D2 | chain_termination 미기록 — D1 이후 별도 검증 | P1 | P0-02 |
| D3 | R1 카드 진입 (SolutionSummaryButton) 가시성 — D1 이후 검증 | P2 | P0-03 |
| D4 | persona 응답 일관성 — D1 이후 검증 | P2 | P0-04 |
| D5 | 베타 신청서 practice_freq null (신청서 입력 누락) | P3 | 백로그 |
| D6 | candidate_triggers 자동 누적 검증 (1일 차라 정상일 수도) | P3 | 백로그 |

## 5. 권장 즉시 조치 — D1 fix (P0-01b 신설)

**P0-02 직전에 P0-01b 신규 task 생성** — area 하드코딩 제거.

### 옵션 비교

| 옵션 | 설명 | 장점 | 단점 |
|---|---|---|---|
| A | Manager(Haiku) 자동 분류 | 사용자 입력 불필요, 13차 Δ16 인프라 재사용 | Haiku 호출 1회 추가 |
| B | 사용자 area 선택 UI | 정확도 ↑ | UX 단계 추가 |
| C | 신청서 area default + 변경 가능 | 입력 마찰 ↓ | 신청서가 수1·수2 같은 세부 영역 미수집 |

**추천: A + C 하이브리드** — 신청서의 `area` 를 default 로 두되, Manager 가 problem_text 분석으로 정밀 분류 (자유 질문은 의도적 케이스에만 명시 선택).

## 6. 다음 액션 (Phase 0 plan 갱신 필요)

1. **P0-01b 신규 task 추가**: BetaChat / TrialChat area 하드코딩 제거 + Manager 자동 분류 통합 (예상 4시간)
2. P0-02 (chain miss 추적) — P0-01b fix 후 데이터 재수집해서 chain_termination 누적 검증
3. P0-03 (R1 KaTeX) — D1 fix 후 R1 카드가 실제로 생성될 것이므로 그 시점에 KaTeX 렌더 확인
4. P0-04 (persona 일관성) — D1 fix 후 5 거장 페르소나 호출 발생 시 검증

## 7. 정성 평가 — 베타 사용자 가치 점수

| 차별화 무기 | 베타 사용자에게 노출됐나? |
|---|---|
| 5 거장 페르소나 (라마누잔·가우스·폰 노이만·오일러·라이프니츠) | euler·gauss 페르소나 자체는 호출됨 (system prompt 적용 OK) |
| 3-Stage Adaptive Router | ❌ 우회 |
| Trigger 라이브러리 (정답 도달 핵심 코칭) | ❌ 우회 |
| Recursive Backward Reasoner (chain 시각화) | ❌ 우회 |
| R1 풀이 정리 카드 (trigger_motivation, 학생 막힘 5 차원) | ❌ 미생성 |
| 가드레일 9 카테고리 + 위기상담 | ✅ 작동 (위반 0) |

**점수: 2/6 차별화 무기만 작동.** D1 fix 만으로 6/6 으로 끌어올릴 수 있는 quick win.
