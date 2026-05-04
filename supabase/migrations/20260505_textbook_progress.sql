-- Phase 1 P1-01 — textbook_progress 신설 (자체 제작 chapter 진도 추적).
--
-- 베이스: docs/curriculum-content-spec.md §6-2 + docs/implementation_plan_phase1.md
--
-- Why: 소크라테스 튜터 콘텐츠 확장 (Phase 1) 의 진도 추적. 출판사 FK 없이 텍스트 식별자
--      (subject_key + chapter_id) 사용 → 나중에 출판사 콘텐츠 (textbook_id FK) 도입 시
--      자체 제작 진도 보존.
--
-- 호환:
--   - Phase 4+ 의 student_textbook_progress (architecture-platform.md §2-1) 와 별도.
--   - 헤밍웨이 영문법은 별도 grammar_progress (lesson_slug 단위) 로 추후 신설.
--
-- RLS: 본인 row 만 select / insert / update.

create table if not exists public.textbook_progress (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  subject_key     text not null,                       -- 'ethics', 'biology', 'korean', ...
  chapter_id      text not null,                       -- 'ch1', 'ch2', ... 또는 lesson slug
  status          text not null default 'in_progress'
                  check (status in ('in_progress', 'completed')),
  mastery_score   real,                                -- 0.0 ~ 1.0
  attempts        integer not null default 0,
  last_accessed   timestamptz not null default now(),
  metadata        jsonb,                               -- {sections_completed: [...], notes: [...]}
  created_at      timestamptz not null default now(),
  unique (user_id, subject_key, chapter_id)
);

create index if not exists idx_textbook_progress_user
  on public.textbook_progress (user_id, last_accessed desc);

create index if not exists idx_textbook_progress_subject
  on public.textbook_progress (subject_key, last_accessed desc);

-- updated_at trigger (last_accessed 자동 갱신)
create or replace function public.touch_textbook_progress()
returns trigger
language plpgsql
as $$
begin
  new.last_accessed = now();
  return new;
end;
$$;

drop trigger if exists trg_textbook_progress_touch on public.textbook_progress;
create trigger trg_textbook_progress_touch
  before update on public.textbook_progress
  for each row execute function public.touch_textbook_progress();

-- RLS — 본인만 자기 row 접근
alter table public.textbook_progress enable row level security;

drop policy if exists "user_own_progress_select" on public.textbook_progress;
create policy "user_own_progress_select" on public.textbook_progress
  for select using (auth.uid() = user_id);

drop policy if exists "user_own_progress_insert" on public.textbook_progress;
create policy "user_own_progress_insert" on public.textbook_progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "user_own_progress_update" on public.textbook_progress;
create policy "user_own_progress_update" on public.textbook_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "user_own_progress_delete" on public.textbook_progress;
create policy "user_own_progress_delete" on public.textbook_progress
  for delete using (auth.uid() = user_id);

comment on table public.textbook_progress is
  'Phase 1 자체 제작 콘텐츠 chapter 진도 추적 — subject_key + chapter_id 텍스트 식별자.';
