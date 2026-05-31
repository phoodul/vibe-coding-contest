# Implementation Plan — Legend/Maestro 라텍스 노출 + 스크린샷 즉시 첨부

작성: 2026-05-31 (25차 세션)

## 배경 (사용자 보고)
1. Legend Tutor 대화 중 AI 응답에 raw 라텍스 문자가 노출됨 (사용자: "둘 다 봤다/모르겠다" → A·B 경로 모두 방어).
2. 스크린샷 첨부가 "이미지 파일 업로드 수준" — PrintScreen/캡처 직후 화면에서 Ctrl+V 즉시 첨부가 안 됨.

## 진단
- **라텍스 A (구분자 없는 raw 명령)**: 모델이 `$` 없이 `\frac{1}{2}`, `\sqrt{x}`, `\le` 등을 출력 → `normalizeMathDelimiters`가 변환할 구분자가 없어 그대로 노출.
- **라텍스 B (스트리밍 미완성 구분자)**: `\(` 가 오고 `\)` 가 아직 안 온 순간 raw `\(` 깜빡임. `safeStreamMarkdown`은 홀수 `$`만 보정.
- **스크린샷**: `handlePaste`가 textarea `onPaste`에만 연결 → 입력창 포커스 없이 캡처 직후 Ctrl+V 하면 무반응.

## 변경 사항

### 1. `src/components/legend/StreamingMarkdown.tsx`
- **`wrapOrphanLatex(str)`** 신규 export — `$...$`/`$$...$$` 바깥(non-math 세그먼트)에서만, backslash 명령 atom(`\frac{}{}`, `\sqrt{}`, `\sum_{}^{}`, `\pi`, `\le` 등)을 `$...$`로 감쌈. 한국어 산문에는 `\command`가 없으므로 false-positive ~0. (A 방어, 심층 방어)
- **`safeStreamMarkdown` 확장** — 스트리밍 중 닫히지 않은 trailing `\(`/`\[` 발견 시 그 지점부터 잘라 숨김. 다음 chunk에서 복원. (B 방어)
- `safeContent` 파이프라인: `normalizeMathDelimiters → wrapOrphanLatex → (streaming) safeStreamMarkdown`.

### 2. `src/lib/ai/euler-prompt.ts` (+ maestro system-prompt 동일 취지)
- 수식 표기 규칙에 **틀린 예/맞는 예** 강조 한 줄 추가 — "절대 `$` 없이 `\frac`, `\sqrt`, `\le` 등 명령을 단독으로 쓰지 말 것" (A 근본 원인 = 모델 행동).

### 3. `src/components/legend/LegendChat.tsx` & `src/components/maestro/MaestroChat.tsx`
- textarea의 `onPaste={handlePaste}` 제거 + `handlePaste` useCallback 제거.
- **document 전역 paste 리스너**(useEffect) 추가 — 페이지 어디서든 클립보드 이미지 Ctrl+V 시 즉시 `imagePreview` 세팅. 텍스트 paste는 default 유지.
- 입력 하단 안내 문구에 "📋 화면 캡처 후 Ctrl+V 로 바로 첨부" 한 줄 추가.

### 4. 테스트
- `streaming-markdown.test.ts`에 `wrapOrphanLatex` + `safeStreamMarkdown`(미완성 `\(`) 케이스 추가.

## 검증
- `npx vitest run streaming-markdown` 통과
- `npx tsc --noEmit` 통과
- (수동) Legend 페이지에서 캡처 → 화면 클릭 없이 Ctrl+V → 즉시 미리보기

## 리스크
- `wrapOrphanLatex`는 leaked 라텍스를 atom 단위로 감싸므로 다항식 spacing이 약간 비최적일 수 있으나 raw backslash 노출보다 항상 우월. 정상 산문 영향 없음.
