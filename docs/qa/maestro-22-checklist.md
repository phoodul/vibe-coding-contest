# 22차 Maestro Production 시각 검증 체크리스트

> **작성**: 2026-05-08 (22차 세션)
> **대상**: 21차 multimodal 디버깅 5 root causes 해결 후 production 검증.
> **자동화 한계**: OAuth 로그인 필요 → 사용자 본인 계정 (`phoodul@gmail.com`) 직접 클릭 검증.
> **자동 검증 완료** (22차 세션): manifest 갱신 (etag 갱신, last-modified `2026-05-07 21:54 GMT`) · 최신 deployment READY (`2356f1c`) · 모델 alias ID 코드 반영 · 16 portrait 자산 + portraits.ts 매핑 일관.

## 사용자 액션 — 4 maestro × 4 인물 클릭 점검

| # | 페이지 | 페르소나 (모델) | 검증 항목 | 21차 fix 연결 |
|---|---|---|---|---|
| 1 | `/earth-science` | 베게너 (Sonnet 4.6) | client disabled 표시 (선택 불가) | 사용자 정책 — 의도된 동작 |
| 2 | `/earth-science` | 갈릴레이 (Gemini 3.1 Pro) | 수능 번호 클릭 → 시험지 PNG preview + 가이드 응답 (이미 21차에 ✅ 확인됨, regression 점검) | model ID `gemini-3.1-pro-preview` + safetySettings BLOCK_NONE |
| 3 | `/earth-science` | 허블 (Opus 4.7) | **신규 검증** — 21차 alias ID `claude-opus-4-7` 적용 후 처음 시도 | dated suffix → alias 변경 (`f0a1ee2`) |
| 4 | `/earth-science` | 세이건 (GPT-5.5) | 수능 번호 → vision 응답 (21차 ✅ 확인됨, regression) | gpt-5.5 모델 |
| 5~8 | `/biology` | 파스퇴르 (S) / 멘델 (G) / 왓슨 (O) / 다윈 (GPT) | 한 번도 실사용 검증 안 됨. 페이지 진입 + 각 페르소나 multimodal 시도 | 동일 5 root causes 해결 적용 |
| 9~12 | `/physics` | 페르미 / 아인슈타인 / 파인만 / 뉴턴 | 동일 | |
| 13~16 | `/chemistry` | 마리 퀴리 / 라부아지에 / 폴링 / 멘델레예프 | mhchem `\ce{}` 렌더 추가 검증 | A8 `59e2f2d` |

## footer-cropped PNG 시각 확인

21차에 1598 PNG 재추출 + 재업로드 (URL 동일, etag 갱신). CDN Last-Modified `2026-05-07 21:54 GMT` 확인됨.

| 검증 | 방법 | 기대값 |
|---|---|---|
| footer 잘림 | 시험지 preview 카드 안에 KICE footer 텍스트 (`확인 사항` / `한국교육과정평가원`) **부재** | 페이지 마지막 문제만 영향 (1번 / 11번 / 20번) — 다른 문제는 영향 없음 |
| LLM 응답 노이즈 부재 | 페르소나가 footer 텍스트를 인용하거나 응답에 포함 X | image vision 가이드만 출력 |
| URL 변경 없음 | 동일 URL 패턴 (`suneung/q/{subject}-{variant}/{year}/q-{number}.png`) | manifest mtime 갱신 + git diff 0 |

## 점진적 응답 (streaming) 점검 — 21차 `0db1844` regression

21차 마지막 fix 가 `streamText` 복귀 (`generateText` → `streamText`). 다음을 점검:

- 첫 token **즉시** chat 영역에 표시되어야 함 (1분+ 무진행 X).
- 응답이 점진적으로 늘어남 (한 번에 전체 텍스트 등장 X).
- 갈릴레이 / 허블 / 세이건 모두 동일 패턴.

## visible error 점검

21차 `7513042` 의 visible error stream 도입. 다음 시나리오에서 **명시적 에러 메시지** 가 chat 에 표시되어야:

| 시나리오 | 기대 메시지 |
|---|---|
| GEMINI_API_KEY 누락 (현재는 등록됨) | `GEMINI_API_KEY env 가 production 에 누락... Vercel Dashboard 에서 추가` |
| Anthropic / OpenAI key 누락 | 동일 패턴 |
| Vercel Blob 차단 (현재는 Pro 해제) | image-less fallback 텍스트 ("이미지 일시 불러오기 실패 → 텍스트로 알려달라") |

지금은 모든 key 등록 + Pro plan → 위 시나리오 전부 발생 X (정상 흐름만).

## 추가 검증 (사용자 요청 시)

### Pro plan bandwidth 모니터링 (KPI)

- Vercel Dashboard → Storage → Blob → Usage 그래프
- 1TB/월 한도 대비 현재 사용률 (1598 PNG × 일평균 사용 + LLM API base64 download 기준)
- 70% 초과 시 alert 설정 또는 Supabase / R2 우회 설계

### maestro trial 분기 (UX 결정 대기)

20차 progress 메모: **maestro 4 페이지가 인증 필수 redirect** 인 반면 Legend 는 비로그인 trial 분기 가능. dashboard "로그인 없이 체험 가능" 안내와 충돌. 결정 사항:

- (A) 의도된 설계 — 인증 redirect 유지, dashboard 문구 수정
- (B) trial 분기 추가 — 비로그인 1~2회 시도 후 로그인 요구

## 검증 후 산출물

검증 결과를 `docs/progress.md` 22차 섹션에 다음 형식으로 기록:

```markdown
### 22차 검증 결과 (2026-05-08)

| # | 페르소나 | 결과 | 메모 |
|---|---|---|---|
| 1 | 베게너 (Sonnet) | ⚠️ disabled | 의도 |
| 2 | 갈릴레이 (Gemini) | ✅ regression PASS | streaming 정상 |
| 3 | 허블 (Opus) | ⚠️ FAIL | … (재현 단계) |
| ... |
```

FAIL 발견 시 즉시 23차 fix 로 진행. PASS 만 있으면 Phase C (Biology PoC) 또는 Phase 0 P0-01b (Legend area 하드코딩) 로 이동.
