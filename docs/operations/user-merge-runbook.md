> 작성일 2026-05-05 / 17차 세션 / 영향 테이블 audit 기반 (production DB 스냅샷)
> 사용 시점: 학생이 "어제까지 진도 있었는데 오늘 0이에요" 신고하거나 동일 인물의 user_id 두 개 발견 시.

# User Merge Runbook — 중복 OAuth 가입 머지 절차

## 0. 배경

Supabase Auth 의 default 동작상 같은 사람이 다른 OAuth provider 로 로그인 (verified email
이 다른 경우) 시 **별도 user 자동 생성**. 자동 방지 불가능 → 신고 시 수동 머지.

본 runbook 은:
- 두 user 의 학습 데이터를 **KEEP user** 한 쪽으로 통합
- **REMOVE user** 의 OAuth identity 도 KEEP user 로 이전
- REMOVE user 삭제 (cascade)
- 학생은 다음 로그인부터 어느 provider 로 로그인해도 같은 진도 표시

---

## 1. 사전 준비 — 두 user 식별

### 1-1. 학생 신고 정보로 검색

학생에게 받을 정보: **두 가지 로그인 방식**, 가능하면 **두 가지 이메일**, **이름**.

```sql
-- 같은 이름 또는 이메일 패턴으로 후보 검색
SELECT
  u.id,
  u.email AS user_email,
  u.created_at,
  p.display_name,
  array_agg(DISTINCT i.provider ORDER BY i.provider) AS providers,
  array_agg(DISTINCT i.identity_data->>'email') AS identity_emails
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN auth.identities i ON i.user_id = u.id
WHERE
  u.email ILIKE '%<학생 이메일 일부>%'
  OR p.display_name ILIKE '%<학생 이름>%'
  OR (i.identity_data->>'email') ILIKE '%<학생 이메일 일부>%'
GROUP BY u.id, u.email, u.created_at, p.display_name
ORDER BY u.created_at;
```

### 1-2. KEEP / REMOVE 결정 원칙

- **KEEP** = 학습 데이터가 더 많은 user (legend_solve_logs, beta_applications 등 기준)
- **REMOVE** = 다른 user (보통 더 최근 가입, 데이터 거의 없음)
- **예외**: 학생이 명시적으로 한쪽을 선호하면 학생 의사 따름

### 1-3. 양쪽 user 의 데이터 분포 확인

```sql
-- 변수 치환: KEEP_USER, REMOVE_USER
WITH params AS (
  SELECT
    '<KEEP_USER_UUID>'::uuid AS keep_id,
    '<REMOVE_USER_UUID>'::uuid AS remove_id
)
SELECT
  table_name,
  keep_count,
  remove_count
FROM (
  SELECT 'legend_solve_logs' AS table_name,
    (SELECT COUNT(*) FROM legend_solve_logs WHERE user_id = (SELECT keep_id FROM params)) AS keep_count,
    (SELECT COUNT(*) FROM legend_solve_logs WHERE user_id = (SELECT remove_id FROM params)) AS remove_count
  UNION ALL SELECT 'beta_applications',
    (SELECT COUNT(*) FROM beta_applications WHERE user_id = (SELECT keep_id FROM params)),
    (SELECT COUNT(*) FROM beta_applications WHERE user_id = (SELECT remove_id FROM params))
  UNION ALL SELECT 'beta_reviews',
    (SELECT COUNT(*) FROM beta_reviews WHERE user_id = (SELECT keep_id FROM params)),
    (SELECT COUNT(*) FROM beta_reviews WHERE user_id = (SELECT remove_id FROM params))
  UNION ALL SELECT 'legend_beta_invites',
    (SELECT COUNT(*) FROM legend_beta_invites WHERE user_id = (SELECT keep_id FROM params)),
    (SELECT COUNT(*) FROM legend_beta_invites WHERE user_id = (SELECT remove_id FROM params))
  UNION ALL SELECT 'textbook_progress',
    (SELECT COUNT(*) FROM textbook_progress WHERE user_id = (SELECT keep_id FROM params)),
    (SELECT COUNT(*) FROM textbook_progress WHERE user_id = (SELECT remove_id FROM params))
  UNION ALL SELECT 'reading_logs',
    (SELECT COUNT(*) FROM reading_logs WHERE user_id = (SELECT keep_id FROM params)),
    (SELECT COUNT(*) FROM reading_logs WHERE user_id = (SELECT remove_id FROM params))
  UNION ALL SELECT 'mind_maps',
    (SELECT COUNT(*) FROM mind_maps WHERE user_id = (SELECT keep_id FROM params)),
    (SELECT COUNT(*) FROM mind_maps WHERE user_id = (SELECT remove_id FROM params))
  UNION ALL SELECT 'usage_events',
    (SELECT COUNT(*) FROM usage_events WHERE user_id = (SELECT keep_id FROM params)),
    (SELECT COUNT(*) FROM usage_events WHERE user_id = (SELECT remove_id FROM params))
  UNION ALL SELECT 'identities',
    (SELECT COUNT(*) FROM auth.identities WHERE user_id = (SELECT keep_id FROM params)),
    (SELECT COUNT(*) FROM auth.identities WHERE user_id = (SELECT remove_id FROM params))
) t
ORDER BY table_name;
```

---

## 2. 영향 테이블 분류

### 2-1. UNIQUE on user_id — 충돌 사전 처리 필요 (11개)

`(KEEP, REMOVE)` 양쪽 모두 row 가 있으면 REMOVE 의 row 를 삭제 (KEEP 우선). 한쪽만 있으면
REMOVE → KEEP 으로 UPDATE.

| 테이블 | 충돌 시 정책 |
|---|---|
| `profiles` (id PK) | KEEP 우선, REMOVE 의 display_name 백업 후 삭제 |
| `beta_applications` | KEEP 우선 (신청은 1인 1건이라 보통 한쪽만 존재) |
| `beta_reviews` | KEEP 우선 |
| `legend_beta_invites` | KEEP 우선 |
| `legend_quota_counters` | KEEP 우선 (오늘 카운터 일시적) |
| `euler_family_settings` | KEEP 우선 |
| `parental_consents` | KEEP 우선 |
| `user_subscriptions` | KEEP 우선 (활성 결제 우선) |
| `user_layer_stats` | KEEP 우선 |
| `user_skill_stats` | KEEP 우선 |
| `textbook_progress` | UNIQUE(user_id, subject_key, chapter_id) — 같은 chapter 중복 시 KEEP 우선, 아니면 REMOVE → KEEP UPDATE |

### 2-2. 비-UNIQUE — 일괄 UPDATE (13개)

| 테이블 |
|---|
| `legend_solve_logs`, `legend_routing_decisions`, `legend_tutor_sessions`, `legend_trigger_accumulation_log` |
| `solve_reasoning_trees`, `per_problem_reports` |
| `tutor_sessions`, `mind_maps`, `palaces` |
| `reading_logs`, `career_assessments` |
| `usage_events`, `guardrail_violations` |

### 2-3. 부가 참조 (`reviewed_by` 등) — 일괄 UPDATE

| 테이블·컬럼 |
|---|
| `beta_applications.reviewed_by` |
| `candidate_tools.reviewed_by` |

---

## 3. 머지 SQL (단계별, transaction)

⚠️ **운영 DB 작업** — 반드시 BEGIN/COMMIT 으로 transaction 감싸 중간 검증.

```sql
BEGIN;

-- 변수 치환: 두 줄만 실제 UUID 로 교체
DO $$
DECLARE
  v_keep   uuid := '<KEEP_USER_UUID>'::uuid;
  v_remove uuid := '<REMOVE_USER_UUID>'::uuid;
BEGIN
  IF v_keep = v_remove THEN
    RAISE EXCEPTION 'KEEP 과 REMOVE 가 같은 user 입니다.';
  END IF;

  -- ── A. UNIQUE 테이블 — REMOVE row 삭제 (KEEP 우선)
  -- 양쪽 모두 row 있으면 REMOVE 삭제. 한쪽만 있으면 다음 UPDATE 가 처리.
  DELETE FROM public.profiles
    WHERE id = v_remove
      AND EXISTS (SELECT 1 FROM public.profiles WHERE id = v_keep);
  DELETE FROM public.beta_applications
    WHERE user_id = v_remove
      AND EXISTS (SELECT 1 FROM public.beta_applications WHERE user_id = v_keep);
  DELETE FROM public.beta_reviews
    WHERE user_id = v_remove
      AND EXISTS (SELECT 1 FROM public.beta_reviews WHERE user_id = v_keep);
  DELETE FROM public.legend_beta_invites
    WHERE user_id = v_remove
      AND EXISTS (SELECT 1 FROM public.legend_beta_invites WHERE user_id = v_keep);
  DELETE FROM public.legend_quota_counters
    WHERE user_id = v_remove
      AND EXISTS (SELECT 1 FROM public.legend_quota_counters WHERE user_id = v_keep);
  DELETE FROM public.euler_family_settings
    WHERE user_id = v_remove
      AND EXISTS (SELECT 1 FROM public.euler_family_settings WHERE user_id = v_keep);
  DELETE FROM public.parental_consents
    WHERE user_id = v_remove
      AND EXISTS (SELECT 1 FROM public.parental_consents WHERE user_id = v_keep);
  DELETE FROM public.user_subscriptions
    WHERE user_id = v_remove
      AND EXISTS (SELECT 1 FROM public.user_subscriptions WHERE user_id = v_keep);
  DELETE FROM public.user_layer_stats
    WHERE user_id = v_remove
      AND EXISTS (SELECT 1 FROM public.user_layer_stats WHERE user_id = v_keep);
  DELETE FROM public.user_skill_stats
    WHERE user_id = v_remove
      AND EXISTS (SELECT 1 FROM public.user_skill_stats WHERE user_id = v_keep);

  -- textbook_progress: composite UNIQUE — 같은 (subject_key, chapter_id) 만 KEEP 우선
  DELETE FROM public.textbook_progress r
    WHERE r.user_id = v_remove
      AND EXISTS (
        SELECT 1 FROM public.textbook_progress k
        WHERE k.user_id = v_keep
          AND k.subject_key = r.subject_key
          AND k.chapter_id = r.chapter_id
      );

  -- ── B. 모든 user_id UPDATE (UNIQUE 테이블의 잔여 row + 비-UNIQUE 전체)
  UPDATE public.profiles                    SET id      = v_keep WHERE id      = v_remove;
  UPDATE public.beta_applications           SET user_id = v_keep WHERE user_id = v_remove;
  UPDATE public.beta_reviews                SET user_id = v_keep WHERE user_id = v_remove;
  UPDATE public.legend_beta_invites         SET user_id = v_keep WHERE user_id = v_remove;
  UPDATE public.legend_quota_counters       SET user_id = v_keep WHERE user_id = v_remove;
  UPDATE public.euler_family_settings       SET user_id = v_keep WHERE user_id = v_remove;
  UPDATE public.parental_consents           SET user_id = v_keep WHERE user_id = v_remove;
  UPDATE public.user_subscriptions          SET user_id = v_keep WHERE user_id = v_remove;
  UPDATE public.user_layer_stats            SET user_id = v_keep WHERE user_id = v_remove;
  UPDATE public.user_skill_stats            SET user_id = v_keep WHERE user_id = v_remove;
  UPDATE public.textbook_progress           SET user_id = v_keep WHERE user_id = v_remove;

  UPDATE public.legend_solve_logs           SET user_id = v_keep WHERE user_id = v_remove;
  UPDATE public.legend_routing_decisions    SET user_id = v_keep WHERE user_id = v_remove;
  UPDATE public.legend_tutor_sessions       SET user_id = v_keep WHERE user_id = v_remove;
  UPDATE public.legend_trigger_accumulation_log SET user_id = v_keep WHERE user_id = v_remove;
  UPDATE public.solve_reasoning_trees       SET user_id = v_keep WHERE user_id = v_remove;
  UPDATE public.per_problem_reports         SET user_id = v_keep WHERE user_id = v_remove;
  UPDATE public.tutor_sessions              SET user_id = v_keep WHERE user_id = v_remove;
  UPDATE public.mind_maps                   SET user_id = v_keep WHERE user_id = v_remove;
  UPDATE public.palaces                     SET user_id = v_keep WHERE user_id = v_remove;
  UPDATE public.reading_logs                SET user_id = v_keep WHERE user_id = v_remove;
  UPDATE public.career_assessments          SET user_id = v_keep WHERE user_id = v_remove;
  UPDATE public.usage_events                SET user_id = v_keep WHERE user_id = v_remove;
  UPDATE public.guardrail_violations        SET user_id = v_keep WHERE user_id = v_remove;

  -- 부가 참조 (reviewer 같은)
  UPDATE public.beta_applications  SET reviewed_by = v_keep WHERE reviewed_by = v_remove;
  UPDATE public.candidate_tools    SET reviewed_by = v_keep WHERE reviewed_by = v_remove;

  -- ── C. auth.identities 이전 (KEEP user 로 OAuth identity 옮김)
  -- 같은 (provider, provider_id) 가 KEEP 에 이미 있으면 REMOVE 의 identity 삭제 (중복 방지).
  DELETE FROM auth.identities r
    WHERE r.user_id = v_remove
      AND EXISTS (
        SELECT 1 FROM auth.identities k
        WHERE k.user_id = v_keep
          AND k.provider = r.provider
      );
  UPDATE auth.identities SET user_id = v_keep WHERE user_id = v_remove;

  -- ── D. REMOVE user 삭제 (남은 ON DELETE CASCADE 자동 정리)
  DELETE FROM auth.users WHERE id = v_remove;

  RAISE NOTICE 'Merge done. KEEP=%, REMOVE=% (deleted)', v_keep, v_remove;
END $$;

-- 검증 (다음 섹션 4 의 SQL 실행 후) 문제 없으면:
-- COMMIT;
-- 문제 있으면:
-- ROLLBACK;
```

---

## 4. 검증 SQL (commit 전)

```sql
-- 변수 치환: KEEP, REMOVE
WITH params AS (
  SELECT '<KEEP_USER_UUID>'::uuid AS keep_id, '<REMOVE_USER_UUID>'::uuid AS remove_id
)
SELECT
  -- REMOVE user 가 사라졌는지
  EXISTS(SELECT 1 FROM auth.users WHERE id = (SELECT remove_id FROM params)) AS remove_user_still_exists,
  -- REMOVE 의 어떤 테이블에도 row 가 남아있는지
  (SELECT COUNT(*) FROM legend_solve_logs WHERE user_id = (SELECT remove_id FROM params)) AS remove_solve_logs_left,
  (SELECT COUNT(*) FROM auth.identities WHERE user_id = (SELECT remove_id FROM params)) AS remove_identities_left,
  -- KEEP user 의 identity 분포 (Google + GitHub + Kakao 모두 보이는지 등)
  (SELECT array_agg(provider ORDER BY provider) FROM auth.identities WHERE user_id = (SELECT keep_id FROM params)) AS keep_providers,
  -- KEEP user 의 학습 합계
  (SELECT COUNT(*) FROM legend_solve_logs WHERE user_id = (SELECT keep_id FROM params)) AS keep_solve_logs;
```

기대값:
- `remove_user_still_exists` = `false`
- `remove_*_left` = 모두 `0`
- `keep_providers` = 두 user 의 provider 가 합쳐진 배열 (예: `{github, google, kakao}`)
- `keep_solve_logs` = 머지 전 두 user 의 합계

---

## 5. COMMIT / ROLLBACK

검증 통과 → `COMMIT;`
검증 실패 → `ROLLBACK;` 후 원인 분석.

---

## 6. 학생 안내 메시지 템플릿

머지 완료 후 학생에게 (이메일·카카오톡 등):

```
안녕하세요, [학생 이름]님.

학습 진도가 보이지 않으셨던 문제를 해결했어요.
[Google / Kakao / GitHub] 중 어느 방식으로 로그인해도 같은 학습 진도가
이어집니다.

앞으로는 한 가지 방식을 정해서 매번 같이 사용해주시면 가장 안전합니다
(Google 로 가입한 분은 Google 로만, 등). 다른 방식을 추가로 연결하고
싶으시면 로그인 후 우상단 ⚙️ 계정 설정 → "로그인 추가 연결" 에서
직접 연결할 수 있어요.

불편을 드려 죄송하고, 이용해주셔서 감사합니다.
EasyEdu AI 팀
```

---

## 7. 발견 즉시 진행 체크리스트 (5분 내)

- [ ] 학생에게 두 가지 로그인 방식 + 이메일 + 이름 받기
- [ ] §1-1 SQL 로 두 user 식별
- [ ] §1-3 SQL 로 데이터 분포 확인 → KEEP / REMOVE 결정
- [ ] §3 머지 SQL 실행 (BEGIN ~ DO 블록)
- [ ] §4 검증 SQL 실행
- [ ] 검증 통과 시 `COMMIT;`
- [ ] §6 학생 안내 메시지 발송

## 8. 주의 사항

- **한 번에 한 쌍만 머지**. 여러 쌍을 한 transaction 에 묶지 말 것 (롤백 시 전부 날아감).
- **transaction 안에서 검증** 후 commit. 검증 SQL 은 같은 transaction 에서 실행해야 보임.
- `auth.identities` UPDATE 는 일반 권한으로 가능 (Supabase 의 SECURITY DEFINER RPC 불필요).
- 머지 후 학생 본인이 **재로그인 필요** (기존 세션 토큰은 REMOVE user 의 것이라 무효).
- 본 runbook 은 2026-05-05 audit 기반. 새 테이블 추가 시 §2 와 §3 갱신 필요.

## 9. 참고 — 본인 케이스 (2026-05-05) 머지 미실행 사례

본인의 두 user (`5d12bd59` Google + `e541354e` Kakao) 는 **머지 대신 REMOVE user 단순 삭제**로
처리했음 (REMOVE 측 데이터 0건이었기 때문). 본 runbook 은 양쪽 모두 데이터가 있는 학생
케이스 대상. REMOVE 측 데이터 0건이면 머지 대신 단순 삭제가 빠름:

```sql
DELETE FROM auth.users WHERE id = '<REMOVE_USER_UUID>';
-- 그 후 학생이 KEEP user 로 다시 로그인하면 자동으로 OAuth link 가능 (Manual linking 활성)
```
