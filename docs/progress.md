# Workflow Progress — Euler Tutor 2.0

## Last Checkpoint
- Time: 2026-04-26 (세션 종료 시점)
- Phase: **Phase A — MVP 구현 진입 직전**
- Step: Approval Gate 2 통과 → Phase A Task A-01 미시작 (사용자 요청으로 세션 종료)
- Session: 1차 세션

## Completed
- [x] Phase 1: Research — `docs/research_raw.md`
- [x] Phase 1: 사용자 자료 통합 — `user_docs/math_solver.md`, `user_docs/LLM_math_solver.md`, `user_docs/math_layers.md`
- [x] Phase 2: Integration — `docs/integrator_report.md` (승인 완료)
- [x] Phase 2: Planning — `docs/architecture.md`, `docs/task.md`, `docs/implementation_plan_euler.md` (승인 완료, 정정 반영 완료)
- [x] Phase 2: 결정 사항 명문화 — `docs/project-decisions.md`
- [x] **Approval Gate 1**: 통합 보고서 승인 완료
- [x] **Approval Gate 2**: task.md 승인 완료 (정정 4회 반영 후)
- [x] (별도) `perf(conversation): 회화 API 프롬프트 캐싱 + 히스토리 20턴 제한` — 커밋 `0999a54`, 푸시 완료

## In Progress
- [ ] **Phase 3: Implementation — Phase A 구현 (15개 Task)** ← 다음 세션 시작 지점
  - 다음 즉시 작업: **A-01 (docs/project-decisions.md는 이미 작성됨, .env.example만 키 추가하면 됨)**

## Pending
- [ ] Phase A 나머지 14개 task (A-02 ~ A-15)
- [ ] Phase B 16개 task
- [ ] Phase C 13개 task
- [ ] Phase D 10개 task
- [ ] 법무 4개 task (백그라운드)

## Pending Decisions (다음 세션 시작 시 검토)
- 음성 입력 도입 시점 (Phase A~D 후 결정)
- Tier 3 외부 데이터셋 임포트 (사용자 1,000+ 후)
- 학원 사전 인터뷰 — Phase A 진행 중 1곳 시도
- Multi-tenant 학원 namespace (Phase D+)

## Next Action (새 세션에서)
1. `/resume-project` 실행 → 본 progress.md를 읽고 컨텍스트 복원
2. 사용자에게 "Phase A 구현 시작 진입 직전 상태입니다. A-01부터 진행할까요?" 확인
3. 승인 시 A-01부터 순차 구현 시작
   - A-01: `.env.example` 키 추가 (`ANTHROPIC_HAIKU_MODEL_ID`, `EULER_CRITIC_ENABLED`)
   - A-02: `src/lib/euler/`, `src/components/euler/` 디렉터리 + 빈 stub
   - A-03: Critic Agent 프롬프트 (Haiku 4.5, JSON 출력, stuck 분류 골격 7종)
   - 이후 의존성 순서대로 A-15까지

## 핵심 참고 파일 (다음 세션 시작 시 반드시 정독)
- `docs/project-decisions.md` — 모든 확정 결정 (이번 세션의 핵심 산출물)
- `docs/task.md` — 58개 task 분할 (Phase A=15, B=16, C=13, D=10, 법무=4)
- `docs/architecture.md` — DB 스키마, API 명세, 모델 분담
- `docs/implementation_plan_euler.md` — Week별 일정 + 위험 + 테스트 전략
- `docs/integrator_report.md` — 통합 보고서 v1
- `user_docs/math_layers.md` — 사용자 8-Layer 통찰 (L6 dict + recall vs trigger)
- `user_docs/math_solver.md`, `user_docs/LLM_math_solver.md` — 1차 리서치

## 새 세션 시작 시 토큰 효율 가이드
- `docs/project-decisions.md` + `docs/progress.md`만 먼저 읽기 (약 5K 토큰)
- task.md는 A-01 ~ A-06 부분만 읽기 (전체 27KB 모두 읽지 말 것)
- architecture.md는 Phase A 관련 §3.1~§3.3, §4, §6.2(필기 시나리오)만
- 사용자 자료(`user_docs/math_*.md`)는 이미 결정에 흡수됨. 재확인 불필요. 단, 의문 발생 시 참조.
