-- Phase B-11: 검수 큐 어드민 RPC (approve / reject)
-- Created: 2026-04-26
--
-- admin 검사: auth.jwt() ->> 'email' 가 허용 목록에 있어야 함.
-- 운영 시 환경별 이메일 화이트리스트는 함수 본문에서 관리.

create or replace function public.approve_candidate_tool(
  p_id uuid,
  p_tool_id text,
  p_layer smallint default null,
  p_formula_latex text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := auth.jwt() ->> 'email';
  v_candidate record;
begin
  if v_email is null or v_email not in ('phoodul@gmail.com') then
    raise exception 'forbidden';
  end if;

  select * into v_candidate from public.candidate_tools where id = p_id and status = 'pending';
  if not found then
    raise exception 'candidate_not_found';
  end if;

  insert into public.math_tools (
    id, name, knowledge_layer, formula_latex, source, source_meta
  ) values (
    p_tool_id,
    v_candidate.proposed_name,
    coalesce(p_layer, v_candidate.proposed_layer, 6),
    coalesce(p_formula_latex, v_candidate.proposed_formula_latex, ''),
    'curated',
    jsonb_build_object('tier', 2, 'candidate_id', p_id)
  )
  on conflict (id) do nothing;

  update public.candidate_tools
  set status = 'merged',
      merged_into_tool_id = p_tool_id,
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = p_id;

  return p_tool_id;
end;
$$;

create or replace function public.reject_candidate_tool(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := auth.jwt() ->> 'email';
begin
  if v_email is null or v_email not in ('phoodul@gmail.com') then
    raise exception 'forbidden';
  end if;

  update public.candidate_tools
  set status = 'rejected',
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = p_id and status = 'pending';

  return found;
end;
$$;

grant execute on function public.approve_candidate_tool(uuid, text, smallint, text) to authenticated;
grant execute on function public.reject_candidate_tool(uuid) to authenticated;
