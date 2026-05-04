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

## 17차 세션 진행 중 (2026-05-05~)

### Night mode 자율 작업 — commit 3건

| # | Hash | 영역 | 핵심 |
|---|---|---|---|
| 1 | `dafee1d` | feat(auth) | admin 판정 다중 이메일 (Google + Kakao 양쪽 통과) |
| 2 | `9b32ec9` | feat(account) | OAuth provider manual linking UI (`/account` + IdentityManager) |
| 3 | (다음) | docs(curriculum) | Phase 1 자체 제작 콘텐츠 spec + 매트릭스 + plan |

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
