-- LEG-04 전제: profiles 에 graduated_at + anonymized_at 추가
-- Created: 2026-04-26
--
-- 사용처:
--   - /api/cron/anonymize-graduated: graduated_at + 1년 경과한 사용자 PII 익명화
--   - 학생 본인 또는 교사가 졸업 시점 기록

alter table public.profiles
  add column if not exists graduated_at timestamptz;

alter table public.profiles
  add column if not exists anonymized_at timestamptz;

create index if not exists profiles_graduated_at_idx
  on public.profiles(graduated_at)
  where graduated_at is not null;
