# Work Log

> 세션별 주요 변경 이력. 상세 진행 상태는 `docs/progress.md`, 결정 사항은
> `docs/project-decisions.md` 참조.

## 22차 세션 (2026-05-08~09)

**테마**: Maestro production 검증 → Maestro/Legend 5 phase 분리 → 결제 시스템 도입

### 누적 12 commits
| 시각 | commit | 영역 | 변경 |
|---|---|---|---|
| 5/8 | `d2a55e0` | chore | 19차 untracked JSON user_docs 이동 (1.8MB repo bloat 회피) |
| 5/8 | `c36f645` | docs | 22차 세션 시작 + `docs/qa/maestro-22-checklist.md` 검증 체크리스트 |
| 5/8 | `d6ffd54` | maestro fix | footer cutoff 6→30pt + 과목별 INPUT_PARSING_RULES + placeholder |
| 5/8 | `966c56c` | maestro feat | 풀이 정리 (`/api/maestro/build-summary`) + 활동 리포트 1차 |
| 5/9 | `30e49a3` | maestro feat | `/maestro/[subject]/triggers` 시드 JSON 분리 |
| 5/9 | `6754b55` | refactor | Phase 1 — Subject + maestro 페르소나 타입 분리 |
| 5/9 | `36f91aa` | sql | Phase 3 — `maestro_tutor_sessions` + `maestro_summaries` |
| 5/9 | `85c2412` | refactor | Phase 2 — `/api/maestro/[subject]/tutor` 신설 |
| 5/9 | `1cda757` | feat | Phase 5 — DB 누적 활성화 + 리포트 차트 실 데이터 |
| 5/9 | `9b12504` | refactor | Phase 4 — `MaestroChat` wrapper + 4 페이지 import |
| 5/9 | `febdb7c` | payment | 결제 DB 5 테이블 + 약관 4종 페이지 |
| 5/9 | `99fd491` | payment | 토스 SDK + 6 API + `/pricing` + `/billing` + 100회 quota |

### 변경 통계
- 신규 파일: 30+
- 신규 SQL 마이그레이션: 2 (maestro_dedicated · payment_system)
- 신규 약관 페이지: 4 (terms · privacy · refund · business-info)
- 신규 API endpoints: 9 (maestro 3 + payment 6)
- 신규 lib 모듈: 5 (legal/meta · payment/plans · payment/toss · payment/quota · maestro/seed-loader · maestro/types)

### 사용자 액션 대기
1. SQL 마이그레이션 2건 Supabase Dashboard 적용
2. Footer 재추출 + 재업로드 (1598 PNG)
3. 시각 검증 16 페르소나
4. 사업자 등록 + 토스 가맹점 가입 → vercel env 추가 → 결제 활성화

---

## 21차 세션 (2026-05-07~08)
**테마**: Maestro multimodal 디버깅 5 root causes 해결
- 누적 19 fix commits (`407a6cb` ~ `0db1844`)
- 진짜 결정타 = Vercel Hobby Blob bandwidth → Pro upgrade
- Maestro 가 첫 진짜 Gemini provider 사용 코드 발견

## 19차 세션 (2026-05-06~07)
**테마**: Maestro 4 과목 신설
- 4 maestro 페이지 + 16 페르소나 (4 모델 매핑)
- 1598 수능 PNG + Vercel Blob 업로드
- 120 trigger 도구 시드

이전 세션 이력은 `docs/progress.md` 참조.
