# Phase A — 통합 테스트 체크리스트

> 작성: 2026-04-26 (A-15)
> 목적: Phase A 산출물(A-01 ~ A-14)의 통합 동작 + 기존 사용자 플로우 회귀 점검
> 합격 기준: 95% 이상 통과 + 회귀 0건

---

## 0. 사전 준비

- [ ] `supabase/migrations/20260425_euler_beta_invites.sql` 적용 완료
  - Supabase 대시보드 SQL editor 또는 `supabase db push`
- [ ] `.env` 에 다음 키 설정 (운영 시작 직전)
  - `ANTHROPIC_HAIKU_MODEL_ID` (예: `claude-haiku-4-5-20251001`)
  - `EULER_CRITIC_ENABLED` (베타 시작 시 `true`, 안정화 전엔 `false`)
- [ ] `pnpm build` 성공
- [ ] `npx tsc --noEmit` 0 errors
- [ ] PWA: Lighthouse 점수 80+ (manifest icons + sw 등록 확인)

---

## 1. 베타 게이트

- [ ] 미로그인 사용자가 `/euler/canvas` 진입 → `/auth/login?next=/euler/canvas` 리다이렉트
- [ ] 로그인 후 invite 코드 없는 사용자 진입 → `/euler/beta?next=/euler/canvas` 리다이렉트
- [ ] `/euler/beta` 에서 잘못된 코드 입력 → "초대 코드가 올바르지 않아요" 메시지
- [ ] 정상 코드(`EULER2026`) 입력 → 활성화 → `/euler/canvas` 자동 진입
- [ ] 이미 redeem 한 사용자가 `/euler/beta` 직접 진입 → 자동으로 `/euler/canvas` 통과
- [ ] 51번째 redeem 시도 → "베타 정원(50명) 마감" 메시지 (테스트는 cap 임시 1로 변경 후 검증)
- [ ] **회귀**: `/euler-tutor` 메인 채팅은 베타 게이트 영향 0 — 기존 사용자 그대로 입장

---

## 2. 필기 모드 (HandwriteCanvas)

- [ ] 데스크톱 마우스로 stroke 그리기 → 화면 즉시 반영
- [ ] iPad Apple Pencil 압력 → lineWidth 가변 (실측: 가벼운 획 1.2px ~ 강한 획 4.5px)
- [ ] iPhone 손가락 → 단일 stroke 정상 (멀티터치 충돌 없음)
- [ ] "한 획 지우기" 버튼 → 마지막 stroke 제거
- [ ] "전체 지우기" → 캔버스 백색 초기화
- [ ] "도와줘" 버튼 → parsing 단계 → OCR 결과 sessionStorage 저장 → `/euler-tutor?from=canvas` 진입
- [ ] OCR 빈 결과 → "더 또렷하게 다시 써볼까요?" 에러 메시지 + 다시 그리기

### 캔버스 인코딩 (encodeCanvasToPayload)
- [ ] 14획 누적 PNG 800KB 이내 (단순 텍스트 기준)
- [ ] 2048x1536 → 1280px 자동 다운스케일
- [ ] PNG 800KB 초과 시 JPEG 0.85 → 0.7 → 0.5 폴백 동작

---

## 3. OCR — 손글씨 모드

- [ ] `/api/euler-tutor/parse-image` `handwritten=true` 호출 시 Mathpix 옵션 변경 확인
  - `formats: ["text","data"]`, `ocr: ["math","text"]`, `rm_spaces: false`
- [ ] 손글씨 5장 LaTeX 정확도 80%+ (수동 검수 — 로그/사진 별도 첨부)
- [ ] **회귀**: 인쇄 모드(handwritten=false) → 기존 동작 유지, 변동 0건

---

## 4. Critic Agent (Phase A 모드)

- [ ] `EULER_CRITIC_ENABLED=true` 일 때 orchestrator 가 이전 턴 AI 응답을 verify
- [ ] 정답 풀이 케이스 → `verified=true` → "재검산하자" 발화 0회 (수능 1~25번 10문항)
- [ ] 명백한 오류 풀이 5케이스 → `verified=false` + errors 정확 검출
  - x²-4=0 에서 x=2만 답한 경우 → "x=-2 누락" 검출
  - ∫_0^1 2x dx = 0 같은 계산 오류 → 검출
- [ ] `/api/euler-tutor/critic` 단독 호출 (curl) — 인증 401 / 정상 200 분기
- [ ] JSON-fence 감싸진 응답 (```json ... ```) 도 정상 파싱
- [ ] `EULER_CRITIC_ENABLED=false` 일 때 기존 동작 100% 회귀 통과

---

## 5. Coaching 프롬프트 (verified + stuck_reason 분기)

- [ ] verified=true 주입 시 코칭 응답에 의심·재검산 발화 없음
- [ ] verified=false 주입 시 errors 가 가리키는 단계로 자연스럽게 회귀 코칭
- [ ] stuck_reason 6종 시드 텍스트가 system 프롬프트에 포함되어 있음 (수동 grep 확인)
- [ ] Phase A 에서는 stuck_reason 미주입 시 기본 흐름 (verified 분기만) 동작

---

## 6. PWA

- [ ] manifest.json icons 192/256/512 매핑 정상
- [ ] shortcuts 2종 (오일러 캔버스 / 오일러 채팅) 노출
- [ ] iOS Safari "홈 화면에 추가" → 앱 아이콘 + 캔버스 shortcut 정상
- [ ] sw.js v2-euler 캐시 등록 + 오프라인 진입 시 /euler/canvas precache 동작
- [ ] Lighthouse PWA 점수 80+

---

## 7. 4 조합 입력 모드 회귀 (A-13)

| 페르소나 | 입력 모드 | 진입 경로 | 합격 |
|---|---|---|---|
| 오일러 (Sonnet 4.6) | 텍스트 | /euler-tutor | [ ] |
| 오일러 | 사진 | /euler-tutor 카메라 | [ ] |
| 오일러 | 필기 | /euler/canvas → /euler-tutor | [ ] |
| 가우스 (GPT-5.1) | 텍스트 | 가우스 토글 후 텍스트 | [ ] |
| 가우스 | 사진 | 가우스 + 카메라 | [ ] |
| 가우스 | 필기 | 가우스 + 캔버스 | [ ] |

**회귀 체크**: 기존 사용자(텍스트 + 오일러) 플로우 — 응답 품질·속도 변동 0건

---

## 8. ThoughtStream UI (A-12)

- [ ] 컴포넌트 마운트 시 stage="idle" → 렌더링 안 됨
- [ ] active stage → violet pulse 아이콘 회전 애니메이션
- [ ] done stage → emerald ✓ 표시
- [ ] hide prop 으로 manager/reasoner 숨김 시 정상 (Phase A 기본)
- **참고**: Phase A 에서는 orchestrator 가 data stream 으로 stage 전송하지 않으므로 자체 통합은 Phase B 부터. 컴포넌트만 단위 시각 점검.

---

## 9. 빌드·타입체크

- [ ] `npx tsc --noEmit` 0 errors
- [ ] `pnpm build` 성공 (production)
- [ ] 신규 파일 9개 + 수정 파일 5개 외 변경 없음 (`git diff --stat fb39d09..HEAD` 확인)

---

## 10. 수능 1~25번 샘플 10문항 — 정답 시 의심 발화 0%

| 학년도 | 번호 | verified=true | 의심 발화 |
|---|---|---|---|
| 2026 | 1 | [ ] | [ ] 0회 |
| 2026 | 5 | [ ] | [ ] 0회 |
| 2026 | 10 | [ ] | [ ] 0회 |
| 2025 | 8 | [ ] | [ ] 0회 |
| 2025 | 14 | [ ] | [ ] 0회 |
| 2024 | 3 | [ ] | [ ] 0회 |
| 2024 | 17 | [ ] | [ ] 0회 |
| 2023 | 2 | [ ] | [ ] 0회 |
| 2023 | 11 | [ ] | [ ] 0회 |
| 2022 | 7 | [ ] | [ ] 0회 |

**합격 기준**: 의심 발화 0회 + 정답 도달 (KPI 목표)

---

## 11. 발견된 결함 처리 정책

- **P0 (서비스 차단)**: 즉시 hot-fix 후 재배포
- **P1 (기능 정합성)**: Phase A 마감 전 수정
- **P2 (UX 개선)**: Phase B 로 이월, GitHub issue 생성

---

## 합격 선언

- [ ] 위 항목 95% 이상 통과
- [ ] 베타 50명 모집 시작 가능
- [ ] Phase B 진입 승인
