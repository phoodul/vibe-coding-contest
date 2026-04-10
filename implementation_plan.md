# 내 길 내비 (Pathfinder) — Implementation Plan

## 목표
"꿈이 있으면 길이 있다" — 학생이 자유 텍스트로 꿈/관심사를 입력하면,
AI가 진출 직업 + 교육 로드맵 + 교육기관 인프라를 생성하는 기능.

## 기존 진로 시뮬레이터와의 차별점
| | 진로 시뮬레이터 | 내 길 내비 |
|---|---|---|
| 질문 | 성향 평가 10+항목 | 꿈/관심사 자유 입력 1줄 |
| 결과 | 직업 추천 15~20개 | 로드맵 + 학교/기관 안내 |
| 대상 | 일반 학생 | 비학업 트랙 포함 전체 |

## 파일 구조

```
src/
  app/
    pathfinder/
      page.tsx            # 메인 페이지 (입력 → AI 로드맵)
    api/
      pathfinder/
        route.ts          # AI streaming API
  lib/
    ai/
      pathfinder-prompt.ts  # 시스템 프롬프트
    data/
      pathfinder-schools.ts # 교육기관 정적 데이터
```

## UI 흐름

### Step 1: 입력 화면
- 큰 텍스트 입력: "어떤 꿈이 있나요?" (placeholder: "요리가 좋아요", "머리 만지는 게 재밌어요")
- 선택적 추가 정보: 학년(중/고/대), 지역 (시/도)
- 영감 태그: 미용, 조리, 자동차정비, 반려동물, 드론, 뷰티, 웹툰, 댄스, 체육, 음악, 간호, 농업...
  - 클릭 시 입력창에 자동 채워짐

### Step 2: AI 로드맵 결과
- `useChat` + `streamText` (기존 career 패턴)
- AI 생성 내용:
  1. 관련 직업군 (5~8개) — 직업명, 설명, 연봉, 전망
  2. 준비 로드맵 — 학년 기준 타임라인
  3. 추천 학교/기관 — 특성화고, 마이스터고, 예술고, 체육고, 전문대, 폴리텍, 직업훈련원
  4. 자격증/포트폴리오
  5. 정부 지원 — 장학금, 내일배움카드, HRD-Net

## API: POST /api/pathfinder
- Input: `{ messages }` (useChat 표준)
- 첫 user 메시지: JSON `{ dream, grade, region }`
- System prompt: 한국 교육 전문가, 비학업 트랙 전문

## 교육기관 데이터 (정적)
분야별 대표 기관 + 분야 태그 + 지역 + URL

## 대시보드/랜딩 반영
- studentItems에 "내 길 내비" 추가 (🌟 아이콘)
- 랜딩 studentFeatures에도 추가

## 구현 순서
1. `pathfinder-prompt.ts` — 시스템 프롬프트
2. `pathfinder-schools.ts` — 교육기관 데이터
3. `/api/pathfinder/route.ts` — API
4. `/pathfinder/page.tsx` — 페이지 UI
5. dashboard + landing 메뉴 추가
6. 빌드 확인
