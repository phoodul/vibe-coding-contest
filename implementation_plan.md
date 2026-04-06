# Supabase DB 연동 — localStorage → Supabase 전환

## 전략
- 로그인 사용자: Supabase 사용
- 비로그인 사용자: localStorage 폴백 (데모 접근성 보장)

## Supabase 테이블 (이미 존재)
- `mind_maps`: id, user_id, subject, unit_title, nodes(JSONB)
- `palaces`: id, user_id, mind_map_id, location_key, unit_title, subject, placements(JSONB), review_count

## 변경사항

### 1. lib/db/palaces.ts (신규)
- `savePalace()` — mindmap + palace 저장
- `loadPalaces()` — 목록 로드
- `loadPalace(id)` — 상세 로드 (mind_maps join)
- `incrementReview(id)` — 복습 카운트 증가

### 2. palace/create/page.tsx
- handleSave()에서 localStorage 대신 savePalace() 사용

### 3. palace/page.tsx
- useEffect에서 loadPalaces() 사용

### 4. palace/[id]/page.tsx
- useEffect에서 loadPalace(id) 사용
- nextReview()에서 incrementReview(id) 사용

## 검증
- 비로그인: localStorage 폴백 동작 확인
- 로그인: Supabase 저장/로드 확인
