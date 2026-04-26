# Euler Tutor 2.0 — Deployment Runbook

> 작성일: 2026-04-26
> 대상: Phase A~D + 법무 3종 코드 완료 → 정식 출시까지의 운영 단계
> Supabase 마이그레이션 13종은 자동 적용 완료 — 본 문서는 잔여 수동 단계만 다룸

---

## 단계 요약

| # | 단계 | 자동/수동 | 소요 |
|---|---|---|---|
| 1 | Supabase 마이그레이션 13종 적용 | ✅ 완료 (MCP) | — |
| 2 | 시드 32개 도구 적재 | 수동 (env 필요) | 5분 |
| 3 | Railway SymPy μSvc 배포 | 수동 (외부) | 10분 |
| 4 | Vercel 환경변수 등록 | 수동 (외부) | 10분 |
| 5 | 베타 50명 모집 (`EULER2026`) | 수동 | 운영 |
| 6 | 법무 자문 (LEG-02) | 외부 | 30~80만원 |

---

## 2. 시드 적재

### 사전 준비

`.env.local` 또는 환경변수에 다음 3개 키:

```
NEXT_PUBLIC_SUPABASE_URL=https://wrcpehyvxvgvkdzeiehf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<Supabase 대시보드 → Project Settings → API → service_role>
OPENAI_API_KEY=<text-embedding-3-small 호출용>
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` 는 **절대 클라이언트에 노출 금지**. `.env.local` (gitignore) 에만.

### 실행

```bash
# 1) Dry-run — schema/저작권 검증만 (이미 통과 확인됨: 32 tools / 39 triggers)
pnpm dlx tsx scripts/seed-math-tools.ts --dry-run

# 2) 실제 적재 — math_tools + math_tool_triggers + 양방향 임베딩
pnpm dlx tsx scripts/seed-math-tools.ts
```

### 검증

```sql
-- Supabase SQL Editor
select count(*) as tools from public.math_tools;             -- 32
select count(*) as triggers from public.math_tool_triggers;  -- 39
select count(*) as fwd_embedded from public.math_tool_triggers where embedding_forward is not null;
select count(*) as bwd_embedded from public.math_tool_triggers where embedding_backward is not null;
```

비용: 임베딩 39회 × ~30 tokens = ~$0.0005 (text-embedding-3-small).

---

## 3. Railway SymPy μSvc 배포

상세 절차: `services/euler-sympy/README.md`

요약:
1. https://railway.app/new → "Empty Project"
2. New Service → "Deploy from GitHub" → repo + path = `services/euler-sympy`
3. Variables:
   - `INTERNAL_TOKEN`: 32자 임의 문자열 (Vercel `EULER_SYMPY_INTERNAL_TOKEN` 와 동일하게)
4. 배포 후 도메인 발급 (예: `https://euler-sympy.up.railway.app`)
5. 동작 확인: `curl https://<domain>/health` → `{"ok":true}`

### 비용
- Hobby plan $5/월, 메모리 512MB, cold start ~3초
- 운영 트래픽이 늘면 Pro plan $20/월로 업그레이드

---

## 4. Vercel 환경변수 등록

Vercel 대시보드 → Project → Settings → Environment Variables. **Production / Preview / Development 모두 등록**.

### 필수 (Phase A~D)

```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
ANTHROPIC_HAIKU_MODEL_ID=claude-haiku-4-5-20251001

# Supabase (anon 은 공개, service_role 은 server 만)
NEXT_PUBLIC_SUPABASE_URL=https://wrcpehyvxvgvkdzeiehf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Euler 토글 (기본값 사용 시 비워둬도 됨)
EULER_CRITIC_ENABLED=true
EULER_MANAGER_ENABLED=true
EULER_REASONER_ENABLED=true
EULER_REASONER_MIN_DIFFICULTY=6
EULER_TOOL_REPORT_THRESHOLD=3
EULER_FREE_DAILY_LIMIT=10

# Railway μSvc (Phase D)
EULER_SYMPY_URL=https://euler-sympy.up.railway.app
EULER_SYMPY_INTERNAL_TOKEN=<Railway INTERNAL_TOKEN 과 동일>

# Toss Payments (Phase D-08, 운영 키)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_... 또는 live_ck_...
TOSS_SECRET_KEY=test_sk_... 또는 live_sk_...

# OCR (이미지 입력)
MATHPIX_APP_ID=...
MATHPIX_API_KEY=...
UPSTAGE_API_KEY=...

# LEG-04 cron (Vercel 이 자동 부착하지만 명시적으로 설정 권장)
CRON_SECRET=<Vercel 이 자동 발급한 값 또는 수동 32자 문자열>
```

### 등록 후

1. **Redeploy** — 환경변수 변경은 새 배포에만 반영됨
2. 운영 도메인에서 `/euler/canvas` → 베타 페이지 redirect → `EULER2026` 입력 → 베타 활성화 확인
3. `/admin/math-tools` 접근 → 32개 도구 + 검수 큐 빈 상태 확인

---

## 5. 베타 50명 모집

`euler_beta_invites` 테이블 + `redeem_euler_beta(p_code)` RPC 적용 완료.

- **invite 코드**: `EULER2026` (마이그레이션에 하드코드)
- **자동 마감**: 50명 도달 시 RPC 가 `beta_full` exception
- **모집 채널**:
  - 인스타/X 광고 (10만원 이내, 수험생 타겟)
  - 학원 1곳 시범 도입 (학생 5~10명 자동 가입 — `docs/sales/academy-pitch.md` 자료)
  - 본인 SNS / 학교 커뮤니티

코드 회전이 필요하면 새 마이그레이션으로 `v_valid_code` 변경.

---

## 6. 법무 자문 (LEG-02)

### 필요한 검토 범위
1. **저작권**: 사용자가 올린 정석/교과서 사진 OCR 의 정당성 (사적 이용 허용 범위)
2. **이용약관 / 개인정보처리방침**: `src/app/legal/{terms,privacy}/page.tsx` 초안 검토
3. **만 14세 미만 부모 동의**: LEG-03 구현이 정보통신망법 + 개인정보보호법 부합하는지

### 추천 에이전시
- 청년변호사 1회 자문: 30~40만원
- 로앤컴퍼니 / 로톡 / 대한변협 추천 변호사
- 검토 의견서 받은 후 법무 페이지 수정 + 가입 플로우 검증

### 출시 가능 시점
- LEG-02 완료 전이라도 **베타** 50명까지는 출시 가능 (이용약관 초안에 "베타 단계 — 정식 출시 후 변경 가능" 명시)
- **유료 결제 활성화 (Phase D-08) 전에는 LEG-02 완료 권장** — 환불 분쟁 대비

---

## 7. KPI 검증 (출시 전 필수)

`docs/qa/kpi-evaluation.md` 의 절차로 측정. 4 KPI 모두 PASS 시 정식 출시:

```bash
export OPENAI_API_KEY=...
export ANTHROPIC_API_KEY=...
export NEXT_PUBLIC_SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...
pnpm dlx tsx scripts/eval-kpi.ts --full
```

PASS 기준:
- Retriever top-3 hit rate ≥ 70%
- 난이도 ≥ 5 정답률 ≥ 70%
- "왜" 포함률 ≥ 90%

미달 시 `docs/qa/kpi-evaluation.md` §5 (미달 대응) 참조.

---

## 8. 모니터링 (운영 시작 후)

### Supabase
- 대시보드 → Reports → API 호출 / DB Query 모니터링
- `usage_events` 테이블 → `/admin/analytics` 에서 일별 활성 사용자 확인

### Vercel
- Analytics 탭 → 페이지뷰 / Web Vitals
- Logs → API route 에러 추적 (특히 `/api/euler-tutor/*`)

### 응급 대응
- Anthropic / OpenAI 키 노출 의심 → 즉시 rotate (CLAUDE.md 시크릿 안전 규칙)
- Railway μSvc 다운 → orchestrator 가 자동 폴백 (SymPy 없이 풀이, 환각 가능성 ↑)
- DB 마이그레이션 롤백이 필요할 시 — 모든 마이그레이션이 `if not exists` 라 forward-only 안전

---

## 9. 출시 직후 체크리스트

- [ ] `/euler/canvas` 베타 게이트 동작
- [ ] `/euler/billing` 결제 시도 → Toss 테스트 카드 → 구독 활성화
- [ ] `/euler/family` 자녀 link → lock_reveal 토글
- [ ] `/euler/report` 5건 풀이 후 리포트 표시
- [ ] `/admin/math-tools` 검수 큐 (Reasoner 가 보고한 candidate_tools 누적 확인)
- [ ] `/admin/academy` 학생 종합 뷰
- [ ] `/legal/{terms,privacy}` 정상 노출
- [ ] `/signup/parental-consent` 만 14세 미만 자식 계정 동의 플로우

---

## 부록 A: 자동 적용된 마이그레이션 13종

```
20260426001412 — euler_beta_invites
20260426001422 — math_tools_with_pgvector  (vector ext + 마스터)
20260426001432 — math_tool_triggers        (양방향 ivfflat)
20260426001442 — candidate_tools           (검수 큐)
20260426001452 — match_math_tool_triggers_rpc
20260426001505 — candidate_review_rpc      (approve/reject)
20260426001515 — euler_solve_logs
20260426001523 — user_skill_stats
20260426001536 — parental_consent          (LEG-03)
20260426001545 — user_layer_stats          (8-Layer)
20260426001557 — euler_family_settings     (lock_reveal)
20260426001604 — user_subscriptions        (Toss)
20260426001610 — profiles_graduation_columns  (LEG-04 전제)
+ set_updated_at_search_path                  (보안 권고 반영)
```

---

## 부록 B: 일일 cron 점검 (LEG-04)

`vercel.json` 의 cron 정의:
```json
{ "path": "/api/cron/anonymize-graduated", "schedule": "0 18 * * *" }
```

매일 KST 03시 (UTC 18시) 자동 실행. 대상자가 없으면 `anonymized: 0` 으로 빠르게 종료.

수동 트리거:
```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://<your-domain>/api/cron/anonymize-graduated
```
