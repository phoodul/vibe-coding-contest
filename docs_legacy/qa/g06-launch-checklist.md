# G-06 Production 배포 체크리스트

> 작성일: 2026-04-29 (G06-25)
> 베이스: `docs/architecture-g06-legend.md` §8 + `docs/task-g06.md` M7
> 목적: G-06 Legend Tutor 라이브 전환 — 베타 50명 회귀 0 보장.

## 코드 변경 완료
- [x] `src/middleware.ts` 302 → 301 영구 redirect
- [x] DB 마이그레이션 8개 적용 (G06-01~03)
- [x] `/api/euler-tutor` 내부 위임 (routeProblem only — G06-24 점진적)
- [x] `/legend/*` 6 페이지 + `/api/legend/*` 11 라우트
- [x] `src/components/legend/` 13 컴포넌트
- [x] 5 흉상 이미지 + LICENSES.md (Wikimedia PD)
- [x] 5종 quota 통합 (Δ1) + Gemini 429 fallback (Δ2)
- [x] R1 Per-Problem Report (Δ3 LLM struggle + Δ4 ToT 트리)

## 배포 전 점검
- [ ] `pnpm tsc --noEmit` 무에러
- [ ] `pnpm dlx vitest run` 213/213 PASS
- [ ] `pnpm next build` 성공 (`/legend/*` 번들 사이즈 확인 — React Flow lazy load)
- [ ] env 변수 (LEGEND_* 13종) Vercel 등록 확인
  - `LEGEND_DELEGATION_ENABLED` (G06-24 kill switch)
  - `LEGEND_TREE_DEPTH_PREVIEW` / `LEGEND_TREE_COLLAPSE_NODE_THRESHOLD`
  - `LEGEND_BETA_PROBLEM_DAILY` / `LEGEND_BETA_LEGEND_DAILY` / `LEGEND_BETA_REPORT_DAILY`
  - `LEGEND_WEEKLY_REPORT_PROBLEM_GATE` / `LEGEND_MONTHLY_REPORT_PROBLEM_GATE`
- [x] Supabase MCP — `legend_*` 6 테이블 + RPC 2종 production 적용 확인 완료

## 배포 명령
- `git push origin main` — Vercel 자동 빌드 트리거 (권장)
- 또는 `vercel deploy --prod` — CLI 직접

> **주의**: 본 체크리스트는 사용자 결정 후 직접 실행. CLAUDE.md 규칙: "Never push unless explicit user request".

## 배포 후 24h 모니터링
- [ ] `/euler` → `/legend` 301 redirect 동작 (Network 탭에서 status code 확인)
- [ ] `/legend` 메인 채팅 정상 (Vibe 디자인 + Vercel AI SDK streaming)
- [ ] `/api/legend/route` SSE 응답 (stage_progress → route_decided)
- [ ] `/api/legend/solve` 5 튜터 호출 + Gemini 429 fallback 정상
- [ ] `/legend/solve/[sessionId]` R1 카드 6 섹션 (problem / steps / trigger / tree / struggle / stuck)
- [ ] ToT 추론 트리: depth_max ≥ 1, 풀스크린 모달 INP ≤ 200ms
- [ ] LLM struggle resolution_text 정상 추출 (hardest step 1~2문장)
- [ ] `usage_events` / `legend_quota_counters` / `per_problem_reports` 정상 insert
- [ ] Gemini fallback 0건 또는 정상 동작 (Δ2)
- [ ] 베타 사용자 50명 풀이 흐름 회귀 0 (`/api/euler-tutor` 그대로 동작)

## 운영 KPI 게이트
- 라우팅 성공률 ≥ 99%
- quota 차단 정상 (limit_exceeded / eligibility_gate 분리 응답)
- R1 카드 응답 시간 P95 ≤ 25s
- 베타 사용자 회귀 결함 0 (P0)

## 롤백 시나리오
- 즉시 kill switch: `LEGEND_DELEGATION_ENABLED=false` 환경변수로 `/api/euler-tutor` 위임 비활성화
- middleware 301 → 302 임시 복귀: 1줄 revert + 재배포
- 전체 롤백: 직전 commit 으로 `vercel rollback`

## 베타 안내 (G06-23 별도)
- [ ] 베타 50명 안내 메일 발송 (G06-23 시점)
- 메일 템플릿: `docs/qa/g06-beta-announcement.md`
