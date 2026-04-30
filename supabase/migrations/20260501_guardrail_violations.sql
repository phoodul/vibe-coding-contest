-- Phase G-06 Δ24: 가드레일 위반 로그 — 분쟁 대처용 증거 + 누적 카운터.
-- Created: 2026-05-01
--
-- 정책:
--   - 1차 위반 (정중한 안내) 도 기록 (severity='warning_1')
--   - 반복 위반 (경고 1회) 시 severity='violation' + violation_count 증가
--   - 자해/자살 위기 신호는 severity='crisis_alert' (위반 아님 — 안전 우선 안내)
-- 운영자만 read (authenticated user 는 자기 row 만)

create table if not exists public.guardrail_violations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  /** 첫 차단 시점 메시지 발췌 (max 1000자) */
  message_excerpt text not null,
  /** 분류 카테고리 (LLM 판정) */
  category text not null check (category in (
    'non_math_subject',
    'meta_curiosity',
    'ai_model_question',
    'personal_concern',
    'profanity',
    'sexual_content',
    'self_harm_crisis',
    'violence',
    'political',
    'other'
  )),
  /** 심각도 — 1차 안내 vs 누적 경고 vs 위기 alert */
  severity text not null check (severity in ('warning_1', 'violation', 'crisis_alert')),
  /** AI 가 취한 조치 표준 카피 */
  action_taken text not null,
  /** 직전 user-AI 대화 발췌 (max 4000자, 분쟁 대처 증거) */
  conversation_snippet text,
  /** Haiku 분류기 raw output (감사용) */
  classifier_meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists guardrail_violations_user_idx
  on public.guardrail_violations(user_id, created_at desc);

create index if not exists guardrail_violations_severity_idx
  on public.guardrail_violations(severity, created_at desc);

create index if not exists guardrail_violations_category_idx
  on public.guardrail_violations(category);

alter table public.guardrail_violations enable row level security;

-- 사용자 자기 row read (자기 위반 이력 확인 가능)
drop policy if exists "guardrail_violations_self_read" on public.guardrail_violations;
create policy "guardrail_violations_self_read"
  on public.guardrail_violations for select
  using (auth.uid() = user_id);

-- 운영자 (admin role) 전체 read·write
drop policy if exists "guardrail_violations_admin_all" on public.guardrail_violations;
create policy "guardrail_violations_admin_all"
  on public.guardrail_violations for all
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- service_role 은 RLS bypass 로 자동 insert 가능 (server-side 가드레일 흐름)
