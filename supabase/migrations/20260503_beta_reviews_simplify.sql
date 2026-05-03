-- 15차 세션 (2026-05-03): 베타 리뷰 단순화 (옵션 A-2)
--
-- 사용자 결정: 별점만 필수 + 자유 코멘트 권장. 나머지 4 항목 (pros/cons/
-- purchase_intent/recommended_tutor) 은 펼치기 형태의 선택 입력으로 전환.
-- 베타 사용자가 작성 부담 없이 빠르게 별점·코멘트만 남길 수 있도록 한다.
--
-- 기존 G06-34 (Δ11) 의 5 필수 항목 → 1 필수(별점) + 5 선택. 데이터 손실 없음.
-- 기존 베타 1명의 리뷰는 그대로 보존.

-- 1. NOT NULL 제거 (4 컬럼)
alter table public.beta_reviews
  alter column pros drop not null,
  alter column cons drop not null,
  alter column purchase_intent drop not null,
  alter column recommended_tutor drop not null;

-- 2. length check 재정의 (NULL 허용 + 입력 시 최소 길이 유지)
alter table public.beta_reviews drop constraint if exists beta_reviews_pros_check;
alter table public.beta_reviews drop constraint if exists beta_reviews_cons_check;

alter table public.beta_reviews
  add constraint beta_reviews_pros_length
    check (pros is null or length(pros) >= 30);

alter table public.beta_reviews
  add constraint beta_reviews_cons_length
    check (cons is null or length(cons) >= 20);

-- 3. RPC 통계 갱신 — 선택 항목은 응답자 기준으로 비율 계산.
create or replace function public.get_beta_review_stats()
returns json language sql stable as $$
  select json_build_object(
    'total', count(*),
    'avg_rating', round(coalesce(avg(star_rating)::numeric, 0), 2),
    'purchase_intent_responded', count(*) filter (where purchase_intent is not null),
    'purchase_intent_rate', round(
      coalesce(
        count(*) filter (where purchase_intent = true)::numeric
          / nullif(count(*) filter (where purchase_intent is not null), 0)
          * 100,
        0
      ),
      1
    ),
    'tutor_distribution', coalesce(
      (select json_object_agg(recommended_tutor, cnt)
        from (
          select recommended_tutor, count(*) as cnt
          from public.beta_reviews
          where is_public = true and recommended_tutor is not null
          group by recommended_tutor
        ) t),
      '{}'::json
    )
  )
  from public.beta_reviews where is_public = true;
$$;

grant execute on function public.get_beta_review_stats() to anon, authenticated;
