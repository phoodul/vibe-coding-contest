# Euler Tutor 2.0 — Task Breakdown

> 작성일: 2026-04-25
> 원칙: 1 Task = 1 Commit. 모든 Task는 검증 명령어를 가진다. 선행 의존성이 명시된다.
> Commit 형식: `type: 한글 제목` (CLAUDE.md Language 섹션 준수)
> 영향 격리: 모든 변경은 `src/app/api/euler-tutor/*`, `src/lib/euler/*`, `src/components/euler/*`, `supabase/migrations/*`, `src/app/euler/*` 범위 내. 기존 MindPalace/English/Conversation 무영향 보장.

---

## 진행 상태 표

| Phase | 진행 | 완료 개수 |
|---|---|---|
| Phase A — MVP 차별화 | ✅ 완료 | 15/15 |
| Phase B — 도구 라이브러리 + RAG | ✅ 완료 | 16/16 |
| Phase C — Reasoner BFS + 학습 리포트 | ✅ 완료 | 13/13 |
| Phase D — SymPy μSvc + Family/Academy | ✅ 완료 | 10/10 |
| 법무·운영 | 🔄 3/4 (LEG-02 외부 변호사 자문 보류) | 3/4 |
| 운영 (3차 세션) | ✅ Supabase 마이그레이션 + KPI/Refactor/Runbook | + 4 |
| 운영 (4차 세션) | ✅ 시드 8영역 244 도구 + 직접 입력 UI | + 2 |
| Phase F (5차 세션) | ✅ 외부 도구 통합 (SymPy 25 + Wolfram + Z3 + matplotlib + 배지 + KPI 45) | 8/8 |

### 3차 세션 (2026-04-26) — 운영 라이브 + 통합 UX
| 단계 | 커밋 | 내용 |
|---|---|---|
| B (KPI 평가) | 5c559bb | 합성 10문항 + standalone eval 스크립트 + 검증 문서 |
| D (Refactor) | ad33aef | tryParseJson 단일화 + 죽은 코드 삭제 + 버그/보안 |
| A (배포) | e545986 | Supabase 14 마이그레이션 + 런북 + cron 정정 |
| 운영 버그 | 0d0e48f | SW 외부 origin 가로채기 |
| 운영 버그 | 9a06d9d | SymPy worker thread signal |
| 운영 버그 | b702b29 | /auth/login → /login |
| 운영 버그 | 8994eb2 | redeem_euler_beta ambiguous status |
| UX 통합 | 7a1b822 | 채팅+필기 한 세션 + 새 문제 + 리포트 진입점 |
| UX | ae5fee6 | 주 1회 리포트 (7일 window) |
| UX | 2da4ebb | 리포트 자격 게이트 (7일+10문제) |
| UX | 37c7db0 | Vision LLM 손글씨 + 인라인 패널 + 미리보기 |
| UX | 4503583 | OCR KaTeX 렌더링 |
| UX | 7afdf15 | 입력창 확장 자동 스크롤 |

총 14 commits. Production 라이브 (https://vibe-coding-contest.vercel.app).
Railway μSvc + Supabase 14 마이그레이션 + 32 도구 시드 + Vercel 19 env 모두 활성화.

### 4차 세션 (2026-04-26) — 시드 영역 확장 + 운영 UI
| 단계 | 커밋 | 내용 |
|---|---|---|
| 시드 확장 | 1909c54 | 8 영역 244 도구 / 262 trigger / 524 임베딩 + Manager enum + UI |
| 운영 UI | 859cdca | /admin/math-tools 직접 입력 폼 + API + 임베딩 자동 |

총 2 commits. 시드 32 → 244 (7.6×). 3중 확장 채널 완성.

### 5차 세션 (2026-04-26) — Phase F 외부 도구 통합

**모든 task 단일 세션 자율 진행, 단일 커밋으로 통합.**

| Task | 내용 |
|---|---|
| F-01 | services/euler-sympy/main.py — 19 신규 endpoint (총 25) |
| F-02 | /wolfram_query endpoint + WOLFRAM_APP_ID env |
| F-03 | z3-solver 4.13.4 + reduce_inequalities (solve_inequality) |
| F-04 | matplotlib /plot_function · /plot_region · /plot_geometry (PNG base64) |
| F-05 | src/lib/euler/cross-check.ts — loose match → 기호 동치 → 불일치 분기 |
| F-06 | VerifiedBadge.tsx + PlotImage.tsx (compact/full 모드) |
| F-07 | euler-tools-schema 6→17 tool, EULER_TOOLS_BY_AREA, REASONER_THRESHOLD_BY_AREA |
| F-08 | data/kpi-eval-problems.json 10→45 (영역별 5문항 + cross_check_query) |

**경쟁 차별화**: ChatGPT/Khanmigo/Photomath 단일 엔진 — 우리만 다중 cross-check.
**비용**: Wolfram \$5/월 + Railway 메모리 ↑ ≈ \$8/월

| Task ID | 상태 | 커밋 해시 | 비고 |
|---|---|---|---|
| A-01 | ✅ 완료 | b867096 | env 키 2개 추가 (Haiku/Critic) — project-decisions.md는 fb39d09에서 함께 커밋됨 |
| A-02 | ✅ 완료 | a08e159 | src/lib/euler/, src/components/euler/ stub 생성, tsc 통과 |
| A-03 | ✅ 완료 | 68e637e | Critic 프롬프트 (verify+diagnose, StuckReason enum 8종, few-shot 7개) |
| A-04 | ✅ 완료 | dbb64d9 | /api/euler-tutor/critic POST 라우트 (Haiku 4.5, JSON 모드, 인증) |
| A-05 | ✅ 완료 | d66a7c5 | critic-client 헬퍼 + orchestrator EULER_CRITIC_ENABLED 통합 |
| A-06 | ✅ 완료 | d708db2 | Coaching 프롬프트 verified + stuck_reason 6종 분기 |
| A-07 | ✅ 완료 | fede352 | PWA — manifest shortcuts + sw v2-euler 캐시 갱신 |
| A-08 | ✅ 완료 | 1c98d12 | HandwriteCanvas (Pointer Events + 압력 + Undo + 도와줘) |
| A-09 | ✅ 완료 | 93859b7 | canvas-stroke-encoder 800KB 자동 다운스케일 |
| A-10 | ✅ 완료 | ad545af | parse-image handwritten 옵션 (Mathpix formats/ocr/rm_spaces) |
| A-11 | ✅ 완료 | 268a0ee | /euler/canvas 페이지 + sessionStorage seed |
| A-12 | ✅ 완료 | 76a16d2 | ThoughtStream UI (5 stage + pickLatestStage 헬퍼) |
| A-13 | ✅ 완료 | 4990bce | input_mode 통합 + 가우스 토글 호환 + 필기 진입점 추가 |
| A-14 | ✅ 완료 | 0e916c3 | euler_beta_invites + redeem RPC + /euler/beta + canvas 가드 |
| A-15 | ✅ 완료 | 0b1b4e3 | Phase A 체크리스트 + production build 통과 |
| B-01 | ✅ 완료 | 6709233 | math_tools 마이그레이션 + pgvector |
| B-02 | ✅ 완료 | fcb35b1 | math_tool_triggers + ivfflat ANN |
| B-03 | ✅ 완료 | 0397cf3 | candidate_tools 검수 큐 |
| B-04 | ✅ 완료 | c370439 | embed.ts (OpenAI 1536d) |
| B-05 | ✅ 완료 | e2932a3 | 시드 자동화 + 미적분 32개 |
| B-06 | ✅ 완료 | 71ae9a5 | difficulty-classifier (Haiku) |
| B-07 | ✅ 완료 | 8ade071 | Manager Agent 프롬프트 + 라우트 |
| B-08 | ✅ 완료 | af25e45 | Retriever (양방향 pgvector + RPC) |
| B-09 | ✅ 완료 | 0849760 | Retriever 단독 라우트 |
| B-10 | ✅ 완료 | ca89d18 | tool-reporter + 보고 라우트 |
| B-11 | ✅ 완료 | 2efe2b0 | /admin/math-tools 검수 어드민 |
| B-12 | ✅ 완료 | d8f0ff7 | orchestrator에 Manager + Retriever 통합 |
| B-13 | ✅ 완료 | ce1842a | Coaching 프롬프트 retrieved why |
| B-14 | ✅ 완료 | f0ff94c | ThoughtStream 도구 카드 strip |
| B-15 | ✅ 완료 | 30e47f8 | usage_events Manager/Retriever/Candidate |
| B-16 | ✅ 완료 | cedcdf2 | Phase B 체크리스트 + 빌드 |
| C-01+02 | ✅ 완료 | d38c3fd | Reasoner Forward/Backward BFS 프롬프트 |
| C-03 | ✅ 완료 | 27262fe | Reasoner 오케스트레이터 (병렬) |
| C-04 | ✅ 완료 | fd0f069 | Reasoner를 orchestrator route 통합 |
| C-05 | ✅ 완료 | 67056f8 | Reasoner used_tools → tool-reporter |
| C-06 | ✅ 완료 | bd2923f | euler_solve_logs + solve-logger |
| C-07 | ✅ 완료 | ed860ae | /api/euler-tutor/diagnose (Critic 진단) |
| C-08 | ✅ 완료 | dee3c95 | user_skill_stats + user_layer_stats + updaters |
| C-09 | ✅ 완료 | dc2f465 | weakness-aggregator 7종 진단 + Sonnet 추천 |
| C-10 | ✅ 완료 | aeaec67 | progress 대시보드 라우트 |
| C-11 | ✅ 완료 | 6093f04 | /euler/report WeaknessChart + LayerStuckChart |
| C-12 | ✅ 완료 | d0e8f63 | usage-quota Free 일일 한도 |
| C-13 | ✅ 완료 | 7f7225e | Phase C 체크리스트 + 학원 자료 |
| D-01 | ✅ 완료 | 3140ad6 | Railway FastAPI + SymPy μSvc |
| D-02 | ✅ 완료 | f63a1f1 | .env.example Phase B/C/D 키 등록 |
| D-03 | ✅ 완료 | 7fa649c | SymPy 프록시 라우트 + 클라이언트 |
| D-04 | ✅ 완료 | ac2b356 | Anthropic tool calling schema 6종 |
| D-05 | ✅ 완료 | c1007d5 | Reasoner + Tool calling (환각 0%) |
| D-06 | ✅ 완료 | d7b6150 | Family lock_reveal + RPC |
| D-07 | ✅ 완료 | 4565da1 | Academy 교사 대시보드 |
| D-08 | ✅ 완료 | 53c2197 | Toss Payments 결제 인프라 |
| D-09 | ✅ 완료 | 3988c1c | Free 한도 강화 + UpsellModal |
| D-10 | ✅ 완료 | 83f5e58 | Phase D 체크리스트 + 빌드 |
| LEG-01 | ✅ 완료 | 9304eca | 이용약관 + 개인정보처리방침 초안 |
| LEG-02 | ⏸ 외부 | — | 변호사 자문 (코드 외, 운영 시점에 진행) |
| LEG-03 | ✅ 완료 | 894a373 | 만 14세 미만 부모 동의 |
| LEG-04 | ✅ 완료 | ae50ec6 | 졸업 + 1년 PII 익명화 cron |

---

## Phase A — MVP (3~4주, 핵심 차별화)

> 목표: Critic Agent + 필기 모드(PWA) + 클로즈드 베타 50명 출시
> KPI: "정답인데 의심하는" 케이스 0%, 필기 OCR 성공률 80%+, 베타 50명 가입

### A-01: docs 정합성 + 환경변수 키 이름만 추가
- 파일: `docs/project-decisions.md` (신규/추가), `.env.example` (신규/추가, 값 빈 문자열)
- 변경: 본 문서들과 일치하는 결정 사항 7개 항목 추가, env 키 이름만 등록 (`ANTHROPIC_HAIKU_MODEL_ID`, `EULER_CRITIC_ENABLED`)
- 의존: 없음
- 검증: `git diff --stat`로 변경 파일 확인, `cat .env.example | cut -d= -f1`로 키 이름만 확인
- 위험: LOW (문서)
- 예상 토큰: 3K
- KPI: 후속 Task가 참조할 결정 항목 명문화

### A-02: 디렉터리 골격 생성 + 빈 모듈 stub
- 파일: `src/lib/euler/` (신규 디렉터리, `index.ts` 빈 export만), `src/components/euler/` (신규)
- 변경: 빈 모듈 스텁 생성. 기존 `src/lib/solution-cache.ts`는 유지 (이동은 별도 Task에서)
- 의존: A-01
- 검증: `npx tsc --noEmit`
- 위험: LOW
- 예상 토큰: 1K
- KPI: 후속 Task가 import 경로를 안정적으로 사용 가능

### A-03: Critic Agent 프롬프트 정의 (검증 + 막힘 진단)
- 파일: `src/lib/ai/euler-critic-prompt.ts` (신규, 함수 `buildCriticPrompt(problem, solution, studentSteps?)`)
- 변경: Haiku 4.5용 프롬프트. 두 모드:
  - 모드 A (검증): 입력=문제+풀이, 출력=`{ verified, errors, confidence, suggested_backtrack? }`
  - 모드 B (Phase A 기본 골격, Phase C에서 채움): 학생 풀이 단계가 있으면 stuck_reason 분류 출력 — `{ stuck_layer, stuck_reason }` (enum: parse_failure | domain_id_miss | tool_recall_miss | tool_trigger_miss | forward_dead_end | backward_dead_end | computation_error | success)
- 의존: A-02
- 검증: `npx tsc --noEmit` + `node --experimental-vm-modules -e "import('./src/lib/ai/euler-critic-prompt.ts').then(m=>console.log(typeof m.buildCriticPrompt))"`
- 위험: LOW
- 예상 토큰: 5K
- KPI: 프롬프트가 JSON schema 명시 + few-shot 4개 포함 (성공/recall miss/trigger miss/computation err)

### A-04: Critic Agent API 라우트 (`/api/euler-tutor/critic`)
- 파일: `src/app/api/euler-tutor/critic/route.ts` (신규, 함수 `POST`)
- 변경: Haiku 4.5 호출, `generateText` + JSON 모드. 인증 필수 (Supabase server client). maxDuration 30
- 의존: A-03
- 검증: `pnpm dev` 후 `curl -X POST http://localhost:3000/api/euler-tutor/critic -H "Cookie: ..." -d '{"problem":"x^2-4=0","solution":"x=2"}'` → `{verified: false, errors: ["x=-2 누락"]}` 반환
- 위험: MEDIUM (API 호출 실패 처리)
- 예상 토큰: 5K
- KPI: 명백한 오류 5개 케이스 100% 검출

### A-05: 기존 orchestrator route.ts에 Critic 통합 (선택적)
- 파일: `src/app/api/euler-tutor/route.ts` (라인 27~85의 POST 함수)
- 변경: streamText 호출 직전 Critic API를 fetch (옵션 `EULER_CRITIC_ENABLED=true` 시만). 결과 `verified`를 시스템 프롬프트에 주입
- 의존: A-04
- 검증: `pnpm dev`로 미적분 단순 문제 풀이 → 기존 동작 변화 없는지 + 정답 시 "다시 검산" 멘트 사라짐 확인
- 위험: MEDIUM (스트리밍 흐름 깨짐 위험)
- 예상 토큰: 4K
- KPI: 정답 도출한 풀이에서 의심 발화 0회 (수능 1~25번 10문항 샘플)

### A-06: Coaching 프롬프트에 verified 신호 + stuck_reason 분기 추가
- 파일: `src/lib/ai/euler-prompt.ts` (라인 15~18 신뢰도 원칙 섹션 + 신규 stuck 분기 섹션)
- 변경: `{verified}` 플레이스홀더 (true=자신감 있게 / false=함께 검산) + `{stuck_reason}` 분기 멘트 골격 (architecture.md §6.1 2-7 표 그대로):
  - `tool_recall_miss` → "OO 정리는 어떤 정리일까요? 같이 살펴볼까요?"
  - `tool_trigger_miss` → "OO 정리는 어떤 조건일 때 쓸 수 있을까요?"
  - `domain_id_miss` → "이 문제는 미적분의 어떤 세부 영역일까요? 그 영역의 도구들을 떠올려볼까요?"
  - `forward_dead_end` → "조건에서 알 수 있는 것들을 한 번 더 나열해볼까요?"
  - `backward_dead_end` → "답을 구하려면 무엇이 필요할지 거꾸로 생각해볼까요?"
  - `computation_error` → 해당 계산 단계 검산
- Phase A에서는 stuck_reason 미공급 시 기본 동작(verified 분기만). Phase C에서 Critic이 stuck_reason 채우면 자동 활성화
- 의존: A-05
- 검증: `npx tsc --noEmit` + 수동 시각 점검
- 위험: LOW
- 예상 토큰: 3K
- KPI: 변경된 프롬프트가 A-05 라우트 응답에 반영됨 + stuck_reason 시드 텍스트 6종 모두 포함

### A-07: PWA manifest + service worker 설정
- 파일: `public/manifest.json` (신규/갱신), `next.config.js` (PWA 플러그인 추가), `src/app/layout.tsx` (manifest link)
- 변경: name "오일러 튜터", icons 192/512, display "standalone", start_url "/euler/canvas"
- 의존: A-02
- 검증: `pnpm build && pnpm start` 후 Lighthouse PWA 점수 확인 (> 80)
- 위험: LOW
- 예상 토큰: 3K
- KPI: iOS Safari "홈 화면에 추가" 정상 동작

### A-08: HandwriteCanvas 컴포넌트 (Pointer Events + Canvas 2D)
- 파일: `src/components/euler/HandwriteCanvas.tsx` (신규)
- 변경: useRef Canvas, onPointerDown/Move/Up, pen pressure 반영 (lineWidth 가변), Undo 버튼, "도와줘" 버튼 → onSubmit(dataUrl)
- 의존: A-07
- 검증: `pnpm dev`로 데스크톱(마우스) + iOS PWA(Apple Pencil) 양쪽에서 stroke 그려짐 확인
- 위험: MEDIUM (Pointer Events 브라우저 호환성)
- 예상 토큰: 6K
- KPI: 14개 stroke 누적 → toBlob → 800KB 이하 PNG 생성

### A-09: canvas-stroke-encoder util
- 파일: `src/lib/euler/canvas-stroke-encoder.ts` (신규, 함수 `encodeCanvasToPayload(canvas)`)
- 변경: Canvas → PNG dataURL + 메타({width, height, stroke_count}) 반환
- 의존: A-08
- 검증: 단위 테스트 (vitest 권장, 없으면 manual). 800KB 이상이면 다운스케일
- 위험: LOW
- 예상 토큰: 2K
- KPI: 2048x1536 → 1280x720으로 자동 리사이즈

### A-10: parse-image 라우트에 handwritten 옵션 추가
- 파일: `src/app/api/euler-tutor/parse-image/route.ts` (라인 9~86)
- 변경: 요청 body에 `handwritten?: boolean`. true면 Mathpix 호출 시 `formats: ["text","data"], ocr: ["math","text"], rm_spaces: false` 적용
- 의존: A-09
- 검증: 손글씨 이미지 5장 테스트 → LaTeX 정확도 80%+ (수동 검수)
- 위험: MEDIUM (Mathpix 응답 포맷 변동)
- 예상 토큰: 3K
- KPI: 인쇄 모드 회귀 0건

### A-11: /euler/canvas 페이지 (필기 모드 진입점)
- 파일: `src/app/euler/canvas/page.tsx` (신규)
- 변경: HandwriteCanvas 마운트 + 결과를 기존 `/euler` 채팅 화면에 query param으로 전달 (또는 직접 채팅 컴포넌트 임베드)
- 의존: A-10
- 검증: `pnpm dev`로 /euler/canvas 진입 → "도와줘" → 코칭 채팅 자동 시작
- 위험: MEDIUM
- 예상 토큰: 5K
- KPI: end-to-end 30초 이내 첫 코칭 응답

### A-12: ThoughtStream UI (단계 진행 표시)
- 파일: `src/components/euler/ThoughtStream.tsx` (신규)
- 변경: orchestrator에서 보내는 `data: {stage, payload}` 메시지 수신 → 단계별 점선 진행 UI (Manager → Critic → Coaching). Framer Motion 애니메이션
- 의존: A-05
- 검증: 시각 확인 (스크린샷 비교)
- 위험: LOW
- 예상 토큰: 4K
- KPI: 5초 이상 응답 지연 시 사용자 이탈 0건 (체감 지연 완화)

### A-13: 가우스 토글 호환성 유지 + 입력 모드 통합
- 파일: `src/app/api/euler-tutor/route.ts` (라인 70~78 model 분기), `src/app/api/euler-tutor/critic/route.ts` (A-04에서 작성), `src/app/euler-tutor/page.tsx` (입력 모드 토글 UI)
- 변경:
  1. **가우스 토글 유지**: 기존 `useGpt` 토글이 Reasoner/Coaching 단계에만 영향 (Sonnet 4.6 ↔ GPT-5.1). Critic/Manager는 항상 Haiku 4.5 (비용 절감, 토글 무관)
  2. **입력 모드 명시**: 텍스트(현재) + 이미지 사진(현재) + 필기(A-08~A-11 신규) 3가지를 `input_mode` 필드로 명시. 채팅 화면에 3가지 입력 진입점 노출 (텍스트박스 / 카메라 / 필기 캔버스 링크)
  3. orchestrator 응답에 `tutor_persona`, `input_mode` 필드 echo (디버깅·로깅용)
- 의존: A-11
- 검증: `pnpm dev`로 (a) 오일러+텍스트, (b) 가우스+사진, (c) 오일러+필기, (d) 가우스+필기 4 조합 모두 응답 정상
- 위험: MEDIUM (스트리밍 흐름 깨짐 위험)
- 예상 토큰: 5K
- KPI: 4 조합 100% 회귀 통과 / 기존 사용자 플로우(텍스트+오일러) 변화 0건

### A-14: 베타 게이트 + 모집 페이지
- 파일: `src/app/euler/beta/page.tsx` (신규), `supabase/migrations/20260425_euler_beta_invites.sql` (신규)
- 변경: `euler_beta_invites(user_id, status, invited_at)` 테이블 + invite 코드 입력 화면. 기존 EduFlow 사용자에게 inApp 배너로 노출
- 의존: A-13
- 검증: 코드 없는 사용자는 /euler/canvas 진입 시 베타 페이지로 리다이렉트
- 위험: MEDIUM (기존 사용자 플로우에 영향 가능 → 라우트 가드만 추가, /euler 기본 페이지는 비차단)
- 예상 토큰: 5K
- KPI: 50명 가입 도달 시 자동 마감 토글

### A-15: Phase A 통합 테스트 + 회귀 점검
- 파일: 없음 (테스트 시나리오 문서 `docs/qa/phase-a-checklist.md` 신규)
- 변경: 수능 1~28번 샘플 10문항을 텍스트/사진/필기 3가지 모드 × 오일러/가우스 2 페르소나로 풀이 → 기록
- 의존: A-14
- 검증: 체크리스트 95%+ 통과
- 위험: LOW
- 예상 토큰: 3K
- KPI: 결함 발견 시 P0만 즉시 수정, P1~P2는 Phase B로 이월

---

## Phase B — 도구 라이브러리 + RAG (3~4주)

> 목표: pgvector + math_tools + Tier 1/2 큐레이션 + 미적분 핵심 정리 30개 직접 입력
> KPI: 도구 호출 hit rate 70%+, 코칭에 "왜"가 포함되는 비율 90%+

### B-01: Supabase pgvector 활성화 + math_tools 마이그레이션
- 파일: `supabase/migrations/20260426_math_tools.sql` (신규)
- 변경: `create extension vector` + math_tools 테이블 + 인덱스 + RLS (architecture.md §3.1)
- 의존: A-14
- 검증: `npx supabase db push` (또는 Supabase 대시보드 SQL editor) → `select * from math_tools limit 1` 통과
- 위험: MEDIUM (마이그레이션 롤백 시나리오 필요)
- 예상 토큰: 2K
- KPI: 마이그레이션 idempotent

### B-02: math_tool_triggers 마이그레이션 + 양방향 임베딩 인덱스
- 파일: `supabase/migrations/20260427_math_tool_triggers.sql` (신규)
- 변경: 테이블 + ivfflat 인덱스 (forward/backward 각각) + RLS (architecture.md §3.2)
- 의존: B-01
- 검증: 더미 row 1개 insert 후 cosine 검색 동작 확인
- 위험: MEDIUM (ivfflat lists 파라미터 튜닝)
- 예상 토큰: 2K
- KPI: 검색 P95 < 100ms (1만 row 가정)

### B-03: candidate_tools 마이그레이션
- 파일: `supabase/migrations/20260428_candidate_tools.sql` (신규)
- 변경: architecture.md §3.3
- 의존: B-02
- 검증: insert/update 동작 확인
- 위험: LOW
- 예상 토큰: 1K
- KPI: 검수 큐 status enum 4종 모두 작동

### B-04: 임베딩 유틸 (`src/lib/euler/embed.ts`)
- 파일: `src/lib/euler/embed.ts` (신규, 함수 `embedText(text)`, `embedBatch(texts)`)
- 변경: OpenAI text-embedding-3-small 호출. 1536차원 반환. 배치 100개 단위
- 의존: B-01
- 검증: 단위 테스트 (1개 텍스트 → 1536 길이)
- 위험: LOW
- 예상 토큰: 2K
- KPI: 1K 텍스트 임베딩 < 30초

### B-05: 시드 자동화 파이프라인 + 미적분 초기 시드 (≥30개, 운영 중 확장)
- 파일: `scripts/seed-math-tools.ts` (신규 — 자동화 진입점), `scripts/seed-from-image.ts` (신규 — 사진 배치 입력), `data/math-tools-seed.json` (초기 30+ 시드)
- 변경:
  1. **자동화 파이프라인** (Mathpix → Sonnet 메타데이터 생성 → 사용자 검수 → 일괄 등록): 사진 N장 → JSON N개 도구 후보. 사용자는 어드민 화면에서 5분 검수 후 등록
  2. **저작권 차단**: 시드 입력 시 정석·교과서 원문과의 동일성 hash 비교 → 일정 임계값(예: trigram Jaccard 0.8) 초과 시 reject. AI 자체 표현 강제
  3. **초기 시드 ≥ 30개** (MVP 검증용 최소값): 평균값정리/롤의정리/체인룰/치환적분/부분적분/사잇값정리/3차함수극값/극값과 미분/넓이공식/정적분 기본정리 등. 각 도구당 trigger 2~4개 (forward/backward)
  4. **운영 중 점진 확장**: Phase B 종료 ≥ 30, Phase C 종료 ≥ 100 (Tier 1/2 자동 보고 포함), Phase D 종료 ≥ 300 목표 (강제 아님)
- 의존: B-04, B-11(검수 어드민 화면)
- 검증: `pnpm tsx scripts/seed-math-tools.ts --dry-run` 후 출력 검수, 사진 배치 입력 1회 시연(`scripts/seed-from-image.ts data/test-images/`), 그 다음 실제 적재. 동일성 hash 차단 동작 확인
- 위험: MEDIUM (저작권 — hash 차단 임계값 검증 필수)
- 예상 토큰: 14K
- KPI: 초기 30+ 도구 + 평균 3 trigger = 90+ row 적재. 임베딩 비용 < $0.20. 자동화 파이프라인으로 사용자 30분 내 50개 추가 가능

### B-06: difficulty-classifier (Haiku)
- 파일: `src/lib/euler/difficulty-classifier.ts` (신규, 함수 `classifyDifficulty(problemText)`)
- 변경: Haiku 4.5 호출, 1~6 정수 + area 반환
- 의존: A-02
- 검증: 수능 1번(난이도 1) ~ 30번(난이도 6) 샘플 → ±1 오차 80%+
- 위험: LOW
- 예상 토큰: 3K
- KPI: 분류 P95 < 1.5초

### B-07: Manager Agent 프롬프트 + 라우트
- 파일: `src/lib/ai/euler-manager-prompt.ts` (신규), `src/app/api/euler-tutor/manager/route.ts` (신규)
- 변경: Sonnet 4.6 JSON 모드. 입력=문제 텍스트, 출력=`{variables, conditions, goal, area, difficulty}`
- 의존: B-06
- 검증: 테스트 5문항 → 변수/조건 추출 정확도 수동 검수
- 위험: MEDIUM
- 예상 토큰: 5K
- KPI: 변수 추출 누락률 < 10%

### B-08: Retriever 핵심 (양방향 pgvector 검색)
- 파일: `src/lib/euler/retriever.ts` (신규, 함수 `retrieveTools({conditions, goal, direction, topK})`)
- 변경: conditions[] → embedding_forward 검색, goal → embedding_backward 검색, tool_weight 가중 cosine 재정렬
- 의존: B-04, B-05
- 검증: B-05 시드 데이터 기준 "x=2에서 극값" 쿼리 → 평균값정리·극값정리 top-3 반환 확인
- 위험: MEDIUM
- 예상 토큰: 5K
- KPI: hit rate 70%+ (수동 평가, 수능 28번 5문항)

### B-09: Retriever 단독 라우트 (`/api/euler-tutor/tools/search`)
- 파일: `src/app/api/euler-tutor/tools/search/route.ts` (신규)
- 변경: B-08 함수 노출. 인증 필수
- 의존: B-08
- 검증: curl로 쿼리 → JSON top-K 반환
- 위험: LOW
- 예상 토큰: 2K
- KPI: 디버깅 가능

### B-10: Tier 1 자동 보고 라우트 + tool-reporter
- 파일: `src/app/api/euler-tutor/tools/report/route.ts` (신규), `src/lib/euler/tool-reporter.ts` (신규)
- 변경: Reasoner가 보고한 도구 → candidate_tools 적재 + 동일 후보면 occurrence_count++. 임계값(EULER_TOOL_REPORT_THRESHOLD) 도달 시 admin 이메일 알림 (선택)
- 의존: B-03
- 검증: 동일 후보 3회 보고 → status pending + count 3 + (옵션) 알림 발송
- 위험: LOW
- 예상 토큰: 4K
- KPI: 중복 dedup 정확도 100%

### B-11: 검수 큐 어드민 화면 (`/admin/math-tools`)
- 파일: `src/app/admin/math-tools/page.tsx` (신규), `src/app/api/admin/candidate-tools/[id]/approve/route.ts` (신규), `src/app/api/admin/candidate-tools/[id]/reject/route.ts` (신규)
- 변경: 검수 큐 리스트 + 승인 시 math_tools에 머지, 거절 시 status=rejected. admin role 가드
- 의존: B-10
- 검증: 더미 후보 3개 → 1 승인, 1 거절, 1 머지 동작 확인
- 위험: MEDIUM (admin role 권한 누락 위험)
- 예상 토큰: 7K
- KPI: 검수자 1명이 시간당 30개 처리 가능

### B-12: orchestrator에 Manager + Retriever 통합
- 파일: `src/app/api/euler-tutor/route.ts` (라인 27~85)
- 변경: Critic 호출 직전 Manager 호출 → 난이도 1~3은 단발, 4~5는 Retriever 추가, 6+은 Phase C에서 Reasoner 추가 (현재는 6+도 단발 + Retriever)
- 의존: B-07, B-08
- 검증: 난이도 1, 4, 6 각 1문항 → 해당 분기 진입 로그 확인
- 위험: HIGH (기존 흐름 광범위 수정)
- 예상 토큰: 8K
- KPI: 응답 P95 < 12초 (난이도 4~5 기준)

### B-13: Coaching 프롬프트에 retrieved_tools.why_use_it 주입
- 파일: `src/lib/ai/euler-prompt.ts` 또는 신규 `src/lib/ai/euler-coaching-prompt.ts`
- 변경: `{retrieved_tools}` 플레이스홀더에 `tool.name + tool.why_use_it` 텍스트 주입. "왜 이 정리를 쓰는가"를 코칭에 반영하도록 지시
- 의존: B-12
- 검증: 평균값정리가 retrieved 된 문제 → 응답에 "왜냐하면..." 어구 포함 확인
- 위험: LOW
- 예상 토큰: 3K
- KPI: 코칭 응답에 "왜" 포함 비율 90%+

### B-14: ThoughtStream에 Retriever 단계 표시
- 파일: `src/components/euler/ThoughtStream.tsx` (A-12 확장)
- 변경: stage 추가 ("tools_retrieved") + 검색된 도구 카드 표시 (이름, 한 줄 설명)
- 의존: B-13
- 검증: 시각 확인
- 위험: LOW
- 예상 토큰: 3K
- KPI: 학생이 "이 도구를 쓰는구나" 인지

### B-15: usage_events 이벤트 추가 (Phase B)
- 파일: `src/lib/analytics/events.ts` (기존 위치 확인 후 갱신)
- 변경: `euler_manager_classified`, `euler_tool_retrieved`, `euler_candidate_reported` 이벤트 정의 + 호출
- 의존: B-12
- 검증: /admin/analytics 대시보드에 이벤트 노출
- 위험: LOW
- 예상 토큰: 2K
- KPI: 분석 가능

### B-16: Phase B 회귀 + KPI 측정
- 파일: `docs/qa/phase-b-checklist.md` (신규)
- 변경: 수능 미적분 28번 5문항 + 모의고사 5문항 → hit rate 측정 + "왜" 포함 비율 측정
- 의존: B-15
- 검증: KPI 70% / 90% 도달
- 위험: LOW
- 예상 토큰: 3K
- KPI: 미달 시 시드 도구 추가 또는 trigger 임베딩 보강

---

## Phase C — Reasoner BFS + 학습 리포트 (3주)

> 목표: 난이도 6+ 풀 파이프라인 + 약점 분석 + 진척 대시보드 + 학원 1곳 시범 + 유료 전환
> KPI: 미적분 28~30번 정답률 50% → 70%

### C-01: Reasoner 프롬프트 (Forward BFS)
- 파일: `src/lib/ai/euler-reasoner-prompt.ts` (신규, 함수 `buildForwardPrompt(state)`)
- 변경: "현재 조건 집합으로 알 수 있는 모든 새 사실 list 반환" — 사용자 정의 BFS. extended thinking. 출력=JSON list
- 의존: B-16
- 검증: 단순 문제 1개 → forward 1단계 결과가 list 형태
- 위험: MEDIUM
- 예상 토큰: 5K
- KPI: 단계당 평균 3~5개 사실 도출

### C-02: Reasoner 프롬프트 (Backward BFS)
- 파일: `src/lib/ai/euler-reasoner-prompt.ts` 확장 (`buildBackwardPrompt`)
- 변경: "목표 도달에 필요한 가능한 모든 경로 list 반환"
- 의존: C-01
- 검증: 동일 문제 → backward 1단계 결과 list
- 위험: MEDIUM
- 예상 토큰: 4K
- KPI: 단계당 평균 2~4개 경로 도출

### C-03: Reasoner 오케스트레이션 (분기 + 병렬)
- 파일: `src/lib/euler/orchestrator.ts` (신규 또는 route.ts에서 분리)
- 변경: forward 1단계 + backward 1단계 병렬 → 결과 합집합 → Retriever로 도구 보강 → 다음 단계 분기 (보기/케이스마다 sub-task) → 각 sub-task `Promise.all`로 병렬
- 의존: C-02, B-08
- 검증: 케이스 분류 문제 (수능 28번류) → 분기 2~3개 생성 + 각각 결과
- 위험: HIGH (병렬 호출 비용/타임아웃)
- 예상 토큰: 10K
- KPI: 응답 P95 < 20초

### C-04: Reasoner를 orchestrator route에 통합
- 파일: `src/app/api/euler-tutor/route.ts`
- 변경: 난이도 6+ 분기에 Reasoner BFS 호출. 결과를 Critic으로 전달
- 의존: C-03
- 검증: 수능 30번 1문항 → 풀 파이프라인 진입 + 답 도출
- 위험: HIGH
- 예상 토큰: 6K
- KPI: 28~30번 정답률 50%+

### C-05: Reasoner 사용 도구 → tool-reporter 자동 호출
- 파일: `src/lib/euler/orchestrator.ts` (확장)
- 변경: Reasoner가 사용한 모든 도구를 fire-and-forget으로 candidate_tools 보고 (실패해도 메인 흐름 무영향)
- 의존: C-04, B-10
- 검증: 새 문제 풀이 후 candidate_tools에 row 추가 확인
- 위험: LOW
- 예상 토큰: 2K
- KPI: 보고 누락 < 5%

### C-06: euler_solve_logs 마이그레이션 + 저장 로직 (layer 진단 포함)
- 파일: `supabase/migrations/20260501_euler_solve_logs.sql` (신규), `src/lib/euler/solve-logger.ts` (신규)
- 변경: architecture.md §3.4 스키마 (`step_summary jsonb`, `stuck_layer`, `stuck_reason`, `input_mode`, `tutor_persona` 포함) + orchestrator 종료 후 비동기 저장. step_summary는 Reasoner의 BFS 경로 + 각 step의 layer/outcome/miss_subtype 메타데이터
- 의존: C-04
- 검증: 풀이 1건 후 row 1개 + step_summary jsonb 형식 검증 + stuck_layer/stuck_reason 채워짐
- 위험: LOW
- 예상 토큰: 4K
- KPI: 저장 성공률 99%+, step_summary 평균 4~8 step 기록

### C-07: Critic의 stuck 분류 활성화 (Phase A A-03 골격 채우기)
- 파일: `src/lib/ai/euler-critic-prompt.ts` (확장), `src/app/api/euler-tutor/critic/route.ts` (확장), `src/lib/euler/orchestrator.ts` (학생 풀이 단계 전달)
- 변경: A-03에서 골격만 만든 stuck 분류를 실제 동작시킴. 입력에 `studentSteps?: StudentStep[]` 추가. Critic이 학생 step별 outcome 판단 + stuck_layer/stuck_reason 출력. 분류 enum 7종 (parse_failure / domain_id_miss / tool_recall_miss / tool_trigger_miss / forward_dead_end / backward_dead_end / computation_error). 도구 호출 실패 시 recall vs trigger를 reasoner의 Retriever 호출 로그로 보조 판단(도구 후보가 retrieved 됐으나 학생이 못 떠올렸으면 trigger, retrieved 자체 실패면 recall)
- 의존: C-06, A-03
- 검증: 4종 합성 케이스 테스트 (recall/trigger/domain/computation 각 1) → 분류 정확도 80%+
- 위험: MEDIUM (분류 정확도)
- 예상 토큰: 6K
- KPI: 4종 진단 분류 정확도 80%+

### C-08: user_layer_stats 마이그레이션 + user_skill_stats 갱신 로직
- 파일: `supabase/migrations/20260502_user_skill_stats.sql` (신규), `supabase/migrations/20260503_user_layer_stats.sql` (신규), `src/lib/euler/skill-stats-updater.ts` (신규), `src/lib/euler/layer-stats-updater.ts` (신규)
- 변경:
  1. `user_skill_stats` (도구별): attempts/successes upsert
  2. `user_layer_stats` (architecture.md §3.5b): layer × area × user 단위. step_summary 순회하며 attempts/successes/stuck_count/failure_count + l5_domain_miss / l6_recall_miss / l6_trigger_miss 필드 별도 upsert
- 의존: C-07
- 검증: 동일 사용자 10건 풀이 (다양한 stuck_reason) → 두 테이블 row 누적 + L6 recall vs trigger 카운트 분리 확인
- 위험: LOW
- 예상 토큰: 5K
- KPI: 정확도 100%

### C-09: 약점 분석 리포트 라우트 (`/api/euler-tutor/report/weakness`)
- 파일: `src/app/api/euler-tutor/report/weakness/route.ts` (신규), `src/lib/euler/weakness-aggregator.ts` (신규)
- 변경: **단순 정답률이 아닌 "어디서, 왜 막히는가" 진단**. 최근 30일 logs + user_skill_stats + user_layer_stats를 조합 →
  - L1~2 계산 미숙: failure_count(computation_error) 高 → 사칙연산·지수·로그 기본기 보강 추천
  - L5 영역 인식 실패: l5_domain_miss 高 → "이 문제는 미적분의 어떤 세부 영역인지" 학습
  - L6 Recall 실패: l6_recall_miss 高 → 도구 자체 학습 (정의·예제·trigger 함께)
  - L6 Trigger 실패: l6_trigger_miss 高 → 도구는 알고 있으니 trigger 패턴 학습 강화
  - L7 forward dead: BFS 폭 확대 코칭
  - L7 backward dead: 역추적 코칭
  - L8 parse 실패: 문제 구조화 연습 추천
  - 추천 사항을 Sonnet으로 자연어 자동 생성 (학생에게 친절한 1~2문단)
- 의존: C-08
- 검증: 7종 진단 카테고리별 합성 더미 50건 → 각 카테고리 진단 멘트 정상 생성
- 위험: MEDIUM
- 예상 토큰: 8K
- KPI: 진단 카테고리 7종 모두 동작, 리포트 P95 < 5초

### C-10: 진척 대시보드 라우트 (`/api/euler-tutor/report/progress`)
- 파일: `src/app/api/euler-tutor/report/progress/route.ts` (신규)
- 변경: 주/월별 풀이 수, 정답률 추이, 사용 도구 다양성, 새로 배운 정리 + **layer별 통과율 추이** (L1~L8 각각의 시계열 차트 데이터). 통계 쿼리만 (LLM 호출 없음)
- 의존: C-08
- 검증: 30일치 더미 데이터 → 차트 데이터 + layer별 시계열 반환
- 위험: LOW
- 예상 토큰: 4K
- KPI: 응답 P95 < 1초

### C-11: WeaknessReport + ProgressDashboard 컴포넌트
- 파일: `src/components/euler/WeaknessReport.tsx` (신규), `src/components/euler/ProgressDashboard.tsx` (신규), `src/app/euler/report/page.tsx` (신규), `src/components/euler/LayerStuckChart.tsx` (신규)
- 변경: Recharts 사용. **WeaknessReport는 정답률이 아닌 "막힘 패턴"을 시각화** — 7종 진단 카테고리별 빈도 막대그래프 + 추천 학습 멘트 + L6 recall vs trigger 분리 표시. ProgressDashboard는 layer별 통과율 시계열 + 전반 진척. Framer Motion 진입 애니메이션
- 의존: C-09, C-10
- 검증: 시각 확인 + 모바일 반응형 + L6 recall/trigger 색상 분리 가독성
- 위험: MEDIUM
- 예상 토큰: 9K
- KPI: 학생이 5초 안에 "어디서 막히는지" 파악

### C-12: Free 일일 풀이 사용량 한도
- 파일: `src/app/api/euler-tutor/route.ts` (요청 진입부), `src/lib/euler/usage-quota.ts` (신규)
- 변경: 무료 사용자 일일 풀이 시작 횟수에 한도 (기본값 10, 환경변수 `EULER_FREE_DAILY_LIMIT`로 조정). usage_events 기반 카운팅. 도달 시 "오늘 한도 도달 — 내일 다시 / 유료 전환" 분기. **답 공개 자체는 무제한** (단, Family/Academy의 `lock_reveal` 토글은 그대로 유효)
- 의존: C-06
- 검증: 동일 사용자 11번째 시작 → 차단 / 답 공개는 한도와 무관하게 항상 허용
- 위험: LOW
- 예상 토큰: 3K
- KPI: 한도 우회 0건, 베타 사용자 평균 일일 사용량 측정

### C-13: Phase C 회귀 + 학원 인터뷰 자료
- 파일: `docs/qa/phase-c-checklist.md` (신규), `docs/sales/academy-pitch.md` (신규, 학원 시범 도입 자료)
- 변경: 28~30번 10문항 정답률 측정 + 학원 1곳 인터뷰 결과 정리 + 7종 진단 카테고리별 동작 점검
- 의존: C-12
- 검증: 정답률 70%+ 달성, 진단 분류 4종 이상 활성화 확인
- 위험: LOW
- 예상 토큰: 4K
- KPI: 학원 1곳 시범 도입 동의

---

## Phase D — SymPy μSvc + Family/Academy + 결제 (2~3주)

> 목표: 계산 환각 0%, 유료 전환 30%+
> KPI: 단순 계산 환각 0%, Student 12,000원 전환 30%+

### D-01: Railway FastAPI + SymPy 프로젝트 부트스트랩
- 파일: `services/euler-sympy/` (신규 디렉터리, `main.py`, `requirements.txt`, `Dockerfile`)
- 변경: FastAPI app + endpoints (`differentiate`, `integrate`, `solve_equation`, `simplify`, `factor`, `series_expand`) + 30초 타임아웃 + 메모리 제한
- 의존: C-12
- 검증: 로컬 `uvicorn main:app` → curl로 각 endpoint 테스트
- 위험: MEDIUM (Python 환경 별도 — Vercel 외부)
- 예상 토큰: 8K
- KPI: 모든 endpoint P95 < 500ms (warm)

### D-02: Railway 배포 + 공유 시크릿 토큰
- 파일: Railway 대시보드 (코드 외)
- 변경: 도메인 발급 + 환경변수 `INTERNAL_TOKEN` 설정
- 의존: D-01
- 검증: 배포된 도메인으로 외부 curl 성공
- 위험: MEDIUM (Railway 장애 시 폴백 필요)
- 예상 토큰: 2K
- KPI: cold start < 5초, warm < 200ms

### D-03: Next에서 SymPy 프록시 라우트
- 파일: `src/app/api/euler-tutor/sympy/route.ts` (신규), `src/lib/euler/sympy-client.ts` (신규)
- 변경: `tool_name` + `args` → Railway 호출, X-Internal-Token 추가, 결과 LaTeX 반환
- 의존: D-02
- 검증: `curl /api/euler-tutor/sympy` 동작
- 위험: LOW
- 예상 토큰: 3K
- KPI: 프록시 오버헤드 < 50ms

### D-04: Anthropic tool calling schema (`src/lib/ai/euler-tools-schema.ts`)
- 파일: `src/lib/ai/euler-tools-schema.ts` (신규)
- 변경: AI SDK v4 `tool()` 정의 6종. 각 tool이 D-03 라우트 호출
- 의존: D-03
- 검증: Reasoner가 미분 문제 풀이 시 자동 tool call 발생
- 위험: MEDIUM
- 예상 토큰: 5K
- KPI: 단순 계산 100% tool 호출

### D-05: Reasoner orchestrator에 tool calling 통합
- 파일: `src/lib/euler/orchestrator.ts`
- 변경: `generateText({ tools, maxSteps: 5 })` 형태로 변경. Reasoner가 자체 LaTeX 생성하지 않고 tool 결과 사용
- 의존: D-04
- 검증: 미적분 28번 풀이 → tool call 5회 이상 발생 + 정답
- 위험: HIGH (기존 BFS 흐름 충돌)
- 예상 토큰: 8K
- KPI: 단순 계산 환각 0%

### D-06: Family 잠금 모드 (lock_reveal)
- 파일: `src/app/euler/family/page.tsx` (신규), `src/app/api/euler-tutor/route.ts` (요청 body)
- 변경: 부모가 자녀 계정에 `lock_reveal=true` 토글. 토글 시 reveal_answer 요청을 서버에서 무시
- 의존: D-05, C-11
- 검증: 부모 토글 → 자녀가 reveal 시도 → 차단
- 위험: MEDIUM (가족 계정 모델 신규)
- 예상 토큰: 6K
- KPI: 우회 0건

### D-07: Academy 교사 대시보드
- 파일: `src/app/admin/academy/page.tsx` (신규), `src/app/api/admin/academy/students/route.ts` (신규)
- 변경: 교사 role → 반 학생들의 약점 리포트 종합 뷰. user_skill_stats group by area
- 의존: D-06
- 검증: 더미 학생 5명 데이터 → 종합 뷰 표시
- 위험: MEDIUM
- 예상 토큰: 8K
- KPI: 교사가 5분 안에 반 약점 파악

### D-08: Toss Payments SDK 통합 + 구독 플로우
- 파일: `src/app/euler/billing/page.tsx` (신규), `src/app/api/billing/toss/*` (신규 라우트들)
- 변경: Free / Student 12,000원 / Family 19,000원 / Academy 학생당 5,000~8,000원 — Toss 정기결제. webhook 처리
- 의존: D-07
- 검증: 테스트 카드로 결제 → 구독 활성화
- 위험: HIGH (결제 보안 + webhook 검증)
- 예상 토큰: 12K
- KPI: 결제 성공률 99%+

### D-09: Free 한도 강화 + 업셀 UI
- 파일: `src/components/euler/UpsellModal.tsx` (신규), `src/lib/euler/usage-quota.ts` (확장)
- 변경: 일일 풀이 한도 도달 시 "12,000원으로 무제한" 모달 + 결제 페이지 링크. 베타 사용 데이터 보고 한도값 조정
- 의존: D-08
- 검증: 한도 도달 시 모달 노출
- 위험: LOW
- 예상 토큰: 4K
- KPI: 모달 노출 → 결제 전환 5%+

### D-10: Phase D 회귀 + 출시 준비
- 파일: `docs/qa/phase-d-checklist.md` (신규)
- 변경: end-to-end 시나리오 (가입 → 풀이 → 결제 → 가족 잠금 → 교사 대시보드)
- 의존: D-09
- 검증: 모든 시나리오 100% 통과
- 위험: LOW
- 예상 토큰: 3K
- KPI: 정식 출시 가능

---

## 법무·운영 (병렬 진행)

### LEG-01: 이용약관 + 개인정보처리방침 초안
- 파일: `src/app/legal/terms/page.tsx`, `src/app/legal/privacy/page.tsx` (신규)
- 변경: 만 14세 미만 부모 동의, 졸업 후 1년 자동 삭제, AI 자체 표현 + 사용자 본인 업로드 명시 — 초안
- 의존: 없음 (Phase A와 병렬)
- 검증: 사용자 검토
- 위험: HIGH (법무 자문 전 단독 사용 금지)
- 예상 토큰: 8K
- KPI: 법무 검토 input 자료 완성

### LEG-02: 법무 자문 의뢰 (1회 30~80만원)
- 파일: 외부 (코드 외)
- 변경: 변호사 1회 검토 — 저작권 + 이용약관 + 청소년 정보 처리
- 의존: LEG-01
- 검증: 검토 의견서 수령
- 위험: HIGH
- 예상 토큰: 0 (외부 비용)
- KPI: 검토 통과 후 라이브 노출

### LEG-03: 부모 동의 절차 (만 14세 미만)
- 파일: `src/app/signup/parental-consent/page.tsx` (신규), `supabase/migrations/20260502_parental_consent.sql` (신규)
- 변경: 가입 시 생년월일 → 14세 미만이면 부모 이메일 인증 추가 단계
- 의존: LEG-02
- 검증: 13세 가입 시도 → 부모 인증 강제
- 위험: MEDIUM
- 예상 토큰: 5K
- KPI: 무동의 가입 0건

### LEG-04: 졸업 후 1년 자동 삭제 cron
- 파일: `src/app/api/cron/anonymize-graduated/route.ts` (신규), `vercel.json` (cron 추가)
- 변경: 졸업일 + 1년 경과한 사용자의 PII 익명화 (이름, 이메일 hash). 풀이 통계는 익명 유지
- 의존: LEG-03
- 검증: 더미 데이터로 cron 수동 실행 → 익명화 확인
- 위험: MEDIUM
- 예상 토큰: 4K
- KPI: 정책 준수

---

## 마일스톤 표

| Phase | 시작 예상 | 종료 예상 | 주요 산출물 | KPI 검증 시점 |
|---|---|---|---|---|
| Phase A | 2026-04-26 | 2026-05-23 (4주) | Critic + 필기 + 베타 50명 | 베타 50명 가입 |
| Phase B | 2026-05-24 | 2026-06-20 (4주) | 도구 라이브러리 30개 + RAG | 코칭 "왜" 포함 90%+ |
| Phase C | 2026-06-21 | 2026-07-11 (3주) | Reasoner BFS + 약점 리포트 | 28~30번 정답률 70% |
| Phase D | 2026-07-12 | 2026-08-01 (3주) | SymPy μSvc + 결제 + 가족/학원 | 단순 계산 환각 0% |
| Phase E | 미정 | — | 사용자 풀이 누적 → RAG 자가 강화 | (장기) |

---

## Token 예산 추정

| Phase | Task 수 | 합산 예상 토큰 |
|---|---|---|
| Phase A | 14 | ~50K |
| Phase B | 16 | ~70K |
| Phase C | 12 | ~60K |
| Phase D | 10 | ~60K |
| 법무·운영 | 4 | ~17K |
| **합계** | **56** | **~257K** |

(실제 코드 작성 + 디버깅 토큰은 별도. 위 수치는 설계+패치 기준)
