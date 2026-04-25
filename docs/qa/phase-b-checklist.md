# Phase B — 회귀 + KPI 측정 체크리스트

> 작성: 2026-04-26 (B-16)
> 목적: Phase B 산출물(B-01 ~ B-15)의 통합 동작 + KPI 측정 가이드
> 합격 기준:
>   1) Retriever hit rate 70%+
>   2) 코칭 응답에 "왜" 포함 비율 90%+
>   3) 회귀 0건

---

## 0. 사전 준비

- [ ] 마이그레이션 5종 적용 완료
  - `20260426_math_tools.sql`
  - `20260427_math_tool_triggers.sql`
  - `20260428_candidate_tools.sql`
  - `20260429_match_math_tool_triggers.sql`
  - `20260430_candidate_review_rpc.sql`
- [ ] 시드 적재 완료: `pnpm dlx tsx scripts/seed-math-tools.ts --dry-run` 후 실제 적재
  - 32개 도구 + ~50 trigger 적재 확인
- [ ] env: `OPENAI_API_KEY`, `EULER_MANAGER_ENABLED=true` (기본 on), `EULER_TOOL_REPORT_THRESHOLD=3`
- [ ] `pnpm build` 성공
- [ ] `npx tsc --noEmit` 0 errors

---

## 1. 시드 + 임베딩 검증

- [ ] math_tools 32개 row 확인
- [ ] math_tool_triggers ≥ 50 row 확인
- [ ] embedding_forward / embedding_backward 모두 NOT NULL
- [ ] ivfflat 인덱스 활성: `select * from pg_indexes where tablename = 'math_tool_triggers'`
- [ ] 저작권 체크 — corpus 없으면 skip 메시지 정상

---

## 2. Manager API

- [ ] curl `/api/euler-tutor/manager` `{problem: "..."}` → 200 + JSON
- [ ] variables / conditions / goal 추출 정확도 (수능 5문항 수동 검수)
- [ ] difficulty 1~6 sanity (수능 1번=1, 30번=6 ±1)
- [ ] 인증 401 정상 (세션 쿠키 없을 때)

---

## 3. Retriever API

- [ ] curl `/api/euler-tutor/tools/search` `{conditions, goal}` → top-5 도구
- [ ] forward 전용 (goal 없음) / backward 전용 (conditions 없음) 모두 동작
- [ ] tool_weight 가중 정렬 — score = similarity × tool_weight 검증
- [ ] **hit rate 70% 측정** (수능 28번류 5문항):

| 문제 | 기대 도구 | 검색 결과 top-5 에 포함? | 점수 |
|---|---|---|---|
| 2026 미적분 28 | (해당 도구) | [ ] | |
| 2025 미적분 28 | | [ ] | |
| 2024 미적분 28 | | [ ] | |
| 2023 미적분 28 | | [ ] | |
| 2022 미적분 28 | | [ ] | |
| **hit rate** | | | __/5 |

---

## 4. Tool Reporter

- [ ] `/api/euler-tutor/tools/report` `{tools: [...]}` → 200 results[]
- [ ] 첫 호출: `created`, occurrence_count=1
- [ ] 동일 이름 재보고: `incremented`, occurrence_count++
- [ ] 임계값(3) 도달 시 콘솔 로그 + threshold_reached=true
- [ ] math_tools 에 이미 있는 이름: `skipped_known`

---

## 5. 검수 큐 어드민

- [ ] `/admin/math-tools` 진입 — admin 가드 동작
- [ ] pending 후보 occurrence_count desc 정렬
- [ ] 승인 시 math_tools 에 row 추가 + candidate status='merged'
- [ ] 거절 시 status='rejected'
- [ ] tool_id 자동 제안 (proposed_name → SCREAMING_SNAKE) 정상
- [ ] LaTeX / layer 인라인 편집 후 승인

---

## 6. orchestrator 통합 (B-12)

- [ ] 첫 user 메시지에서만 Manager 호출 (assistant 0개일 때)
- [ ] 후속 코칭 턴에서는 Manager/Retriever 스킵 (console.log 로 N 확인)
- [ ] EULER_MANAGER_ENABLED=false 로 설정 시 기존 동작 100% 회귀
- [ ] Manager 실패해도 메인 streamText 정상 (graceful degradation)

---

## 7. Coaching 응답 — "왜" 포함 비율 90%+

수능 미적분 28번 5문항 + 모의고사 5문항 = 10문항 측정.
응답 텍스트에 "왜냐하면|because|이유는|왜 이|때문에" 포함 확인.

| 문제 | 응답 발화 첫 200자 | "왜" 포함 |
|---|---|---|
| 2026 미적분 28 | | [ ] |
| 2025 미적분 28 | | [ ] |
| 2024 미적분 28 | | [ ] |
| 2023 미적분 28 | | [ ] |
| 2022 미적분 28 | | [ ] |
| 모의 1 | | [ ] |
| 모의 2 | | [ ] |
| 모의 3 | | [ ] |
| 모의 4 | | [ ] |
| 모의 5 | | [ ] |
| **포함율** | | __/10 |

**합격 기준**: 9/10 이상 (90%+)

---

## 8. ThoughtStream 도구 카드 (B-14)

- [ ] retrievedTools props 전달 시 카드 strip 노출
- [ ] L레이어 배지 + tool_name + line-clamp-2 why 표시
- [ ] 가로 스크롤 (모바일 6개 이상 시) 동작
- [ ] retrievedTools 비어있으면 카드 미표시

---

## 9. usage_events 분석 (B-15)

- [ ] /admin/analytics 에 'euler' feature 새 이벤트 노출
  - manager_classified
  - tool_retrieved
  - candidate_reported
- [ ] 이벤트 metadata에 area/difficulty/n_tools 등 정상 기록

---

## 10. 빌드·타입체크

- [ ] `npx tsc --noEmit` 0 errors (`EXIT=0`)
- [ ] `pnpm build` 성공
- [ ] 신규 마이그레이션 5종 + 신규 코드 파일 외 변경 없음

---

## 11. 미달 시 조치

- **hit rate < 70%**: 시드에 trigger 추가 (특히 자주 빠지는 도구), trigger_condition 텍스트 풍성화
- **"왜" 포함 < 90%**: euler-prompt.ts 의 "왜 이 도구를 쓰는가" 강조 강화 + few-shot 예시 추가
- **응답 P95 > 12초**: Manager + Retriever 호출을 병렬화 (현재 순차) 또는 캐싱 도입

---

## 합격 선언

- [ ] 위 항목 95% 이상 통과
- [ ] hit rate 70%+ 도달
- [ ] "왜" 포함 90%+ 도달
- [ ] Phase C 진입 승인
