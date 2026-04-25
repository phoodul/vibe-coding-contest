-- LEG-03: 만 14세 미만 부모 동의
-- Created: 2026-04-26

create table if not exists public.parental_consents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  child_birthdate date not null,
  parent_email text not null,
  parent_email_verified boolean not null default false,
  consent_token text not null unique,                  -- 부모가 클릭할 인증 링크 토큰
  token_sent_at timestamptz not null default now(),
  consented_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists parental_consents_token_idx on public.parental_consents(consent_token);

alter table public.parental_consents enable row level security;

drop policy if exists "parental_read_self" on public.parental_consents;
create policy "parental_read_self"
  on public.parental_consents for select
  using (auth.uid() = user_id);

-- 토큰으로 부모가 인증 (auth 없는 상태에서도 동작) — RPC 로 처리
create or replace function public.confirm_parental_consent(p_token text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_token is null or length(p_token) < 16 then
    raise exception 'invalid_token';
  end if;
  update public.parental_consents
  set parent_email_verified = true,
      consented_at = now()
  where consent_token = p_token
    and parent_email_verified = false;
  if not found then
    raise exception 'token_not_found_or_used';
  end if;
  return true;
end;
$$;

-- 가입 직후 본인이 호출: 생년월일 + 부모 이메일 등록
create or replace function public.request_parental_consent(
  p_birthdate date,
  p_parent_email text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_age int;
  v_token text;
begin
  if v_user is null then raise exception 'unauthenticated'; end if;
  v_age := extract(year from age(p_birthdate));
  if v_age >= 14 then
    return 'not_required';  -- 만 14세 이상: 동의 불필요
  end if;

  v_token := encode(gen_random_bytes(24), 'hex');
  insert into public.parental_consents (user_id, child_birthdate, parent_email, consent_token)
  values (v_user, p_birthdate, p_parent_email, v_token)
  on conflict (user_id) do update
    set child_birthdate = excluded.child_birthdate,
        parent_email = excluded.parent_email,
        consent_token = excluded.consent_token,
        token_sent_at = now(),
        parent_email_verified = false,
        consented_at = null;

  -- 실제 이메일 발송은 별도 server route 가 trigger (이 함수는 token 만 반환)
  return v_token;
end;
$$;

grant execute on function public.confirm_parental_consent(text) to authenticated, anon;
grant execute on function public.request_parental_consent(date, text) to authenticated;
