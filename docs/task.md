# Maestro 4 과목 — Task List

> **시작**: 2026-05-06 (19차 세션)
> **Plan**: `docs/implementation_plan_maestro.md`
> **목표**: Physics / Chemistry / Biology / Earth Science Maestro 4 도구 추가 (학생 13 → 17)
> **PoC 순서**: Earth Science → Biology → Physics → Chemistry
> **URL**: `/earth-science` · `/biology` · `/physics` · `/chemistry` (단독·짧음, maestro 미포함)
> **총 33 task / 약 3.5주**

## 진행 표

| Phase | 영역 | Task 수 | Status |
|---|---|---|---|
| **A** | 인프라 일반화 (`lib/legend` → `lib/maestro`) + Vision LLM | 11 | ✅ 6/11 핵심 완료 + 22차 5 phase 분리로 A6/A7/A10 의미 변경 |
| **B** | Earth Science PoC ⭐ | 5 | ✅ production 작동 (21차 multimodal 사슬 fix 후) |
| **C** | Biology / Physics / Chemistry 확장 | 15 | 🔄 페이지·portrait·시드 완료 / 사용자 quality 검토 대기 |
| **D** | 대시보드 통합 + 출시 | 3 | ✅ 17 도구 카드 활성 / production live |
| **22차 추가 — Maestro/Legend 분리** | 5 phase | 5 | ✅ 모두 완료 (commits 6754b55 / 85c2412 / 36f91aa / 9b12504 / 1cda757) |
| **22차 추가 — Maestro 기능 확장** | 풀이정리·트리거·리포트 | 3 | ✅ 모두 완료 (966c56c / 30e49a3 / 1cda757) |
| **22차 추가 — 결제 시스템** | DB·약관·SDK·API·UI·quota | 7 | ✅ 모두 완료 (febdb7c / 99fd491) |
| **23차 — 결제 활성화 정비 + Chat 추출** | A1~A5 + B1a~B2 | 8 | ✅ 6/8 완료 (A1 `377cc7c` · A2 `4365a2e` · A3 `1d5ddb2` · A4 `f35da91` · A5=skip · B2 `24bd744`) / 🔄 B1a·B1b = 24차로 이월 |
| **24차 — Chat 진짜 분리** | B1a + B1b | 2 | ✅ 모두 완료 (B1a `36adb4a` MaestroChat 진짜 추출 / B1b `7fb77ee` LegendChat math 전용 단순화) |

---

## Phase A — 인프라 일반화 (11 task / 1주)

| # | Task | 내용 | DoD | Commit |
|---|---|---|---|---|
| A1a-c | Subject type + PERSONAS_BY_SUBJECT | types.ts Subject·라벨·URL slug + PERSONAS_BY_SUBJECT Record | typecheck + 257/257 | ✅ `113e653` |
| A1d | trigger-accumulator subject 매개변수 | AccumulateInput.subject + log insert subject | 회귀 0 | ✅ `51d57eb` |
| A2 | `lib/maestro/` adapter | thin re-export wrapper (Phase D 끝 진짜 rename) | typecheck pass | ✅ `51d57eb` |
| A5 | DB 마이그레이션 SQL | `legend_*` 7 테이블에 subject 컬럼 + 인덱스 3종. ⚠️ production 적용은 사용자 직접 | SQL 파일 작성 | ✅ `51d57eb` |
| A8 | KaTeX mhchem | StreamingMarkdown · MathText 에 `katex/contrib/mhchem` import + 7 회귀 테스트 | 292/292 | ✅ `59e2f2d` |
| A9 | Vision LLM 골격 ⭐ | `lib/maestro/vision.ts` — FigureKind 9종 / VisionInput·Output / 도표 5단계 standard / SUBJECT_FIGURE_HINTS. analyzeVision() 미구현 (Phase B 진입 시 Sonnet 4.6 vision 채움) | typecheck pass | ✅ `1dadcc0` |
| A6 | API 라우트 (Earth Science) | `/api/maestro/[subject]/*` — Phase B 진입 시 Earth Science 라우트와 합쳐 진행 | Legend 라우트 회귀 0 | ⏳ Phase B 통합 |
| A7 | admin trigger subject 필터 | `/admin/candidate-triggers` 페이지에 subject 필터 칩 추가 | admin 페이지 OK | ⏳ |
| A10 | mass test fixture | per-subject test fixture 4 과목 추가 | 1000+ 회귀 0 | ⏳ Phase B 통합 |
| A11 | push origin/main | typecheck + 4 commits push | OK | ✅ `eae18c2..1dadcc0` push |

## Phase B — Earth Science PoC (5 task / 1주) ⭐

> 18차 자체 제작 교과서 200p 자산 활용. 마인드맵 ↔ Maestro cross-link 검증.

| # | Task | 내용 | DoD | Commit |
|---|---|---|---|---|
| B1 | `/earth-science` 페이지 | layout · page (Legend 패턴 복제, subject="earth-science") | 카드→페이지 진입 OK | |
| B2 | 페르소나 portrait 3개 (베게너·갈릴레이·허블) | PD/생성, `public/earth-science/*-portrait.jpg` | TutorBadge·PickerModal 노출 | |
| B3 | Earth Science trigger 시드 30개+ | 자체 교과서 5 chapter 에서 추출. 지권·지구역사·대기·해양·천체. `data/seeds/earth-science-anchors.json` | seed import + 5 chapter 매칭 테스트 | |
| B4 | Earth Science system prompt | 도표 5단계 + 단위·플레이트 `\text{}` + 페르소나 trait | Vision LLM 케이스 회귀 테스트 | |
| B5 | 베타 게이트 + cross-link + quality 검토 | 캡쳐/필기 입력 + 마인드맵 🌍 ↔ Maestro cross-link + 소크라테스 ↔ Maestro cross-link | production smoke + 사용자 quality 검토 | |

## Phase C — 나머지 3 과목 확장 (15 task / 1.5주)

> **순서**: Biology (유전 trigger 검증) → Physics → Chemistry.

### C-Biology (5 task) — 2번째 PoC ⭐

| # | Task | DoD | Commit |
|---|---|---|---|
| C-B1 | `/biology` 페이지 | 카드→페이지 진입 | |
| C-B2 | 페르소나 portrait 3개 (다윈·멘델·왓슨) | TutorBadge 노출 | |
| C-B3 | Biology trigger 시드 50개+ ⭐ (유전 30개 + 진화·생태·세포 합) | seed import + 가계도 fixture 테스트 | |
| C-B4 | Biology system prompt (가계도 분석 5단계 + 유전자형 `\text{}`) | 회귀 테스트 | |
| C-B5 | 베타 게이트 + cross-link + 사용자 quality 검토 | smoke | |

### C-Physics (5 task)

| # | Task | DoD | Commit |
|---|---|---|---|
| C-P1 | `/physics` 페이지 | 진입 | |
| C-P2 | 페르소나 portrait 3개 (파인만·뉴턴·아인슈타인) | 노출 | |
| C-P3 | Physics trigger 시드 30개+ (역학·전자기·열·파동·근대) | seed | |
| C-P4 | Physics system prompt (벡터·SI·곱셈 인접 + 그래프 5단계) | 회귀 | |
| C-P5 | 베타 게이트 + 캡쳐/필기 + quality | smoke | |

### C-Chemistry (5 task)

| # | Task | DoD | Commit |
|---|---|---|---|
| C-C1 | `/chemistry` 페이지 | 진입 | |
| C-C2 | 페르소나 portrait 3개 (멘델레예프·라부아지에·폴링) | 노출 | |
| C-C3 | Chemistry trigger 시드 30개+ (화학식·반응·평형·산염기·산화환원) | seed | |
| C-C4 | Chemistry system prompt (모든 분자식 `\ce{}`, 평형 `<=>` + 반응 모식도 5단계) | 회귀 | |
| C-C5 | 베타 게이트 + 캡쳐/필기 + quality | smoke | |

## Phase D — 대시보드 통합 + 출시 (3 task)

| # | Task | DoD | Commit |
|---|---|---|---|
| D1 | 대시보드 카드 4개 추가 | 학생 13 → 17 도구 | |
| D2 | 마인드맵·소크라테스 ↔ Maestro cross-link 일괄 정비 | 생명·지구는 소크라테스(개념)+Maestro(문제풀이) 짝 | |
| D3 | production 검증 + 베타 모집 채널 공지 | 19차 세션 commit summary | |

---

## 메모

- **자율 진행 권한** (사용자 메모리): Phase A 자율 진행. quality gate (B5·C-B5·C-P5·C-C5) 만 사용자 검토.
- **commit 단위**: task 1개 = 1 commit 원칙. 큰 task (A1·A4·A6·A9) 는 분할 가능.
- **회귀 회피**: Legend 테스트 419/420 + production `/legend` 동작 = 모든 Phase A task 의 DoD.
- **Vision LLM (A9)**: Sonnet 4.6 vision 호출 비용 — 도표 1장당 ~$0.005. 4 maestro 공유 인프라.
- **Mathpix PDF 일괄 OCR**: Phase 4+ 후순위. 캡쳐/필기 + Vision LLM 으로 충분.
