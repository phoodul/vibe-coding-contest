-- Δ26: review_beta_application RPC ambiguous "id" reference fix.
-- Original (20260609_beta_applications.sql) 의 update where 절 + select where 절에서
-- 'id' 가 RETURNS TABLE 의 id 컬럼과 beta_applications.id 컬럼 사이에 모호성 발생.
-- 모든 id 참조에 테이블 alias 명시 + RETURNS TABLE 의 컬럼은 select alias 로 명시.

create or replace function public.review_beta_application(
  p_application_id uuid,
  p_action text,
  p_comment text default null
)
returns table (
  id uuid,
  status text,
  invite_code text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
  v_caller_email text;
  v_app_user_id uuid;
  v_new_status text;
  v_invite_code text;
  v_total int;
  v_max int := 50;
begin
  if v_caller is null then
    raise exception 'unauthenticated';
  end if;
  select au.email into v_caller_email from auth.users au where au.id = v_caller;
  if v_caller_email is null or v_caller_email <> 'phoodul@gmail.com' then
    raise exception 'forbidden';
  end if;

  if p_action not in ('approve', 'reject') then
    raise exception 'invalid_action';
  end if;

  -- ambiguous fix: ba alias + ba.id 명시
  select ba.user_id into v_app_user_id
  from public.beta_applications ba
  where ba.id = p_application_id;
  if v_app_user_id is null then
    raise exception 'not_found';
  end if;

  if p_action = 'approve' then
    select count(*)::int into v_total
    from public.euler_beta_invites ebi
    where ebi.status = 'active';
    if v_total >= v_max then
      raise exception 'beta_full';
    end if;

    v_new_status := 'approved';
    v_invite_code := 'BETA-' || substring(p_application_id::text, 1, 8);

    insert into public.euler_beta_invites (user_id, status, invite_code)
    values (v_app_user_id, 'active', v_invite_code)
    on conflict (user_id) do update
      set status = 'active', invite_code = v_invite_code, invited_at = now();
  else
    v_new_status := 'rejected';
    v_invite_code := null;
  end if;

  -- ambiguous fix: ba alias + ba.id 명시
  update public.beta_applications ba
  set
    status = v_new_status,
    reviewed_at = now(),
    reviewed_by = v_caller,
    review_comment = p_comment,
    invite_code = v_invite_code
  where ba.id = p_application_id;

  -- return: 명시적 alias 로 반환 컬럼 매핑
  return query
  select
    p_application_id as id,
    v_new_status as status,
    v_invite_code as invite_code;
end;
$$;

grant execute on function public.review_beta_application(uuid, text, text) to authenticated;
