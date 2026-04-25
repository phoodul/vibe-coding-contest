# Euler Tutor 2.0 — Implementation Plan

> 작성일: 2026-04-25
> 범위: Phase A~D 전체 (약 14주). Phase A는 일자별, Phase B~D는 주차별
> 가용 시간: 주 30시간 (1인). 솔로 참가자 자율 작업 권한 위임 기준
> 코드 외 작업(법무 자문, 베타 모집)은 백그라운드로 병렬 진행
> 본 문서는 기존 `docs/implementation_plan.md`(EduFlow 전체)와 별개. Euler Tutor 2.0 업그레이드 전용

---

## 1. Phase A — 첫 4주 일자별 일정 (주 30시간 기준)

> Phase A 총 14 Task × 평균 4~5K 토큰 + 디버깅 = 약 30~35시간.
> 안전 버퍼 5시간 포함 → 4주 (28일) × 7.5h/일 균등 분배. 단 주말은 5h, 평일은 6h.

### Week 1 — 기반 정리 + Critic Agent (Task A-01 ~ A-06)

| 일자 | 시간(h) | Task | 산출물 |
|---|---|---|---|
| 04-26 (일) | 5 | A-01 docs/.env.example 정리 | docs/project-decisions.md 갱신, .env.example |
| 04-27 (월) | 6 | A-02 디렉터리 골격 + A-03 Critic 프롬프트 시작 | src/lib/euler/index.ts, euler-critic-prompt.ts 초안 |
| 04-28 (화) | 6 | A-03 Critic 프롬프트 완성 + few-shot 2개 | euler-critic-prompt.ts 확정 |
| 04-29 (수) | 6 | A-04 /api/euler-tutor/critic 라우트 + 단위 테스트 5케이스 | critic/route.ts |
| 04-30 (목) | 6 | A-05 orchestrator 통합 + EULER_CRITIC_ENABLED 토글 | route.ts 수정 |
| 05-01 (금) | 6 | A-06 Coaching 프롬프트 verified 분기 | euler-prompt.ts 갱신 |
| 05-02 (토) | 5 | Week 1 회귀: 수능 1~25번 10문항 코칭 응답 점검 | 결함 노트 |

**Week 1 Gate**: Critic이 정답 5케이스/오답 5케이스 100% 분류 + 정답에서 의심 발화 0회.

### Week 2 — PWA + 필기 모드 (Task A-07 ~ A-11)

| 일자 | 시간(h) | Task | 산출물 |
|---|---|---|---|
| 05-03 (일) | 5 | A-07 PWA manifest + service worker | public/manifest.json, next.config.js |
| 05-04 (월) | 6 | A-08 HandwriteCanvas 데스크톱 마우스 동작 | HandwriteCanvas.tsx 1차 |
| 05-05 (화) | 6 | A-08 Apple Pencil + pressure 가변선 | iOS PWA 테스트 |
| 05-06 (수) | 6 | A-09 canvas-stroke-encoder util + 다운스케일 | encoder.ts |
| 05-07 (목) | 6 | A-10 parse-image handwritten 옵션 추가 | parse-image route 갱신 |
| 05-08 (금) | 6 | A-10 손글씨 5장 정확도 측정 + 보강 | 정확도 노트 |
| 05-09 (토) | 5 | A-11 /euler/canvas 페이지 + 채팅 연결 | canvas/page.tsx |

**Week 2 Gate**: iPad PWA에서 Apple Pencil로 손글씨 → 30초 내 첫 코칭. 정확도 80%+.

### Week 3 — UX 마감 + 베타 게이트 (Task A-12 ~ A-13)

| 일자 | 시간(h) | Task | 산출물 |
|---|---|---|---|
| 05-10 (일) | 5 | A-12 ThoughtStream UI 1차 | ThoughtStream.tsx |
| 05-11 (월) | 6 | A-12 Framer Motion 애니메이션 + 스트리밍 | 시각 마감 |
| 05-12 (화) | 6 | A-13 euler_beta_invites 테이블 + 코드 입력 화면 | beta/page.tsx |
| 05-13 (수) | 6 | A-13 라우트 가드 + EduFlow 배너 | layout 갱신 |
| 05-14 (목) | 6 | LEG-01 약관/개인정보 초안 작성 (병렬) | legal/* page |
| 05-15 (금) | 6 | LEG-02 법무 자문 의뢰 송부 + Phase A QA 시작 | 검토 의뢰서 |
| 05-16 (토) | 5 | Phase A 회귀 1차 — 텍스트 모드 10문항 | qa/phase-a checklist 1차 |

**Week 3 Gate**: 베타 게이트 동작 + 법무 검토 의뢰 완료 + 텍스트 모드 회귀 95%+.

### Week 4 — Phase A 통합 테스트 + 출시 (Task A-14)

| 일자 | 시간(h) | Task | 산출물 |
|---|---|---|---|
| 05-17 (일) | 5 | A-14 사진 모드 10문항 회귀 | qa 갱신 |
| 05-18 (월) | 6 | A-14 필기 모드 10문항 회귀 | qa 완성 |
| 05-19 (화) | 6 | P0 결함 수정 | 핫픽스 commits |
| 05-20 (수) | 6 | 베타 모집 카피 + 신청 폼 마감 | 모집 페이지 라이브 |
| 05-21 (목) | 6 | 클로즈드 베타 50명 초대 발송 | 초대 메일 발송 |
| 05-22 (금) | 6 | 초기 사용자 피드백 수집 + 핫픽스 | 결함 추적 |
| 05-23 (토) | 5 | Phase A 종료 회고 + Phase B 준비 | docs/work-log.md 갱신 |

**Week 4 Gate (Phase A 종료 조건)**:
- 베타 50명 가입 완료
- "정답인데 의심하는" 케이스 0%
- 필기 OCR 80%+
- P0 결함 0건

---

## 2. Phase B~D 주차별 일정 (개요)

### Phase B — 도구 라이브러리 + RAG (4주, 05-24 ~ 06-20)

| 주차 | Task | 핵심 산출물 |
|---|---|---|
| Week 5 | B-01 ~ B-04 | pgvector 마이그레이션 3종 + 임베딩 유틸 |
| Week 6 | B-05 (집중) | 시드 자동화 파이프라인 + 미적분 ≥30 도구 입력 + 임베딩 적재 |
| Week 7 | B-06 ~ B-11 | Manager + Retriever + 검수 큐 어드민 |
| Week 8 | B-12 ~ B-16 | orchestrator 통합 + 코칭 프롬프트 + 회귀 |

**Week 6 집중 사유**: 시드 자동화(Mathpix → Sonnet 메타데이터 → 검수)를 먼저 만들어 두면 이후 30개 → 100개 → 300개 확장이 같은 도구로 반복됨. 초기 30개는 약 8~10시간 (자동화 도구 5시간 + 사용자 검수 3~5시간). 이 작업이 도구 hit rate 70% KPI를 좌우.

### Phase C — Reasoner BFS + 학습 리포트 (3주, 06-21 ~ 07-11)

| 주차 | Task | 핵심 산출물 |
|---|---|---|
| Week 9 | C-01 ~ C-03 | Forward/Backward BFS + 분기 병렬 |
| Week 10 | C-04 ~ C-07 | orchestrator 통합 + logs(stuck 진단) + Critic stuck 분류 활성화 |
| Week 11 | C-08 ~ C-13 | layer 통계 + 진단형 약점 리포트 + 진척 대시보드 + Free 일일 한도 + 학원 인터뷰 |

### Phase D — SymPy + 결제 + 가족/학원 (3주, 07-12 ~ 08-01)

| 주차 | Task | 핵심 산출물 |
|---|---|---|
| Week 12 | D-01 ~ D-03 | Railway FastAPI + 프록시 |
| Week 13 | D-04 ~ D-07 | tool calling + 가족 잠금 + 학원 대시보드 |
| Week 14 | D-08 ~ D-10 | Toss 결제 + 업셀 + 정식 출시 |

법무 작업(LEG-01~04)은 Week 3부터 백그라운드 진행. LEG-04 cron은 Phase D 종료 직전 마무리.

---

## 3. 기술적 의사결정 근거 표 (압축본)

| 결정 | 채택 | 기각 | 근거 (research_raw.md / integrator_report.md) |
|---|---|---|---|
| 오케스트레이션 | AI SDK v4 generateText 다단 호출 | LangGraph (Python) | 1인 운영 + Next.js 단일 스택 유지. integrator §3.1 |
| Reasoner/Coaching 모델 | useGpt 토글: Sonnet 4.6(=오일러) ↔ GPT-5.1(=가우스) | 단일 모델 | 기존 듀얼 페르소나 UX 유지(`src/app/euler-tutor/page.tsx`). 학생이 두 모델 비교 학습 가능 |
| Manager/Critic/난이도 분류 모델 | Claude Haiku 4.5 (학생 토글 무관, 항상) | Sonnet | 비용 1/5. 단순 분류·검증·진단 충분. 토글 영향 받지 않음 |
| 입력 모드 | 텍스트 + 사진 + 필기(신규) 공존, `input_mode` 명시 | 단일 입력 | 데스크톱은 텍스트, 폰은 사진, iPad는 필기. 음성은 차후 검토 |
| 학습 리포트 | layer × 진단 카테고리 (recall vs trigger 분리) | 정답률 단일 지표 | 사용자 정정 — "어디서 막히는가"가 진짜 가치. user_layer_stats 신규 + L6 recall_miss/trigger_miss 별도 카운트 |
| CAS Phase A~C | Anthropic tool calling 우회 | Vercel Python, Pyodide | research_raw §2 — Vercel cold start 1~3초 + 250MB 한계 |
| CAS Phase D | Railway FastAPI + SymPy | Wolfram Alpha | 비용 $5~10/월 vs Wolfram $25+. tool calling 일관성 |
| 벡터 DB | Supabase pgvector | Pinecone, Qdrant | 이미 Supabase 사용 중. 별도 인프라 0원 |
| 임베딩 | OpenAI text-embedding-3-small | Voyage, Cohere | 1M $0.02. 1536 차원 pgvector 호환 |
| OCR | Mathpix + Upstage + Vision (기존) + handwritten | Pix2Text, Nougat | research_raw §4 — 한국 학생 폰 사진에서 Mathpix 99% |
| 파인튜닝 | 미도입 (RAG + few-shot) | o4-mini RFT, Qwen3 SFT | research_raw §3 — 1인 단계 ROI 음수 |
| 필기 입력 | PWA + Canvas 2D + Pointer Events | React Native, Flutter | 단일 스택 유지. iOS/Android 동시 지원 |
| 결제 | Toss Payments | Stripe, KG이니시스 | 한국 B2C 표준. 12,000원 정기결제 SDK |
| DB 스키마 핵심 | `(tool × trigger)` 곱집합 + direction 분리 | tool 단일 테이블 | 사용자 통찰 §math_layers.md L6 dict key-value list 반영 |
| 임베딩 인덱스 | forward/backward 분리 인덱스 | 단일 인덱스 | 사용자 통찰: 순행 BFS와 역행 BFS는 검색 의도가 다름 |
| 코칭 톤 | EULER_SYSTEM_PROMPT 6단계 유지 + verified 신호 추가 | 전면 재작성 | 기존 강점 보존 (사용자 강조 "수학의 바이브코딩") |

---

## 4. 위험 요소 + 대응책

### 4.1 기술적 위험

| 위험 | 가능성 | 영향 | 완화 |
|---|---|---|---|
| Anthropic API rate limit (Phase C 풀 파이프라인 동시 호출) | 중 | 중 | Phase C 시작 시 Anthropic Tier 측정. Tier 4 미달 시 Tier 4 신청 (보통 1~2주 내). 폴백: 동시 sub-task 직렬화 |
| Mathpix 손글씨 정확도 저조 | 중 | 높음 (Phase A KPI 직결) | A-08~A-10에서 사용자 5명 손글씨 사진 사전 테스트. 80% 미달 시 stroke 이미지 전처리(이진화, 기울기 보정) 추가 Task 삽입 |
| pgvector ivfflat 검색 P95 > 100ms | 낮 | 중 | 1만 row까지는 lists=100 충분. 초과 시 lists 증가 또는 HNSW 마이그레이션 |
| Reasoner BFS 응답 P95 > 20초 (Phase C) | 중 | 높음 | 분기 병렬 + 단계 max_depth=4 제한 + Sonnet extended thinking budget=4096. 초과 시 깊이 제한을 3으로 축소 |
| Critic stuck 분류 정확도 미달 (recall vs trigger 혼동) | 중 | 높음 (학습 리포트 가치 직결) | 보조 신호 활용: Retriever가 도구 후보를 반환했는데 학생이 못 떠올림 → trigger 실패. Retriever가 후보 자체를 못 찾음 → recall 실패. 합성 케이스 4종으로 검증. 80% 미달 시 Critic 프롬프트 few-shot 보강 |
| 시드 자동화 hash 차단 임계값 부적절 | 낮 | 높음 (저작권) | 임계값 보수적으로 시작(trigram Jaccard 0.6) → false positive 다수 발생 시 0.7~0.8로 완화. AI 자체 표현 강제 후 검수자가 1회 더 확인 |
| Railway μSvc 장애 (Phase D) | 낮 | 중 | tool calling 폴백을 그대로 유지 (Reasoner가 직접 풀이). 사용자에게 차이 무영향 |
| Toss Payments webhook 실패 | 낮 | 높음 | webhook 재시도 + idempotent 키 + 결제 상태 polling 백업 |
| extended thinking 비용 폭증 | 중 | 중 | budget_tokens=4096 상한. 일일 비용 모니터링 (usage_events 기반) |

### 4.2 비기술 위험

| 위험 | 가능성 | 완화 |
|---|---|---|
| 도구 30개 직접 입력 부담 | 높음 | Mathpix 사진 → Sonnet 메타데이터 자동 생성 + 사용자 5분 검수 패턴. B-05 Task에 시드 자동화 포함 |
| 저작권 — 정석/교과서 원문 우발 저장 | 중 | B-05 Task 검증 단계에 "원문 동일성 hash 비교" 추가. AI 자체 표현 강제 |
| 베타 50명 미달 | 중 | 기존 EduFlow 활성 사용자 + 학원 1곳 시범 + 트위터/네이버 카페 |
| 법무 자문 지연 | 중 | LEG-01 초안을 Week 3에 의뢰 → 통상 2~4주. Phase D 결제 라이브 전까지 검토 완료 필요 |
| 학원 도입 거절 | 중 | Phase C에서 학원 1곳 인터뷰 → 도입 동의 못 받으면 Phase D 학원 대시보드 우선순위 ↓ + B2C 집중 |
| 사용자가 답 공개만 사용 (코칭 가치 미증명) | 중 | 답 공개 후에도 "왜 그렇게 풀었나" 질문 시 사고 과정 설명 강제. Family/Academy `lock_reveal` 토글로 부모/교사가 잠금 가능. 베타 사용 데이터로 "코칭 vs 답 공개" 사용 비율 측정 후 Free 한도 조정 |

### 4.3 비용 위험

학생 100명 가정 월 비용 약 $200~310 (integrator §5).

| 시나리오 | 가정 | 월 비용 | 대응 |
|---|---|---|---|
| 베이스 (Phase D 완료) | 학생 100, 풀이 50/학생 | $250 | OK |
| 사용자 폭증 | 학생 1,000 | $2,000+ | Phase E 검토. prompt caching 적극 적용. Haiku 비중 증가 |
| Sonnet extended thinking 남용 | 평균 thinking 5K 토큰 | +$100 | budget 3K로 축소. critic 결과 cache 도입 |
| Mathpix 폭증 | 학생당 월 30 이미지 | +$10 | OK |

손익분기: 월 25~40명 유료 구독 (12,000원 기준).

---

## 5. 테스트 전략

### 5.1 단위 테스트 (vitest)

| 대상 | 커버리지 목표 | 비고 |
|---|---|---|
| `src/lib/euler/canvas-stroke-encoder.ts` (A-09) | 90% | dataURL 크기, 다운스케일 분기 |
| `src/lib/euler/embed.ts` (B-04) | 80% | mock OpenAI fetch |
| `src/lib/euler/retriever.ts` (B-08) | 80% | mock pgvector RPC |
| `src/lib/euler/tool-reporter.ts` (B-10) | 90% | dedup 로직 |
| `src/lib/euler/difficulty-classifier.ts` (B-06) | 80% | mock Haiku |
| `src/lib/euler/orchestrator.ts` (C-03) | 70% | BFS 분기, sub-task 병렬 |
| `src/lib/euler/usage-quota.ts` (C-11) | 90% | 일일 풀이 시작 카운팅 경계값 |
| `src/lib/euler/sympy-client.ts` (D-03) | 80% | mock Railway fetch |

기존 EduFlow가 vitest 미사용이면 신규 Task A-02에서 vitest 도입 (devDependency 추가).

### 5.2 통합 테스트 (수동 + 시나리오 체크리스트)

| Phase | 체크리스트 | 통과 기준 |
|---|---|---|
| A | `docs/qa/phase-a-checklist.md` | 텍스트 10 + 사진 10 + 필기 10 = 30 시나리오 95%+ |
| B | `docs/qa/phase-b-checklist.md` | 도구 hit rate 70%+, "왜" 포함 90%+ |
| C | `docs/qa/phase-c-checklist.md` | 28~30번 정답률 70%+, 약점 리포트 5초 이내 |
| D | `docs/qa/phase-d-checklist.md` | 결제 → 가족 잠금 → 교사 대시보드 end-to-end |

### 5.3 회귀 테스트

기존 기능 회귀 차단:
- MindPalace, English Village, Conversation, Lesson Prep, Analytics — 매 Phase 종료 시 5분 smoke test
- 자동화: `pnpm build` + Playwright (있다면) `--grep mindpalace|english|conversation` 실행

### 5.4 성능 측정

- Phase A 종료: Lighthouse PWA 점수 80+, 텍스트 모드 P95 응답 < 8초
- Phase B 종료: 난이도 4~5 응답 P95 < 12초, Retriever P95 < 100ms
- Phase C 종료: 풀 파이프라인 P95 < 20초
- Phase D 종료: SymPy tool call 평균 < 500ms

---

## 6. 배포 전략

### 6.1 환경 분리

- `main` 브랜치 → Vercel 프로덕션 (`eduflow.vercel.app` 또는 사용자 도메인)
- `preview/euler-2.0` 브랜치 → 베타 도메인 (Phase A~B 동안 Vercel preview URL 사용)
- 환경변수: 프로덕션과 preview를 분리 (`EULER_CRITIC_ENABLED` 등 토글로 단계 노출)

### 6.2 베타 게이트 (Phase A~B)

- `/euler/canvas`, `/euler/report` 등 신규 라우트는 `euler_beta_invites.status='active'` 체크
- 미인증 사용자는 `/euler/beta` 페이지로 리다이렉트 → 코드 입력
- 기존 `/euler` 채팅 페이지는 비차단 (이미 운영 중)

### 6.3 점진적 노출

| 시점 | 노출 대상 | 기능 |
|---|---|---|
| Phase A 종료 (Week 4) | 클로즈드 베타 50명 | 텍스트 + 사진 + 필기 + Critic |
| Phase B 종료 (Week 8) | 동일 50명 | + 도구 라이브러리 (RAG) |
| Phase C 종료 (Week 11) | 50명 + 학원 1곳 시범 | + Reasoner BFS + 약점 리포트 |
| Phase D 종료 (Week 14) | 일반 공개 (베타 게이트 해제) | + SymPy + 결제 + 가족/학원 |

### 6.4 EduFlow 사용자 노출 경로

- EduFlow 메인 화면에 "오일러 튜터 2.0 베타" 배너 (Week 3부터)
- 배너 → 베타 신청 폼 → 승인 시 `euler_beta_invites` insert
- 학원 채널: 사용자가 운영 중인 학원 네트워크에 직접 안내 (B2B)
- 부모/교사 채널: Phase C 학원 인터뷰에서 5명 이상 부모 컨택

### 6.5 롤백 계획

| 시나리오 | 롤백 절차 |
|---|---|
| Critic API 장애 | `EULER_CRITIC_ENABLED=false` 환경변수 토글 → 즉시 기존 동작 |
| Manager/Retriever 장애 (Phase B+) | orchestrator의 분기 게이트 환경변수 (`EULER_ROUTER_ENABLED`) → false 시 기존 단일 호출 |
| Reasoner BFS 응답 지연 (Phase C) | `EULER_REASONER_MAX_DEPTH=2` 환경변수로 깊이 축소 → 응답 가속 |
| SymPy μSvc 장애 (Phase D) | `SYMPY_SERVICE_URL` 빈 문자열 → tool calling 자동 비활성, Reasoner 단독 처리 |
| 결제 webhook 오작동 (Phase D) | Toss 측 webhook 비활성 + 수동 결제 확인 mode |
| DB 마이그레이션 오류 | Supabase migration revert + `git revert` 마이그레이션 commit |

모든 환경변수 토글은 `process.env` 직접 참조, 빌드 재배포 없이 Vercel 대시보드에서 즉시 반영.

### 6.6 Conventional Commits 적용

CLAUDE.md Language 섹션 준수:
- `feat: Critic Agent 라우트 추가`
- `feat: 필기 모드 PWA Canvas 도입`
- `feat(euler): 도구 라이브러리 pgvector 스키마 적용`
- `fix: Mathpix 손글씨 옵션 누락 수정`
- `chore: euler 디렉터리 골격 생성`
- `docs: Phase A QA 체크리스트 정리`

72자 이내. 본문은 한글 "왜"를 설명.

---

## 7. 사전 준비 사항 (Phase A 시작 전)

체크리스트:
- [ ] `.env.local`에 `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `MATHPIX_APP_ID`, `MATHPIX_API_KEY`, `UPSTAGE_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 존재 (값 노출 금지, 키 이름만 `cut -d= -f1`로 확인)
- [ ] Anthropic 계정 Tier 2+ (Sonnet 4.6 + Haiku 4.5 동시 호출 가능)
- [ ] Supabase Pro 활성 (pgvector 사용 대비)
- [ ] Vercel Pro 활성 (Cron 작업 + 빌드 시간 여유)
- [ ] `pnpm` 또는 `npm` 빌드 정상 (`pnpm build`)
- [ ] iPad + Apple Pencil 1대 확보 (필기 모드 테스트)
- [ ] 베타 모집 카피 초안 (Week 3에 사용)
- [ ] 학원 인터뷰 컨택 1곳 선정 (Phase C 대비)

비밀 안전 재확인: 본 문서와 채팅 어디에도 .env 값을 붙여넣지 않는다. 키 존재만 확인.

---

## 8. 성공 정의 (Definition of Done)

Phase D 완료 시점:
- 베타 게이트 해제 + 일반 공개
- 클로즈드 베타 50명 → 유료 전환 30%+ (15명 이상 결제)
- 수능 28~30번 정답률 70%+ (자체 측정, 30문항 샘플)
- 단순 계산 환각 0% (SymPy tool calling 적용)
- 학원 1곳 시범 도입 진행 중
- 법무 검토 통과 + 만 14세 미만 부모 동의 절차 라이브
- /admin/analytics에서 Euler 이벤트 추적 정상

이후 Phase E (사용자 풀이 누적 → RAG 가중치 자가 강화)로 이행 가능 상태.
