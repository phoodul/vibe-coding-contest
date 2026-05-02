> 버전 1.0 / 작성일 2026-05-02 / Author: Architect Agent
> Phase 0 (2주 — 2026-05-02 ~ 2026-05-16)
> 관련 문서: [roadmap.md §Phase 0](./roadmap.md#phase-0--입증-자산화--수만휘-gtm-시작) · [business-vision.md](./business-vision.md) · [pricing-strategy.md](./pricing-strategy.md) · [architecture-platform.md](./architecture-platform.md) · [research_raw.md](./research_raw.md)

# Phase 0 Implementation Plan — 입증 자산화 + 수만휘 GTM 시작

---

## 1. 목표 / 검증 KPI / 리스크

### 1-1. Phase 0 목표 (roadmap.md §Phase 0 인용)

> 현재 운영 중인 자산 (Legend Tutor KPI 89.5%, Trigger 라이브러리 244 도구, 가드레일 9, 베타 1명 검증) 을 **마케팅·GTM 자산** 으로 변환하고, 수만휘 정회원 자격을 가진 베타 사용자 5명에게 30일 무료 체험을 시작한다.

본 Phase 0 implementation plan 은 위 문장을 **2주 내 실행 가능한 16 task** 로 분해한 것이다. 1 Task = 1 Commit 원칙을 따른다.

### 1-2. Phase 0 4대 카테고리

| 카테고리 | 비중 | 목적 |
|---|---|---|
| **A. Legend Tutor 보강** (P0-01 ~ P0-04) | 4 task | 베타 1명 검증 결과 반영 — 발굴된 결함 fix, 베타 5명 확장 전 안정화 |
| **B. Trigger 라이브러리 영어 문법 일반화 PoC** (P0-05 ~ P0-09) | 5 task | 수학 6 anchor 모델을 영어 문법으로 확장 — Phase 1·2 일반화의 1차 검증 |
| **C. 수만휘 GTM 자료 준비** (P0-10 ~ P0-13) | 4 task | 자발적 후기 유도 + 출판사 협상 1-pager + 텐볼스토리 콜드 메일 |
| **D. 베타 1명 → 5명 확장** (P0-14 ~ P0-16) | 3 task | 현재 pending 1건 승인 + 4명 추가 모집 + 온보딩 자동화 |

### 1-3. 정량 KPI (Phase 0 종료 시점, 2026-05-16)

| 지표 | 목표 |
|---|---|
| 베타 5명 가입 완료 | 100% (5/5) — D 카테고리 완료 |
| 영어 문법 anchor seed 작성 | ≥ 6 anchor / ≥ 30 도구 |
| 영어 문법 5 문제 PoC 정답률 | ≥ 70% |
| 수만휘 자발 후기 게시 (베타 사용자) | ≥ 1 건 |
| 텐볼스토리 콜드 메일 회신 | ≥ 1 건 (또는 발송 완료) |
| Legend Tutor 베타 1명 발굴 결함 fix | 100% (commit 별 verify) |

### 1-4. 핵심 리스크

| 리스크 | 대응 |
|---|---|
| 베타 1명 자발 리뷰가 늦어져 P0-01~04 가 placeholder 만으로 끝남 | `beta_reviews` 테이블 모니터링 + 작성 알림 (Day 7/14/30) |
| 영문법 PoC anchor 가 수학과 본질적으로 다름 (단순화 X) | P0-05 에서 문법 도메인 특수성 분석 → 6 anchor 정의에 반영 |
| 수만휘 자발 후기 0건 | 텐볼스토리 정식 제휴 전환 (Phase 1 시작 시 결정) |
| Phase 0 2주 안에 16 task 완료 불가 | C 카테고리 (마케팅 자료) 일부 Phase 1 으로 이월 가능 — A·B·D 우선 |

---

## 2. Task 분해 (총 19 task)

각 task 형식:
- **What**: 변경 범위 1~2 문장
- **Why**: 비전·로드맵 어느 항목과 연결되는지
- **How**: 코드 변경 위치 / DB 마이그레이션 / 외부 호출 / 데이터 추가
- **검증**: 테스트 명령어 / 수동 체크 / KPI
- **선행 의존성**: P0-YY (있을 때만)
- **예상 시간**
- **Commit 메시지 prefix**

---

### A. Legend Tutor 보강 — 베타 1명 검증 반영 (P0-01 ~ P0-04)

#### P0-01: 베타 1명 사용 데이터 분석 + 결함 후보 목록화
- **What**: 현재 베타 사용자 1명의 `legend_tutor_sessions` / `solve_step_decomposition` / `legend_step_stuck_snapshots` / `beta_reviews` 데이터를 분석하여 **발굴된 결함 후보 목록** 을 작성한다. 결함은 다음 4 카테고리로 분류: ① chain miss / ② R1 KaTeX 렌더 / ③ persona 응답 일관성 / ④ 그 외 (UX·성능).
- **Why**: roadmap.md §Phase 0 산출물 4 (베타 5명 모집 + 온보딩 자동화) 의 전제 — 발굴된 결함을 5명 확장 전에 fix 해야 한다. business-vision.md §3-3 입증 KPI 89.5% 를 5명에게 일관 재현하려면 1명 검증에서 나온 결함을 막아야 한다.
- **How**:
  - 분석 스크립트: `scripts/phase0/analyze-beta1-sessions.ts` 신규 (Supabase MCP 또는 service role key 사용)
  - 결과 산출물: `docs/qa/beta1-defect-list.md` (한국어, 결함 ID + 카테고리 + 빈도 + 우선순위)
  - 1명 리뷰(`beta_reviews` 테이블)가 아직 비어있으면 사용 데이터 분석 결과 + "리뷰 누적 후 보완 필요" placeholder 명시
- **검증**:
  - `docs/qa/beta1-defect-list.md` 에 결함 후보 ≥ 3 개
  - 각 결함에 우선순위 (P1 ~ P3) 부여
- **선행 의존성**: 없음
- **예상 시간**: 반나절
- **Commit 메시지 prefix**: `docs:` (qa/beta1-defect-list.md 추가 + scripts 추가)

#### P0-02: chain miss 추적 인프라 강화 (P1 결함 우선)
- **What**: P0-01 에서 chain miss (도구 매칭 실패) 가 가장 빈번한 결함으로 확인될 가능성이 높음. `candidate_triggers` 큐 적재율과 admin 검수 UX 를 점검하고, 누락된 chain miss 패턴을 보강한다.
- **Why**: G-03 chain miss 인프라 (13차 세션) 는 이미 Trigger 1.07 → 1.90 으로 검증됐지만, 베타 사용자 풀이 데이터에서 누락 패턴이 발견되면 즉시 fix 해야 5명 확장 시 trigger 자동 누적이 일관 동작한다.
- **How**:
  - `services/legend/chain-miss/recorder.ts` (또는 동등 위치) 의 누락 케이스 보완 — 분석 결과 기반
  - admin UI: `src/app/admin/candidate-triggers/page.tsx` 에 `subject_anchor='math'` 필터 + 빈도 정렬 추가 (가벼운 UX 개선)
  - 새 마이그레이션 (필요 시): `supabase/migrations/20260503_chain_miss_metadata.sql` (인덱스·컬럼 추가만)
- **검증**:
  - `npm run test -- chain-miss` 통과
  - admin UI 에서 chain miss 카드 ≥ 5개 확인 가능
- **선행 의존성**: P0-01
- **예상 시간**: 반나절
- **Commit 메시지 prefix**: `fix:` 또는 `feat:` (인프라 보강)

#### P0-03: R1 KaTeX 렌더 안정화 (P2 결함)
- **What**: P0-01 에서 R1 풀이 정리 카드의 KaTeX 수식 렌더 실패 케이스가 발견될 가능성. 실패 케이스를 fixture 로 등록하고 fallback (수식 → 텍스트) 처리를 강화한다.
- **Why**: business-vision.md §3-2 5거장 페르소나 + R1 카드는 차별화 핵심. KaTeX 렌더 실패는 베타 사용자 NPS 직접 타격.
- **How**:
  - `src/components/legend/R1Card.tsx` (또는 동등) 의 KaTeX 에러 boundary + fallback
  - `__tests__/r1-katex-failure-cases.test.tsx` 신규 — 실패 fixture 5개 등록
  - 실패 케이스는 `data/r1-katex-failures/*.json` 에 누적 (향후 회귀 방지)
- **검증**:
  - `npm run test -- r1-katex` 통과 (5개 fixture 모두 fallback 동작)
  - 수동: 베타 사용자가 R1 카드 본 세션 1건 재현 → 렌더 정상
- **선행 의존성**: P0-01
- **예상 시간**: 반나절
- **Commit 메시지 prefix**: `fix:`

#### P0-04: persona 응답 일관성 + 리뷰 모니터링 placeholder
- **What**: 5거장 페르소나 (라마누잔·가우스·폰 노이만·오일러·라이프니츠) 의 응답 톤·길이가 일관되지 않은 케이스가 P0-01 에서 발견될 수 있음. system prompt 의 페르소나 톤 가이드를 보강한다. 동시에 베타 1명 자발 리뷰(`/legend/beta/review`)가 아직이면 **"리뷰 누적 후 task 채우기" placeholder commit** 을 명시한다 (운영자 인터뷰 X).
- **Why**: business-vision.md §3-2 5 거장 페르소나는 콴다·EBS 가 흉내 못 내는 우리 차별화. 톤 일관성이 깨지면 "AI 가 강사처럼 대화한다" 는 가치 자체가 약화.
- **How**:
  - `services/legend/personas/system-prompts/*.md` 5개 파일 점검 — 톤·길이·예시 일관성 보강
  - `__tests__/persona-tone-consistency.test.ts` (snapshot test 또는 LLM-judge) 추가
  - placeholder: `docs/qa/beta1-review-monitoring.md` — `beta_reviews` 모니터링 후 추가 결함을 P0-04b, P0-04c 등으로 추가 commit 하라는 명시
- **검증**:
  - persona 5명 각각 동일 입력에 대해 응답 길이 ±20% 이내 / 어휘 톤 통일 (수동 sampling)
  - `docs/qa/beta1-review-monitoring.md` 존재
- **선행 의존성**: P0-01
- **예상 시간**: 반나절
- **Commit 메시지 prefix**: `fix:` 또는 `chore:` (리뷰 모니터링 placeholder)

---

### B. Trigger 라이브러리 영어 문법 일반화 PoC (P0-05 ~ P0-09)

#### P0-05: 데이터 스키마 결정 — `subject_anchor` 컬럼 vs 별도 테이블
- **What**: architecture-platform.md §4-1 의 두 옵션 — `tools.subject_anchor` 컬럼 추가 vs `english_grammar_tools` 별도 테이블 — 중 어느 것이 깔끔한지 판단하고 마이그레이션을 작성한다. **결정**: `tools.subject_anchor` 컬럼 추가 (기존 244 도구는 `'math'` 디폴트, 향후 5과목 일반화 시 동일 테이블 활용 — Phase 2 에서 이미 일반화 방향).
- **Why**: roadmap.md §Phase 0 산출물 3 + architecture-platform.md §8-2 마이그레이션 파일 명명 규칙 (`20260502120000_add_subject_anchor_to_tools.sql`) 과 일치.
- **How**:
  - 마이그레이션: `supabase/migrations/20260503_add_subject_anchor_to_tools.sql`
    - `ALTER TABLE math_tools ADD COLUMN subject_anchor TEXT NOT NULL DEFAULT 'math';`
    - `ALTER TABLE math_tools ADD COLUMN subject_grade TEXT;`
    - `CREATE INDEX idx_math_tools_subject ON math_tools(subject_anchor, subject_grade);`
    - **주의**: 기존 테이블 이름이 `math_tools` (수학 전용 명명) 이므로 컬럼 추가 후 향후 Phase 1 에서 테이블 이름 `learning_tools` 로 마이그레이션 검토 (Phase 0 에서는 컬럼 추가만)
  - `candidate_triggers` 테이블도 동일하게 `subject_anchor` 컬럼 추가
  - 타입 재생성: `npm run supabase:types`
- **검증**:
  - 마이그레이션 dry-run 성공 (`supabase migration up --dry-run`)
  - 기존 244 도구 `subject_anchor='math'` 자동 채움 확인
  - `npm run test` 회귀 통과
- **선행 의존성**: 없음 (A 카테고리와 병렬 가능)
- **예상 시간**: 2시간
- **Commit 메시지 prefix**: `feat:` (스키마 확장)

#### P0-06: 영어 문법 6 anchor 정의 + seed 도구 30개 작성
- **What**: 영어 문법 도메인의 6 anchor 를 정의하고 각 anchor 당 5 도구 = 총 30 seed 도구를 작성한다. anchor 후보: ① 시제 ② 관계대명사 ③ 가정법 ④ 수동태 ⑤ 분사·동명사 ⑥ 문장 구조 (architecture-platform.md §4-2 인용).
- **Why**: business-vision.md §3-1 Trigger 라이브러리 일반화의 1차 검증. 수학 6 anchor → 244 도구 패턴이 영어 문법에서 동일하게 작동함을 입증해야 Phase 1 (5 과목 확장) 진입 가능.
- **How**:
  - seed 데이터: `data/seeds/english-grammar-anchors.json` 신규
    - 각 도구: `{name, subject_anchor: 'english_grammar', anchor: '시제', tool_proposition: 'A이면 B', triggers: [{ko, en}, ...], grade: 'high'}`
  - 시드 스크립트: `scripts/phase0/seed-english-grammar-tools.ts`
  - **anchor 정의 룰**: 수학과 달리 영어 문법은 "오류 패턴 → 수정 도구" 구조. 예: "주어 단수 + 동사 복수형 → 수일치 오류 / Tool: subject-verb agreement check / Trigger: '복수 명사 뒤 단수 동사가 보이면', '단수 명사 뒤 -s 동사가 보이면'"
  - 6 anchor × 평균 5 도구 = 30 도구 (최소). 가능하면 50 까지.
- **검증**:
  - `data/seeds/english-grammar-anchors.json` JSON 스키마 검증 통과
  - `npm run seed:english-grammar` 실행 → 30~50 row INSERT 성공
  - admin UI 에서 `subject_anchor='english_grammar'` 필터 시 30 + 도구 표시
- **선행 의존성**: P0-05
- **예상 시간**: 하루 (anchor 정의에 시간 투자)
- **Commit 메시지 prefix**: `feat:`

#### P0-07: 영어 문법 trigger 임베딩 자동 생성
- **What**: P0-06 에서 추가된 30 + 도구의 trigger (anchor 당 평균 3 trigger × 30 도구 = 약 90 trigger) 를 임베딩하여 pgvector 에 저장한다.
- **Why**: business-vision.md §3-1 Trigger 라이브러리의 검색 가능 자산화. 임베딩 없이는 학생 입력 → 도구 매칭이 불가능.
- **How**:
  - 기존 임베딩 스크립트 (`scripts/embed-math-triggers.ts` 등) 를 일반화 → `scripts/embed-triggers-by-subject.ts subject_anchor=english_grammar`
  - OpenAI text-embedding-3-small 또는 기존 사용 중인 모델 그대로
  - `match_math_tool_triggers` RPC 를 일반화 → `match_learning_tool_triggers(subject_anchor, query_embedding)` (선택, Phase 1 에서 본격)
  - Phase 0 에서는 임베딩 저장만 + 영문법 검색은 별도 RPC 호출로 충분
- **검증**:
  - 영문법 trigger ≥ 90 row 임베딩 완료
  - 샘플 쿼리: "주어가 복수인데 동사가 단수입니다" → 수일치 오류 도구 top-1 매칭
- **선행 의존성**: P0-06
- **예상 시간**: 반나절
- **Commit 메시지 prefix**: `feat:`

#### P0-08: 영어 문법 LLM 풀이 모드 진입 — Legend Tutor 영어 과목 확장
- **What**: 기존 Legend Tutor (수학) 에 영어 문법 모드 분기를 추가한다. 신규 페이지 X — 기존 `/legend` 페이지에 과목 선택 UI (수학 / 영어 문법 PoC) 추가. 영어 문법 모드 선택 시 system prompt 가 영어 문법 페르소나·trigger 검색·R1 카드 영어 문법 버전으로 전환.
- **Why**: roadmap.md §Phase 0 산출물 3 (Trigger 라이브러리 영어 문법 PoC) + architecture-platform.md §8-1 (Phase 1 영문법 PoC). Phase 1 의 영어 문법 인강 모드 출시 전 1차 PoC.
- **How**:
  - `src/app/legend/page.tsx` 에 `<SubjectPicker />` 컴포넌트 추가 (수학 / 영어 문법 PoC 토글)
  - `services/legend/orchestrator.ts` (또는 동등) 에 `subject_anchor` 파라미터 추가 → trigger 검색 시 필터 적용
  - 영문법 페르소나: 라이프니츠 (표기 설계) 호출 — architecture-platform.md §3-2 prompt 분리 활용
  - prompt 추가: `services/legend/prompts/english-grammar/system_base.md`
- **검증**:
  - `/legend` 진입 → 과목 선택 → "영어 문법 PoC" 선택 → 1턴 호출 성공
  - E2E 테스트: `e2e/legend-english-grammar-poc.spec.ts` 신규 (5 시나리오)
  - 가드레일 9 카테고리 system prompt 영어 문법 모드에서도 적용
- **선행 의존성**: P0-07
- **예상 시간**: 하루
- **Commit 메시지 prefix**: `feat:`

#### P0-09: 영어 문법 5 문제 수동 검증 + KPI 기록
- **What**: 영어 문법 문제 5개 (수능 기출 또는 EBS 모의고사) 를 P0-08 모드로 풀어보고 정답률 + trigger 추출 quality 를 수동 측정한다.
- **Why**: business-vision.md §3-3 입증된 KPI — 수학 89.5% 와 동등한 검증 절차를 영어 문법에 적용. Phase 1 진입 결정의 근거.
- **How**:
  - 검증 노트: `docs/qa/english-grammar-poc-validation.md` 신규
    - 5 문제 각각: 문제 본문 / 정답 / Legend 응답 / trigger 매칭 결과 / 합격 여부
  - 검증 룰: ① 정답률 ≥ 70% (5문제 중 ≥ 4 정답) ② trigger 매칭 top-3 안에 정답 도구 ≥ 70% ③ R1 카드 KaTeX 렌더 정상
  - 실패 시 P0-06 ~ P0-08 회귀
- **검증**:
  - `docs/qa/english-grammar-poc-validation.md` 5 문제 결과 기록
  - 정답률 ≥ 70% 도달
- **선행 의존성**: P0-08
- **예상 시간**: 반나절
- **Commit 메시지 prefix**: `docs:` (검증 결과)

---

### C. GTM 자료 + 동영상 + 추가 채널 (P0-10 ~ P0-13d)

#### P0-10: Legend Tutor 학습 효과 1-pager 작성
- **What**: 출판사 협상 + 텐볼스토리 콜드 메일 + 수만휘 후기 페이지에 공통 활용할 **1-pager 마케팅 자료** 를 작성한다 (PDF 가 아닌 마크다운 — 향후 PDF 변환).
- **Why**: roadmap.md §Phase 0 산출물 1 (마케팅 랜딩 페이지) 의 컨텐츠 소스 + business-vision.md §5 GTM Phase 1.
- **How**:
  - 파일: `docs/marketing/legend-tutor-1pager.md` 신규
  - 구성:
    1. **한 줄 소개**: "콴다는 답을 주고, Legend Tutor 는 답에 이르는 길을 가르친다" (business-vision v1.1 정정 인용)
    2. **입증된 KPI**: Gemini 3.1 Pro agentic 89.5% / GPT-5.5 86.8% (수능 38문항)
    3. **5거장 페르소나** 시각화 (이미지 placeholder)
    4. **Trigger 라이브러리 자산**: 244 도구 / 463 trigger / 926 임베딩
    5. **가드레일 9 + 위기상담** (신뢰 자산)
    6. **가격**: 단과 학원 1자리 framing (pricing-strategy v1.1 인용)
    7. **베타 사용자 후기 placeholder** (P0-15 후 채움)
- **검증**:
  - 1 페이지 분량 (마크다운 100줄 이하)
  - 모든 수치는 research_raw.md / business-vision.md 인용
- **선행 의존성**: 없음 (A·B 카테고리와 병렬)
- **예상 시간**: 반나절
- **Commit 메시지 prefix**: `docs:`

#### P0-11: 수만휘 자발적 후기 페이지 SEO 강화
- **What**: 기존 `/legend/reviews` 페이지를 수만휘·오르비·구글 검색 유입에 최적화한다. metadata 태그 + JSON-LD + 인덱싱 친화 구조.
- **Why**: roadmap.md §Phase 0 산출물 2 (수만휘·오르비 후기 게시 가이드) 의 도착 페이지. 후기 작성자가 본인 글에 링크를 걸 곳.
- **How**:
  - `src/app/legend/reviews/page.tsx` 의 `generateMetadata` 보강 — title / description / og:image
  - JSON-LD: `Review` schema.org 적용 (5거장 후기 카드)
  - 한국어 키워드: "수능 AI 튜터" / "Legend Tutor 후기" / "수만휘 AI 학습" 등
  - sitemap.xml 에 추가 (Next.js `app/sitemap.ts`)
- **검증**:
  - Google Rich Results Test 통과
  - 수동 검색: `site:vibe-coding-contest.vercel.app 후기` → 페이지 노출
  - Lighthouse SEO ≥ 95
- **선행 의존성**: 없음
- **예상 시간**: 2시간
- **Commit 메시지 prefix**: `feat:` 또는 `chore:`

#### P0-12: 텐볼스토리 콜드 메일 초안 작성
- **What**: 수만휘 운영사 텐볼스토리에 보낼 **B2B2C 파트너십 제안 콜드 메일 초안** 을 작성한다.
- **Why**: business-vision.md §5 Phase 1 GTM (텐볼스토리 회신 ≥ 1건) + research_raw.md §1 수만휘 314 만 회원·일평균 5만 게시글 채널.
- **How**:
  - 파일: `docs/marketing/tenballstory-outreach.md` 신규
  - 구성:
    1. **1 단락 hook**: 우리 KPI 89.5% + Trigger 자산 + 콴다 차별화 (1줄)
    2. **3 단락 제안**:
       - "수만휘 클래스 인강 + Legend Tutor 코칭 통합 PoC" (3개월 trial)
       - 분배 구조 baseline: 우리 70 / 텐볼스토리 30 (research_raw.md §3-4 음원 7:3 모델 기반)
       - 첫 검증 KPI: 수만휘 베타 50명 → 학습 효과 + 만족도 측정
    3. **CTA**: "이번 주 30분 미팅 가능?" + 미팅 링크 + 1-pager (P0-10) 첨부
  - 톤: 짧고 명료. 한 페이지 안에 끝나야 한다. (콜드 메일 응답률 룰)
- **검증**:
  - 1 페이지 (마크다운 80줄 이하)
  - 1-pager (P0-10) 링크 포함
- **선행 의존성**: P0-10
- **예상 시간**: 2시간
- **Commit 메시지 prefix**: `docs:`

#### P0-13: 수만휘 정회원 등업 조건 조사 + 자발적 후기 가이드
- **What**: 수만휘 정회원 등업 조건·후기 게시 룰·광고성 표현 회피 가이드를 정리한다. 베타 사용자 5명에게 배포할 한 페이지.
- **Why**: roadmap.md §Phase 0 산출물 2 (수만휘·오르비 후기 게시 가이드 PDF). research_raw.md §1-5 콴다 자발 바이럴 사례 참조.
- **How**:
  - 파일: `docs/marketing/sumanhwi-review-guide.md` 신규
  - 구성:
    1. 수만휘 정회원 등업 조건 (research_raw.md §1 인용 + 추가 조사)
    2. 자발적 후기 게시 가이드 — "광고처럼 보이지 않게" 룰 5개 (개인 경험 위주 / 구체 수치 / 단점 1개 포함 / 링크 자제 / 댓글 응답)
    3. 베타 사용자에게 강요 X 자율 게시 권장 (자발성 강조)
    4. 후기 예시 템플릿 1 (모범 사례)
- **검증**:
  - 1 페이지 (마크다운 100줄 이하)
  - 베타 5명에게 D 카테고리에서 배포 가능
- **선행 의존성**: 없음
- **예상 시간**: 2시간
- **Commit 메시지 prefix**: `docs:`

#### P0-13b: 학부모 카페 + 입시 유튜브 채널 리스트
- **What**: 수만휘 외 추가 노출 채널을 학부모·학생·중립 3 분류로 정리한 마케팅 채널 표를 작성한다. **학부모 결제가 핵심**이라는 가격 전략(`pricing-strategy.md` §4)에 따라 학부모 채널 비중 ≥ 50%.
- **Why**: business-vision.md §5 GTM Phase 1·2 (수만휘 외 인플루언서·학부모 카페). research_raw.md §6 의 콴다 SNS·커뮤니티 바이럴 사례 활용.
- **How**:
  - 파일: `docs/marketing/channel-map.md` 신규
  - 학부모 카페: 강남엄마 / 분당맘 / 일산맘 / 송파맘 / 더피아노 학부모카페 (5개+ 진입 정책 — 카페별 광고 게시 룰·정회원 등업·자발 후기 가능 여부)
  - 입시 유튜브: 박재석 일타연구소 / 드림빅TV / 입시TV (콜라보·협찬 진입 메일 템플릿)
  - 학생 채널: 수만휘 / 오르비(orbis.kr) / 디시 수능갤 / 인스타 #공부스타그램 #수능공부 (각 채널 룰)
  - 중립: 유튜브 (자체 채널) / 카카오톡 채널 / 학원 PoC
  - 각 채널 다음 4 컬럼: 회원수·홍보 정책·진입 비용·기대 효과 (정량 추정)
- **검증**:
  - 마크다운 200줄 이내, 채널 ≥ 12개, 학부모 채널 ≥ 5개
  - 출처 URL 명시 (research_raw.md 또는 직접 검색)
- **선행 의존성**: 없음
- **예상 시간**: 3시간
- **Commit 메시지 prefix**: `docs:`

#### P0-13c: 시연 영상 1편 — 2024 수능 21번 폰 노이만 풀이 + R1 리포트 (5분)
- **What**: Legend Tutor 가 실제 수능 킬러 문제(2024 공통 21번)를 **폰 노이만 페르소나** 로 풀이하고, **풀이 직후 R1 리포트(정직성·trigger_motivation·학생 막힘 5 차원·풀이 정리)까지 클로즈업** 하는 시연 영상. 영상의 클라이맥스 = 리포트. 사용자 결정(2026-05-03): "10분은 길다 + 핵심은 풀이 후 리포트".
- **Why**: business-vision.md §3 차별화 무기. **콴다·EBS·뤼튼은 답까지만 — 우리는 답 + 답에 이르는 길의 명제화 리포트**. 일타강사가 구두로 흩뿌리는 직관을 LLM 명제로 정리한 R1 카드를 영상으로 직접 보여주는 게 가장 빠른 신뢰 획득. 길이 단축으로 학부모/학생 시청 완료율 ↑.
- **How**:
  - 영상 구성 (5분 long):
    1. 인트로 (~15초): 폰 노이만 인사 + 21번 문제 제시
    2. 풀이 (2~3분): trigger 카드 노출 클로즈업 + 단계별 풀이
    3. **R1 리포트 클로즈업 (1~2분, 핵심)**: 추론 트리 / trigger_motivation / 정직성 vs 학습 코치 / 학생 막힘 5 차원 / "왜 정답인지" 명제 — 한 카드씩 zoom-in narration
    4. 아웃트로 (~10초): "콴다는 답을, 우리는 답에 이르는 길을 가르친다"
  - 자료 준비 (운영자):
    1. 녹화 시나리오 — `docs/marketing/video-script-1.md` (위 4 단계 분초 단위 narration)
    2. 화면 녹화 가이드 — `docs/marketing/recording-guide.md` (OBS Studio / 1920×1080 / 음성 가이드 / R1 카드 zoom-in 시점 명시)
    3. SEO 메타 — 제목 "AI 가 수능 풀이 후 주는 리포트 — 일타강사가 못 한 것" / 해시태그 #수능 #AI튜터 #일타강사 #리포트
    4. 자막 스크립트 (한국어, 영어는 후순위)
  - 사용자 액션:
    - **5분 long** 1편 (유튜브용) — 풀이 + 리포트
    - **40초 short** 1편 (인스타 릴스 / 틱톡용) — R1 카드 핵심 1~2개 클로즈업 + "왜 정답인지" 한 줄
- **검증**:
  - 자료 3종 (script / guide / SEO 메타) 작성 완료
  - 사용자 녹화 long 5분 + short 40초 1편씩 (Phase 0 종료 전)
  - 영상의 마지막 ≥ 30% 가 R1 리포트 클로즈업
- **선행 의존성**: P0-10 (1-pager — 영상 메시지 일관성)
- **예상 시간**: 자료 준비 3시간 / 녹화 2~3시간 (사용자, 단축)
- **Commit 메시지 prefix**: `docs:` (자료) + `chore:` (영상 자체는 git X)

#### P0-13d: 유튜브 채널 + 인스타 + 자동 양산 Playwright 스크립트
- **What**: 진정성 영상 1편(P0-13c) 후 양산 채널 정비 — 유튜브 채널 / 인스타 릴스 계정 개설 가이드 + Legend Tutor 풀이 자동 화면 녹화 Playwright 스크립트.
- **Why**: business-vision.md §5 GTM Phase 2 (인플루언서·SNS). 1편 검증 후 양산 가능한 인프라가 있어야 매주 1~2편 push 지속 가능.
- **How**:
  - 채널 개설 가이드: `docs/marketing/channel-setup.md` (유튜브 채널 / 인스타 / 틱톡 — 채널명·프로필·태그·재생목록 구조)
  - 자동 녹화 스크립트: `scripts/record-tutor-video.ts` (Playwright + ffmpeg)
    - 입력: 문제 ID + 페르소나
    - 동작: `/legend` 페이지 자동 진입 → 문제 입력 → 풀이 진행 → trigger 카드 캡처 → R1 카드 캡처 → mp4 합성
    - 출력: `output/{problem_id}-{persona}.mp4` (10~12분 long)
  - 음성 합성: 별도 (OpenAI TTS 또는 사용자 직접 dub)
- **검증**:
  - 스크립트 1회 실행 → mp4 1편 생성 (예: 2024-공통-21 / 라마누잔)
  - 영상 길이 ≥ 8분 / 화면 캡처 품질 ≥ 720p
- **선행 의존성**: P0-13c (시나리오·구성 검증 후 자동화)
- **예상 시간**: 채널 가이드 2시간 / 스크립트 6~8시간
- **Commit 메시지 prefix**: `feat:` (스크립트) + `docs:` (가이드)

---

### D. 베타 1명 → 5명 확장 (P0-14 ~ P0-16)

#### P0-14: 현재 pending 신청 1건 승인 + 베타 invite 발급
- **What**: `beta_applications` 테이블의 pending 신청 1건을 admin UI 에서 승인하고 30일 만료 invite 를 발급한다. **수동 액션** — 사용자 직접 처리.
- **Why**: roadmap.md §Phase 0 산출물 4 + business-vision.md §5 Phase 1 (베타 5명 모집 시작).
- **How**:
  - `/admin/beta-applications` 진입 → pending 신청 검토 → 승인 클릭
  - `list_beta_applications` RPC + `review_beta_application` RPC 동작 확인
  - 30일 만료 정책 자동 적용 검증 (13차 Δ28 베타 30일 정책)
  - 승인 후 사용자 이메일에 invite 링크 발송 (자동 또는 수동)
- **검증**:
  - `beta_applications.status='approved'`
  - `euler_beta_invites` 에 신규 row + `expires_at` = now + 30 days
  - 사용자 가입·로그인 → Legend Tutor 사용 가능
- **선행 의존성**: 없음 (A·B 와 병렬)
- **예상 시간**: 30분 (수동)
- **Commit 메시지 prefix**: `chore:` 또는 코드 변경 없음 — Phase 0 진행 보고 commit

#### P0-15: 추가 베타 4명 지인 모집 + 송출
- **What**: 베타 5명 cap 을 채우기 위해 **지인 4명** 을 우선 모집한다 (사용자 결정 2026-05-03). 후속 채널 (수만휘·인스타·학부모 카페) 은 Phase 0 종료 후 백로그.
- **Why**: roadmap.md §Phase 0 산출물 4 (베타 5명 가입 완료 100%). 1차 정밀 검증은 지인 4명이 적절 — 피드백 채널이 직접적이고 빠름.
- **How**:
  - 모집 메시지 템플릿: `docs/marketing/beta-recruitment-msg.md` 신규 — 카카오톡 1:1 / 지인 그룹 메시지용 본문 (베타 권리·30일 무료·자발 리뷰 권유 명시)
  - `/legend/beta/apply` 페이지 점검 — 13차 Δ27 후속에서 가시성·N수생 옵션 fix 완료 (커밋 1dffc3a)
  - 모집 대시보드: admin 에서 `pending` 신청 실시간 모니터링
  - **사용자 액션**: 지인 4명에게 메시지 직접 송출 (운영자 = 사용자 본인)
- **검증**:
  - 4명 지인 신청 접수 (Phase 0 종료 시점)
  - 5명 모두 가입·온보딩 완료 → 1턴 이상 사용
- **선행 의존성**: P0-14, P0-13 (자발 후기 가이드 사전 준비)
- **예상 시간**: 메시지 작성 1시간 + 송출 (사용자)
- **Commit 메시지 prefix**: `docs:` (메시지) + `chore:` (송출 진행)

#### P0-16: 신규 베타 사용자 온보딩 체크리스트 작성
- **What**: 새로 가입한 베타 사용자가 첫 7일 동안 거쳐야 할 단계를 체크리스트로 정리한다. 운영자가 1:1 으로 안내할 수 있도록.
- **Why**: roadmap.md §Phase 0 베타 5명 30일 사용 완료율 ≥ 80% (4/5) KPI 달성을 위한 핵심 운영 자료.
- **How**:
  - 파일: `docs/qa/beta-onboarding-checklist.md` 신규
  - 구성:
    - **Day 1**: 가입·로그인·과목 선택·첫 풀이 1건 (chain miss 발생 시 운영자 즉시 fix)
    - **Day 3**: 5거장 페르소나 모두 호출 1회 이상
    - **Day 7**: R1 카드 즐겨찾기 1건 + 자발 후기 1줄 메모 (선택)
    - **Day 14**: 누적 풀이 ≥ 20문제 + `/legend/beta/review` 자발 리뷰 작성 알림 (이메일/푸시)
    - **Day 30**: 최종 리뷰 작성 안내 + 자발 후기 게시 권유 (강요 X)
  - 운영자 액션: 매 단계 누락 시 카카오톡·이메일 1:1 안내
- **검증**:
  - 5명 모두 Day 1 통과 → 1턴 이상 사용
  - Day 14 자발 리뷰 게시 ≥ 4 / 5 (80%)
- **선행 의존성**: P0-15
- **예상 시간**: 2시간
- **Commit 메시지 prefix**: `docs:`

---

## 3. 의존성 그래프

```
A 카테고리 (Legend 보강)
  P0-01 (베타 1명 분석) ──┬──→ P0-02 (chain miss)
                          ├──→ P0-03 (R1 KaTeX)
                          └──→ P0-04 (persona + 리뷰 모니터링 placeholder)

B 카테고리 (영문법 PoC)
  P0-05 (스키마) ──→ P0-06 (anchor seed) ──→ P0-07 (임베딩) ──→ P0-08 (LLM 모드) ──→ P0-09 (검증)

C 카테고리 (GTM 자료 + 동영상 + 추가 채널)
  P0-10 (1-pager) ──→ P0-12 (텐볼스토리 콜드 메일)
                  └─→ P0-13c (시연 영상 1편) ──→ P0-13d (채널·자동 양산)
  P0-11 (SEO) — 독립
  P0-13 (수만휘 가이드) — 독립
  P0-13b (학부모·유튜브 채널 맵) — 독립

D 카테고리 (베타 확장)
  P0-14 (1건 승인) ──→ P0-15 (4명 모집) ──→ P0-16 (온보딩)
                                  ↑
                                  P0-13 (수만휘 가이드)
```

병렬 실행 가능 묶음:
- **Day 1~3**: A 전체 (P0-01 → P0-02·03·04 병렬)
- **Day 4~7**: B 전체 + C 의 P0-10·P0-11·P0-13·P0-13b 병렬
- **Day 8~12**: C 의 P0-12 + P0-13c (영상 1편) + D 전체 (P0-14 → P0-15 → P0-16)
- **Day 12~14**: P0-13d (채널·자동 양산) + 회귀 + 회고 + 누락 task 보완

---

## 4. 일정 (2주, 2026-05-02 ~ 2026-05-16)

| 주차 | 일자 (M-D) | Task | 비고 |
|---|---|---|---|
| **Week 1** | 5/2 (금) ~ 5/3 (토) | P0-01 (베타 1명 분석) | 분석 결과 기반 P0-02·03·04 우선순위 결정 |
| Week 1 | 5/4 (일) ~ 5/5 (월) | P0-02 (chain miss) + P0-03 (R1 KaTeX) | 병렬 |
| Week 1 | 5/6 (화) | P0-04 (persona + 리뷰 모니터링 placeholder) | A 종료 |
| Week 1 | 5/7 (수) | P0-05 (스키마) + P0-06 시작 (anchor 정의) | B 시작 |
| Week 1 | 5/8 (목) ~ 5/9 (금) | P0-06 (30 도구 seed) + P0-07 (임베딩) | |
| **Week 2** | 5/10 (토) | P0-08 (LLM 영문법 모드) | |
| Week 2 | 5/11 (일) | P0-09 (5 문제 검증) + P0-10 (1-pager) 병렬 | B 종료 |
| Week 2 | 5/12 (월) | P0-11 (SEO) + P0-13 (수만휘 가이드) + P0-13b (학부모·유튜브 채널 맵) 병렬 | |
| Week 2 | 5/13 (화) | P0-12 (텐볼스토리 콜드 메일) + P0-13c 자료 준비 (시나리오·녹화 가이드) + P0-14 (1건 승인) | |
| Week 2 | 5/14 (수) | P0-13c 영상 녹화 (사용자 직접) + P0-15 (4명 모집 송출) | |
| Week 2 | 5/15 (목) | P0-13d (채널 개설 + 자동 양산 스크립트) + P0-16 (온보딩 체크리스트) | C·D 종료 |
| Week 2 | 5/16 (금) | 회고 + 누락 task 보완 + Phase 1 진입 결정 | Phase 0 종료 |

---

## 5. 회고 체크리스트 (Phase 0 종료 시점, 2026-05-16)

### 5-1. 산출물 검수
- [ ] **A 카테고리**: 베타 1명 발굴 결함 ≥ 3개 모두 P1 fix 완료 → 5명에게 동일 결함 재발 X
- [ ] **B 카테고리**: 영어 문법 6 anchor + 30 도구 seed + 임베딩 완료 → `/legend` 영문법 모드 1턴 호출 가능
- [ ] **B 카테고리**: 영어 문법 5 문제 검증 정답률 ≥ 70%
- [ ] **C 카테고리**: 1-pager + 텐볼스토리 콜드 메일 + 수만휘 가이드 + SEO 강화 4개 + 학부모·유튜브 채널 맵 + 시연 영상 1편 (long+short) + 자동 양산 스크립트 = 7개 산출물 완료
- [ ] **D 카테고리**: 베타 5명 가입 완료 100% (5/5)

### 5-2. KPI 달성 여부
- [ ] 수만휘 자발 후기 게시 ≥ 1 건
- [ ] 텐볼스토리 콜드 메일 회신 ≥ 1 건 (또는 발송 완료)
- [ ] 영문법 PoC 5 문제 정답률 ≥ 70%
- [ ] 시연 영상 long 5분 + short 40초 업로드 완료 (유튜브·인스타) — R1 리포트 클로즈업 ≥ 30% 분량

### 5-3. Phase 1 진입 결정
- [ ] 영문법 PoC 정답률 ≥ 70% → Phase 1 (5과목 확장) 진입 GO
- [ ] 베타 5명 30일 사용 완료율 추이 양호 → 마케팅 본격화 GO
- [ ] 수만휘 후기 0건 + 텐볼스토리 회신 X → Pivot (텐볼스토리 정식 제휴 우선 또는 자체 SNS 전환) 검토

### 5-4. 다음 Phase 진입 조건
- A·B·D 카테고리 100% 완료 시 Phase 1 진입 (roadmap.md §Phase 1 — 5과목 확장)
- C 카테고리 50% 미만 시 Phase 1 시작 후 백로그 처리

---

## 부록 A. 1 Task = 1 Commit 매핑 표 (Phase 0 종료 시점 갱신)

> 각 task 가 commit 된 후 이 표를 즉시 갱신한다 (CLAUDE.md global "태스크 완료 즉시 갱신" 룰).

| Task | Commit Hash | 완료 일자 | 비고 |
|---|---|---|---|
| P0-01 | (pending) | | |
| P0-02 | (pending) | | |
| P0-03 | (pending) | | |
| P0-04 | (pending) | | |
| P0-05 | (pending) | | |
| P0-06 | (pending) | | |
| P0-07 | (pending) | | |
| P0-08 | (pending) | | |
| P0-09 | (pending) | | |
| P0-10 | (pending) | | |
| P0-11 | (pending) | | |
| P0-12 | (pending) | | |
| P0-13 | (pending) | | |
| P0-13b | (pending) | | 학부모·유튜브 채널 맵 |
| P0-13c | (pending) | | 시연 영상 1편 (폰 노이만 / 21번 / 5분 / R1 리포트 핵심) |
| P0-13d | (pending) | | 채널 개설 + 자동 양산 |
| P0-14 | (pending) | | |
| P0-15 | (pending) | | |
| P0-16 | (pending) | | |

---

## 부록 B. 참고 — Phase 0 후 Phase 1 진입 시 즉시 시작할 task 후보

(roadmap.md §Phase 1 인용 — 본 plan 의 범위는 아니지만 P0-16 종료 시점에 다음 plan 작성을 시작한다)

1. 소크라테스 튜터 중·고등 분리 (`/socratic/middle`, `/socratic/high`)
2. 5과목 anchor 30개 추가 (수학 6 + 영어 6 + 국어 6 + 사회 6 + 과학 6 = 30)
3. 영어 문법 인강 모드 (`/english/grammar/lecture`) — Phase 0 의 영문법 코칭 모드를 인강 모드로 확장
4. textbooks 테이블 사전 준비 (Phase 4 출판사 라이선스 baseline)

상세는 `docs/implementation_plan_phase1.md` 신규 작성 (Phase 0 종료 후).
