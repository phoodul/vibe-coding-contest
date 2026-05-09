# Project Decisions — easyedu.ai

> 본 파일은 확정된 핵심 결정만 기록합니다. 진행 상태는 `docs/progress.md`,
> 태스크 상태는 `docs/task.md` 를 참조하세요.

## 22차 세션 (2026-05-08~09)

### D22-01. Footer cutoff margin 6pt → 30pt
- **결정**: `scripts/extract-suneung-question-images.ts` 의 footer baseline cutoff
  margin 을 6pt 에서 30pt 로 (글자 height ~12pt + 안전마진).
- **근거**: 6pt 는 글자 baseline 만 잘려 윗부분 ~6pt 가 이미지에 남아 사용자
  "여전히 footer 가 잘리지 않았어" 신고.
- **commit**: `d6ffd54`. **사용자 액션**: `EXTRACT_FORCE=true` + `UPLOAD_FORCE=true` 재실행.

### D22-02. 과목별 입력 가이드
- **결정**: BetaChat placeholder + system prompt INPUT_PARSING_RULES 4 과목별 분리.
- **물리 핵심**: `*` 없이 인접 = 곱셈 (F=ma → m·a). 숫자+알파벳 = 단위 (5m, 2kg).
  알파벳 단독 = 변수 (m=질량, v=속도, E=에너지). 모호 시 학생에게 확인.
- **commit**: `d6ffd54`.

### D22-03. Maestro 풀이 정리 분리
- **결정**: Legend `build-summary` 의 ToT/agentic 구조와 분리. Maestro 는
  `generateObject` + zod 한 번 호출의 가벼운 구조.
- **출력 5 섹션**: persona_takeaway / key_concepts / solution_steps / pitfalls /
  next_practice.
- **모델**: 풀이한 페르소나 모델 그대로 재사용 (학생 입장 일관성).
- **commit**: `966c56c`.

### D22-04. Maestro 리포트 분리
- **결정**: `/maestro/[subject]/report` 신설. `/legend/report` 와 별도 라우트·차트.
- **데이터**: 22차 1차는 localStorage, Phase 5 (commit `1cda757`) 부터 DB 누적
  (`maestro_tutor_sessions` + `maestro_summaries`).
- **차트**: 풀이 수 / 최근 7일 / multimodal 첨부 / 페르소나 분포 / 최근 정리 5건.

### D22-05. Maestro Trigger 라이브러리 분리
- **결정**: `/maestro/[subject]/triggers` 신설. `data/seeds/{subject}-anchors.json`
  정적 시드 로드. Legend 의 `math_tool_triggers` DB 와 완전 분리.
- **commit**: `30e49a3`. 30 도구 × 4 과목 = 120 trigger 도구.

### D22-06. Maestro/Legend 5 phase 분리 ⭐
| Phase | 변경 | commit |
|---|---|---|
| 1 | `lib/types/subject.ts` + `lib/maestro/types.ts` (re-export 호환) | `6754b55` |
| 2 | `/api/maestro/[subject]/tutor` 신설 (285줄 분기 추출) | `85c2412` |
| 3 | SQL — `maestro_tutor_sessions` + `maestro_summaries` (legend_* 와 분리) | `36f91aa` |
| 4 | `MaestroChat` thin wrapper + 4 페이지 import 통일 (점진 분리 1단계) | `9b12504` |
| 5 | DB insert 활성화 + `/api/maestro/[subject]/report` endpoint | `1cda757` |

- **다음 세션**: BetaChat 1500+ 줄 진짜 추출 + LegendChat rename + legend route maestro 분기 cleanup.

### D22-07. 결제 시스템 활성화 패턴
- **결정**: 베타 동안 `NEXT_PUBLIC_PAYMENT_ACTIVE=false` 로 결제 버튼 비활성.
  베타 종료 후 env 만 `true` 로 교체하면 즉시 활성. 코드·약관·UI 모두 production
  배포 완료 상태.
- **commit**: `febdb7c` (DB + 약관) + `99fd491` (SDK + API + UI + quota).

### D22-08. 가격 책정 (확정)
- **Basic** ₩29,000 / 월 / 50회
- **Standard** ₩49,000 / 월 / 100회 ⭐ **메인 anchor**
- **Premium** ₩99,000 / 월 / 무제한 + 부모 리포트
- **Top-up 100회** ₩14,900 (단발)
- 모든 가격 VAT 10% 포함 (Phase 1 `pricing-strategy.md` 가격 유지).
- **1회 정의**: 1 problem (한 세션의 모든 turn 포함). 라마누잔(Haiku) +
  부속 도구 (마인드맵·헤밍웨이·독서로그·단어장 등) 무제한.

### D22-09. 환불 정책 (확정)
- **결제 ≤ 7일 + 미사용** → 전액 환불 (자동 토스 cancel API)
- **결제 ≤ 7일 + 일부 사용** → 사용분 일할 차감 후 환불
  - 단가: Standard ₩490/회, Basic ₩580/회. Premium 은 7일 이내 무조건 전액.
- **결제 > 7일** → 다음 결제일까지 사용 가능, 다음 결제 차단 (정기결제 해지)
- **7일 초과 + 회사 측 사유**: admin 검토 (`refunds.status='pending'`)
- 카드 환불 입금: 토스 처리 후 카드사 3~5 영업일.

### D22-10. 약관 4종 + 사업자 정보 환경변수
- `/terms` 이용약관 (12조 + 부칙)
- `/privacy` 개인정보처리방침 (수집 · 위탁 8업체 · 보유 5년 · 정보주체 권리)
- `/refund` 환불 정책
- `/business-info` 사업자 정보 — `lib/legal/meta.ts` BUSINESS_INFO 가
  `NEXT_PUBLIC_BUSINESS_*` env 미설정 시 placeholder. 부산 임대 이전 + 통신판매업
  신고 + 토스 가맹점 가입 후 vercel env 추가 = 자동 갱신.

## 21차 세션 (2026-05-07~08) — 요약 (상세는 `docs/progress.md`)

5 root causes 사슬 해결 — useChat marker / Gemini model ID / GEMINI key /
Anthropic alias / **Vercel Hobby Blob bandwidth** (진짜 결정타). Pro plan upgrade
($20/월) 로 즉시 access 복구. Maestro 가 첫 진짜 Gemini provider 사용 코드
(Legend gauss 는 라벨만, 실제는 OpenAI).

## 19차 세션 (2026-05-06~07) — 요약

Maestro 4 과목 신설 — Earth Science / Biology / Physics / Chemistry. 16 페르소나
(4 모델 1:1 매핑 — Sonnet/Gemini/Opus/GPT). 1598 수능 PNG + Vercel Blob 업로드.
120 trigger 도구 시드 (4 × 30).

---

## 미확정 / 사용자 액션 대기

### 사업자 등록 + PG 가입
- 부산 임대 이전 → 사업자 등록 → 통신판매업 신고 → 토스페이먼츠 가맹점 가입.
- 결정일 2026-05-03 (메모리 `project_payment_infra`). 진행 상태 미확인.

### SQL 마이그레이션 적용 (사용자 액션)
1. `supabase/migrations/20260509_maestro_dedicated_tables.sql` (Phase 3)
2. `supabase/migrations/20260509_payment_system.sql` (결제 시스템)
3. (이전) `supabase/migrations/20260506_maestro_subject_columns.sql` 적용 여부 미확인 — A5

### maestro trial 분기 결정
- 현재: 인증 필수 redirect.
- 충돌: dashboard "로그인 없이 체험 가능" 안내.
- 옵션: (A) 의도된 설계 → 문구 수정 / (B) 비로그인 1~2회 trial 추가.
