import type { StructuredSection } from "./ethics-structured-index";

/**
 * 제1장: 생명 과학의 이해 — 구조화 텍스트 (암기 친화)
 * 원본: biology-ch1.ts의 서술형 detail → 계층 트리 + 명사형 종결
 */
export const BIOLOGY_STRUCTURED_CH1: StructuredSection[] = [
  {
    id: "bio_ch1_s1",
    title: "생물의 특성",
    summary:
      "생물이 비생물과 구별되는 특성으로 세포, 물질대사, 자극과 반응, 항상성, 생식과 유전, 적응과 진화, 발생과 생장을 이해하고, 바이러스의 특수한 위치와 생물의 구성 체제를 파악한다.",
    notes: [
      {
        id: "bio_ch1_s1_c1",
        label: "세포 — 생물의 구조적·기능적 단위",
        nodes: [
          {
            text: "세포(Cell): 생물의 구조적·기능적 기본 단위",
            children: [
              { text: "세포막(Cell Membrane)으로 외부 환경과 구분" },
              { text: "내부에서 생명 활동에 필요한 화학 반응 수행" },
            ],
          },
          {
            text: "세포의 종류 — 핵막 유무에 따른 구분",
            children: [
              {
                text: "원핵세포(Prokaryotic Cell)",
                children: [
                  { text: "핵막 부재 — 유전 물질이 세포질에 노출" },
                  { text: "예: 세균(대장균 등)" },
                ],
              },
              {
                text: "진핵세포(Eukaryotic Cell)",
                children: [
                  { text: "핵막으로 둘러싸인 뚜렷한 핵 보유" },
                  {
                    text: "미토콘드리아, 소포체, 골지체 등 막성 세포 소기관 존재 — 세포 내 구획화",
                  },
                ],
              },
            ],
          },
          {
            text: "세포 수에 따른 구분",
            children: [
              {
                text: "단세포 생물: 하나의 세포로 모든 생명 활동 수행 (아메바, 짚신벌레, 대장균, 효모)",
              },
              {
                text: "다세포 생물: 세포 분화로 특수 기능 담당 (사람, 식물, 버섯)",
              },
            ],
          },
          {
            text: "세포의 크기와 표면적 대 부피 비",
            children: [
              { text: "대부분 1~100μm 범위" },
              {
                text: "세포가 작을수록 표면적 대 부피 비가 커서 물질 교환 효율 증가",
              },
              {
                text: "부피는 세제곱, 표면적은 제곱으로 증가 — 커지면 물질 교환 효율 저하",
              },
              { text: "세포 분열로 세포 수를 늘리는 방식으로 성장" },
            ],
          },
          {
            text: "세포설(Cell Theory)",
            children: [
              { text: "(1) 모든 생물은 하나 이상의 세포로 구성" },
              { text: "(2) 세포는 생명의 기본 단위" },
              { text: "(3) 새로운 세포는 기존 세포의 분열로 생성" },
              {
                text: "슐라이덴(식물) + 슈반(동물) 제안, 피르호(Rudolf Virchow)가 (3) 추가",
              },
            ],
          },
        ],
      },
      {
        id: "bio_ch1_s1_c2",
        label: "생물의 구성 체제",
        nodes: [
          {
            text: "다세포 생물의 위계적 구성 체제",
            children: [
              {
                text: "세포 → 조직(Tissue) → 기관(Organ) → 기관계(Organ System) → 개체(Organism)",
              },
            ],
          },
          {
            text: "동물의 4가지 기본 조직",
            children: [
              { text: "상피 조직" },
              { text: "결합 조직" },
              { text: "근육 조직" },
              { text: "신경 조직" },
            ],
          },
          {
            text: "기관: 여러 조직이 모여 특정 기능 수행",
            children: [
              { text: "위(소화), 심장(혈액 순환), 폐(호흡)" },
            ],
          },
          {
            text: "동물의 기관계",
            children: [
              {
                text: "소화계, 순환계, 호흡계, 배설계, 신경계, 내분비계, 면역계, 생식계, 근골격계",
              },
            ],
          },
          {
            text: "식물의 구성 체제 — 기관계 대신 조직계(Tissue System) 사용",
            children: [
              { text: "표피 조직계(보호)" },
              { text: "관다발 조직계(물질 수송)" },
              { text: "기본 조직계(광합성·저장)" },
              {
                text: "식물의 기관: 영양 기관(뿌리, 줄기, 잎) + 생식 기관(꽃, 열매, 종자)",
              },
            ],
          },
          {
            text: "동물 vs 식물 구성 체제의 핵심 차이: 동물은 '기관계', 식물은 '조직계'",
          },
          {
            text: "분자 수준까지 확장한 전체 단계",
            children: [
              {
                text: "원자 → 분자 → 세포 소기관 → 세포 → 조직 → 기관 → 기관계 → 개체 → 개체군 → 군집 → 생태계 → 생물권",
              },
            ],
          },
        ],
      },
      {
        id: "bio_ch1_s1_c3",
        label: "물질대사(Metabolism)",
        nodes: [
          {
            text: "물질대사: 생체 내 모든 화학 반응의 총칭",
          },
          {
            text: "동화 작용(Anabolism)",
            children: [
              { text: "저분자 → 고분자 합성" },
              { text: "에너지 흡수(저장) — 흡열 반응" },
              {
                text: "예: 광합성(6CO2 + 6H2O → C6H12O6 + 6O2), 단백질 합성, 지방 합성",
              },
            ],
          },
          {
            text: "이화 작용(Catabolism)",
            children: [
              { text: "고분자 → 저분자 분해" },
              { text: "에너지 방출 — 발열 반응" },
              {
                text: "예: 세포 호흡(C6H12O6 + 6O2 → 6CO2 + 6H2O + ATP), 소화(녹말 → 포도당)",
              },
            ],
          },
          {
            text: "효소(Enzyme)의 역할",
            children: [
              { text: "생체 촉매로서 활성화 에너지(Activation Energy) 낮춤" },
              { text: "기질 특이성(Substrate Specificity) — 특정 기질에만 작용" },
              { text: "온도와 pH에 따라 활성 변화" },
            ],
          },
          {
            text: "핵심 비교: 동화 = 에너지 흡수(합성), 이화 = 에너지 방출(분해), 모두 효소에 의해 조절",
          },
        ],
      },
      {
        id: "bio_ch1_s1_c4",
        label: "물질대사와 에너지 전환 — ATP",
        nodes: [
          {
            text: "ATP(Adenosine Triphosphate): 생체 내 에너지 전환의 핵심 물질",
            children: [
              { text: "구성: 아데닌(Adenine) + 리보스(Ribose) + 인산기 3개" },
              {
                text: "고에너지 인산 결합 가수분해 시 약 7.3kcal/mol 에너지 방출 → ADP + Pi",
              },
            ],
          },
          {
            text: "ATP 에너지의 사용처",
            children: [
              { text: "근육 수축, 능동 수송, 생체 물질 합성, 체온 유지, 생물 발광" },
            ],
          },
          {
            text: "ATP 생산 경로",
            children: [
              { text: "광합성 명반응: 빛 에너지 → ATP" },
              { text: "세포 호흡 산화적 인산화: 포도당 화학 에너지 → ATP" },
              {
                text: "발효(Fermentation): 무산소 조건에서 유기물 불완전 분해로 소량 ATP 생산",
                children: [
                  { text: "알코올 발효(효모): 포도당 → 에탄올 + CO2 + 2ATP" },
                  { text: "젖산 발효(근육 세포): 포도당 → 젖산 + 2ATP" },
                ],
              },
              {
                text: "화학 합성(Chemosynthesis): 무기물 산화 에너지로 유기물 합성",
                children: [
                  { text: "질화 세균(암모니아 → 아질산 → 질산), 황 세균" },
                ],
              },
            ],
          },
          {
            text: "핵심: ATP-ADP 순환을 통한 에너지 전달, 광합성·세포 호흡·발효·화학 합성의 에너지 전환 방식 비교",
          },
        ],
      },
      {
        id: "bio_ch1_s1_c5",
        label: "자극과 반응",
        nodes: [
          {
            text: "자극과 반응: 외부 환경 변화(자극, Stimulus)를 감지하고 적절한 반응(Response)을 나타내는 특성",
          },
          {
            text: "동물의 자극-반응 경로",
            children: [
              {
                text: "수용기(감각 기관) → 구심성 신경 → 중추 신경계(뇌·척수) → 원심성 신경 → 효과기(근육·분비샘)",
              },
              {
                text: "감각 기관: 눈(시각), 귀(청각·평형 감각), 코(후각), 혀(미각), 피부(촉각·온도·압각·통각)",
              },
              { text: "각 감각 기관의 적합 자극(Adequate Stimulus) 존재" },
            ],
          },
          {
            text: "식물의 자극 반응 — 신경계 없이 호르몬·팽압 변화로 반응",
            children: [
              {
                text: "굴광성(Phototropism): 빛 방향으로 줄기 생장 — 옥신(Auxin) 불균등 분포",
              },
              { text: "굴지성(Gravitropism): 중력 방향으로 뿌리 생장" },
              { text: "굴수성(Hydrotropism): 물 방향으로 뿌리 생장" },
              {
                text: "굴촉성(Thigmotropism): 접촉 자극에 반응 (덩굴손 감기)",
              },
              {
                text: "미모사: 접촉 시 잎 접힘 — 팽압 변화에 의한 생장 운동",
              },
            ],
          },
          {
            text: "굴성(Tropism) vs 생장 운동(Nastic Movement)",
            children: [
              { text: "굴성: 자극 방향에 따라 반응 (방향성 있음)" },
              { text: "생장 운동: 자극 방향과 무관한 반응 (방향성 없음)" },
            ],
          },
        ],
      },
      {
        id: "bio_ch1_s1_c6",
        label: "항상성(Homeostasis)",
        nodes: [
          {
            text: "항상성: 외부 환경 변화에도 체내 환경(내부 환경)을 일정하게 유지하려는 성질",
          },
          {
            text: "사람의 항상성 유지 수치",
            children: [
              { text: "체온: 약 36.5도C" },
              { text: "혈당량: 약 0.1%(100mg/dL)" },
              { text: "혈액 pH: 약 7.4" },
              { text: "체내 삼투압: 약 0.9% NaCl 용액과 동일" },
            ],
          },
          {
            text: "핵심 메커니즘: 음성 피드백(Negative Feedback) — 변화를 되돌리는 방향으로 반응",
          },
          {
            text: "체온 조절 (조절 중추: 간뇌 시상 하부)",
            children: [
              {
                text: "체온 상승 시: 피부 혈관 확장, 땀 분비 증가, 근육 이완 → 열 방출 촉진",
              },
              {
                text: "체온 하강 시: 피부 혈관 수축, 땀 분비 감소, 골격근 떨림, 갑상샘 호르몬 분비 증가 → 체온 상승",
              },
            ],
          },
          {
            text: "혈당량 조절",
            children: [
              {
                text: "혈당 상승 시: 이자(췌장) 베타 세포 → 인슐린(Insulin) 분비",
                children: [
                  { text: "간에서 포도당 → 글리코겐 합성·저장" },
                  { text: "세포의 포도당 흡수 촉진 → 혈당 하강" },
                ],
              },
              {
                text: "혈당 하강 시: 이자 알파 세포 → 글루카곤(Glucagon) 분비",
                children: [
                  { text: "간의 글리코겐 → 포도당 분해 → 혈당 상승" },
                ],
              },
              { text: "인슐린과 글루카곤의 길항 작용(Antagonism)" },
            ],
          },
          {
            text: "당뇨병: 인슐린 분비 부족(제1형) 또는 인슐린 저항성 증가(제2형)로 혈당 항상성 파괴",
          },
        ],
      },
      {
        id: "bio_ch1_s1_c7",
        label: "생식과 유전",
        nodes: [
          {
            text: "생식(Reproduction): 자신과 닮은 자손을 만들어 종(Species)을 유지하는 현상",
          },
          {
            text: "무성 생식(Asexual Reproduction)",
            children: [
              { text: "하나의 개체가 단독으로 자손 생산 — 유전적으로 동일한 개체(클론)" },
              { text: "유전적 다양성 낮음" },
              {
                text: "유형: 이분법(세균, 아메바), 출아법(효모, 히드라), 포자 생식(곰팡이, 고사리), 영양 생식(감자 덩이줄기, 딸기 기는줄기), 재생(플라나리아)",
              },
            ],
          },
          {
            text: "유성 생식(Sexual Reproduction)",
            children: [
              {
                text: "암수 생식세포(정자·난자, Gamete) 수정(Fertilization)으로 자손 생산",
              },
              {
                text: "감수 분열(Meiosis)과 수정 과정에서 유전자 재조합 → 유전적 다양성 증가",
              },
            ],
          },
          {
            text: "유전(Heredity): 부모 형질(Trait)이 유전자(Gene)를 통해 자손에게 전달",
          },
          {
            text: "DNA(Deoxyribonucleic Acid)의 구조",
            children: [
              { text: "이중 나선(Double Helix) 구조" },
              { text: "상보적 염기 쌍: A-T, G-C" },
              { text: "반보존적 복제로 유전 정보 정확히 전달" },
            ],
          },
          {
            text: "무성 vs 유성 생식 비교: 무성은 빠르고 효율적이나 환경 변화에 취약, 유성은 유전적 다양성 높아 환경 적응력 큼",
          },
        ],
      },
      {
        id: "bio_ch1_s1_c8",
        label: "적응과 진화",
        nodes: [
          {
            text: "적응(Adaptation): 생존·번식에 유리하도록 구조·기능·행동이 변화된 것 — 자연 선택(Natural Selection)에 의해 형성",
          },
          {
            text: "적응의 종류",
            children: [
              {
                text: "형태적 적응",
                children: [
                  { text: "선인장의 가시 잎(수분 증발 억제)" },
                  { text: "북극곰의 흰 털(보호색)" },
                  { text: "기린의 긴 목(높은 곳 먹이 획득)" },
                  { text: "독나방의 경고색(Warning Coloration)" },
                  { text: "대벌레의 의태(Mimicry)" },
                ],
              },
              {
                text: "생리적 적응",
                children: [
                  { text: "낙타의 체온 변동 허용(수분 손실 감소)" },
                  { text: "심해 어류의 높은 수압 내성" },
                ],
              },
              {
                text: "행동적 적응",
                children: [
                  { text: "철새의 이동" },
                  { text: "곰의 겨울잠" },
                  { text: "꿀벌의 8자 춤(먹이 위치 전달)" },
                ],
              },
            ],
          },
          {
            text: "진화(Evolution): 세대를 거치며 생물 집단의 유전자 구성(유전자 풀, Gene Pool)이 변화하는 현상",
          },
          {
            text: "다윈의 자연 선택설(Theory of Natural Selection)",
            children: [
              { text: "개체 간 변이(Variation) 존재" },
              {
                text: "환경에 적합한 형질의 개체가 생존·번식에 유리 (적자생존, Survival of the Fittest)",
              },
              { text: "유리한 형질이 다음 세대에 더 많이 전달" },
            ],
          },
          {
            text: "진화의 증거",
            children: [
              { text: "화석 기록" },
              {
                text: "상동 기관(Homologous Organ): 공통 조상 증거 (사람의 팔-고래 지느러미-박쥐 날개)",
              },
              { text: "상사 기관(Analogous Organ): 수렴 진화 증거" },
              {
                text: "흔적 기관(Vestigial Organ): 사람의 꼬리뼈·충수",
              },
              { text: "DNA 염기 서열의 유사성" },
            ],
          },
          {
            text: "적응은 진화의 '결과'이지 '원인'이 아님",
          },
        ],
      },
      {
        id: "bio_ch1_s1_c9",
        label: "발생과 생장",
        nodes: [
          {
            text: "발생(Development): 수정란(Zygote)이 세포 분열·분화를 거쳐 완전한 개체가 되는 과정",
          },
          {
            text: "동물의 발생 과정",
            children: [
              {
                text: "수정란 → 난할(Cleavage) → 상실배(Morula) → 포배(Blastula) → 낭배(Gastrula) → 기관 형성(Organogenesis) → 개체",
              },
              {
                text: "난할: 체세포 분열에 의한 세포 수 증가, 전체 크기 거의 불변",
              },
            ],
          },
          {
            text: "세 배엽(낭배기 형성)에서 유래하는 기관",
            children: [
              { text: "외배엽: 표피, 신경계, 감각 기관" },
              { text: "중배엽: 골격, 근육, 순환계, 배설계" },
              { text: "내배엽: 소화기관·호흡기관의 내벽" },
            ],
          },
          {
            text: "세포 분화(Cell Differentiation)",
            children: [
              {
                text: "동일한 유전 정보(Genome)를 가진 세포가 구조·기능이 다른 세포로 변화",
              },
              {
                text: "원인: 모든 유전자가 발현되는 것이 아닌 특정 유전자만 선택적 발현(Gene Expression)",
              },
              {
                text: "전분화능(Totipotency): 분화된 세포도 완전한 유전 정보를 가져 적절한 조건에서 완전한 개체로 발생 가능",
              },
            ],
          },
          {
            text: "생장(Growth): 세포 수 증가(세포 분열) + 크기 증가로 개체 크기 증가",
            children: [
              {
                text: "식물: 생장점(정단 분열 조직)에서 세포 분열·신장 → 길이 생장",
              },
              { text: "형성층 분열 → 줄기 부피 생장(비대 생장)" },
            ],
          },
          {
            text: "난할은 체세포 분열이므로 각 세포의 DNA 동일, 세포 크기는 분열마다 축소",
          },
        ],
      },
      {
        id: "bio_ch1_s1_c10",
        label: "효소(Enzyme)의 특성과 기능",
        nodes: [
          {
            text: "효소(Enzyme): 생체 내 화학 반응 속도를 촉진하는 생체 촉매(Biological Catalyst)",
            children: [
              { text: "본체: 대부분 단백질, 일부 RNA(리보자임, Ribozyme)" },
              {
                text: "활성화 에너지(Activation Energy)를 낮춤 — 반응 평형점은 변화시키지 않음",
              },
            ],
          },
          {
            text: "기질 특이성(Substrate Specificity)",
            children: [
              {
                text: "자물쇠-열쇠 모델(Lock and Key Model): 효소 활성 부위(Active Site)와 기질 구조가 정확히 일치",
              },
              {
                text: "유도 적합 모델(Induced Fit Model): 기질 결합 시 효소 구조가 약간 변형되어 더 잘 맞게 됨 (현대적 설명)",
              },
              {
                text: "효소-기질 복합체(Enzyme-Substrate Complex) 형성",
              },
            ],
          },
          {
            text: "효소 활성에 영향을 주는 요인",
            children: [
              {
                text: "최적 온도(Optimal Temperature)와 최적 pH에서 반응 속도 최대",
              },
              {
                text: "예: 체내 효소 대부분 약 37도C, 펩신(위) pH 2, 트립신(소장) pH 8",
              },
              {
                text: "최적 범위 초과 시 3차원 구조 변형(변성, Denaturation) → 활성 상실",
              },
            ],
          },
          {
            text: "기질 농도와 반응 속도",
            children: [
              { text: "기질 농도 증가 → 반응 속도 비례적 증가" },
              {
                text: "모든 효소가 기질과 결합(포화 상태) → 최대 반응 속도(Vmax) 도달 후 더 이상 증가 않음",
              },
            ],
          },
          {
            text: "효소의 주요 특징: 반응 전후 자신은 불변(재사용 가능), 소량으로 다량 기질 처리",
          },
          {
            text: "무기 촉매와의 차이: 기질 특이성 있음, 온도·pH에 민감, 생체 내 온화한 조건에서 작용",
          },
        ],
      },
      {
        id: "bio_ch1_s1_c11",
        label: "생물의 7가지 특성 종합 비교 및 사례 분석",
        nodes: [
          {
            text: "생물의 7가지 특성: 세포, 물질대사, 자극과 반응, 항상성, 생식과 유전, 적응과 진화, 발생과 생장",
          },
          {
            text: "7가지 특성의 유기적 연결",
            children: [
              { text: "세포에서 물질대사 → 에너지로 자극에 반응·항상성 유지" },
              {
                text: "생식으로 유전 정보 전달 → 자손에서 발생·생장 → 세대를 거쳐 적응·진화",
              },
            ],
          },
          {
            text: "대표 사례와 해당 특성",
            children: [
              { text: "효모의 출아법 번식 → 생식" },
              { text: "짚신벌레의 먹이 방향 이동 → 자극과 반응" },
              { text: "추울 때 몸 떨림 → 항상성" },
              { text: "수정란 → 태아 성장 → 발생과 생장" },
              { text: "항생제 내성 세균 출현 → 적응과 진화" },
              { text: "식물의 광합성 → 물질대사(동화 작용)" },
              { text: "아메바가 하나의 세포로 구성 → 세포" },
            ],
          },
          {
            text: "하나의 현상이 여러 특성에 동시 해당 가능 (예: 개구리 변태 = 발생과 생장 + 적응 결과)",
          },
          {
            text: "핵심 구분",
            children: [
              {
                text: "'자극과 반응' vs '항상성': 자극과 반응은 환경 자극에 대한 개별적 반응, 항상성은 체내 환경의 일정 유지 조절",
              },
              {
                text: "'적응과 진화' vs '발생과 생장': 적응과 진화는 세대 간 변화, 발생과 생장은 한 개체의 일생 변화",
              },
            ],
          },
        ],
      },
      {
        id: "bio_ch1_s1_c12",
        label: "바이러스의 특성 — 생물과 비생물의 경계",
        nodes: [
          {
            text: "바이러스(Virus): 생물과 비생물의 경계에 위치하는 특수한 존재",
          },
          {
            text: "바이러스의 구조",
            children: [
              { text: "단백질 껍질(Capsid) + 유전 물질(DNA 또는 RNA)" },
              { text: "세포 구조 부재" },
              { text: "일부(인플루엔자 등)는 외피(Envelope) 추가 보유" },
            ],
          },
          {
            text: "생물적 특성",
            children: [
              { text: "유전 물질(핵산) 보유 → 유전 정보 자손 전달 가능" },
              { text: "숙주 세포 내에서 증식(복제) 가능" },
              { text: "돌연변이 발생 → 진화 가능" },
            ],
          },
          {
            text: "비생물적 특성",
            children: [
              { text: "세포 구조 부재" },
              { text: "독립적 물질대사(효소 활성, 에너지 생산) 불가" },
              {
                text: "숙주 세포 밖에서 결정체(Crystal) 형태로 존재 — 생명 활동 없음",
              },
            ],
          },
          {
            text: "바이러스 증식 과정",
            children: [
              {
                text: "흡착(Adsorption) → 핵산 주입(Penetration) → 핵산 복제 및 단백질 합성(숙주 기구 이용) → 조립(Assembly) → 방출(Release)",
              },
            ],
          },
          {
            text: "대표적 바이러스: 박테리오파지(세균), 인플루엔자(독감), HIV(AIDS), 코로나바이러스(COVID-19), TMV(식물)",
          },
          {
            text: "생물 미분류 핵심 이유: (1) 세포 구조 부재, (2) 독립적 물질대사 불가",
          },
        ],
      },
    ],
  },
  {
    id: "bio_ch1_s2",
    title: "생명 과학의 탐구 방법",
    summary:
      "과학적 탐구의 기본 원리인 귀납적 탐구와 연역적 탐구 방법, 대조 실험의 설계 원리, 변인의 종류를 이해하고, 대표적 탐구 사례를 분석한다.",
    notes: [
      {
        id: "bio_ch1_s2_c1",
        label: "귀납적 탐구 방법",
        nodes: [
          {
            text: "귀납적 탐구 방법(Inductive Method): 개별 관찰·경험적 데이터에서 일반적 원리·법칙을 도출하는 방법",
          },
          {
            text: "탐구 절차",
            children: [
              {
                text: "관찰(Observation) → 문제 인식(Problem Recognition) → 자료 수집(Data Collection) → 자료 분석·해석 → 결론 도출(Conclusion) → 일반화(Generalization)",
              },
            ],
          },
          {
            text: "적용 사례",
            children: [
              {
                text: "여러 꽃 관찰 → '꿀샘이 있는 꽃에 곤충이 많이 모인다'는 결론 도출",
              },
              {
                text: "다양한 지역 생물 분포 조사 → '위도가 높아질수록 종 다양성 감소' 규칙 발견",
              },
            ],
          },
          {
            text: "주 사용 분야: 자연사 연구, 생태 조사, 분류학 연구 등 탐색적 연구",
          },
          {
            text: "장점: 새로운 현상 발견과 가설 생성에 유용",
          },
          {
            text: "한계: 관찰 사례가 아무리 많아도 예외 사례 발견 시 결론 뒤집힘 가능",
          },
          {
            text: "핵심 구분: 귀납적 탐구는 가설 없이 관찰에서 출발 → 결론 도출, 연역적 탐구는 가설 설정 후 실험으로 검증",
          },
        ],
      },
      {
        id: "bio_ch1_s2_c2",
        label: "연역적 탐구 방법(가설 연역법)",
        nodes: [
          {
            text: "연역적 탐구 방법(Hypothetico-Deductive Method): 관찰 → 문제 인식 → 가설 설정 → 실험 검증",
          },
          {
            text: "탐구 절차",
            children: [
              {
                text: "관찰 → 문제 인식 → 가설 설정(Hypothesis Formation) → 탐구 설계·수행 → 결과 분석 → 결론 도출",
              },
            ],
          },
          {
            text: "가설의 요건",
            children: [
              { text: "검증 가능(Testable)" },
              { text: "반증 가능(Falsifiable)" },
              { text: "관찰 사실에 기반한 잠정적 설명" },
            ],
          },
          {
            text: "가설 검증 결과에 따른 처리",
            children: [
              {
                text: "지지(Support) → 가설 채택 → 반복 검증으로 이론(Theory) 또는 법칙(Law)으로 발전 가능",
              },
              {
                text: "지지하지 않음 → 가설 수정(Modify) 또는 기각(Reject) → 새 가설 설정",
              },
            ],
          },
          {
            text: "인과 관계 규명에 적합, 대조 실험 포함이 일반적",
          },
          {
            text: "'가설' vs '이론' vs '법칙' 구분",
            children: [
              { text: "가설: 잠정적 설명" },
              { text: "이론: 반복 검증으로 널리 인정된 설명" },
              { text: "법칙: 자연 현상의 보편적 규칙성 기술" },
              {
                text: "이론이 법칙으로 '승격'되는 것이 아님 — 성격이 다름",
              },
            ],
          },
        ],
      },
      {
        id: "bio_ch1_s2_c3",
        label: "과학적 방법의 단계 — 전체 흐름",
        nodes: [
          {
            text: "과학적 방법(Scientific Method): 자연 현상을 체계적으로 탐구하기 위한 논리적 절차",
          },
          {
            text: "8단계 순환적 과정",
            children: [
              {
                text: "(1) 관찰(Observation): 정성적 관찰(색, 형태 등) + 정량적 관찰(수치, 측정값)",
              },
              {
                text: "(2) 문제 인식: '왜 ~할까?', '~에 영향을 미치는 요인은?'",
              },
              {
                text: "(3) 가설 설정: 검증 가능하고 구체적, 변인 간 관계 명시, 'If...then...' 형식",
              },
              {
                text: "(4) 탐구 설계: 독립변인·종속변인·통제변인 설정, 실험군·대조군 구성",
              },
              {
                text: "(5) 탐구 수행: 설계에 따라 실험, 객관성·재현성 위해 반복 실험",
              },
              {
                text: "(6) 결과 분석: 표·그래프 정리, 통계적 분석",
              },
              {
                text: "(7) 결론 도출: 가설 지지 여부 판단",
              },
              {
                text: "(8) 일반화·발표: 동료 평가(Peer Review) 수행",
              },
            ],
          },
          {
            text: "과학적 탐구의 핵심 요건: 객관성(Objectivity), 재현성(Reproducibility), 반증 가능성(Falsifiability)",
          },
          {
            text: "유사 과학(Pseudoscience): 이 요건을 충족하지 못하는 주장 (점술, 혈액형 성격론 등)",
          },
          {
            text: "과학적 지식은 절대적 진리가 아닌 현재 증거에 기반한 잠정적 결론 — 새 증거 발견 시 수정·대체 가능",
          },
        ],
      },
      {
        id: "bio_ch1_s2_c4",
        label: "대조 실험의 설계",
        nodes: [
          {
            text: "대조 실험(Controlled Experiment): 실험군·대조군을 설정하여 비교하는 방법",
          },
          {
            text: "실험군 vs 대조군",
            children: [
              {
                text: "실험군(Experimental Group): 독립변인을 변화시킨 집단",
              },
              {
                text: "대조군(Control Group): 독립변인을 변화시키지 않은 기준 집단",
              },
              {
                text: "대조군의 존재 이유: 결과가 독립변인에 의한 것인지 판별",
              },
            ],
          },
          {
            text: "실험 설계 예시 — 비료와 식물 생장",
            children: [
              { text: "실험군: 비료를 준 집단" },
              { text: "대조군: 비료를 주지 않은 집단" },
              {
                text: "통제변인: 물, 빛, 온도, 토양, 식물 종류 등 동일하게 유지",
              },
            ],
          },
          {
            text: "실험 신뢰도 향상 방법",
            children: [
              { text: "충분한 표본 수 확보" },
              { text: "반복 실험 수행" },
              {
                text: "이중 맹검법(Double-Blind Test): 실험자·피험자 모두 실험군·대조군 모르게 함",
              },
              {
                text: "위약 효과(Placebo Effect) 통제: 대조군에 외형 동일한 위약 처리",
              },
            ],
          },
          {
            text: "대조군은 '아무것도 하지 않는 집단'이 아닌 '독립변인만 변화시키지 않은 집단'",
          },
        ],
      },
      {
        id: "bio_ch1_s2_c5",
        label: "변인의 종류",
        nodes: [
          {
            text: "변인(Variable): 실험 결과에 영향을 줄 수 있는 모든 요인",
          },
          {
            text: "3가지 변인",
            children: [
              {
                text: "독립변인(Independent Variable, 조작 변인): 연구자가 의도적으로 변화시키는 변인 — 원인에 해당",
              },
              {
                text: "종속변인(Dependent Variable, 반응 변인): 독립변인 변화에 따른 결과 — 측정 대상",
              },
              {
                text: "통제변인(Controlled Variable): 실험 공정성을 위해 일정하게 유지해야 하는 변인",
              },
            ],
          },
          {
            text: "예시 — 빛의 세기와 광합성 속도 실험",
            children: [
              { text: "독립변인: 빛의 세기" },
              { text: "종속변인: 광합성 속도(산소 발생량으로 측정)" },
              { text: "통제변인: 온도, CO2 농도, 식물 종류, 물의 양, 빛의 파장" },
            ],
          },
          {
            text: "통제변인 미통제 시 종속변인 변화 원인 확인 불가 → 실험 타당성 저하",
          },
          {
            text: "변인 구분 암기법: 바꾸는 것 = 독립변인, 측정하는 것 = 종속변인, 같게 유지하는 것 = 통제변인",
          },
          {
            text: "독립변인은 실험군과 대조군에서 유일하게 다른 조건",
          },
        ],
      },
      {
        id: "bio_ch1_s2_c6",
        label: "탐구 사례 1 — 파스퇴르의 자연발생설 부정 실험",
        nodes: [
          {
            text: "루이 파스퇴르(Louis Pasteur, 1822~1895): 자연발생설(Spontaneous Generation) 부정",
          },
          {
            text: "연역적 탐구 과정",
            children: [
              { text: "관찰: 고기즙을 끓인 후 방치 → 미생물 번식" },
              {
                text: "문제 인식: 미생물은 무생물에서 저절로 생기는가, 외부에서 들어오는가?",
              },
              {
                text: "가설: '미생물은 외부 공기에서 들어오는 것이지, 저절로 발생하는 것이 아니다'",
              },
            ],
          },
          {
            text: "실험 설계 — 백조 목 플라스크(Swan-Neck Flask)",
            children: [
              {
                text: "S자 형태로 구부린 목 → 공기는 통하지만 먼지(미생물 포함)는 구부러진 목에 걸림",
              },
              { text: "고기즙을 넣고 끓여 살균 후 방치" },
            ],
          },
          {
            text: "결과",
            children: [
              { text: "백조 목 유지 → 미생물 번식 없음" },
              { text: "목을 잘라 공기 중 미생물 직접 유입 → 미생물 번식" },
            ],
          },
          {
            text: "실험 분석",
            children: [
              { text: "실험군: 목을 자른 플라스크" },
              { text: "대조군: 백조 목 유지 플라스크" },
              { text: "독립변인: 외부 미생물 유입 여부" },
              { text: "종속변인: 미생물 발생 여부" },
            ],
          },
          {
            text: "결론: 생물속생설(Biogenesis) 확립 — '생물은 반드시 기존 생물에서만 발생'",
          },
        ],
      },
      {
        id: "bio_ch1_s2_c7",
        label: "탐구 사례 2 — 플레밍의 페니실린 발견",
        nodes: [
          {
            text: "알렉산더 플레밍(Alexander Fleming, 1881~1955): 페니실린(Penicillin) 발견 — 우연한 관찰에서 출발한 연역적 탐구",
          },
          {
            text: "탐구 과정",
            children: [
              {
                text: "관찰(1928): 포도상구균 배양 배지에 푸른곰팡이(Penicillium notatum) 오염 → 곰팡이 주변 투명 구역(억제대, Zone of Inhibition) 형성",
              },
              {
                text: "문제 인식: 왜 곰팡이 주변에서 세균이 자라지 못하는가?",
              },
              {
                text: "가설: '푸른곰팡이가 세균 생장 억제 물질을 분비할 것'",
              },
              {
                text: "실험: 곰팡이 배양액(추출물)을 다양한 세균 배양 배지에 처리",
              },
              { text: "결과: 곰팡이 추출물 처리 배지에서 세균 생장 현저히 억제" },
            ],
          },
          {
            text: "실험 분석",
            children: [
              { text: "독립변인: 곰팡이 추출물 처리 여부" },
              { text: "종속변인: 세균 생장 정도" },
            ],
          },
          {
            text: "이후 발전: 플로리(Florey)·체인(Chain)이 페니실린 정제·대량 생산 → 2차 세계대전 부상병 감염 치료 → 1945년 노벨 생리의학상 공동 수상",
          },
          {
            text: "의의: 우연한 관찰(Serendipity)이 과학적 발견으로 이어진 사례 — '준비된 마음(Prepared Mind)'의 중요성",
          },
        ],
      },
      {
        id: "bio_ch1_s2_c8",
        label: "귀납적 탐구와 연역적 탐구의 비교",
        nodes: [
          {
            text: "귀납적 탐구",
            children: [
              { text: "출발점: 관찰·자료 수집" },
              { text: "가설: 없음" },
              { text: "대조 실험: 없음" },
              {
                text: "절차: 관찰 → 문제 인식 → 자료 수집 → 자료 분석 → 결론(일반화)",
              },
              { text: "적합 분야: 생태 조사, 분류, 지리학적 분포 연구" },
              { text: "한계: 하나의 반례로 결론 뒤집힘 가능" },
            ],
          },
          {
            text: "연역적 탐구(가설 연역법)",
            children: [
              { text: "출발점: 관찰에서 문제 인식 후 가설 설정" },
              { text: "가설: 있음" },
              { text: "대조 실험: 있음" },
              {
                text: "절차: 관찰 → 문제 인식 → 가설 설정 → 실험 설계·수행 → 결과 분석 → 결론",
              },
              { text: "적합 분야: 특정 요인의 인과 관계 규명" },
              { text: "한계: 가설이 잘못 설정되면 실험 자체가 무의미" },
            ],
          },
          {
            text: "상호 보완적 관계: 귀납적 관찰 → 패턴 발견 → 가설 설정 → 연역적 실험으로 검증하는 순환적 과정",
          },
          {
            text: "핵심 차이: '가설의 유무'와 '대조 실험의 유무'",
          },
        ],
      },
      {
        id: "bio_ch1_s2_c9",
        label: "자료의 수집과 분석 — 표와 그래프",
        nodes: [
          {
            text: "자료의 종류",
            children: [
              {
                text: "정성적 자료(Qualitative Data): 색깔, 냄새, 형태, 질감 등 비수치 관찰 결과",
              },
              {
                text: "정량적 자료(Quantitative Data): 길이, 무게, 온도, 시간 등 측정 기구 사용 수치",
              },
            ],
          },
          {
            text: "표(Table): 자료를 범주별로 분류·정리, 독립변인과 종속변인 값 대응 기록",
          },
          {
            text: "그래프의 종류",
            children: [
              { text: "선 그래프: 연속적 변화 표시 (시간에 따른 생장량 변화 등)" },
              {
                text: "막대그래프: 불연속적 자료 비교 (처리별 결과 비교 등)",
              },
              {
                text: "원 그래프: 전체 대비 각 항목 비율 (종 구성비 등)",
              },
              { text: "산점도: 두 변인 간 상관관계 표시" },
            ],
          },
          {
            text: "그래프 작성 원칙",
            children: [
              { text: "X축(가로축) = 독립변인, Y축(세로축) = 종속변인" },
              { text: "축의 단위와 눈금 간격 명확히 표시" },
            ],
          },
          {
            text: "통계적 분석 도구: 평균값(Mean), 중앙값(Median), 표준 편차(Standard Deviation), t-검정(t-test)",
          },
          {
            text: "그래프 해석 핵심: X축·Y축 변인 파악, 기울기(변화율), 최댓값·최솟값, 변곡점 분석",
          },
        ],
      },
      {
        id: "bio_ch1_s2_c10",
        label: "생명 과학 탐구의 특성과 한계",
        nodes: [
          {
            text: "생명 과학의 고유한 특성 — 연구 대상이 살아 있는 생물",
          },
          {
            text: "4가지 핵심 한계",
            children: [
              {
                text: "개체 간 변이(Variation): 같은 종이라도 실험 결과 불일치 가능 → 충분한 표본 수 + 반복 실험 + 통계적 유의미성 확보 필요",
              },
              {
                text: "윤리적 제약: 사람 대상 실험 크게 제한",
                children: [
                  {
                    text: "신약 개발: 동물 실험 → 임상 시험(1상: 안전성, 2상: 유효성, 3상: 대규모 검증)",
                  },
                  {
                    text: "동물 실험 3R 원칙: Replacement(대체), Reduction(감소), Refinement(개선)",
                  },
                ],
              },
              {
                text: "복합적 변인: 다양한 요인이 복합 작용 → 단일 변인으로 설명 어려움, 변인 통제 까다로움",
              },
              {
                text: "결론의 잠정성(Provisional): 새 증거에 의해 기존 이론 수정·대체 가능",
              },
            ],
          },
          {
            text: "한계 극복 방법: 통계적 분석, 동료 평가(Peer Review), 학술지 발표, 재현 실험, 메타 분석(Meta-Analysis)",
          },
        ],
      },
    ],
  },
  {
    id: "bio_ch1_s3",
    title: "생명 과학과 인간의 생활",
    summary:
      "의학, 농업, 환경, 생명공학 등 다양한 분야에서 생명 과학의 활용 사례와 생명공학 기술의 원리, 윤리적 문제, 그리고 생명 과학의 통합적 특성을 이해한다.",
    notes: [
      {
        id: "bio_ch1_s3_c1",
        label: "의학 분야에서의 활용",
        nodes: [
          {
            text: "생명 과학의 의학적 기여: 질병 원인 규명 및 치료법 개발",
          },
          {
            text: "항생제(Antibiotics)",
            children: [
              { text: "플레밍의 페니실린(1928) 이후 스트렙토마이신, 테트라사이클린 등 개발" },
              { text: "세균 감염 질환 치료의 획기적 발전" },
            ],
          },
          {
            text: "백신(Vaccine)",
            children: [
              {
                text: "에드워드 제너(Edward Jenner)의 종두법(1796) — 최초의 백신",
              },
              { text: "천연두, 소아마비, 홍역 등 전염병 퇴치 가능" },
            ],
          },
          {
            text: "인간 게놈 프로젝트(Human Genome Project, 1990~2003)",
            children: [
              { text: "약 30억 개 염기쌍의 인간 유전체 전체 해독" },
              {
                text: "맞춤 의학(Personalized Medicine): 개인 유전 정보에 기반한 치료",
              },
              { text: "유전자 치료(Gene Therapy) 발전 기여" },
            ],
          },
          {
            text: "줄기세포(Stem Cell) 연구",
            children: [
              { text: "손상 조직·장기의 재생 치료 가능성" },
              {
                text: "역분화 줄기세포(iPSC): 윤리적 문제 감소 + 환자 맞춤형 치료 가능",
              },
            ],
          },
          {
            text: "mRNA 백신: COVID-19 대응, 기존 개발 기간(10~15년)을 1년 이내로 단축",
            children: [
              {
                text: "원리: 바이러스 항원 단백질 유전 정보를 mRNA로 주입 → 면역 반응 유도",
              },
            ],
          },
        ],
      },
      {
        id: "bio_ch1_s3_c2",
        label: "농업 분야에서의 활용",
        nodes: [
          {
            text: "생명 과학의 농업 기여: 품종 개량, 병충해 방제, 식량 생산성 향상",
          },
          {
            text: "교배 육종(Cross Breeding): 원하는 형질 품종 교배 → 우수 형질 자손 선발, 오랜 시간 소요",
          },
          {
            text: "유전자 변형 생물(GMO, Genetically Modified Organism)",
            children: [
              { text: "유용 유전자를 다른 생물에 삽입하여 새로운 형질 부여" },
              {
                text: "예시",
                children: [
                  { text: "Bt 옥수수: 토양 세균 살충 단백질 유전자 삽입 → 해충 저항성" },
                  { text: "라운드업 레디 콩: 제초제 내성" },
                  { text: "황금쌀(Golden Rice): 베타카로틴 합성 유전자 → 비타민 A 강화" },
                  { text: "Flavr Savr 토마토: 무르지 않는 토마토" },
                ],
              },
            ],
          },
          {
            text: "조직 배양(Tissue Culture): 식물 조직 일부를 인공 배지에서 완전한 개체로 배양 → 우수 형질 대량 증식",
          },
          {
            text: "생물 농약(Biopesticide): 천적 미생물·천연 물질을 이용한 병해충 방제 → 화학 농약 오염 문제 감소",
          },
          {
            text: "GMO 장점 vs 단점",
            children: [
              { text: "장점: 식량 증산, 영양 강화, 병충해 내성" },
              {
                text: "단점: 생태계 교란 가능성, 장기 안전성 미확인, 유전자 수평 이동 위험",
              },
            ],
          },
        ],
      },
      {
        id: "bio_ch1_s3_c3",
        label: "환경 분야에서의 활용",
        nodes: [
          {
            text: "생명 과학의 환경 기여: 환경 오염 해결 및 생태계 보전",
          },
          {
            text: "생물학적 정화(Bioremediation)",
            children: [
              { text: "미생물 분해 능력으로 오염 물질 → 무해 물질 전환" },
              { text: "기름 유출 시 석유 분해 세균 투입" },
              {
                text: "식물 정화(Phytoremediation): 중금속 흡수 식물 재배",
              },
            ],
          },
          {
            text: "생태계 보전",
            children: [
              { text: "멸종 위기 종 개체군 동태 분석 + 보전 전략 수립" },
              { text: "서식지 복원 프로젝트(Habitat Restoration)" },
            ],
          },
          {
            text: "지표종(Indicator Species)을 이용한 수질 등급 판정",
            children: [
              { text: "1급수: 열목어·산천어" },
              { text: "2급수: 쏘가리·은어" },
              { text: "3급수: 붕어·잉어" },
              { text: "4급수: 실지렁이·깔따구" },
            ],
          },
          {
            text: "바이오 에너지(Bio-energy): 생물 자원 이용 재생 에너지",
            children: [
              { text: "바이오에탄올(옥수수·사탕수수 발효)" },
              { text: "바이오디젤(유채·대두유 전환)" },
              { text: "바이오가스(유기물 혐기성 분해 → 메탄 생산)" },
              { text: "화석 연료 의존도 감소, 탄소 중립(Carbon Neutrality) 기여" },
            ],
          },
          {
            text: "기타 기술: 유전자 바코딩(DNA Barcoding)으로 생물 종 신속 식별·생물 다양성 조사",
          },
          {
            text: "생태 발자국(Ecological Footprint): 인간 활동의 환경 영향 정량 평가 → 지속 가능한 발전(Sustainable Development) 정책 수립",
          },
        ],
      },
      {
        id: "bio_ch1_s3_c4",
        label: "생명공학 기술의 활용",
        nodes: [
          {
            text: "생명공학(Biotechnology): 생물체의 기능·유전 정보를 이용하여 유용 물질 생산·공정 개선",
          },
          {
            text: "유전자 재조합(Recombinant DNA Technology)",
            children: [
              {
                text: "한 생물의 유전자를 잘라내어 다른 생물 DNA에 삽입",
              },
              {
                text: "대표 예: 대장균에 인간 인슐린 유전자 삽입 → 인슐린 대량 생산",
              },
              {
                text: "도구",
                children: [
                  { text: "제한 효소(Restriction Enzyme): 특정 염기 서열 절단" },
                  { text: "DNA 연결 효소(DNA Ligase): DNA 연결" },
                  { text: "벡터(Vector, 플라스미드 등): 숙주 세포에 유전자 도입" },
                ],
              },
            ],
          },
          {
            text: "PCR(Polymerase Chain Reaction, 중합 효소 연쇄 반응)",
            children: [
              { text: "시험관 내 특정 DNA 절편을 수백만 배 증폭" },
              {
                text: "3단계: 변성(DNA 분리, 95도C) → 결합(프라이머 결합, 55~65도C) → 신장(새 가닥 합성, 72도C) 반복",
              },
              {
                text: "활용: 범죄 수사(DNA 지문 분석), 친자 확인, 유전 질환 진단, 감염병 진단(PCR 검사)",
              },
            ],
          },
          {
            text: "DNA 염기 서열 분석(DNA Sequencing)",
            children: [
              {
                text: "차세대 염기 서열 분석(NGS): 개인 유전체 분석이 빠르고 저렴하게 가능",
              },
            ],
          },
        ],
      },
      {
        id: "bio_ch1_s3_c5",
        label: "유전자 가위(CRISPR)와 줄기세포",
        nodes: [
          {
            text: "크리스퍼 유전자 가위(CRISPR-Cas9): 특정 유전자를 정밀하게 절단·편집하는 혁신적 기술",
          },
          {
            text: "CRISPR-Cas9의 원리",
            children: [
              { text: "가이드 RNA(Guide RNA): 표적 DNA 서열 인식·결합" },
              { text: "Cas9 단백질(가위 역할): DNA 이중 가닥 절단" },
              {
                text: "세포의 자연적 복구 메커니즘으로 유전자 제거(Knockout), 교정(Correction), 삽입(Knock-in) 가능",
              },
            ],
          },
          {
            text: "CRISPR 응용 분야: 유전 질환 치료(겸상 적혈구 빈혈증 등), 암 치료(면역 세포 강화), 작물 품종 개량, 병원체 연구",
          },
          {
            text: "2020년 샤르팡티에(Charpentier)·다우드나(Doudna) 노벨 화학상 수상",
          },
          {
            text: "줄기세포(Stem Cell): 다양한 세포로 분화 가능(분화능) + 자가 복제 능력 보유",
            children: [
              {
                text: "배아 줄기세포(ESC)",
                children: [
                  { text: "배반포 내세포괴에서 획득" },
                  { text: "전분화능(Pluripotency) — 모든 세포로 분화 가능" },
                  { text: "배아 파괴라는 윤리적 문제" },
                ],
              },
              {
                text: "성체 줄기세포(Adult Stem Cell)",
                children: [
                  { text: "골수, 제대혈 등에서 획득" },
                  { text: "분화 범위 제한적" },
                ],
              },
              {
                text: "역분화 줄기세포(iPSC)",
                children: [
                  {
                    text: "분화된 체세포에 특정 유전자(야마나카 인자) 도입 → 줄기세포 상태로 역전환",
                  },
                  { text: "배아 파괴 없이 환자 맞춤형 세포 획득 가능" },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "bio_ch1_s3_c6",
        label: "형질전환 생물과 생명공학 산물",
        nodes: [
          {
            text: "형질전환 생물(Transgenic Organism): 외래 유전자 도입으로 새로운 형질을 발현하도록 만든 생물",
          },
          {
            text: "형질전환 동물",
            children: [
              {
                text: "슈퍼 연어(AquAdvantage Salmon): 인간 성장 호르몬 유전자 삽입 → 성장 속도 2배 이상",
              },
              {
                text: "형질전환 염소: 거미줄 단백질 유전자 삽입 → 젖에서 실크 단백질 생산",
              },
              {
                text: "형질전환 돼지: 인간 혈액 응고 인자 생산",
              },
            ],
          },
          {
            text: "형질전환 식물: Bt 면화(살충 단백질), 제초제 내성 콩, 황금쌀",
          },
          {
            text: "형질전환 미생물: 인간 인슐린 생산 대장균, 인간 성장 호르몬 생산 대장균",
          },
          {
            text: "생명공학의 산업적 산물",
            children: [
              {
                text: "바이오 의약품: 인슐린, 인터페론, 에리스로포이에틴 등 유전자 재조합 의약품",
              },
              {
                text: "바이오 식품: 발효 식품(치즈·요구르트·김치), 효소를 이용한 식품 가공",
              },
              { text: "바이오 소재: 생분해성 플라스틱, 바이오 섬유" },
            ],
          },
          {
            text: "형질전환 생물 제작 과정: 목적 유전자 분리 → 벡터에 삽입 → 숙주 세포 도입 → 형질전환 개체 선별",
          },
          {
            text: "이점과 위험성: 유용 물질 대량 생산 가능 vs 생태계 교란, 알레르기 유발 가능성",
          },
        ],
      },
      {
        id: "bio_ch1_s3_c7",
        label: "생명 과학의 윤리적 문제",
        nodes: [
          {
            text: "생명 과학 기술 발전에 따른 윤리적 문제 — 과학적 진보와 윤리적 책임의 균형 필요",
          },
          {
            text: "유전자 편집(Gene Editing) 윤리",
            children: [
              {
                text: "체세포 유전자 편집(Somatic): 해당 개인에게만 영향 → 비교적 논란 적음",
              },
              {
                text: "생식 세포·배아 유전자 편집: 미래 세대에 영향 → 맞춤 아기(Designer Baby) 논란",
              },
              {
                text: "2018년 허젠쿠이 사건(유전자 편집 아기 출산) → 과학계 강력 비판",
              },
            ],
          },
          {
            text: "인간 복제(Human Cloning)",
            children: [
              {
                text: "생식 복제(Reproductive Cloning): 복제 인간 생산 → 대부분 국가 금지(인간 존엄성 침해)",
              },
              {
                text: "치료 복제(Therapeutic Cloning): 줄기세포 확보 목적",
              },
            ],
          },
          {
            text: "기타 윤리적 쟁점",
            children: [
              { text: "GMO 식품: 장기 안전성·생태계 영향 논쟁, GMO 표시제 시행" },
              { text: "동물 실험: 동물 복지, 3R 원칙 적용" },
              { text: "유전 정보 사생활 보호: 유전자 차별 금지법" },
              { text: "생명 특허: 유전자·생물체에 대한 지적 재산권 쟁점" },
            ],
          },
          {
            text: "생명 윤리(Bioethics) 4대 원칙",
            children: [
              { text: "자율성 존중(Respect for Autonomy): 충분한 정보 제공 + 자발적 동의" },
              { text: "악행 금지(Non-maleficence): 해를 끼치지 않음" },
              { text: "선행(Beneficence): 이익 증진" },
              { text: "정의(Justice): 공정한 분배" },
            ],
          },
          {
            text: "법적·제도적 장치",
            children: [
              {
                text: "유네스코 세계 생명 윤리 선언(2005)",
              },
              {
                text: "한국: 생명윤리 및 안전에 관한 법률, IRB(기관생명윤리위원회) 승인 필수",
              },
            ],
          },
        ],
      },
      {
        id: "bio_ch1_s3_c8",
        label: "생명 과학의 발전사와 주요 업적",
        nodes: [
          {
            text: "고대 ~ 18세기",
            children: [
              {
                text: "아리스토텔레스(기원전 384~322): 동물 체계적 분류 최초 시도, 약 500종 관찰·기록",
              },
              {
                text: "레이우엔후크(1632~1723): 자제작 현미경으로 최초 미생물·적혈구 관찰",
              },
              {
                text: "로버트 훅(1635~1703): 코르크 조각에서 작은 방 발견 → 'Cell(세포)' 명명",
              },
              {
                text: "카를 린네(1707~1778): 이명법(Binomial Nomenclature) 고안 → 생물 분류 체계 확립",
              },
            ],
          },
          {
            text: "19세기",
            children: [
              {
                text: "슐라이덴·슈반: 세포설(Cell Theory, 1838~1839) 제안 — 모든 생물이 세포로 구성",
              },
              {
                text: "다윈: '종의 기원'(1859) 출판 — 자연 선택에 의한 진화론 제시",
              },
              {
                text: "멘델(1822~1884): 완두콩 교배 실험 → 유전 법칙(우열·분리·독립의 법칙) 발견",
              },
              {
                text: "파스퇴르: 자연발생설 부정 + 저온 살균법 개발",
              },
              {
                text: "코흐(Robert Koch): 코흐의 원칙(Koch's Postulates) 확립 — 특정 미생물이 특정 질병 유발",
              },
            ],
          },
          {
            text: "20세기",
            children: [
              {
                text: "왓슨(Watson)·크릭(Crick): DNA 이중 나선 구조 규명(1953) → 분자 생물학 시대 개막",
              },
              {
                text: "인간 게놈 프로젝트(2003 완료): 인간 유전체 전체 해독",
              },
            ],
          },
          {
            text: "21세기",
            children: [
              { text: "CRISPR-Cas9 유전자 가위 기술 개발" },
              { text: "mRNA 백신 실용화" },
              {
                text: "AlphaFold: 인공지능 활용 단백질 구조 예측",
              },
            ],
          },
          {
            text: "주요 과학자-업적 매칭 정리",
            children: [
              { text: "레이우엔후크 — 현미경(미생물 관찰)" },
              { text: "훅 — 세포 명명" },
              { text: "린네 — 이명법(생물 분류)" },
              { text: "다윈 — 자연선택설(진화론)" },
              { text: "멘델 — 유전법칙" },
              { text: "파스퇴르 — 자연발생설 부정" },
              { text: "왓슨·크릭 — DNA 이중나선 구조 규명" },
            ],
          },
        ],
      },
      {
        id: "bio_ch1_s3_c9",
        label: "생명 과학의 통합적 특성",
        nodes: [
          {
            text: "현대 생명 과학의 통합적(학제적, Interdisciplinary) 특성 — 다양한 학문과 융합하여 발전",
          },
          {
            text: "생물물리학(Biophysics)",
            children: [
              {
                text: "물리학 원리·방법론을 생물 현상에 적용",
              },
              {
                text: "성과: X선 결정학으로 DNA 이중 나선 구조 규명",
              },
              {
                text: "의료 영상: MRI(자기 공명 영상), CT(컴퓨터 단층 촬영), PET(양전자 방출 단층 촬영)",
              },
            ],
          },
          {
            text: "생화학(Biochemistry): 화학 원리로 생체 분자(단백질, 핵산, 지질, 탄수화물) 구조·기능, 물질대사 메커니즘 연구",
          },
          {
            text: "생물정보학(Bioinformatics)",
            children: [
              {
                text: "수학·통계학·컴퓨터 과학으로 대량 생물학적 데이터 분석·해석",
              },
              {
                text: "활용: 유전체 서열 분석, 단백질 구조 예측(AlphaFold), 약물 타깃 발굴",
              },
            ],
          },
          {
            text: "나노바이오기술(Nanobiotechnology)",
            children: [
              { text: "나노미터(10^-9m) 수준 물질 이용 생명 과학 기술" },
              {
                text: "약물 전달 시스템(Drug Delivery System): 나노 입자로 특정 세포에만 약물 전달",
              },
              { text: "나노 센서(미량 바이오마커 검출), 나노 로봇(체내 순환·질병 치료)" },
            ],
          },
          {
            text: "시스템 생물학(Systems Biology): 유전자·단백질·대사물질 상호작용을 전체적(Holistic) 관점에서 통합 분석",
          },
        ],
      },
      {
        id: "bio_ch1_s3_c10",
        label: "생명 과학과 직업 세계",
        nodes: [
          {
            text: "생명 과학 발전에 따른 다양한 직업 분야 창출·변화",
          },
          {
            text: "기초 연구 분야: 분자생물학자, 유전학자, 생태학자, 미생물학자, 신경과학자 (대학·연구소)",
          },
          {
            text: "의료·보건 분야",
            children: [
              { text: "의사, 약사, 간호사, 임상병리사, 방사선사, 물리치료사" },
              {
                text: "유전 상담사(Genetic Counselor): 유전체 분석 발전에 따른 수요 급증 신흥 직종",
              },
            ],
          },
          {
            text: "생명공학 산업 분야: 바이오 연구원, 제약 연구원, 생물정보학자, 임상시험 코디네이터(CRC), 식품공학자, 환경공학자",
          },
          {
            text: "농업·식품 분야",
            children: [
              { text: "육종학자, 수의사, 식품위생 전문가, 농생명공학자" },
              {
                text: "첨단 융합 직업: 스마트팜, 정밀 농업(Precision Agriculture)",
              },
            ],
          },
          {
            text: "환경·생태 분야: 환경영향평가사, 자연생태복원기사, 야생동물관리사, 환경교육 전문가",
          },
          {
            text: "법과학(Forensic Science): 법유전학자 — DNA 분석 통한 범죄 수사, 친자 확인, 유골 신원 확인",
          },
          {
            text: "신흥 융합형 직업: 바이오 데이터 사이언티스트, AI 신약 개발 전문가, 디지털 헬스케어 전문가",
          },
        ],
      },
    ],
  },
];
