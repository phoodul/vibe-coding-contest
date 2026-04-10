import type { StructuredSection } from "./ethics-structured-index";

/**
 * 제5장: 문화와 윤리 — 구조화 텍스트 (암기 친화)
 * 원본: ethics-ch5.ts의 서술형 detail → 계층 트리 + 명사형 종결
 */
export const ETHICS_STRUCTURED_CH5: StructuredSection[] = [
  {
    id: "ch5_s1",
    title: "예술과 대중문화 윤리",
    summary:
      "예술과 도덕의 관계, 대중문화의 윤리적 쟁점, 예술의 자유와 책임",
    notes: [
      {
        id: "ch5_s1_c1",
        label: "예술과 도덕의 관계",
        keyword: "예술도덕",
        nodes: [
          {
            text: "도덕주의(Moralism)",
            children: [
              { text: "예술은 도덕적 교훈을 전달해야 하며, 예술의 가치는 도덕적 가치에 종속" },
              {
                text: "플라톤(Platon)",
                children: [
                  { text: "예술은 감정을 자극하여 이성을 흐리게 함" },
                  { text: "도덕적으로 해로운 예술은 국가에서 추방해야 함 ('국가론')" },
                ],
              },
              {
                text: "톨스토이(Tolstoy)",
                children: [
                  { text: "좋은 예술 = 인간 간의 도덕적 감정을 전달하는 것" },
                ],
              },
            ],
          },
          {
            text: "예술지상주의(Aestheticism, Art for Art's sake)",
            children: [
              { text: "예술의 목적 = 미(美)의 추구, 도덕적 기준으로 평가 불가" },
              {
                text: "와일드(Oscar Wilde)",
                children: [
                  { text: "'도덕적인 책이나 비도덕적인 책은 없다. 잘 쓴 책과 못 쓴 책만 있을 뿐'" },
                ],
              },
              { text: "예술의 자율성과 창작의 자유를 최우선으로 강조" },
            ],
          },
          {
            text: "양 입장의 조화",
            children: [
              { text: "예술의 자유는 보장되어야 함" },
              { text: "타인의 인격 훼손이나 사회적 해악을 끼치는 표현에는 책임이 따름" },
            ],
          },
        ],
      },
      {
        id: "ch5_s1_c2",
        label: "대중문화의 윤리적 쟁점",
        keyword: "대중문화",
        nodes: [
          {
            text: "대중문화(Popular Culture): 대량 생산·대량 소비되는 문화 산물",
          },
          {
            text: "순기능",
            children: [
              { text: "대중의 문화적 향유 기회 확대" },
              { text: "스트레스 해소" },
              { text: "사회적 소통의 매개" },
            ],
          },
          {
            text: "역기능",
            children: [
              {
                text: "상업성에 의한 문화의 질적 하락",
                children: [
                  { text: "아도르노의 '문화 산업' 비판 — 문화가 상품으로 전락, 대중을 수동적 소비자로 만듦" },
                ],
              },
              { text: "선정적·폭력적 콘텐츠의 무분별한 유통" },
              { text: "연예인의 사생활 침해와 과도한 팬덤 문화" },
              {
                text: "미디어 리터러시(Media Literacy)의 필요성",
                children: [
                  { text: "비판적으로 미디어를 해석하고 평가하는 능력 함양 필요" },
                ],
              },
              { text: "저작권 침해와 불법 다운로드 문제" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "ch5_s2",
    title: "의식주 윤리와 윤리적 소비",
    summary:
      "의식주 생활에서의 윤리적 쟁점과 윤리적 소비, 공정 무역의 의미",
    notes: [
      {
        id: "ch5_s2_c1",
        label: "의식주와 윤리",
        keyword: "의식주",
        nodes: [
          {
            text: "음식 윤리",
            children: [
              {
                text: "채식주의(Vegetarianism/Veganism)의 윤리적 근거",
                children: [
                  { text: "동물의 고통 최소화(싱어)" },
                  { text: "환경 보호(축산업의 온실가스 배출)" },
                  { text: "건강" },
                ],
              },
              {
                text: "유전자 변형 식품(GMO)",
                children: [
                  { text: "안전성 논란" },
                  { text: "소비자 알 권리(표시제)" },
                ],
              },
              { text: "먹방 문화와 음식 낭비의 윤리적 문제" },
            ],
          },
          {
            text: "주거 윤리",
            children: [
              { text: "주거는 기본적 인권" },
              { text: "주거권의 보장" },
              { text: "젠트리피케이션(Gentrification)으로 인한 원주민 이주 문제" },
              { text: "공정한 주거 분배" },
            ],
          },
          {
            text: "패션 윤리",
            children: [
              {
                text: "패스트 패션(Fast Fashion)의 문제",
                children: [
                  { text: "개발도상국 노동자 착취(저임금, 장시간 노동)" },
                  { text: "환경오염(의류 폐기물)" },
                  { text: "과소비 문화" },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "ch5_s2_c2",
        label: "윤리적 소비와 공정 무역",
        keyword: "공정무역",
        nodes: [
          {
            text: "윤리적 소비(Ethical Consumption): 생산·유통·소비·폐기 과정에서 윤리적 가치(인권, 환경, 공정성)를 고려하여 소비하는 것",
          },
          {
            text: "윤리적 소비 유형",
            children: [
              { text: "불매운동(Boycott): 비윤리적 기업의 상품 구매 거부" },
              { text: "바이콧(Buycott): 윤리적 기업의 상품을 적극 구매" },
              { text: "로컬 소비: 지역 생산자의 상품 구매 → 지역 경제 활성화" },
            ],
          },
          {
            text: "공정 무역(Fair Trade)",
            children: [
              { text: "개발도상국 생산자에게 공정한 가격 지불" },
              { text: "노동 환경과 환경 보호 기준 준수하는 무역 방식" },
              { text: "공정 무역 인증 마크(FLO 인증) 부착 제품(커피, 초콜릿, 면화 등)이 대표적" },
            ],
          },
          {
            text: "한계",
            children: [
              { text: "공정 무역 제품의 높은 가격" },
              { text: "인증 비용의 소규모 생산자 부담" },
              { text: "시장 점유율의 한계" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "ch5_s3",
    title: "다문화 사회의 윤리",
    summary:
      "문화 다양성, 관용, 보편 윤리와 상대주의의 관계, 다문화 사회에서의 공존 원리",
    notes: [
      {
        id: "ch5_s3_c1",
        label: "문화 상대주의와 보편 윤리",
        keyword: "상대주의",
        nodes: [
          {
            text: "문화 상대주의(Cultural Relativism)",
            children: [
              { text: "도덕적 가치와 규범은 문화에 따라 상이" },
              { text: "어떤 문화의 도덕이 다른 문화보다 우월하다고 판단 불가" },
              { text: "각 문화의 도덕적 관행은 그 문화의 맥락 안에서 이해해야 함" },
            ],
          },
          {
            text: "의의",
            children: [
              { text: "문화적 다양성 존중" },
              { text: "서구 중심주의 비판" },
              { text: "제국주의적 문화 침략에 대한 저항" },
            ],
          },
          {
            text: "한계",
            children: [
              { text: "극단적 문화 상대주의는 명예 살인, 여성 할례 등 보편적 인권 침해 정당화 가능" },
              { text: "문화 간 도덕적 비판이 불가능 → 도덕적 진보의 가능성 부정" },
              { text: "같은 문화 내부의 도덕적 갈등 설명 불가" },
            ],
          },
          {
            text: "보편 윤리",
            children: [
              { text: "문화와 시대를 초월하여 모든 인간에게 적용되는 도덕 원리 존재 입장" },
              { text: "세계인권선언, 칸트의 정언 명령 등" },
            ],
          },
          {
            text: "균형점: 문화적 다양성 존중 + 인간의 존엄성과 기본권은 보편적 보장 필요",
          },
        ],
      },
      {
        id: "ch5_s3_c2",
        label: "관용의 윤리와 한계",
        keyword: "관용",
        nodes: [
          {
            text: "관용(Tolerance): 자신과 다른 신념, 가치관, 생활 방식을 수용하고 존중하는 태도",
          },
          {
            text: "볼테르(Voltaire)",
            children: [
              { text: "'나는 당신의 말에 동의하지 않지만, 당신이 그것을 말할 권리는 목숨 걸고 지키겠다'" },
            ],
          },
          {
            text: "관용의 근거",
            children: [
              { text: "인간 이성의 한계(오류 가능성) 인정" },
              { text: "다양성이 사회 발전에 기여(밀의 자유론)" },
              { text: "평화로운 공존의 전제 조건" },
            ],
          },
          {
            text: "관용의 한계 — 관용의 역설(Paradox of Tolerance)",
            children: [
              { text: "칼 포퍼(Karl Popper): '불관용에 대한 관용은 관용 자체를 파괴'" },
              { text: "타인의 권리와 존엄성을 침해하는 행위(혐오, 폭력, 차별)에 대해서는 불관용적이어야 함" },
              { text: "무제한의 관용은 오히려 불관용의 승리를 초래" },
            ],
          },
        ],
      },
      {
        id: "ch5_s3_c2b",
        label: "종교 간 관용의 문제",
        keyword: "종교관용",
        nodes: [
          {
            text: "종교적 관용: 다문화 사회에서 가장 민감한 윤리적 쟁점 중 하나",
          },
          {
            text: "로크(John Locke)",
            children: [
              { text: "'관용에 관한 서신(1689)': 국가는 종교 문제에 개입해서는 안 됨" },
              { text: "양심의 자유 보장 주장" },
              { text: "한계: 무신론자와 가톨릭교도에 대해서는 관용 거부" },
            ],
          },
          {
            text: "현대적 쟁점",
            children: [
              {
                text: "프랑스의 라이시테(Laicite, 세속주의)",
                children: [
                  { text: "공공 공간에서 종교적 상징(히잡, 십자가 등) 금지" },
                  { text: "쟁점: 종교의 자유 침해인가, 세속 공화국의 원칙인가" },
                ],
              },
              {
                text: "신성 모독과 표현의 자유",
                children: [
                  { text: "샤를리 에브도(Charlie Hebdo) 사건(2015)" },
                  { text: "종교 풍자의 자유와 종교적 감정 보호 사이의 갈등" },
                ],
              },
              {
                text: "종교적 신념에 의한 차별",
                children: [
                  { text: "종교적 신념을 이유로 특정 서비스 거부(예: 동성 커플 웨딩 케이크)" },
                  { text: "쟁점: 종교의 자유인가 차별인가" },
                ],
              },
            ],
          },
          {
            text: "핵심: 관용은 상대방의 존엄성을 해치지 않는 범위 내에서 보장",
          },
        ],
      },
      {
        id: "ch5_s3_c3",
        label: "다문화 사회의 공존 모델",
        keyword: "공존모델",
        nodes: [
          {
            text: "동화주의(Assimilationism)",
            children: [
              { text: "이주민이 주류 문화에 완전히 동화되어야 함" },
              { text: "문화적 정체성 포기 → 인권 침해 소지" },
            ],
          },
          {
            text: "샐러드볼(Salad Bowl) / 문화 다원주의(Multiculturalism)",
            children: [
              { text: "다양한 문화가 각자의 정체성을 유지하면서 공존" },
              { text: "캐나다, 호주의 공식 정책" },
              {
                text: "비판",
                children: [
                  { text: "공동체 간 소통과 통합 부족 가능성" },
                  { text: "문화 간 갈등의 조정 기준 불명확" },
                ],
              },
            ],
          },
          {
            text: "상호 문화주의(Interculturalism)",
            children: [
              { text: "문화 간 적극적 대화와 상호 이해를 통해 새로운 공유 가치 창출" },
              { text: "단순한 공존을 넘어 상호 변화와 통합 지향" },
            ],
          },
          {
            text: "한국의 과제",
            children: [
              { text: "단일 민족 신화 극복" },
              { text: "결혼 이민자, 외국인 노동자, 북한 이탈 주민 등과의 진정한 공존 모델 모색 필요" },
            ],
          },
        ],
      },
    ],
  },
];
