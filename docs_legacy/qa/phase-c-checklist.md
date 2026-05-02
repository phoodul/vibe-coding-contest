# Phase C — 회귀 + KPI 측정 체크리스트

> 작성: 2026-04-26 (C-13)
> 목적: Phase C 산출물(C-01 ~ C-12)의 통합 동작 + KPI 측정
> 합격 기준:
>   1) 미적분 28~30번 정답률 70%+
>   2) 7종 진단 카테고리 4종 이상 활성 (베타 사용자 데이터)
>   3) 회귀 0건

---

## 0. 사전 준비

- [ ] 마이그레이션 4종 적용
  - `20260501_euler_solve_logs.sql`
  - `20260502_user_skill_stats.sql`
  - `20260503_user_layer_stats.sql`
- [ ] env: `EULER_REASONER_ENABLED=true`, `EULER_REASONER_MIN_DIFFICULTY=6`, `EULER_FREE_DAILY_LIMIT=10`
- [ ] `pnpm build` 성공 (✓)
- [ ] `npx tsc --noEmit` 0 errors (✓)

---

## 1. Reasoner BFS

- [ ] forward 1단계 호출 → facts list 평균 3~5개 도출
- [ ] backward 1단계 → subgoals list 평균 2~4개
- [ ] dead_end 시 빈 list 반환 → orchestrator 가 graceful 진행
- [ ] forward + backward 병렬 (Promise.allSettled) → 둘 중 하나 실패해도 다른 결과 활용
- [ ] used_tools 추출 정확

---

## 2. orchestrator 통합 (C-04)

- [ ] difficulty 1~5 → Reasoner 미호출 (기존 흐름)
- [ ] difficulty 6+ → Reasoner 호출 + facts/subgoals 가 system 에 주입
- [ ] EULER_REASONER_ENABLED=false → 100% 회귀 (Reasoner 스킵)
- [ ] 응답 P95 < 20초 (난이도 6 기준)
- [ ] 실패 시 try/catch 로 메인 streamText 정상

---

## 3. tool-reporter 자동 호출 (C-05)

- [ ] Reasoner 가 사용한 도구 → candidate_tools 에 자동 적재
- [ ] 동일 도구 임계값(3) 도달 시 어드민 화면에 노출
- [ ] math_tools 에 이미 있는 도구는 skip (skipped_known)
- [ ] 실패해도 메인 흐름 무영향

---

## 4. solve-logger (C-06)

- [ ] 첫 user turn 직후 euler_solve_logs row 생성
- [ ] problem_text / problem_key / area / input_mode / tutor_persona 정상
- [ ] step_summary 는 Phase C 기본 미채움 (C-07/diagnose 활성화 시 채워짐)
- [ ] is_correct 는 향후 학생 답 입력 endpoint 에서 update

---

## 5. Critic 진단 모드 (C-07)

- [ ] POST /api/euler-tutor/diagnose `{problem, studentSteps[]}` → stuck_reason
- [ ] conditions/goal 함께 보내면 retrieved_tools 자동 부착
- [ ] 4종 합성 케이스 분류 정확도 80%+ (수동):

| 케이스 | 기대 stuck_reason | 결과 |
|---|---|---|
| 도함수 영점은 구했으나 다음 단계 도구 모름 | tool_recall_miss | [ ] |
| 사잇값 정리 알지만 어떻게 적용할지 모름 | tool_trigger_miss | [ ] |
| 미적분 영역 자체 인식 실패 | domain_id_miss | [ ] |
| 산술 오류 | computation_error | [ ] |

---

## 6. user_skill_stats / user_layer_stats (C-08)

- [ ] updateSkillStats 호출 후 attempts++ 정확
- [ ] updateLayerStats 호출 후 layer 별 stuck_count/failure_count 누적
- [ ] L6 stuck + miss_subtype="recall" → l6_recall_miss++
- [ ] L6 stuck + miss_subtype="trigger" → l6_trigger_miss++
- [ ] L5 + type="domain_id" + stuck → l5_domain_miss++
- [ ] FK 위반 시 안전 스킵 (math_tools 미등록 도구)

---

## 7. weakness 리포트 (C-09)

- [ ] GET /api/euler-tutor/report/weakness?window=30
  - 7종 진단 카테고리 모두 반환
  - level 분류 (low/medium/high) 적정성
  - share / weight 계산 정확
- [ ] Sonnet 추천 멘트 1~2문단 자연어 생성 (LaTeX 없음)
- [ ] 데이터 0개 시 recommendation_text 가 null 또는 비어있음

---

## 8. progress 대시보드 (C-10)

- [ ] GET /api/euler-tutor/report/progress?days=30
- [ ] daily attempts/correct 정렬 정확
- [ ] area_distribution / top_tools / distinct_tools_used
- [ ] layer_series pass_rate 산출
- [ ] P95 < 1초 (LLM 호출 없음)

---

## 9. /euler/report 페이지 (C-11)

- [ ] 미로그인 → 로그인 안내
- [ ] WeaknessChart: 7종 막대 + level 색
- [ ] L6_recall ⇄ L6_trigger 라벨·색 분리
- [ ] DailyChart: 일자별 attempts 높이 + 정답률 농도
- [ ] LayerStuckChart: L1~L8 통과율 그라데이션
- [ ] 모바일 반응형 (3컬럼 → 1컬럼)
- [ ] 학생이 5초 안에 "어디서 막히는지" 파악 (UX 검증)

---

## 10. Free 일일 한도 (C-12)

- [ ] EULER_FREE_DAILY_LIMIT=10 설정 시 11번째 시도 → 429
- [ ] 한도 초과 응답 메시지 사용자 친화적
- [ ] KST 자정 기준 카운트 리셋
- [ ] 후속 코칭 턴은 한도 무관 (assistant 메시지 1개 이상)
- [ ] **답 공개 자체는 카운트 안 됨** (project-decisions)

---

## 11. KPI — 미적분 28~30번 정답률 70%+

| 학년도 | 28 | 29 | 30 | 정답 | 28 | 29 | 30 | 정답 |
|---|---|---|---|---|---|---|---|---|
| 2026 | [ ] | [ ] | [ ] | __/3 | | | | |
| 2025 | [ ] | [ ] | [ ] | __/3 | | | | |
| 2024 | [ ] | [ ] | [ ] | __/3 | | | | |
| 2023 | [ ] | [ ] | [ ] | __/3 | | | | |
| 2022 | [ ] | [ ] | [ ] | __/3 | | | | |
| 2021 | [ ] | [ ] | [ ] | __/3 | | | | |
| 2020 | [ ] | [ ] | [ ] | __/3 | | | | |
| 2019 | [ ] | [ ] | [ ] | __/3 | | | | |
| 2018 | [ ] | [ ] | [ ] | __/3 | | | | |
| 2017 | [ ] | [ ] | [ ] | __/3 | | | | |

**합격**: 21/30 (70%) 이상

---

## 12. 빌드·타입체크

- [x] `npx tsc --noEmit` 0 errors
- [x] `pnpm build` 성공

---

## 13. 학원 사전 인터뷰 — Phase C 진행 중 1곳

- [ ] 인터뷰 1곳 진행 — 결과 docs/sales/academy-pitch.md 보강
- [ ] 학원 1곳 시범 도입 동의 (Phase D 출시 시 academy 학생당 5,000~8,000원)

---

## 합격 선언

- [ ] 위 항목 95% 이상 통과
- [ ] 28~30번 정답률 70%+ 도달
- [ ] 진단 분류 4종 이상 활성
- [ ] Phase D 진입 승인
