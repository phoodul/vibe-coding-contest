# Workflow Progress — Euler Tutor 2.0

## Last Checkpoint
- Time: 2026-05-02 (**14차 세션 시작 — Δ29 평가셋 정답 정합성 감사 + 10건 정정**)
- Phase: **Phase G-06 운영 라이브** + Δ29 (KPI 데이터 정합성 보강)
- Status: 13차 그대로 + **sub-killer-eval.json 정답 10건 정정 (로컬 전용)**
- Git: clean (Δ29 commit 직후 예정)
- vitest: 385/385 PASS (변동 없음 — sub-killer-eval 은 단위 테스트 무관)

## 14차 세션 — Δ29 평가셋 정답 정합성 감사

### 발견
OCR 단계에서 마크다운의 **문제 번호 라벨**(예: `12.`, `14.`)이 일부 어긋남 (3 누락 + 2 중복, 6/7 또는 9/10 페어 swap 등). 평가셋(`sub-killer-eval.json` 50문항)이 마크다운 라벨을 그대로 신뢰했기 때문에 일부 문항의 `expected_answer`가 **다른 문항의 정답**을 들고 있음 → 이전 KPI 측정에서 일부 문항이 항상 오답으로 채점되었을 가능성.

### 진단 인프라 (커밋 대상)
| 파일 | 역할 |
|---|---|
| `scripts/audit-markdown-numbers.ts` | 5년치 마크다운 (2022~2026) 영역별 라벨 시퀀스 추출 → 매트릭스 |
| `docs/qa/markdown-number-audit.md` | 누락·중복·shift 매트릭스 (영역별 라인 매핑 포함) |
| `scripts/identify-true-numbers.ts` | 평가셋 problem_latex 본문을 마크다운 본문에 매칭 → 등장 순서로 진짜 시험 번호 추론 → math-problems.ts 정답표와 비교 |
| `docs/qa/eval-true-number-mapping.json` | 50문항 매핑 결과 (shift_detected / true_test_number / true_answer / mismatch) |
| `scripts/fix-eval-answers.ts` | mismatch 자동 정정 (math-problems.ts 정답을 권위로 삼음) |

### 정정 결과 — 10건 (로컬 sub-killer-eval.json 만 변경, gitignored)

| eval_id | shift | 이전 answer | 정정 answer |
|---|---|---|---|
| 2022-공통-14 | +1 (실제 13번) | 3 | 2 |
| 2023-공통-6 | -1 (실제 7번) | 2 | 4 |
| 2024-공통-6 | -1 (실제 7번) | 4 | 5 |
| 2024-공통-9 | -1 (실제 10번) | 4 | 2 |
| 2024-확률과통계-25 | +1 (실제 24번) | 5 | 4 |
| 2025-공통-6 | -1 (실제 7번) | 5 | 3 |
| 2025-공통-9 | -1 (실제 10번) | 4 | 3 |
| 2026-공통-9 | -1 (실제 10번) | 4 | 3 |
| 2026-확률과통계-25 | +1 (실제 24번) | 2 | 1 |
| 2026-확률과통계-27 | +1 (실제 26번) | 4 | 5 |

재검증: identify-true-numbers.ts 재실행 → **mismatch = 0** (모든 정답 정합).

### unmapped 14건 — 후속 수동 검증 task

본문 텍스트 매칭 자체가 실패한 케이스 (problem_latex 와 마크다운 본문 불일치 가능성). 자동 정정 불가, 수동 비교 후속 작업.

```
2022-공통-9 / 2022-기하-25 / 2022-확률과통계-25 / 2022-확률과통계-27
2023-공통-9 / 2023-기하-25 / 2023-기하-27 / 2023-미적분-24 / 2023-미적분-26
2024-기하-25 / 2024-기하-27
2025-기하-25 / 2025-기하-27
2026-공통-6
```

### 영향 — 이전 KPI 보고서 재해석 필요
- `docs/qa/kpi-killer-g05-report.md`, `kpi-killer-ab-report.md`, `kpi-chain-ab-report.md` 의 sub-killer 채점 일부가 잘못된 expected_answer 로 측정됨
- 다음 측정부터는 정정된 평가셋이 자동 적용 (file-based)
- 단, **다른 평가셋**(`killer-eval.json` 38 / `killer-eval-extra.json` 36 / `geometry-eval.json` 10)은 21/22/28/29/30번대만 들고 있어 sub-killer 영역과 겹치지 않음 → 별도 audit 후속 task

## 13차 세션 핵심 — Trigger 의 본질 + 운영 인프라 완성

### 사용자가 정의한 Trigger 본질
- **Trigger** = "왜 이 문제에서 [이 도구]를 사용해야 하는가?" 의 **답**
- **Tool** = 알려진 사실 + 활용 방법 결합 명제 (예: "두 변+끼인각 → S=½ab sin θ")
- **공식** ≠ Tool. 공식·정리는 도구의 재료. Tool 은 "A이면 B" 형식의 조건부 명제.
- **Trigger 자체 = (Cue, Tool) 매핑 명제** ("X일 때 Y를 한다") + 그 매핑의 인과
- 학습 사명: 수많은 문제로 어렴풋이 익힐 "수학적 감각" 을 LLM 이 명쾌히 언어화 → 적은 문제로도 같은 학습 효과

## 이번 세션 commit 시리즈 (Δ13~Δ28)

| Δ | Commit | 내용 |
|---|---|---|
| Δ13 | `9d59344` | 베타 1차 결함 6종 — 대시보드 카드 / BetaChat 필기·사진 / 표기 가이드 / firstUserText |
| Δ14 | `c84d765` | 학생 막힘 분석 5 차원 (Haiku → schema 1.4) |
| — | `d8d3f7c` | 10차 progress.md |
| — | `2719d1f` | BetaChat ESLint hotfix (Vercel 빌드 fix) |
| Δ15 | `4221108` | 메인 채팅 routes maxDuration 60s/90s → 300s |
| Δ16 | `edf3b48` | 리포트 LLM 5 모듈 Haiku → Sonnet 4.6 + tree-builder LLM 모드 + step fallback |
| Δ17 | `6d088f9` | Tool ⊥ Trigger 엄격 분리 |
| Δ18 | `20bc7b6` | Trigger = (Cue,Tool) 매핑 명제 정석 형식 |
| Δ19 | `d084020` | anchor ④ ∞/∞ 꼴 추가 |
| Δ20 | `956881a` | Trigger 메타인지 — 4 분류 + 자문 + 용어 의존 회피 |
| Δ21 | `21117ec` | "도구 = A이면 B" framework + Trigger = 발화한 A |
| Δ22a | `d66d33e` | user-anchors seed (6 anchor) + RAG fetch |
| Δ22b | `a9202cc` | /legend/triggers 학생 열람 페이지 |
| Δ23 | `c32fd93` | Trigger Auto-Accumulation — LLM 풀이 중 자동 누적 |
| Δ24 | `698578f` | 가드레일 시스템 9 카테고리 + 위기 안내 + 분쟁 증거 DB |
| — | `3fc4567` | 가드레일 위기 메시지 단순화 (기존 CrisisButton 인프라 재사용) |
| — | `c8b90c4` | "혼자가 아닙니다" floating 텍스트 복원 |
| Δ25 | `8548453` | MathText 인라인 KaTeX 렌더 + 풀이 정리 max_tokens 4500 |
| — | `d8c3ea5` | review_beta_application ambiguous id fix |
| — | `82bd3c9` | #variable_conflict use_column directive (RPC 모호성 근본 fix) |
| Δ27 | `2edc752` | /admin 가드 layout + 대시보드 관리자 진입점 + 모드 헤더 |
| — | `d738dda` | list_beta_applications email::text cast |
| — | `1dffc3a` | admin UI dark theme + 사용자 식별 + N수생 옵션 |
| Δ28 | `862db7b` | 베타 30일 만료 정책 — 승인 후 한 달 무료 |

## Δ22 — Trigger 라이브러리 (DB 자산화)

### 6 anchor seed (사용자 직접 가르침)
| Tool ID | Layer | A → B |
|---|---|---|
| USER_triangle_area_two_sides_angle | 3 | 두 변+끼인각 → S=½ab sin θ |
| USER_repeated_figure_recurrence | 4 | 반복 도형 → 닮음비 점화식 |
| USER_two_lines_acute_angle | 4 | 두 직선 기울기 → tan(a-b) |
| USER_inf_inf_rational_limit | 4 | ∞/∞ 꼴 유리함수 극한 → 분모 최고차항 분리 |
| USER_logarithmic_differentiation | 5 | 밑·지수 모두 변수 → 로그 미분법 |
| USER_radical_indef_integral_substitution | 5 | √f(x) 부정적분 → √f(x)=t 또는 f(x)=t 치환 |

Supabase math_tools + math_tool_triggers 적재 완료 (forward + backward embedding 12개 모두 정상).

### Auto-Accumulation 흐름 (Δ23)
1. LLM 풀이 정리 시 structured_trigger { cue_a, tool_b, why_text } 출력
2. accumulateTrigger() 자동 hook
3. 5 단계 dedup: math_tool_triggers ≥0.85 → candidate_triggers ≥0.85 → tool 매칭 → candidate_tools 신규
4. occurrence_count ≥ 5 도달 시 status='pending_review' 자동 승격
5. /admin/candidate-triggers 에서 승인 → 정식 trigger 라이브러리 머지

## Δ24 — 가드레일

### 9 카테고리 + 위기 처리
- 비-수학·메타·욕설·외설·폭력·정치 → 정중한 안내 + 24h 재발 시 경고 1회 + DB 로그
- 자해·자살 위기 → 거부 X. 즉시 기존 CrisisButton ("혼자가 아닙니다") 으로 안내 + crisis_alert 로그
- guardrail_violations 테이블 (분쟁 증거 4000자 보존)

## Δ27 — 관리자 시스템

- `/admin/layout.tsx` Server Component 가드 → 비-admin 자동 /dashboard redirect
- 대시보드 인사말 옆 "🔐 관리자 페이지" 배지 (admin email 만 노출)
- 관리자 모드 헤더 (4 nav: 베타 신청 / 도구·트리거 / 후보 트리거 / 기여자)
- /admin/beta-applications: dark theme 통일 + 이메일 + UUID 명확 노출 + 만료 카운트다운

## Δ28 — 베타 30일 만료

- 승인 시점부터 30일 무료, 이후 자동 trial 강등
- 정원 50명 cap 그대로
- 기존 active 사용자 backfill (오늘 + 30일 grace)
- BetaChat 헤더 ⏳ N일 배지 (≤7일 amber, ≤0 rose)
- 재신청 가능 (재승인 시 30일 리셋)

## 학생 화면 가시성 (Δ25)
- MathText 컴포넌트로 모든 step.summary, solution_summary 5 차원, student_struggle 4 sub-card 에 KaTeX 인라인 렌더
- raw 단축 표기 (`f'(1)`, `e^{2-f(x)}`) 가 자연스러운 수식으로 노출

## DB Migration 5종 적용 (Supabase MCP)
- 20260501_guardrail_violations
- 20260501_review_beta_application_fix (ambiguous id)
- 20260501_beta_applications_variable_conflict (use_column directive)
- 20260501_list_beta_applications_email_cast (auth.users.email::text)
- 20260501_beta_invites_expires_at (30일 만료 정책)

## 운영 모니터링 포인트
- Vercel logs 에서 `[solution-summarizer] parsed = FALLBACK` 검색 → 빈발 시 system prompt 단순화
- candidate_triggers 누적 추이 모니터링 → /admin/candidate-triggers
- guardrail_violations 위반 빈도 → /admin (별도 UI 필요 시 Δ24b)
- 베타 신청 승인 후 30일 만료자 자동 강등 동작 확인

## 다음 세션 후보 (14차)
1. **베타 사용자 모집 확장** — 신청 1건 (현재 pending) 승인 + 카카오·디스코드 등 채널 모집
2. **Δ22c** — RAG fetch 시 retrieved trigger 들이 실제 trigger_motivation 생성 품질에 미친 영향 KPI 측정
3. **Δ24b** — /admin/guardrail 위반 로그 열람·통계 UI
4. **풀이 정리 SSE 청크 스트리밍** (Phase 2 — Δ25 후속)
5. **Trigger 라이브러리 학생 직접 등록 community contribution UI**
6. **만료 임박 사용자 자동 이메일 알림** (≤ 3일 → 안내 메일)
7. **베타 사용자 후기 통계 분석 → 마케팅 자료** (G06-34 완성된 시스템 활용)

## 이전 Checkpoint (10차 — Δ13 + Δ14)

## 10차 세션 — 베타 검증 결함 7건 통합 fix

### Δ13 (commit `9d59344`) — 1차 6 결함
1. 대시보드 진입점 정정 (오일러 튜터 → Legend Tutor / /legend)
2. BetaChat 필기(✏️) + 사진/스크린샷(📸) + Ctrl+V paste 입력 채널
3. EULER_SYSTEM_PROMPT 학생 입력 해석 가이드 (도함수 f' f'' / 오일러수 e /
   절대값 |x| / 구간 (a,b) [a,b])
4. /legend/help 신규 4 섹션 (KaTeX preview)
5. SolutionSummary problem_text: extractLastUserText → extractFirstUserText
   (마지막 user 짧은 계산 단계 → 난이도 1 오판정 fix)

### Δ14 (commit `c84d765`) — 풀이 전 과정 인식
6. types.ts schema 1.4 + StudentStruggleSummary 신규
7. student-struggle-extractor 모듈 (Haiku 1회 ~$0.001~0.002)
   - stuck_step_index / stuck_summary / trigger_quote / ai_hint_quote / resolution
   - formatConversation 헬퍼 (max 12 메시지, 앞 4 + 뒷 8 보존)
8. buildReport.student_conversation? + 9.6 단계 통합
9. build-summary API.body.conversation? + SolutionSummaryButton.conversation prop
10. BetaChat: messages 직접 전달 (Δ13 firstUserText + Δ14 conversation)
11. PerProblemReportCard "🧗 내가 막혔던 부분" 섹션 (violet accent)
12. 단위 테스트 +12 (정상/파싱실패/throw/invalid/빈입력/multimodal/맥스 등)

### 핵심 진단 (Δ14)
- 기존: ToT + AI struggle + trigger ✅, 학생 막힘만 비어있음 (legend_step_stuck_snapshots 빈 테이블 의존)
- 해결: 학생-AI 대화 이력을 직접 분석하는 차원 신규 → R1 카드에 5 sub-card 노출
- 사용자 코칭 가치: "AI 도 어려웠던 순간 (amber)" + "내가 막혔던 부분 (violet)" 양 차원 분리

## 9차 세션 종료 (2026-04-30, commit `086f828`)
- Phase G-06 ✅ + G06-33·34·35 (Δ10·Δ11·Δ12) — Legend Tutor production 라이브
- vitest 374/374 baseline 확립

- 다음 세션 (10차 G-07) 후보:
  1. 베타 사용자 누적 → 리뷰 통계 분석 → 마케팅 자료
  2. Sonnet baseline + Critic 옵션 검증
  3. /api/euler-tutor callTutor 본격 위임
  4. R2 Weekly/Monthly Report 강화
  5. 한글 손글씨 OCR 정확도 진단 (베타 데이터 기반)
  6. 유료 가격 정책 다변화 (Plan A/B/C 시뮬레이션)
  7. 학습지 통합 PoC (Phase I 진입)
- Step (마지막): **G06-35 ✅ Night mode** — 베타 시뮬레이션 발견 결함 4종 통합 fix.
  - **(35a) Manager 난이도 prompt 강화**: `stage1-manager.ts` system 프롬프트 50+줄 — 6/9/12/14/21/29번 정밀 매핑 + few-shot 10개 + (가)(나)(다) 보수적 분류 가이드.
  - **(35b) 선택 튜터 일관성**: `build-summary` body 에 `selected_tutor` (6 enum 검증). BetaChat selectedTutor state → SolutionSummaryButton → API 전파. 풀이 정리도 채팅 튜터로 강제.
  - **(35c) 모델명 숨김**: portraits.ts `persona_desc` 신규 ("수학의 왕자" 등). TutorBadge default = persona_desc. PerProblemReportCard / TutorChoicePrompt / TutorPickerModal raw 모델명 노출 제거.
  - **(35d) ToT + Trigger 정상화**: callModel agentic system prompt 에 `[STEP_KIND]` / `[TRIGGER]` 마커 강제. step-decomposer 마커 1차 + heuristic 2차 + ANN 3차 매칭. threshold 0.7 → 0.5. tree-builder 빈 트리 fallback (s-fallback 노드).
  - 검증: tsc ✅ + vitest **374/374 PASS** (신규 28 + 회귀 0) + next build ✅
- Session: 12차 Night mode (**G-06 + Δ12 ✅**, 다음 단계: 베타 모집 시작 + git push)

## 이전 Checkpoint (G06-34, 2026-04-30 11차 Night)
- Time: 2026-04-30 (11차 세션 Night mode — **G06-34 ✅ 베타 리뷰 시스템 — 5 항목 자율 후기 + 공개 페이지 (Δ11)**)
- Phase: **Phase G-06 ✅ + G06-33 (Δ10) + G06-34 (Δ11)** → 베타 모집 + 출시 마케팅 자산 확보
- Step: **G06-34 ✅ Night mode** — 기존 G06-23 인터뷰 폐기 → 자율 글 후기 시스템.
  - **(a) DB**: `beta_reviews` 테이블 + RLS 4종 (본인 read/insert/update + 공개 anon read) + `get_beta_review_stats()` RPC (anon, public 만 집계)
  - **(b) API**: POST/GET `/api/legend/beta/review` (인증 + access_tier='beta' 가드, 5 항목 검증, upsert) + GET `/api/legend/reviews` (anon 가능, 통계 + 페이지네이션 10건/page, sort=latest|rating)
  - **(c) UI**: `/legend/beta/review` (Server + redirect 가드 + 본인 기존 리뷰 fetch) + `BetaReviewForm` (5 항목 Framer Motion: 별점·튜터 카드·구매 의향 토글·글자수 카운터·공개 토글) + `/legend/reviews` (공개 페이지) + `ReviewStatsHero` + `ReviewsList`
  - **(d) 진입점**: `BetaChat` 헤더 "📝 후기" 버튼 + 메인 홈 student 카드 "베타 후기" 추가
  - **(e) 회귀**: 기존 327 → **344 PASS** (+17 신규 review 테스트, 회귀 0)
  - 검증: tsc ✅ + vitest 344/344 PASS + next build ✅ (`/legend/beta/review` 3.79kB + `/legend/reviews` 2.36kB + API 2 라우트)
- Session: 11차 Night mode (**G06-34 ✅**, 다음 단계: 베타 모집 시작 + 베타 사용자 후기 누적 → 출시 시점 마케팅)

## 이전 Checkpoint (G06-33, 2026-04-29)
- Time: 2026-04-29 (10차 세션 Night mode — **G06-33 ✅ 풀이 정리 진입 + trigger_motivation + LaTeX·typewriter UX (Δ10)**)
- Phase: **Phase G-06 ✅ + G06-33 (Δ10)** → 베타 모집 시작 가능
- Step: **G06-33 ✅ Night mode** — 메인 채팅 (`/legend` BetaChat) UX 결함 4종 통합 fix.
  - **(a) 풀이 정리 진입**: 신규 `/api/legend/build-summary` + `SolutionSummaryButton` + 인라인 `PerProblemReportCard` (마지막 assistant 메시지 직후 자동 노출 가능, 클릭 → routeProblem → callTutor → buildReport → 인라인 R1)
  - **(b) trigger_motivation**: schema 1.2 → 1.3, "💡 떠올린 이유" 차원 신규 (어떤 조건·패턴이 이 도구를 떠올리게 했는가). solution-summarizer 가 primary_trigger 카드 컨텍스트 받아 학생 친화 톤 생성
  - **(c) LaTeX 깜빡임 fix**: rehypeKatex `{ throwOnError:false, errorColor:#888888, strict:'ignore' }` + 홀수 `$` 감지 시 마지막 `$` escape (incomplete inline math 안전)
  - **(d) Typewriter throttle**: 신규 `StreamingMarkdown` 컴포넌트 + useDeferredValue (마지막 assistant + 스트리밍 중일 때만, 종료 시 즉시 동기화)
  - **회귀 fix**: 기존 quota-manager 17건 + access-tier 5건 (Δ9 admin 가드 추가 후 supabase mock auth.getUser 누락) → mock 에 admin 가드 stub 추가
  - 검증: tsc ✅ + vitest **327/327 PASS** (+10 신규 build-summary + 회귀 22건 fix) + next build ✅
- Session: 10차 Night mode (**G-06 + G06-33 ✅**, 다음 단계: **베타 모집 시작 가능** + git push origin main)

## 이전 Checkpoint (G06-30)
- G06-30 ✅ Tier 1 라마누잔 = Gemini 3.1 Pro baseline + Sonnet 429 fallback (Δ8). commit `3048b46`. vitest 252/252.

## 이전 Checkpoint (G06-28)
- G06-28 ✅ R1 풀이 정리 섹션 (Δ7) — schema 1.2 + SolutionSummary 4 필드 + Haiku ~$0.001/문제 + 차원 분리 (정직성 vs 학습 코치). commit `081c5d0`.

## G-06 완결 — 핵심 성과
- **브랜드 변경**: Euler Tutor → Legend Tutor (5 거장 튜터)
- **5-튜터 라우팅**: 라마누잔 (Tier 0+1) / 가우스 / 폰 노이만 / 오일러 / 라이프니츠
- **3-Stage Adaptive Router**: similar_problems 매칭 → Manager Haiku → 라마누잔 probe → escalation 권유
- **R1 Per-Problem Report**: 추론 트리 (Δ4 ToT) + LLM struggle (Δ3) + trigger 확장 + stuck 신호
- **5종 quota 통합 (Δ1)**: 베타 5문제/일·레전드 3회/일·R1 1회/일·주간 1회·월간 1회 + 자격 게이트 (10/20)
- **흉상 이미지 5종**: 오일러·가우스 (기존) + 폰 노이만·라마누잔·라이프니츠 (신규, Wikimedia PD)
- **M8 베타 모집 준비 ✅**: TutorChoicePrompt 격 차별화 (G06-26) + 베타 신청·승인 시스템 + 피드백 동의 필수 (G06-27)
- **M9 R1 UX 개선 ✅**: SolutionSummarySection 풀이 정리 (G06-28, Δ7) — schema 1.2 + Haiku ~$0.001/문제 + 차원 분리 (정직성 vs 학습 코치)
- 26 commits / 28 tasks (G06-23 deferred — 베타 모집 후 별도) / **248 vitest PASS** / 회귀 0

## Next Action (10차 세션 G-07)
1. 베타 사용자 모집 및 G06-23 인터뷰 (5명 1주)
2. `/api/euler-tutor` 의 callTutor 위임 본격 이관 (G-06 보류 사항)
3. R2 Weekly/Monthly Report 강화 (현재는 R2 인프라 재활용만)
4. KPI 38문항 풀 측정 (server-side, R1 persist 검증)
5. 38문항 평가셋 풀 채점 (G06-22 의 3문항 한계 보강)

## 8차 세션 핵심 성과 — KPI 85% 게이트 통과 ⭐

| 모델 · 모드 | killer 38문항 | 기하 10문항 | 게이트 |
|---|---|---|---|
| **Gemini 3.1 Pro agentic** | **89.5%** ⭐⭐⭐ | 10% (quota 초과) | ✅ killer |
| **GPT-5.5 agentic** | **86.8%** ⭐⭐ | **100%** ⭐ | ✅ |
| Sonnet 4.6 agentic | 81.6% | 80% | ❌ |
| Opus 4.7 baseline | 78.9% | 90%, 39초 ⚡ | ❌ |
| Opus 4.7 agentic | 81.6% | 90% | ❌ |

영역별 1위:
- 가형(2017~2021): Sonnet 4.6 agentic 100%
- 공통(2022~2026): Gemini 3.1 Pro agentic 90%
- 미적분(2022~2026): Opus 4.7 baseline 100% / GPT-5.5 agentic 100%
- 기하(2022~2026): GPT-5.5 agentic 100% / Opus 4.7 baseline 90%

## G-05c — Gemini 429 진단 (세션 종료 직전)

원인 확정: **Gemini 3.1 Pro Preview 모델은 paid tier Tier 1 도 250 RPD 강제 한도** (Preview 모델 정책).
- 우리 누적 호출 ~350 → 429 RESOURCE_EXHAUSTED
- 보강 (safetySettings BLOCK_NONE + finishReason 로깅 + agentic trace 보강) 효과 측정 불가 (quota 초과로 0/10)
- 진짜 baseline 정답률은 30~40% (응답 잘림 다수, max_tokens 5000 으로도 일부 절단)
- **9차 세션 결정 필요**: GA 모델 전환 / Vertex AI / 24시간 대기 / 다른 모델 라인업

## 운영 상태 — Production 라이브

| 영역 | 상태 | URL/메모 |
|---|---|---|
| Web (Vercel) | ✅ Live | https://vibe-coding-contest.vercel.app |
| DB (Supabase) | ✅ 17 마이그레이션 (G-04 +3) | wrcpehyvxvgvkdzeiehf |
| 시드 (math_tools) | ✅ 244 도구 / 463 trigger / 926 임베딩 | data/math-tools-seed/ |
| 외부 도구 (Phase F) | ✅ SymPy 25 + Z3 + matplotlib | services/euler-sympy/ |
| 4채널 trigger 입력 (G-04) | ✅ 시드/Haiku/직접/자동 mining | /admin/{math-tools,contributors,candidate-triggers} |
| KPI 평가셋 | ✅ 38 killer + 10 geometry + 45 합성 | user_docs/suneung-math/eval/ + data/ |
| Vercel env | ✅ 19 row 등록 | EULER_*, ANTHROPIC_HAIKU, CRON_SECRET |
| 베타 게이트 | ✅ 동작 검증 | 코드 EULER2026, 50명 cap |
| GEMINI_API_KEY | ✅ paid tier (Preview RPD 250 한도 발견) | .env 등록 |

## Next Action (9차 세션)

1. Gemini 모델 결정 — GA 전환 (gemini-3-pro 등) vs Vertex AI vs 다른 라인업
2. G-06 4-튜터 다변화 (오일러/라이프니츠/가우스/페르마) + 영역별 라우팅 라이브 배포
3. 학생 선호도 측정 인프라 (별점 + tutor_choice 추적)
4. agentic streaming UI (체감 속도 ↑)
5. 베타 사용자 모집 + 운영 모니터링

## 운영 상태 — Production 라이브

| 영역 | 상태 | URL/메모 |
|---|---|---|
| Web (Vercel) | ✅ Live | https://vibe-coding-contest.vercel.app |
| DB (Supabase) | ✅ 14 마이그레이션 적용 | wrcpehyvxvgvkdzeiehf |
| 시드 (math_tools) | ✅ **244 도구 / 463 trigger / 926 임베딩** (avg 1.90) | data/math-tools-seed/ + math-tools-seed.json |
| 운영 도구 추가 | ✅ 웹 UI + API | /admin/math-tools |
| 외부 도구 (Phase F) | ✅ SymPy 25 + Z3 + matplotlib | services/euler-sympy/ |
| Wolfram Alpha | ⏸ 코드 완료 / WOLFRAM_APP_ID 발급 대기 | $5/월 plan |
| KPI 평가셋 | ✅ 45문항 8영역 + cross_check_query | data/kpi-eval-problems.json |
| μSvc (Railway) | ✅ Live | https://vibe-coding-contest-production.up.railway.app |
| Vercel env | ✅ 19 row 등록 (Production + Preview) | EULER_*, ANTHROPIC_HAIKU, CRON_SECRET 포함 |
| 베타 게이트 | ✅ 동작 검증 | 코드 `EULER2026`, 50명 cap |

## Completed
- [x] Phase 1: Research — `docs/research_raw.md`
- [x] Phase 2: Integration — `docs/integrator_report.md`
- [x] Phase 2: Planning — `docs/architecture.md`, `docs/task.md`, `docs/implementation_plan_euler.md`
- [x] Phase 2: 결정 사항 명문화 — `docs/project-decisions.md`
- [x] **Approval Gate 1**: 통합 보고서 승인 완료
- [x] **Approval Gate 2**: task.md 승인 완료

### Phase A (15/15) ✅ — Critic + 필기 + 베타 게이트
### Phase B (16/16) ✅ — pgvector + Manager + Retriever + 검수 어드민
### Phase C (13/13) ✅ — Reasoner BFS + 약점 리포트 + Free 한도
### Phase D (10/10) ✅ — SymPy μSvc + Family/Academy + Toss

### 법무·운영 (3/4)
- ✅ LEG-01: 이용약관 + 개인정보처리방침 초안
- ⏸ LEG-02: 변호사 자문 (외부, 30~80만원 — 베타 검증 후 진행)
- ✅ LEG-03: 만 14세 미만 부모 동의
- ✅ LEG-04: 졸업 + 1년 PII 익명화 cron + profiles 컬럼 보강

### 3차 세션 추가 작업 (2026-04-26)

**B (KPI 평가)**: `5c559bb`
- 합성 10문항 + standalone eval 스크립트 + 검증 문서

**D (Refactor)**: `ad33aef`
- tryParseJson 5곳 중복 단일화 + difficulty-classifier 죽은 코드 삭제
- layer-stats-updater last_failure_at 버그 수정 + parse-image 인증 가드

**A (배포 자동화)**:
- `e545986` Supabase 마이그레이션 14종 적용 + LEG-04 cron 정정 + 배포 런북

**5개 운영 버그 수정 (베타 시작 직전 발견)**:
- `0d0e48f` SW 외부 origin 가로채기 → fetch 실패 (외부 origin 패스)
- `9a06d9d` SymPy worker thread signal ValueError (graceful skip)
- `b702b29` `/auth/login` 404 → `/login` 정정 (5 파일)
- `2db955b` + `8994eb2` `redeem_euler_beta` SQL ambiguous 참조 (status 컬럼)

**Phase E 통합 UX 개선** (사용자 피드백 기반):
- `7a1b822` 채팅+필기 한 세션 통합 + 🆕 새 문제 + 📊 리포트 진입점
- `ae5fee6` + `2da4ebb` 주 1회 리포트 + 자격 게이트 (7일+10문제)
- `37c7db0` Vision LLM (Claude Sonnet 4.6) + 인라인 패널 + OCR 미리보기·수정
- `4503583` OCR 결과 KaTeX 렌더링 (raw 편집 details 분리)
- `7afdf15` 필기/이미지 펼침 시 마지막 메시지 자동 스크롤

총 3차 세션 14 commits, production 운영 인프라 + UX 개선 모두 완료.

### 4차 세션 추가 작업 (2026-04-26)

**시드 영역 확장**: `1909c54`
- `data/math-tools-seed/` 디렉터리 (8 영역 분리 관리)
- middle 35 / common 34 / math1 29 / math2 30 / probability 30 / geometry 25 / calculus_extra 29 + 기존 32 = **244 도구**
- 262 trigger / 524 임베딩 적재 (≈ \$0.001)
- Manager area enum 8단계 + UI MATH_AREAS 8개 카드

**운영 도구 추가 UI**: `859cdca`
- POST/GET `/api/admin/math-tools` (insert + 임베딩 + 롤백)
- `/admin/math-tools` 헤더 + AddToolForm (동적 trigger N개)
- 운영 중 1건씩 점진 추가 채널 완성

→ 3중 확장 채널 (LLM 시드 / 운영자 UI / Reasoner 자동보고) 완성.

## Next Action (사용자 직접 단계)

1. **베타 사용자 풀이 검증** — 본인 + 지인으로 시나리오 재현
2. **베타 50명 모집** — 코드 `EULER2026` 공유
3. **법무 자문 (LEG-02)** — 변호사 1회 30~80만원 (베타 검증 후)
4. **KPI Full 측정** — `pnpm dlx dotenv-cli -e .env -- pnpm dlx tsx scripts/eval-kpi.ts --full`
5. **풀이 누적 7일+10문제 후 리포트 검증** — 주 1회 자동 갱신

## 7차 세션 완료 (2026-04-27 Night, 자율)

### Phase G-03 — chain miss 추적 + Trigger 보강 + KPI A/B 측정

| 커밋 | 내용 |
|---|---|
| e27a1b5 | G03-A: euler_solve_logs 에 chain_termination/depth/used_tools 컬럼 (마이그레이션 + logger + orchestrator + weakness aggregator + report page ChainTerminationChart) |
| 0377124 | G03-B: scripts/augment-triggers.ts (Haiku 자동 trigger 생성) → 9 영역 +201 trigger / 244 도구 / 463 trigger / avg 1.07 → 1.90 |
| 9fd6d8d | G03-C: scripts/eval-kpi.ts --chain 플래그 + 45 문항 A/B 측정 (baseline vs chain) + docs/qa/kpi-chain-ab-report.md |

### KPI A/B 측정 핵심 결과

| 지표 | Baseline | Chain ON | Δ |
|---|---|---|---|
| **난이도 ≥5 정답률** | 9/19 = **47.4%** | 9/19 = **47.4%** | **0pp** |
| 전체 정답률 | 66.7% | 68.9% | +2.2pp (난이도 3 1건 우연) |
| Retriever top-3 | 68.9% | 68.9% | 0pp |
| Retriever top-5 | 77.8% | 75.6% | -2.2pp (오차) |
| Chain 19/45 실행 | — | 19/19 reached, avg depth 2.21 | 100% 종료 성공 |

**결론**: chain 알고리즘은 robust 하나 Sonnet 단발이 이미 강해 정답률 영향 미미.
하지만 chain 시각화의 학생 코칭 가치는 별개 — Phase G-03 누적 데이터로 향후 측정 가능.

향후 개선 후보 (Phase G-04):
- chain min_depth 강제 (depth=1 reached 막기) → ToT 효과 살리기
- chain inject 강화 (참고 → 의무)
- SymPy tool 호출을 chain step 마다 강제 (계산 오류 차단)
- 실제 수능 28~30번 평가셋 확보

## 6차 세션 완료 (2026-04-27 Night, 자율)

### Phase G-02 — Recursive Backward Reasoner + 8-Layer + chain 시각화

| 커밋 | 내용 |
|---|---|
| a6e3d2d | G02-A: Manager 8-Layer 출력 (needs_layer_8/area_layer_5/layer_6_difficulty/layer_7_direction/computational_load) + effectiveDifficulty/shouldRunRecursiveChain |
| b0d682b | G02-B: recursive-reasoner.ts 모듈 + buildSubgoalDecomposePrompt + chainToCoachingText (Self-Ask/ToT/CoVe 학술 근거) |
| 8bc6bf7 | G02-C: orchestrator route.ts 통합 — chainContext systemPrompt inject + StreamData payload (시각화용) |
| d008659 | G02-D: BackwardChain 컴포넌트 + page.tsx 첫 user 메시지 직후 노출 ("선생님은 이렇게 생각했어요") |

### 중학교 시드 학년별 분리

| 커밋 | 내용 |
|---|---|
| 09782c6 | MID-A: middle.json (35) → middle1.json (8) + middle2.json (8) + middle3.json (19) — 한국 2015 개정 교육과정 |
| 2e79ae4 | MID-B: Manager area enum + EULER_TOOLS_BY_AREA + REASONER_THRESHOLD_BY_AREA + KOREAN_AREA_MAP + MATH_AREAS UI 8→10 카드 |

### 핵심 가치
- **방법 찾기 코칭의 본질화**: 난이도 5+ 문제는 chain 카드로 "왜 이렇게 생각했는지" 가시화
- **8-Layer 분리**: insight gap (layer_6) vs computational load 분리 → 정확한 분기
- **중학교 학년별 진입점**: 학습자가 자기 학년 도구 셋만 보도록 격리 (Retriever 결과는 동일하나 UX 분리)

### 사용자 검증 대기
- 어려운 문제 (수능 30번류) 1건 → chain 5 depth 도출 + 시각화 카드 노출 확인
- chain 데이터가 streamData 로 도착하는지 useChat 클라이언트 검증
- middle1/2/3 카드 진입 후 Manager 가 정확히 학년 area 반환하는지

## 5차 세션 완료 (2026-04-26 ~ 27)

### Phase F (외부 도구 통합) — 단일 커밋 + 후속 패치
| 커밋 | 내용 |
|---|---|
| 8787d0b | Phase F 8 task: SymPy 25 + Wolfram + Z3 + matplotlib + cross-check + KPI 45 |
| 72297b1 | Wolfram endpoint Full Results → LLM API 전환 |
| 15cc36d | LLM API 결과 섹션 추출 강화 (17 헤더 인식) |
| bc86d51 | F-09 cross-check 를 orchestrator 통합 + wolfram-query-builder |
| a60453d | Manager area 한글 응답 정규화 + 진단 로그 |
| 8e2436d | Reasoner 임계값 공격적 하향 (학생 신뢰 우선) |
| 4deb4c5 | 429 admin bypass + BFS skip when tools + maxSteps 5→3 |
| 877a735 | 임계값 균형 재조정 (단순 = LLM 단독, calculus 만 3+) |

### Phase G-01 (방법 찾기 코칭 본질 회복)
| 커밋 | 내용 |
|---|---|
| 4f790d0 | 💡 문제 해결 전략 버튼 + EULER_SYSTEM_PROMPT 4단계 가이드 |

### 사용자 작업 (배포·키)
- ✅ Wolfram App ID 발급 + Railway env 등록 + 재배포 검증
- ✅ Vercel env `EULER_CROSSCHECK_ENABLED=true` 등록
- ✅ Manager 정상 동작 확인 (area="math2", reasoner=Y, with-tools 호출)

### 운영 검증
- 단순 정적분 (difficulty 2): LLM 단독 — 빠름
- 어려운 문제 (difficulty 5+): SymPy 검증 + Wolfram cross-check (호출 임계값 5+)
- 모든 영역 area enum 정규화 동작

## 다음 세션 (6차) 첫 Task — Phase G-02 ⭐

**핵심 통찰 (사용자 정립)**:
- "Euler Tutor 의 진짜 매력 = 방법 찾기 코칭, 계산 X"
- "난이도 = 도구 선택의 비자명성 (Layer 6 + Layer 7), 계산 복잡도 X"
- "킬러 문제는 LLM 도 못 푼다 — multi-turn 분해 질문이 정답률 ↑"
- "chain 시각화는 난이도 5+ 만 (단순엔 억지)"

### G-02 구현 (예상 단일 세션)

1. **Recursive Backward Reasoner**
   - `recursiveBackwardChain({problem, conditions, goal, maxDepth=5})`
   - 각 depth: Layer 6 retrieve → Sonnet 분해 질문 → 다음 subgoal
   - 종료: subgoal 이 conditions 와 매칭

2. **Manager 8-Layer 명시화**
   - 출력: `needs_layer_8` / `area_layer_5` / `layer_6_difficulty` / `layer_7_direction` / `computational_load`
   - difficulty 단일 값 → 두 차원 분리 (insight gap + computational load)

3. **chain 시각화 (난이도 5+ 만)**
   - "선생님은 이렇게 생각했어요" 형식
   - 학생 막힘 시 chain 의 다음 노드 1개만 질문으로 노출

4. **학술 근거 적용**
   - ToT (Yao 2023, GPT-4 24-game 4%→74%)
   - Self-Ask (Press 2023)
   - CoVe (Dhuliawala 2023)

### 기타 후보 (Phase G 외)
- 영역별 trigger 보강 (현재 평균 1.1 → 1.5+)
- 베타 사용자 풀이 모니터링 (candidate_tools 채우기)
- 기출문제 DB 영역 확장 (현재 calculus 위주)
- Tier 2 (Phase H): GeoGebra · Lean 4 · Desmos · Manim

## 핵심 산출물 요약

- **마이그레이션 14종 적용** (Supabase MCP 자동)
- **시드 32 도구 / 39 trigger / 78 임베딩** 적재
- **신규 페이지 10종** (/euler/{canvas,beta,report,family,billing}, /admin/{math-tools,academy}, /signup/parental-consent, /legal/{terms,privacy})
- **API 라우트 13종** (인증 가드 일관)
- **lib/euler 14 모듈**
- **컴포넌트**: HandwriteCanvas / InlineHandwritePanel / ThoughtStream / UpsellModal
- **Python μSvc** (services/euler-sympy/, Railway 배포)
- **법무 페이지 3종**
- **KPI 평가 자동화** (10문항 + 4 KPI)
- **배포 런북** (docs/deployment-runbook.md)

## 주요 결정·정책

- **Vision LLM (Claude Sonnet 4.6)** for handwriting OCR (Mathpix 한글 약점 보완)
- **Mathpix** for printed photos/screenshots (인쇄체 강점 유지)
- **주 1회 리포트** (windowDays=7, 첫 풀이 +7일 + 10문제 자격 게이트)
- **베타 50명 cap** + EULER2026 코드
- **LEG-02 자문** — 베타 후 결제 활성화 전 진행
