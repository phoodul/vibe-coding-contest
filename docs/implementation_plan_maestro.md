# Implementation Plan — 4 과학 Maestro (물리·화학·생명·지구과학)

> **작성**: 2026-05-06 (19차 세션 시작)
> **요청**: 사용자 — Legend Tutor 와 비슷한 Physics / Chemistry / Biology / Earth Science Maestro 4개 추가
> **핵심**: 문제풀이 가이드. 수능 PDF 업로드 → Mathpix 파이프라인 → 정답 DB → trigger 코칭.

---

## 1. 비전 매핑 (충돌 점검)

| 도구 | 콘텐츠 | 역할 | 위치 |
|---|---|---|---|
| 헤밍웨이 영문법 | 자체 200p 텍스트북 | 학습 | 영문법만 |
| **소크라테스 튜터** | 자체 제작 교과서 (생활윤리·언매·생명·지구·통합사회 등) | **개념 학습** narrator | 수학 제외 전 교과 |
| **Legend Tutor** | 수학 시드 + 수능 정답 DB | **문제풀이 코칭** | 수학 전용 |
| **Physics Maestro** (NEW) | 수능 물리Ⅰ PDF + 자체 시드 | 문제풀이 코칭 | 물리 전용 |
| **Chemistry Maestro** (NEW) | 수능 화학Ⅰ PDF + 자체 시드 | 문제풀이 코칭 | 화학 전용 |
| **Biology Maestro** (NEW) | 수능 생명과학Ⅰ PDF + 자체 시드 | 문제풀이 코칭 | 생명 전용 |
| **Earth Science Maestro** (NEW) | 수능 지구과학Ⅰ PDF + 자체 시드 | 문제풀이 코칭 | 지구 전용 |

**대시보드**: 학생 13 → **17 도구**. 4 maestro 단독 카드.

**소크라테스 vs Maestro 동일 과목 분담**: 생명과학·지구과학은 이미 소크라테스(개념 학습) 구축 완료 → Maestro(문제풀이) 가 짝을 이룸. 같은 페이지에서 cross-link.

### 미래 확장 — Korean / English Maestro (Phase 5+) ⭐

**English Maestro** (2026-05-06 사용자 비전):
- 영역 = **수능 영어 추론·독해** (빈칸·순서 배열·문장 삽입·요약·제목 등)
- 헤밍웨이 (`/grammar`) 와 분담: 헤밍웨이 = 영문법·어법 / English Maestro = 추론·독해
- 페르소나 1차안: **셰익스피어 / 처칠 / 촘스키** (영문학·수사·통사론)
- trigger 핵심: 문장 간 논리 연결, 단서어(however, thus, in contrast) 마킹, 문맥 어휘 추정
- 사용자 결정 보류 (페르소나·시드 = Phase 5+ 진입 시)

### 미래 확장 — Korean Maestro (Phase 5+) ⭐

**2026-05-06 사용자 직접 비전 제시**:
- 페르소나 후보: **세종대왕 / 정약용 / 율곡 이이** (+ 추가 후보)
- 기능: 수능 국어 풀이 + 해설
- **핵심 목적**: "정답을 찾는 **최적의 방법**을 학습시키는데 있다"

이 비전이 maestro 의 본질과 정확히 일치 (`feedback_trigger_definition.md` — Trigger = "왜 이 도구?" 의 답). 수능 국어 trigger 예시:

| 상황 (trigger) | 도구 (접근법) |
|---|---|
| 비문학 지문 | 5W1H 마킹 → 보기와 1:1 매칭 |
| 문학 지문 (시) | 화자·정서·태도 분리 → 시구 의미 후보 좁히기 |
| 어휘 문제 | 문맥 단서 추출 → 사전적 vs 문맥적 의미 분리 |
| 함정 보기 | 지문 미언급 / 일부 사실 / 과장 추정 — 3 패턴 매칭 |

→ Phase A 인프라 일반화 시 `subject` enum 에 `'korean'` 까지 미리 확장 가능한 구조로 설계 (Phase 5+ 추가 시 페르소나·시드만 작성 = 4 maestro 와 동일 패턴).

---

## 2. 핵심 결정 — 2026-05-06 사용자 확정 ✅

| # | 항목 | 확정 |
|---|---|---|
| **D1** | 인프라 일반화 | ✅ `lib/legend` → `lib/maestro` 추출 + Legend = `subject=math` adapter |
| **D2** | 첫 PoC | ✅ **Earth Science → Biology** 순서 (18차 자체 제작 교과서 자산 활용 + 마인드맵 cross-link 검증) |
| **D3** | 페르소나 수 | ✅ **모든 과목 3인** 통일 |
| **D4** | 베타 게이트 | ✅ Legend 동일 (30일 만료·50명 cap·가드레일 9 카테고리·위기 상담) |
| **D5** | URL | ✅ 단독·짧은 라우트 — `/physics`, `/chemistry`, `/biology`, `/earth-science` (충돌 없음 검증 완료) |
| **Q3** | `/legend/*` URL | ✅ 보존 (SEO·즐겨찾기 / Maestro adapter 와 병존) |
| **Q4** | 진행 순서 | ✅ Phase A (인프라) → Phase B (Physics PoC) → Phase C (나머지 3 과목 병렬) |

### 페르소나 — 확정안

| 과목 | 3거장 | 챕터 매핑 (참고) |
|---|---|---|
| **Physics** | 파인만 / 뉴턴 / 아인슈타인 | 양자·QED / 역학·원론 / 상대론·사고실험 |
| **Chemistry** | 멘델레예프 / 라부아지에 / 폴링 | 주기율표 / 정량화학 / 결합·구조 |
| **Biology** | 다윈 / 멘델 / **왓슨** | 진화 / 유전 / 분자생물학 (DNA 이중나선 — 학생 친밀도) |
| **Earth Science** | **베게너 / 갈릴레이 / 허블** ⭐ | 대륙이동·지권 / 천체관측·근대천문 / 외부은하·우주팽창 |

> **메모**: 5 챕터 ↔ 3인 1:1 강제 불필요. Legend 도 9 카테고리 ↔ 5인 비대칭. Manager(Haiku) 가 라우팅.

---

## 3. 인프라 일반화 (D1=b 가정) — 작업 규모 가늠

| 영역 | 현재 (`lib/legend`) | 일반화 후 (`lib/maestro`) | 작업 |
|---|---|---|---|
| Router | `legend-router.ts` 수학 도구 분류 | `MaestroRouter` interface + subject-specific 구현 | medium |
| Personas | `portraits.ts` 5거장 hardcode | `personas-by-subject.ts` Record<Subject, Persona[]> | medium |
| Trigger | `trigger-accumulator.ts` math 시드 검색 | `accumulator(subject)` 로 매개변수화 + 시드 source per subject | medium |
| Manager | `stage1-manager.ts` Haiku 자동분류 (수학 도구) | per-subject manager prompt + tool list | medium |
| Quota | `quota-manager.ts` legend_quotas | 그대로 활용 (subject 컬럼 추가 마이그레이션) | small |
| Access tier | `access-tier.ts` legend_beta_invites | maestro_beta_invites 신설 vs legend 통합 | small |
| Tests | `__tests__/` 수학 fixture | per-subject fixture 추가 | medium |

**Component 일반화** (`components/legend/` 30개):
- `BetaChat`, `TrialChat`, `MathText`, `ReasoningTreeView`, `PastExamPanel`, `TutorPickerModal` 등 **subject prop** 추가하여 일반화
- KaTeX(MathText) 는 물리·화학에서도 재사용. 화학은 화학식·구조 추가 필요 (RDKit·SMILES 또는 KaTeX `\ce{}`).

**DB**:
- 신규 테이블 4개 (`maestro_quotas` 통합 컬럼 vs subject 별 분리) → 통합 추천
- `legend_beta_invites` → `maestro_beta_invites` rename 또는 subject 컬럼 추가 (D2=A 사례처럼 ALTER 비용)
- 마이그레이션 5~8개 추정

---

## 4. 콘텐츠 파이프라인 — 캡쳐/필기 메인 + 표·그림 분석 강화 ⭐

**2026-05-06 사용자 확정**:
- 입력 = **캡쳐 업로드 + 필기 모드** (Legend 가 이미 보유: `HandwriteCanvas` · `InlineHandwritePanel` + Gauss `Ctrl+V` 이미지). 4 maestro 동일 재사용
- **표·그림 분석이 매우 중요** ⭐ — 수능 과학 지문은 그래프·도표·가계도·반응 모식도가 본문. Vision LLM 호출 강화 + system prompt 에 "도표 읽기 5단계" 명시

### 표·그림 분석 — Gauss 듀얼 튜터 패턴 재사용

| 자료 유형 | 처리 | 비고 |
|---|---|---|
| 텍스트 + 수식 | Mathpix → KaTeX (수학·물리) | 18차 검증 |
| 화학식·반응식 | mhchem (`\ce{}`) + Vision LLM | M-A8 |
| **그래프 (x-y 좌표)** | Vision LLM (Sonnet 4.6 vision) — 축·단위·기울기·추세 추출 | Gauss 패턴 재사용 |
| **표 (data table)** | Vision LLM — 행/열 추출 + 학생 풀이 단계 매칭 | 신규 prompt |
| **가계도 (Biology)** | Vision LLM — 세대·발현·우열 자동 라벨링 → trigger 매칭 | C-B 핵심 |
| **반응 모식도 / 지질 단면 / 천체 도식** | Vision LLM — 구조 라벨링 + 학생 질문에 매칭 | 과목별 prompt |

각 maestro system prompt 에 "도표 읽기 5단계" 명시:
1. 축·단위·범례 먼저 식별
2. 추세·peak·교차점 위치 파악
3. 데이터 → 개념 (도표가 어떤 법칙을 보여주는지)
4. 문제의 보기와 매칭
5. 의심스러운 영역 = 학생에게 질문 던지기 (소크라테스 방식)

### Mathpix 효용 — 과목별 차등

| 과목 | Mathpix | 근거 |
|---|---|---|
| 수학 | ⭐⭐⭐ 강력 | LaTeX 자동 변환 (18차 검증) |
| 물리 | ⭐⭐ 보조 | 수식·그래프 OK, 단위·벡터 표기 후처리 |
| 화학 | ⭐ 한계 | 반응식·구조식 부정확. mhchem 후처리 필수 |
| 생물 | ⭐ 거의 무용 | 가계도·표·그래프 본문, 수식 적음 |

→ **수능 정답 DB 사전 일괄 구축 = 후순위**. 학생이 채팅에 캡쳐 올린 시점에 LLM 직접 판정 + 선택적 정답 DB 매칭. 수학처럼 600+ 정답 DB 사전 구축은 Phase 4+.

### KaTeX 표기 standard (Phase A 에서 mhchem 활성화)

`StreamingMarkdown` (18차 LaTeX 정규화한 그 컴포넌트) 의 KaTeX 옵션에 mhchem extension 추가:

| 표기 | 입력 | 렌더 |
|---|---|---|
| 분자식 | `\ce{H2SO4}` | H₂SO₄ |
| 이온 | `\ce{Mg^2+}` | Mg²⁺ |
| 동위원소 | `\ce{^{12}_6C}` | ¹²₆C |
| 반응식 | `\ce{N2 + 3H2 -> 2NH3}` | N₂ + 3H₂ → 2NH₃ |
| 평형 | `\ce{<=>}` | ⇌ |
| 벡터 | `\vec{F} = m\vec{a}` | F⃗ = ma⃗ |
| SI 단위 | `9.8\,\mathrm{m/s^2}` | 9.8 m/s² |
| 곱셈 인접 | `F = ma`, `pV = nRT` | KaTeX 자연 처리 — 별도 변환 불요 |

각 maestro system prompt 에 표기 규칙 1장 명시:
- **Physics**: `\vec{}`, `\,\mathrm{}`, 곱셈 인접
- **Chemistry**: 모든 분자식·이온·반응식 = `\ce{}`. 평형 `<=>`
- **Biology**: 유전자형 = `\text{AaBb}` (폰트 보존). 우열 한글
- **Earth Science**: 단위·플레이트 이름 `\text{}` 보존

새 task: **M-A-mhchem** (30분, Phase A)

## 4b. 생물 유전 — Trigger 시드가 페르소나보다 더 중요 ⭐

`feedback_trigger_definition.md`: Tool = "A 이면 B" 명제 / **Trigger = "왜 이 도구?" 의 답**

생물 유전 고난도 = **조건부 판단 트리 코칭**:

| 상황 (trigger) | 도구 (접근법) |
|---|---|
| 가계도 + 부모 둘 다 정상 → 자녀 발현 | 열성 유전. 둘 다 보인자 |
| 부모 한 쪽 발현 → 자녀 모두 발현 | 우성 (불완전 우성 배제) |
| 남성에 빈도 ↑ | X-염색체 열성 1순위 |
| ABO + 혈우병 동시 | 독립유전·곱의 법칙 |
| ABO + Rh | 별도 trait → 곱 |
| 연관·교차 | 같은 염색체·교차율 거리 |
| 가계도 우열 미상 | 발현 비율로 추정 → 가계도 재해석 |

→ **생물 시드 trigger 30개+** 가 페르소나 quality 보다 학습 가치 높음. Biology PoC (2번째) 에서 trigger 라이브러리 일반화 검증을 한 번 더 받는 안전판 역할.

---

## 5. PoC 1과목 (D2=Physics) — Phase Maestro-A 분해

> **전제**: D1=b (일반화) + D2=Physics + D3=3거장 + D4=Legend 동일 + D5=단독 라우트.

### Phase A — 인프라 일반화 (1주, 9 task)

| Task | 내용 | DoD |
|---|---|---|
| **M-A1** | `lib/maestro/` 신설 + `lib/legend/` 의 router·personas·trigger·manager·quota·access-tier 추출 (subject 매개변수화) | 기존 Legend 테스트 419/420 그대로 통과 |
| **M-A2** | `lib/legend/` 는 maestro 의 `subject='math'` adapter 로 축소 — re-export 유지 (URL 호환) | `/legend` production 동작 회귀 0건 |
| **M-A3** | `personas-by-subject.ts` — math(5)·physics(3)·chemistry(3)·biology(3)·earth(3) Record | typecheck pass |
| **M-A4** | `components/maestro/` 추출 — `BetaChat·TrialChat·MathText·PastExamPanel·TutorPickerModal·ReasoningTree*` 에 subject prop | Legend BetaChat 변경 0 |
| **M-A5** | DB 마이그레이션 — `maestro_quotas`·`maestro_beta_invites`·`maestro_solve_logs` (subject 컬럼) 또는 legend 확장 | RLS · admin guard 통과 |
| **M-A6** | API 라우트 — `/api/maestro/[subject]/{route,solve,retry-with-tutor,tutor,report,reviews,quota,beta,build-summary}` | Legend 라우트 회귀 0 |
| **M-A7** | trigger accumulator log 의 subject 컬럼 추가 (D2 사고 회피 — column add 만, drop X) | admin/trigger-accumulation 페이지 subject 필터 |
| **M-A-mhchem** | KaTeX mhchem extension 활성화 — `StreamingMarkdown` `MathText` 옵션에 `\ce{}` · `<=>` 지원 + 회귀 테스트 | 분자식·이온·반응식 렌더 OK, 기존 수식 렌더 회귀 0 |
| **M-A8** | Vitest mass migration — Legend 테스트는 `subject='math'` 로 실행 / 새 maestro 테스트 fixture 4과목 | 1000+ 테스트 회귀 0 |
| **M-A9** | typecheck + production smoke (`/legend` 동작) | OK |

### Phase B — Earth Science PoC (1주, 5 task) ⭐

> **사용자 결정**: 첫 PoC = Earth Science. 18차 자체 제작 교과서 200p (5 chapter / 196 content) 자산 활용 + 마인드맵 cross-link 검증.

| Task | 내용 | DoD |
|---|---|---|
| **M-B1** | `/earth-science/page.tsx` + layout (Legend 패턴 복제, subject="earth-science") | 대시보드 카드 → 페이지 진입 OK |
| **M-B2** | 페르소나 portrait 3개 (베게너·갈릴레이·허블) | `public/earth-science/*-portrait.jpg` |
| **M-B3** | Earth Science 시드 trigger 30개+ (3 anchor × 10 도구) — 지권·지구역사·대기·해양·천체. 자체 교과서 5 chapter 에서 직접 추출 | `data/seeds/earth-science-anchors.json` |
| **M-B4** | Earth Science system prompt + 표·그림 분석 5단계 + 단위·플레이트 `\text{}` | Vision LLM 케이스 회귀 테스트 |
| **M-B5** | 베타 게이트 + 캡쳐/필기 + 마인드맵 ↔ Maestro cross-link + 사용자 quality 검토 | production smoke |

> ❌ 수능 PDF 일괄 OCR 삭제 — 캡쳐/필기 입력 + Vision LLM (표·그림 분석) 으로 대체.

### Phase C — Biology / Physics / Chemistry 확장 (1.5주, 15 task)

> **순서**: Biology 두 번째 (trigger 라이브러리 일반화 검증 + 유전 30 trigger ⭐) → Physics → Chemistry.

각 과목 5 task = M-B1~B5 패턴 반복. 인프라(M-A) + Earth Science(M-B) 검증 후 병렬 가능.

| 과목 | 페르소나 | 시드 trigger 분량 |
|---|---|---|
| **Biology** (2번째) | 다윈·멘델·왓슨 | **유전 30개+ ⭐** + 진화·생태·세포 합 50개 |
| **Physics** (3번째) | 파인만·뉴턴·아인슈타인 | 역학·전자기·열·파동·근대 30개+ |
| **Chemistry** (4번째) | 멘델레예프·라부아지에·폴링 | 화학식·반응·평형·산염기·산화환원 30개+ |

### Phase D — 대시보드 통합 + 출시 (3 task)

- **M-D1**: 대시보드 카드 4개 추가 (학생 13 → 17)
- **M-D2**: 마인드맵·소크라테스 ↔ Maestro cross-link (생명·지구는 소크라테스 + Maestro 짝)
- **M-D3**: production 검증 + 베타 모집

**총 32 task / 약 3.5주.**

---

## 6. 리스크 (Open Questions 모두 ✅ 해결)

| # | 리스크 | 대응 |
|---|---|---|
| R1 | Legend 인프라 일반화 중 회귀 (KPI 89.5% 손상) | M-A8 mass test + 단계별 검증. Legend = maestro adapter 로 호환성 유지 |
| R2 | 화학식 렌더 (KaTeX `\ce{}`) | M-A-mhchem 으로 mhchem extension 활성화 + 회귀 테스트 |
| R3 | 수능 과학 그래프 OCR 한계 | 캡쳐/필기 입력 메인 (Legend 패턴) — PDF 일괄 OCR 후순위 |
| R4 | 페르소나 quality | M-B5 끝 사용자 quality 검토 게이트. OK 후 Phase C 진행 |
| R5 | Biology 유전 trigger 깊이 | M-B 다음 Biology 우선 PoC + 30개 이상 trigger 시드 |

---

## 7. 다음 단계

✅ 모든 결정 확정 (2026-05-06). `docs/task.md` 작성 → **Phase A-1 (M-A1) 착수**.
