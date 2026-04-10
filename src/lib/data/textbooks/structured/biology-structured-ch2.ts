import type { StructuredSection } from "./ethics-structured-index";

/**
 * 제2장: 세포의 특성 — 구조화 텍스트 (암기 친화)
 * 원본: biology-ch2.ts의 서술형 detail → 계층 트리 + 명사형 종결
 */
export const BIOLOGY_STRUCTURED_CH2: StructuredSection[] = [
  {
    id: "bio_ch2_s1",
    title: "세포의 구조",
    summary:
      "원핵세포와 진핵세포의 차이, 세포막의 구조, 핵과 다양한 세포소기관의 구조와 기능, 동물세포와 식물세포의 비교, 세포 크기와 표면적/부피 비, 세포 연구 방법을 이해한다.",
    notes: [
      {
        id: "bio_ch2_s1_c1",
        label: "원핵세포와 진핵세포의 비교",
        nodes: [
          {
            text: "세포 분류 기준: 핵막(Nuclear Envelope)의 유무",
          },
          {
            text: "원핵세포(Prokaryotic Cell)",
            children: [
              { text: "핵막 없음 → 유전 물질(DNA)이 세포질에 노출(핵양체, Nucleoid)" },
              { text: "막성 세포소기관 없음" },
              { text: "DNA: 하나의 환형(circular) 염색체 + 플라스미드(Plasmid, 작은 환형 DNA)" },
              { text: "리보솜: 70S (50S + 30S)" },
              { text: "크기: 1~10μm" },
              {
                text: "세포벽: 펩티도글리칸(Peptidoglycan) 구성",
                children: [
                  { text: "그람 양성균: 보라색, 두꺼운 펩티도글리칸" },
                  { text: "그람 음성균: 붉은색, 얇은 펩티도글리칸 + 외막" },
                ],
              },
              { text: "부속 구조: 캡슐(Capsule), 편모(Flagella), 섬모(Pili)" },
              { text: "해당 생물: 세균(Bacteria), 고세균(Archaea), 대장균, 남세균" },
            ],
          },
          {
            text: "진핵세포(Eukaryotic Cell)",
            children: [
              { text: "핵막으로 둘러싸인 뚜렷한 핵 존재" },
              { text: "미토콘드리아, 소포체, 골지체 등 막성 세포소기관 보유" },
              { text: "리보솜: 80S (60S + 40S)" },
              { text: "크기: 10~100μm" },
              { text: "해당 생물: 동물, 식물, 균류, 원생생물" },
            ],
          },
          {
            text: "전사·번역 차이",
            children: [
              { text: "원핵세포: 전사와 번역이 세포질에서 동시 진행(핵막 없음)" },
              { text: "진핵세포: 전사(핵) → 번역(세포질) 분리" },
            ],
          },
          {
            text: "시험 포인트: 핵막 유무, 막성 세포소기관 유무, 리보솜 크기, 세포벽 구성 성분",
          },
        ],
      },
      {
        id: "bio_ch2_s1_c2",
        label: "세포막의 구조 — 유동 모자이크 모델",
        nodes: [
          {
            text: "세포막(Cell Membrane): 인지질 이중층(Phospholipid Bilayer) 기본 골격",
          },
          {
            text: "인지질의 구조",
            children: [
              { text: "친수성 머리(인산기) + 소수성 꼬리(지방산 2개)" },
              { text: "수용액 환경에서 이중층 자발적 형성" },
              { text: "불포화 지방산 많을수록 막 유동성 증가" },
            ],
          },
          {
            text: "콜레스테롤: 온도에 따른 막 유동성 변화 완충 역할",
          },
          {
            text: "막단백질의 종류와 기능",
            children: [
              { text: "주변 단백질(Peripheral Protein): 인지질 이중층에 부분적으로 묻힘" },
              {
                text: "내재 단백질(Integral Protein): 이중층 관통",
                children: [
                  { text: "채널 단백질: 물질 수송" },
                  { text: "운반체 단백질: 물질 수송" },
                  { text: "수용체 단백질: 신호 전달" },
                  { text: "당단백질: 세포 인식" },
                ],
              },
            ],
          },
          {
            text: "유동 모자이크 모델(Fluid Mosaic Model): 싱어와 니컬슨(1972년) 제안",
            children: [
              { text: "인지질과 단백질이 막 내에서 유동적으로 이동" },
            ],
          },
          {
            text: "선택적 투과성(Selective Permeability): 필요한 물질 선별 출입",
          },
        ],
      },
      {
        id: "bio_ch2_s1_c3",
        label: "핵(Nucleus)",
        nodes: [
          {
            text: "핵: 진핵세포의 유전 정보 저장소이자 세포 활동 조절 중추",
          },
          {
            text: "핵막(Nuclear Envelope)",
            children: [
              { text: "이중막 구조(외막 + 내막)" },
              { text: "핵공(Nuclear Pore): mRNA, 리보솜 소단위체, 전사 인자 이동 통로" },
              { text: "외막은 거친면 소포체와 연결" },
            ],
          },
          {
            text: "DNA 구조와 염색체",
            children: [
              { text: "DNA → 히스톤(Histone) 단백질 감김 → 뉴클레오솜(Nucleosome)" },
              { text: "뉴클레오솜 → 염색질(Chromatin, 비분열 시)" },
              { text: "세포 분열 시 응축 → 염색체(Chromosome)" },
              { text: "사람 체세포: 23쌍(46개) — 상염색체 22쌍 + 성염색체 1쌍" },
            ],
          },
          {
            text: "핵소체(Nucleolus): rRNA 합성 및 리보솜 소단위체 조립 장소",
          },
          {
            text: "핵의 필수성",
            children: [
              { text: "핵 제거 시 단백질 합성 불가 → 세포 사멸" },
              { text: "아메바 핵 이식 실험: 핵 제거→사멸, 타 핵 이식→생명 활동 회복" },
            ],
          },
          {
            text: "핵 내 유전자 발현",
            children: [
              { text: "DNA 복제(Replication), 전사(Transcription) 수행" },
              { text: "pre-mRNA → RNA 스플라이싱(인트론 제거 + 엑손 결합) → 성숙 mRNA" },
              { text: "성숙 mRNA가 핵공을 통해 세포질로 이동" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s1_c4",
        label: "미토콘드리아(Mitochondria)",
        nodes: [
          {
            text: "미토콘드리아: 세포 호흡을 통한 ATP 생산 기관 — '세포의 발전소'",
          },
          {
            text: "이중막 구조",
            children: [
              { text: "외막(Outer Membrane): 매끄럽고 투과성 높음" },
              {
                text: "내막(Inner Membrane): 크리스타(Cristae) 형성으로 표면적 확대",
                children: [
                  { text: "전자 전달계 단백질 복합체(Complex I~IV) 위치" },
                  { text: "ATP 합성 효소(ATP Synthase) 위치" },
                  { text: "외막보다 투과성 낮음 → H⁺ 농도 기울기 유지" },
                ],
              },
            ],
          },
          {
            text: "기질(Matrix)",
            children: [
              { text: "피루브산 탈수소효소 복합체, TCA 회로 효소 존재" },
              { text: "자체 DNA(환형, mtDNA)와 리보솜(70S) 보유" },
            ],
          },
          {
            text: "내공생설(Endosymbiotic Theory, 마굴리스 제안)",
            children: [
              { text: "근거: 이중막, 자체 DNA, 70S 리보솜, 독립 분열" },
              { text: "원시 원핵세포에서 유래 추정" },
            ],
          },
          {
            text: "분포: 에너지 요구량 높은 세포(근육, 간, 신경)에 다량 존재",
            children: [
              { text: "간세포 1개당 약 1,000~2,000개" },
            ],
          },
          {
            text: "모계 유전(Maternal Inheritance)",
            children: [
              { text: "수정 시 정자 미토콘드리아 분해 → 난자 미토콘드리아만 전달" },
              { text: "활용: 모계 혈통 추적, 법의학 개인 식별" },
              { text: "미토콘드리아 유전 질환 예: 레버 유전성 시신경 병증(LHON)" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s1_c5",
        label: "엽록체(Chloroplast)",
        nodes: [
          {
            text: "엽록체: 빛에너지를 이용한 광합성 수행 기관",
            children: [
              { text: "존재: 식물 세포, 일부 원생생물(유글레나 등)" },
            ],
          },
          {
            text: "이중막 + 내부 구조",
            children: [
              {
                text: "틸라코이드(Thylakoid): 납작한 주머니 구조",
                children: [
                  { text: "그라나(Grana): 틸라코이드가 쌓인 구조" },
                  { text: "스트로마 라멜라(Stroma Lamella): 그라나 연결 막" },
                ],
              },
              {
                text: "틸라코이드 막: 명반응(Light Reaction) 장소",
                children: [
                  { text: "엽록소(Chlorophyll), 광계 I·II, 전자 전달 단백질 위치" },
                ],
              },
              {
                text: "스트로마(Stroma): 캘빈 회로(암반응) 장소",
                children: [
                  { text: "RuBisCO 효소와 회로 효소 존재" },
                ],
              },
            ],
          },
          {
            text: "내공생설 지지 근거: 자체 DNA(환형, cpDNA), 리보솜(70S) 보유",
            children: [
              { text: "기원: 원시 진핵세포가 광합성 시아노박테리아를 세포 내 흡수" },
            ],
          },
          {
            text: "엽록소의 빛 흡수",
            children: [
              { text: "흡수: 적색광(약 680nm), 청색광(약 430nm)" },
              { text: "반사: 녹색광(약 550nm) → 식물이 녹색으로 보이는 이유" },
            ],
          },
          {
            text: "광합성 산물의 이동과 저장",
            children: [
              { text: "포도당 → 설탕(수크로스) 전환 → 체관 통해 비광합성 기관으로 운반" },
              { text: "녹말로 전환 → 스트로마에 일시 저장" },
            ],
          },
          {
            text: "크기와 분포: 직경 5~10μm, 두께 2~4μm, 렌즈형",
            children: [
              { text: "잎 엽육세포(Mesophyll Cell) 1개에 약 20~100개" },
              { text: "빛이 있는 환경에서만 발달, 뿌리 세포에 없음" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s1_c6",
        label: "소포체(Endoplasmic Reticulum, ER)",
        nodes: [
          {
            text: "소포체: 핵막에 연결된 막성 구조물, 물질 합성과 수송 통로",
          },
          {
            text: "거친면 소포체(Rough ER, rER)",
            children: [
              { text: "표면에 리보솜 부착" },
              { text: "기능: 분비 단백질·막단백질 합성, 단백질 접힘(Folding)·품질 관리" },
              { text: "수송 소낭(Transport Vesicle)으로 골지체에 운반" },
              { text: "많이 발달한 세포: 이자 외분비 세포, 항체 생산 B세포, 간세포" },
            ],
          },
          {
            text: "매끈면 소포체(Smooth ER, sER)",
            children: [
              { text: "리보솜 없음" },
              {
                text: "기능",
                children: [
                  { text: "인지질·스테로이드 호르몬 합성" },
                  { text: "간세포에서 약물 해독(시토크롬 P450 효소)" },
                  { text: "근육세포에서 Ca²⁺ 저장·방출(근소포체, Sarcoplasmic Reticulum)" },
                ],
              },
              { text: "알코올·약물 장기 복용 → 간세포 매끈면 소포체 비대(해독 기능 증가)" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s1_c7",
        label: "골지체(Golgi Apparatus)",
        nodes: [
          {
            text: "골지체: 납작한 주머니(시스터나, Cisternae) 4~8겹 적층 구조",
          },
          {
            text: "구조적 방향성",
            children: [
              { text: "시스 면(cis face, 수용면): 거친면 소포체 방향" },
              { text: "트랜스 면(trans face, 분비면): 세포막 방향" },
            ],
          },
          {
            text: "기능: 단백질의 단계적 가공(수정)",
            children: [
              { text: "당쇄 부가(당화, Glycosylation)" },
              { text: "인산화(Phosphorylation), 황산화" },
              { text: "단백질 절단" },
            ],
          },
          {
            text: "가공 후 분류 및 운반",
            children: [
              { text: "분비 소낭 → 세포 밖 분비" },
              { text: "리소좀으로 전달(만노스-6-인산 태그)" },
              { text: "세포막에 삽입" },
            ],
          },
          {
            text: "비유: 세포의 '물류 센터 및 우체국'",
          },
          {
            text: "발달 세포: 점액 분비 세포, 이자 세포",
          },
          {
            text: "리소좀 형성 장소이기도 함",
          },
        ],
      },
      {
        id: "bio_ch2_s1_c8",
        label: "리보솜(Ribosome)",
        nodes: [
          {
            text: "리보솜: mRNA 코돈 → 단백질 합성(번역, Translation) 수행",
          },
          {
            text: "구조: 대소단위체(Large + Small Subunit), rRNA + 단백질 구성",
            children: [
              { text: "진핵세포: 60S + 40S = 80S" },
              { text: "원핵세포: 50S + 30S = 70S" },
            ],
          },
          {
            text: "비막성(Non-membranous) 세포소기관",
          },
          {
            text: "위치에 따른 구분",
            children: [
              { text: "유리 리보솜(Free): 세포질 내 구조 단백질·효소 합성" },
              { text: "부착 리보솜(Bound): rER 부착, 분비용 단백질·막단백질·리소좀 효소 합성" },
              { text: "구조 동일, 합성 단백질의 신호 서열(Signal Sequence) 유무로 위치 결정" },
            ],
          },
          {
            text: "폴리솜(Polysome): 여러 리보솜이 하나의 mRNA에 동시 부착 → 단백질 합성 효율 향상",
          },
        ],
      },
      {
        id: "bio_ch2_s1_c9",
        label: "리소좀(Lysosome)",
        nodes: [
          {
            text: "리소좀: 약 60종 이상의 가수분해 효소 포함, 단일막 소낭",
          },
          {
            text: "형성: 골지체 트랜스 면에서 생성",
          },
          {
            text: "내부 효소",
            children: [
              { text: "프로테아제(단백질 분해)" },
              { text: "뉴클레아제(핵산 분해)" },
              { text: "리파아제(지질 분해)" },
              { text: "다당류 분해 효소" },
            ],
          },
          {
            text: "기능",
            children: [
              {
                text: "세포 내 소화(Intracellular Digestion)",
                children: [
                  { text: "식포(Phagosome) + 리소좀 → 식포리소좀(Phagolysosome) → 소화" },
                ],
              },
              { text: "자가포식(Autophagy): 노화·손상된 세포소기관 분해 → 항상성 유지" },
            ],
          },
          {
            text: "내부 pH: 약 4.5~5.0(산성)",
            children: [
              { text: "리소좀 막의 H⁺ 펌프가 ATP 사용하여 H⁺ 능동 수송" },
            ],
          },
          {
            text: "막 손상 시 효소 유출 → 자가 분해(Autolysis) — 아폽토시스와 구별",
          },
          {
            text: "발달 세포: 백혈구(대식세포, 호중구)",
          },
        ],
      },
      {
        id: "bio_ch2_s1_c10",
        label: "중심체(Centrosome)와 세포골격(Cytoskeleton)",
        nodes: [
          {
            text: "중심체(Centrosome)",
            children: [
              { text: "동물 세포에 존재" },
              { text: "2개의 중심립(Centriole): 직각 배열" },
              { text: "중심립 구조: 9개 미세소관 삼중체 → 원통형 '9+0' 구조" },
              { text: "세포 분열 시 복제 → 양극 이동 → 방추사(Spindle Fiber) 형성" },
              { text: "식물 세포: 중심체 없으나 MTOC에서 방추사 형성" },
            ],
          },
          {
            text: "세포골격(Cytoskeleton): 세포 내부 단백질 섬유 그물 구조",
            children: [
              {
                text: "미세소관(Microtubule): 튜뷸린 단백질, 직경 25nm",
                children: [
                  { text: "방추사 형성, 세포소기관 이동 경로" },
                ],
              },
              {
                text: "미세섬유(Microfilament): 액틴 필라멘트, 직경 7nm",
                children: [
                  { text: "아메바 운동, 근육 수축, 세포질 분열" },
                ],
              },
              {
                text: "중간섬유(Intermediate Filament): 케라틴 등, 직경 10nm",
                children: [
                  { text: "세포 기계적 강도 유지, 핵 위치 고정" },
                ],
              },
            ],
          },
          {
            text: "섬모(Cilia)와 편모(Flagella): '9+2' 미세소관 구조",
            children: [
              { text: "섬모: 짧고 많음(기관지 상피세포 — 이물질 배출)" },
              { text: "편모: 길고 적음(정자 — 운동 담당)" },
            ],
          },
          {
            text: "세포골격의 동적 구조(Dynamic Instability): 조립·해체 반복",
          },
          {
            text: "모터 단백질",
            children: [
              { text: "다이닌(Dynein), 키네신(Kinesin): 미세소관 따라 소낭·세포소기관 운반" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s1_c11",
        label: "액포(Vacuole)와 식물세포 고유 구조",
        nodes: [
          {
            text: "액포: 단일막(액포막, Tonoplast)으로 둘러싸인 주머니 구조",
          },
          {
            text: "식물 세포의 중앙 액포(Central Vacuole)",
            children: [
              { text: "어린 세포: 여러 작은 액포 → 성숙 시 합쳐져 하나의 큰 중앙 액포" },
              { text: "세포 부피의 80~90% 차지 가능" },
              {
                text: "세포액(Cell Sap) 구성",
                children: [
                  { text: "물, 당류, 유기산, 무기 이온" },
                  { text: "색소(안토시아닌 — 보라색·빨간색)" },
                  { text: "방어 물질(탄닌, 알칼로이드), 노폐물" },
                ],
              },
              { text: "삼투압 조절 → 팽압(Turgor Pressure) 유지 → 식물 형태 유지" },
              { text: "팽압 감소 → 식물 시듦, 물 공급 → 삼투 수분 유입 → 팽압 회복" },
            ],
          },
          {
            text: "안토시아닌(Anthocyanin) 색소",
            children: [
              { text: "꽃잎 세포 액포에 포함 → 빨간·파란·보라 발현" },
              { text: "색 변화: 산성(붉은색), 염기성(파란색)" },
            ],
          },
          {
            text: "식물 세포벽(Cell Wall)",
            children: [
              { text: "1차 세포벽: 셀룰로스(Cellulose) 미세섬유, 유연" },
              { text: "2차 세포벽: 리그닌(Lignin) 침착, 단단" },
              { text: "기능: 물리적 보호, 형태 유지" },
              { text: "원형질연락사(Plasmodesmata): 세포벽 관통, 인접 세포 간 소통" },
            ],
          },
          {
            text: "동물 세포의 액포: 크기 매우 작고 일시적(식포, 수축 액포 등)",
          },
        ],
      },
      {
        id: "bio_ch2_s1_c12",
        label: "동물세포와 식물세포의 비교",
        nodes: [
          {
            text: "공통점: 진핵세포 — 핵, 미토콘드리아, 소포체, 골지체, 리보솜 보유",
          },
          {
            text: "주요 차이점(시험 빈출 — 표 비교)",
            children: [
              { text: "세포벽: 식물(셀룰로스) O / 동물 X" },
              { text: "엽록체: 식물 O(광합성) / 동물 X" },
              { text: "중앙 액포: 식물 O(크고 발달) / 동물 X(작거나 없음)" },
              { text: "중심체: 동물 O / 식물 X(방추사는 형성 가능)" },
            ],
          },
          {
            text: "세포 간 소통 방식",
            children: [
              { text: "식물: 원형질연락사(Plasmodesmata) — 세포질 직접 연결" },
              {
                text: "동물: 세포 연접",
                children: [
                  { text: "간극결합(Gap Junction)" },
                  { text: "밀착결합(Tight Junction)" },
                  { text: "부착결합(Desmosome)" },
                ],
              },
            ],
          },
          {
            text: "세포질 분열",
            children: [
              { text: "식물: 세포판(Cell Plate) 형성" },
              { text: "동물: 세포질 잘록(Cleavage Furrow)" },
            ],
          },
          {
            text: "에너지 저장 형태",
            children: [
              { text: "동물: 글리코겐(Glycogen)" },
              { text: "식물: 녹말(Starch)" },
            ],
          },
          {
            text: "세포벽 구성 비교",
            children: [
              { text: "식물: 셀룰로스(Cellulose)" },
              { text: "균류: 키틴(Chitin)" },
              { text: "세균: 펩티도글리칸(Peptidoglycan)" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s1_c13",
        label: "세포 크기와 표면적/부피 비",
        nodes: [
          {
            text: "세포 크기 제한 원리: 표면적 대 부피 비(SA/V Ratio)",
          },
          {
            text: "세포 커질수록 SA/V 감소",
            children: [
              { text: "부피: 세제곱에 비례 증가 / 표면적: 제곱에 비례 증가" },
              { text: "예: 1cm³ SA/V = 6, 2cm³ SA/V = 3(절반)" },
            ],
          },
          {
            text: "SA/V 감소의 문제",
            children: [
              { text: "세포막 물질 교환(영양분·노폐물·가스) 효율 저하" },
              { text: "세포 내부 확산 거리 증가 → 물질 공급 부족" },
              { text: "핵-세포질 비(Nuclear-Cytoplasmic Ratio) 한계" },
            ],
          },
          {
            text: "결과: 세포는 일정 크기 이상 성장 불가 → 세포 분열로 수 증가",
          },
          {
            text: "SA/V 극복 전략",
            children: [
              { text: "소장 상피세포 미세융모(Microvilli): 표면적 약 20배 이상 증가" },
              { text: "신장 세뇨관 미세융모: 재흡수 효율 향상" },
              { text: "적혈구: 양면 오목 원반형(Biconcave Disc) → SA/V 높음 → 가스 교환 효율" },
              { text: "신경세포: 매우 길지만 가늘어 SA/V 유지 + 말이집(Myelin Sheath)" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s1_c14",
        label: "세포의 연구 방법",
        nodes: [
          {
            text: "광학현미경(Light Microscope, LM)",
            children: [
              { text: "가시광선 이용, 최대 약 1,000배 확대" },
              { text: "분해능: 약 0.2μm(200nm)" },
              { text: "살아있는 세포 관찰 가능" },
              {
                text: "염색법",
                children: [
                  { text: "아세트산 카민: 핵 염색" },
                  { text: "메틸렌블루: 세포 구조" },
                  { text: "요오드 용액: 녹말 검출" },
                ],
              },
            ],
          },
          {
            text: "전자현미경(Electron Microscope, EM)",
            children: [
              { text: "전자빔 이용, 최대 약 100만 배 확대" },
              { text: "분해능: 약 0.2nm(광학현미경의 약 1,000배)" },
              { text: "진공 상태 관찰 → 살아있는 세포 관찰 불가" },
              {
                text: "종류",
                children: [
                  { text: "투과전자현미경(TEM): 얇은 시료 투과 → 세포 내부 미세 구조" },
                  { text: "주사전자현미경(SEM): 표면 전자빔 → 3차원 표면 구조" },
                ],
              },
            ],
          },
          {
            text: "세포분획법(Cell Fractionation)",
            children: [
              { text: "세포 파쇄 → 원심분리기로 크기·밀도별 분리" },
              {
                text: "침전 순서(저속→고속)",
                children: [
                  { text: "핵 → 미토콘드리아(엽록체) → 소포체 → 리보솜" },
                ],
              },
            ],
          },
          {
            text: "형광현미경: 형광 물질(GFP 등)로 특정 단백질·DNA 위치 추적",
          },
          {
            text: "공초점 레이저 주사 현미경: 레이저로 특정 깊이만 촬영 → 3차원 재구성",
          },
        ],
      },
      {
        id: "bio_ch2_s1_c15",
        label: "퍼옥시좀(Peroxisome)",
        nodes: [
          {
            text: "퍼옥시좀(과산화소체): 산화 반응 수행, 단일막 소낭",
          },
          {
            text: "형성: 기존 퍼옥시좀 분열 또는 소포체에서 새로 형성(골지체 유래 아님)",
          },
          {
            text: "포함 효소(40종 이상)",
            children: [
              {
                text: "산화효소(Oxidase)",
                children: [
                  { text: "지방산 β-산화(긴 사슬 지방산 → 아세틸 CoA)" },
                  { text: "아미노산 산화적 탈아미노화" },
                  { text: "에탄올 산화" },
                  { text: "부산물: 유해한 과산화수소(H₂O₂) 생성" },
                ],
              },
              {
                text: "카탈레이스(Catalase)",
                children: [
                  { text: "H₂O₂ → H₂O + O₂ 분해 → 세포 보호" },
                ],
              },
            ],
          },
          {
            text: "분포: 간세포, 신장세포에 다량(해독·지방산 대사 활발)",
          },
          {
            text: "리소좀과의 구별",
            children: [
              { text: "리소좀: 가수분해 효소, 산성 환경(pH 5), 세포 내 소화" },
              { text: "퍼옥시좀: 산화 효소, 중성~약알칼리성, 산화 반응·해독" },
            ],
          },
          {
            text: "식물 퍼옥시좀: 광호흡(Photorespiration) 관여",
            children: [
              { text: "글리옥시좀(Glyoxysome): 발아 종자에서 저장 지방→당 전환(글리옥실산 회로)" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s1_c16",
        label: "내막계(Endomembrane System) 종합 정리",
        nodes: [
          {
            text: "내막계: 막으로 연결되거나 소낭을 통해 물질 교환하는 막성 세포소기관 체계",
          },
          {
            text: "내막계 포함",
            children: [
              { text: "핵막, 거친면 소포체, 매끈면 소포체, 골지체, 리소좀, 액포, 세포막" },
            ],
          },
          {
            text: "내막계 비포함",
            children: [
              { text: "미토콘드리아, 엽록체(내공생 기원)" },
              { text: "리보솜(비막성)" },
              { text: "퍼옥시좀(대부분 독립적 분열)" },
              { text: "세포골격(비막성)" },
            ],
          },
          {
            text: "내막계 작동 과정(단백질 분비 경로)",
            children: [
              { text: "1단계: 핵에서 전사된 mRNA → 핵공 통해 세포질로 이동" },
              { text: "2단계: 거친면 소포체 리보솜에서 단백질 합성 → 소포체 내강(Lumen)" },
              { text: "3단계: 수송 소낭 → 골지체 시스 면으로 이동" },
              { text: "4단계: 골지체에서 단백질 수정(당화, 인산화) 및 분류" },
              {
                text: "5단계: 골지체 트랜스 면에서 목적지별 운반",
                children: [
                  { text: "분비 소낭(세포 외 배출)" },
                  { text: "리소좀" },
                  { text: "세포막 삽입" },
                ],
              },
            ],
          },
          {
            text: "매끈면 소포체: 지질 합성 → 소낭으로 다른 막에 전달 → 막 성장·유지",
          },
          {
            text: "핵심 흐름: 리보솜(rER) → 거친면 소포체 → 수송 소낭 → 골지체(시스→트랜스) → 분비 소낭 → 세포막(엑소사이토시스)",
          },
        ],
      },
    ],
  },
  {
    id: "bio_ch2_s2",
    title: "세포막을 통한 물질 이동",
    summary:
      "확산, 삼투, 능동 수송, 세포 내 섭취와 세포 외 배출 등 세포막을 통한 다양한 물질 이동 방식과 장액에 따른 세포 변화를 이해한다.",
    notes: [
      {
        id: "bio_ch2_s2_c1",
        label: "단순 확산(Simple Diffusion)",
        nodes: [
          {
            text: "단순 확산: 농도 기울기(Concentration Gradient)를 따른 자발적 이동(고농도→저농도)",
          },
          {
            text: "이동 물질: 작고 비극성(소수성) 분자",
            children: [
              { text: "O₂, CO₂, N₂" },
              { text: "지용성 물질: 스테로이드 호르몬, 에탄올, 벤젠" },
            ],
          },
          {
            text: "특징",
            children: [
              { text: "ATP 불필요 (수동 수송)" },
              { text: "막단백질 불필요 — 인지질 이중층 직접 통과" },
              { text: "포화 현상 없음(촉진 확산과 구별점)" },
            ],
          },
          {
            text: "속도 영향 요인: 농도 차이↑, 온도↑, 막 표면적↑ → 속도↑",
          },
          {
            text: "대표 예: 폐포→혈액 O₂ 이동, 혈액→폐포 CO₂ 이동",
          },
          {
            text: "동적 평형: 농도 차이 소멸 시 순이동(Net Movement) 정지, 분자 무작위 운동은 계속",
          },
        ],
      },
      {
        id: "bio_ch2_s2_c2",
        label: "촉진 확산(Facilitated Diffusion)",
        nodes: [
          {
            text: "촉진 확산: 수송 단백질 도움으로 농도 기울기를 따라 이동",
          },
          {
            text: "이동 물질: 크고 극성인 분자(포도당, 아미노산, 과당) 및 이온(Na⁺, K⁺, Cl⁻, Ca²⁺)",
          },
          {
            text: "수송 단백질 종류",
            children: [
              {
                text: "채널 단백질(Channel Protein): 수성 통로 제공",
                children: [
                  { text: "아쿠아포린(Aquaporin): 물 채널" },
                  { text: "이온 채널: 리간드 개폐, 전압 개폐 등" },
                ],
              },
              {
                text: "운반체 단백질(Carrier Protein): 기질 결합 → 구조 변화 → 이동",
              },
            ],
          },
          {
            text: "특징",
            children: [
              { text: "ATP 불필요(수동 수송)" },
              { text: "포화 현상(Saturation): 수송 단백질 수 한정 → 속도 상한 존재" },
              { text: "그래프: 쌍곡선(단순 확산은 직선)" },
            ],
          },
          {
            text: "GLUT(Glucose Transporter)",
            children: [
              { text: "GLUT1: 적혈구, 뇌" },
              { text: "GLUT2: 간, 이자 β세포" },
              { text: "GLUT4: 근육, 지방(인슐린에 의해 세포막으로 이동)" },
              { text: "당뇨병: 인슐린 부족 → GLUT4 이동 불가 → 혈당 상승" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s2_c3",
        label: "삼투(Osmosis)",
        nodes: [
          {
            text: "삼투: 반투과성 막을 통한 물의 이동(저용질→고용질, 고수분→저수분)",
          },
          {
            text: "삼투압(Osmotic Pressure)",
            children: [
              { text: "용질 농도↑, 온도↑ → 삼투압↑" },
              { text: "반트호프 법칙: π = iMRT (i: 이온화 계수, M: 몰 농도, R: 기체 상수, T: 절대 온도)" },
            ],
          },
          {
            text: "장액성에 따른 세포 변화",
            children: [
              { text: "등장액(Isotonic): 물 출입 균형, 세포 형태 유지" },
              { text: "저장액(Hypotonic): 물 유입 → 팽창" },
              { text: "고장액(Hypertonic): 물 유출 → 수축" },
            ],
          },
          {
            text: "생체 내 삼투 현상",
            children: [
              { text: "식물 뿌리의 물 흡수" },
              { text: "신장 수분 재흡수(ADH → 아쿠아포린 발현 조절)" },
              { text: "담수 원생생물: 수축 액포(Contractile Vacuole)로 과잉 수분 배출" },
              { text: "바닷물 어류: 바닷물 섭취 + 아가미 염분 능동 배출(탈수 방지)" },
              { text: "담수 어류: 다량의 묽은 소변 배출(과잉 수분 제거)" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s2_c4",
        label: "동물세포와 식물세포에서의 삼투",
        nodes: [
          {
            text: "동물세포(세포벽 없음) — 삼투에 취약",
            children: [
              { text: "저장액: 물 유입 → 팽창 → 터짐(용혈, Hemolysis — 적혈구)" },
              { text: "고장액: 물 유출 → 쪼그라듦(Crenation)" },
              { text: "등장액: 형태 유지 — 생리식염수(0.9% NaCl)" },
            ],
          },
          {
            text: "식물세포(세포벽 있음)",
            children: [
              {
                text: "저장액: 물 유입 → 세포벽이 팽창 제한 → 팽압(Turgor Pressure) 발생",
                children: [
                  { text: "팽압 = 삼투압 - 벽압(Wall Pressure)" },
                  { text: "완전 팽윤 시: 팽압 = 벽압 → 물 순이동 정지" },
                  { text: "식물 줄기·잎의 형태 유지에 필수" },
                ],
              },
              {
                text: "고장액: 원형질 분리(Plasmolysis)",
                children: [
                  { text: "세포질 수축 → 세포막이 세포벽에서 분리" },
                  { text: "세포벽-원형질체 사이에 외부 용액 채워짐" },
                ],
              },
              { text: "다시 저장액: 원형질 복귀(Deplasmolysis)" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s2_c5",
        label: "능동 수송(Active Transport)",
        nodes: [
          {
            text: "능동 수송: ATP 에너지 사용, 농도 기울기 역행(저농도→고농도)",
          },
          {
            text: "Na⁺-K⁺ 펌프(Na⁺-K⁺ ATPase) — 대표적 예",
            children: [
              { text: "ATP 1분자 → Na⁺ 3개 세포 밖, K⁺ 2개 세포 안" },
              { text: "결과: 세포 내 Na⁺↓ K⁺↑ / 세포 외 Na⁺↑ K⁺↓" },
              {
                text: "역할",
                children: [
                  { text: "안정시 막전위(약 -70mV) 유지" },
                  { text: "흥분 전도, 근육 수축" },
                  { text: "삼투압 조절" },
                  { text: "2차 능동 수송의 에너지원" },
                ],
              },
            ],
          },
          {
            text: "2차 능동 수송(Secondary Active Transport)",
            children: [
              { text: "Na⁺ 농도 기울기 에너지 이용(직접 ATP 사용 X, 간접 의존)" },
              { text: "예: 소장 Na⁺-포도당 공동수송체(SGLT)" },
            ],
          },
          {
            text: "기타 능동 수송 예",
            children: [
              { text: "식물 뿌리의 무기 염류 능동 흡수" },
              { text: "위 벽세포 H⁺ 분비(H⁺-K⁺ ATPase → 위산 pH 1.5~2.5)" },
              { text: "신장 세뇨관 포도당 재흡수" },
            ],
          },
          {
            text: "핵심 구별: 막단백질(펌프) 필요 + ATP 소모 → 세포 사멸 시 즉시 정지",
          },
        ],
      },
      {
        id: "bio_ch2_s2_c6",
        label: "세포 내 섭취(Endocytosis)",
        nodes: [
          {
            text: "세포 내 섭취: 세포막 함입 → 소낭(Vesicle)으로 외부 물질 포획",
          },
          {
            text: "종류",
            children: [
              {
                text: "식세포 작용(Phagocytosis, '세포 먹기')",
                children: [
                  { text: "큰 고체 입자(세균, 세포 잔해) 섭취" },
                  { text: "위족(Pseudopod) → 식포(Phagosome) → 리소좀 융합 → 분해" },
                  { text: "대표: 백혈구(대식세포, 호중구)" },
                ],
              },
              {
                text: "음세포 작용(Pinocytosis, '세포 마시기')",
                children: [
                  { text: "액체 상태 물질의 비선택적 흡수" },
                ],
              },
              {
                text: "수용체 매개 세포 내 섭취(Receptor-Mediated Endocytosis)",
                children: [
                  { text: "특정 수용체 + 리간드(예: LDL 복합체) 결합" },
                  { text: "클라트린(Clathrin) 코팅 소낭 형성 → 세포 내 유입" },
                  { text: "고도로 특이적인 과정" },
                ],
              },
            ],
          },
          {
            text: "공통점: ATP 필요, 세포골격(액틴) 재배열 동반",
          },
          {
            text: "의학적 중요성",
            children: [
              { text: "가족성 고콜레스테롤혈증: LDL 수용체 유전적 결함 → 동맥경화증 위험↑" },
              { text: "브라운·골드스타인: 1985년 노벨 생리의학상 수상" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s2_c7",
        label: "세포 외 배출(Exocytosis)",
        nodes: [
          {
            text: "세포 외 배출: 분비 소낭이 세포막과 융합 → 내용물 세포 밖 방출",
          },
          {
            text: "과정: 골지체 트랜스 면 → 분비 소낭 → 세포골격(미세소관+모터 단백질) 이동 → 세포막 융합",
          },
          {
            text: "대표 예",
            children: [
              { text: "소화 효소 분비(이자 외분비 세포)" },
              { text: "인슐린 분비(이자 β세포)" },
              { text: "신경 전달 물질 분비(시냅스 소포 → 아세틸콜린)" },
              { text: "점액 분비(배상세포)" },
            ],
          },
          {
            text: "분비 유형",
            children: [
              { text: "구성적 분비(Constitutive): 연속적" },
              { text: "조절적 분비(Regulated): 신호에 의해 촉발" },
            ],
          },
          {
            text: "막 재순환(Membrane Recycling): 소낭 막이 세포막에 합류 → 면적 일정 유지",
          },
          {
            text: "시냅스에서의 조절적 엑소사이토시스",
            children: [
              { text: "활동 전위 → 전압 개폐 Ca²⁺ 채널 → Ca²⁺ 유입" },
              { text: "Ca²⁺ → SNARE 단백질 매개 소포 융합 → 신경 전달 물질 방출" },
              { text: "보툴리눔 독소(보톡스): SNARE 절단 → 엑소사이토시스 차단 → 근육 마비" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s2_c8",
        label: "물질 이동 방식 종합 비교",
        nodes: [
          {
            text: "수동 수송(Passive Transport): 농도 기울기(고→저), ATP 불필요",
            children: [
              {
                text: "단순 확산",
                children: [
                  { text: "막단백질 X, 포화 현상 X" },
                  { text: "작고 비극성 분자(O₂, CO₂)" },
                ],
              },
              {
                text: "촉진 확산",
                children: [
                  { text: "채널·운반체 단백질 필요, 포화 현상 O" },
                  { text: "크고 극성 분자·이온(포도당, Na⁺)" },
                ],
              },
              {
                text: "삼투",
                children: [
                  { text: "물이 반투과성 막 통해 저용질→고용질 이동" },
                ],
              },
            ],
          },
          {
            text: "능동 수송(Active Transport): 농도 기울기 역행(저→고), ATP 필요",
            children: [
              { text: "운반체 단백질(펌프) 필수" },
              { text: "예: Na⁺-K⁺ ATPase" },
            ],
          },
          {
            text: "대량 수송(Bulk Transport): 소낭 매개, ATP 필요",
            children: [
              { text: "세포 내 섭취(Endocytosis): 세포 밖→안" },
              { text: "세포 외 배출(Exocytosis): 세포 안→밖" },
            ],
          },
          {
            text: "촉진 확산 vs 능동 수송 구별 핵심",
            children: [
              { text: "촉진 확산: 고→저, ATP X" },
              { text: "능동 수송: 저→고, ATP O" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s2_c9",
        label: "원형질 분리와 용혈 실험",
        nodes: [
          {
            text: "원형질 분리(Plasmolysis) 실험 — 식물세포(양파 표피)",
            children: [
              { text: "고장액(설탕물, NaCl) 투입 → 물 유출 → 세포막이 세포벽에서 분리" },
              { text: "세포벽-원형질막 사이에 고장액 채워짐(세포벽 투과성 높음)" },
              { text: "저장액(증류수) 투입 → 원형질 복귀(Deplasmolysis)" },
              { text: "보라색 양파 사용 → 안토시아닌으로 수축 선명 관찰" },
              { text: "한계 원형질 분리 농도: 원형질 분리가 시작되는 최소 고장액 농도" },
            ],
          },
          {
            text: "용혈(Hemolysis) 실험 — 동물세포(적혈구)",
            children: [
              { text: "저장액(증류수): 물 유입 → 팽창 → 터짐(용혈)" },
              { text: "고장액: 물 유출 → 수축(Crenation)" },
              { text: "등장액(0.9% NaCl): 형태 유지" },
            ],
          },
          {
            text: "핵심 비교: 저장액에서 식물세포(세포벽 → 안 터짐) vs 동물세포(터짐)",
          },
          {
            text: "의료 응용: 수혈·정맥주사 시 등장액 사용 필수(0.9% NaCl, 5% 포도당)",
            children: [
              { text: "용혈·수축 방지 목적" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "bio_ch2_s3",
    title: "효소",
    summary:
      "효소의 정의와 구조, 작용 원리, 효소 활성에 영향을 주는 요인, 저해제의 종류, 주요 효소의 예, 효소 반응 속도론을 이해한다.",
    notes: [
      {
        id: "bio_ch2_s3_c1",
        label: "효소의 정의와 구조",
        nodes: [
          {
            text: "효소(Enzyme): 생체 내 화학 반응 속도를 촉진하는 생체 촉매(Biological Catalyst)",
          },
          {
            text: "구성",
            children: [
              { text: "대부분 단백질(Protein)" },
              { text: "예외: 리보자임(Ribozyme) — 촉매 활성 RNA" },
            ],
          },
          {
            text: "단백질 효소의 구조",
            children: [
              { text: "주효소(Apoenzyme): 단백질 부분" },
              {
                text: "보조인자(Cofactor)",
                children: [
                  { text: "무기 보조인자: Zn²⁺, Fe²⁺, Mg²⁺, Cu²⁺, Mn²⁺" },
                  { text: "조효소(Coenzyme): NAD⁺, FAD, 코엔자임A, 비오틴(유기 분자)" },
                ],
              },
              { text: "전효소(Holoenzyme) = 주효소 + 보조인자 → 완전한 촉매 활성" },
            ],
          },
          {
            text: "핵심 작용: 활성화 에너지(Activation Energy) 낮춤",
            children: [
              { text: "반응 평형(Equilibrium)과 자유에너지 변화(ΔG)는 불변" },
            ],
          },
          {
            text: "비타민과 조효소 관계",
            children: [
              { text: "비타민 B₃(니아신) → NAD⁺ 전구체" },
              { text: "비타민 B₂(리보플라빈) → FAD 전구체" },
              { text: "비타민 B₁(티아민) → TPP 전구체" },
            ],
          },
          {
            text: "리보자임 예시",
            children: [
              { text: "리보솜 rRNA(펩티딜 전이효소 활성)" },
              { text: "자기 스플라이싱(Self-Splicing) RNA" },
              { text: "RNA 세계 가설(RNA World Hypothesis)의 근거" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s3_c2",
        label: "활성화 에너지와 효소의 작용",
        nodes: [
          {
            text: "활성화 에너지(Ea): 반응물 → 전이 상태(Transition State)에 필요한 최소 에너지",
          },
          {
            text: "효소의 작용 원리",
            children: [
              { text: "기질 결합 → 전이 상태 안정화(Stabilization) → Ea 낮춤" },
              { text: "체내 조건(약 37°C, 상압)에서 빠른 반응 가능" },
            ],
          },
          {
            text: "예: 카탈레이스(Catalase)",
            children: [
              { text: "H₂O₂ 분해 반응 속도 약 10⁸배(1억 배) 가속" },
              { text: "무기 촉매(MnO₂)보다 효율 훨씬 높음" },
            ],
          },
          {
            text: "효소의 촉매 특성",
            children: [
              { text: "반응 전후 자신 불변 → 소량으로 반복 사용" },
              { text: "Ea만 낮출 뿐 ΔG(자유에너지 변화)는 불변" },
              { text: "정반응·역반응 Ea 동시 낮춤 → 평형 도달 속도만 가속, 평형 위치 불변" },
              { text: "발열 반응(ΔG<0)과 흡열 반응 모두 촉매 가능" },
            ],
          },
          {
            text: "시험 포인트: 에너지 도표에서 효소 유무에 따른 Ea 차이 비교",
          },
        ],
      },
      {
        id: "bio_ch2_s3_c3",
        label: "효소-기질 복합체와 유도 적합 모델",
        nodes: [
          {
            text: "활성 부위(Active Site): 효소 표면의 특정 부위, 기질과 상보적 3차원 구조",
          },
          {
            text: "효소-기질 복합체(ES Complex): 기질이 활성 부위에 결합한 상태",
          },
          {
            text: "결합 모델",
            children: [
              {
                text: "자물쇠-열쇠 모델(Lock-and-Key, 피셔 제안)",
                children: [
                  { text: "활성 부위와 기질 구조가 정확히 일치" },
                ],
              },
              {
                text: "유도 적합 모델(Induced Fit, 코슐랜드 제안) — 현재 주류",
                children: [
                  { text: "기질 접근 → 효소 구조 미세 변형(Conformational Change)" },
                  { text: "변형된 구조가 반응 촉진" },
                ],
              },
            ],
          },
          {
            text: "반응 과정: 기질 결합 → 반응 → 생성물(Product) 분리 → 효소 원래 구조 복귀",
          },
          {
            text: "회전수(Turnover Number): 효소 1분자가 단위 시간당 처리하는 기질 수",
            children: [
              { text: "카탈레이스: 초당 약 4,000만 분자 처리" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s3_c4",
        label: "효소의 특성 — 기질 특이성과 재사용",
        nodes: [
          {
            text: "기질 특이성(Substrate Specificity): 각 효소가 특정 기질에만 결합·촉매",
            children: [
              { text: "활성 부위의 아미노산 배열, 전하, 크기, 형태가 특정 기질에만 적합" },
            ],
          },
          {
            text: "기질 특이성 예시",
            children: [
              { text: "아밀레이스: 녹말의 α-1,4 글리코시드 결합만 분해" },
              { text: "펩신: 단백질 펩타이드 결합만 분해" },
              { text: "수크레이스: 설탕 → 포도당 + 과당" },
            ],
          },
          {
            text: "재사용성: 반응 후 구조 불변 → 반복 사용",
            children: [
              { text: "탄산 탈수효소: 1초에 약 100만 개 CO₂ 분자 처리" },
            ],
          },
          {
            text: "반응 특이성: 같은 기질에도 특정 종류의 반응만 촉매",
          },
          {
            text: "의약품 개발 응용",
            children: [
              { text: "아스피린: COX 효소 비가역적 저해 → 프로스타글란딘 억제 → 진통·소염" },
              { text: "HIV 프로테아제 저해제: HIV 프로테아제 선택적 경쟁 저해 → 바이러스 증식 차단" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s3_c5",
        label: "온도와 효소 활성",
        nodes: [
          {
            text: "온도-반응 속도 그래프: 종형(Bell-Shaped) 곡선",
          },
          {
            text: "최적 온도(Optimum Temperature) 이하",
            children: [
              { text: "온도↑ → 분자 운동 활발 → 충돌 빈도↑ → 반응 속도↑" },
              { text: "Q₁₀ ≈ 2 (10°C 상승 시 반응 속도 약 2배)" },
            ],
          },
          {
            text: "최적 온도 초과: 변성(Denaturation)",
            children: [
              { text: "수소 결합, 이온 결합, 소수성 상호작용 파괴 → 입체 구조 변형" },
              { text: "활성 부위 형태 변형 → 반응 속도 급감" },
              { text: "대부분 비가역적 변성(달걀 프라이 비유)" },
            ],
          },
          {
            text: "사람 체내 효소 최적 온도: 약 35~40°C(체온 근처)",
          },
          {
            text: "저온에서의 효소",
            children: [
              { text: "변성 안 됨, 분자 운동 느림 → 속도 감소" },
              { text: "온도 올리면 활성 회복(가역적 비활성화)" },
              { text: "냉장(4°C)/냉동(-18°C) 보관 원리" },
            ],
          },
          {
            text: "내열성 효소",
            children: [
              { text: "호열성 세균 효소: 70~80°C 최적 활성" },
              { text: "Taq DNA 중합효소(Thermus aquaticus 유래): 95°C 활성 유지" },
              { text: "PCR(중합효소 연쇄 반응) 기술에 핵심 사용" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s3_c6",
        label: "pH와 효소 활성",
        nodes: [
          {
            text: "효소마다 고유한 최적 pH(Optimum pH) 존재",
          },
          {
            text: "최적 pH 벗어남 → 이온 결합·수소 결합 파괴 → 입체 구조 변성",
            children: [
              { text: "활성 부위 아미노산(히스티딘, 아스파르트산 등) 이온화 상태 변화" },
            ],
          },
          {
            text: "주요 효소별 최적 pH(시험 빈출)",
            children: [
              { text: "펩신(위): 최적 pH 약 2(강산성) — 위산(HCl) 환경" },
              { text: "트립신(소장): 최적 pH 약 8(약염기성) — 이자액(NaHCO₃) 중화 환경" },
              { text: "침 아밀레이스(구강): 최적 pH 약 6.8~7.0(중성)" },
              { text: "리소좀 효소: 최적 pH 약 5.0(약산성)" },
              { text: "세포질 효소: pH 7 부근" },
            ],
          },
          {
            text: "체내 pH 항상성의 중요성",
            children: [
              { text: "혈액 pH 7.35~7.45: 탄산-탄산수소이온 완충계(H₂CO₃/HCO₃⁻)" },
              { text: "범위 이탈(산증/알칼리증) → 효소 기능 저해 → 생명 위험" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s3_c7",
        label: "기질 농도와 효소 활성",
        nodes: [
          {
            text: "효소 양 일정 + 기질 농도↑ → 반응 속도↑ → 최대 반응 속도(Vmax) 수렴",
          },
          {
            text: "포화 현상(Saturation): 모든 효소 활성 부위가 기질로 포화",
          },
          {
            text: "미카엘리스 상수(Km)",
            children: [
              { text: "정의: ½ Vmax 속도를 나타내는 기질 농도" },
              { text: "Km 작을수록 효소-기질 친화력(Affinity) 높음" },
              { text: "효소 양 증가 → Vmax↑, Km 불변" },
            ],
          },
          {
            text: "미카엘리스-멘텐 동역학",
            children: [
              { text: "식: V = Vmax[S] / (Km + [S])" },
              { text: "[S] << Km: V ≈ Vmax[S]/Km (1차 반응)" },
              { text: "[S] >> Km: V ≈ Vmax (0차 반응)" },
            ],
          },
          {
            text: "시험 포인트: 기질 농도-반응 속도 그래프에서 Vmax, Km 판독",
          },
        ],
      },
      {
        id: "bio_ch2_s3_c8",
        label: "경쟁적 저해와 비경쟁적 저해",
        nodes: [
          {
            text: "효소 저해제(Enzyme Inhibitor): 효소 활성 감소 물질",
          },
          {
            text: "경쟁적 저해(Competitive Inhibition)",
            children: [
              { text: "저해제가 기질과 유사 → 활성 부위에 기질 대신 결합" },
              { text: "기질 농도 충분히 높이면 저해 극복 가능" },
              { text: "Vmax 불변, Km 증가" },
              { text: "예: 말론산이 숙신산 탈수소효소의 숙신산과 경쟁" },
            ],
          },
          {
            text: "비경쟁적 저해(Non-competitive Inhibition)",
            children: [
              { text: "저해제가 알로스테릭 부위에 결합 → 효소 구조 변형" },
              { text: "기질 농도 높여도 극복 불가" },
              { text: "Vmax 감소, Km 불변" },
            ],
          },
          {
            text: "비가역적 저해(Irreversible Inhibition)",
            children: [
              { text: "저해제가 효소에 공유 결합 → 영구 불활성화" },
              { text: "예: 유기인제 농약 → 아세틸콜린에스테라제 비가역 저해" },
            ],
          },
          {
            text: "시험 포인트: 경쟁적/비경쟁적 저해의 Vmax, Km 변화 그래프 구별",
          },
        ],
      },
      {
        id: "bio_ch2_s3_c9",
        label: "주요 효소의 예",
        nodes: [
          {
            text: "소화 효소",
            children: [
              { text: "아밀레이스(Amylase): 녹말→엿당, 침샘(pH 6.8~7.0) + 이자(pH 7~8)" },
              { text: "펩신(Pepsin): 단백질 분해, 위(pH 2), 펩시노겐→위산(HCl)으로 활성화" },
              { text: "트립신(Trypsin): 단백질 분해, 소장(pH 8), 트립시노겐→엔테로키나아제로 활성화" },
              { text: "리파아제(Lipase): 지방→지방산+글리세롤, 이자 분비, 담즙산 유화 후 작용" },
              { text: "수크레이스(Sucrase): 설탕→포도당+과당" },
              { text: "락테이스(Lactase): 유당→포도당+갈락토스" },
            ],
          },
          {
            text: "세포 내 효소",
            children: [
              { text: "카탈레이스(Catalase): H₂O₂→H₂O+O₂, 간 퍼옥시좀(pH 7)" },
              { text: "DNA 중합효소: DNA 복제 시 뉴클레오타이드 상보적 첨가" },
              { text: "RNA 중합효소: 전사 시 DNA→mRNA 합성" },
              { text: "헥소키나아제(Hexokinase): 해당 과정 1단계, 포도당→포도당-6-인산" },
              { text: "탄산 탈수효소: CO₂+H₂O⇌H₂CO₃, 혈액 CO₂ 운반·pH 조절" },
            ],
          },
          {
            text: "셀룰레이스(Cellulase): 셀룰로스 분해",
            children: [
              { text: "인간 미보유 → 식이섬유 소화 불가" },
              { text: "반추 동물 위 미생물이 생산" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s3_c10",
        label: "효소 반응 속도 그래프 해석",
        nodes: [
          {
            text: "기질 농도([S])-반응 속도(V) 그래프: 직각 쌍곡선",
            children: [
              { text: "Vmax: 곡선이 수렴하는 최대 속도" },
              { text: "Km: ½ Vmax에 해당하는 [S] 값" },
            ],
          },
          {
            text: "저해제 존재 시 변화",
            children: [
              { text: "경쟁적 저해: Km↑(오른쪽 이동), Vmax 동일" },
              { text: "비경쟁적 저해: Vmax↓(아래 이동), Km 동일" },
            ],
          },
          {
            text: "효소 농도 2배 → Vmax 2배, Km 불변",
          },
          {
            text: "온도·pH 그래프: 최적점을 정점으로 한 종형(Bell-Shaped) 곡선",
          },
          {
            text: "라인위버-버크 플롯(Double Reciprocal Plot): 1/V 대 1/[S]",
            children: [
              { text: "y절편 = 1/Vmax" },
              { text: "x절편 = -1/Km" },
              { text: "경쟁적 저해: y절편 동일, x절편 변화" },
              { text: "비경쟁적 저해: y절편 변화, x절편 동일" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s3_c11",
        label: "알로스테릭 조절과 피드백 억제",
        nodes: [
          {
            text: "알로스테릭 조절: 활성 부위가 아닌 알로스테릭 부위에 조절 분자 결합",
          },
          {
            text: "조절 메커니즘",
            children: [
              { text: "활성제(Activator) → R 상태(Relaxed) 안정화 → 기질 친화력↑ → 활성↑" },
              { text: "저해제(Inhibitor) → T 상태(Tense) 안정화 → 기질 친화력↓ → 활성↓" },
            ],
          },
          {
            text: "알로스테릭 효소 특성: 다량체(Oligomer), 소단위체 간 협동성(Cooperativity)",
          },
          {
            text: "피드백 억제(Feedback Inhibition)",
            children: [
              { text: "최종 산물이 경로 초기 효소(첫 번째)를 알로스테릭 저해" },
              { text: "예: 이소류신 → 트레오닌 탈아미나아제 저해 → 이소류신 과다 생산 방지" },
              { text: "ATP/ADP 비율에 의한 해당 과정·TCA 회로 조절" },
            ],
          },
          {
            text: "생물학적 의의: 대사 산물량 항상성(Homeostasis) 유지, 에너지 낭비 방지",
          },
        ],
      },
      {
        id: "bio_ch2_s3_c12",
        label: "효소의 분류와 명명법",
        nodes: [
          {
            text: "국제생화학연합(IUBMB) 6대 분류",
            children: [
              {
                text: "1. 산화환원효소(Oxidoreductase): 산화-환원 반응",
                children: [
                  { text: "탈수소효소(젖산 탈수소효소, 숙신산 탈수소효소)" },
                  { text: "산화효소(Oxidase), 환원효소(Reductase)" },
                ],
              },
              {
                text: "2. 전이효소(Transferase): 작용기 전달",
                children: [
                  { text: "키나아제(Kinase, 인산기 전이)" },
                  { text: "아미노전이효소(Aminotransferase)" },
                ],
              },
              {
                text: "3. 가수분해효소(Hydrolase): 물로 결합 분해",
                children: [
                  { text: "소화 효소(아밀레이스, 펩신, 리파아제)" },
                  { text: "포스파타아제(Phosphatase)" },
                ],
              },
              {
                text: "4. 분해효소(Lyase): 가수분해·산화 없이 결합 절단",
                children: [
                  { text: "탈탄산효소(Decarboxylase), 알돌레이스(Aldolase)" },
                ],
              },
              {
                text: "5. 이성질화효소(Isomerase): 분자 내 원자 재배열",
                children: [
                  { text: "인산포도당 이성질화효소" },
                ],
              },
              {
                text: "6. 합성효소(Ligase): ATP 에너지로 두 분자 공유 결합",
                children: [
                  { text: "DNA 연결효소(DNA Ligase)" },
                  { text: "아세틸CoA 카르복실라아제" },
                ],
              },
            ],
          },
          {
            text: "명명법: 기질 이름 + 반응 유형 + '-ase(아제)'",
            children: [
              { text: "예: 젖산 탈수소효소(Lactate Dehydrogenase)" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "bio_ch2_s4",
    title: "세포와 에너지",
    summary:
      "ATP의 구조와 기능, 세포 호흡(해당 과정, TCA 회로, 전자 전달계), 발효, 광합성의 과정, 에너지 수지, 호흡과 광합성의 비교를 이해한다.",
    notes: [
      {
        id: "bio_ch2_s4_c1",
        label: "ATP의 구조와 기능",
        nodes: [
          {
            text: "ATP(Adenosine Triphosphate): 아데닌 + 리보스(아데노신) + 인산기 3개",
          },
          {
            text: "고에너지 인산 결합(Phosphoanhydride Bond)",
            children: [
              { text: "세 번째 인산기 가수분해 시 약 7.3 kcal/mol(30.5 kJ/mol) 방출" },
              { text: "ATP → ADP + Pi" },
            ],
          },
          {
            text: "ATP 사용 용도",
            children: [
              { text: "근육 수축(미오신 ATPase)" },
              { text: "능동 수송(Na⁺-K⁺ 펌프)" },
              { text: "물질 합성(동화 작용)" },
              { text: "세포 분열, 발광(반딧불이), 체온 유지" },
            ],
          },
          {
            text: "ATP 재순환(Turnover)",
            children: [
              { text: "하루 약 40~75kg ATP 합성·소모" },
              { text: "체내 ATP 총량: 약 50g → 빠르게 재순환" },
              { text: "인산화: ADP + Pi → ATP (세포 호흡·광합성 에너지 이용)" },
            ],
          },
          {
            text: "ATP = 에너지의 '화폐(Energy Currency)'",
          },
          {
            text: "기질 인산화(Phosphorylation) 역할: 기질 구조 변화 → 반응성↑",
            children: [
              { text: "예: 포도당 → 포도당-6-인산(세포 밖 유출 방지 + 불안정화)" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s4_c2",
        label: "세포 호흡의 개요",
        nodes: [
          {
            text: "세포 호흡(Cellular Respiration): 유기물을 O₂로 산화 분해 → ATP 저장(이화 작용)",
          },
          {
            text: "총괄 반응식: C₆H₁₂O₆ + 6O₂ + 6H₂O → 6CO₂ + 12H₂O + 약 30~32ATP",
          },
          {
            text: "4단계 과정",
            children: [
              { text: "1단계: 해당 과정(Glycolysis) — 세포질" },
              { text: "2단계: 피루브산 산화 — 미토콘드리아 기질" },
              { text: "3단계: TCA 회로 — 미토콘드리아 기질" },
              { text: "4단계: 전자 전달계 + 산화적 인산화 — 미토콘드리아 내막" },
            ],
          },
          {
            text: "에너지 전달 경로",
            children: [
              { text: "포도당 → NADH, FADH₂(고에너지 전자 운반체)에 임시 저장" },
              { text: "NADH, FADH₂ → 전자 전달계에서 산화적 인산화 → 대량 ATP" },
            ],
          },
          {
            text: "단계적 에너지 방출의 장점: 효율적 ATP 포획(일시 방출 시 열 손실)" },
          {
            text: "에너지 흐름 요약: 탄소(C)→CO₂, 수소(H)→NADH/FADH₂→H₂O, 에너지→ATP",
          },
        ],
      },
      {
        id: "bio_ch2_s4_c3",
        label: "해당 과정(Glycolysis)",
        nodes: [
          {
            text: "해당 과정: 세포질에서 포도당(C₆) → 피루브산(C₃) 2분자, 10단계 효소 반응",
          },
          {
            text: "특징",
            children: [
              { text: "O₂ 불필요(무산소 과정)" },
              { text: "원핵·진핵세포 공통 — 가장 보편적 대사 경로" },
            ],
          },
          {
            text: "에너지 투자기(1~5단계)",
            children: [
              { text: "ATP 2분자 투입" },
              { text: "포도당 → 과당-1,6-이인산 → G3P(글리세르알데히드 3-인산) 2분자" },
            ],
          },
          {
            text: "에너지 회수기(6~10단계)",
            children: [
              { text: "G3P 산화 → 2NADH 생성(NAD⁺ → NADH)" },
              { text: "기질 수준 인산화 → 4ATP 생성" },
            ],
          },
          {
            text: "순수익: 2ATP + 2NADH (포도당 1분자당)",
          },
          {
            text: "조절 효소",
            children: [
              {
                text: "PFK(포스포프럭토키나아제) — 핵심 조절",
                children: [
                  { text: "ATP↑ → 억제, AMP↑ → 활성화" },
                  { text: "시트르산 축적 → 억제(교차 경로 조절)" },
                ],
              },
              { text: "헥소키나아제(1단계), 피루브산 키나아제(10단계)" },
            ],
          },
          {
            text: "해당 과정 NADH의 운명",
            children: [
              { text: "산소 있음: 미토콘드리아로 전달 → 전자 전달계 ATP 합성" },
              { text: "산소 없음: 발효를 통해 NAD⁺로 재산화" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s4_c4",
        label: "피루브산 산화와 TCA 회로",
        nodes: [
          {
            text: "피루브산 산화(미토콘드리아 기질)",
            children: [
              { text: "피루브산(C₃) → 아세틸 CoA(C₂) + CO₂ + NADH" },
              { text: "피루브산 탈수소효소 복합체 촉매" },
              { text: "포도당 1분자 기준: 2CO₂, 2NADH 생성" },
            ],
          },
          {
            text: "TCA 회로(시트르산 회로, 크렙스 회로, Hans Krebs 발견)",
            children: [
              { text: "장소: 미토콘드리아 기질" },
              { text: "아세틸 CoA(C₂) + 옥살아세트산(OAA, C₄) → 시트르산(C₆)" },
              { text: "8단계 순환적 효소 반응" },
            ],
          },
          {
            text: "TCA 회로 1회전당 생성물",
            children: [
              { text: "CO₂ 2분자(탈탄산)" },
              { text: "NADH 3분자, FADH₂ 1분자(산화)" },
              { text: "GTP(= ATP) 1분자(기질 수준 인산화)" },
            ],
          },
          {
            text: "포도당 1분자 기준(2회전): 4CO₂ + 6NADH + 2FADH₂ + 2ATP",
          },
          {
            text: "조절 효소: ATP/NADH↑ → 억제, NAD⁺/ADP↑ → 활성화",
            children: [
              { text: "시트르산 합성효소, 이소시트르산 탈수소효소, α-케토글루타르산 탈수소효소" },
            ],
          },
          {
            text: "양쪽성 경로(Amphibolic Pathway): 이화 + 동화 연결",
            children: [
              { text: "옥살아세트산, α-케토글루타르산 → 아미노산 합성 전구체" },
              { text: "숙시닐 CoA → 헴(Heme) 합성 출발 물질" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s4_c5",
        label: "전자 전달계와 산화적 인산화",
        nodes: [
          {
            text: "전자 전달계(ETC): 미토콘드리아 내막의 단백질 복합체(Complex I~IV)",
          },
          {
            text: "전자 흐름 경로",
            children: [
              { text: "NADH → Complex I → 유비퀴논(CoQ)" },
              { text: "FADH₂ → Complex II → 유비퀴논(CoQ)" },
              { text: "CoQ → Complex III → 시토크롬 c → Complex IV → O₂(최종 전자 수용체)" },
              { text: "O₂ + 4e⁻ + 4H⁺ → 2H₂O" },
            ],
          },
          {
            text: "양성자 구동력(Proton-Motive Force) 형성",
            children: [
              { text: "Complex I, III, IV가 H⁺을 기질→막간 공간으로 펌핑" },
              { text: "H⁺ 농도 기울기 형성" },
            ],
          },
          {
            text: "화학 삼투(Chemiosmosis) — 피터 미첼(1961년 제안, 1978년 노벨 화학상)",
            children: [
              { text: "H⁺이 ATP 합성 효소(ATP Synthase) 통해 기질로 복귀" },
              { text: "ATP 합성 효소 = 분자 회전 모터(F₀ + F₁ 구조)" },
              { text: "약 4H⁺ 통과당 1ATP 합성" },
            ],
          },
          {
            text: "ATP 생성량",
            children: [
              { text: "NADH 1분자당 약 2.5ATP" },
              { text: "FADH₂ 1분자당 약 1.5ATP" },
              { text: "포도당 1분자당 약 26~28ATP(전체 ATP의 85~90%)" },
            ],
          },
          {
            text: "저해제와 탈공역제",
            children: [
              { text: "시안화물: Complex IV 억제" },
              { text: "로테논: Complex I 억제" },
              { text: "올리고마이신: ATP 합성 효소 직접 저해" },
              { text: "DNP(탈공역제): H⁺ 우회 → ATP 대신 열 방출" },
              { text: "갈색 지방 써모제닌(UCP1): 유사 원리의 체온 발생" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s4_c6",
        label: "발효(Fermentation)",
        nodes: [
          {
            text: "발효: 무산소 조건에서 피루브산의 불완전 전환",
          },
          {
            text: "생물학적 목적: NAD⁺ 재생 → 해당 과정 지속 가능",
            children: [
              { text: "NADH→NAD⁺ 재산화 안 되면 해당 6단계 정지 → ATP 생산 중단" },
            ],
          },
          {
            text: "알코올 발효(Alcoholic Fermentation)",
            children: [
              { text: "피루브산 → 아세트알데히드 + CO₂ → 에탄올(C₂H₅OH)" },
              { text: "NADH → NAD⁺ 재산화" },
              { text: "수행 생물: 효모(Saccharomyces cerevisiae), 일부 식물 세포" },
              { text: "응용: 맥주, 와인 제조(에탄올), 빵(CO₂가 반죽 부풀림)" },
            ],
          },
          {
            text: "젖산 발효(Lactic Acid Fermentation)",
            children: [
              { text: "피루브산 → 젖산(C₃H₆O₃), CO₂ 미발생" },
              { text: "수행: 격렬한 운동 시 근육 세포, 젖산균(Lactobacillus)" },
              { text: "응용: 요구르트, 김치 발효" },
              { text: "젖산 처리: 간으로 이동 → 코리 회로(Cori Cycle)로 포도당 재전환" },
            ],
          },
          {
            text: "에너지 효율: 해당 과정 2ATP만 생성(포도당 에너지의 약 2%)",
            children: [
              { text: "세포 호흡(약 30~32ATP)에 비해 매우 낮음" },
            ],
          },
          {
            text: "알코올 vs 젖산 발효 비교",
            children: [
              { text: "공통: NAD⁺ 재생 목적" },
              { text: "알코올: CO₂ 발생, 최종 산물 에탄올(2탄소)" },
              { text: "젖산: CO₂ 미발생, 최종 산물 젖산(3탄소)" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s4_c7",
        label: "광합성 — 명반응(Light Reaction)",
        nodes: [
          {
            text: "광합성: 빛에너지 → 화학 에너지(포도당) 전환, 동화 작용(Anabolism)",
          },
          {
            text: "총괄 반응식: 6CO₂ + 12H₂O → C₆H₁₂O₆ + 6O₂ + 6H₂O",
          },
          {
            text: "명반응(Light-Dependent Reaction): 틸라코이드 막에서 진행",
          },
          {
            text: "비순환적 전자 흐름(Non-Cyclic Electron Flow)",
            children: [
              { text: "광계 II(PSII, P680): 빛 흡수 → 고에너지 전자 방출" },
              { text: "전자 전달: Plastoquinone → Cytochrome b₆f → Plastocyanin" },
              { text: "에너지로 H⁺을 스트로마→틸라코이드 내강 펌핑" },
              { text: "광계 I(PSI, P700): 빛 재흡수 → 전자 에너지 보충" },
              { text: "Ferredoxin → NADP⁺ 환원효소 → NADPH 생성" },
            ],
          },
          {
            text: "물의 광분해: H₂O → 2H⁺ + ½O₂ + 2e⁻",
            children: [
              { text: "광계 II 전자 보충" },
              { text: "O₂ 발생의 근원" },
            ],
          },
          {
            text: "광인산화(Photophosphorylation): H⁺ 농도 기울기 → ATP 합성 효소 → ATP 생성",
          },
        ],
      },
      {
        id: "bio_ch2_s4_c8",
        label: "광합성 — 암반응(캘빈 회로, Calvin Cycle)",
        nodes: [
          {
            text: "암반응(Calvin Cycle): 스트로마에서 ATP·NADPH 이용 → CO₂ 고정 → G3P 합성",
          },
          {
            text: "3단계 과정",
            children: [
              {
                text: "1단계 — 탄소 고정(Carbon Fixation)",
                children: [
                  { text: "CO₂ + RuBP(C₅) → RuBisCO 촉매 → 3-PGA(C₃) 2분자" },
                  { text: "RuBisCO: 지구상에서 가장 많은 효소" },
                ],
              },
              {
                text: "2단계 — 환원(Reduction)",
                children: [
                  { text: "ATP + NADPH → 3-PGA → G3P(C₃)" },
                  { text: "CO₂ 3분자 → G3P 6분자 중 1분자가 포도당 합성용" },
                ],
              },
              {
                text: "3단계 — RuBP 재생(Regeneration)",
                children: [
                  { text: "나머지 G3P 5분자 + ATP → RuBP 3분자 재생" },
                ],
              },
            ],
          },
          {
            text: "포도당 1분자 합성(CO₂ 6분자 고정): 18ATP + 12NADPH 소모",
          },
          {
            text: "캘빈 실험(Melvin Calvin, 1961년 노벨 화학상)",
            children: [
              { text: "¹⁴CO₂ → 클로렐라 → 크로마토그래피로 중간 산물 추적" },
            ],
          },
          {
            text: "광호흡(Photorespiration): RuBisCO가 O₂와 반응 → 탄소 낭비",
            children: [
              { text: "고온·건조 → 기공 폐쇄 → CO₂↓ O₂↑ 시 촉진" },
              {
                text: "극복 전략",
                children: [
                  { text: "C₄ 식물(옥수수, 사탕수수): PEP 카르복실라아제 → C₄ 화합물 → 유관속초세포" },
                  { text: "CAM 식물(선인장, 다육식물): 밤에 CO₂ 고정·저장 → 낮에 이용" },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s4_c9",
        label: "세포 호흡의 에너지 수지",
        nodes: [
          {
            text: "포도당 1분자 완전 산화 — 단계별 생성물",
            children: [
              { text: "해당 과정(세포질): 2ATP + 2NADH" },
              { text: "피루브산 산화(기질): 2NADH" },
              { text: "TCA 회로(기질, 2회전): 2ATP(GTP) + 6NADH + 2FADH₂" },
            ],
          },
          {
            text: "전자 전달계 ATP 변환",
            children: [
              { text: "총 NADH 10개 × 2.5 = 25ATP" },
              { text: "총 FADH₂ 2개 × 1.5 = 3ATP" },
              { text: "기질 수준 인산화: 4ATP" },
              { text: "총합: 약 30~32ATP" },
            ],
          },
          {
            text: "세포질 NADH 셔틀 시스템에 따른 차이",
            children: [
              { text: "말산-아스파르트산 셔틀(간, 심장): NADH 전달 → 2.5×2 = 5ATP → 총 32ATP" },
              { text: "글리세롤-3-인산 셔틀(골격근, 뇌): FADH₂ 전달 → 1.5×2 = 3ATP → 총 30ATP" },
            ],
          },
          {
            text: "에너지 효율",
            children: [
              { text: "포도당 총 에너지: 약 686kcal/mol" },
              { text: "ATP 30~32개 × 7.3kcal = 219~234kcal" },
              { text: "효율: 약 32~34%(나머지 열에너지로 체온 유지)" },
              { text: "자동차 내연기관(약 20~25%)보다 높음" },
            ],
          },
          {
            text: "시험 계산 요약: 해당(2+2) → 피루브산(2) → TCA(2+6+2) → ETC(10×2.5+2×1.5+4) ≈ 32ATP",
          },
        ],
      },
      {
        id: "bio_ch2_s4_c10",
        label: "호흡과 광합성의 비교",
        nodes: [
          {
            text: "에너지 전환 방향이 반대인 상보적 과정",
            children: [
              { text: "광합성: 빛에너지 → 화학 에너지(동화, 에너지 저장)" },
              { text: "세포 호흡: 화학 에너지 → ATP(이화, 에너지 방출)" },
            ],
          },
          {
            text: "반응물·생성물 관계",
            children: [
              { text: "광합성 반응물(CO₂+H₂O) = 세포 호흡 생성물" },
              { text: "세포 호흡 반응물(C₆H₁₂O₆+O₂) = 광합성 생성물" },
            ],
          },
          {
            text: "장소 비교",
            children: [
              { text: "광합성: 엽록체(틸라코이드 막 + 스트로마)" },
              { text: "세포 호흡: 미토콘드리아(기질 + 내막) + 세포질" },
            ],
          },
          {
            text: "수행 생물: 광합성(식물·조류·남세균) / 호흡(거의 모든 생물, 식물 포함)",
          },
          {
            text: "공통점: 전자 전달계 + 화학 삼투 → ATP 합성",
            children: [
              { text: "전자 운반체: NADPH(광합성) vs NADH(호흡)" },
            ],
          },
          {
            text: "H⁺ 펌핑 방향 차이",
            children: [
              { text: "광합성: 스트로마 → 틸라코이드 내강, ATP 합성은 스트로마 방향" },
              { text: "호흡: 기질 → 막간 공간, ATP 합성은 기질 방향" },
            ],
          },
          {
            text: "보상점(Compensation Point)",
            children: [
              { text: "광합성 속도 = 호흡 속도 → 겉보기 CO₂/O₂ 교환 = 0" },
              { text: "총광합성 = 겉보기 광합성 + 호흡 속도" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s4_c11",
        label: "광합성 색소",
        nodes: [
          {
            text: "광합성 색소: 틸라코이드 막 광계 복합체에 위치",
          },
          {
            text: "엽록소 a(Chlorophyll a) — 반응 중심 색소",
            children: [
              { text: "광계 I(P700), 광계 II(P680)에서 광화학 반응 직접 참여" },
              { text: "흡수: 청색광(약 430nm), 적색광(약 680nm)" },
              { text: "반사/투과: 녹색광(약 550nm) → 식물 녹색" },
            ],
          },
          {
            text: "엽록소 b(Chlorophyll b) — 안테나 색소",
            children: [
              { text: "흡수: 청색광(약 455nm), 적색광(약 645nm)" },
              { text: "에너지를 엽록소 a로 전달" },
              { text: "구조 차이: 측쇄기(-CH₃ vs -CHO)" },
            ],
          },
          {
            text: "카로티노이드(Carotenoid) — 보조 색소",
            children: [
              { text: "카로틴(β-Carotene, 주황색): 당근 색" },
              { text: "잔토필(Xanthophyll, 노란색)" },
              { text: "흡수: 청색~녹색광(약 400~500nm)" },
              { text: "기능: 에너지 전달 + 광보호(Photoprotection)" },
              { text: "가을 단풍: 엽록소 분해 → 카로티노이드 색 드러남" },
            ],
          },
          {
            text: "스펙트럼 비교",
            children: [
              { text: "흡수 스펙트럼(Absorption Spectrum): 색소별 흡수 파장" },
              { text: "작용 스펙트럼(Action Spectrum): 파장별 광합성 속도" },
              { text: "두 스펙트럼 유사 → 빛 흡수가 광합성에 직접 기여 증명" },
            ],
          },
          {
            text: "색소 분리: 크로마토그래피(TLC 등)",
            children: [
              { text: "Rf 값 = 색소 이동 거리 / 전개액 이동 거리" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s4_c12",
        label: "광합성에 영향을 미치는 요인",
        nodes: [
          {
            text: "한정 요인(Limiting Factor, 블랙먼의 법칙): 가장 부족한 요인이 속도 결정",
          },
          {
            text: "빛의 세기(Light Intensity)",
            children: [
              { text: "증가 → 명반응 속도↑ → 광합성↑" },
              { text: "광포화점(Light Saturation Point): 광계 엽록소 포화 → 더 이상 증가 X" },
              { text: "이후 CO₂ 농도나 온도가 한정 요인" },
            ],
          },
          {
            text: "CO₂ 농도",
            children: [
              { text: "증가 → RuBisCO 기질↑ → 캘빈 회로 속도↑" },
              { text: "대기 중 CO₂(약 0.04%)는 한정 요인 가능" },
              { text: "온실 CO₂ 농도 인위적 증가 → 수확량↑" },
            ],
          },
          {
            text: "온도",
            children: [
              { text: "효소 반응 속도에 영향" },
              { text: "최적 온도(25~35°C), 초과 시 효소 변성 → 감소" },
            ],
          },
          {
            text: "빛보상점(Light Compensation Point)",
            children: [
              { text: "광합성 속도 = 호흡 속도인 빛의 세기" },
              { text: "이하: 순 O₂ 소비 / 이상: 순 O₂ 방출" },
              { text: "양지식물: 빛보상점·광포화점 모두 높음" },
              { text: "음지식물: 빛보상점·광포화점 모두 낮음" },
            ],
          },
          {
            text: "빛의 파장(색)",
            children: [
              { text: "적색광·청색광에서 광합성 최고, 녹색광에서 최저" },
              { text: "엥겔만 실험: 해캄에 분광 비추기 → 호기성 세균 적색·청색 영역 밀집" },
            ],
          },
        ],
      },
      {
        id: "bio_ch2_s4_c13",
        label: "다양한 유기물의 세포 호흡 — 대사 경로의 연결",
        nodes: [
          {
            text: "포도당 외 유기물도 세포 호흡 에너지원 — 중간 대사산물로 진입",
          },
          {
            text: "지방(Lipid)의 분해",
            children: [
              { text: "리파아제 → 글리세롤 + 지방산" },
              { text: "글리세롤 → DHAP/G3P → 해당 과정 합류" },
              {
                text: "지방산 → β-산화(미토콘드리아) → 아세틸 CoA(C₂) + NADH + FADH₂",
                children: [
                  { text: "아세틸 CoA → TCA 회로 진입" },
                ],
              },
              { text: "팔미트산(C₁₆) 완전 산화: 약 106ATP(포도당의 약 2배 효율/단위질량)" },
            ],
          },
          {
            text: "단백질(Protein)의 분해",
            children: [
              { text: "프로테아제 → 아미노산" },
              { text: "탈아미노화: 아미노기(-NH₂) 제거 → 암모니아(NH₃) → 간에서 요소(Urea) 전환 → 배출" },
              {
                text: "탄소 골격(Carbon Skeleton): 종류별 합류",
                children: [
                  { text: "피루브산, 아세틸 CoA, 옥살아세트산, α-케토글루타르산 등" },
                ],
              },
            ],
          },
          {
            text: "해당 과정·TCA 회로 = '대사의 교차로'",
            children: [
              { text: "이화: 다양한 유기물 분해 합류" },
              { text: "동화: 아미노산·지방산·뉴클레오타이드 합성 전구체 공급" },
              { text: "양쪽성 경로(Amphibolic Pathway)" },
            ],
          },
          {
            text: "포도당신생합성(Gluconeogenesis)",
            children: [
              { text: "젖산, 아미노산, 글리세롤 → 포도당(주로 간에서)" },
              { text: "혈당 유지에 기여" },
            ],
          },
          {
            text: "지방산 합성: 아세틸 CoA 출발, 세포질, NADPH 환원력 사용",
          },
        ],
      },
    ],
  },
];
