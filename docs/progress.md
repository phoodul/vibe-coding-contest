# Project Progress — 중고등학생 AI 활용 교육 SW

## Mission

**중고등학생을 위한 거대한 AI 학습 앱**을 만든다. 핵심은 두 가지:

1. **이미 만든 16개 도구를 정교하게 가다듬기** — 학생 12개(영어 회화 / 수학 튜터 / 마인드맵 / 독서 로그 / 단어장 / 학습지 / …) + 교사 4개(수업 준비 / Analytics / …). 각 도구의 학습 효과 · UX · 안정성을 프로덕션 수준으로 끌어올려 "쓸만한 데모"가 아닌 "수많은 학생들이 매일 쓰는 도구"로 만든다.
2. **유료(SaaS) 출시** — 학생 안전(가드레일) · 학습 효과(코칭 품질) · 부모/교사 신뢰(투명한 리포트)를 모든 결정의 우선 기준으로, Next.js 15 + Supabase + Vercel + Anthropic Claude / OpenAI / Gemini 라우팅 위에서 실서비스 수준 운영을 지향한다.

목표는 단순한 "AI를 쓰는 앱"이 아니다. **수많은 학생들이 진짜 배움을 위해 매일 사용하는 큰 AI app** — 신뢰할 수 있고, 효과가 측정되고, 안전하게 운영되는 도구.

## 운영 상태 — Production 라이브

| 영역 | 상태 | 메모 |
|---|---|---|
| Web (Vercel) | ✅ Live | https://vibe-coding-contest.vercel.app (도메인 추후 정정) |
| DB (Supabase) | ✅ 운영 | RLS · 가드레일 · 30일 만료 정책 |
| 인증 | ✅ Google / GitHub / Kakao OAuth | |
| 결제 | ⏸ 보류 (추후 Toss / Stripe 결정) | 베타 검증 후 진입 |
| 분석 | ✅ Vercel Analytics + Supabase usage_events 이중 추적 | |
| 가드레일 | ✅ 9 카테고리 + 위기 상담 ("혼자가 아닙니다") | |
| 베타 게이트 | ✅ 50명 cap + 30일 만료 정책 | |

## 핵심 학습 도구 (학생 12 + 교사 4)

학생용 — 영어 회화 / 수학 튜터 (Legend Tutor 5 페르소나) / 마인드맵 / 독서 로그 / 단어장 / 학습지 등.
교사용 — 수업 준비 / Analytics 등.

상세 구조와 베타 운영 결정 사항은 `docs_legacy/` 의 G-06 산출물(`implementation_plan_g06.md`, `architecture-g06-legend.md`, `task-g06.md` 등) 참조.

## PRD / Roadmap (v1.1, 2026-05-02 작성)

비전·시장 가설·가격·아키텍처·로드맵을 4개 문서로 정리했고, Phase 0(2주, 즉시) 의 16 task 분해까지 완료. 다음 세션은 이 문서들을 토대로 진행.

| 문서 | 역할 | 줄 |
|---|---|---|
| [`docs/business-vision.md`](business-vision.md) | 시장 가설 / 차별화 무기(Trigger 라이브러리=정답 도달 핵심 코칭) / B2B2C 사업 모델 / 메가스터디 역전 시나리오 | 341 |
| [`docs/pricing-strategy.md`](pricing-strategy.md) | Tier 5/15/30만 / 단과 학원 1과목 자리 framing / 토큰 경제 / 부모 결제 마케팅 | 378 |
| [`docs/roadmap.md`](roadmap.md) | Phase 0~6 (입증 → 전 과목 → 수능 추론 → 결제 → 출판사 PoC → 출시 → 확장) | 532 |
| [`docs/architecture-platform.md`](architecture-platform.md) | 16 도구 → 출판사 콘텐츠 플랫폼 진화 / Trigger 라이브러리 일반화 / 모델 라우팅·결제·법무 | 611 |
| [`docs/research_raw.md`](research_raw.md) | 외부 리서치 (수만휘·콴다·뤼튼·EBS·토큰 가격·출판사 협상·청소년 결제) | 568 |
| [`docs/implementation_plan_phase0.md`](implementation_plan_phase0.md) | Phase 0 (2주) 16 task 분해 + 14일 일정표 + 회고 체크리스트 | 445 |

### 핵심 thesis (4 문서 공통)

> **콴다·EBS·뤼튼은 "문제의 답"을 주고, 우리는 "답에 이르는 길"을 가르친다.**
> Trigger 라이브러리(수학에서 검증된 89.5% KPI)를 전 과목으로 일반화 → 일타강사 직관을 LLM 명제로 언어화. 단과 학원 1과목 월 20~30만원 자리에 들어가는 AI 코치 — 사교육비 시장에서 새 카테고리가 아닌 **자리 대체**.

## Phase 0 — 입증 자산화 + GTM 시작 (2주, 즉시)

| 카테고리 | Task 수 | 핵심 |
|---|---|---|
| A. Legend Tutor 보강 | 4 + 1b = 5 (P0-01~04 + P0-01b) | `beta_reviews` 자발 리뷰 모니터링 + chain miss / R1 KaTeX / persona / **area 하드코딩 fix** |
| B. 영어 문법 trigger PoC | 5 (P0-05~09) | `tools.subject_anchor` 도입 / 6 anchor seed / 5문제 ≥ 70% 검증 |
| C. GTM 자료 + 동영상 + 추가 채널 | 7 (P0-10~13d) | 1-pager / 후기 SEO / 텐볼스토리 콜드 메일 / 수만휘 가이드 / 학부모·유튜브 채널 맵 / 시연 영상 1편 / 자동 양산 스크립트 |
| D. 베타 1 → 5명 | 3 (P0-14~16) | active 1명 사용 상태 점검 + 지인 4명 모집 + 온보딩 체크리스트 |

총 **20 task** / 14일. 상세 의존성·일정·검증 KPI: `docs/implementation_plan_phase0.md` 참조.

## 22차 세션 (2026-05-08~09) — Maestro production 검증 + Maestro/Legend 5 phase 분리 + 결제 시스템 ⭐⭐⭐

### 종료 상태 (2026-05-09)
**누적 12 commits**. production 배포 자동. SQL 마이그레이션 2건 사용자 적용 대기.

### 핵심 산출물

#### A. Maestro 안정화 (3 commits)
| commit | 변경 |
|---|---|
| `d2a55e0` | 19차 인계물 user_docs 이동 (1.8MB JSON repo bloat 회피) |
| `c36f645` | 22차 시작 + `docs/qa/maestro-22-checklist.md` 검증 체크리스트 |
| `d6ffd54` | footer cutoff 6→30pt + 과목별 INPUT_PARSING_RULES + placeholder 동적화 |

#### B. Maestro 기능 확장 (2 commits)
| commit | 변경 |
|---|---|
| `966c56c` | `/api/maestro/build-summary` 신규 (generateObject + zod) + `MaestroSolutionSummaryButton` + `MaestroSummaryCard` + `/maestro/[subject]/report` 1차 (localStorage) |
| `30e49a3` | `/maestro/[subject]/triggers` 신설 — `data/seeds/*.json` 시드 4 과목 × 30 도구 카드 (Layer 1~3 색상) |

#### C. Maestro/Legend 5 phase 분리 (5 commits)
| Phase | commit | 변경 |
|---|---|---|
| 1 | `6754b55` | Subject + maestro 페르소나 타입 분리 (`lib/types/subject.ts` + `lib/maestro/types.ts`) |
| 2 | `85c2412` | `/api/maestro/[subject]/tutor` 신설 (285줄 분기 추출) |
| 3 | `36f91aa` | SQL 마이그레이션 — `maestro_tutor_sessions` + `maestro_summaries` (RLS + 인덱스 + view) |
| 4 | `9b12504` | `MaestroChat` wrapper + 4 페이지 import 통일 |
| 5 | `1cda757` | DB insert 활성화 + `/api/maestro/[subject]/report` + 리포트 차트 실 데이터 |

#### D. 결제 시스템 (2 commits) ⭐
| commit | 변경 |
|---|---|
| `febdb7c` | 결제 DB 스키마 (subscriptions·payments·refunds·usage_counters·webhooks_log) + 약관 4종 (terms·privacy·refund·business-info) |
| `99fd491` | 토스페이먼츠 SDK + 6 API endpoints + 100회 quota + `/pricing` + `/billing` + 정기결제·환불 흐름 |

### 사용자 결정 (22차 신규)
1. **가격**: Basic ₩29K (50회) / Standard ₩49K (100회) ⭐ 메인 / Premium ₩99K (무제한). Top-up 100회 ₩14.9K. (이전 Phase 1 가격 유지 + 100회 한도 명시)
2. **1회 정의**: 1 problem (한 세션 = 여러 turn 포함). 라마누잔·부속 도구 무제한.
3. **Maestro/Legend 분리**: 5 phase (타입 → API → SQL → Chat wrapper → DB). 점진 패턴 — Chat 진짜 추출은 다음 세션.
4. **결제 활성화 시점**: 베타 종료 후 env 추가만으로 즉시 활성. 코드·약관·UI 다 준비.
5. **untracked 정리**: 19차 PDF text 추출 산출물 user_docs 이동 (production import 0).

### 사용자 액션 대기 (다음 세션 진입 전)
1. **SQL 마이그레이션 2건 적용** (Supabase Dashboard SQL Editor):
   - `supabase/migrations/20260509_maestro_dedicated_tables.sql` (maestro_*)
   - `supabase/migrations/20260509_payment_system.sql` (결제)
2. **Footer 재추출 + 재업로드** (commit `d6ffd54` 후속):
   ```sh
   EXTRACT_FORCE=true npx tsx scripts/extract-suneung-question-images.ts
   UPLOAD_FORCE=true npx tsx scripts/upload-suneung-questions.ts
   ```
3. **시각 검증** (`docs/qa/maestro-22-checklist.md` 16 페르소나)

### 다음 세션 후보 (23차)
- **결제 활성화 직전 작업**: legend tutor route quota check 통합 / 토스 결제 위젯 client 실제 호출 / `/admin/billing` 환불 검토 / 정기결제 cron
- **Chat 진짜 추출**: BetaChat 1500+ 줄에서 maestro 코드 → MaestroChat 안으로 이동 + BetaChat → LegendChat rename
- **검증 결과 후 Phase C**: Biology / Physics / Chemistry quality 검토
- **Phase 0 GTM**: P0-01b (Legend area 하드코딩 fix), P0-05~09 (영어 문법 trigger PoC), 1-pager / 후기 SEO

---

## (구) 22차 세션 시작 — 검증 단계 (2026-05-08)

### 시작 신호
사용자: `/resume-project` → 21차 fix 사슬 (5 root causes) 마무리 후 production 검증 단계.

### 22차 자동 검증 결과 (코드/manifest/배포 레벨, OAuth 미필요)

| 항목 | 결과 | 근거 |
|---|---|---|
| 최신 production deployment | ✅ READY | `dpl_BK1TRjUhrnf8Bao5NW5B7SfxPXvN` = `2356f1c` (21차 docs commit) — 21차 19 fix commits 모두 build PASS |
| footer-cropped PNG CDN 반영 | ✅ 새 etag | `q-20.png` Last-Modified `2026-05-07 21:54 GMT` (KST 5/8 06:54) → 21차 재업로드가 CDN 에 도달. URL 동일 (`allowOverwrite:true`). |
| manifest 갱신 vs 동일 | ✅ git diff 0 | URL 변경 없으므로 manifest 동일 (mtime 5/8 13:10 = 재실행만, 내용 동일). |
| 모델 alias ID 코드 반영 | ✅ | `route.ts:291-303` — Sonnet `claude-sonnet-4-6` / Opus `claude-opus-4-7` / GPT `gpt-5.5` / Gemini `gemini-3.1-pro-preview` + invalid env 자동 정정 (5 mapping). |
| portrait 자산 일관성 | ✅ 22장 모두 존재 | `public/*-portrait.jpg` × 22 (16 maestro + Legend 5 + Socrates) ↔ `portraits.ts` `src` 매핑 일치. |
| portraits.ts label ↔ 코드 호출 | ✅ | `model_short` 라벨 (Sonnet 4.6 / Gemini 3.1 Pro / Opus 4.7 / GPT-5.5) ↔ 실제 alias 호출 ID 동기. |

### 22차 인계물 정리 (commit `d2a55e0`)

19차 untracked 산출물 처리 — 사용자 결정 = user_docs 이동:

| 변경 | 이유 |
|---|---|
| D `src/lib/data/suneung-problem-texts-science.json` (1.8MB) | production import 0 + cMap 일부 한국어 깨짐. repo bloat 회피. |
| → `user_docs/suneung_science/problem-texts-extract.json` (gitignored) | 향후 LLM context augmentation 실험 시 로컬 활용. |
| A `scripts/extract-suneung-question-texts.ts` (9KB) | 19차 작성. OUT_PATH 를 user_docs 로 변경 + 헤더 주석 갱신. |

향후 Upstage parse 또는 PDF text layer 보강 통합 시 user_docs 산출물 재사용. `parse-suneung-upstage.ts` 는 OUT_PATH 미변경 (현재 src/lib/data/ 가리킴) — 다음 실행 시 재생성 + 다시 결정.

### 22차 사용자 위임 (OAuth 시각 검증)

`docs/qa/maestro-22-checklist.md` 작성. 16 페르소나 × 4 maestro 페이지 × footer/streaming/visible-error 검증. 결과를 progress.md 22차 검증 섹션에 표 형식으로 기록.

핵심 미검증 (21차 종료 시 ⏳):
- 허블 (Opus 4.7) — alias `claude-opus-4-7` 적용 후 처음 시도
- /biology /physics /chemistry 12 페르소나 — 한 번도 실사용 검증 X (Earth Science 패턴 회귀 점검)
- mhchem `\ce{}` 렌더 (chemistry 응답 시)

### 22차 상태 요약

- ✅ 자동 검증 6/6 PASS — production 배포 + manifest + 모델 ID + portrait 모두 일관
- ✅ 19차 인계물 정리 commit `d2a55e0`
- ✅ 사용자 검증 체크리스트 `docs/qa/maestro-22-checklist.md` 작성
- ⏳ 사용자 본인 계정 시각 검증 (16 페르소나 클릭) — 위임
- ⏳ Pro plan bandwidth 모니터링 (1TB/월 한도)

### 다음 진행 (사용자 액션 후)

1. 검증 FAIL 발견 시 → 23차 fix
2. 모든 페르소나 PASS 시 → Phase C (Biology PoC quality 검토) 또는 Phase 0 P0-01b (Legend area 하드코딩 fix) 로 이동
3. maestro trial 분기 결정 (현재 인증 redirect = dashboard "로그인 없이 체험 가능" 문구 충돌)

---

## 21차 세션 (2026-05-07~08) — Maestro multimodal 디버깅 사슬 ⭐ 해결

### 시작 신호
사용자: "여전히 가이드는 전혀 없어. 튜터가 아무런 답도 하지 않아."
**5가지 독립 root causes 가 동시에 차단막** → 하나씩 깨야 다음 진단이 보이는 구조.
누적 19 fix commits (`407a6cb` ~ `0db1844`).

### 진짜 Root Causes (해결 순서)

| # | 원인 | 진단 단서 | 해결 |
|---|---|---|---|
| 1 | useChat v4 의 `body`/`data`/`experimental_attachments` 옵션 production server 미도달 | logs 의 `marker=Y` vs `data.imageUrl=N` | message content marker 패턴: `[__MAESTRO_IMG__]URL[/__MAESTRO_IMG__]` (`d737b15`) |
| 2 | `GEMINI_MODEL_ID = 'gemini-3-1-pro'` invalid (Vercel env 사용자 등록 값) | visible error: `models/gemini-3-1-pro is not found` | Vercel env 직접 변경 (`gemini-3.1-pro-preview`) + 코드 자동 정정 (`c283033`) |
| 3 | `GEMINI_API_KEY` production env 누락 | visible error: `AI_LoadAPIKeyError: GOOGLE_GENERATIVE_AI_API_KEY missing` | 사용자 Vercel env 추가 (`8ab08d7`) |
| 4 | Anthropic model ID dated suffix invalid (`claude-opus-4-7-20260201`) | visible error: `model: claude-opus-4-7-20260201` | alias ID (`claude-opus-4-7`) — system 안내된 정확한 형식 (`f0a1ee2`) |
| 5 | **Vercel Hobby plan Blob bandwidth 한도 초과 → store 차단** (진짜 결정타) | "Your store is blocked / Access resumes on 2026-06-06" | **Pro plan upgrade** ($20/월) — 즉시 access 복구 |

### 결정적 단서들 (사용자가 짚어준 사실)

1. **"Legend Tutor 가 정상 작동하는데 같은 모델"** → 사용자가 model ID 추측 fix 거부. 다시 비교 분석 시작.
   진실: Legend의 가우스는 라벨만 "Gemini 3.1 Pro", **실제로는 OpenAI 호출** (`portraits.ts` `model_short` ≠ 코드 동작). Maestro 가 **첫 진짜 Gemini provider 사용 코드**.
2. **"낡은 모델 X. 최신 모델만"** → stable 강등 (v5 `93b9342`) revert. 사용자 의지 존중.
3. **"Sonnet 인물은 사용 X"** → Gemini→Sonnet auto-fallback (v9) revert. 최고 모델 정책.
4. **"GEMINI_API_KEY 가 .env 가 아니라 .env 에 있어"** → `.env`는 git ignore + Vercel 미인식. dashboard 직접 등록 필요.
5. **"`Your store is blocked` 메시지가 떠"** → Vercel UI 직접 확인이 진짜 root cause 즉시 노출. 추측 사슬 끊음.
6. **"Hobby plan usage limits reached. Access resumes on 2026-06-06"** → bandwidth 초과. Pro upgrade 결정.

### 부수 fix (production 가치 영구 유지)

| Commit | 내용 | 이유 |
|---|---|---|
| `7513042` | visible error stream (`0:"..."` chunk) | useChat 의 error chunk(`3:"..."`) 는 onError 만 가서 UI 미노출. text chunk 로 표시 |
| `ed6be8d` | Gemini `safetySettings: BLOCK_NONE × 4` | 수능 과학 (방사성·핵분열·면역·항원) false positive 차단 방지. Legend `callGemini` 동일 |
| `51ebd7b` | Vercel Blob 공식 SDK `get()` 사용 | context7 `/vercel/storage` docs 검증. raw fetch 차단 우회 |
| `ed6be8d` | base64 inline image part | 모든 vision 모델 (Sonnet/Opus/GPT/Gemini) 가장 안정 형식 |
| `78eea54` | image-less fallback (visible error throw 제거) | store 또 차단 시 학생 빈 응답 X. LLM 안내 텍스트로 대체 |
| `0db1844` | streamText 복귀 (generateText 폐기) | 첫 token 즉시 stream 송출. 사용자 무진행 체감 ↓ |

### 핵심 교훈

1. **추측 fix 사슬 회피** — 사용자가 "검색해서 다시 수정해" 라고 짚어준 시점에 `context7` 공식 docs 검증 → SDK get() 패턴 확보. 추측 fix 그만 하고 docs 검증해야 정확한 진단.
2. **production logs + Vercel UI 조합 진단** — Vercel Functions stream runtime 의 console capture 가 truncate 됨. logs 만으로는 fail 사유 진단 불가. **사용자가 화면에서 직접 본 visible error / browser URL 직접 테스트** 가 결정타.
3. **plan limits 가 silent hang 의 1순위 의심** — 16-fix 사슬 중 11개가 코드 fix 였는데 진짜 원인은 **Hobby plan bandwidth 초과**. plan/quota 점검을 첫 단계에 추가.
4. **Legend 비교 무용** — Legend(math)는 Gemini 라벨만, 실제는 OpenAI. maestro 가 **첫 진짜 Gemini provider 사용**. 동일 코드 베이스 안에서도 분기마다 실제 호출 모델이 다를 수 있음.
5. **useChat v4 의 외부 field 머지 신뢰 X** — body / data / experimental_attachments 모두 production fetch body 미머지. **message content 자체에 marker 포함이 가장 확실**.

### 21차 세션 끝 상태

- ✅ 갈릴레이 (Gemini 3.1 Pro) image vision + 가이드 응답 정상
- ✅ 세이건 (GPT-5.5) image vision 작동 (사용자 확인)
- ⏳ 허블 (Opus 4.7) — model ID `claude-opus-4-7` alias 적용 후 미검증
- ❌ 베게너 (Sonnet 4.6) — client disabled 유지 (사용자 정책)
- ✅ Vercel Pro plan — Blob bandwidth 1TB/월 + 모든 maestro storage 여유
- ✅ footer cutoff 1598 PNG 재추출 + 재업로드 완료 (background task `bjxm5vzn4`)

### 다음 진행 (22차)

1. footer 잘라낸 1598 PNG production 검증 (image preview + 이미지 안에 footer 잘림 확인)
2. 허블/멘델/아인슈타인/라부아지에/파스퇴르/페르미/마리퀴리 등 다른 인물 작동 검증
3. Pro plan bandwidth 모니터링 (1TB/월 한도 추적)
4. 베타 테스터 모집 시 maestro 이용 가이드 작성

---

## 20차 세션 진행 중 (2026-05-07) — production smoke + 메타데이터 fix

19차 종료 후 첫 production smoke 검증. 4 maestro 페이지·페르소나·system-prompt·portrait 코드 일관성 검증과 메타데이터 결함 fix.

### 검증 결과

| 영역 | 결과 | 메모 |
|---|---|---|
| Landing (/) | ✅ PASS | 4 maestro 카드 + 17 학생 도구 카드 + 콘솔 에러 0 |
| Dashboard (/dashboard) | ✅ PASS | 17 카드, 4 maestro URL 정상, 콘솔 에러 0 |
| /earth-science | ⚠️ 인증 게이트 | 비로그인 → /login redirect (의도). 코드 검증 PASS. |
| /biology | ⚠️ 인증 게이트 | 동일. metadata title **결함 발견** → fix |
| /physics | ⚠️ 인증 게이트 | 동일. metadata title **결함 발견** → fix |
| /chemistry | ⚠️ 인증 게이트 | 동일. metadata title **결함 발견** → fix |
| 페르소나 portrait jpg 22장 | ✅ 모두 존재 | public/*-portrait.jpg |
| lib/maestro system-prompts | ✅ 4 과목 PERSONAS 모두 활성화 | NOTATION_STANDARDS 단원별 표기 (`\ce{}`/`\vec{F}`/`\text{AaBb}`) |

### 메타데이터 결함 (즉시 fix)

3 maestro 페이지의 `metadata.title` 이 **모두 "베게너·갈릴레이·허블·세이건"** (Earth Science 페르소나) 로 잘못 적힘 — 복붙 오류:

| 파일 | Before | After |
|---|---|---|
| `src/app/physics/page.tsx` | "Physics Maestro — 베게너·갈릴레이·허블·세이건" | **"Physics Maestro — 페르미·아인슈타인·파인만·뉴턴"** |
| `src/app/biology/page.tsx` | "Biology Maestro — 베게너·갈릴레이·허블·세이건" | **"Biology Maestro — 파스퇴르·멘델·왓슨·다윈"** |
| `src/app/chemistry/page.tsx` | "Chemistry Maestro — 베게너·갈릴레이·허블·세이건" | **"Chemistry Maestro — 마리 퀴리·라부아지에·폴링·멘델레예프"** |

영향: SEO + 카카오/슬랙 등 OG 카드 + 브라우저 탭 제목에서 잘못된 페르소나명 노출.

### 도구 카운트 mismatch (fix)

학생 17 + 교사 4 = **21 도구**. landing/guide 의 hero "16개 도구" → "21개 도구" 갱신.

| 파일 | Before | After |
|---|---|---|
| `src/app/page.tsx:574` | "16개 도구를 무료로 사용하세요" | **"21개 도구를 무료로 사용하세요"** |
| `src/app/guide/page.tsx:100` | "16개 도구를 한눈에" | **"21개 도구를 한눈에"** |

### 비검증 항목 (사용자 액션)

production OAuth 로그인이 자동화 환경에서 어려워 다음 항목은 **본인 계정** 사용 검증으로 위임:

1. **로그인 후 4 maestro 페이지 진입** — 페르소나 4 칩 노출 + 기본 페르소나 (Sonnet) 선택
2. **수능 번호 클릭 → multimodal 자동 첨부** (4e793b5 / 251221f / ed69e50 fix 반영 확인)
3. **mhchem `\ce{}` 렌더** (chemistry maestro에서 화학식 답변 시)
4. **Vision LLM 도표 분석** (도표 포함 문제 풀이 시)
5. **A5 SQL 마이그레이션 적용 여부** — `legend_*` 7 테이블에 subject 컬럼 존재 확인

### UX 의문 (논의 필요)

- **maestro trial 분기 누락**: Legend 는 비로그인 시 trial 분기로 사용 가능, 4 maestro 는 인증 필수 redirect. dashboard "로그인 없이 체험 가능" 안내와 충돌. → 의도된 설계인지 / trial 분기 추가 필요한지 결정 대기.
- **Landing CountUp**: 초기 `0` 표시는 viewport 진입 시점에 카운트업 시작 (정상). `prefers-reduced-motion` 사용자에게 0 표기 그대로 노출 가능성 (별도 fix 후순위).

### 다음 진행 (20차)

1. 본 변경 commit + push (회귀 0)
2. `task.md` Phase B/C 진행 상태 갱신 (Earth Science 페이지 + 페르소나 + system-prompt 모두 ✅)
3. 사용자 본인 계정으로 비검증 항목 5건 점검
4. trial 분기 추가 / 인증 redirect UX 결정

### ⭐⭐ 두 번째 결정타 (commit 407a6cb 후속) — 사용자 재신고 "이미지도 안 올라오고 가이드도 안 됨"

`experimental_attachments` 옵션은 v4의 `handleSubmit`에는 안정 지원되지만, `append`에서는 직렬화 누락 케이스가 있어 production에서 LLM까지 image가 도달하지 않았음.

**최종 fix — server 직접 합성 패턴**:

| 파일 | 변경 |
|---|---|
| `BetaChat.tsx` | `append(msg, { body: { attached_image_url: imageUrl } })` — useChat의 body merge로 server에 직접 URL 전달. UI: `attachedByMsgId` state로 message id 별 image preview 카드 추가. |
| `route.ts` (maestro 분기) | `attached_image_url` body 추출 → 마지막 user message의 `content`를 `[{type:'image', image: url}, {type:'text', text}]` 로 server에서 직접 합성. `convertToCoreMessages` import 제거. |
| `route.ts` | 첫 user 메시지에서 `[2026학년도 수능 지구과학 I 20번]` 정규식 파싱 → `exam_meta` 추출 → `buildMaestroSystemPrompt`에 전달. |
| `system-prompts.ts` | `examNote` 강화: "첨부 이미지를 직접 읽고 분석" + "첫 응답 형식 4단계" (페르소나 인사 → 자료 정리 → 1단계 시작 → 사고 유도형 질문 마무리). first-turn echo 방지. |

**왜 수학(Legend)은 되고 과학(Maestro)은 안 됐나** (사용자 의문):
- Legend 분기 = text only (manager + retriever + chain + streamText). attachment 없음 → useChat의 string content만 사용 → 정상 작동.
- Maestro 분기 = image attachment 필수. useChat v4의 multimodal API (`experimental_attachments`/array content)가 production에서 일관되게 LLM까지 전달되지 않음.

**우회 패턴이 안전한 이유**:
- useChat은 `content: string`만 다룸 → JSON 직렬화 안전
- attachment URL은 별도 body field → useChat이 변경 없이 그대로 server로 전송
- server에서 CoreMessage 형식의 vision part로 합성 → AI SDK v4 streamText의 표준 multimodal 입력
- 모델 계약(Sonnet 4.6 / Gemini 3.1 Pro / Opus 4.7 / GPT-5.5 vision)에 모두 호환

---

### ⭐ 결정타 fix — multimodal 가이드 누락 근본 원인 (commit 4cffb43 직후)

**사용자 보고**: "문제를 띄워도 아무런 가이드가 없어"

**근본 원인** (AI SDK v4 패턴 미준수):

기존 `BetaChat.handleSelectScienceExam` 가 multimodal image 를 다음과 같이 보냈음:
```ts
const contentParts = [{ type: 'image', image: imageUrl }, { type: 'text', text }];
await append({ role: 'user', content: contentParts as unknown as string });
```

`useChat` v4 의 `Message.content` 는 **string 만** 받음. array 를 string cast 로 박으면
JSON.stringify 직렬화로 raw JSON 텍스트가 user message 로 전달 → LLM 이 시험지를 못 보고
일반 텍스트 ("이 문제를 풀어주세요") 만 인식 → 코칭 시작 트리거 누락.

**v4 표준 multimodal 패턴** (AI SDK docs 검증):
- client: `append(msg, { experimental_attachments: [{ name, contentType, url }] })`
- server: `convertToCoreMessages(messages)` 로 attachment → CoreMessage vision part 자동 변환

**Fix (2 파일)**:

| 파일 | 변경 |
|---|---|
| `src/components/legend/BetaChat.tsx` | `handleSelectScienceExam` 의 hack 제거, `experimental_attachments` 옵션 사용 |
| `src/app/api/legend/tutor/route.ts` | `convertToCoreMessages` import + maestro 분기에서 변환 후 streamText 에 전달. 진단 logging 추가 (`hasImage`). |

**영향**: 4 maestro 의 수능 기출 번호 클릭 → 시험지 페이지 이미지가 vision LLM 에 도달
→ 페르소나·5단계 cue·가이드 정상 응답.

**검증**: typecheck 통과. production 검증은 사용자 본인 계정 필요.

### 추가 fix — 영역 PNG footer 잘라내기

**사용자 보고**: 영역 PNG 하단에 `*확인 사항 / 답안지의 해당란... / 한국교육과정평가원에 있습니다` footer 가 포함되어 LLM 가이드에 노이즈.

**원인**: `extract-suneung-question-images.ts` 의 `buildRects` 가 페이지 마지막 문제 영역을 `pageHeight - 30` (하단 30pt 여백) 까지 자름 → KICE 시험지 footer 가 그 안에 포함.

**Fix**:
- `extract-suneung-question-images.ts` — `extractFooterY()` 신설. KICE 표준 footer 키워드 4개 (`확인 사항` / `답안지의 해당란` / `한국교육과정평가원` / `이 문제지에 관한`) detect → 가장 위쪽 yFromBottom 를 cutoff. buildRects 에 footerYByPage 전달, 페이지 마지막 문제만 적용. 안전장치: footer 가 페이지 절반 위에 있으면 (= mis-detect) 무시하고 fallback 사용.
- `EXTRACT_FORCE=true` env — 기존 PNG 무시하고 재추출.
- `upload-suneung-questions.ts` — `UPLOAD_FORCE=true` env 추가. 기존 manifest 무시. blob 의 `allowOverwrite: true` 로 같은 pathname 덮어쓰기 (URL 변경 없음).

**사용자 액션 (재추출 + 재업로드)**:
```sh
EXTRACT_FORCE=true npx tsx scripts/extract-suneung-question-images.ts
UPLOAD_FORCE=true npx tsx scripts/upload-suneung-questions.ts
```
- 추출: 80 PDF × 20 문제 = 1600 PNG / ~30 분
- 업로드: 1598 PNG × ~3 초 / ~80 분
- URL 변경 없음 → manifest 갱신만 하면 production 즉시 반영. CDN 캐시는 자연 만료 또는 수동 invalidation.

### 19차에서 untracked 인계물

- `scripts/extract-suneung-question-texts.ts` — 19차 (2026-05-07) 작성. PDF text layer → 문제 번호별 본문/보기 분리 → `src/lib/data/suneung-problem-texts-science.json`. 본 세션에서는 사용하지 않음. 다음 진행 시 입출력 검증 후 commit 또는 user_docs 로 이동.

---

## 19차 세션 종료 (2026-05-06~07) — Maestro 4 과목 fully functional ⭐

### 누적 25 commits / 핵심 성과
- ✅ **4 maestro 페이지 신설** — Earth Science / Biology / Physics / Chemistry
- ✅ **16 인물 페르소나 + 4 모델 매핑** (Sonnet/Gemini/Opus/GPT-5.5)
- ✅ **1598 수능 정답 DB** (4 과목 × Ⅰ/Ⅱ × 10년 = 1600, 결측 2건 = 출제 오류 자동 차단)
- ✅ **320 PDF 페이지 → Vercel Blob 업로드** (Seoul, Public, 16분, 320 entry)
- ✅ **multimodal 자동 첨부** (학생이 번호 클릭 → 시험지 페이지 자동 첨부)
- ✅ **80 PDF 정규화** (4 과목 × Ⅰ/Ⅱ × 10년)
- ✅ **mhchem 활성화** (`\ce{}` 화학식 렌더)
- ✅ **Vision LLM 인프라** (FigureKind 9종 + 도표 5단계)
- ✅ **120 trigger 도구 시드** — 4 maestro × 6 anchor × 5 도구 / 240+ 명제
  - Earth Science 30 (지권·지구사·대기·해양·상호작용·천체)
  - Biology 30 (유전·분자·생리·진화·생태·생명공학)
  - Physics 30 (역학·전자기·파동·열·현대·핵)
  - Chemistry 30 (원자·결합·반응·평형·산화환원·유기)

### 인물 매핑 (모든 maestro 4 모델 동일)
| 과목 | 1번 (Sonnet, 기본) | 2번 (Gemini) | 3번 (Opus) | 4번 (GPT-5.5) |
|---|---|---|---|---|
| Earth Science | 베게너 | 갈릴레이 | 허블 | 세이건 |
| Biology | **파스퇴르** | 멘델 | 왓슨 | 다윈 |
| Physics | **페르미** | 아인슈타인 | 파인만 | 뉴턴 |
| Chemistry | **마리 퀴리** | 라부아지에 | 폴링 | 멘델레예프 |

### Production 상태
- https://easyedu.ai/dashboard — 학생 도구 13 → **17개**
- 4 maestro URL: `/earth-science` `/physics` `/chemistry` `/biology`
- BetaChat 모든 기능 그대로 (HandwriteCanvas / 사진 / Ctrl+V / 일 한도 / 입력 가이드)
- 후기 link 만 maestro 에서 hide (베타테스트 X)

### 19차 사용자 액션
- ✅ Vercel Blob store 생성 (Seoul, Public)
- ✅ `vercel env pull .env.local` (BLOB_READ_WRITE_TOKEN)
- ✅ answers.xlsx 직접 입력 (1598 정답 / 결측 2 = 출제 오류)
- ⏳ A5 SQL 마이그레이션 (`20260506_maestro_subject_columns.sql`) Supabase Dashboard 적용

### 남은 작업 (Phase D / 4+)
- Biology/Physics/Chemistry trigger 시드 (Earth Science 패턴 확장)
- 문제 번호 ↔ PDF 페이지 정밀 매핑 (OCR)
- maestro 별 trigger·report 페이지 분리 (현재 Legend 통합)
- production smoke 검증

---

## 19차 세션 진행 중 (2026-05-06) — Maestro 4 과목 신설 ⭐

사용자 요청: Legend Tutor 와 동일한 패턴으로 **Physics / Chemistry / Biology / Earth Science Maestro** 4 도구 추가. 향후 Korean (세종·정약용·이이) + English (셰익스피어·처칠·촘스키) 까지 7 maestro 우주.

### 핵심 결정 (2026-05-06)
- 인프라 일반화: `lib/legend` → `lib/maestro` (Legend = `subject='math'` adapter)
- PoC 순서: **Earth Science → Biology → Physics → Chemistry**
- 페르소나 3인 통일 (math 만 5인 유지)
- URL: `/physics`, `/chemistry`, `/biology`, `/earth-science` (단독·짧음)
- Biology = 다윈·멘델·왓슨 / Earth Science = 베게너·갈릴레이·허블
- 입력 = 캡쳐+필기 (Legend HandwriteCanvas 재사용) — PDF 일괄 OCR 후순위
- 표·그림 분석 강화 = Vision LLM (Gauss 듀얼 튜터 패턴 추출)
- KaTeX mhchem 활성화 (`\ce{}` `<=>`)

### 진행
- ✅ `docs/implementation_plan_maestro.md` 작성 (Phase A 11 task / B 5 / C 15 / D 3 = 33 task / 3.5주)
- ✅ `docs/task.md` 작성
- ✅ memory 3 entry 추가 (`project_maestro_4subjects`, `project_korean_maestro`, `project_english_maestro`)
- ✅ Phase A 핵심 인프라 4 commits push (A6/A7/A10 은 Phase B 진입 시 통합):
  - `113e653` A1a-c — Subject type / PERSONAS_BY_SUBJECT / SUBJECT_LABEL_KO / URL slug
  - `51d57eb` A1d + A2 + A5 — trigger-accumulator subject 매개변수 + lib/maestro adapter + DB 마이그레이션 SQL
  - `59e2f2d` A8 — KaTeX mhchem 활성화 + 7 회귀 테스트
  - `1dadcc0` A9 — Vision LLM 인프라 골격 (FigureKind 9종 + 도표 5단계 + Subject 별 hints)
- 🔜 Phase B 시작점 — Earth Science PoC (`/earth-science` 페이지 · 베게너·갈릴레이·허블 페르소나 · 자체 교과서 trigger 시드 추출)

### ⚠️ 사용자 액션 필요
- **A5 SQL 마이그레이션** (`supabase/migrations/20260506_maestro_subject_columns.sql`) production 적용 — Supabase Dashboard SQL Editor 에서 직접 실행 (legend_* 7 테이블에 subject 컬럼 추가, 회귀 0)

### 푸시 누락 6 commits (origin/main) → 2026-05-06 push 완료 (`075620a..eae18c2`)
지구과학 production 미반영 문제 = origin/main 미푸시였음. 푸시 후 Vercel 자동 배포.

---

## 18차 세션 종료 (2026-05-06) — 5 commits / LaTeX fix + 수능 12건 + 지구과학Ⅰ 자체 제작 200p

### 누적 commit 5건 (`cec2afc` ~ `60dd2c4`)

| # | Hash | 영역 | 핵심 |
|---|---|---|---|
| 1 | `cec2afc` | fix(legend) | StreamingMarkdown LaTeX 정규화 + 수능 12건 자동 추출 |
| 2 | `c0b3824` | feat(textbook) | 지구과학Ⅰ Ch1 + spec docs |
| 3 | `b23f63e` | feat(textbook) | 지구과학Ⅰ Ch2~5 + structured 5개 + UI 통합 |
| 4 | `3564dc6` | docs | progress.md 18차 갱신 |
| 5 | `60dd2c4` | docs | manual linking 활성화 완료 메모 |


### 사용자 신고 두 건 fix (commit `cec2afc`)

**1. Legend Tutor 채팅 LaTeX 렌더 결함**
- 베타 사용자가 스크린샷 업로드 시 AI 응답의 `\(x^2\)` / `\[\sum\]` 가 채팅창에 raw 텍스트 노출.
- 원인: `StreamingMarkdown` 의 `remarkMath` 가 `$..$` `$$..$$` 만 지원하고 `\(..\)` `\[..\]` 미지원.
- Fix: `normalizeMathDelimiters()` 신설 — `\(..\)` → `$..$`, `\[..\]` → `$$..$$` 사전 정규화.
- vitest 12건 신규 (math delimiter normalization), 기존 35건 보존.

**2. 수능 기출 problem-texts.json 누락 18건**
- raw md (`user_docs/suneung-math/parsed/*.md`) 분석 → 12건은 본문에 살아 있음, 6건은 mathpix 추출 자체 누락.
- `scripts/extract-suneung-missing.ts` 작성 → 12건 자동 추출 → JSON 추가.
- **잔존 6건** (PDF 페이지 자체 누락, 수동 입력 필요): `2018_가형_4`, `2020_가형_26`, `2022_공통_3`, `2023_공통_3`, `2025_공통_3`, `2026_공통_4`.

### 지구과학Ⅰ 자체 제작 교과서 (commits `c0b3824`, `b23f63e`)

사용자 night mode 결정 — 4번째 자체 제작 과목 = 지구과학Ⅰ. 헤밍웨이 v2 / 생활과 윤리 / 생명과학Ⅰ 패턴 재사용.

**작업 분량**:
- Spec docs: `docs/earth-science-textbook-spec.md` (5 chapter / 25 section / 명세 200 content)
- Textbook: 5 파일 / 약 365KB (ch1 직접 + ch3 직접, ch2/4/5 implementer)
  - Ch1 지권의 변동 (40 content / 66KB)
  - Ch2 지구의 역사 (40 content / 80KB)
  - Ch3 대기와 해양의 변화 (35 content / 62KB) — 직접 작성
  - Ch4 대기와 해양의 상호작용 (41 content / 73KB)
  - Ch5 별과 우주 (40 content / 83KB)
- Structured (마인드맵): 5 파일 / 약 387KB (모두 implementer)
- 통합 `earth-science.ts` + `EARTH_SCIENCE_TEXTBOOK` 노출
- **총 196 content / 약 750KB / 약 200 페이지 분량 자체 제작 콘텐츠**

**UI 통합**:
- `src/lib/mind-map/build-tree.ts`: `SubjectKey` 에 `"earth-science"` 추가 + 5 ch import
- `src/app/mind-map/page.tsx`: SUBJECTS 배열에 🌍 지구과학Ⅰ 추가
- `src/lib/ai/tutor-prompt.ts`: SUBJECTS 에 지구과학Ⅰ + 5 topic (지권 변동·지구 역사·대기 해양 변화·상호작용·별과 우주)
- 대시보드는 SUBJECTS 동적 사용 → 자동 노출

**Implementer stall 회피 전략**: ch3/ch4/ch5 textbook + structured 동시 작성 시 한 번에 75K+ 자 출력 → watchdog 600s timeout 빈발. 분할 재실행 (textbook 단독 / structured 단독) 으로 모두 성공.

**검증**:
- typecheck pass
- vitest 432/438 (6 실패는 기존 beta/review mock 이슈, 본 작업 무관)

**다음 세션 진입점**:
1. 수능 누락 6건 사용자 직접 입력 (2026 공4 외 5건)
2. 지구과학Ⅰ production 검증 — `/mind-map` 🌍 탭 / `/tutor` 지구과학Ⅰ 시작
3. 다음 자체 제작 과목 결정 (한국사·물리Ⅰ·화학Ⅰ 등)

> ✅ 17차에서 명시되었던 'Supabase manual linking 활성화' 사용자 액션은 18차 세션 중 완료 (2026-05-06).

---

## 17차 세션 종료 (2026-05-05) — 28 commits / 헤밍웨이 v2 완성 + 수능 기출 통합

### Night mode 자율 작업 — commit 28건 (`dafee1d` ~ `19145ce`)

| 영역 | 주요 핵심 |
|---|---|
| **인증·계정** (4) | admin 다중 이메일 + UserMenu 드롭다운 + /account 페이지 + 비밀번호 변경 + 학생 manual linking UI |
| **인프라** (3) | textbook_progress 마이그레이션 + isAdminEmail client-safe 분리 + UserMenu user-id 판정 |
| **운영 docs** (2) | Phase 1 spec 4종 (matrix·content-spec·implementation-plan + architecture 부록) + user-merge-runbook |
| **헤밍웨이 v2** (12) | 베타 게이트 제거 → 무료 열람 + 인터랙티브 퀴즈 UI (설명/문제 풀이 탭 + 채점 + 결과 + 틀린 문제 다시 보기 + 이전·다음 문제) + **75 레슨 콘텐츠 양산** (단원 1~14) + 이전·다음 레슨 nav + 대시보드 복귀 링크 |
| **수능 기출** (3) | 지난 10년 어법 기출 19건 매핑 + 인터랙티브 풀이 UI (SuneungSection) + 풀이 (왜 틀렸나 + 다른 선택지 노트) |
| **lint·build fix** (3) | Vercel ESLint warning 정리 (admin/contributors useCallback, conversation any, BetaChat img 등) |
| **URL 정비** (2) | 슬러그 매핑 fix (frontmatter slug 우선) + 75 파일 prefix 제거 rename |

### B — 헤밍웨이 영문법 v2 완성 ⭐

세션 후반에 사용자 요청으로 진행:
- 메인 페이지 베타 게이트 제거 → 누구나 무료 열람 (commit `b23767b`)
- 레슨 뷰어 신설 + parser (vitest 6/6) + LessonView (탭) + QuizPanel (인터랙티브 채점·결과·틀린 문제 다시 보기·이전·다음 문제) — `8b6c52f`
- **75 레슨 모두 작성** — 14 단원 (commit 6건: `6872dab`·`08445dd`·`6da7cf1`·`6e8dc7b`·`4c98fc5`·`03c918b`)
  - 14 단원 / 75 레슨 / 375 문제 / 약 100K 자 한국어 (≈ 200 페이지)
- 75 파일 깔끔 rename (`07-02-participle-phrase.md` → `participle-phrase.md`) — `ee09e57`
- 이전·다음 레슨 네비게이션 (3-column footer) — `0ca0731`
- 대시보드 복귀 링크 + breadcrumb — `19145ce`

**파일 위치**:
- 콘텐츠: `content/grammar/<slug>.md` 75 파일
- 컴포넌트: `src/components/grammar/{LessonView,QuizPanel,SuneungSection}.tsx`
- Parser: `src/lib/grammar/parse-lesson.ts` + `__tests__/parse-lesson.test.ts` (6/6)
- 페이지: `src/app/grammar/{page.tsx,[slug]/page.tsx}`

### C — 수능 영어 어법 기출 통합 ⭐

지난 10년 (2017~2026) + 2010~2016 어법 문제 19건 매핑 + 인터랙티브 풀이.

| 슬러그 (단원) | 매핑된 수능 |
|---|---|
| `participle-phrase` (7-2 분사구문) | **5** ⭐ 핵심 빈출 |
| `agreement-subject-verb` (12-1) | 5 |
| `relative-what-compound` (8-6) | 3 |
| `passive-basic` / `relative-that-which` | 각 2 |
| 그 외 9 슬러그 | 각 1 |

**핵심 발견**: "긴 주어 + 긴 수식어구 + 본동사 자리에 -ing 분사" 패턴 = 한국 수능 어법 빈출 26%.

UI:
- 레슨 설명 탭 끝에 "🎯 관련 수능 기출 (N)" 카드
- 카드 펼침 → 본문 + 5 선택지 → 채점 → 옳은 형태 + 풀이 + 다른 선택지 노트
- 출처: KICE (저작권 명시)

**파일**:
- 데이터: `src/lib/data/grammar-suneung.ts` (19 문제 — 본문·정답·오류·옳은 형태·풀이·매핑·다른 선택지 노트)
- UI: `src/components/grammar/SuneungSection.tsx`
- 자료 source: `user_docs/suneung-eng/test.md`

⚠️ **2017 정답 메모**: 사용자 자료 ④ vs KICE 일반 ⑤. 본 데이터 ⑤ 기준 + reviewNeeded 메모. 사용자 검토 시 데이터 갱신.

### A1 — Admin email 다중화 (OAuth provider 충돌 fix) ✅

**증상**: 사용자 본인이 Google 로그인 시 admin 통과, Kakao 로그인 시 admin 거부.

**원인**:
- Supabase Auth 는 OAuth provider 별 별도 user 생성. 같은 이메일이라도 자동 link 안 됨.
- 사용자 Google 계정은 `phoodul@gmail.com`, **Kakao 계정 등록 이메일은 `phoodul@daum.net`** → 자동 link 도 작동 못 함.
- Admin 가드는 14곳 TS hardcode `["phoodul@gmail.com"]` + 5 SQL RPC 의 `<> 'phoodul@gmail.com'` 으로만 인정 → Kakao user (email=null 또는 daum) 전부 거부.
- 결과: Kakao 로그인 시 Legend 베타도 trial 강등, /admin/* 진입 거부.

**Fix (B 옵션 = 정석)**:
- `src/lib/legend/access-tier.ts` default 를 `phoodul@gmail.com,phoodul@daum.net` 두 이메일 hardcode (client component 도 통과).
- TS 14곳 hardcode 제거 → 모두 `isAdminEmail()` 로 통일 (단일 소스 of truth).
- Supabase 마이그레이션 `20260505_admin_email_multi.sql`:
  - `is_admin_email(text)` immutable helper 신설 (lower-case 화이트리스트).
  - 5 RPC 갱신 — `is_admin()`, `approve_candidate_tool`, `reject_candidate_tool`, `list_beta_applications`, `review_beta_application`.

**검증**:
- `is_admin_email` SQL: gmail=true / daum=true / daum_upper=true / not_admin=false / null=false ✅
- production DB 에 hardcode `'phoodul@gmail.com'` 검사 RPC 0건 (helper 외부화 완료) ✅
- vitest 419/420 통과 (1 실패 = `beta/review` mock 설정 문제, 본 작업과 무관) ✅
- typecheck pass ✅

**잔여 운영 액션**:
- `LEGEND_ADMIN_EMAILS` Vercel env 는 default 만으로 충분 (본인 두 이메일 hardcode). 추가 admin 필요 시만 env 갱신.
- production deploy 후 Kakao 로그인 본인 검증.

### A2 — 학생용 manual linking UI ✅ (commit `9b32ec9`)

**문제**: Admin email fix 와 같은 OAuth 분기 문제가 학생에게도 발생. 같은 학생이 Google
로 가입 → Kakao 로 다음 로그인 시 다른 user_id 로 인식, 학습 진도 0 표시.

**Fix**:
- `src/app/account/page.tsx` 신설 (Server, auth guard).
- `src/components/account/IdentityManager.tsx` (Client) — `supabase.auth.linkIdentity` /
  `unlinkIdentity` / `getUserIdentities`. 마지막 1개 unlink 차단 (영구 잠금 방지).
- `/dashboard` 헤더에 "⚙️ 계정 설정" 링크 (로그인 사용자에 노출).
- `manual_linking_disabled` 에러 시 운영자 안내 메시지.

**운영 prereq**: Supabase Dashboard → Authentication → Settings → "Manual linking" 활성화
필요. **(사용자 액션)**

### A3 — Phase 1 자체 제작 콘텐츠 spec docs ✅

D4 비전 정정 (소크라테스 튜터 = 출판사·자체 제작, 수학 제외 전 교과) 후속 docs 4종:

| 문서 | 역할 | 줄 |
|---|---|---|
| `docs/curriculum-matrix.md` (신설) | 전 교과 매트릭스 (수학·영문법 제외 50+) + 3 후보 전략 | 130 |
| `docs/curriculum-content-spec.md` (신설) | chapter 4계층 모델·진도 DB·헤밍웨이 v2 vs TS 패턴·SubjectKey 확장 절차 | 200 |
| `docs/implementation_plan_phase1.md` (신설) | Phase 1 (2주) 12 task 분해 + Phase 0 와 결합점 | 110 |
| `docs/architecture-platform.md` (갱신) | 부록 D — 출판사 비전을 Phase 4+ 후순위로 이동, Phase 1 자체 제작 비전 추가 | +50 |

**사용자 결정 대기 (D-1~D-5)**:
1. 첫 자체 제작 과목 (3 후보 전략 중 1)
2. MDX vs TS 통일 정책
3. chapter 분량 표준 (800~1500자 vs 1500~3000자)
4. 첫 과목 chapter 수 목표 (PoC 3 vs 전체)
5. `textbook_progress` 마이그레이션 시점

**기본값** (사용자 결정 무시 시): 통합사회 / 깊이 자유 / 1500~2500자 / PoC 3 chapter / 동시 진행.

### A4 — production 진단 결과 (16차 끝 → 17차 시작 사이 발견)

검증에서 발견된 **결함 1건 (사용자 결정으로 미복원)**:
- `beta_applications` 1건 approved (`youngout320@gmail.com`, 2026-05-01) 인데 D2 ALTER+TRUNCATE 사고로 `legend_beta_invites` row 누락 → 베타 권한 발휘 불가.
- 사용자 결정: 복원하지 않음. 새 베타 모집부터 시작.
- 신규 approve 흐름은 `review_beta_application` RPC 가 자동 invite insert 하므로 정상 작동 (이번 admin email fix 포함).

### Legend Tutor 완료도 평가 (17차 세션 입구)

**기능 측면 = 사실상 완료** (5거장 페르소나·trigger·KaTeX·subject_hint·수능 기출 600+ 정답 / 512 원문·베타 신청·30일 만료·가드레일·Mathpix·보고서·domain easyedu.ai apex).

**잔여 = 운영·마케팅** (베타 실사용자 0명, P0-13c 시연 영상, GTM 자료, 결제 도입 = 부산 임대 후).

## 16차 세션 진행 중 (2026-05-04~)

사용자 요청: Legend Tutor를 전면 — Euler Tutor 제거 + 학년/과목 분리 + 수능 기출 연습 + 베타 후기를 Legend 안으로.

8 task 분해 (`docs/task.md` 참조 — Phase A~D).

### Phase A — Euler 제거 ✅
- `/euler/*` 5개 + `/euler-tutor/*` 2개 라우트 삭제, 코드를 `/legend/*` 로 이전 (re-export → 진짜 구현)
- `Handwrite*` 2 컴포넌트 → `components/legend/` 이동 (BetaChat 의존)
- `lib/euler/*` 는 Legend 핵심 라이브러리 (embed, json, weakness-aggregator, retriever, sympy-client 등 50+ 의존) → 보존
- middleware: `/euler*` + `/euler-tutor` → `/legend*` 301 redirect (SEO 보호)
- landing/dashboard/guide 의 오일러 노출 제거 + Legend 카드로 통합

### Phase B — 베타 후기 위치 이동 ✅
- 랜딩의 베타 후기 카드 제거
- Legend layout 헤더에 **베타 신청자 한정** "📝 후기 쓰기 / ⭐ 후기 보기" 버튼 추가 (`getUserAccessTier === 'beta'`)

### Phase C — 학년/과목 + 튜터 선택 UI + 수능 기출 연습 탭 ✅
- C1: BetaChat / TrialChat 에 학년/과목 chip selector (`MATH_AREAS` 9 카테고리 + 자유질문) + localStorage persistence + useChat body 의 `subject_hint` 추가 (commit `5329b41`)
- C2: BetaChat / TrialChat 에 'AI 코칭 / 수능 기출' 탭 전환 + `PastExamPanel` 신설 (연도·과목·번호 필터, 2017~2026 한국 수능 정답 DB 활용) + 문제 클릭 시 채팅 prefill
- C3: 시드 9 파일 (`data/math-tools-seed/`)이 사용자 요구 9 카테고리와 1:1 매핑. `src/lib/data/math-problems.ts` 정답 DB 별도 → 추가 마이그레이션 불요. 향후 백엔드 `subject_hint` 통합 시 `math_tools.area` 컬럼 검토.

### Phase D — Euler 정리 + subject_hint 통합 ✅
- D1: `/api/euler-tutor/*` 10 라우트 → `/api/legend/tutor/*` git mv (history 보존). 호출자 5곳 fetch URL 갱신. middleware 주석 갱신. (commit `eb555cc`)
- D2: 사용자 결정 = drop A 옵션. 60명 추정 → 실제 2명 / 27 풀이 거의 본인+지인. ALTER TABLE RENAME + TRUNCATE 로 데이터 폐기 + 이름 정리 (drop+create는 누적 ALTER 재구축 비용 큼). `redeem_euler_beta` → `redeem_legend_beta` rename + 본문 갱신. `review_beta_application` 본문 갱신. 코드 13 파일 sed 일괄 치환. Supabase MCP 로 production 적용. (commit `ca67d35`)
- D3: `subject_hint` 백엔드 통합 — `lib/legend/subject-labels.ts` 신설 (id → "중학교 1학년 수학" 매핑) + `route.ts` 가 body 받아 system prompt 에 주입. Manager(Haiku) 자동분류 보존하되 학생 선택 학년/과목 우선 안내.

### 16차 세션 누적 — 6 commits
| # | Hash | 영역 | 핵심 |
|---|---|---|---|
| 1 | `182a3cf` | refactor(legend) | Euler 라우트 제거 + 베타 후기를 Legend 안으로 |
| 2 | `5329b41` | feat(legend) | 학년/과목 chip selector + subject_hint API hint |
| 3 | `1df59ea` | feat(legend) | 수능 기출 연습 탭 통합 (PastExamPanel) |
| 4 | `eb555cc` | refactor(api) | /api/euler-tutor → /api/legend/tutor 이전 |
| 5 | `ca67d35` | feat(db) | euler_* → legend_* rename + 데이터 폐기 |
| 6 | (다음) | feat(api) | subject_hint system prompt 주입 |

### 다음 세션 (17차) 시작점 — D4 출판사 비전 = 소크라테스 튜터

⚠️ **비전 정정 (2026-05-04 사용자 직접)**: D2 결정 시점에 내가 출판사 비전을 Legend Tutor 와 결합한 것은 오해. 정확한 매핑:

| 도구 | 콘텐츠 출처 | 교과 | 위치 |
|---|---|---|---|
| 헤밍웨이 영문법 | Claude 자체 200p 텍스트북 (이미 진행 중) | 영문법만 | 별도 제품 |
| Legend Tutor | 수학 시드(9 카테고리) + 수능 기출 정답 DB | 수학만 | **소크라테스의 수학 특별판** |
| **소크라테스 튜터** | **출판사 라이선스 + Claude 자체 교과서** | **수학 제외** 전 중고등 + 수능 교과 | 일반 도구 |

같은 코칭 철학(질문으로 사고 유도) 공유. 수학은 5거장·trigger·KaTeX·필기·Mathpix·정답 DB 같은 전용 인프라로 분리. 소크라테스에는 수학 콘텐츠 추가 안 함.

**현재 소크라테스 = 3 과목**:
- 생활과 윤리 (`src/lib/data/textbooks/ethics-*.ts` 6 chapter)
- 언어와 매체 (`korean-*.ts` 5 chapter)
- 생명과학 (`biology-*.ts` 5 chapter)
- 마인드맵도 같은 3 과목 (`SubjectKey` 기반)

**비전 격차**: 50+ 교과로 확장 (영문법은 헤밍웨이, 수학은 Legend 분리). 같은 교과서 소스가 마인드맵 + 소크라테스 두 기능 동시 구동.

**Phase 1 실행 결정 (16차 세션 끝, 사용자 직접)**:
- 검인정 교과서 출판사 **계약 미보유** → **Claude 자체 제작 교과서**로 한 과목씩 점진 추가
- 헤밍웨이 영문법 v2 (Claude 자체 200p, 14단원 75레슨 MDX) 패턴을 소크라테스 전 교과로 확장
- 출판사 협업은 자체 콘텐츠 검증 후 향후 GTM (Phase 2+)
- 마인드맵에서 수학 제외 — Legend 가 자체 시각화 보유, 마인드맵 = 소크라테스 콘텐츠와 1:1

**17차 세션 작업**:
1. 전 교과 매트릭스 — 중1~고3 + 수능 (수학·영문법 제외) 우선순위 매기기. 사용자 입력 가능 항목.
2. `docs/architecture-platform.md` 갱신 — SubjectKey 확장·textbooks 디렉터리 표준화·자체 제작 워크플로우
3. `docs/curriculum-content-spec.md` 신설 — chapter 모델·진도 DB·마인드맵 트리 명세 (헤밍웨이 v2 패턴 재사용)
4. `docs/implementation_plan_phase1.md` 작성 — Phase 1 (자체 제작 PoC 1~2 과목) task 분해
5. (사용자 결정) 첫 자체 제작 과목 = ?  
   기존 3 과목(생활과 윤리·언어와 매체·생명과학) chapter 보강 vs 신규 과목 추가

### Phase D — Euler API/DB 정리 (사용자 결정 대기)
- `/api/euler-tutor/**` 11 라우트: 제거 vs `/api/legend` alias
- `euler_solve_logs` · `euler_beta_invites` 테이블: drop vs 보존

## 15차 세션 종료 (2026-05-04 night)

세션 길이 약 24시간 (5/3 오후 → 5/4 새벽). night mode 자율 진행 적극 활용.

### 누적 commit 14건 (993bc7a → 0d9ac6a)

| # | Hash | 영역 | 핵심 |
|---|---|---|---|
| 1 | `38b874f` | infra | 미사용 firebase MCP 서버 제거 |
| 2 | `7c603d2` | docs | claude.md 컨테스트 → 학생 AI 교육 SW 룰 전환 |
| 3 | `c61851b` | domain | easyedu.ai 도입 + 레거시 host 301 redirect (초안) |
| 4 | `e8c5913` | fix | ERR_TOO_MANY_REDIRECTS 긴급 해소 (www↔apex 충돌) |
| 5 | `81f2af5` | domain | vercel.app → apex 301 안전 재추가 (Vercel apex primary 후) |
| 6 | `06c49d8` | marketing | 베타 모집 + 홍보 워크플로우 + 채널 목록 (수만휘·오르비·맘카페) |
| 7 | `8e5d70d` | feat | 베타 리뷰 단순화 (A-2) + 가격 v2.0 (₩29/49/99천) + monetization-operations |
| 8 | `3473d39` | P0-02 | trigger accumulator observability — log 테이블 + admin 분포 시각화 |
| 9 | `efef26c` | P0-03 | MathText display math 패턴 + 회귀 테스트 16건 |
| 10 | `b30c164` | P0-04 | 6 튜터 페르소나 일관성 회귀 테스트 19건 |
| 11 | `63a5c60` | P0-05/06 | subject_anchor schema + 영문법 30 도구 seed JSON |
| 12 | `cf09b5c` | architecture | Legend Tutor = 수학 전용 확정 + P0-08 재정의 |
| 13 | `0158ab4` | grammar | 헤밍웨이 영문법 = 학생 13번째 도구 (placeholder, v1) |
| 14 | `0d9ac6a` | grammar v2 | 텍스트북 컨셉 — 14 단원 75 레슨 커리큘럼 + 샘플 1 레슨 |

### 신규 vitest 35건 통과
- P0-03 MathText 회귀 16건
- P0-04 페르소나 일관성 19건

### Production 라이브
- 도메인: **https://easyedu.ai** (apex primary, www·vercel.app 자동 redirect)
- DB: 마이그레이션 3개 적용 (`beta_reviews_simplify`, `trigger_accumulation_log`, `add_subject_anchor`)

### 핵심 architecture 결정 (memory 동기화 완료)
- **Legend Tutor = 수학 전용** (5거장 페르소나 오염 방지)
- **헤밍웨이 영문법 = 학생 13번째 도구** (학생 12 → 13, 총 17 도구)
- **헤밍웨이 v2 컨셉 = 텍스트북 학습** (영어 단어 18000 모델, LLM 호출 X)
- **Phase 1 가격 = ₩29/49/99천 VAT 포함** (v1.1 의 ₩5/15/30만은 Phase 4+ 보류)
- **결제 = 토스페이먼츠 단독** (부산 임대 → 사업자 주소 변경 → PG 가입 흐름)

### 16차 세션 시작점

**자율 진행 가능 (사용자 신호 1마디만)**:
1. **헤밍웨이 Step 4** — 샘플 레슨 (`content/grammar/03-04-tense-perfect-vs-past.md`) quality "OK" 시 나머지 74 레슨 progressive 자율 작성 (10 레슨/commit, ~8 commit)
2. **헤밍웨이 Step 3** — 진도 추적 DB (`grammar_progress`) + 레슨 뷰어 + 외우기 카드 + 5문제 테스트 UI

**사용자 액션 필요**:
- Step 2 샘플 레슨 quality 검토 (톤·분량·문제 난이도)
- P0-13c 시연 영상 수능 킬러 문제 1개 선정
- 부산 소상공인 임대 검색 (Phase 1 결제 도입 timing)
- 헤밍웨이 portrait 이미지 (현재 ✒️ 이모지)

---

## 14차 세션 종료 (2026-05-03)

### 완료된 task
- ✅ Δ29 평가셋 정답 정합성 audit + 10건 정정 (`6b26b68`)
- ✅ 컨테스트 → 학생 AI 교육 SW 방향 전환 (`85d6f15`)
- ✅ Phase 0 PRD 5 문서 작성 (Researcher + Architect, `24241f6`)
- ✅ 영어 회화 6 캐릭터 + lip sync (`ef82f75`)
- ✅ 캐릭터 사실적 미국인 스타일 재구현 (`60608c0`)
- ✅ Phase 0 plan 정정 — 인터뷰→리뷰 / 학부모/동영상/양산 task 3종 추가 (`70c6309`)
- ✅ 베타 4명 = 지인 / 시연 영상 = 폰 노이만 결정 반영 (`079f952`)
- ✅ 시연 영상 5분 단축 + 함께 풀이 + 리포트 양 축 (`54afa80`, `9d4d56e`)
- ✅ pending 0 / active 1 P0-14 점검 task 로 변경 (`6396832`)
- ✅ **P0-01 베타 1명 분석 + D1 critical 결함 발견** (`a8f12d1`)
- ✅ **P0-01b area 하드코딩 critical fix — Manager 자동 분류로 위임** (`c7c92a0`)

### 15차 세션 P0-02~06 자율 진행 완료 (2026-05-04 night mode)

| Task | 변경 | Commit |
|---|---|---|
| **P0-02** trigger accumulator observability | `legend_trigger_accumulation_log` 테이블 + accumulator outcome 5단계 적재 + admin "최근 7일 활동" 섹션 + outcome 분포 칩 + 최근 20건 raw log | `3473d39` |
| **P0-03** R1 KaTeX 안정화 | MathText 의 `parseMathSegments` 분리 export + display math 패턴 (`$$..$$`, `\[..\]`) 추가 + `\(..\)` 정규식 fix + 회귀 테스트 16건 | `efef26c` |
| **P0-04** 페르소나 일관성 | TUTOR_PERSONAS / buildSystemPrompt / extractFinalAnswer export + 회귀 테스트 19건 (페르소나 시작 패턴 / "최종 답" / 5단계 / 자가 검증 / [STUCK] / answer 추출) | `b30c164` |
| **P0-05** subject_anchor schema | math_tools + candidate_triggers 에 subject_anchor (default 'math') + subject_grade 컬럼 + 인덱스. 기존 250 도구 자동 'math'. | (commit pending) |
| **P0-06** 영문법 30 도구 seed JSON | `data/seeds/english-grammar-anchors.json` — 6 anchor (시제·관계대명사·가정법·수동태·분사·문장구조) × 5 도구 = 30 도구 / 90 trigger (ko/en pair) / 도구별 common_mistake 예문 포함 | (commit pending) |

### ⭐ 2026-05-04 architecture 확정 — Legend = 수학 / 헤밍웨이 = 영문법

**Legend Tutor**: 수학 전용 유지 (5거장 페르소나·라우팅·R1 카드 절대 다른 과목 노출 X).

**헤밍웨이 영문법** (학생 13번째 도구, `/grammar`): 사용자 5+5 가지 결정 (2026-05-04).

**v1 컨셉 (2026-05-04 오전, 폐기)**: "학생 입력 → 오류 진단·교정" 코치. HEMINGWAY_PERSONA system prompt 작성 후 폐기.

**⚠️ v2 컨셉 (2026-05-04 night, 사용자 직접 정정)**: **정해진 커리큘럼 기반 텍스트북 학습**. 영어 단어 학습 (18,000 단어 에베레스트) 모델과 동일.
- 학습 흐름: 챕터 → 텍스트북 설명 스트리밍 → 대표 문장 1개 외우기 → 실전 문제 5개 → 다음 레슨
- 헤밍웨이 = 강의 narrator + 외우기 코치 (오류 진단 X)
- 5 추가 결정: 한국 영문법 표준 14 단원 75 레슨 / 한국 학년 / 레슨당 800~1500자 + 대표 문장 + 5문제 / 챕터 1개 quality 검토 후 자율 / MDX 정적 + DB 진도 추적

진행 (Step 1·2 완료):
- `src/app/dashboard/page.tsx` + `src/app/page.tsx` + `src/app/guide/page.tsx` 에 헤밍웨이 카드 추가 (✒️ icon, 영어 카테고리 묶음)
- `src/app/grammar/page.tsx` v2 컨셉 메인 페이지 (14 단원 / 75 레슨 목차 카드 + Step 3 안내)
- `docs/grammar-curriculum.md` 75 레슨 목차 + 단원별 슬러그 매핑 + P0-06 도구 매핑
- `content/grammar/03-04-tense-perfect-vs-past.md` 샘플 1 레슨 (현재완료 vs 단순과거) — quality 검토용
- `src/lib/ai/grammar-prompt.ts` v1 페르소나 폐기 삭제

### 다음 세션 (16차) 시작점

**v2 헤밍웨이 텍스트북 학습 컨셉 진행 중**:
- ✅ Step 1 — 75 레슨 커리큘럼 (`docs/grammar-curriculum.md`)
- ✅ Step 2 — 샘플 1 레슨 (`content/grammar/03-04-tense-perfect-vs-past.md`) — **사용자 quality 검토 대기**
- ⏳ Step 3 — 진도 추적 DB schema (`grammar_progress` 신설) + 레슨 뷰어 + 외우기 카드 + 5문제 테스트 UI
- ⏳ Step 4 — Step 2 quality 승인 후 나머지 74 레슨 progressive commit (10 레슨/commit, ~ 8 commit)

**P0-07~09 (영문법 PoC) 의미 변경**:
- ~~P0-07 trigger 임베딩~~ → 텍스트북 학습 모델로 전환되어 임베딩 우선순위 ↓ (Phase 1 후순위)
- ~~P0-08 LLM 통합~~ → MDX 정적 컨텐츠로 LLM 호출 X (비용 0)
- ~~P0-09 5문제 KPI~~ → 텍스트북 75 레슨 사용자 학습 만족도로 전환

**사용자 결정 대기**:
1. **샘플 레슨 (3-4 tense-perfect-vs-past) quality 검토** — 톤·분량·실전문제 적절성. OK 신호 시 Step 4 자율 진행.
2. P0-13c 시연 영상 수능 킬러 문제 1개 선정 (Legend Tutor 영상 — 헤밍웨이 컨텐츠 따로)
3. 부산 소상공인 임대 검색 (Phase 1 결제 도입 timing)
4. 헤밍웨이 portrait 이미지 (현재 ✒️ 이모지)

**다음 세션 사용자 액션 (Phase 0 종료까지)**:
1. P0-06 영문법 30 도구 JSON quality 검토 (필요 시 정정)
2. P0-07 임베딩 OpenAI 호출 승인
3. P0-13c 영상 시연용 수능 킬러 문제 1개 선정 (스크립트 자율 작성용)
4. 부산 소상공인 임대 검색 (Phase 1 결제 도입 전)

### 15차 세션 P0-02 완료 (2026-05-04) — chain miss observability

원래 plan 의 "subject_anchor 필터 추가" 는 candidate_triggers 에 해당 컬럼이 없어 폐기. 코드 audit 결과 진짜 누락은 **observability** — accumulator 의 모든 outcome 이 silent (`console.warn`) 이라 production 베타 5명 확장 시 누적 동작 추적 불가능했음.

진행:
- `legend_trigger_accumulation_log` 테이블 신설 (outcome / matched_id / cue / tool / cosine / user / problem / detail)
- `get_trigger_accumulation_stats(days_back)` RPC — 분포 + 일별 추이 + 고유 사용자
- `accumulateTrigger` 5단계 모든 outcome 에 `logAccumulationOutcome` 적재 (silent 정책 유지)
- `/admin/candidate-triggers` 페이지에 "최근 7일 누적 활동" 섹션 추가 — outcome 분포 칩 + 최근 20건 raw log 펼치기
- `/api/admin/trigger-accumulation` 신규

### 15차 세션 도메인 작업 완료 (2026-05-03)

**`easyedu.ai` (apex primary) 도입 완료**:
- Cloudflare Registrar 구입 + Vercel auto config (apex CNAME flattening, `*.vercel-dns-017.com`)
- Vercel Domains 패널: `easyedu.ai` Production / `www.easyedu.ai` 308 → apex
- Supabase Auth URL Configuration: Site URL `https://easyedu.ai` + Redirect URLs 갱신
- OAuth 3종(Google·GitHub·Kakao) 검증 완료 — provider 콘솔 변경 불필요(Supabase callback URL 만 사용)
- middleware: `vibe-coding-contest.vercel.app` → `easyedu.ai` 301 redirect 만 처리. www↔apex 정규화는 Vercel 위임 (충돌 회피).
- root `middleware.ts` dead code 삭제

**디버깅 흔적**: 초기 commit (`c61851b`) 에 middleware 의 `www → apex` redirect 가 Vercel auto config 의 `apex → www` redirect 와 충돌하여 ERR_TOO_MANY_REDIRECTS 발생 → `e8c5913` 으로 긴급 제거 후 사용자가 Vercel Domains 패널에서 primary 를 apex 로 뒤집음 → 이번 commit 에서 LEGACY redirect 만 안전하게 재추가.

이전 progress 의 "vercel.ts redirect 인프라 ready" 메모는 잘못된 기억 — 실제로는 `src/middleware.ts` 의 `/euler → /legend` 패턴.

### 다음 세션 (15차) 시작점

**P0-02 부터 B 옵션 자율 진행** — 코드 audit·인프라 강화 (베타 데이터 검증은 후속).

순서:
1. **P0-02** chain miss 추적 인프라 강화 (코드 audit)
2. **P0-03** R1 KaTeX 렌더 안정화 (MathText 컴포넌트 점검)
3. **P0-04** persona 응답 일관성 (system prompt 점검)
4. **P0-05~09** B 카테고리 — 영어 문법 trigger PoC (병렬)
5. **P0-10~13d** C 카테고리 — GTM 자료
6. **P0-14~16** D 카테고리 — 베타 확장

### 다음 세션 사용자 액션 (선택 시점)
- 도메인 후보 결정 + 구입 + DNS 설정
- 지인 4명에게 베타 메시지 송출 (P0-15)
- P0-13c 시연 영상 녹화 (자료 준비 후)
- P0-14 active 베타 1명 사용 모니터링

## 도구 / 인프라 (그대로 유지)

- `scripts/audit-markdown-numbers.ts` · `scripts/identify-true-numbers.ts` · `scripts/fix-eval-answers.ts` — 평가셋 정합성 감사 도구
- `services/euler-sympy/` — Python μSvc (Railway)
- Supabase 마이그레이션 17+ — RLS·가드레일·만료·트리거 누적
- Vercel env 19 row — Anthropic / OpenAI / Gemini / 결제·OAuth 키

## Legacy

컨테스트 기간(7일) 동안 작성된 모든 산출물(Phase A~G, KPI 측정, killer 평가셋 보고서, 베타 launch checklist 등)은 `docs_legacy/` 폴더에 그대로 보존되어 있다. git 히스토리도 유지됨. 향후 의사결정에서 참고 자료로 활용.

## 다음 세션 시작 시

1. 이 문서(`progress.md`)로 14차 결과 + 15차 시작점 확인
2. `docs/qa/beta1-defect-list.md` 의 D2~D6 후속 결함 점검
3. `docs/implementation_plan_phase0.md` P0-02 부터 순차 자율 진행 (B 옵션 합의)
4. 도메인 변경은 사용자 결정 후 별도 task
5. 과거 컨텍스트 필요 시 `docs_legacy/progress.md` (13차 / Δ29) 참조
