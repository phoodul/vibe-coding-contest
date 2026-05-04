> 버전 1.1 / 작성일 2026-05-02 / Author: Architect Agent
> 관련 문서: [business-vision.md](./business-vision.md) · [pricing-strategy.md](./pricing-strategy.md) · [roadmap.md](./roadmap.md) · [research_raw.md](./research_raw.md) · [implementation_plan_phase0.md](./implementation_plan_phase0.md)
> v1.1 변경 요약: 다른 3 문서 v1.1 정정사항 (콴다 차별화 / 단과 1자리 / 메가스터디 역전) 반영 / Phase 0 implementation plan 링크 추가 (아키텍처 자체 변경 없음)

# Architecture Platform — 출판사 플랫폼으로의 진화

## 1. 현재 아키텍처 스냅샷 (2026-05-02 기준)

### 1-1. 16 도구 구조

```
[학생 12 도구]                    [교사 4 도구]
├─ Legend Tutor                   ├─ 수업 자료 생성
├─ 영어 회화                       ├─ 학습지 생성
├─ 마인드맵                        ├─ 평가 도구
├─ 독서                            └─ 학생 모니터링
├─ 단어장
├─ 학습지
├─ 오일러 튜터 (수학)
├─ 가우스 튜터 (수학 듀얼)
├─ ... (총 12개)
```

각 도구는 독립 라우트 (`/tools/<name>`) + 공유 컴포넌트 (`/components/`) + 공유 서비스 (`/lib/`).

### 1-2. 데이터 / 인프라 스택

| 레이어 | 기술 |
|---|---|
| Frontend | Next.js 15 (App Router) + Shadcn/ui + Tailwind + Framer Motion |
| Backend | Vercel Functions (Active CPU 모델) |
| DB | Supabase PostgreSQL (RLS) — 17 마이그레이션 |
| Auth | Supabase Auth (Google + GitHub + Kakao) |
| Storage | Supabase Storage (이미지 + PDF) |
| AI | Vercel AI SDK + Anthropic (Haiku/Sonnet/Opus) + OpenAI (GPT-5.x) + Google (Gemini 3.1) |
| OCR | Mathpix → Upstage → Vision (3단계 fallback) |
| 배포 | Vercel (Production: vibe-coding-contest.vercel.app) |
| 모니터링 | Vercel Analytics + Supabase usage_events |

### 1-3. 모델 라우팅 (현재)

| Intent | 모델 | 비고 |
|---|---|---|
| 가벼운 질의응답 | Haiku 4.5 | 60% |
| 학습 코칭 (Legend Tutor 기본) | Sonnet 4.6 | 30% |
| 수능 어려운 문제 | Opus 4.7 | 10% |
| Agentic multi-turn (Legend G-05) | Gemini 3.1 Pro | 한정 사용 |
| 듀얼 튜터 (Gauss) | GPT-5.1 | 별도 |
| TTS | OpenAI TTS | 음성 |

### 1-4. Trigger 라이브러리 (현재)

- 6 anchor seed (수학)
- 244 도구 / 463 trigger / 926 임베딩
- candidate_triggers 큐 (auto-accumulation 인프라)
- pgvector 임베딩 (Supabase 내장)

### 1-5. 가드레일 9 + 위기상담

- 9 카테고리 system prompt + 후처리 필터
- 자살·자해 신호 감지 → 위기상담 안내 ("혼자가 아닙니다")
- 30일 무료 만료 정책 + 50명 베타 cap

### 1-6. Admin 인프라

- /admin 가드 (관리자 layout) — 13차 G-27
- 베타 신청 승인·거부 플로우
- 사용량 대시보드 (Phase 0 베타 검증)

---

## 2. 출판사 콘텐츠 플랫폼으로의 진화

### 2-1. 핵심 데이터 모델 — `textbooks` 테이블 신설

```sql
-- 출판사 (Publisher)
CREATE TABLE publishers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,             -- '천재교육', '동아출판'
  contact      JSONB,                      -- 담당자 정보
  license_terms JSONB NOT NULL,            -- {revenue_share: 30, drm_level: 'high', ...}
  status       TEXT NOT NULL DEFAULT 'pending', -- pending / active / suspended
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- 교과서·문제집 (Textbook)
CREATE TABLE textbooks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id    UUID NOT NULL REFERENCES publishers(id),
  isbn            TEXT,
  title           TEXT NOT NULL,
  subject         TEXT NOT NULL,            -- 'math', 'english_grammar', 'korean', ...
  grade           TEXT,                     -- 'middle1', 'high2', ...
  edition         TEXT,
  drm_level       TEXT NOT NULL,            -- 'low', 'medium', 'high'
  total_chapters  INT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 챕터 (Chapter)
CREATE TABLE textbook_chapters (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  textbook_id     UUID NOT NULL REFERENCES textbooks(id) ON DELETE CASCADE,
  chapter_number  INT NOT NULL,
  title           TEXT NOT NULL,
  ocr_text        TEXT,                     -- Mathpix/Upstage OCR 결과
  ocr_metadata    JSONB,                    -- {tool: 'mathpix', confidence: 0.95}
  drm_signed_url  TEXT,                     -- chapter-level signed URL (1시간 TTL)
  watermark_id    TEXT,                     -- 사용자별 watermark UUID
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(textbook_id, chapter_number)
);

-- 학생 풀이 진척도 (Student Progress)
CREATE TABLE student_textbook_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES auth.users(id),
  textbook_id     UUID NOT NULL REFERENCES textbooks(id),
  chapter_id      UUID NOT NULL REFERENCES textbook_chapters(id),
  mastery_score   FLOAT,                    -- 0.0 ~ 1.0
  attempts        INT DEFAULT 0,
  last_accessed   TIMESTAMPTZ DEFAULT now(),
  metadata        JSONB,                    -- {triggers_used: [...], persona: 'gauss'}
  UNIQUE(student_id, textbook_id, chapter_id)
);

-- 출판사 통계 view
CREATE VIEW publisher_analytics AS
SELECT
  p.id as publisher_id,
  p.name,
  t.id as textbook_id,
  t.title,
  c.id as chapter_id,
  c.chapter_number,
  COUNT(DISTINCT sp.student_id) as unique_students,
  AVG(sp.mastery_score) as avg_mastery,
  AVG(sp.attempts) as avg_attempts
FROM publishers p
JOIN textbooks t ON t.publisher_id = p.id
JOIN textbook_chapters c ON c.textbook_id = t.id
LEFT JOIN student_textbook_progress sp ON sp.chapter_id = c.id
GROUP BY p.id, p.name, t.id, t.title, c.id, c.chapter_number;
```

### 2-2. DRM 설계

| 레벨 | 정책 | 적용 출판사 |
|---|---|---|
| Low | OCR 텍스트 캐시 가능, signed URL 24시간 | PoC 단계 |
| Medium | OCR 텍스트 사용자별 watermark, signed URL 1시간 | 정식 계약 baseline |
| High | OCR 텍스트 매 호출마다 새 watermark, signed URL 5분, 다운로드 차단 | 프리미엄 계약 |

**Watermark 구현**: 모든 OCR 텍스트 응답에 사용자 ID + 타임스탬프 + 챕터 ID 를 invisible character (zero-width-joiner 등) 로 삽입. 외부 유출 발견 시 추적 가능.

### 2-3. 학생 풀이 데이터 → 출판사 통계 피드백

```
[학생 풀이]
    │
    ▼
[student_textbook_progress 갱신]
    │
    ▼
[야간 batch (cron)]
    │
    ▼
[publisher_analytics view 집계]
    │
    ▼
[출판사 대시보드 (월간)]
    │ - 챕터별 약점 식별
    │ - 학생 풀이 패턴 분석
    │ - 교재 개선 인사이트
    ▼
[교재 개정판 반영]
```

이 피드백 루프가 **출판사 협상의 핵심 카드** 다 (research_raw.md §3-3 출판사 인센티브).

---

## 3. AI 인강 모드 vs AI 코칭 모드 분리

### 3-1. 모드별 UX

| 모드 | UX | 호출 패턴 |
|---|---|---|
| **AI 인강** | 챕터 단위 강의 (텍스트 + 도식). 학생은 듣기·읽기 중심. 챕터 종료 시 R1 정리 카드. | 1 챕터 = 1~3 호출 (긴 system prompt + 캐시) |
| **AI 코칭** | 학생 풀이 입력 → 5거장 대화 → 정답 명제화. 학생은 능동 입력. | 1 문제 = 5~15 호출 (multi-turn) |

### 3-2. 프롬프트 분리

```
prompt_templates/
├─ lecture/
│  ├─ system_base.md          (교재 원문 + 거장 페르소나 + 강의 톤)
│  ├─ chapter_intro.md
│  ├─ chapter_explain.md
│  └─ chapter_summary_r1.md
├─ coaching/
│  ├─ system_base.md          (5거장 + Trigger 라이브러리 검색 + 소크라테스 톤)
│  ├─ analyze_attempt.md
│  ├─ persona_handoff.md      (라마누잔→가우스 등)
│  └─ answer_assertion_r1.md
└─ shared/
   ├─ guardrails_9.md         (9 카테고리)
   └─ crisis_response.md      (위기상담)
```

### 3-3. 평가 방식 분리

| 모드 | 평가 지표 |
|---|---|
| AI 인강 | 챕터 완주율 / R1 카드 즐겨찾기율 / 챕터 후 코칭 모드 진입율 |
| AI 코칭 | 정답 명제화 정확도 / 5거장 호출 패턴 / 메타인지 카드 누적 / KPI (수능 정답율) |

### 3-4. 통합 UX

학생 한 명에게 **하나의 챕터 = 인강 → 코칭 → R1 정리** 가 자연스럽게 흐름. 출판사 textbooks 데이터 1개를 두 모드가 공유한다.

```
[학생: 챕터 1 시작]
       │
       ▼
[AI 인강 모드] ────→ 챕터 강의 (5분 ~ 15분)
       │
       │ "이해됐어, 문제 풀어볼래?"
       ▼
[AI 코칭 모드] ────→ 챕터 연습문제 5~10개 풀이
       │
       │ 학생 풀이 → 5거장 대화 → 정답 명제화
       ▼
[R1 풀이 정리 카드] (자동 발급, 즐겨찾기 가능)
       │
       ▼
[student_textbook_progress 갱신]
       │
       ▼
[다음 챕터로 진행 or 약점 챕터 재학습 추천]
```

---

## 4. Trigger 라이브러리 일반화 (수학 → 전 과목)

### 4-1. 데이터 스키마 확장

현재 `tools` 테이블에 `subject_anchor` 컬럼 추가.

```sql
ALTER TABLE tools ADD COLUMN subject_anchor TEXT NOT NULL DEFAULT 'math';
ALTER TABLE tools ADD COLUMN subject_grade TEXT;          -- 'middle', 'high', 'all'
CREATE INDEX idx_tools_subject ON tools(subject_anchor, subject_grade);

-- 기존 244 도구는 subject_anchor='math' 유지
```

### 4-2. 영역별 6 anchor seed 정의

| 과목 | 6 Anchor 예시 |
|---|---|
| 수학 (기존) | 미적분 / 기하·삼각 / 수열 / 확률통계 / 함수 / 정수 |
| 영어 문법 | 시제 / 관계대명사 / 가정법 / 수동태 / 분사·동명사 / 문장 구조 |
| 국어 | 현대시 / 고전 / 비문학 / 작문 / 문법 / 매체 |
| 사회 | 한국사 / 통합사회 / 경제 / 정치 / 지리 / 윤리 |
| 과학 | 통합과학 / 물리 / 화학 / 생명 / 지구과학 / 융합 |

### 4-3. 자동 누적 인프라 재사용

13차 세션 G-03 에서 검증된 chain miss 인프라 + candidate_triggers 큐를 그대로 5과목으로 확장.

```
[학생 풀이 중 도구 매칭 실패]
       │
       ▼
[chain miss 기록] (subject_anchor 자동 식별)
       │
       ▼
[candidate_triggers 큐 적재]
       │
       ▼
[admin 검수 UI] (subject 단위 필터링)
       │
       ▼
[승인 → tools 테이블 추가 + 임베딩 재생성]
```

### 4-4. 임베딩 재계산

5과목 확장 시 약 800+ 도구 추가 → 임베딩 ~3,000+ (Phase 2 종료 시점). pgvector index 재구성 1회 (10분 batch).

---

## 5. 모델 라우팅 진화

### 5-1. Tier × Intent 매핑 테이블

```sql
CREATE TABLE model_routing_rules (
  id          SERIAL PRIMARY KEY,
  tier        TEXT NOT NULL,              -- 'free', 'lite', 'standard', 'pro'
  intent      TEXT NOT NULL,              -- 'qa_simple', 'coaching_basic', 'coaching_deep', 'agentic'
  model       TEXT NOT NULL,              -- 'haiku-4.5', 'sonnet-4.6', 'opus-4.7', 'gemini-3.1-pro'
  caching     BOOLEAN DEFAULT true,
  cache_ttl   INT DEFAULT 300,            -- 5분 = 300초
  weight      INT DEFAULT 100,            -- 분배 가중치 (확률 기반)
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 예시 데이터
INSERT INTO model_routing_rules (tier, intent, model, weight) VALUES
('lite', 'qa_simple', 'haiku-4.5', 100),
('lite', 'coaching_basic', 'haiku-4.5', 80),
('lite', 'coaching_basic', 'sonnet-4.6', 20),
('standard', 'coaching_deep', 'sonnet-4.6', 70),
('standard', 'coaching_deep', 'opus-4.7', 30),
('pro', 'agentic', 'gemini-3.1-pro', 100);
```

### 5-2. Caching 전략

| 캐시 대상 | TTL | 효과 |
|---|---|---|
| 가드레일 9 system prompt | 1시간 | 모든 호출 ~80% input 절감 |
| 거장 5명 페르소나 | 1시간 | Legend Tutor 모든 호출 ~60% input 절감 |
| 출판사 챕터 OCR 텍스트 | 5분 | 동일 챕터 multi-turn ~70% 절감 |
| Trigger 라이브러리 search context | 5분 | 동일 세션 검색 반복 ~50% 절감 |

(research_raw.md §4-1 / §4-6 절감률 인용)

### 5-3. Cost Guard 4단계 (사용자별)

```
[학생 사용 시작]
       │
       ▼
[모든 호출 → cost_tracking 테이블 적재]
       │
       ▼
[일·월 기준 누적 비용 계산]
       │
       ├─ 일 80턴 ────→ 알림 ("오늘 충분히 학습")
       ├─ 일 150턴 ───→ Sonnet/Opus → Haiku 자동 다운그레이드
       ├─ 월 비용 50% 초과 ──→ Sonnet/Opus 차단 (Haiku만)
       └─ 월 비용 50% 초과 ──→ 1:1 알림 + 패턴 협의
```

```sql
CREATE TABLE cost_tracking (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id),
  date         DATE NOT NULL,
  model        TEXT NOT NULL,
  input_tokens INT NOT NULL,
  output_tokens INT NOT NULL,
  cached_tokens INT DEFAULT 0,
  cost_krw     INT NOT NULL,                -- 원 단위
  intent       TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_cost_user_date ON cost_tracking(user_id, date);
```

### 5-4. 사용량 모니터링 대시보드 (admin)

- 사용자별 일·월 비용 / heavy user 목록
- 모델별 사용 비율 + 토큰 비용 추이
- Caching hit rate (실시간)
- 학습 효과 vs 토큰 비용 ROI 그래프

---

## 6. 운영·신뢰 인프라

### 6-1. Sentry 통합

- 프론트·백 모두 Sentry SDK
- 에러율 + 성능 (TTFT, response time) 모니터링
- 가드레일 트리거 / 위기 신호 별도 태그

### 6-2. 가드레일 통계 대시보드

```
[가드레일 9 카테고리 로그]
       │
       ▼
[guardrail_events 테이블]
       │
       ▼
[admin 대시보드]
   ├─ 카테고리별 트리거 횟수
   ├─ 사용자별 위험 신호
   ├─ 거짓 양성률 (운영팀 검수)
   └─ 월간 위기상담 발생 케이스
```

### 6-3. 부모 리포트 (월간 PDF)

- 매월 1일 야간 batch 자동 생성
- Storage 에 7일 저장 → 부모 이메일 발송 → 다운로드 가능
- 옵션 (옵트인): 가드레일 위기 신호 알림

```sql
CREATE TABLE parent_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES auth.users(id),
  parent_id   UUID NOT NULL REFERENCES auth.users(id),
  period      TEXT NOT NULL,              -- '2026-04'
  pdf_url     TEXT,
  metrics     JSONB,                       -- {study_hours: 30, problems_solved: 200, ...}
  generated_at TIMESTAMPTZ DEFAULT now()
);
```

### 6-4. 출판사 통계 대시보드

- publisher_analytics view (§2-1) 기반
- 월간 학생 사용량 + 챕터별 풀이율 + 약점 식별
- 라이선스 분배율 자동 계산 + 정산서 PDF

---

## 7. 결제·법무 아키텍처

### 7-1. Toss Payments 통합

```
[학생 가입]
   │
   ▼
[Toss Payments 정기결제 등록] ──── webhook ──→ [subscriptions 테이블]
                                                       │
                                                       ▼
                                            [tier_id 즉시 갱신]
                                                       │
                                                       ▼
                                            [model_routing_rules 자동 적용]
```

```sql
CREATE TABLE subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  tier            TEXT NOT NULL,           -- 'free', 'lite', 'standard', 'pro', 'family'
  status          TEXT NOT NULL,            -- 'active', 'cancelled', 'expired'
  toss_billing_key TEXT,                    -- 정기결제 키
  payer_id        UUID REFERENCES auth.users(id),  -- 부모 결제 시 부모 ID
  started_at      TIMESTAMPTZ DEFAULT now(),
  next_billing    TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ
);
```

### 7-2. 만 14세 미만 부모 동의

```sql
CREATE TABLE parent_consents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES auth.users(id),
  parent_name  TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_user_id UUID REFERENCES auth.users(id),  -- 부모도 가입한 경우
  sms_verified_at TIMESTAMPTZ,
  email_verified_at TIMESTAMPTZ,
  card_registered_at TIMESTAMPTZ,
  consent_signed_at TIMESTAMPTZ NOT NULL,
  consent_text TEXT NOT NULL                -- 동의서 원문 (감사 추적)
);
```

5단계 플로우는 [pricing-strategy.md](./pricing-strategy.md) §5-4 참조.

### 7-3. PII 처리 매트릭스

| PII 종류 | 보관 기간 | 처리 방식 |
|---|---|---|
| 이름 | 가입 ~ 졸업 +1년 | 암호화 (Supabase column-level) |
| 전화번호 | 가입 ~ 결제 종료 +6개월 | 암호화 + 부분 마스킹 표시 |
| 부모 정보 | 학생 만 14세 도달 시 자동 폐기 | 암호화 |
| 결제 카드 | Toss billing_key (자체 카드 정보 미보관) | Toss 위탁 |
| 풀이 데이터 | 졸업 +1년 | 익명화 후 보관 (학습 통계용) |
| 위기 신호 로그 | 5년 (개인정보 분리 후) | 익명화 |
| 부모 리포트 PDF | 1년 (수령 후 7일 다운로드 가능) | 자동 폐기 |

### 7-4. 졸업 +1년 익명화 cron

매일 야간 batch:

```
SELECT user_id FROM students WHERE graduation_date < (now() - INTERVAL '1 year')
   AND anonymized = false
                ↓
[익명화 함수 실행]
   - PII 컬럼 NULL 처리
   - 풀이 데이터에서 user_id → anonymous_hash 변환
   - parent_consents 삭제
   - subscriptions cancelled
                ↓
[anonymized = true 마킹]
```

---

## 8. 마이그레이션 전략

### 8-1. 4단계 진화

```
Phase 1 — 영문법 PoC (2~6주)
  └─ subject_anchor='english_grammar' 데이터 추가
  └─ 기존 tools 테이블 그대로 (column 추가만)

Phase 2 — Multi-subject (8주)
  └─ 5과목 × 6 anchor 시드 추가
  └─ candidate_triggers 큐 subject 단위 필터링
  └─ 임베딩 재계산 1회

Phase 3 — 결제·Tier (4주)
  └─ subscriptions 테이블 신설
  └─ model_routing_rules 테이블 신설
  └─ parent_consents 테이블 신설
  └─ Toss webhook integration

Phase 4 — 출판사 플랫폼 (12~16주)
  └─ publishers / textbooks / textbook_chapters 테이블 신설
  └─ student_textbook_progress 테이블 신설
  └─ DRM 인프라 (signed URL + watermark)
  └─ publisher_analytics view + 대시보드
```

### 8-2. 마이그레이션 파일 명명 규칙 (기존 17개에 이어서)

```
supabase/migrations/
├─ 20260502120000_add_subject_anchor_to_tools.sql           # Phase 1
├─ 20260613120000_seed_english_grammar_anchors.sql          # Phase 1
├─ 20260711120000_add_5subject_anchors.sql                  # Phase 2
├─ 20260808120000_create_subscriptions.sql                  # Phase 3
├─ 20260808120100_create_model_routing_rules.sql            # Phase 3
├─ 20260808120200_create_parent_consents.sql                # Phase 3
├─ 20260906120000_create_publishers.sql                     # Phase 4
├─ 20260906120100_create_textbooks.sql                      # Phase 4
├─ 20260906120200_create_textbook_chapters.sql              # Phase 4
├─ 20260906120300_create_student_textbook_progress.sql      # Phase 4
└─ 20260906120400_create_publisher_analytics_view.sql       # Phase 4
```

### 8-3. RLS 정책 진화

| 테이블 | RLS 정책 |
|---|---|
| tools | 모든 인증 사용자 SELECT, admin 만 INSERT/UPDATE |
| candidate_triggers | admin 만 SELECT/UPDATE |
| subscriptions | 본인 또는 결제자 (parent_id) SELECT |
| parent_consents | 본인 또는 부모 SELECT |
| textbooks | 활성 구독자만 SELECT, admin INSERT |
| textbook_chapters | 활성 구독자 + DRM 검증 통과 시 SELECT |
| student_textbook_progress | 본인 또는 부모 (parent_consent 통해) SELECT |
| publisher_analytics view | publisher_id 매핑된 사용자만 |
| cost_tracking | 본인 SELECT, admin 전체 |
| guardrail_events | admin 만 SELECT |

### 8-4. 백워드 호환

- 기존 16 도구 라우트 그대로 유지 (`/tools/*`)
- Phase 4 출판사 콘텐츠는 `/textbooks/<publisher>/<book>/<chapter>` 신규 라우트
- 기존 베타 사용자는 자동 Free tier → 30일 만료 정책 그대로
- 13차 정립 가드레일·위기상담 변경 없음

---

## 부록 A. 마이그레이션 의존성 그래프

```
Phase 1 ────────┐
                ├──→ Phase 2 (multi-subject)
Trigger 일반화 ─┘                  │
                                  ▼
                              Phase 3 (결제) ──┐
                                              │
                                              ├──→ Phase 4 (출판사 플랫폼)
                              Phase 2 데이터 ─┘
```

## 부록 B. 인프라 비용 추정 (월간, Base 시나리오)

| 항목 | Phase 0~2 | Phase 3 (결제 출시) | Phase 5 (1만 유료) |
|---|---|---|---|
| Vercel (Active CPU) | ₩50,000 | ₩500,000 | ₩5,000,000 |
| Supabase (Free → Pro) | ₩0 | ₩35,000 | ₩400,000 |
| Anthropic / OpenAI / Gemini | ₩100,000 | ₩2,000,000 | ₩200,000,000 |
| Mathpix · OCR | ₩50,000 | ₩200,000 | ₩2,000,000 |
| Toss Payments 수수료 (2.9%) | ₩0 | ₩200,000 (100명) | ₩87,000,000 (1만 × 평균 ₩100,000) |
| 월간 합계 | ₩200,000 | ₩2,935,000 | ₩294,400,000 |

(research_raw.md §4-4 Vercel 가격 + 자체 추정)

## 부록 D. Phase 1 자체 제작 비전 정정 (2026-05-04 D4, 17차 세션)

본 문서 §2 의 출판사 콘텐츠 플랫폼 비전은 **Phase 4+ 로 후순위 이동**. 2026-05-04 사용자
직접 결정으로 Phase 1 은 출판사 라이선스 없이 **Claude 자체 제작 교과서**로 시작한다.

### 변경 이유
- 검인정 교과서 출판사 계약 미보유 (실제 협상 진행 안 됨).
- 헤밍웨이 영문법 v2 (자체 200p 텍스트북, 14단원 75 레슨 MDX) 패턴이 검증 가능.
- 자체 제작 quality 검증 후 출판사 협상 시 더 좋은 조건 (입증된 사용자 수치 + 콘텐츠
  제작 역량) 으로 진입 가능.

### 도구 매핑 정정 (D4)

| 도구 | 콘텐츠 출처 | 교과 |
|---|---|---|
| 헤밍웨이 영문법 (`/grammar`) | Claude 자체 200p 텍스트북 | 영문법만 |
| Legend Tutor (`/legend`) | 수학 시드 + 수능 정답 DB | 수학만 — "소크라테스의 수학 특별판" |
| 소크라테스 튜터 (`/tutor`) | 출판사 + Claude 자체 교과서 | **수학 제외 전 교과** |

마인드맵 (`/mind-map`) 도 수학 제외 — Legend 가 자체 시각화 보유, 소크라테스 콘텐츠와 1:1.

### 자체 제작 워크플로우 (요약)

상세는 `docs/curriculum-content-spec.md` 와 `docs/implementation_plan_phase1.md` 참조.

```
Subject (SubjectKey)
  └─ Chapter (대단원)
      └─ Section (중단원)
          └─ Content (소단원, 시험 대비 상세)

별도 트리:
  └─ Structured (마인드맵 암기 노트)
```

신규 과목 추가 시 4 위치 동기화:
1. `src/lib/mind-map/build-tree.ts` — `SubjectKey` + `SUBJECT_DATA`
2. `src/app/mind-map/page.tsx` — `SUBJECTS` 배열
3. `src/lib/ai/tutor-prompt.ts` — `SUBJECTS` (튜터 진입 UI)
4. `src/lib/data/textbooks/<subject>-{ch1..chN,index,structured}.ts`

### Phase 1 진도 추적 DB

`textbook_progress` 테이블 신설 — `subject_key + chapter_id` 텍스트 식별자 사용 (출판사
FK 없이). 나중에 `student_textbook_progress` (출판사 비전 §2-1) 도입 시 호환.

### 우선순위 매트릭스

전 교과 매트릭스 (수학·영문법 제외 50+ 과목) + 3 후보 전략 (수능 영향·기존 보강·수능
직접) 은 `docs/curriculum-matrix.md` 단일 source. 사용자 결정 사항 (첫 과목·MDX vs TS·
chapter 분량) placeholder.

## 부록 C. 보안 체크리스트

- [ ] 모든 PII 컬럼 암호화 (Supabase column-level encryption)
- [ ] Storage bucket 별 RLS 정책
- [ ] DRM signed URL 만료 자동 갱신
- [ ] OCR watermark 검증 cron
- [ ] 가드레일 9 카테고리 system prompt 캐시 무결성 검증
- [ ] Toss webhook 서명 검증
- [ ] 졸업 +1년 익명화 cron 실행 로그
- [ ] 부모 동의서 원문 (consent_text) 5년 감사 추적 보관
