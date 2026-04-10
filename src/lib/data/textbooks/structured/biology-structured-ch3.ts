import type { StructuredSection } from "./ethics-structured-index";

/**
 * 생명과학I 제3장: 세포 분열과 유전 — 구조화 텍스트 (암기 친화)
 * 원본: biology-ch3.ts의 서술형 detail → 계층 트리 + 명사형 종결
 */
export const BIOLOGY_STRUCTURED_CH3: StructuredSection[] = [
  {
    id: "bio_ch3_s1",
    title: "세포 주기와 체세포 분열",
    summary:
      "세포 주기의 각 단계(간기와 분열기)를 이해하고, 체세포 분열의 과정과 의의를 학습한다. 세포 주기 조절 기구(검문점, 사이클린-CDK)와 이 조절이 무너졌을 때 발생하는 암까지 포함한다. DNA 상대량 그래프를 읽고 해석하는 능력도 기른다.",
    notes: [
      {
        id: "bio_ch3_s1_c1",
        label: "세포 주기의 개념",
        nodes: [
          {
            text: "세포 주기(Cell Cycle): 하나의 세포가 분열하여 두 개의 딸세포가 되기까지의 전체 과정",
          },
          {
            text: "구성",
            children: [
              { text: "간기(Interphase): 생장·DNA 복제 시기, 세포 주기의 약 90% 이상 차지" },
              { text: "분열기(M기, Mitotic Phase): 핵 분열(Karyokinesis) + 세포질 분열(Cytokinesis)" },
            ],
          },
          {
            text: "세포 종류별 주기 길이",
            children: [
              { text: "초기 배아세포(Embryonic Cell): 약 30분~1시간 (매우 짧음)" },
              { text: "장 상피세포(Intestinal Epithelial Cell): 약 12~24시간" },
              { text: "간세포(Hepatocyte): 약 1년 이상" },
              { text: "사람 체세포 평균: 약 24시간" },
            ],
          },
          {
            text: "G0기(G-zero Phase): 분열을 완전히 멈춘 세포의 휴지기",
            children: [
              { text: "성숙한 신경세포(Neuron), 골격근 세포, 적혈구 등이 해당" },
              { text: "세포 주기에서 나온 상태로, 분화된 기능 수행" },
              { text: "특별한 성장 인자(Growth Factor) 신호 없이는 세포 주기 재진입 불가" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s1_c2",
        label: "간기: G1기, S기, G2기",
        nodes: [
          {
            text: "G1기(Gap 1, 첫 번째 간격기)",
            children: [
              { text: "세포 활발히 생장, RNA·단백질·세포소기관 합성" },
              { text: "세포 주기에서 가장 가변적인 단계 — 주기 전체 길이 차이의 주요 요인" },
              { text: "급속 분열 세포: G1기 짧음 / 느린 분열 세포: G1기 김" },
            ],
          },
          {
            text: "S기(Synthesis Phase, 합성기)",
            children: [
              { text: "DNA 반보존적 복제 → 각 염색체가 두 개의 자매 염색분체(Sister Chromatids)로 구성" },
              { text: "히스톤 단백질 대량 합성, 새 DNA와 결합" },
              { text: "소요 시간: 약 6~8시간 (사람 세포)" },
            ],
          },
          {
            text: "G2기(Gap 2 Phase, 두 번째 간격기)",
            children: [
              { text: "분열 준비: 방추사 형성에 필요한 튜불린(Tubulin) 단백질 합성" },
              { text: "DNA 복제 오류 검사·수리" },
              { text: "소요 시간: 약 2~5시간" },
            ],
          },
          {
            text: "핵심 포인트: S기 후 DNA 양 2배, 염색체 수 변화 없음",
            children: [
              { text: "사람 체세포(2n=46): G1기 DNA 상대량 2 → S기 완료 후 상대량 4" },
              { text: "염색체 수는 여전히 46개 (2개의 염색분체가 동원체로 연결된 1개 염색체로 계수)" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s1_c3",
        label: "DNA 복제와 염색체 구조",
        nodes: [
          {
            text: "반보존적 복제(Semiconservative Replication)",
            children: [
              { text: "원래 이중 나선의 각 가닥이 주형(Template) → 상보적 새 가닥 합성" },
              { text: "딸 DNA: 구형 가닥 1개 + 신생 가닥 1개" },
              { text: "메셀슨-스탈(Meselson-Stahl) 실험(1958): 대장균 + 15N/14N 밀도 구배 원심분리로 증명" },
            ],
          },
          {
            text: "복제 원점(Origin of Replication)",
            children: [
              { text: "진핵생물: 하나의 염색체에 여러 복제 원점 존재" },
              { text: "동시에 양방향 복제 진행 → 복제 거품(Replication Bubble) 형성" },
              { text: "거대한 진핵생물 DNA의 효율적 복제 전략" },
            ],
          },
          {
            text: "염색체 응축 과정",
            children: [
              { text: "DNA + 히스톤(Histone) 8분자 → 뉴클레오솜(Nucleosome)" },
              { text: "뉴클레오솜 → 나선형으로 꼬여 30nm 섬유 형성" },
              { text: "반복 응축 → 분열기 염색체(Chromosome, 광학 현미경 관찰 가능)" },
              { text: "간기: 느슨한 염색사(Chromatin) 상태 → 전사 활발" },
              { text: "분열기: 고도 응축 → 전사 거의 불가" },
            ],
          },
          {
            text: "자매 염색분체(Sister Chromatids)",
            children: [
              { text: "동원체(Centromere)의 코헤신(Cohesin) 단백질에 의해 연결" },
              { text: "유전 정보 완전히 동일" },
              { text: "분열기 후기: 세파라제(Separase) 효소가 코헤신 분해 → 분리" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s1_c4",
        label: "분열기 전기와 중기",
        nodes: [
          {
            text: "전기(Prophase)",
            children: [
              { text: "염색사 응축 → 막대 모양 염색체 출현 (광학 현미경 관찰 가능)" },
              { text: "핵막(Nuclear Envelope)과 인(Nucleolus) 소실" },
              { text: "중심체(Centrosome)에서 방추사(Spindle Fiber) 형성 시작" },
              {
                text: "방추사 구성: 미세소관(Microtubule), 단백질은 α-튜불린 + β-튜불린",
                children: [
                  { text: "동물 세포: 중심체 안에 한 쌍의 중심립(Centriole) 존재" },
                  { text: "고등 식물 세포: 중심립 없이도 방추사 정상 형성" },
                ],
              },
            ],
          },
          {
            text: "중기(Metaphase)",
            children: [
              { text: "모든 염색체가 적도판(Metaphase Plate)에 일렬 배열" },
              { text: "방추사가 동원판(Kinetochore)에 부착" },
              { text: "두 자매 염색분체 → 반대편 극의 방추사가 잡아당김 → 안정적 위치" },
              { text: "염색체 최대 응축 시기 → 핵형 분석(Karyotyping)에 이용" },
            ],
          },
          {
            text: "핵형 분석(Karyotyping)",
            children: [
              { text: "콜히친(Colchicine): 미세소관 중합 억제 → 세포를 중기에 정지" },
              { text: "염색체를 크기·동원체 위치·밴드 패턴에 따라 쌍지어 배열" },
              { text: "염색체 수 이상(다운 증후군 등)이나 구조 이상(결실, 전좌 등) 진단 가능" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s1_c5",
        label: "분열기 후기와 말기",
        nodes: [
          {
            text: "후기(Anaphase)",
            children: [
              { text: "동원체에서 코헤신 단백질 절단 (세파라제) → 자매 염색분체 분리" },
              { text: "방추사(동원판 미세소관)에 의해 양극으로 이동" },
              {
                text: "이동 메커니즘",
                children: [
                  { text: "미세소관 탈중합(Depolymerization): 방추사가 짧아짐" },
                  { text: "모터 단백질(다이닌, Dynein)의 작용" },
                  { text: "약 1분 내 빠르게 진행" },
                ],
              },
              { text: "극간 미세소관(Interpolar Microtubule) 신장 → 세포 길어짐 (후기 B)" },
              { text: "분리된 염색분체 각각 = 독립 염색체 → 일시적으로 염색체 수 2배 (사람: 92개)" },
            ],
          },
          {
            text: "말기(Telophase)",
            children: [
              { text: "양극의 염색체 → 느슨한 염색사 상태로 이완" },
              { text: "핵막 재형성: 소포체(ER) 막 유래 소낭들이 융합" },
              { text: "인(Nucleolus) 재출현 → 두 개의 딸핵 형성" },
              { text: "방추사 분해·소실" },
              { text: "전기의 역과정에 해당, 세포질 분열과 동시 진행" },
            ],
          },
          {
            text: "각 시기 핵심 사건 요약",
            children: [
              { text: "전기: 염색체 응축 + 핵막 소실" },
              { text: "중기: 적도판 배열" },
              { text: "후기: 염색분체 분리 + 양극 이동" },
              { text: "말기: 핵막 재형성 + 염색체 이완" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s1_c6",
        label: "세포질 분열: 동물 vs 식물",
        nodes: [
          {
            text: "세포질 분열(Cytokinesis): 핵 분열 이후 세포질이 둘로 나뉘는 과정",
          },
          {
            text: "동물 세포: 바깥쪽 → 안쪽 (함입 방식)",
            children: [
              { text: "수축 고리(Contractile Ring): 액틴(Actin) 미세섬유 + 미오신II(Myosin II)" },
              { text: "수축 고리 수축 → 세포막 함입 → 분열구(Cleavage Furrow) 형성" },
              { text: "함입이 세포 중심까지 깊어지면 완전 분리" },
            ],
          },
          {
            text: "식물 세포: 안쪽 → 바깥쪽 (확장 방식)",
            children: [
              { text: "세포벽(Cell Wall) 존재로 함입 방식 불가" },
              { text: "골지체(Golgi) 유래 소낭(Vesicle) → 적도면에 모여 세포판(Cell Plate) 형성" },
              { text: "소낭 융합·확장 → 안쪽에서 바깥쪽으로 세포 분리" },
              { text: "세포판 → 중엽(Middle Lamella, 펙틴 풍부) + 양쪽에 1차 세포벽·세포막 형성" },
            ],
          },
          {
            text: "시험 포인트 정리",
            children: [
              { text: "방향: 동물(바깥→안) vs 식물(안→바깥)" },
              { text: "구조물: 수축 고리(동물) vs 세포판(식물)" },
              { text: "균류(버섯 등): 핵 분열 후 세포질 분열 없음 → 다핵 세포(Coenocyte)" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s1_c7",
        label: "체세포 분열의 의의와 DNA 상대량 변화",
        nodes: [
          {
            text: "체세포 분열의 역할",
            children: [
              { text: "다세포 생물의 생장(Growth)" },
              { text: "손상된 조직의 재생(Regeneration)" },
              { text: "단세포 생물의 생식(무성 생식, Asexual Reproduction)" },
            ],
          },
          {
            text: "핵심 특징: 모세포와 유전적으로 동일한(Genetically Identical) 딸세포 2개 생성",
            children: [
              { text: "핵상(Ploidy) 변화 없음: 2n → 2n" },
              { text: "다세포 생물의 모든 체세포가 수정란과 동일한 유전 정보 보유 (발현 유전자만 다름)" },
            ],
          },
          {
            text: "DNA 상대량 그래프",
            children: [
              { text: "G1기(2) → S기(2→4 점진적 증가) → G2기(4 유지) → M기(4) → 분열 완료 후 딸세포(2)" },
            ],
          },
          {
            text: "세포 분열과 표면적/부피 비(SA:V ratio)",
            children: [
              { text: "세포 커질수록 부피(r³)가 표면적(r²)보다 빠르게 증가" },
              { text: "상대적 표면적 감소 → 물질 교환 효율 저하" },
              { text: "적절한 SA:V 비 유지를 위해 세포 분열 필요" },
            ],
          },
          {
            text: "체세포 분열의 예",
            children: [
              { text: "재생: 도마뱀 꼬리, 피부 상처 치유, 골수 조혈 세포의 혈구 생성" },
              { text: "무성 생식: 효모(Yeast) 출아법(Budding), 히드라(Hydra) 출아 생식" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s1_c8",
        label: "세포 주기 조절: 검문점과 사이클린-CDK",
        nodes: [
          {
            text: "세포 주기 검문점(Cell Cycle Checkpoint): 세포 주기의 품질 관리 시스템",
            children: [
              { text: "문제 발견 시 세포 주기 일시 정지 → 수리 시간 제공 또는 세포 자멸(Apoptosis) 유도" },
            ],
          },
          {
            text: "3대 검문점",
            children: [
              {
                text: "G1 검문점(Restriction Point, 제한점) — 가장 중요",
                children: [
                  { text: "세포 크기, 영양 상태, 성장 인자 충분성, DNA 손상 여부 확인" },
                  { text: "통과 시 S기 진입(DNA 복제 시작), 이후 외부 신호 무관하게 분열 완료" },
                ],
              },
              {
                text: "G2 검문점",
                children: [
                  { text: "DNA 복제 정확성·완료 여부, 손상 유무 확인" },
                  { text: "문제 시 분열기 진입 차단 → DNA 수리 기회 제공" },
                ],
              },
              {
                text: "M 검문점(방추체 조립 검문점, SAC)",
                children: [
                  { text: "모든 염색체의 방추사 양극성 부착(Bipolar Attachment) 확인" },
                  { text: "불완전 부착 시 후기 진행 억제 → 비분리(Nondisjunction) 방지" },
                ],
              },
            ],
          },
          {
            text: "사이클린(Cyclin)-CDK(Cyclin-Dependent Kinase) 복합체",
            children: [
              { text: "사이클린: 세포 주기에 따라 합성·분해 반복 → 농도 주기적 변화" },
              { text: "CDK: 항상 존재하나, 해당 시기 사이클린과 결합해야 활성화" },
              { text: "활성화된 복합체 → 표적 단백질 인산화(Phosphorylation) → 다음 단계 진행 스위치" },
            ],
          },
          {
            text: "주요 사이클린-CDK 복합체",
            children: [
              { text: "사이클린D-CDK4/6: G1기 진행" },
              { text: "사이클린E-CDK2: G1/S 전환" },
              { text: "사이클린B-CDK1(=MPF, Maturation Promoting Factor): G2/M 전환" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s1_c9",
        label: "암과 세포 분열: 세포 주기 조절 이상",
        nodes: [
          {
            text: "암(Cancer): 세포 주기 조절 이상 → 비정상적 무한 증식 질환",
            children: [
              { text: "검문점 통제 망가짐 → 분열 신호 없이 계속 분열" },
              { text: "접촉 억제(Contact Inhibition) 무시" },
            ],
          },
          {
            text: "종양 유전자(Oncogene) — '가속 페달 고정'",
            children: [
              { text: "원종양 유전자(Proto-oncogene)의 과활성화 돌연변이" },
              { text: "정상 기능: 세포 성장·분열 조절 (성장 인자, 수용체, 신호 전달 단백질 등)" },
              {
                text: "대표 예시",
                children: [
                  { text: "RAS 유전자 점 돌연변이: 전체 암의 약 30% (항상 GTP 결합 활성 상태)" },
                  { text: "HER2 유전자 증폭(Amplification): 유방암의 약 20%" },
                ],
              },
            ],
          },
          {
            text: "종양 억제 유전자(Tumor Suppressor Gene) — '브레이크'",
            children: [
              { text: "세포 분열 억제 또는 DNA 수리 촉진 역할" },
              { text: "양쪽 대립유전자 모두 기능 상실 시 암 발생 (Two-Hit Hypothesis, 크누드슨 가설)" },
              {
                text: "p53(TP53) — '유전체의 수호자(Guardian of the Genome)'",
                children: [
                  { text: "DNA 손상 감지 → p21 발현 유도 → 사이클린-CDK 억제 → G1 정지" },
                  { text: "손상 심하면 세포 자멸(Apoptosis) 유도" },
                  { text: "돌연변이: 전체 암의 약 50% 이상에서 발견" },
                ],
              },
              {
                text: "RB(Retinoblastoma) 유전자",
                children: [
                  { text: "최초 발견된 종양 억제 유전자" },
                  { text: "E2F 전사인자 억제 → G1/S 전환 차단" },
                ],
              },
            ],
          },
          {
            text: "다단계 발암 모델(Multi-step Carcinogenesis)",
            children: [
              { text: "여러 유전자에 축적된 돌연변이 → 단계적 암 발생" },
              { text: "양성 종양(Benign) → 악성 종양(Malignant)" },
              { text: "악성 종양: 침윤(Invasion) + 전이(Metastasis, 혈관·림프관 통해 다른 장기로)" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s1_c10",
        label: "세포 자멸(아포토시스)과 세포 괴사",
        nodes: [
          {
            text: "세포 자멸(Apoptosis): 유전적으로 프로그램된 능동적 세포 사멸 과정",
            children: [
              { text: "에너지 소비하는 능동적 과정" },
              { text: "역할: 발생 중 불필요한 세포 제거, 비정상 세포(감염·DNA 손상) 제거" },
            ],
          },
          {
            text: "세포 자멸의 예",
            children: [
              { text: "태아 손가락 사이 물갈퀴 제거" },
              { text: "올챙이 꼬리 퇴화" },
            ],
          },
          {
            text: "세포 자멸 과정",
            children: [
              { text: "세포 수축, 핵 응축" },
              { text: "DNA가 약 180bp 단위로 규칙적 절단 (DNA Ladder Pattern)" },
              { text: "세포막 → 소낭(Apoptotic Body)으로 분해" },
              { text: "식세포(Macrophage)에 의해 깨끗이 제거" },
              { text: "핵심: 세포 내용물 유출 없음 → 염증 반응 없음" },
            ],
          },
          {
            text: "세포 괴사(Necrosis): 외부 요인에 의한 수동적 세포 사멸",
            children: [
              { text: "원인: 물리적 손상, 독소, 허혈(Ischemia) 등" },
              { text: "세포 부풀어 터짐 → 내용물 유출 → 염증 반응 유발" },
            ],
          },
          {
            text: "자멸 vs 괴사 비교 핵심",
            children: [
              { text: "자멸: 능동적, 프로그램됨, 염증 없음" },
              { text: "괴사: 수동적, 비프로그램됨, 염증 유발" },
              { text: "조절 유전자: p53, Bcl-2 등" },
              { text: "암세포: 자멸 경로 억제 → 비정상 세포 축적" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s1_c11",
        label: "세포 분열과 DNA 상대량 그래프 해석",
        nodes: [
          {
            text: "체세포 분열 DNA 상대량 그래프",
            children: [
              { text: "G1기(2 유지) → S기(2→4 우상향) → G2기(4 유지) → M기(4 유지) → 분열 완료(각 딸세포 2로 급감)" },
              { text: "하강 구간 1회" },
            ],
          },
          {
            text: "감수 분열 DNA 상대량 그래프",
            children: [
              { text: "G1기(2) → S기(2→4) → G2기(4) → 감수 1분열 완료(4→2) → 감수 2분열 완료(2→1)" },
              { text: "하강 구간 2회 — 체세포 분열(1회)과 구별 핵심" },
            ],
          },
          {
            text: "DNA 상대량으로 시기 판단",
            children: [
              { text: "상대량 4: G2기 또는 분열기(분열 완료 전)" },
              { text: "상대량 2: G1기 또는 감수 1분열 후 세포" },
              { text: "상대량 1: 감수 분열 완료된 생식세포(정자·난자)" },
            ],
          },
          {
            text: "유세포 분석(Flow Cytometry) 결과 해석",
            children: [
              { text: "세포 집단에서 각 시기 세포의 비율 분석" },
              { text: "DNA 상대량 2인 세포가 가장 많음 → G1기 세포 최다 (G1기가 가장 긴 시기)" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "bio_ch3_s2",
    title: "감수 분열",
    summary:
      "감수 1분열과 감수 2분열의 과정을 이해하고, 체세포 분열과 비교하여 감수 분열의 유전적 의의를 학습한다. 정자와 난자 형성의 차이, 각 시기별 DNA 양·염색체 수·염색분체 수의 변화를 정량적으로 정리한다.",
    notes: [
      {
        id: "bio_ch3_s2_c1",
        label: "감수 분열의 개요",
        nodes: [
          {
            text: "감수 분열(Meiosis): 생식세포(Gamete) 형성을 위한 세포 분열",
            children: [
              { text: "DNA 복제 1회 후 연속 2회 분열 → 염색체 수 반감(2n → n)" },
              { text: "결과: 하나의 모세포(2n) → 4개의 유전적으로 다른 딸세포(n)" },
            ],
          },
          {
            text: "두 단계 구분",
            children: [
              { text: "감수 1분열(Meiosis I): 상동 염색체 분리, 핵상 2n → n (감수 분열)" },
              { text: "감수 2분열(Meiosis II): 자매 염색분체 분리, 핵상 n 유지 (등가 분열)" },
            ],
          },
          {
            text: "감수 분열의 필수적 이유",
            children: [
              { text: "유성 생식 시 정자(n) + 난자(n) = 접합자(Zygote, 2n)" },
              { text: "세대마다 염색체 수 2배 증가 방지 → 종 고유 염색체 수 유지" },
            ],
          },
          {
            text: "감수 분열 장소",
            children: [
              { text: "동물: 생식소(Gonad, 정소·난소)" },
              { text: "식물: 포자낭(Sporangium)" },
            ],
          },
          {
            text: "체세포 분열과의 핵심 차이: 감수 1분열과 2분열 사이(인터키네시스)에 DNA 복제 없음",
          },
        ],
      },
      {
        id: "bio_ch3_s2_c2",
        label: "감수 1분열 전기I: 2가 염색체와 교차",
        nodes: [
          {
            text: "전기I(Prophase I): 감수 분열에서 가장 길고 복잡한 단계",
          },
          {
            text: "상동 염색체(Homologous Chromosomes)",
            children: [
              { text: "크기·형태·유전자좌 배열이 같은 한 쌍의 염색체" },
              { text: "하나는 부계(아버지), 다른 하나는 모계(어머니) 유래" },
            ],
          },
          {
            text: "접합(Synapsis)과 2가 염색체(Bivalent)",
            children: [
              { text: "상동 염색체가 시냅토네말 복합체(Synaptonemal Complex, SC)를 매개로 접합" },
              { text: "접합된 상동 염색체 쌍 = 2가 염색체(Bivalent)" },
              { text: "4개 염색분체(부계 2 + 모계 2)로 구성 → 4분염색체(Tetrad)" },
            ],
          },
          {
            text: "교차(Crossing Over)",
            children: [
              { text: "비자매 염색분체(Non-sister Chromatids) 사이에서 대립유전자 교환" },
              { text: "교차 부위 = 키아즈마(Chiasma), X자 모양 관찰" },
              { text: "유전자 재조합(Genetic Recombination) → 새로운 유전자 조합 생성" },
              { text: "다중 교차(Multiple Crossovers): 하나의 2가 염색체에서 여러 부위 동시 교차 가능" },
            ],
          },
          {
            text: "재조합 빈도와 유전자 지도",
            children: [
              { text: "두 유전자 사이 교차 빈도 = 물리적 거리에 비례" },
              { text: "1cM(centiMorgan) = 재조합 빈도 1%" },
              { text: "이 원리로 유전자 지도(Genetic Map) 작성 가능" },
            ],
          },
          {
            text: "난모세포 특이사항: 전기I이 태아기에 시작 → 배란 시까지 수십 년간 정지 (디플로텐 정지, Dictyotene)",
          },
        ],
      },
      {
        id: "bio_ch3_s2_c3",
        label: "감수 1분열 중기I ~ 말기I",
        nodes: [
          {
            text: "중기I(Metaphase I)",
            children: [
              { text: "2가 염색체(Bivalent) 단위로 적도판 배열 — 체세포 분열과의 핵심 차이" },
              {
                text: "독립적 배열(Independent Assortment)",
                children: [
                  { text: "각 2가 염색체의 부계/모계 배열 방향이 무작위적" },
                  { text: "다른 2가 염색체의 배열과 독립 → 유전적 다양성의 주요 원천" },
                ],
              },
            ],
          },
          {
            text: "후기I(Anaphase I) — '감수(Reduction)'의 핵심",
            children: [
              { text: "상동 염색체 분리 → 양극으로 이동 (핵상 2n → n)" },
              { text: "동원체 비분리: 자매 염색분체가 아닌 상동 염색체 단위로 분리" },
              {
                text: "동원체 비분리 이유",
                children: [
                  { text: "팔 부위 코헤신만 제거" },
                  { text: "동원체 부위 코헤신 → 슈고신(Shugoshin) 단백질이 보호·유지" },
                ],
              },
            ],
          },
          {
            text: "말기I(Telophase I)",
            children: [
              { text: "핵막 재형성 + 세포질 분열 → 2개의 딸세포(n) 형성" },
              { text: "각 딸세포 염색체는 여전히 2개의 자매 염색분체로 구성" },
              { text: "핵상 n이지만 DNA 양은 감수 2분열 거쳐야 최종 반감" },
              { text: "일부 종: 말기I와 인터키네시스 매우 짧거나 생략 → 곧바로 감수 2분열 진입" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s2_c4",
        label: "감수 2분열",
        nodes: [
          {
            text: "감수 2분열(Meiosis II) = 등가 분열(Equational Division): 핵상 변화 없이(n → n) DNA 양만 반감",
          },
          {
            text: "과정 (체세포 분열과 유사)",
            children: [
              { text: "전기II: 염색체 응축, 방추사 형성" },
              { text: "중기II: n개 염색체 적도판 배열, 자매 염색분체가 반대 극 방추사에 부착" },
              { text: "후기II: 동원체 분리 → 자매 염색분체 양극 이동 (체세포 분열 후기와 동일)" },
              { text: "말기II: 핵막 형성 + 세포질 분열 → 최종 4개의 n 딸세포" },
            ],
          },
          {
            text: "핵심 포인트",
            children: [
              { text: "감수 2분열에서 DNA 복제 없음 → 분열 결과 DNA 양 반감" },
              { text: "교차 발생 시 자매 염색분체도 완전히 동일하지 않을 수 있음" },
              { text: "결과: 4개 딸세포 모두 유전적으로 서로 다름" },
              { text: "감수 2분열은 감수 1분열보다 빠르게 진행 (전기II 특히 짧음)" },
            ],
          },
          {
            text: "감수 1분열 vs 감수 2분열 비교 포인트",
            children: [
              { text: "핵상 변화 여부: 1분열(O) vs 2분열(X)" },
              { text: "분리 단위: 1분열(상동 염색체) vs 2분열(자매 염색분체)" },
              { text: "2가 염색체 유무: 1분열(O) vs 2분열(X)" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s2_c5",
        label: "체세포 분열과 감수 분열의 비교",
        nodes: [
          {
            text: "분열 횟수와 딸세포 수",
            children: [
              { text: "체세포 분열: 1회 분열 → 딸세포 2개(2n)" },
              { text: "감수 분열: 2회 연속 분열 → 딸세포 4개(n)" },
            ],
          },
          {
            text: "2가 염색체와 교차",
            children: [
              { text: "체세포 분열: 접합·교차 없음" },
              { text: "감수 분열: 전기I에서 2가 염색체 형성 + 교차 발생" },
            ],
          },
          {
            text: "유전적 동일성",
            children: [
              { text: "체세포 분열: 딸세포가 모세포와 유전적으로 동일" },
              { text: "감수 분열: 독립적 배열 + 교차 → 딸세포가 서로 유전적으로 다름" },
            ],
          },
          {
            text: "핵상 변화",
            children: [
              { text: "체세포 분열: 2n → 2n (변화 없음)" },
              { text: "감수 분열: 2n → n (반감)" },
            ],
          },
          {
            text: "후기 분리 단위",
            children: [
              { text: "체세포 분열 후기: 자매 염색분체 (동원체 분리)" },
              { text: "감수 1분열 후기I: 상동 염색체 (동원체 비분리)" },
              { text: "감수 2분열 후기II: 자매 염색분체 (동원체 분리)" },
            ],
          },
          {
            text: "장소와 목적",
            children: [
              { text: "체세포 분열: 몸 전체 체세포 / 생장·재생" },
              { text: "감수 분열: 생식세포 형성 기관(정소·난소·포자낭) / 유전적 다양성 + 염색체 수 유지" },
            ],
          },
          {
            text: "적도판 배열 단위",
            children: [
              { text: "체세포 분열 중기: 개별 염색체" },
              { text: "감수 1분열 중기I: 2가 염색체(상동 염색체 쌍)" },
            ],
          },
          {
            text: "가장 결정적 구별 기준: '2가 염색체 형성 여부' + '핵상 변화 여부'",
          },
        ],
      },
      {
        id: "bio_ch3_s2_c6",
        label: "감수 분열과 유전적 다양성",
        nodes: [
          {
            text: "유전적 다양성을 증가시키는 세 가지 기작",
          },
          {
            text: "1. 독립적 배열(Independent Assortment)",
            children: [
              { text: "감수 1분열 중기I에서 각 상동 염색체 쌍의 무작위 배열" },
              { text: "조합 수: 2^n가지 (n = 상동 염색체 쌍 수)" },
              { text: "사람(n=23): 2^23 = 약 838만 가지 생식세포 조합" },
            ],
          },
          {
            text: "2. 교차(Crossing Over)",
            children: [
              { text: "전기I 비자매 염색분체 사이 유전자 재조합" },
              { text: "교차 포함 시 이론적으로 무한에 가까운 유전자 조합 가능" },
              { text: "교차 없이는 염색체 단위로만 섞임, 교차로 염색체 내부에서도 부모 유전자 재조합" },
            ],
          },
          {
            text: "3. 수정(Fertilization) 시 무작위 조합",
            children: [
              { text: "정자 약 838만 종류 x 난자 약 838만 종류 = 약 70조 가지 조합" },
              { text: "교차 포함 시 유전적으로 동일한 자녀(일란성 쌍둥이 제외) 확률 ≈ 0" },
            ],
          },
          {
            text: "진화적 의의",
            children: [
              { text: "유전적 다양성 → 환경 변화에 대한 종의 적응력 증가" },
              { text: "유성 생식이 에너지 비용 높음에도 대부분의 진핵생물에서 유지되는 이유" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s2_c7",
        label: "생식세포 형성 과정: 정자와 난자",
        nodes: [
          {
            text: "정자 형성(Spermatogenesis) — 정소 세정관",
            children: [
              { text: "정원세포(2n=46) → 체세포 분열 증식" },
              { text: "→ 제1정모세포(2n=46, DNA 양 4)" },
              { text: "→ 감수 1분열 → 제2정모세포(n=23, DNA 양 2) 2개" },
              { text: "→ 감수 2분열 → 정세포(n=23, DNA 양 1) 4개" },
              { text: "→ 변형(첨체·편모 형성, 세포질 대부분 제거) → 정자 4개" },
              { text: "1개 제1정모세포 → 4개 기능적 정자, 전체 과정 약 64~74일" },
            ],
          },
          {
            text: "난자 형성(Oogenesis) — 난소",
            children: [
              { text: "난원세포(2n=46) → 태아기에 체세포 분열 증식" },
              { text: "→ 제1난모세포(2n=46, DNA 양 4) → 전기I에서 정지 (태아기~배란 시까지 수십 년)" },
              { text: "→ 배란 시 감수 1분열 완료 → 제2난모세포(n=23, DNA 양 2) 1개 + 제1극체(n) 1개" },
              { text: "→ 수정 시 감수 2분열 완료 → 난자(n=23, DNA 양 1) 1개 + 제2극체(n) 1개" },
              { text: "최종: 난자 1개 + 극체 3개 (제1극체도 분열 시)" },
            ],
          },
          {
            text: "극체(Polar Body)",
            children: [
              { text: "세포질 매우 적어 기능 불가 → 퇴화" },
              { text: "불균등 세포질 분배 이유: 수정란에 충분한 영양분(난황, 리보솜, mRNA, 미토콘드리아) 공급" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s2_c8",
        label: "핵상과 DNA 양 변화 정리 (2n=46 기준)",
        nodes: [
          {
            text: "시기별 정량적 정리",
            children: [
              { text: "G1기: 핵상 2n, 염색체 46개, DNA 상대량 2, 염색분체 0개" },
              { text: "S기 후(G2기): 핵상 2n, 염색체 46개, DNA 상대량 4, 염색분체 92개" },
              { text: "감수 1분열 중기I: 핵상 2n, 2가 염색체 23개, 염색체 46개, DNA 상대량 4, 염색분체 92개" },
              { text: "감수 1분열 후(제2정모/난모세포): 핵상 n, 염색체 23개, DNA 상대량 2, 염색분체 46개" },
              { text: "감수 2분열 후(정세포/난자): 핵상 n, 염색체 23개, DNA 상대량 1, 염색분체 0개" },
            ],
          },
          {
            text: "시험 핵심 포인트",
            children: [
              { text: "감수 1분열: 핵상 변화(2n→n), 상동 염색체 분리" },
              { text: "감수 2분열: 핵상 유지(n), DNA 양만 반감(2→1), 자매 염색분체 분리" },
              { text: "염색체 수 감소 시점: 감수 1분열 후기I" },
              { text: "DNA 양 최종 감소 시점: 감수 2분열 후기II" },
            ],
          },
          {
            text: "DNA 상대량 변화 비교",
            children: [
              { text: "체세포 분열: 2 → 4 → 2" },
              { text: "감수 분열: 2 → 4 → 2 → 1" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s2_c9",
        label: "정자 형성과 난자 형성의 비교",
        nodes: [
          {
            text: "기능적 생식세포 수",
            children: [
              { text: "정자 형성: 1개 제1정모세포 → 4개 기능적 정자" },
              { text: "난자 형성: 1개 제1난모세포 → 1개 기능적 난자 + 3개 극체(퇴화)" },
            ],
          },
          {
            text: "세포질 분배",
            children: [
              { text: "정자 형성: 균등 분배(Equal Division)" },
              { text: "난자 형성: 불균등 분배(Unequal Division) — 한쪽이 대부분의 세포질 획득" },
            ],
          },
          {
            text: "시기와 지속 기간",
            children: [
              { text: "정자: 사춘기(12~14세) 이후 평생 지속, 매일 약 2~3억 개 생산" },
              {
                text: "난자: 난원세포 분열은 태아기(임신 2~5개월)에만",
                children: [
                  { text: "제1난모세포는 태아기에 형성 → 전기I(디플로텐)에서 정지" },
                  { text: "사춘기 이후 매 월경 주기마다 1개씩 배란 → 감수 1분열 완료" },
                  { text: "감수 2분열은 수정 시 완료" },
                  { text: "40세 배란 난자 = 약 40년간 전기I 정지 상태였던 세포" },
                ],
              },
            ],
          },
          {
            text: "크기와 구조",
            children: [
              {
                text: "정자: 총 약 55μm, 운동성 있음",
                children: [
                  { text: "머리(약 5μm, 핵+첨체) + 중편(미토콘드리아 밀집) + 꼬리(편모, 약 50μm)" },
                ],
              },
              {
                text: "난자: 직경 약 100~120μm, 운동성 없음",
                children: [
                  { text: "영양분(난황) 풍부, 투명대(Zona Pellucida) + 방사관(Corona Radiata)으로 둘러싸임" },
                ],
              },
            ],
          },
          {
            text: "생산 총량",
            children: [
              { text: "남성: 평생 수조 개의 정자" },
              { text: "여성: 출생 시 약 100~200만 개 제1난모세포 → 사춘기 약 40만 개 → 평생 배란 약 400~500개" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "bio_ch3_s3",
    title: "멘델의 유전 법칙",
    summary:
      "멘델의 완두콩 실험을 바탕으로 우열의 원리, 분리의 법칙, 독립의 법칙을 이해하고, 불완전 우성(중간 유전)과 복대립 유전(ABO 혈액형) 등 확장된 유전 현상까지 학습한다. 유전 문제 풀이를 위한 퍼넷 사각형 활용법도 포함한다.",
    notes: [
      {
        id: "bio_ch3_s3_c1",
        label: "멘델의 완두콩 실험",
        nodes: [
          {
            text: "멘델(Gregor Johann Mendel, 1822-1884): 오스트리아 브르노 수도원에서 8년간(1856-1863) 약 28,000개체 교배 실험",
          },
          {
            text: "완두(Pisum sativum) 선택 이유",
            children: [
              { text: "한 세대가 짧음(약 3개월) → 여러 세대 결과 빠르게 확보" },
              { text: "자가 수분(Self-pollination) 기본 → 순종(True-breeding) 확보 용이" },
              { text: "인공 교배(Cross-pollination) 비교적 간단" },
              { text: "대비되는 7쌍의 대립 형질 보유" },
            ],
          },
          {
            text: "7쌍의 대립 형질",
            children: [
              { text: "씨 모양(둥근/주름진), 씨 색(노란/초록), 꽃색(보라/흰)" },
              { text: "꼬투리 모양(부풀어 오른/잘록한), 꼬투리 색(초록/노란)" },
              { text: "꽃 위치(줄기 꼭대기/잎겨드랑이), 줄기 길이(긴/짧은)" },
            ],
          },
          {
            text: "멘델 실험 방법론의 혁신성",
            children: [
              { text: "순종 개체를 먼저 확립 → 실험 출발점 명확화" },
              { text: "한 번에 1~2가지 형질만 추적 → 복잡성 최소화" },
              { text: "충분히 많은 개체 분석 → 통계적으로 유의미한 결과 도출" },
            ],
          },
          {
            text: "1865년 발표, 당시 주목받지 못함 → 1900년 드 브리스·코렌스·체르마크에 의해 재발견",
          },
        ],
      },
      {
        id: "bio_ch3_s3_c2",
        label: "우열의 원리",
        nodes: [
          {
            text: "우열의 원리(Law of Dominance): 이형접합 개체에서 우성 유전자가 열성 유전자의 효과를 가림",
          },
          {
            text: "멘델의 실험",
            children: [
              { text: "순종 둥근 씨(RR) x 순종 주름진 씨(rr) → F1 모두 둥근 씨(Rr)" },
              { text: "F1에서 나타나는 형질 = 우성(Dominant)" },
              { text: "숨겨진 형질 = 열성(Recessive)" },
            ],
          },
          {
            text: "주의: 우성 ≠ '좋은' 형질 또는 '빈도 높은' 형질",
            children: [
              { text: "예: 다지증(Polydactyly)은 우성이지만 빈도 매우 낮음" },
              { text: "우성 = 이형접합(Heterozygous) 상태에서 표현되는 형질" },
            ],
          },
          {
            text: "분자적 기반: 하플로충분성(Haploinsufficiency)",
            children: [
              { text: "우성 대립유전자 하나가 만드는 단백질 양만으로 정상 표현형 유지 가능" },
              { text: "예: 완두 R 유전자 하나 → 충분한 전분 합성 효소(SBE1) 생산 → 둥근 씨" },
              { text: "주름진 씨(rr) = 전분 합성 효소 결핍" },
            ],
          },
          {
            text: "표기 관행: 우성 대문자(R), 열성 소문자(r)",
          },
        ],
      },
      {
        id: "bio_ch3_s3_c3",
        label: "분리의 법칙(단성 교배)",
        nodes: [
          {
            text: "분리의 법칙(Law of Segregation, 멘델의 제1법칙): 생식세포 형성 시 한 쌍의 대립유전자가 분리되어 각 생식세포에 하나씩 진입",
          },
          {
            text: "세포학적 기반: 감수 1분열 후기I에서 상동 염색체 분리",
            children: [
              { text: "대립유전자는 상동 염색체의 같은 유전자좌(Locus)에 위치" },
            ],
          },
          {
            text: "멘델의 실험 결과",
            children: [
              { text: "F1 자가 수분 (Rr x Rr)" },
              { text: "F2 표현형 비: 둥근 씨 : 주름진 씨 ≈ 3:1 (실제 5,474 : 1,850 = 2.96:1)" },
              { text: "F2 유전자형 비: RR : Rr : rr = 1:2:1" },
            ],
          },
          {
            text: "핵심 의의",
            children: [
              { text: "열성 대립유전자(r)가 F1에서 소멸하지 않고 가려져 있다가 F2에서 재출현" },
              { text: "혼합 유전설(Blending Inheritance) 반박의 결정적 증거" },
            ],
          },
          {
            text: "시험 포인트: 퍼넷 사각형(Punnett Square)으로 유전자형·표현형 비율 계산",
          },
        ],
      },
      {
        id: "bio_ch3_s3_c4",
        label: "독립의 법칙(양성 교배)",
        nodes: [
          {
            text: "독립의 법칙(Law of Independent Assortment, 멘델의 제2법칙): 서로 다른 염색체에 위치한 유전자쌍이 독립적으로 분리",
          },
          {
            text: "세포학적 기반: 감수 1분열 중기I에서 서로 다른 상동 염색체의 독립적 배열",
          },
          {
            text: "멘델의 양성 교배 실험",
            children: [
              { text: "순종 둥근 노란(RRYY) x 순종 주름 초록(rryy) → F1(RrYy, 둥근 노란)" },
              { text: "F1 x F1 → F2 표현형 비: 둥근 노란 : 둥근 초록 : 주름 노란 : 주름 초록 = 9:3:3:1" },
              { text: "각 형질 독립 분리(3:1 x 3:1 = 9:3:3:1)" },
              { text: "4x4 퍼넷 사각형으로 16가지 유전자형 조합 도출 가능" },
            ],
          },
          {
            text: "성립 조건",
            children: [
              { text: "두 유전자가 서로 다른 염색체에 위치해야 함" },
              { text: "같은 염색체라도 50cM 이상 멀면 독립적으로 보일 수 있음" },
            ],
          },
          {
            text: "멘델의 행운: 7가지 형질이 모두 서로 다른 염색체에 있거나 충분히 멀리 떨어져 독립 유전",
            children: [
              { text: "완두 2n=14(n=7), 7개 형질이 각각 다른 염색체에 있을 확률은 약 1.5%" },
              { text: "일부 형질은 같은 염색체이되 거리가 먼 것으로 판명" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s3_c5",
        label: "검정 교배",
        nodes: [
          {
            text: "검정 교배(Test Cross): 우성 표현형 개체의 유전자형(RR vs Rr) 판별을 위해 열성 동형접합(rr)과 교배",
          },
          {
            text: "원리: 열성 개체(rr)는 r만 제공 → 자손 표현형이 대상 개체의 대립유전자를 직접 반영",
          },
          {
            text: "결과 해석",
            children: [
              { text: "대상이 RR: 자손 모두 Rr (우성 표현형)" },
              { text: "대상이 Rr: 자손 Rr : rr ≈ 1:1" },
            ],
          },
          {
            text: "활용",
            children: [
              { text: "멘델: F1(Rr)임을 확인, 분리의 법칙 검증" },
              { text: "농업·축산: 우수 형질 품종 선별" },
            ],
          },
          {
            text: "양성 교배 검정(RrYy x rryy)",
            children: [
              { text: "4가지 표현형 1:1:1:1 → 두 유전자 독립 유전 확인" },
              { text: "1:1:1:1에서 벗어나면 → 두 유전자 연관(Linkage) 시사" },
            ],
          },
          {
            text: "검정 교배에 열성 동형접합을 사용하는 이유: r만 제공하므로 대상 개체의 유전자형이 자손에 직접 드러남",
          },
        ],
      },
      {
        id: "bio_ch3_s3_c6",
        label: "유전자형과 표현형의 관계",
        nodes: [
          {
            text: "기본 개념",
            children: [
              { text: "유전자형(Genotype): 유전자 조합 (RR, Rr, rr)" },
              { text: "표현형(Phenotype): 실제 나타나는 형질 (둥근 씨, 주름진 씨)" },
              { text: "동형접합(Homozygous): RR 또는 rr / 이형접합(Heterozygous): Rr" },
            ],
          },
          {
            text: "완전 우성에서 RR과 Rr이 동일 표현형 → 표현형만으로 구별 불가 → 검정 교배 필요",
          },
          {
            text: "환경의 영향: 유전자형 같아도 환경에 따라 표현형 다를 수 있음",
            children: [
              {
                text: "히말라야 토끼 털색",
                children: [
                  { text: "타이로시나제(Tyrosinase) 온도 감수성 돌연변이" },
                  { text: "저온 부위(귀, 코, 발, 꼬리)에서만 효소 활성화 → 검은 색소 합성" },
                ],
              },
              { text: "수국(Hydrangea) 꽃색: 토양 pH에 따라 파란색(산성)~분홍색(알칼리성)" },
            ],
          },
          {
            text: "반응 규범(Reaction Norm, 반응 범위)",
            children: [
              { text: "유전자형이 표현형의 가능 범위를 결정" },
              { text: "환경이 그 범위 내에서 실제 표현형 결정" },
            ],
          },
          {
            text: "단일 인자 유전 형질(혈액형, 귓불 형태 등)은 환경 영향 거의 없어 유전자형-표현형 관계 명확",
          },
        ],
      },
      {
        id: "bio_ch3_s3_c7",
        label: "멘델 유전의 확장과 한계",
        nodes: [
          {
            text: "멘델 법칙 성립 조건: 완전 우성 + 단일 유전자 + 독립 유전의 이상적 상황",
          },
          {
            text: "주요 확장 개념",
            children: [
              { text: "불완전 우성(Incomplete Dominance): 이형접합 표현형이 중간 (예: 분꽃 분홍색)" },
              { text: "공동 우성(Codominance): 이형접합에서 두 대립유전자 모두 완전 발현 (예: ABO AB형)" },
              { text: "복대립 유전(Multiple Alleles): 한 유전자좌에 3개 이상 대립유전자 (예: ABO I^A, I^B, i)" },
              { text: "다인자 유전(Polygenic Inheritance): 여러 유전자가 하나의 형질 결정 (예: 키, 피부색)" },
            ],
          },
          {
            text: "연관과 관련 개념",
            children: [
              { text: "연관(Linkage): 같은 염색체 유전자들이 함께 유전 — 모건(1910년대, 초파리)" },
              { text: "상위(Epistasis): 한 유전자가 다른 유전자좌 발현에 영향 (예: 래브라도 털색)" },
              { text: "다면발현(Pleiotropy): 하나의 유전자가 여러 형질에 영향 (예: 낫 모양 적혈구 빈혈증 HBB)" },
            ],
          },
          {
            text: "핵심: 확장 개념들은 멘델 법칙의 '예외'가 아닌 '확장' — 분리·독립의 법칙은 여전히 유효",
          },
        ],
      },
      {
        id: "bio_ch3_s3_c8",
        label: "중간 유전(불완전 우성)",
        nodes: [
          {
            text: "중간 유전(불완전 우성, Incomplete Dominance): 이형접합 표현형이 두 동형접합의 중간",
            children: [
              { text: "원인: 하나의 대립유전자만으로 충분한 유전자 산물(단백질/효소) 생산 불가" },
            ],
          },
          {
            text: "대표 예: 분꽃(Mirabilis jalapa)의 꽃색",
            children: [
              { text: "붉은 꽃(C^R C^R) x 흰 꽃(C^W C^W) → F1 모두 분홍 꽃(C^R C^W)" },
              { text: "C^R 효소가 절반만 생산 → 색소 절반만 합성 → 분홍색" },
              { text: "F1 x F1 → F2 표현형 비: 붉은 : 분홍 : 흰 = 1:2:1" },
            ],
          },
          {
            text: "완전 우성과의 핵심 차이",
            children: [
              { text: "완전 우성 F2: 표현형 비 3:1 ≠ 유전자형 비 1:2:1" },
              { text: "불완전 우성 F2: 표현형 비 1:2:1 = 유전자형 비 1:2:1" },
              { text: "불완전 우성에서는 유전자형-표현형 1:1 대응 → 검정 교배 불필요" },
            ],
          },
          {
            text: "다른 예시",
            children: [
              { text: "금어초(Antirrhinum majus): 빨강 x 흰색 = 분홍" },
              { text: "앤달루시안 닭(Andalusian Fowl): 검정 x 흰색/스플래쉬 = 청색" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s3_c9",
        label: "복대립 유전과 ABO 혈액형 유전 상세",
        nodes: [
          {
            text: "복대립 유전(Multiple Alleles): 한 유전자좌에 3개 이상 대립유전자 존재 (집단 수준)",
            children: [
              { text: "이배체 개체는 최대 2개 대립유전자만 보유 가능" },
            ],
          },
          {
            text: "ABO식 혈액형: 9번 상염색체의 3개 대립유전자(I^A, I^B, i)",
            children: [
              { text: "I^A: H 항원에 N-아세틸갈락토사민 부착 → A 항원" },
              { text: "I^B: H 항원에 갈락토스 부착 → B 항원" },
              { text: "i: 기능 상실 → H 항원 그대로" },
            ],
          },
          {
            text: "우열 관계",
            children: [
              { text: "I^A, I^B는 각각 i에 대해 완전 우성" },
              { text: "I^A와 I^B 사이: 공동 우성(Codominance) → AB형에서 A·B 항원 모두 발현" },
            ],
          },
          {
            text: "유전자형-표현형 대응 (6가지 → 4가지)",
            children: [
              { text: "I^A I^A, I^A i → A형 / I^B I^B, I^B i → B형" },
              { text: "I^A I^B → AB형 / ii → O형" },
            ],
          },
          {
            text: "항원-항체와 수혈",
            children: [
              { text: "A형: 항B 항체 / B형: 항A 항체 / O형: 항A+항B / AB형: 항체 없음" },
              { text: "수혈자 항체 + 공혈자 항원 반응 시 응집(Agglutination) → 위험" },
              { text: "O형: 만능 공혈자 / AB형: 만능 수혈자 (원칙적으로 동일 혈액형 수혈)" },
            ],
          },
          {
            text: "시험 빈출: 부모 혈액형 → 자녀 가능 혈액형 추론",
            children: [
              { text: "예: A형(I^A i) x B형(I^B i) → AB형, A형, B형, O형 모두 가능" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s3_c10",
        label: "연관과 교차: 독립의 법칙이 성립하지 않는 경우",
        nodes: [
          {
            text: "연관(Linkage): 같은 염색체에 위치한 유전자들이 함께 유전 → 독립의 법칙 불성립",
          },
          {
            text: "모건(T.H. Morgan)의 초파리(Drosophila) 실험(1910년대)",
            children: [
              { text: "몸색(B/b)과 날개 길이(V/v)가 같은 2번 염색체에 위치" },
              { text: "BbVv x bbvv 검정 교배 → 1:1:1:1이 아님" },
              { text: "부모형(BV, bv) >> 재조합형(Bv, bV)" },
            ],
          },
          {
            text: "연관 유전자의 교차",
            children: [
              { text: "감수 1분열 전기I 교차 → 재조합형(새로운 조합) 생성" },
              {
                text: "재조합 빈도(RF) = (재조합형 개체 수 / 전체 자손 수) x 100(%)",
                children: [
                  { text: "두 유전자가 멀수록 RF 높음, 가까울수록 RF 낮음" },
                  { text: "단위: cM(centiMorgan), 1cM = RF 1%" },
                ],
              },
              { text: "RF = 50%이면 사실상 독립 유전과 동일" },
            ],
          },
          {
            text: "유전자 지도(Genetic Map, Linkage Map)",
            children: [
              { text: "재조합 빈도를 이용하여 유전자 간 상대적 거리 및 순서 결정" },
              { text: "모건: 최초 유전자 지도 작성 → 1933년 노벨 생리의학상" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "bio_ch3_s4",
    title: "사람의 유전",
    summary:
      "ABO식 혈액형, Rh식 혈액형, 성염색체 유전, 다인자 유전 등 사람의 다양한 유전 양식과 가계도 분석 방법을 학습한다. 가계도 유형별 판별 알고리즘, 유전자 검사와 유전 상담의 실제까지 포함한다.",
    notes: [
      {
        id: "bio_ch3_s4_c1",
        label: "ABO식 혈액형: 복대립 유전과 공동 우성",
        nodes: [
          {
            text: "ABO식 혈액형: 9번 상염색체, 3개 대립유전자(I^A, I^B, i)에 의한 복대립 유전",
          },
          {
            text: "유전자형-표현형 대응",
            children: [
              { text: "I^A I^A 또는 I^A i → A형" },
              { text: "I^B I^B 또는 I^B i → B형" },
              { text: "I^A I^B → AB형 (공동 우성)" },
              { text: "ii → O형" },
              { text: "총 6가지 유전자형 → 4가지 표현형" },
            ],
          },
          {
            text: "항원과 항체",
            children: [
              { text: "A형: A 항원(N-아세틸갈락토사민) + 항B 항체" },
              { text: "B형: B 항원(갈락토스) + 항A 항체" },
              { text: "AB형: A+B 항원 + 항체 없음" },
              { text: "O형: H 항원만 + 항A+항B 항체" },
              { text: "자연 항체(Natural Antibody, IgM): 신생아기 장내 세균 등 환경 항원에 대한 면역 반응" },
            ],
          },
          {
            text: "수혈 원리",
            children: [
              { text: "수혈자 항체 + 공혈자 항원 반응 → 응집(Agglutination) + 용혈(Hemolysis) → 생명 위협" },
              { text: "원칙: 동일 혈액형 수혈 (교차 시험, Cross-matching)" },
            ],
          },
          {
            text: "발견: 카를 란트슈타이너(Karl Landsteiner, 1901) → 1930년 노벨 생리의학상",
          },
          {
            text: "법의학 활용: 친자 관계 부정(배제)에 사용 가능 (확증은 DNA 검사)",
          },
        ],
      },
      {
        id: "bio_ch3_s4_c2",
        label: "Rh식 혈액형과 신생아 용혈성 질환",
        nodes: [
          {
            text: "Rh식 혈액형: 적혈구 표면 Rh 항원(D 항원) 유무로 구분",
            children: [
              { text: "DD 또는 Dd → Rh+ / dd → Rh-" },
              { text: "Rh+ 유전자(D)가 Rh-(d)에 대해 우성" },
              { text: "한국인 약 99.9% Rh+, 약 0.1% Rh- / 백인 약 15% Rh-" },
            ],
          },
          {
            text: "ABO와의 차이: Rh 혈액형에는 자연 항체 없음 → Rh+ 혈액 노출 시 항Rh 항체 형성(감작)",
          },
          {
            text: "신생아 용혈성 질환(HDN, Erythroblastosis Fetalis)",
            children: [
              {
                text: "발생 기전",
                children: [
                  { text: "Rh- 어머니(dd) + Rh+ 태아(Dd)" },
                  { text: "첫 임신: 출산 시 태아 Rh+ 적혈구 소량 모체 혈류 유입 → 감작(항Rh IgG 형성)" },
                  { text: "둘째 임신: 기억 면역 → 항Rh IgG 대량 생산 → 태반 통과 → 태아 적혈구 파괴" },
                ],
              },
              {
                text: "증상: 태아 빈혈, 황달(빌리루빈 축적), 핵황달(뇌 손상), 태아 수종, 사산",
              },
            ],
          },
          {
            text: "예방: 항D 면역글로불린(RhoGAM)",
            children: [
              { text: "첫 Rh+ 태아 출산 직후 72시간 이내 Rh- 어머니에게 투여" },
              { text: "모체 혈류 내 태아 Rh+ 적혈구 빠르게 제거 → 감작 예방 (수동 면역)" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s4_c3",
        label: "성염색체 유전: X 연관 열성 유전",
        nodes: [
          {
            text: "성염색체 유전: X 염색체에 있는 유전자에 의한 유전 (Y 염색체 유전자 매우 적음)",
          },
          {
            text: "적록 색맹(Red-Green Color Blindness)",
            children: [
              { text: "X 염색체 장완(Xq28)의 원추세포 옵신(Opsin) 유전자 돌연변이" },
              {
                text: "여성 유전자형",
                children: [
                  { text: "X^A X^A: 정상" },
                  { text: "X^A X^a: 보인자(Carrier, 정상 표현형이나 색맹 유전자 보유)" },
                  { text: "X^a X^a: 색맹" },
                ],
              },
              {
                text: "남성 유전자형",
                children: [
                  { text: "X^A Y: 정상" },
                  { text: "X^a Y: 색맹 (X 하나뿐 → 반성 유전, Hemizygous)" },
                ],
              },
              { text: "한국인 빈도: 남성 약 5.9%, 여성 약 0.44% (q^2)" },
            ],
          },
          {
            text: "유전 패턴 예시",
            children: [
              { text: "보인자 어머니(X^A X^a) x 정상 아버지(X^A Y) → 아들 50% 색맹, 딸 모두 정상" },
              { text: "색맹 아버지(X^a Y) x 보인자 어머니(X^A X^a) → 딸 50% 색맹 가능" },
            ],
          },
          {
            text: "혈우병(Hemophilia)",
            children: [
              { text: "혈우병 A: 제VIII 인자 결핍 (남성 약 5,000명 중 1명)" },
              { text: "혈우병 B(Christmas Disease): 제IX 인자 결핍 (더 드물)" },
              { text: "역사: 빅토리아 여왕이 혈우병 B 보인자 → 유럽 왕실 전파" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s4_c4",
        label: "다인자 유전과 환경의 영향",
        nodes: [
          {
            text: "다인자 유전(Polygenic Inheritance): 하나의 형질이 여러 유전자에 의해 결정",
            children: [
              { text: "예: 피부색, 키, 몸무게, 지능, 혈압" },
            ],
          },
          {
            text: "핵심 특성: 각 대립유전자 효과가 누적(Additive) → 연속적 변이(Continuous Variation)",
            children: [
              { text: "피부색 3쌍 유전자(A, B, C) 가정: 대문자 하나당 멜라닌 일정량 추가" },
              { text: "AaBbCc x AaBbCc → 대문자 수(0~6개)에 따라 7단계 피부색" },
              { text: "중간 표현형 빈도 최고 → 정규 분포(Bell Curve)" },
            ],
          },
          {
            text: "환경의 영향",
            children: [
              { text: "유전자형 같아도 영양·운동·기후·질병·스트레스에 따라 표현형 변동" },
              { text: "키: 유전율(Heritability) 약 80%이지만 영양·호르몬 등 환경 요인 영향" },
              { text: "한국인 평균 신장 세대별 증가 = 유전자 변화 아닌 영양·환경 개선 (세대 효과, Secular Trend)" },
            ],
          },
          {
            text: "유전율(Heritability) 주의점",
            children: [
              { text: "유전율 높음 ≠ 환경 영향 없음" },
              { text: "특정 환경 조건 내 표현형 변이 중 유전적 차이에 기인하는 비율 (통계적 수치)" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s4_c5",
        label: "단일 인자 유전과 다인자 유전의 비교",
        nodes: [
          {
            text: "단일 인자 유전(Monogenic Inheritance)",
            children: [
              { text: "하나의 유전자에 의해 형질 결정" },
              { text: "불연속 변이(Discontinuous Variation) = 질적 형질" },
              { text: "멘델 분리 비(3:1, 1:2:1 등)를 따름" },
              { text: "환경 영향 적음, 유전율 거의 100%" },
              { text: "예: 귓불 형태, 혀 말기, 미맹, 쌍꺼풀, 보조개, ABO 혈액형, 색맹, 혈우병" },
            ],
          },
          {
            text: "다인자 유전(Polygenic Inheritance)",
            children: [
              { text: "여러 유전자의 누적 효과" },
              { text: "연속 변이(Continuous Variation) = 양적 형질" },
              { text: "정규 분포, 멘델의 단순 비율로 설명 불가" },
              { text: "환경 영향 큼, 유전율 보통 30~80%" },
              { text: "예: 키, 몸무게, 피부색, 지능" },
            ],
          },
          {
            text: "그래프 구별 핵심",
            children: [
              { text: "불연속 변이 → 막대그래프" },
              { text: "연속 변이 → 종 모양 곡선(정규 분포)" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s4_c6",
        label: "가계도 분석: 우성/열성 판별",
        nodes: [
          {
            text: "가계도(Pedigree) 기호 규칙",
            children: [
              { text: "남성: □ / 여성: ○" },
              { text: "발현(Affected): ■, ● / 보인자: 반만 채운 기호 / 미발현: 빈 기호" },
              { text: "수평선: 부부 / 수직선: 부모-자녀 / 화살표: 발단자(Proband)" },
            ],
          },
          {
            text: "우성/열성 판별법 (1단계)",
            children: [
              {
                text: "규칙 1: 정상 부모 → 발현 자녀 = 해당 형질은 열성",
                children: [
                  { text: "이유: 부모 모두 Aa → aa 자녀 출현 가능" },
                ],
              },
              {
                text: "규칙 2: 발현 부모 → 미발현 자녀 = 해당 형질은 우성",
                children: [
                  { text: "이유: 부모 Aa x Aa → aa(미발현) 자녀 출현 가능" },
                ],
              },
            ],
          },
          {
            text: "보충 규칙",
            children: [
              { text: "발현 부모에서 발현 자녀만, 발현 x 미발현에서 약 1:1 → 우성 가능성" },
              { text: "미발현 부모에서 미발현 자녀만 계속 → 정보 부족, 판별 불가" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s4_c7",
        label: "가계도 분석: 상염색체/성염색체 판별",
        nodes: [
          {
            text: "2단계: 우성/열성 판별 후 상염색체 vs 성염색체(X 연관) 판별",
          },
          {
            text: "X 연관 열성 판별 단서",
            children: [
              { text: "(가) 남성에 편중된 형질 발현 (남성 >> 여성)" },
              { text: "(나) 발현 남성(X^a Y)의 딸 → 반드시 보인자(X^A X^a) 이상" },
              { text: "(다) 보인자 어머니(X^A X^a)의 아들 중 약 50% 발현" },
              { text: "(라) 정상 아버지 + 비보인자 어머니인데 딸 발현 → 불가능 → X 연관 열성 배제" },
            ],
          },
          {
            text: "X 연관 우성 판별 단서",
            children: [
              { text: "(가) 발현 아버지(X^A Y)의 딸 모두 발현, 아들 모두 미발현" },
              { text: "(나) 여성 발현자가 남성보다 약 2배" },
            ],
          },
          {
            text: "상염색체 유전 특징",
            children: [
              { text: "남녀 비슷한 비율로 발현" },
              { text: "아버지-딸, 어머니-아들 간 특별한 패턴 없음" },
            ],
          },
          {
            text: "판별 알고리즘 요약",
            children: [
              { text: "1단계: 우/열 판별 (미발현 부모 → 발현 자녀 = 열성)" },
              { text: "2단계: 성별 편향 확인 (남성 편중 → X 연관 의심)" },
              { text: "3단계: 아버지-딸 관계 확인" },
              { text: "모순 발견 시 해당 유전 양식 배제 → 다른 가능성 검토" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s4_c8",
        label: "가계도 분석 심화: 유형별 판별법과 문제 풀이 전략",
        nodes: [
          {
            text: "(1) 상염색체 우성(Autosomal Dominant)",
            children: [
              { text: "발현 부모 → 미발현 자녀 출현 가능 (Aa x Aa 또는 Aa x aa)" },
              { text: "남녀 비슷한 비율, 매 세대 발현자 존재 (Vertical Pattern)" },
              { text: "발현자의 부모 중 적어도 한 명 반드시 발현" },
              { text: "예: 다지증, 헌팅턴병, 마르판 증후군" },
            ],
          },
          {
            text: "(2) 상염색체 열성(Autosomal Recessive)",
            children: [
              { text: "정상 부모 → 발현 자녀 출현 가능 (Aa x Aa)" },
              { text: "남녀 비슷한 비율, 세대 건너뛸 수 있음 (Horizontal Pattern)" },
              { text: "근친 교배(Consanguinity) 시 발현 확률 증가" },
              { text: "예: 낫 모양 적혈구 빈혈증, 낭포성 섬유증, PKU, 알비니즘" },
            ],
          },
          {
            text: "(3) X 연관 열성(X-linked Recessive)",
            children: [
              { text: "남성 발현 빈도 >> 여성 (X 하나뿐)" },
              { text: "보인자 어머니 → 아들 50% 발현" },
              { text: "발현 아버지의 딸 → 모두 최소 보인자" },
              { text: "예: 적록 색맹, 혈우병, 뒤시엔 근이영양증(DMD)" },
            ],
          },
          {
            text: "(4) X 연관 우성(X-linked Dominant)",
            children: [
              { text: "발현 아버지(X^A Y)의 딸 모두 발현 + 아들 모두 미발현 → 확정" },
              { text: "여성 발현자 ≈ 남성의 2배" },
              { text: "예: 저인산혈증 구루병(Hypophosphatemic Rickets)" },
            ],
          },
          {
            text: "문제 풀이 전략: 배제법",
            children: [
              { text: "'모순점 찾기'로 불가능한 유전 양식 제거" },
              { text: "남은 가능성 중 모든 정보와 일치하는 양식 선택" },
              { text: "불확실 시 특정 개체 유전자형을 기호로 써가며 확인" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s4_c9",
        label: "유전자 검사와 유전 상담",
        nodes: [
          {
            text: "산전 진단법(Prenatal Diagnosis)",
            children: [
              {
                text: "양수 검사(Amniocentesis)",
                children: [
                  { text: "임신 15~18주, 양수 내 태아 유래 세포 채취·배양" },
                  { text: "핵형 분석 또는 DNA 분석, 유산 위험 약 0.1~0.5%, 결과 약 2~3주" },
                ],
              },
              {
                text: "융모막 융모 검사(CVS)",
                children: [
                  { text: "임신 10~12주, 태반 융모막 융모 조직 채취" },
                  { text: "양수 검사보다 이른 진단 가능, 유산 위험 약 0.5~1%" },
                ],
              },
              {
                text: "비침습적 산전 검사(NIPT)",
                children: [
                  { text: "임신 10주 이후 모체 혈액에서 태아 세포 유리 DNA(cffDNA) 분석" },
                  { text: "다운 증후군 등 염색체 수 이상 선별" },
                ],
              },
            ],
          },
          {
            text: "DNA 칩(DNA Microarray)",
            children: [
              { text: "유리판 위 수천~수만 개 DNA 탐침(Probe) 고정" },
              { text: "유전 질환 원인 유전자 탐색, 암 유형 분류, 약물 반응성 예측" },
            ],
          },
          {
            text: "신생아 선별 검사(NBS)",
            children: [
              { text: "출생 후 48~72시간, 발뒤꿈치 소량 혈액 채취 (거스리 카드)" },
              { text: "PKU, 갈락토스혈증, 선천성 갑상선 기능 저하증 등 약 50여 종 선별" },
              { text: "조기 발견 시 식이 조절·호르몬 대체 요법으로 관리 가능" },
            ],
          },
          {
            text: "유전 상담(Genetic Counseling)",
            children: [
              { text: "가계도 분석, 검사 결과 해석, 발현 확률 계산, 심리적 지지 제공" },
              { text: "비지시적(Nondirective) 원칙: 특정 결정 강요하지 않음" },
              { text: "환자·가족의 충분한 정보 기반 자율적 결정(Informed Decision) 지원" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "bio_ch3_s5",
    title: "유전자와 염색체 이상",
    summary:
      "유전자 돌연변이(점 돌연변이), 염색체 구조 이상, 염색체 수 이상의 종류와 원인을 이해하고 대표적인 유전 질환을 학습한다. 에드워드 증후군, 파타우 증후군 등 상세 질환과 유전 상담에서의 보인자 판별·발현 확률 계산까지 포함한다.",
    notes: [
      {
        id: "bio_ch3_s5_c1",
        label: "유전자 돌연변이(점 돌연변이)",
        nodes: [
          {
            text: "유전자 돌연변이(Gene Mutation, 점 돌연변이): DNA 염기 서열의 변화",
          },
          {
            text: "유형 1 — 치환(Substitution): 하나의 염기가 다른 염기로 변환",
            children: [
              { text: "전이(Transition): 퓨린↔퓨린 또는 피리미딘↔피리미딘" },
              { text: "전환(Transversion): 퓨린↔피리미딘" },
              {
                text: "치환 결과",
                children: [
                  { text: "과오 돌연변이(Missense): 다른 아미노산 코돈으로 변환" },
                  { text: "무의미 돌연변이(Nonsense): 종결 코돈(UAA, UAG, UGA)으로 변환 → 번역 조기 종결" },
                  { text: "침묵 돌연변이(Silent): 유전 부호 축퇴성으로 같은 아미노산 → 영향 없음 (주로 코돈 3번째 염기)" },
                ],
              },
            ],
          },
          {
            text: "유형 2 — 삽입(Insertion): 하나 이상의 염기 추가",
          },
          {
            text: "유형 3 — 결실(Deletion): 하나 이상의 염기 소실",
          },
          {
            text: "틀 이동 돌연변이(Frameshift Mutation)",
            children: [
              { text: "삽입/결실이 3의 배수가 아닌 수일 때 발생" },
              { text: "이후 모든 코돈 읽기 틀 변경 → 아미노산 전체 변경 + 조기 종결 빈발" },
              { text: "일반적으로 치환보다 단백질에 더 큰 영향" },
            ],
          },
          {
            text: "돌연변이 원인",
            children: [
              { text: "DNA 복제 오류(Replication Error)" },
              { text: "자연적 DNA 손상(탈퓨린, 탈아미노 등)" },
              { text: "화학적 돌연변이원(니트로소아민, 벤조피렌 등)" },
              { text: "물리적 돌연변이원(UV, X선, 감마선 등)" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s5_c2",
        label: "낫 모양 적혈구 빈혈증",
        nodes: [
          {
            text: "낫 모양 적혈구 빈혈증(Sickle Cell Anemia, SCA): 점 돌연변이(과오 돌연변이)의 대표 사례",
          },
          {
            text: "원인: 11번 상염색체 HBB 유전자 6번째 코돈",
            children: [
              { text: "DNA: GAG → GTG / mRNA: GAG → GUG" },
              { text: "아미노산: 글루탐산(Glu, 친수성) → 발린(Val, 소수성)" },
              { text: "총 146개 아미노산 중 단 1개 변화" },
            ],
          },
          {
            text: "분자적 기전",
            children: [
              { text: "저산소 조건에서 소수성 발린이 인접 HbS 분자의 소수성 주머니에 결합" },
              { text: "헤모글로빈 비정상 중합(Polymerization) → 긴 섬유(Fiber) 형성" },
              { text: "적혈구 양오목원반 → 낫(Sickle) 모양 변형" },
            ],
          },
          {
            text: "임상 증상",
            children: [
              { text: "혈관 폐쇄성 위기(Vaso-occlusive Crisis): 좁은 모세혈관 통과 불가 → 극심한 통증" },
              { text: "만성 용혈성 빈혈: 정상 120일 → 낫 모양 10~20일 수명" },
              { text: "비장 경색, 뇌졸중, 신장 손상 등 다장기 합병증" },
            ],
          },
          {
            text: "유전 양식: 상염색체 열성",
            children: [
              { text: "HbS HbS(동형접합)만 중증 질환" },
              { text: "이형접합 보인자(HbA HbS): 보통 무증상 (극단적 저산소 시 약간 증상)" },
            ],
          },
          {
            text: "진화적 의의: 이형접합 이점(Heterozygote Advantage)",
            children: [
              { text: "HbAS 보인자: 열대열 말라리아(P. falciparum)에 대한 저항성 증가" },
              { text: "감염 적혈구에서 HbS 중합 → 적혈구 빠른 제거 → 원충 증식 억제" },
              { text: "말라리아 유행 지역에서 HbS 빈도 높게 유지 → 균형 선택(Balancing Selection)" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s5_c3",
        label: "염색체 구조 이상",
        nodes: [
          {
            text: "염색체 구조 이상(Chromosomal Structural Aberration): 염색체 일부의 변형",
          },
          {
            text: "결실(Deletion): 염색체 일부 구간 소실",
            children: [
              {
                text: "묘성 증후군(Cri du Chat Syndrome): 5번 염색체 단완(5p) 결실",
                children: [
                  { text: "고양이 울음 소리(후두 발달 이상), 소두증, 둥근 얼굴, 넓은 미간, 지적 장애" },
                  { text: "빈도: 약 20,000~50,000명 중 1명" },
                ],
              },
            ],
          },
          {
            text: "중복(Duplication): 특정 부분 반복 → 유전자 용량(Gene Dosage) 증가",
            children: [
              { text: "예: 샤르코-마리-투스 병 1A형(CMT1A) — 17번 PMP22 유전자 중복" },
            ],
          },
          {
            text: "역위(Inversion): 특정 구간이 180도 뒤집혀 재결합",
            children: [
              { text: "동원체 포함 역위(Pericentric) vs 포함하지 않는 역위(Paracentric)" },
              { text: "유전자 자체 소실 없으나 절단점 위치 효과(Position Effect) 가능" },
              { text: "역위 보인자: 감수 분열 시 역위 고리 형성 → 교차 시 불균형 생식세포 생성 가능" },
            ],
          },
          {
            text: "전좌(Translocation): 비상동 염색체 간 구간 교환",
            children: [
              {
                text: "필라델피아 염색체: t(9;22)(q34;q11)",
                children: [
                  { text: "9번 ABL1 + 22번 BCR → BCR-ABL1 융합 유전자" },
                  { text: "비정상 타이로신 키나아제 → 만성 골수성 백혈병(CML) 유발" },
                  { text: "이매티닙(Imatinib, 글리벡): BCR-ABL1 특이적 억제 표적 치료제" },
                ],
              },
              {
                text: "로버트소니안 전좌(Robertsonian Translocation)",
                children: [
                  { text: "아크로센트릭 염색체(13, 14, 15, 21, 22번)의 장완이 동원체 부위에서 융합" },
                  { text: "보인자: 45개 염색체이나 표현형 정상 가능" },
                  { text: "감수 분열 시 비정상 배우자 → 가족성 다운 증후군 원인" },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s5_c4",
        label: "염색체 수 이상: 비분리 현상",
        nodes: [
          {
            text: "염색체 수 이상(Aneuploidy): 감수 분열 시 비분리(Nondisjunction)로 발생",
          },
          {
            text: "감수 1분열 비분리",
            children: [
              { text: "상동 염색체 미분리 → 4개 딸세포 모두 비정상" },
              { text: "2개 n+1 (부계+모계 유래 모두 포함) + 2개 n-1" },
            ],
          },
          {
            text: "감수 2분열 비분리",
            children: [
              { text: "자매 염색분체 미분리 → 정상 2개(n) + n+1 1개 + n-1 1개" },
              { text: "n+1 배우자: 같은 부모 유래 복사본만 포함 (동일 자매 염색분체)" },
            ],
          },
          {
            text: "1분열 vs 2분열 비분리 핵심 차이",
            children: [
              { text: "1분열: n+1 배우자에 부계+모계 유래 염색체 혼재" },
              { text: "2분열: n+1 배우자에 같은 부모 유래만 포함" },
              { text: "DNA 다형성 분석으로 비분리 단계 구별 가능" },
            ],
          },
          {
            text: "비정상 배우자의 수정 결과",
            children: [
              { text: "n+1 + n = 삼염색체(Trisomy, 2n+1, 47개)" },
              { text: "n-1 + n = 단염색체(Monosomy, 2n-1, 45개)" },
              { text: "대부분 상염색체 단염색체·삼염색체는 치사 → 자연 유산" },
            ],
          },
          {
            text: "생존 가능 주요 삼염색체: 다운(21번), 에드워드(18번), 파타우(13번)",
          },
        ],
      },
      {
        id: "bio_ch3_s5_c5",
        label: "상염색체 수 이상: 다운 증후군",
        nodes: [
          {
            text: "다운 증후군(Down Syndrome): 21번 삼염색체(Trisomy 21)",
            children: [
              { text: "핵형: 47,XX,+21 또는 47,XY,+21" },
              { text: "발견: 다운(1866, 임상 기술) / 르준(1959, 원인 염색체 규명)" },
            ],
          },
          {
            text: "주요 임상 특징",
            children: [
              { text: "특징적 얼굴: 납작한 안면, 위로 치켜 올라간 눈꼬리, 내안각 주름, 낮은 콧대, 짧은 목" },
              { text: "근긴장도 저하(Hypotonia), 지적 장애(IQ 평균 50~70)" },
              { text: "선천성 심장 기형(약 40~50%, 심실 중격 결손 최다)" },
              { text: "면역 기능 저하, 갑상선 기능 저하증" },
              { text: "알츠하이머 조기 발병 위험(21번에 APP 유전자)" },
              { text: "특징적 손바닥 가로주름(원숭이선, Simian Crease)" },
            ],
          },
          {
            text: "빈도: 약 700~1,000명 중 1명 (가장 흔한 상염색체 수 이상 질환)",
          },
          {
            text: "모체 연령 효과(Maternal Age Effect)",
            children: [
              { text: "20세 1/1,500 → 30세 1/900 → 35세 1/350 → 40세 1/100 → 45세 1/30" },
              { text: "원인: 난모세포 코헤신 퇴화, SAC 기능 저하 → 비분리 빈도 증가" },
            ],
          },
          {
            text: "다운 증후군 유형",
            children: [
              { text: "자유 삼염색체(약 95%): 비분리에 의한 단순 3개" },
              { text: "전좌형(약 4%): 로버트소니안 전좌(주로 14-21번), 모체 연령 무관, 가족력 가능" },
              { text: "모자이크형(약 1%): 정상 세포 + 삼염색체 세포 혼재" },
            ],
          },
          {
            text: "현대 기대 수명: 약 60세 이상으로 크게 향상",
          },
        ],
      },
      {
        id: "bio_ch3_s5_c6",
        label: "성염색체 수 이상",
        nodes: [
          {
            text: "터너 증후군(Turner Syndrome): 45,X",
            children: [
              { text: "약 2,500명 여아 중 1명 (수정란의 99%는 자연 유산)" },
              { text: "여성 외형, 난소 발달 불량(줄무늬 생식선), 대부분 불임" },
              { text: "저신장(성인 평균 약 147cm), 물갈퀴목, 방패 가슴, 대동맥 축착증" },
              { text: "지능 대부분 정상 (공간 지각 능력에 어려움 가능)" },
              { text: "치료: 성장 호르몬(GH) + 에스트로겐 보충 요법" },
            ],
          },
          {
            text: "클라인펠터 증후군(Klinefelter Syndrome): 47,XXY",
            children: [
              { text: "약 600~1,000명 남아 중 1명" },
              { text: "남성 외형, 정소 위축, 여성형 유방, 대부분 불임" },
              { text: "평균보다 큰 키, 긴 팔다리, 지능 대부분 정상 (언어 발달 약간 지연 가능)" },
              { text: "치료: 테스토스테론 보충 요법" },
            ],
          },
          {
            text: "트리플 X 증후군(Triple X): 47,XXX",
            children: [
              { text: "약 1,000명 여아 중 1명" },
              { text: "대부분 정상에 가까운 표현형, 약간 큰 키, 학습 장애 가능" },
              { text: "가임력 대부분 정상, 임상적으로 미진단 경우 많음" },
            ],
          },
          {
            text: "XYY 증후군(Jacob Syndrome): 47,XYY",
            children: [
              { text: "약 1,000명 남아 중 1명" },
              { text: "큰 키, 대부분 정상 생활·가임력 가능" },
              { text: "과거 공격성 증가 주장 → 현재 부정" },
            ],
          },
          {
            text: "성염색체 수 이상이 상대적으로 경미한 이유",
            children: [
              { text: "X 염색체 불활성화(Lyon Hypothesis): 여분의 X → 바 소체(Barr Body)로 응축·불활성화" },
              { text: "Y 염색체: 유전자 수 매우 적음(약 50~60개) → 추가 Y 영향 적음" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s5_c7",
        label: "에드워드 증후군과 파타우 증후군",
        nodes: [
          {
            text: "에드워드 증후군(Edwards Syndrome): 18번 삼염색체(Trisomy 18)",
            children: [
              { text: "핵형: 47,XX,+18 또는 47,XY,+18 (1960년 에드워드 보고)" },
              { text: "빈도: 약 5,000~8,000명 중 1명 (다운 다음으로 흔한 상염색체 삼염색체)" },
              { text: "여아에서 남아보다 약 3배 흔함 (남태아 자궁 내 사망률 더 높음)" },
            ],
          },
          {
            text: "에드워드 증후군 임상 특징",
            children: [
              { text: "심한 지적 장애, 심장 기형(거의 100%)" },
              { text: "특징적 주먹 쥠(Clenched Fists): 검지→중지, 새끼→약지 덮음" },
              { text: "소두증, 소하악증(작은 턱), 신장 기형, 로킹 체어 발바닥" },
              { text: "예후: 생존 중앙값 약 5~15일, 1년 생존율 약 5~10%" },
            ],
          },
          {
            text: "파타우 증후군(Patau Syndrome): 13번 삼염색체(Trisomy 13)",
            children: [
              { text: "핵형: 47,XX,+13 또는 47,XY,+13 (1960년 파타우 보고)" },
              { text: "빈도: 약 10,000~20,000명 중 1명" },
            ],
          },
          {
            text: "파타우 증후군 임상 특징",
            children: [
              { text: "심한 지적 장애, 전전뇌증(Holoprosencephaly)" },
              { text: "소안구증/무안구증, 구순구개열, 다지증(6개 이상)" },
              { text: "심장 기형(약 80%), 두피 결손, 신장 기형" },
              { text: "예후: 에드워드보다 불량, 생존 중앙값 약 7~10일, 6개월 생존율 10% 미만" },
            ],
          },
          {
            text: "21·18·13번 외 삼염색체는 대부분 초기 자연 유산 (유전자 수 많아 용량 불균형 치사)",
            children: [
              { text: "21·18·13번은 유전자 수가 가장 적은 염색체 → 삼염색체에서도 출생까지 생존 가능" },
            ],
          },
        ],
      },
      {
        id: "bio_ch3_s5_c8",
        label: "유전병의 유전 상담: 보인자 판별과 발현 확률 계산",
        nodes: [
          {
            text: "유전 상담의 핵심: 가계도 분석 → 보인자(Carrier) 판별 + 자녀 발현 확률 계산",
          },
          {
            text: "상염색체 열성 유전병 확률 계산",
            children: [
              { text: "보인자 x 보인자 (Aa x Aa): AA(1/4) : Aa(2/4) : aa(1/4)" },
              { text: "질환 발현(aa) 확률: 1/4(25%)" },
              { text: "보인자(Aa) 확률: 2/4(50%)" },
              {
                text: "조건부 확률(시험 빈출): '정상 자녀 중' 보인자 확률",
                children: [
                  { text: "정상 자녀 = AA(1/4) + Aa(2/4) = 3/4" },
                  { text: "이 중 Aa 비율: (2/4) / (3/4) = 2/3 (약 66.7%)" },
                ],
              },
            ],
          },
          {
            text: "X 연관 열성 유전병 확률 계산",
            children: [
              { text: "보인자 어머니(X^A X^a) x 정상 아버지(X^A Y)" },
              { text: "아들 중 발현 확률: 1/2(X^a Y)" },
              { text: "딸 중 발현 확률: 0 (아버지가 X^A Y → 딸은 최소 X^A 하나)" },
              { text: "전체 자녀 중 발현 확률: 1/4" },
            ],
          },
          {
            text: "보인자 판별 핵심 원리",
            children: [
              { text: "상염색체 열성 발현자(aa)의 부모 → 둘 다 반드시 보인자(Aa) 이상" },
              { text: "X 연관 열성 발현 남성(X^a Y)의 어머니 → 반드시 보인자(X^A X^a) 이상" },
              { text: "X 연관 열성 발현 남성의 아버지 → 해당 형질과 무관 (Y만 전달)" },
              { text: "X 연관 열성 발현 여성(X^a X^a) → 아버지 반드시 발현(X^a Y) + 어머니 반드시 보인자 이상" },
            ],
          },
          {
            text: "유전 상담 원칙: 비지시적(Nondirective) — 확률 정보 제공, 최종 결정은 본인들이 내림",
          },
        ],
      },
      {
        id: "bio_ch3_s5_c9",
        label: "돌연변이의 원인과 유형 종합 정리",
        nodes: [
          {
            text: "돌연변이(Mutation): DNA 염기 서열 또는 염색체 구조·수의 변화, 유전적 다양성의 궁극적 원천",
          },
          {
            text: "발생 원인별 분류",
            children: [
              {
                text: "자연 돌연변이(Spontaneous)",
                children: [
                  { text: "DNA 중합효소 오류 (약 10^9 bp당 1개)" },
                  { text: "자연적 화학 변화: 탈퓨린(Depurination), 탈아미노(Deamination), 산화적 손상" },
                  { text: "전이성 인자(Transposable Element, 트랜스포존) 이동" },
                ],
              },
              {
                text: "유발 돌연변이(Induced)",
                children: [
                  {
                    text: "물리적 돌연변이원",
                    children: [
                      { text: "자외선(UV): 피리미딘 이량체(Pyrimidine Dimer) 형성" },
                      { text: "X선·감마선(이온화 방사선): DNA 이중 가닥 절단" },
                    ],
                  },
                  {
                    text: "화학적 돌연변이원",
                    children: [
                      { text: "니트로소아민(가공육 아질산염), 벤조[a]피렌(담배·탄 고기)" },
                      { text: "아플라톡신(곰팡이 독소), EMS(실험용)" },
                    ],
                  },
                ],
              },
            ],
          },
          {
            text: "영향 범위별 분류",
            children: [
              { text: "유전자 돌연변이(점 돌연변이): 단일 염기~수 염기" },
              { text: "염색체 구조 이상: 결실, 중복, 역위, 전좌" },
              { text: "염색체 수 이상: 이수성(Aneuploidy), 배수성(Polyploidy)" },
            ],
          },
          {
            text: "발생 세포별 분류",
            children: [
              { text: "생식세포 돌연변이(Germline): 자손에게 유전 → 진화의 원료" },
              { text: "체세포 돌연변이(Somatic): 자손에게 유전 안 됨, 해당 개체에만 영향 (암 등 유발)" },
            ],
          },
          {
            text: "돌연변이의 영향: 대부분 유해·중립, 드물게 유리한 돌연변이 → 자연 선택 → 적응 진화",
          },
        ],
      },
    ],
  },
];
