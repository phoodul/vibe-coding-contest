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
    unitTitle: "음운 체계와 변동",
    standards: [
      "국어의 음운 체계를 이해하고 음운의 변동을 탐구한다",
      "음운 변동(교체, 탈락, 첨가, 축약)의 원리를 분석한다",
      "음운 변동이 표기와 발음에 미치는 영향을 설명한다",
    ],
  },
  {
    subject: "korean",
    unitTitle: "단어의 형성과 의미",
    standards: [
      "형태소의 개념을 이해하고 단어의 형성 방법을 탐구한다",
      "파생어와 합성어의 구조를 분석한다",
      "단어의 의미 관계(유의, 반의, 상하위)를 파악한다",
    ],
  },
  {
    subject: "korean",
    unitTitle: "매체 언어의 특성",
    standards: [
      "매체의 유형에 따른 언어 표현의 특성을 이해한다",
      "인터넷, SNS 등 디지털 매체 언어의 특성을 분석한다",
      "매체 자료의 신뢰성을 비판적으로 평가한다",
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
    unitTitle: "세포와 세포 분열",
    standards: [
      "세포의 구조(세포막, 핵, 미토콘드리아, 리보솜 등)와 기능을 설명한다",
      "체세포 분열의 과정(전기, 중기, 후기, 말기)을 설명한다",
      "감수 분열의 과정과 유전적 다양성과의 관계를 이해한다",
    ],
  },
  {
    subject: "biology",
    unitTitle: "유전",
    standards: [
      "멘델의 유전 법칙(분리의 법칙, 독립의 법칙)을 설명한다",
      "사람의 유전(ABO식 혈액형, 적록색맹 등)을 탐구한다",
      "유전자와 염색체의 관계를 이해하고 가계도를 분석한다",
    ],
  },
  {
    subject: "biology",
    unitTitle: "생태계와 상호 작용",
    standards: [
      "생태계의 구성 요소(생산자, 소비자, 분해자)와 상호 관계를 설명한다",
      "에너지 흐름과 물질 순환의 원리를 이해한다",
      "생태계의 평형과 생물 다양성의 중요성을 설명한다",
    ],
  },
];

export function getUnitsBySubject(subjectKey: string): CurriculumUnit[] {
  return CURRICULUM.filter((unit) => unit.subject === subjectKey);
}
