-- P0-05 (2026-05-04): subject_anchor 도입 — 영어 문법 trigger PoC 의 schema 기반.
--
-- 배경: implementation_plan_phase0.md §B P0-05.
-- 결정: tools.subject_anchor 컬럼 추가 (별도 테이블 X). 기존 250 도구는
-- 'math' 디폴트, 영문법 PoC 부터는 'english_grammar', 향후 5 과목 일반화
-- 시 동일 테이블 활용 (Phase 2 일반화 방향).
--
-- 영향 범위:
--   - math_tools: subject_anchor (NOT NULL DEFAULT 'math') + subject_grade (nullable)
--   - candidate_triggers: subject_anchor (NOT NULL DEFAULT 'math')
--   - 인덱스 추가 (subject_anchor, subject_grade) + (subject_anchor, status, occurrence_count)
--
-- 백워드 호환: 모든 기존 row 는 'math' 자동 채움. 기존 RPC / 쿼리 수정 불필요
-- (서비스 코드는 subject_anchor 명시 필터링을 추가하면 됨).

alter table public.math_tools
  add column if not exists subject_anchor text not null default 'math',
  add column if not exists subject_grade text;

create index if not exists math_tools_subject_idx
  on public.math_tools (subject_anchor, subject_grade);

alter table public.candidate_triggers
  add column if not exists subject_anchor text not null default 'math';

-- 기존 status, occurrence_count 인덱스는 그대로 — 신규 subject 필터 인덱스만 추가
create index if not exists candidate_triggers_subject_status_idx
  on public.candidate_triggers (subject_anchor, status, occurrence_count desc);

-- 검증: 250 도구가 모두 'math' 로 채워졌는지 확인 (자동 default)
do $$
declare math_count int;
declare other_count int;
begin
  select count(*) into math_count from public.math_tools where subject_anchor = 'math';
  select count(*) into other_count from public.math_tools where subject_anchor <> 'math';
  raise notice 'math_tools subject_anchor: math=% / other=%', math_count, other_count;
end $$;
