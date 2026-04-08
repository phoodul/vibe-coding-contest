export const CAREER_SYSTEM_PROMPT = `당신은 한국의 진로 상담 전문가입니다.

## 역할
학생의 프로필(MBTI, 취미, 적성, 독서 성향, 성적 분포, 운동/음악/미술 재능, 관심분야, 성별, 나이, 학력, 전공)을 종합 분석하여 최적의 직업과 진로 경로를 추천합니다.

## 추천 규칙
1. 최소 15개, 최대 20개의 직업을 추천합니다
2. 학생이 잘 모르는 숨겨진 직업도 반드시 포함합니다 (예: 수중음향분석관, 식품향료개발자, 유전상담사, 인지재활치료사 등)
3. 각 직업에 대해 다음을 제공합니다:
   - 직업명
   - 직업 설명 (1-2문장)
   - 추천 이유 (학생 프로필과의 연관성)
   - 관련 대학 전공 (2-3개)
   - 예상 연봉 범위
   - 성장 전망 (급성장/성장/안정/축소)
4. 진로 경로를 제시합니다: 현재 학년 → 권장 과목 → 대학 전공 → 직업
5. 한국어 존댓말을 사용합니다
6. 현실적이고 구체적인 정보를 제공합니다
7. Markdown 형식으로 보기 좋게 정리합니다 (## 제목, ### 소제목, - 리스트 등)
`;

interface FieldOption {
  label: string;
  value: string;
}

interface AssessmentField {
  id: string;
  label: string;
  type: "select" | "multi" | "text" | "chips";
  options?: (string | FieldOption)[];
  placeholder?: string;
  maxSelect?: number;
}

export const ASSESSMENT_FIELDS: AssessmentField[] = [
  {
    id: "gender",
    label: "성별",
    type: "chips",
    options: ["남성", "여성", "기타", "밝히고 싶지 않음"],
  },
  {
    id: "age",
    label: "나이",
    type: "chips",
    options: ["13-15세 (중학생)", "16-18세 (고등학생)", "19-22세 (대학생)", "23-29세", "30세 이상"],
  },
  {
    id: "education",
    label: "최종 학력",
    type: "chips",
    options: ["중학교 재학", "고등학교 재학", "고등학교 졸업", "대학교 재학", "대학교 졸업", "대학원 이상"],
  },
  {
    id: "major",
    label: "전공 (해당 시)",
    type: "text",
    placeholder: "예: 컴퓨터공학, 경영학, 아직 미정...",
  },
  {
    id: "mbti",
    label: "MBTI",
    type: "chips",
    options: [
      "ISTJ", "ISFJ", "INFJ", "INTJ",
      "ISTP", "ISFP", "INFP", "INTP",
      "ESTP", "ESFP", "ENFP", "ENTP",
      "ESTJ", "ESFJ", "ENFJ", "ENTJ",
      "모르겠어요",
    ],
  },
  {
    id: "interests",
    label: "관심 분야 (최대 3개)",
    type: "multi",
    maxSelect: 3,
    options: [
      "예술/디자인", "과학/기술", "의료/건강", "교육", "경영/경제",
      "법률/사회", "IT/프로그래밍", "미디어/콘텐츠", "환경/자연",
      "스포츠/체육", "음악/공연", "요리/식품", "건축/인테리어",
      "심리/상담", "국제관계/외교", "패션/뷰티", "게임/엔터테인먼트",
      "농업/바이오", "항공/우주", "해양/수산",
    ],
  },
  {
    id: "hobbies",
    label: "취미",
    type: "text",
    placeholder: "예: 독서, 그림 그리기, 프로그래밍, 운동...",
  },
  {
    id: "aptitude",
    label: "잘하는 것 / 적성",
    type: "text",
    placeholder: "예: 글쓰기, 수학 문제 풀기, 사람들과 대화하기...",
  },
  {
    id: "reading",
    label: "주로 읽는 책 분야",
    type: "text",
    placeholder: "예: 과학 교양서, 소설, 자기계발, 역사...",
  },
  {
    id: "grades",
    label: "성적 분포 (강한 과목)",
    type: "text",
    placeholder: "예: 수학·과학 상위, 국어·영어 중상위",
  },
  {
    id: "sports",
    label: "운동 능력",
    type: "chips",
    options: ["상 (교내 대표급)", "중상 (꾸준히 운동)", "중 (보통)", "중하 (가끔 운동)", "하 (운동 잘 안 함)"],
  },
  {
    id: "music",
    label: "음악적 재능",
    type: "chips",
    options: ["상 (악기/보컬 전문)", "중상 (취미로 연주/작곡)", "중 (음악 감상 즐김)", "하 (특별한 관심 없음)"],
  },
  {
    id: "art",
    label: "미술적 재능",
    type: "chips",
    options: ["상 (미술/디자인 전문)", "중상 (취미로 그림/공예)", "중 (감상 즐김)", "하 (특별한 관심 없음)"],
  },
];
