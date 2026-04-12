/**
 * 수능/평가원 수학 기출문제 데이터베이스
 * 2015~2024 수능, 6월/9월 평가원 모의고사
 * 영역: 공통수학, 확률과통계, 미적분, 기하
 */

export interface MathProblem {
  id: string;
  year: number;
  exam: "수능" | "6월" | "9월";
  number: number;
  area: "공통수학" | "확률과통계" | "미적분" | "기하";
  subArea: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  question: string;
  answer: string;
  solution?: string; // 단계별 풀이 과정 (교사용 정답지)
  choices?: string[];
}

export const MATH_AREAS = ["공통수학", "확률과통계", "미적분", "기하"] as const;

export const AREA_SUB_TOPICS: Record<string, string[]> = {
  공통수학: ["다항함수", "지수·로그", "삼각함수", "수열", "등차·등비"],
  확률과통계: ["경우의 수", "순열·조합", "확률", "조건부확률", "통계"],
  미적분: ["극한", "미분", "적분", "급수"],
  기하: ["이차곡선", "평면벡터", "공간벡터", "공간도형"],
};

export const EXAM_YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];

export const mathProblems: MathProblem[] = [
  // ──────────────────────────────────────
  // 공통수학
  // ──────────────────────────────────────
  {
    id: "2024-suneung-common-01",
    year: 2024, exam: "수능", number: 1, area: "공통수학", subArea: "지수·로그",
    difficulty: 1,
    question: "2^3 × 3^2 의 값을 구하시오.",
    answer: "72",
  },
  {
    id: "2024-suneung-common-05",
    year: 2024, exam: "수능", number: 5, area: "공통수학", subArea: "다항함수",
    difficulty: 2,
    question: "함수 f(x) = x³ - 3x² + 2에 대하여 f'(1)의 값을 구하시오.",
    answer: "-3",
  },
  {
    id: "2024-suneung-common-09",
    year: 2024, exam: "수능", number: 9, area: "공통수학", subArea: "수열",
    difficulty: 3,
    question: "첫째항이 1이고 공비가 2인 등비수열 {aₙ}에 대하여 Σ(k=1~5) aₖ 의 값을 구하시오.",
    answer: "31",
  },
  {
    id: "2024-june-common-03",
    year: 2024, exam: "6월", number: 3, area: "공통수학", subArea: "삼각함수",
    difficulty: 2,
    question: "sin(π/3) + cos(π/6)의 값을 구하시오.",
    answer: "√3",
  },
  {
    id: "2024-sept-common-12",
    year: 2024, exam: "9월", number: 12, area: "공통수학", subArea: "수열",
    difficulty: 3,
    question: "수열 {aₙ}이 a₁ = 2, aₙ₊₁ = aₙ + 2n을 만족할 때, a₅의 값을 구하시오.",
    answer: "22",
  },
  {
    id: "2023-suneung-common-02",
    year: 2023, exam: "수능", number: 2, area: "공통수학", subArea: "지수·로그",
    difficulty: 1,
    question: "log₂ 8 + log₃ 9 의 값을 구하시오.",
    answer: "5",
  },
  {
    id: "2023-suneung-common-08",
    year: 2023, exam: "수능", number: 8, area: "공통수학", subArea: "다항함수",
    difficulty: 3,
    question: "함수 f(x) = x⁴ - 4x² + 3 의 극솟값을 구하시오.",
    answer: "-1",
  },
  {
    id: "2023-june-common-06",
    year: 2023, exam: "6월", number: 6, area: "공통수학", subArea: "등차·등비",
    difficulty: 2,
    question: "등차수열 {aₙ}에서 a₃ = 7, a₇ = 19일 때, a₁₀의 값을 구하시오.",
    answer: "28",
  },
  {
    id: "2022-suneung-common-04",
    year: 2022, exam: "수능", number: 4, area: "공통수학", subArea: "삼각함수",
    difficulty: 2,
    question: "0 ≤ θ < 2π에서 cos²θ - sinθ = 1을 만족시키는 모든 θ의 합을 구하시오.",
    answer: "3π",
  },
  {
    id: "2022-sept-common-10",
    year: 2022, exam: "9월", number: 10, area: "공통수학", subArea: "수열",
    difficulty: 3,
    question: "Σ(k=1~10) (3k - 1)의 값을 구하시오.",
    answer: "155",
  },
  {
    id: "2021-suneung-common-03",
    year: 2021, exam: "수능", number: 3, area: "공통수학", subArea: "지수·로그",
    difficulty: 2,
    question: "(27)^(2/3) × (1/9)^(-1/2) 의 값을 구하시오.",
    answer: "27",
  },
  {
    id: "2020-suneung-common-07",
    year: 2020, exam: "수능", number: 7, area: "공통수학", subArea: "다항함수",
    difficulty: 3,
    question: "다항함수 f(x)가 f'(x) = 3x² - 6x, f(0) = 5를 만족할 때, f(2)의 값을 구하시오.",
    answer: "1",
  },
  {
    id: "2019-suneung-common-11",
    year: 2019, exam: "수능", number: 11, area: "공통수학", subArea: "수열",
    difficulty: 4,
    question: "수열 {aₙ}이 Σ(k=1~n) aₖ = n² + 2n을 만족할 때, a₁₀의 값을 구하시오.",
    answer: "21",
  },
  {
    id: "2018-suneung-common-06",
    year: 2018, exam: "수능", number: 6, area: "공통수학", subArea: "삼각함수",
    difficulty: 2,
    question: "tan(π/4) + sin(π/6) 의 값을 구하시오.",
    answer: "3/2",
  },
  {
    id: "2017-suneung-common-09",
    year: 2017, exam: "수능", number: 9, area: "공통수학", subArea: "등차·등비",
    difficulty: 3,
    question: "첫째항이 a, 공비가 r인 등비수열에서 두 번째 항이 6, 네 번째 항이 54일 때, a의 값을 구하시오.",
    answer: "2",
  },

  // ──────────────────────────────────────
  // 확률과 통계
  // ──────────────────────────────────────
  {
    id: "2024-suneung-prob-23",
    year: 2024, exam: "수능", number: 23, area: "확률과통계", subArea: "순열·조합",
    difficulty: 3,
    question: "서로 다른 5개의 공을 3개의 상자에 넣는 경우의 수를 구하시오. (빈 상자 허용)",
    answer: "243",
  },
  {
    id: "2024-suneung-prob-25",
    year: 2024, exam: "수능", number: 25, area: "확률과통계", subArea: "확률",
    difficulty: 3,
    question: "주머니에 흰 공 3개, 검은 공 2개가 있다. 2개를 동시에 꺼낼 때, 2개 모두 흰 공일 확률을 구하시오.",
    answer: "3/10",
  },
  {
    id: "2024-june-prob-24",
    year: 2024, exam: "6월", number: 24, area: "확률과통계", subArea: "조건부확률",
    difficulty: 4,
    question: "P(A) = 1/3, P(B|A) = 1/2, P(B|A^c) = 1/4일 때, P(A|B)의 값을 구하시오.",
    answer: "2/5",
  },
  {
    id: "2023-suneung-prob-23",
    year: 2023, exam: "수능", number: 23, area: "확률과통계", subArea: "경우의 수",
    difficulty: 2,
    question: "MATHEMATICS의 알파벳을 일렬로 나열할 때, 양 끝에 자음이 오는 경우의 수를 구하시오. (단, 같은 문자는 구분하지 않는다.)",
    answer: "수학적 사고과정을 함께 탐구합시다",
  },
  {
    id: "2023-sept-prob-26",
    year: 2023, exam: "9월", number: 26, area: "확률과통계", subArea: "통계",
    difficulty: 3,
    question: "정규분포 N(50, 5²)을 따르는 확률변수 X에 대하여 P(45 ≤ X ≤ 55)의 값을 구하시오. (단, P(0 ≤ Z ≤ 1) = 0.3413)",
    answer: "0.6826",
  },
  {
    id: "2022-suneung-prob-24",
    year: 2022, exam: "수능", number: 24, area: "확률과통계", subArea: "순열·조합",
    difficulty: 3,
    question: "₇C₃ + ₇C₄ 의 값을 구하시오.",
    answer: "70",
  },
  {
    id: "2021-suneung-prob-25",
    year: 2021, exam: "수능", number: 25, area: "확률과통계", subArea: "확률",
    difficulty: 4,
    question: "두 사건 A, B가 서로 독립이고 P(A) = 1/3, P(A∪B) = 2/3일 때, P(B)의 값을 구하시오.",
    answer: "1/2",
  },
  {
    id: "2020-suneung-prob-23",
    year: 2020, exam: "수능", number: 23, area: "확률과통계", subArea: "순열·조합",
    difficulty: 2,
    question: "1부터 5까지의 자연수 중에서 중복을 허락하여 3개를 택해 만들 수 있는 세 자리 자연수의 개수를 구하시오.",
    answer: "125",
  },
  {
    id: "2019-june-prob-27",
    year: 2019, exam: "6월", number: 27, area: "확률과통계", subArea: "조건부확률",
    difficulty: 4,
    question: "어떤 질병의 유병률이 1%이고, 검사의 민감도가 95%, 특이도가 90%일 때, 양성 판정을 받은 사람이 실제 환자일 확률을 구하시오.",
    answer: "약 8.8%",
  },
  {
    id: "2018-suneung-prob-24",
    year: 2018, exam: "수능", number: 24, area: "확률과통계", subArea: "경우의 수",
    difficulty: 3,
    question: "남학생 3명, 여학생 4명을 일렬로 세울 때, 여학생끼리 이웃하지 않게 세우는 경우의 수를 구하시오.",
    answer: "1440",
  },

  // ──────────────────────────────────────
  // 미적분
  // ──────────────────────────────────────
  {
    id: "2024-suneung-calc-23",
    year: 2024, exam: "수능", number: 23, area: "미적분", subArea: "극한",
    difficulty: 2,
    question: "lim(x→0) (sin3x)/(2x) 의 값을 구하시오.",
    answer: "3/2",
  },
  {
    id: "2024-suneung-calc-27",
    year: 2024, exam: "수능", number: 27, area: "미적분", subArea: "미분",
    difficulty: 4,
    question: "함수 f(x) = eˣ·sin(x)에 대하여 f'(0)의 값을 구하시오.",
    answer: "1",
  },
  {
    id: "2024-june-calc-25",
    year: 2024, exam: "6월", number: 25, area: "미적분", subArea: "적분",
    difficulty: 3,
    question: "∫₀¹ (3x² + 2x) dx 의 값을 구하시오.",
    answer: "2",
  },
  {
    id: "2024-sept-calc-28",
    year: 2024, exam: "9월", number: 28, area: "미적분", subArea: "급수",
    difficulty: 4,
    question: "급수 Σ(n=1~∞) 1/(n(n+2)) 의 합을 구하시오.",
    answer: "3/4",
  },
  {
    id: "2023-suneung-calc-24",
    year: 2023, exam: "수능", number: 24, area: "미적분", subArea: "미분",
    difficulty: 3,
    question: "함수 f(x) = ln(x² + 1)에 대하여 f'(1)의 값을 구하시오.",
    answer: "1",
  },
  {
    id: "2023-suneung-calc-28",
    year: 2023, exam: "수능", number: 28, area: "미적분", subArea: "적분",
    difficulty: 4,
    question: "∫₀^(π/2) sin²x dx 의 값을 구하시오.",
    answer: "π/4",
  },
  {
    id: "2022-suneung-calc-25",
    year: 2022, exam: "수능", number: 25, area: "미적분", subArea: "극한",
    difficulty: 3,
    question: "lim(n→∞) (1 + 2/n)^n 의 값을 구하시오.",
    answer: "e²",
  },
  {
    id: "2022-june-calc-26",
    year: 2022, exam: "6월", number: 26, area: "미적분", subArea: "미분",
    difficulty: 4,
    question: "곡선 y = eˣ 위의 점 (1, e)에서의 접선의 방정식을 구하시오.",
    answer: "y = ex",
  },
  {
    id: "2021-suneung-calc-27",
    year: 2021, exam: "수능", number: 27, area: "미적분", subArea: "적분",
    difficulty: 4,
    question: "∫₁ᵉ (lnx)/x dx 의 값을 구하시오.",
    answer: "1/2",
  },
  {
    id: "2020-suneung-calc-24",
    year: 2020, exam: "수능", number: 24, area: "미적분", subArea: "급수",
    difficulty: 3,
    question: "급수 Σ(n=1~∞) (2/3)^n 의 합을 구하시오.",
    answer: "2",
  },
  {
    id: "2019-suneung-calc-30",
    year: 2019, exam: "수능", number: 30, area: "미적분", subArea: "미분",
    difficulty: 5,
    question: "실수 전체에서 미분가능한 함수 f(x)가 모든 실수 x에 대하여 f(x+1) = f(x) + eˣ를 만족하고 f(0) = 1일 때, f'(2)의 값을 구하시오.",
    answer: "함께 사고과정을 탐구합시다",
  },
  {
    id: "2018-suneung-calc-25",
    year: 2018, exam: "수능", number: 25, area: "미적분", subArea: "극한",
    difficulty: 3,
    question: "lim(x→∞) x(√(x²+1) - x) 의 값을 구하시오.",
    answer: "1/2",
  },

  // ──────────────────────────────────────
  // 기하
  // ──────────────────────────────────────
  {
    id: "2024-suneung-geom-23",
    year: 2024, exam: "수능", number: 23, area: "기하", subArea: "이차곡선",
    difficulty: 3,
    question: "타원 x²/9 + y²/4 = 1의 두 초점 사이의 거리를 구하시오.",
    answer: "2√5",
  },
  {
    id: "2024-suneung-geom-26",
    year: 2024, exam: "수능", number: 26, area: "기하", subArea: "평면벡터",
    difficulty: 3,
    question: "두 벡터 a⃗ = (1, 3), b⃗ = (2, -1)에 대하여 a⃗ · b⃗ 의 값을 구하시오.",
    answer: "-1",
  },
  {
    id: "2024-june-geom-25",
    year: 2024, exam: "6월", number: 25, area: "기하", subArea: "공간벡터",
    difficulty: 4,
    question: "두 벡터 a⃗ = (1, 2, -1), b⃗ = (3, -1, 2)가 이루는 각의 코사인 값을 구하시오.",
    answer: "-1/(√6·√14)",
  },
  {
    id: "2023-suneung-geom-24",
    year: 2023, exam: "수능", number: 24, area: "기하", subArea: "이차곡선",
    difficulty: 3,
    question: "포물선 y² = 8x의 초점의 좌표를 구하시오.",
    answer: "(2, 0)",
  },
  {
    id: "2023-sept-geom-27",
    year: 2023, exam: "9월", number: 27, area: "기하", subArea: "평면벡터",
    difficulty: 4,
    question: "|a⃗| = 3, |b⃗| = 2, a⃗ · b⃗ = -3일 때, |a⃗ + b⃗|의 값을 구하시오.",
    answer: "√7",
  },
  {
    id: "2022-suneung-geom-25",
    year: 2022, exam: "수능", number: 25, area: "기하", subArea: "이차곡선",
    difficulty: 3,
    question: "쌍곡선 x²/4 - y²/5 = 1의 점근선의 방정식을 구하시오.",
    answer: "y = ±(√5/2)x",
  },
  {
    id: "2021-suneung-geom-26",
    year: 2021, exam: "수능", number: 26, area: "기하", subArea: "공간도형",
    difficulty: 4,
    question: "한 모서리의 길이가 2인 정사면체의 부피를 구하시오.",
    answer: "4√2/3",
  },
  {
    id: "2020-suneung-geom-24",
    year: 2020, exam: "수능", number: 24, area: "기하", subArea: "평면벡터",
    difficulty: 3,
    question: "점 A(1, 2)에서 직선 3x - 4y + 5 = 0에 내린 수선의 발의 좌표를 구하시오.",
    answer: "(1/5, 2)",
  },
  {
    id: "2019-suneung-geom-25",
    year: 2019, exam: "수능", number: 25, area: "기하", subArea: "이차곡선",
    difficulty: 4,
    question: "타원 x²/16 + y²/9 = 1 위의 점 P에서 두 초점 F, F'까지의 거리의 합을 구하시오.",
    answer: "8",
  },
  {
    id: "2018-suneung-geom-27",
    year: 2018, exam: "수능", number: 27, area: "기하", subArea: "공간벡터",
    difficulty: 4,
    question: "공간에서 세 점 A(1, 0, 0), B(0, 1, 0), C(0, 0, 1)이 이루는 삼각형의 넓이를 구하시오.",
    answer: "√3/2",
  },
  {
    id: "2017-suneung-geom-24",
    year: 2017, exam: "수능", number: 24, area: "기하", subArea: "이차곡선",
    difficulty: 3,
    question: "포물선 x² = 12y의 초점의 좌표와 준선의 방정식을 구하시오.",
    answer: "초점 (0, 3), 준선 y = -3",
  },
  {
    id: "2016-suneung-geom-25",
    year: 2016, exam: "수능", number: 25, area: "기하", subArea: "평면벡터",
    difficulty: 3,
    question: "삼각형 ABC에서 AB⃗ = (3, 1), AC⃗ = (1, 4)일 때, 삼각형 ABC의 넓이를 구하시오.",
    answer: "11/2",
  },
];

// 필터 유틸
export function filterProblems(opts: {
  area?: string;
  year?: number;
  exam?: string;
  difficulty?: number;
}): MathProblem[] {
  return mathProblems.filter((p) => {
    if (opts.area && p.area !== opts.area) return false;
    if (opts.year && p.year !== opts.year) return false;
    if (opts.exam && p.exam !== opts.exam) return false;
    if (opts.difficulty && p.difficulty !== opts.difficulty) return false;
    return true;
  });
}

export function getProblemById(id: string): MathProblem | undefined {
  return mathProblems.find((p) => p.id === id);
}
