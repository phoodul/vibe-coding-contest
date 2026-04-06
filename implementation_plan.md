# Mind Palace 재설계 — 1개 공간 프로토타입

## 목표
경복궁 근정전을 배경으로 한 전체화면(100vh) 몰입형 공간 1개.
생활과 윤리 ch3_s1 "직업과 청렴의 윤리" 5개 개념 배치.

## 파일
1. `lib/data/palace-rooms/geunjeongjeon.ts` — 방 데이터 (5개 구조물)
2. `components/palace/palace-room.tsx` — 전체화면 CSS아트 공간 + 말풍선 + TTS
3. `app/palace/demo/page.tsx` — 데모 페이지

## 핵심 동작
- 전체화면(100vh) CSS/SVG 아트로 근정전 씬 렌더링
- 5개 구조물(왕좌, 두루마리, 기둥, 병풍, 등불)에 키워드만 표시
- 구조물 클릭 → 글래스 말풍선으로 텍스트 확대 (font 14)
- 나레이터(TTS) 버튼으로 음성 읽기
- 전체화면 토글 지원

## 검증
- `npm run build` 통과
- /palace/demo 접속 시 전체화면 근정전 씬
- 구조물 5개 모두 클릭/말풍선 동작
- TTS 동작
