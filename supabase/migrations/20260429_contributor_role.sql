-- Phase G-04 G04-8: trigger 직접 입력 채널 + contributor 권한
-- developer (ADMIN_EMAILS hardcode) + admin 토글한 베타 contributor 만 입력 가능.
-- math_tool_triggers.source 로 출처 추적 (검수·롤백 용이).

-- profiles 에 contributor 권한 boolean 추가
alter table profiles
  add column if not exists can_contribute_triggers boolean not null default false;

create index if not exists profiles_contrib_idx
  on profiles (can_contribute_triggers) where can_contribute_triggers = true;

-- math_tool_triggers.source — 출처 추적
alter table math_tool_triggers
  add column if not exists source text not null default 'developer'
    check (source in ('developer','정석','해법서','haiku_auto','beta_contributor','auto_mined'));

create index if not exists math_tool_triggers_source_idx
  on math_tool_triggers (source);
