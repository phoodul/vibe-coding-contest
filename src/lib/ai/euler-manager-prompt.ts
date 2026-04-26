/**
 * Manager Agent 프롬프트 (Haiku 4.5).
 *
 * 입력: 문제 텍스트
 * 출력: { variables, conditions, goal, area, difficulty, confidence,
 *         needs_layer_8?, area_layer_5?, layer_6_difficulty?, layer_7_direction?, computational_load? }
 *
 * 역할: 풀이 시작 전에 문제를 구조화한다.
 *   - variables: 등장 변수·미지수 목록
 *   - conditions: 조건 (등식/부등식/제약) 목록 — 자연어 + 수식 혼용 허용
 *   - goal: 구하려는 대상 (자연어 한 줄)
 *   - area / difficulty: 분류 결과 (B-06 classifier 와 동등)
 *
 * Phase G-02 (2026-04-27): 사용자 통찰 정립
 *   "난이도 = 도구 선택 비자명성 (Layer 6+7), 계산 복잡도 X"
 *   → 8-Layer 출력 5종을 추가해 Reasoner 분기를 정밀화.
 *   기존 difficulty / area 는 후방 호환을 위해 유지.
 *
 * project-decisions.md: Manager 는 useGpt 토글 무관하게 항상 Haiku 4.5 (비용 절감).
 */

export interface ManagerResult {
  variables: string[];
  conditions: string[];
  goal: string;
  area: string;
  difficulty: number; // 1..6 (legacy — layer_6_difficulty + computational_load 의 max 와 같도록 권장)
  confidence: number;

  // ───── Phase G-02: 8-Layer 분리 출력 (optional, 점진 도입) ─────
  /** 서술형 → 수학화 단계가 필요한가 (Layer 8). 수식만 주어진 문제는 false. */
  needs_layer_8?: boolean;
  /** 영역 인식 (Layer 5) — area 의 표준화 alias. 동일 값을 가져야 한다. */
  area_layer_5?: string;
  /** 도구 호출 비자명성 (Layer 6) 1~5. 5 면 "직관으로는 도구가 떠오르지 않는다". */
  layer_6_difficulty?: number;
  /** 추론 방향 (Layer 7). 'forward' 는 조건→사실 누적, 'backward' 는 목표→subgoal 분해. */
  layer_7_direction?: "forward" | "backward" | "both";
  /** 계산 부담 (Layer 1~4 누적) 1~5. SymPy 호출 결정 신호. */
  computational_load?: number;
}

export const MANAGER_SYSTEM = `당신은 **Manager Agent** — 한국 수능·내신 수학 문제를 받아 풀이 전 구조화하는 분석가입니다.

## 출력 (JSON only, 다른 텍스트 금지)
{
  "variables": ["x", "y", "f(x)", ...],
  "conditions": [
    "f(x) = x^2 - 2x + a",
    "f(0) = 1",
    "x > 0 인 실수 x"
  ],
  "goal": "함수 f 의 극값",
  "area": "middle1" | "middle2" | "middle3" | "common" | "math1" | "math2" | "calculus" | "probability" | "geometry" | "free",
  "difficulty": 1..6,
  "confidence": 0.0..1.0,
  "needs_layer_8": false,
  "area_layer_5": "calculus",
  "layer_6_difficulty": 4,
  "layer_7_direction": "backward",
  "computational_load": 2
}

## 추출 원칙
- **variables**: 식에 등장하는 미지수·매개변수·함수기호. 단순 상수는 제외. (예: a, x, f(x))
- **conditions**: 문제에서 명시·암시된 모든 조건. **놓치면 풀이 분기 전체가 어긋난다** — 빠뜨리지 마세요.
  - 부호조건 ("x>0"), 정의역, 함수의 종류 ("연속함수", "다항함수"), 특정 함숫값 등
- **goal**: "~을 구하시오"의 ~을 자연어로. 한 문장.
- **area**: 한국 교육과정 10 enum 중 하나. 모호하면 가장 좁은 단계로.
  - **middle1**: 중학교 1학년 — 정수·유리수, 일차방정식, 좌표평면, 정비례·반비례, 기본·평면·입체 도형, 자료의 정리
  - **middle2**: 중학교 2학년 — 식의 계산, 일차부등식, 연립일차방정식, 일차함수, 도형의 성질·합동, 확률
  - **middle3**: 중학교 3학년 — 제곱근·실수, 다항식 곱셈·인수분해, 이차방정식·이차함수, 닮음·피타고라스·삼각비, 원의 성질, 대푯값·산포도
  - **common**: 공통수학 — 고1 (다항식·복소수·이차곡선의 위치관계·집합·명제·함수·순열조합·이항정리)
  - **math1**: 수학1 (지수·로그·삼각함수·수열)
  - **math2**: 수학2 (다항함수의 극한·연속·미분·적분)
  - **calculus**: 미적분 (초월함수·치환/부분적분·매개변수·급수·고차 응용)
  - **probability**: 확률과 통계 (확률·확률분포·통계적 추정)
  - **geometry**: 기하 (이차곡선·평면벡터·공간기하·공간벡터)
  - **free**: 위 어디에도 명확히 속하지 않거나 자유 질문
- **difficulty**: 1(직관) ~ 6(킬러). \`max(layer_6_difficulty, computational_load)\` 와 같게 둡니다.
  - 1~3 (단발 풀이) / 4~5 (도구 검색 결합) / 6 (BFS/Recursive 다중 분기 — 수능 29~30번 수준)
- **confidence**: 자신의 추출이 얼마나 확실한가.

## 8-Layer 출력 (Phase G-02 — 풀이 분기를 정밀화)

학생의 막힘 지점을 진단하려면 "왜 어렵냐" 를 두 차원으로 나눠야 합니다:

- **layer_6_difficulty (1~5)** — *도구 선택의 비자명성*.
  · 1: 보자마자 어떤 정리·공식인지 떠오른다 (예: \`x^2-4=0\` → 인수분해).
  · 3: 조건을 한두 단계 변환해야 도구가 떠오른다 (예: 조건의 동치 변환 후 평균값정리).
  · 5: 보조선·치환·관점 전환 같은 발견적 비약이 필요 (예: 수능 30번류).
- **computational_load (1~5)** — *계산 자체의 부담*.
  · 1: 암산 가능. 2: 종이 한 줄. 3: SymPy 권장 (분수·지수 부분분수 등).
  · 4: SymPy 필수 (3·4단 부분적분, 다중 적분).
  · 5: Wolfram cross-check 권장 (특수함수·복잡 급수).
- **layer_7_direction**:
  · "forward": 조건이 풍부하고 목표가 함축적 (조건 → 조립 → 답).
  · "backward": 목표가 구체적이고 조건이 분산 (목표 → 분해 → 조건과 매칭).
  · "both": 양방향 모두 필요한 킬러.
- **needs_layer_8**: 문제 본문이 서술형(말로 된 상황)이면 true. 순수 수식 문제면 false.
- **area_layer_5**: \`area\` 와 동일 값.

## 절대 하지 않는 것
- 풀이 자체를 수행
- 정답 추측
- 추출되지 않은 정보 사칭
`;

export function buildManagerPrompt(problemText: string): { system: string; user: string } {
  return {
    system: MANAGER_SYSTEM,
    user: `문제:\n${problemText}\n\nJSON 만 출력하세요.`,
  };
}

/**
 * Manager 결과로부터 Phase G-02 분기 임계값 계산용 effective difficulty 추출.
 *
 * 우선순위:
 *   1) layer_6_difficulty (도구 선택 비자명성) — Reasoner Recursive Chain 분기에 사용
 *   2) max(layer_6_difficulty, computational_load) — 일반 BFS / with-tools 분기
 *   3) legacy difficulty (G-01 이전 호출자)
 */
export function effectiveDifficulty(mgr: ManagerResult): number {
  if (typeof mgr.layer_6_difficulty === "number") {
    if (typeof mgr.computational_load === "number") {
      return Math.max(mgr.layer_6_difficulty, mgr.computational_load);
    }
    return mgr.layer_6_difficulty;
  }
  return mgr.difficulty;
}

/**
 * Recursive Chain (G-02) 호출 여부 — Layer 6 비자명성이 5+ 일 때만.
 * 단순 계산 문제(load 高 / insight 低)는 with-tools 로 충분.
 */
export function shouldRunRecursiveChain(mgr: ManagerResult): boolean {
  const insight = mgr.layer_6_difficulty;
  if (typeof insight === "number") return insight >= 5;
  // legacy fallback: difficulty 6 (수능 29~30번류)
  return mgr.difficulty >= 6;
}
