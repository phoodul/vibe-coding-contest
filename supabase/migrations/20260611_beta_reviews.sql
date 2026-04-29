-- G06-34 (Δ11): 베타 리뷰 시스템
-- Created: 2026-04-30
--
-- 기존 G06-23 인터뷰 흐름 (5명 1주 사용 후 인터뷰) 폐기 → 자율 글 후기.
-- 베타 사용자가 5 항목 리뷰를 작성하면, 출시 시점에 /legend/reviews 공개 페이지에서
-- 마케팅용 인용 + 통계로 활용한다.
--
-- RLS:
--   - 본인 read/insert/update (auth.uid() = user_id)
--   - 공개 리뷰 (is_public=true) 는 누구나 read (anon 포함)
--
-- 통계: get_beta_review_stats() RPC (anon 가능, public 만 집계).

create table if not exists public.beta_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pros text not null check (length(pros) >= 30),
  cons text not null check (length(cons) >= 20),
  purchase_intent boolean not null,
  recommended_tutor text not null check (recommended_tutor in
    ('ramanujan', 'gauss', 'von_neumann', 'euler', 'leibniz')),
  star_rating smallint not null check (star_rating between 1 and 5),
  free_comment text,
  is_public boolean not null default true,
  submitted_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists beta_reviews_public_idx
  on public.beta_reviews(is_public, submitted_at desc) where is_public = true;
create index if not exists beta_reviews_rating_idx
  on public.beta_reviews(star_rating desc);

alter table public.beta_reviews enable row level security;

-- 본인 read
drop policy if exists "beta_reviews_read_own" on public.beta_reviews;
create policy "beta_reviews_read_own" on public.beta_reviews
  for select using (auth.uid() = user_id);

-- 본인 insert
drop policy if exists "beta_reviews_insert_own" on public.beta_reviews;
create policy "beta_reviews_insert_own" on public.beta_reviews
  for insert with check (auth.uid() = user_id);

-- 본인 update (수정 가능)
drop policy if exists "beta_reviews_update_own" on public.beta_reviews;
create policy "beta_reviews_update_own" on public.beta_reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 공개 리뷰는 누구나 read (anonymous 포함, is_public=true 만)
drop policy if exists "beta_reviews_read_public" on public.beta_reviews;
create policy "beta_reviews_read_public" on public.beta_reviews
  for select using (is_public = true);

-- 통계 RPC (anon 가능, public 만 집계)
create or replace function public.get_beta_review_stats()
returns json language sql stable as $$
  select json_build_object(
    'total', count(*),
    'avg_rating', round(coalesce(avg(star_rating)::numeric, 0), 2),
    'purchase_intent_rate', round(
      coalesce(count(*) filter (where purchase_intent = true)::numeric
        / nullif(count(*), 0) * 100, 0), 1
    ),
    'tutor_distribution', coalesce(
      (select json_object_agg(recommended_tutor, cnt)
        from (
          select recommended_tutor, count(*) as cnt
          from public.beta_reviews
          where is_public = true
          group by recommended_tutor
        ) t),
      '{}'::json
    )
  )
  from public.beta_reviews where is_public = true;
$$;

grant execute on function public.get_beta_review_stats() to anon, authenticated;
