# G-06 Legend Tutor — Vercel Env Import 가이드

> 작성일: 2026-04-29 (9차 세션 G-06 완결)
> 목적: G06-25 production 배포 전 Vercel env 변수 13종 일괄 등록
> 시간: 5분

## 빠른 import 방법 (권장)

### 1. 로컬에서 임시 파일 생성 (수동, env-guard hook 우회)

PowerShell 또는 메모장으로 `C:\Users\JSS\Downloads\legend-env.txt` 작성:

```env
LEGEND_ROUTER_ENABLED=true
LEGEND_STAGE0_THRESHOLD=0.85
LEGEND_STAGE1_CONFIDENCE_THRESHOLD=0.7
LEGEND_REPORT_CACHE_TTL_HOURS=720
LEGEND_BETA_PROBLEM_TOTAL_DAILY=5
LEGEND_BETA_LEGEND_CALL_DAILY=3
LEGEND_BETA_REPORT_PER_PROBLEM_DAILY=1
LEGEND_BETA_WEEKLY_REPORT_LIMIT=1
LEGEND_BETA_MONTHLY_REPORT_LIMIT=1
LEGEND_WEEKLY_REPORT_PROBLEM_GATE=10
LEGEND_MONTHLY_REPORT_PROBLEM_GATE=20
GEMINI_FALLBACK_TUTOR=von_neumann
GEMINI_MODEL_ID=gemini-3-1-pro
NEXT_PUBLIC_LEGEND_TREE_DEPTH_PREVIEW=3
NEXT_PUBLIC_LEGEND_TREE_COLLAPSE_NODE_THRESHOLD=30
LEGEND_DELEGATION_ENABLED=false
```

(16개 — 13종 + Δ4 NEXT_PUBLIC 2종 + kill switch)

### 2. Vercel 대시보드에서 Import

1. **링크**: https://vercel.com/dashboard → 프로젝트 `vibe-coding-contest` 선택
2. **메뉴**: Settings → Environment Variables
3. **우상단 "..." 메뉴** 또는 **"Import" 버튼** 클릭
4. **Upload .env file** → `legend-env.txt` 선택
5. **Environments**: ✅ Production / ✅ Preview / ⬜ Development (체크박스)
6. **Save**

→ 16종이 한 번에 등록됨.

### 3. 검증

```powershell
# Vercel CLI 있으면 (없어도 OK)
vercel env ls
# 또는 대시보드 Environment Variables 페이지에서 16개 신규 항목 확인
```

## 모든 값이 public 안전한 이유

| Key | Value | 위험도 |
|---|---|---|
| LEGEND_* (12종) | 정수·boolean 설정값 | 0 (소스코드에 동일하게 적힘) |
| GEMINI_FALLBACK_TUTOR | `von_neumann` (튜터 이름) | 0 |
| GEMINI_MODEL_ID | `gemini-3-1-pro` (모델 ID) | 0 |
| NEXT_PUBLIC_* (2종) | 트리 시각화 임계값 | 0 (어차피 클라이언트 노출 의도) |
| LEGEND_DELEGATION_ENABLED | `false` (kill switch) | 0 |

**API 키 시크릿 아님** — `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `SUPABASE_*` 등 **기존에 등록된** 시크릿은 본 import에 포함하지 않습니다.

## 삭제

import 완료 후 `legend-env.txt` 파일은 삭제해도 무관 (값 자체가 시크릿이 아니지만 정리 목적).

## 배포 후 확인

```bash
# 배포 트리거 (사용자 직접)
git push origin main

# 또는 Vercel 대시보드에서 redeploy 클릭

# 24h 모니터링은 docs/qa/g06-launch-checklist.md 참조
```

## env 변수 누락 시 fallback

코드에 모든 변수의 hardcoded default 가 있어서, 등록 누락 시에도 동작은 함. 단:

- `LEGEND_BETA_*` 5종 누락 → 베타 한도 5/3/1/1/1 default 적용 (영향 X)
- `GEMINI_MODEL_ID` 누락 → `gemini-3-1-pro` default
- `LEGEND_DELEGATION_ENABLED` 누락 → false (점진적 위임 OFF)

→ **import 안 해도 production 정상 작동**. 다만 quota 한도 변경 시 코드 재배포 vs env 변경 선택지 보존을 위해 등록 권장.
