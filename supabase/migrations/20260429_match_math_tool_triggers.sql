-- Phase B-08: pgvector cosine 검색 RPC
-- Created: 2026-04-26
-- 의존: 20260427_math_tool_triggers.sql

create or replace function public.match_math_tool_triggers(
  query_embedding vector(1536),
  direction_filter text,
  match_count int default 10
)
returns table (
  trigger_id uuid,
  tool_id text,
  direction text,
  trigger_condition text,
  derived_fact text,
  goal_pattern text,
  why_text text,
  tool_name text,
  tool_layer smallint,
  tool_weight real,
  similarity real
)
language sql
stable
security definer
set search_path = public
as $$
  select
    t.id as trigger_id,
    t.tool_id,
    t.direction,
    t.trigger_condition,
    t.derived_fact,
    t.goal_pattern,
    t.why_text,
    m.name as tool_name,
    m.knowledge_layer as tool_layer,
    m.tool_weight,
    case
      when direction_filter = 'forward' then 1 - (t.embedding_forward <=> query_embedding)
      when direction_filter = 'backward' then 1 - (t.embedding_backward <=> query_embedding)
      else greatest(
        1 - coalesce(t.embedding_forward <=> query_embedding, 1),
        1 - coalesce(t.embedding_backward <=> query_embedding, 1)
      )
    end::real as similarity
  from public.math_tool_triggers t
  join public.math_tools m on m.id = t.tool_id
  where
    direction_filter = 'both'
    or t.direction = direction_filter
    or t.direction = 'both'
  order by similarity desc
  limit match_count
$$;

grant execute on function public.match_math_tool_triggers(vector, text, int) to authenticated;
