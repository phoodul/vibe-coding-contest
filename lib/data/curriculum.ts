export interface CurriculumUnit {
  subject: string;
  unitTitle: string;
  standards: string[];
}

export const SUBJECTS = [
  { key: "korean", label: "언어와 매체", icon: "📝" },
  { key: "ethics", label: "생활과 윤리", icon: "⚖️" },
  { key: "biology", label: "생명과학Ⅰ", icon: "🧬" },
] as const;

export const CURRICULUM: CurriculumUnit[] = [
  // 국어 — 언어와 매체
  {
    subject: "korean",
    unitTitle: "음운과 음운의 변동",
    standards: [
      "국어의 음운 체계(자음 19개, 모음 21개)를 이해한다",
      "음운 변동(교체, 탈락, 첨가, 축약)의 원리를 분석한다",
      "음운 변동이 표기와 발음에 미치는 영향을 설명한다",
    ],
  },
  {
    subject: "korean",
    unitTitle: "단어와 문장",
    standards: [
      "형태소의 개념을 이해하고 파생어·합성어의 구조를 분석한다",
      "9품사의 특성과 분류 기준을 이해한다",
      "문장 성분과 문장의 구조(안은문장, 이어진문장)를 파악한다",
    ],
  },
  {
    subject: "korean",
    unitTitle: "의미와 담화",
    standards: [
      "단어의 의미 관계(유의, 반의, 상하위, 다의, 동음이의)를 파악한다",
      "의미 변화의 유형(확대, 축소, 이동)을 이해한다",
      "담화의 구성 요소와 직접·간접 화행을 분석한다",
    ],
  },
  {
    subject: "korean",
    unitTitle: "국어의 역사와 규범",
    standards: [
      "훈민정음의 창제 원리와 중세 국어의 특징을 이해한다",
      "한글 맞춤법과 표준어 규정의 주요 원칙을 학습한다",
      "외래어 표기법과 로마자 표기법을 활용한다",
    ],
  },
  {
    subject: "korean",
    unitTitle: "매체 언어의 탐구",
    standards: [
      "매체의 유형에 따른 언어 표현의 특성을 이해한다",
      "복합 양식성과 하이퍼텍스트의 개념을 탐구한다",
      "매체 자료의 신뢰성을 비판적으로 평가하고 미디어 리터러시를 함양한다",
    ],
  },

  // 사회 — 생활과 윤리
  {
    subject: "ethics",
    unitTitle: "생명 윤리",
    standards: [
      "생명의 존엄성에 대한 다양한 윤리적 관점을 비교한다",
      "낙태, 안락사 문제에 대한 윤리적 쟁점을 분석한다",
      "생명 과학 기술(유전자 편집, 동물 실험)의 윤리적 문제를 탐구한다",
    ],
  },
  {
    subject: "ethics",
    unitTitle: "사회 윤리",
    standards: [
      "분배 정의에 대한 다양한 관점(롤스, 노직, 왈처)을 비교한다",
      "교정적 정의와 사형 제도의 윤리적 쟁점을 분석한다",
      "사회적 약자에 대한 우대 정책의 정당성을 평가한다",
    ],
  },
  {
    subject: "ethics",
    unitTitle: "과학 기술과 윤리",
    standards: [
      "과학 기술의 가치 중립성 논쟁을 이해한다",
      "인공지능과 자율주행 등 첨단 기술의 윤리적 쟁점을 탐구한다",
      "정보 사회에서 개인 정보 보호와 표현의 자유 간 갈등을 분석한다",
    ],
  },

  // 과학 — 생명과학Ⅰ
  {
    subject: "biology",
    unitTitle: "생명 과학의 이해",
    standards: [
      "생물의 특성(세포, 물질대사, 자극과 반응, 항상성, 생식, 적응과 진화)을 설명한다",
      "생명 과학의 탐구 방법(귀납적·연역적 탐구, 대조 실험)을 이해한다",
      "생명 과학의 활용(의학, 농업, 생명공학)과 윤리적 문제를 탐구한다",
    ],
  },
  {
    subject: "biology",
    unitTitle: "세포의 구조와 기능",
    standards: [
      "세포의 구조(세포막, 핵, 미토콘드리아, 리보솜 등)와 기능을 설명한다",
      "세포막을 통한 물질 이동(확산, 삼투, 능동수송)을 이해한다",
      "효소의 구조와 기능, 세포 호흡과 광합성의 원리를 학습한다",
    ],
  },
  {
    subject: "biology",
    unitTitle: "세포 분열과 유전",
    standards: [
      "체세포 분열과 감수 분열의 과정과 의의를 비교한다",
      "멘델의 유전 법칙(분리의 법칙, 독립의 법칙)을 설명한다",
      "사람의 유전(ABO식 혈액형, 색맹)과 가계도를 분석한다",
    ],
  },
  {
    subject: "biology",
    unitTitle: "항상성과 몸의 조절",
    standards: [
      "뉴런의 구조와 흥분의 전도·전달 과정을 설명한다",
      "내분비계와 호르몬에 의한 혈당량·체온 조절을 이해한다",
      "면역 작용(선천 면역, 적응 면역)과 질병과의 관계를 탐구한다",
    ],
  },
  {
    subject: "biology",
    unitTitle: "생태계와 상호 작용",
    standards: [
      "생태계의 구성 요소(생산자, 소비자, 분해자)와 상호 관계를 설명한다",
      "에너지 흐름과 물질 순환(탄소, 질소)의 원리를 이해한다",
      "생물 다양성의 중요성과 보전 방안을 탐구한다",
    ],
  },
];

export function getUnitsBySubject(subjectKey: string): CurriculumUnit[] {
  return CURRICULUM.filter((unit) => unit.subject === subjectKey);
}
