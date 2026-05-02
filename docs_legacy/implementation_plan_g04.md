# Phase G-04 — Killer 문제 정답률 85% 도전 (8차 세션)

> 작성: 2026-04-27 (사용자 승인 대기)
> 원칙: 1 Task = 1 Commit. 영향 격리: euler 모듈 외 무영향.
> KPI 목표: **수능 killer 문제 (21+29+30) 자동 채점 정답률 ≥ 85%** — 도달 시 상용화 가능 판단.

---

## 핵심 통찰 (사용자 정립, 7차 세션 후)

1. **수학적 접근 방식이 LLM 풀이에 도움이 되는가? → 같은 방식이 학생에게 전이 가능한가?** 가 본질 가설
2. **Tool 의 본질은 trigger 패턴(when)** — "평균값정리" 자체는 교과서 지식. "닫힌구간 연속+미분가능 → 평균변화율 일치" 같은 발동 조건이 진짜 학습 대상
3. **계산 도구·자기검증은 어려운 단계 한정** — 강제 호출은 효율성 자해
4. **풀이법 RAG 는 튜터 백엔드 보강용** — 학생 화면 노출 X
5. **trigger 입력 채널은 4중 구조** — 시드/Haiku batch/직접 입력/자체 학습 mining
6. **G-03 측정 결과**: chain ON 정답률 0pp — 원인 후보는 "역행만 하고 순행을 안 했기 때문"

## 학술 근거

- **Self-Ask** (Press 2023): 역행 분해 질문 multi-turn
- **Forward-Backward Reasoning**: alternating loop 가 단방향 BFS 보다 도달률 높음 (수학 증명 자동화 분야 일반 결과)
- **Retrieval-Augmented Generation** (Lewis 2020): 백엔드 RAG inject 로 정답률 향상
- **Active Learning**: 운영 로그 mining 으로 데이터 자동 증식

---

## 평가 방법론

### 평가셋
- **메인**: 수능 21번 + 29번 + 30번 (학년도 2017~2026, 가형/나형/공통/미적분/기하/확통) — `user_docs/suneung-math/parsed/all_problems.json` 추출. 약 100문항.
- **보조**: 수능 28번 (2017~2021 가형/나형 + 2022~2026 선택) — 별도 보관, 메인 측정 후 회귀.
- **정답 매핑**: `src/lib/data/math-problems.ts` 의 530건 정답 활용.

### 채점
- 객관식 (21번 위주): LLM 응답에서 1~5 추출 → 정답 매칭
- 주관식 (29~30번): 응답에서 정수 추출 → 정답 매칭. 추출 실패 시 LLM judge fallback (Haiku)

### 4-way A/B (단일 시드, 동일 프롬프트, 모델 = Sonnet 4.6)
| 모드 | Manager | Reasoner | similar_problems RAG |
|---|---|---|---|
| baseline | 기존 | 기존 단발 | OFF |
| chain_only | 기존 | alternating loop | OFF |
| chain_rag | 기존 | alternating loop | ON |
| full | **expected_triggers 강화** | alternating loop | ON |

### 성공 기준
- **full 모드 정답률 ≥ 85%** = 상용화 게이트 통과
- 중간 단계 (≥ 70%) 도달 시 부분 성공으로 기록 → 원인 분석 후 G-05 결정
- 실패 시 (< 70%) 원인 분석 의무 (depth/병목 layer/계산오류/RAG miss 분포)

---

## Task 분할 (9개)

### G04-1: 킬러 평가셋 추출 스크립트
- 파일: `scripts/extract-killer-eval.ts` (신규), `data/killer-eval.json` (신규), `data/killer-eval-extra.json` (신규, 보조 28번)
- 변경:
  - `user_docs/suneung-math/parsed/all_problems.json` 읽고 21/29/30 추출
  - `src/lib/data/math-problems.ts` 의 RAW_ANSWERS 와 join 으로 정답 매핑
  - schema: `{id, year, type, number, problem_latex, answer, is_multiple_choice, area_hint}`
- 의존: 없음
- 검증: `pnpm dlx tsx scripts/extract-killer-eval.ts` → killer-eval.json 100문항±, 정답 매핑 누락 0건
- 위험: LOW
- 예상 토큰: 5K
- KPI: 메인 ≥ 90문항 + 보조 ≥ 60문항

### G04-2: eval-kpi --killer 자동 채점 모드
- 파일: `scripts/eval-kpi.ts` (확장)
- 변경:
  - `--killer` 플래그 추가 → killer-eval.json 사용
  - 응답에서 객관식 1~5 / 주관식 정수 추출 정규식 + LLM judge fallback (Haiku)
  - 출력: `kpi-killer-{mode}.json` (mode: baseline / chain_only / chain_rag / full)
  - `--mode <baseline|chain_only|chain_rag|full>` 플래그 추가 (기본 baseline)
- 의존: G04-1
- 검증: `pnpm dlx tsx scripts/eval-kpi.ts --killer --mode baseline --limit 5` → 5문항 채점 결과 출력
- 위험: MEDIUM (정규식 추출 정확도)
- 예상 토큰: 6K
- KPI: 정답 추출 정확도 95%+ (LLM judge fallback 포함)

### G04-3: Manager `expected_triggers` 출력 강화
- 파일: `src/lib/ai/euler-manager-prompt.ts`, `src/app/api/euler-tutor/manager/route.ts`
- 변경:
  - ManagerResult 에 `goals: string[]`, `conditions: string[]`, `constraints: string[]`, `expected_triggers: {direction, condition_pattern, goal_pattern, why}[]` 추가 (모두 optional, 후방 호환)
  - 프롬프트에 math_process.md ② 구조화 절차 명시 (구해야 할 것 / 조건 / 제약 분리)
  - expected_triggers: 도구 이름 X, **trigger 본문 우선** 출력
- 의존: G04-2
- 검증: 수능 1문항 Manager 호출 → goals/conditions/constraints/expected_triggers 4 필드 모두 채워짐
- 위험: LOW
- 예상 토큰: 5K
- KPI: expected_triggers 평균 2~4건/문제

### G04-4: alternating loop reasoner
- 파일: `src/lib/euler/recursive-reasoner.ts` (확장), `src/lib/ai/euler-reasoner-prompt.ts` (확장)
- 변경:
  - 기존 `recursiveBackwardChain` 을 `alternatingChain` 으로 개조
  - 절차: 역행 1단계 → "주어진 조건으로 도달 가능?" 체크 → 안 되면 순행 1단계 (조건 조합으로 새 사실 도출 → 가상 조건 추가) → 다시 역행 2단계 → 반복 (max 5 depth)
  - `buildForwardDeducePrompt({conditions, knownFacts})` 신규 — 순행 1단계용
  - chain 종료 사유 enum 확장: `reached_conditions / max_depth / dead_end / cycle / forward_only_progress`
  - **계산 도구 호출은 기존 임계값(난이도 5+) 유지, 강제 X**
- 의존: G04-3
- 검증: 수능 30번 1문항 alternating chain 실행 → forward 단계 1회 이상 + backward 단계 1회 이상 + reached_conditions 종료
- 위험: HIGH (loop 발산·token 폭증)
- 예상 토큰: 12K
- KPI: chain 평균 depth 3.5+ (G-03 의 2.21 대비 향상), forward 단계 비중 30%+

### G04-5: similar_problems 인덱스 + Reasoner inject
- 파일:
  - `supabase/migrations/20260428_similar_problems.sql` (신규)
  - `scripts/build-similar-problems.ts` (신규) — Haiku 1차 분류로 trigger list 추출
  - `src/lib/euler/similar-problems.ts` (신규) — retrieve 함수
  - `src/lib/euler/orchestrator.ts` 또는 route.ts — Reasoner system prompt 에 inject
- 변경:
  - 마이그레이션: `similar_problems(id, year, type, number, problem_latex, problem_embedding vector(1536), answer, trigger_labels jsonb, source text default 'haiku_auto', verified boolean default false)`
  - `build-similar-problems.ts`: killer-eval.json 100문항 → Haiku 4.5 로 trigger 라벨 1~3개 추출 (5개 병렬, $0.30~$0.50 추정)
  - retrieve: 현재 문제 임베딩 → 상위 3 cosine → trigger_labels list 반환
  - inject: Reasoner system prompt 에 "유사 과거 수능 문항이 발동시킨 trigger: [...]" 추가. **풀이 본문은 미저장·미주입**
  - 학생 화면 노출 0% (orchestrator → student stream 에 포함 X)
- 의존: G04-4
- 검증: 수능 30번 retrieve → top-3 유사 문항의 trigger_labels 반환 + Reasoner system prompt 에 포함된 로그 확인
- 위험: MEDIUM (Haiku 라벨 정확도 70~80%, 추후 G04-8 으로 정밀화)
- 예상 토큰: 14K (코드 + Haiku 호출)
- KPI: 라벨 적재 100문항, retrieve P95 < 200ms

### G04-6: 4-way A/B 측정 실행
- 파일: 없음 (스크립트 실행)
- 변경: 없음 (G04-2 의 --mode 플래그 사용)
- 의존: G04-5
- 검증: `pnpm dlx tsx scripts/eval-kpi.ts --killer --mode {baseline,chain_only,chain_rag,full}` 4회 실행 → kpi-killer-*.json 4 파일
- 위험: MEDIUM (LLM 호출 비용 ≈ $5~$10, 시간 30분~1시간)
- 예상 토큰: 0 (구현 X, 실행 비용만)
- KPI: 4 모드 정답률 측정치 확보

### G04-7: 결과 분석 + 학생 코칭 전이 평가 보고서
- 파일: `docs/qa/kpi-killer-ab-report.md` (신규)
- 변경:
  - 4 모드 정답률 비교 표 (전체 / 21번 / 29번 / 30번 / 학년도별)
  - chain miss 패턴 분포 (alternating loop 도입 후 변화)
  - 모드별 평균 chain depth, forward/backward 단계 분포
  - **success ≥ 85%** 도달 여부 → 상용화 결정 / 부분 성공 (≥ 70%) → G-05 후보 / 실패 (< 70%) → 원인 분석
  - "학생 코칭 전이 가능성" 절: 정답률 향상 시 chain visualization 카드를 trigger 본문 우선으로 재디자인할지 결정 자료
- 의존: G04-6
- 검증: 보고서 작성 + 핵심 결론 1문장
- 위험: LOW
- 예상 토큰: 6K
- KPI: 다음 세션 의사결정 자료 완비

### G04-8: trigger 직접 입력 UI + contributor 권한
- 파일:
  - `supabase/migrations/20260429_contributor_role.sql` (신규)
  - `src/app/api/admin/math-tools/[id]/triggers/route.ts` (신규 POST)
  - `src/app/admin/math-tools/[toolId]/triggers/new/page.tsx` (신규)
  - `src/app/admin/contributors/page.tsx` (신규) — admin 토글 UI
  - `src/app/api/admin/contributors/route.ts` (신규)
  - `src/app/api/admin/math-tools/route.ts` (권한 가드 확장)
- 변경:
  - 마이그레이션: `profiles.can_contribute_triggers boolean default false` + `math_tool_triggers.source text default 'developer'` (값: developer / 정석 / 해법서 / haiku_auto / beta_contributor / auto_mined)
  - 권한 가드: `ADMIN_EMAILS` (하드코드 fallback) OR `profiles.can_contribute_triggers = true`
  - trigger 추가 폼: direction / condition_pattern / goal_pattern / why / source / 비고 + 안내문 ("책 표현 그대로 옮기지 말고 자신의 말로 재구성")
  - contributor 토글 UI: admin 만 접근. 베타 사용자 list + can_contribute_triggers 토글
  - 출처 표시: `/admin/math-tools` 검수 큐에 source 컬럼 추가
- 의존: 없음 (G04-1~7 와 병렬 가능)
- 검증: admin 으로 trigger 1건 추가 → DB row 확인. 베타 사용자에게 권한 부여 후 그 계정으로 trigger 추가 → 성공
- 위험: MEDIUM (RLS 정책 + 가드 누락 위험)
- 예상 토큰: 8K
- KPI: 4 채널 중 (3) 직접 입력 채널 가동

### G04-9: 자체 학습 trigger mining + cron + 검수 큐
- 파일:
  - `supabase/migrations/20260430_candidate_triggers.sql` (신규)
  - `src/lib/euler/trigger-miner.ts` (신규)
  - `src/app/api/cron/mine-triggers/route.ts` (신규)
  - `vercel.json` (cron 추가, 매일 03:00 KST)
  - `src/app/admin/math-tools/page.tsx` (확장 — candidate_triggers 탭 추가)
  - `src/app/api/admin/candidate-triggers/[id]/approve/route.ts` (신규)
  - `src/app/api/admin/candidate-triggers/[id]/reject/route.ts` (신규)
- 변경:
  - 마이그레이션: `candidate_triggers(id, tool_id, direction, condition_pattern, goal_pattern, why, embedding vector(1536), source_log_ids uuid[], occurrence_count int default 1, similarity_to_existing real, status text default 'mining', created_at, updated_at)` + RLS
  - trigger-miner: euler_solve_logs 의 step_summary + used_tools 스캔 → Haiku 4.5 로 trigger 패턴 추출 → 기존 math_tool_triggers 임베딩 cosine. ≥0.85 면 기존 trigger occurrence_count++ (별도 테이블 또는 collapsed). <0.85 면 candidate_triggers 신규 적재 (또는 기존 candidate occurrence_count++)
  - 승격 기준: occurrence_count ≥ 5 → status='pending_review'
  - 검수 UI: candidate_triggers 탭 — 승인 시 source='auto_mined' 로 math_tool_triggers insert + 임베딩 자동
  - cron: 매일 1회 (vercel.json `0 18 * * *` UTC = 03:00 KST)
- 의존: G04-8 (권한 시스템 활용)
- 검증: 수동 cron trigger (`curl -H 'Authorization: Bearer $CRON_SECRET' /api/cron/mine-triggers`) → candidate_triggers 적재 확인
- 위험: MEDIUM (Haiku 호출 비용 일일 누적, 임베딩 cosine threshold 튜닝)
- 예상 토큰: 10K
- KPI: 4 채널 중 (4) 자동 mining 채널 가동, 1주일 운영 후 candidate ≥ 10건 발굴

---

## 의존성 그래프

```
G04-1 → G04-2 → G04-3 → G04-4 → G04-5 → G04-6 → G04-7
                                          ↑
                              (G04-7 분석 자료에 G04-9 의 mining 결과 부재 — 별도 보고)
G04-8 (병렬, 독립)
G04-9 → 의존: G04-8 (권한 시스템 재사용)
```

권장 진행 순서:
1. G04-1 → G04-2 (평가 인프라 — 다른 task 측정에 필수)
2. G04-3 → G04-4 → G04-5 (핵심 가설 구현)
3. G04-6 → G04-7 (측정 + 보고)
4. G04-8 → G04-9 (운영 자가 강화 — 측정 결과와 무관하게 가치 있음)

병렬 옵션: G04-8 은 G04-1~7 과 별도 commit 으로 사이사이 진행 가능.

---

## Token 예산

| Task | 예상 토큰 |
|---|---|
| G04-1 | 5K |
| G04-2 | 6K |
| G04-3 | 5K |
| G04-4 | 12K |
| G04-5 | 14K |
| G04-6 | 0 (실행만) |
| G04-7 | 6K |
| G04-8 | 8K |
| G04-9 | 10K |
| **합계 (구현)** | **66K** |
| LLM 호출 비용 (G04-5 + G04-6) | ≈ $5~$15 |

---

## 리스크

| 리스크 | 영향 | 대응 |
|---|---|---|
| alternating loop token 폭증 | full 모드 응답 지연 ↑ | maxDepth=5 hard cap, forward step 토큰 제한 |
| Haiku 라벨 정확도 부족 | similar_problems RAG 효과 ↓ | G04-8 직접 입력 + G04-9 mining 으로 점진 정밀화 |
| killer 정답률 < 70% | 상용화 게이트 미달 | G04-7 원인 분석 후 G-05 (예: 한→영 번역 카드, 풀이 검증 multi-pass) 검토 |
| trigger 직접 입력 권한 남용 | RAG 품질 저하 | admin 토글 + source 추적 + 사후 검수 큐 |
| cron 의 Haiku 비용 누적 | 운영비 ↑ | 일일 batch 크기 제한 (max 50 logs/일), 임계값 튜닝 |

---

## 산출물 목록

| 파일 | 종류 |
|---|---|
| `data/killer-eval.json` | 평가셋 (메인) |
| `data/killer-eval-extra.json` | 평가셋 (보조 28번) |
| `scripts/extract-killer-eval.ts` | 추출 스크립트 |
| `scripts/eval-kpi.ts` | --killer / --mode 모드 추가 |
| `scripts/build-similar-problems.ts` | RAG 인덱스 구축 |
| `src/lib/ai/euler-manager-prompt.ts` | expected_triggers 강화 |
| `src/lib/euler/recursive-reasoner.ts` | alternating loop |
| `src/lib/ai/euler-reasoner-prompt.ts` | forward deduce prompt 추가 |
| `src/lib/euler/similar-problems.ts` | retrieve 함수 |
| `src/lib/euler/trigger-miner.ts` | 자체 학습 모듈 |
| `supabase/migrations/20260428_similar_problems.sql` | DB |
| `supabase/migrations/20260429_contributor_role.sql` | DB |
| `supabase/migrations/20260430_candidate_triggers.sql` | DB |
| `src/app/api/cron/mine-triggers/route.ts` | cron |
| `src/app/api/admin/math-tools/[id]/triggers/route.ts` | trigger 단독 추가 API |
| `src/app/admin/math-tools/[toolId]/triggers/new/page.tsx` | trigger 입력 폼 |
| `src/app/admin/contributors/page.tsx` | contributor 토글 |
| `src/app/api/admin/contributors/route.ts` | 권한 토글 API |
| `src/app/api/admin/candidate-triggers/[id]/{approve,reject}/route.ts` | 검수 |
| `vercel.json` | cron 등록 |
| `docs/qa/kpi-killer-ab-report.md` | 측정 보고 |

---

## 승인 후 진행 순서

1. 본 plan 승인 → `docs/task.md` 진행 상태 표에 "Phase G-04 (8차 세션) 🔄 0/9" 행 추가
2. `docs/project-decisions.md` 에 G-04 결정 사항 7가지 명문화
3. G04-1 부터 commit 단위 진행. 각 task 완료 시 task.md / progress.md 즉시 갱신
4. G04-7 보고서 완료 → 사용자 결정 (상용화 / G-05 진입 / 원인 분석 보강)

---

## 본 plan 의 핵심 한 문장

> **"수학적 alternating 사고법(역행↔순행)이 LLM 풀이 정답률을 끌어올린다면, 같은 사고법을 trigger 패턴으로 학생에게 가르칠 수 있다 — 이를 killer 정답률 85% 게이트로 검증한다."**
