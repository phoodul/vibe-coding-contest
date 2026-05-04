> 작성일 2026-05-05 / 17차 세션 / 베이스: `docs/curriculum-matrix.md` + `docs/curriculum-content-spec.md`
> Phase 0 의 implementation_plan_phase0.md 와 병렬 진행 (헤밍웨이 v2 / Legend GTM 과 동시)

# Phase 1 — 자체 제작 콘텐츠 PoC (첫 1 과목)

## 0. 목적

소크라테스 튜터 콘텐츠를 50+ 교과로 확장하기 위한 **첫 검증 사이클**. 한 과목을 자체 제작
해 quality·시험 대비 효과·콘텐츠 작성 비용을 측정하고, 양산 가능한 워크플로우를 확정한다.

성공 기준:
1. 첫 과목 chapter 전체 완성 + 마인드맵 + 소크라테스 튜터 정상 작동.
2. 학생 베타 1~2명이 실제 시험 대비에 사용 후 만족도 ≥ 7/10.
3. 두 번째 과목을 같은 워크플로우로 50% 시간 절감하며 추가 가능.

기간: **약 2주** (Phase 0 의 헤밍웨이 v2 / GTM 과 병렬 — 동일 14일 일정 안에 끼워서).

## 1. 의존성 / 사전 결정 사항 (사용자 액션, 1일차 안에)

| ID | 결정 | 옵션 | 영향 |
|---|---|---|---|
| **D-1** | 첫 자체 제작 과목 | `curriculum-matrix.md` §"Phase 1 우선순위" 3 후보 (수능 영향·기존 보강·수능 직접) 중 1 | 모든 후속 task의 입력 |
| **D-2** | MDX vs TS | (a) 신규 통일 MDX (b) 깊이로 자유 선택 | 콘텐츠 작성 도구·진도 DB 형태 |
| **D-3** | chapter 분량 | 800~1500자 vs 1500~3000자 vs 시험 대비 무제한 | 양산 속도·quality |
| **D-4** | 첫 과목 chapter 수 목표 | 전체 (5~14) vs PoC 분량 (3) | 2주 일정 fit |
| **D-5** | 진도 DB 도입 시점 | 첫 과목 작성과 동시 vs 콘텐츠 완성 후 | 마이그레이션 일정 |

**기본값 추정** (사용자가 결정 안 하고 진행 시):
- D-1: 통합사회 (B-1) — 모든 고1 필수, 가장 넓은 영향
- D-2: 깊이 1~2 단순 = MDX, 3+ 깊이 = TS (자유 선택)
- D-3: 1500~2500자 (시험 대비 강화)
- D-4: PoC 분량 = 첫 3 chapter, 검증 후 잔여 양산
- D-5: 첫 chapter 작성과 동시 진행 (병렬 task)

## 2. Task 분해 (총 P1-01 ~ P1-12)

### 카테고리 A — 인프라 (사용자 결정 무관, 즉시 진행 가능)

| ID | Task | 산출물 | 의존 | 분량 |
|---|---|---|---|---|
| **P1-01** | `textbook_progress` 마이그레이션 | `supabase/migrations/<date>_textbook_progress.sql` + RLS 3 정책 | — | 0.5d |
| **P1-02** | SubjectKey 확장 헬퍼 | `src/lib/curriculum/register.ts` — SubjectKey 정의·SUBJECT_DATA·mind-map SUBJECTS·tutor-prompt SUBJECTS 4곳 동기화 보장 | — | 0.5d |
| **P1-03** | 진도 추적 API | `/api/textbook-progress` GET/PUT — chapter 단위 mastery_score upsert | P1-01 | 0.5d |
| **P1-04** | 진도 표시 UI 컴포넌트 | `src/components/curriculum/ProgressBar.tsx` — chapter별 진도 바 + 완료 체크 | P1-03 | 0.5d |

### 카테고리 B — 콘텐츠 (D-1 결정 후)

| ID | Task | 산출물 | 의존 | 분량 |
|---|---|---|---|---|
| **P1-05** | 첫 과목 목차 | `docs/curriculum-<subject>.md` — 단원·중단원 트리 (헤밍웨이 패턴) | D-1 | 1d |
| **P1-06** | `<subject>-index.ts` + 첫 chapter | TextbookChapter[] (sections=[]) + ch1 의 sections | P1-05 | 1d |
| **P1-07** | 첫 chapter Quality 검토 | 사용자 검토 — 톤·분량·시험 대비 적절성 | P1-06 | 사용자 |
| **P1-08** | 잔여 chapter 양산 | ch2~ch{N} 자율 작성 (P1-07 OK 신호 후) | P1-07 | 5~10d |
| **P1-09** | structured 트리 | `structured/<subject>-structured-ch{N}.ts` 마인드맵용 | P1-08 | 2d |

### 카테고리 C — 통합·검증

| ID | Task | 산출물 | 의존 | 분량 |
|---|---|---|---|---|
| **P1-10** | SubjectKey 등록 + 진입점 통합 | build-tree.ts + mind-map/page.tsx + tutor-prompt.ts 3 파일 갱신 (P1-02 헬퍼 사용) | P1-08 | 0.5d |
| **P1-11** | 마인드맵 + 튜터 회귀 테스트 | 새 SubjectKey 칩 클릭 → 트리 렌더 + 소크라테스 튜터 chapter 강의 stream | P1-10 | 0.5d |
| **P1-12** | 학생 베타 1~2명 사용 후기 | 실제 시험 대비 사용 + 만족도 설문 | P1-11 | 1주 |

## 3. 14일 일정표 (Phase 0 와 병렬)

```
day 1   D-1~5 결정 + P1-01·P1-02 시작
day 2   P1-01·P1-02 완료 + P1-05 (목차) 시작
day 3   P1-05 완료 → P1-06 (ch1) 시작
day 4   P1-06 완료 → P1-07 사용자 검토 요청
day 5   P1-07 OK → P1-08 chapter 양산 시작 (병렬: P1-03 진도 API)
day 6~9 P1-08 양산 (chapter 1~N) + P1-04 진도 UI
day 10  P1-09 structured 시작
day 11  P1-09 완료 + P1-10 통합
day 12  P1-11 회귀 + 검증
day 13  P1-12 베타 사용자 모집 (P0-15 와 합동)
day 14  베타 후기 1차 + 회고
```

P1-08 의 양산 분량은 D-4 (chapter 수) 에 따라 가변. **PoC = 3 chapter 우선 완성 후 잔여 추후 양산** 권장.

## 4. 회귀 KPI

- 첫 과목 chapter Quality 검토 합격률 ≥ 80% (재작성 비율)
- 마인드맵 새 과목 트리 렌더 시 1초 이내 완료
- 소크라테스 튜터 새 SubjectKey 강의 stream first token ≤ 2초
- `textbook_progress.mastery_score` 평균 0.6 이상 (베타 학생 1주 후)

## 5. Phase 0 와의 결합점

| Phase 0 task | Phase 1 task | 결합 |
|---|---|---|
| P0-14~16 베타 1→5명 | P1-12 학생 베타 후기 | 같은 베타 사용자 풀 활용 |
| P0-13c 시연 영상 (수능 킬러) | (선택) Phase 1 첫 과목 시연 추가 | 양 영상 1편씩 |
| 헤밍웨이 v2 Step 4 (74 레슨) | 콘텐츠 작성 워크플로우 공유 | MDX 패턴 재사용 |

## 6. Phase 1 종료 기준

- [ ] 첫 과목 chapter 전체 완성 + Quality 검토 합격
- [ ] 마인드맵 + 소크라테스 튜터 + 진도 추적 동작
- [ ] 베타 학생 1~2명 실제 시험 대비 사용 + 만족도 ≥ 7/10
- [ ] curriculum-content-spec.md 의 워크플로우 4 cycle 검증 (3~4 chapter 분량으로 cycle time 측정)

## 7. Phase 2+ 으로 이월

- 두 번째·세 번째 과목 양산 (워크플로우 검증된 후 50% 시간 절감)
- 출판사 협상 PoC (자체 제작 quality 가 검증된 후만 GTM)
- 마인드맵 + 튜터 + 헤밍웨이 + Legend 의 통합 학습 경로 (multi-subject)
