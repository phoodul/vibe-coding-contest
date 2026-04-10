import type { StructuredSection } from "./ethics-structured-index";

/**
 * 제4장: 항상성과 몸의 조절 — 구조화 텍스트 (암기 친화)
 * 원본: biology-ch4.ts의 서술형 detail → 계층 트리 + 명사형 종결
 */
export const BIOLOGY_STRUCTURED_CH4: StructuredSection[] = [
  {
    id: "bio_ch4_s1",
    title: "뉴런과 흥분의 전달",
    summary:
      "뉴런의 구조와 흥분의 발생(활동 전위), 전도 및 시냅스에서의 전달 과정을 학습한다.",
    notes: [
      {
        id: "bio_ch4_s1_c1",
        label: "뉴런의 구조",
        nodes: [
          {
            text: "뉴런(Neuron): 신경계의 구조적·기능적 기본 단위",
          },
          {
            text: "3대 구조",
            children: [
              {
                text: "가지돌기(수상돌기, Dendrite)",
                children: [
                  { text: "다른 뉴런·감각 수용기로부터 자극 수신" },
                  { text: "짧고 많은 돌기 → 표면적 확대 → 신호 수신 효율 향상" },
                ],
              },
              {
                text: "신경세포체(Cell Body)",
                children: [
                  { text: "핵, 미토콘드리아, 소포체 등 세포소기관 위치" },
                  { text: "물질대사·단백질 합성 등 생명 활동 유지" },
                ],
              },
              {
                text: "축삭돌기(축삭, Axon)",
                children: [
                  { text: "흥분을 다음 뉴런·효과기(근육, 분비샘)로 전달하는 긴 돌기" },
                  { text: "길이: 수 mm ~ 최대 1m 이상" },
                ],
              },
            ],
          },
          {
            text: "말이집(수초, Myelin Sheath)",
            children: [
              { text: "슈반 세포(Schwann Cell)가 축삭 주위를 여러 겹 감아 형성" },
              { text: "절연체 역할 → 전도 속도 크게 향상" },
            ],
          },
          {
            text: "축삭 말단(Axon Terminal)",
            children: [
              { text: "시냅스 소포 존재 → 신경전달물질 저장" },
            ],
          },
        ],
      },
      {
        id: "bio_ch4_s1_c2",
        label: "말이집과 랑비에 마디",
        nodes: [
          {
            text: "말이집(Myelin Sheath): 축삭돌기를 감싸는 지질 성분의 절연층",
            children: [
              { text: "말초 신경계(PNS): 슈반 세포(Schwann Cell)가 형성" },
              { text: "중추 신경계(CNS): 희소돌기아교세포(Oligodendrocyte)가 형성" },
            ],
          },
          {
            text: "랑비에 마디(Node of Ranvier)",
            children: [
              { text: "인접 슈반 세포 사이 축삭 노출 부분 (약 1~2μm)" },
              { text: "전압 개폐 Na⁺ 채널 밀집 → 이 마디에서만 탈분극 발생" },
            ],
          },
          {
            text: "도약 전도(Saltatory Conduction)",
            children: [
              { text: "흥분이 랑비에 마디에서 마디로 뛰어넘듯 전달" },
              { text: "말이집 신경(유수 신경) 전도 속도: 최대 120m/s" },
              { text: "민말이집 신경(무수 신경) 전도 속도: 0.5~2m/s" },
              { text: "유수 신경이 무수 신경보다 약 60~100배 빠름" },
            ],
          },
          {
            text: "다발성 경화증(Multiple Sclerosis)",
            children: [
              { text: "말이집 파괴되는 자가면역 질환" },
              { text: "전도 속도 감소 → 운동 장애, 감각 이상" },
            ],
          },
        ],
      },
      {
        id: "bio_ch4_s1_c3",
        label: "휴지 전위",
        nodes: [
          {
            text: "휴지 전위(Resting Potential): 자극 없는 뉴런의 막전위 약 -70mV",
          },
          {
            text: "Na⁺-K⁺ 펌프(Na⁺/K⁺-ATPase)에 의한 유지",
            children: [
              { text: "ATP 소모하며 Na⁺ 3개 세포 밖으로, K⁺ 2개 세포 안으로 능동 수송" },
              { text: "결과: 세포 밖 Na⁺ 높음, 세포 안 K⁺ 높음" },
              { text: "뉴런 에너지 소비의 약 70% 차지" },
            ],
          },
          {
            text: "K⁺ 누출 채널(비개폐 K⁺ 채널)",
            children: [
              { text: "항상 열려 있어 K⁺이 농도 기울기에 따라 세포 밖으로 확산" },
              { text: "세포 안쪽이 상대적으로 음(-) 전하" },
              { text: "K⁺ 투과성이 Na⁺보다 약 40배 높음" },
            ],
          },
          {
            text: "분극(Polarization) 상태: 세포 안쪽이 음전하를 띤 상태",
          },
        ],
      },
      {
        id: "bio_ch4_s1_c4",
        label: "활동 전위의 발생",
        nodes: [
          {
            text: "활동 전위 발생 조건: 역치(Threshold, 약 -55mV) 이상의 자극",
          },
          {
            text: "단계별 과정",
            children: [
              {
                text: "탈분극(Depolarization)",
                children: [
                  { text: "전압 개폐 Na⁺ 채널 개방 → Na⁺ 급격히 세포 안으로 유입 (약 1ms 이내)" },
                  { text: "막전위 +35mV 부근까지 상승" },
                ],
              },
              {
                text: "재분극(Repolarization)",
                children: [
                  { text: "Na⁺ 채널 불활성화 문 닫힘 → Na⁺ 유입 중단" },
                  { text: "전압 개폐 K⁺ 채널 개방 → K⁺ 세포 밖 유출" },
                ],
              },
              {
                text: "과분극(Hyperpolarization, 약 -80mV)",
                children: [
                  { text: "K⁺ 채널이 느리게 닫혀 일시적으로 휴지 전위보다 더 낮아짐" },
                ],
              },
              {
                text: "휴지 전위 회복",
                children: [
                  { text: "Na⁺-K⁺ 펌프 작용으로 -70mV 복귀" },
                ],
              },
            ],
          },
          {
            text: "활동 전위 지속 시간: 약 1~2ms",
          },
          {
            text: "실무율(All-or-None Law)",
            children: [
              { text: "역치 이상 → 항상 동일 크기(+35mV)로 발생" },
              { text: "역치 이하 → 전혀 발생하지 않음" },
            ],
          },
        ],
      },
      {
        id: "bio_ch4_s1_c5",
        label: "이온 채널과 전압 개폐 채널",
        nodes: [
          {
            text: "이온 채널(Ion Channel): 세포막의 단백질 통로, 특정 이온만 선택적 투과",
          },
          {
            text: "이온 채널 분류",
            children: [
              { text: "누출 채널: 항상 열림" },
              { text: "전압 개폐 채널: 막전위 변화에 의해 개폐" },
              { text: "리간드 개폐 채널: 화학 물질 결합에 의해 개폐" },
              { text: "기계적 개폐 채널: 물리적 자극에 의해 개폐" },
            ],
          },
          {
            text: "Na⁺ 전압 개폐 채널의 2중 문 구조",
            children: [
              { text: "활성화 문(Activation Gate): 빠르게 반응 → 채널 개방" },
              { text: "불활성화 문(Inactivation Gate): 느리게 반응 → 채널 차단" },
            ],
          },
          {
            text: "불응기(Refractory Period)",
            children: [
              {
                text: "절대 불응기(Absolute Refractory Period, 약 1ms)",
                children: [
                  { text: "불활성화 문 닫힌 상태" },
                  { text: "어떤 강도의 자극에도 활동 전위 발생 불가" },
                ],
              },
              {
                text: "상대 불응기(Relative Refractory Period)",
                children: [
                  { text: "K⁺ 채널 아직 열린 시기" },
                  { text: "역치보다 강한 자극에만 활동 전위 발생" },
                ],
              },
              { text: "불응기 존재 → 흥분의 역방향 전도 방지 → 한 방향 전도 보장" },
            ],
          },
        ],
      },
      {
        id: "bio_ch4_s1_c6",
        label: "흥분의 전도",
        nodes: [
          {
            text: "흥분의 전도(Conduction): 하나의 뉴런 축삭돌기를 따라 활동 전위 이동",
          },
          {
            text: "연속 전도(Continuous Conduction)",
            children: [
              { text: "민말이집 신경(무수 신경)에서 발생" },
              { text: "탈분극이 인접 부위에 국소 전류 형성 → 순차적 활동 전위 유발" },
              { text: "속도: 약 0.5~2m/s (느림)" },
            ],
          },
          {
            text: "도약 전도(Saltatory Conduction)",
            children: [
              { text: "말이집 신경(유수 신경)에서 발생" },
              { text: "랑비에 마디 → 다음 랑비에 마디로 뛰어넘듯 전달" },
              { text: "속도: 최대 120m/s (매우 빠름)" },
            ],
          },
          {
            text: "전도의 특성",
            children: [
              { text: "국소 전류에 의한 수동적 전파 (에너지 소모 없음)" },
              { text: "활동 전위 크기 일정 유지 (감쇠 없는 전도)" },
            ],
          },
          {
            text: "전도 속도 영향 요인",
            children: [
              { text: "축삭 지름 클수록 → 세포 내 저항 감소 → 속도 증가" },
              { text: "말이집 두꺼울수록 → 절연 효과 증가 → 속도 증가" },
              { text: "적정 범위 내 온도 높을수록 → 이온 채널 반응 속도 증가" },
            ],
          },
        ],
      },
      {
        id: "bio_ch4_s1_c7",
        label: "시냅스에서 흥분의 전달",
        nodes: [
          {
            text: "시냅스(Synapse)의 구조",
            children: [
              { text: "시냅스 이전 뉴런(Presynaptic Neuron)의 축삭 말단" },
              { text: "시냅스 틈(Synaptic Cleft, 약 20~40nm)" },
              { text: "시냅스 이후 뉴런(Postsynaptic Neuron)의 세포막" },
            ],
          },
          {
            text: "흥분 전달 과정 (6단계)",
            children: [
              { text: "① 활동 전위가 축삭 말단에 도달" },
              { text: "② 전압 개폐 Ca²⁺ 채널 개방 → Ca²⁺ 유입" },
              { text: "③ Ca²⁺에 의해 시냅스 소포가 세포막과 융합 (세포외 배출)" },
              { text: "④ 신경전달물질(예: 아세틸콜린, ACh) 시냅스 틈으로 방출" },
              { text: "⑤ 시냅스 이후 뉴런의 수용체(리간드 개폐 채널)에 결합 → 이온 채널 개방" },
              { text: "⑥ Na⁺ 유입 → 탈분극 → 흥분 전달 완료" },
            ],
          },
          {
            text: "전달 종료 후 처리",
            children: [
              { text: "효소에 의한 분해 (아세틸콜린에스터레이스가 ACh 분해)" },
              { text: "시냅스 이전 뉴런으로 재흡수" },
            ],
          },
          {
            text: "한 방향 전달의 이유",
            children: [
              { text: "신경전달물질: 시냅스 이전 뉴런에서만 분비" },
              { text: "수용체: 시냅스 이후 뉴런에만 존재" },
            ],
          },
        ],
      },
      {
        id: "bio_ch4_s1_c8",
        label: "흥분성 시냅스와 억제성 시냅스",
        nodes: [
          {
            text: "흥분성 시냅스(Excitatory Synapse)",
            children: [
              { text: "신경전달물질: 아세틸콜린, 글루탐산 등" },
              { text: "Na⁺ 채널 개방 → 탈분극 유도" },
              { text: "EPSP(흥분성 시냅스후 전위) 발생 → 흥분 촉진" },
            ],
          },
          {
            text: "억제성 시냅스(Inhibitory Synapse)",
            children: [
              { text: "신경전달물질: GABA, 글라이신 등" },
              { text: "Cl⁻ 유입 유도 또는 K⁺ 유출 증가 → 과분극" },
              { text: "IPSP(억제성 시냅스후 전위) 발생 → 흥분 억제" },
            ],
          },
          {
            text: "시냅스 통합(Synaptic Integration)",
            children: [
              { text: "하나의 뉴런에 수천~수만 개 시냅스 형성" },
              { text: "흥분성·억제성 신호의 합산으로 활동 전위 발생 여부 결정" },
              {
                text: "가중 방식",
                children: [
                  { text: "공간적 가중: 여러 시냅스 이전 뉴런의 동시 자극" },
                  { text: "시간적 가중: 같은 시냅스 이전 뉴런의 연속 자극" },
                ],
              },
              { text: "EPSP 합 ≥ 역치 → 활동 전위 발생, IPSP 우세 → 미발생" },
            ],
          },
        ],
      },
      {
        id: "bio_ch4_s1_c9",
        label: "역치와 실무율",
        nodes: [
          {
            text: "역치(Threshold): 활동 전위 발생 최소 자극 세기 (막전위 약 -55mV 도달 시점)",
          },
          {
            text: "역치하 자극과 국소 전위",
            children: [
              { text: "역치 미만 → 국소 전위(Local Potential)만 유발" },
              { text: "국소 전위: 자극 세기에 비례, 전도되지 않음" },
            ],
          },
          {
            text: "실무율(All-or-None Law)",
            children: [
              { text: "역치 이상 → 양성 피드백으로 Na⁺ 채널 연쇄 개방" },
              { text: "일정한 크기의 활동 전위(+35mV) 항상 동일하게 발생" },
              { text: "자극 강도가 아무리 강해도 활동 전위 크기 변하지 않음" },
            ],
          },
          {
            text: "자극 강도 인식 방법",
            children: [
              { text: "강한 자극 → 단위 시간당 활동 전위 빈도(Frequency) 증가" },
              { text: "강한 자극 → 흥분하는 뉴런의 수 증가" },
            ],
          },
        ],
      },
      {
        id: "bio_ch4_s1_c10",
        label: "흥분 전도 속도에 영향을 주는 요인",
        nodes: [
          {
            text: "3대 영향 요인",
            children: [
              {
                text: "① 말이집(수초) 유무 — 가장 큰 영향",
                children: [
                  { text: "유수 신경: 도약 전도 → 최대 120m/s" },
                  { text: "무수 신경: 연속 전도 → 0.5~2m/s" },
                ],
              },
              {
                text: "② 축삭 굵기(지름)",
                children: [
                  { text: "지름 클수록 세포 내 전기 저항 감소 → 국소 전류 빠르게 전파" },
                  { text: "예: 오징어 거대 축삭(Giant Axon) 약 1mm → 말이집 없이도 빠른 전도" },
                ],
              },
              {
                text: "③ 온도",
                children: [
                  { text: "적정 범위 내 높을수록 → 이온 채널 반응 속도·이온 이동 활발 → 속도 증가" },
                  { text: "체온(37°C) 크게 벗어나면 → 단백질 변성 → 전도 장애" },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "bio_ch4_s1_c11",
        label: "신경전달물질의 종류와 기능",
        nodes: [
          {
            text: "아세틸콜린(ACh)",
            children: [
              { text: "분비 부위: 운동 신경-근육 접합부, 부교감 신경 말단, 교감 절전 뉴런 말단" },
              { text: "기능: 골격근 수축, 심장 박동 억제(부교감)" },
            ],
          },
          {
            text: "노르에피네프린(NE)",
            children: [
              { text: "분비 부위: 교감 신경 절후 뉴런 말단" },
              { text: "기능: 심박수 증가, 혈압 상승, 기관지 확장 ('투쟁-도피 반응')" },
            ],
          },
          {
            text: "도파민(Dopamine)",
            children: [
              { text: "분비 부위: 중뇌 흑질, 복측 피개 영역" },
              { text: "기능: 운동 조절, 보상·쾌감 회로" },
              { text: "부족 → 파킨슨병(운동 장애), 과다 → 조현병(환각, 망상)" },
            ],
          },
          {
            text: "세로토닌(Serotonin, 5-HT)",
            children: [
              { text: "분비 부위: 뇌간 솔기핵" },
              { text: "기능: 기분 조절, 수면, 식욕, 체온 조절" },
              { text: "부족 → 우울증" },
            ],
          },
          {
            text: "GABA(Gamma-Aminobutyric Acid)",
            children: [
              { text: "중추 신경계 대표적 억제성 신경전달물질" },
              { text: "Cl⁻ 채널 개방 → 과분극 유도 → 흥분 억제" },
              { text: "불안 감소, 근육 이완 관여" },
              { text: "벤조디아제핀(항불안제): GABA 수용체 기능 강화" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "bio_ch4_s2",
    title: "신경계의 구성",
    summary:
      "중추 신경계와 말초 신경계의 구조와 기능, 자율 신경계의 길항 작용을 학습한다.",
    notes: [
      {
        id: "bio_ch4_s2_c1",
        label: "중추 신경계: 대뇌와 소뇌",
        nodes: [
          {
            text: "대뇌(Cerebrum)",
            children: [
              { text: "좌·우 대뇌 반구로 구성" },
              {
                text: "겉질(피질, Cortex) = 회색질",
                children: [
                  { text: "신경세포체 밀집, 두께 약 2~4mm" },
                  { text: "주름(이랑과 고랑) 발달 → 표면적 약 2,500cm²" },
                ],
              },
              { text: "속질(수질, Medulla) = 백색질: 신경섬유(축삭) 주행" },
              {
                text: "좌·우 반구 기능 분화",
                children: [
                  { text: "좌반구: 언어, 논리, 수학적 사고" },
                  { text: "우반구: 공간 인식, 예술, 감정 처리" },
                  { text: "뇌들보(뇌량, Corpus Callosum)로 양 반구 연결" },
                ],
              },
            ],
          },
          {
            text: "소뇌(Cerebellum)",
            children: [
              { text: "대뇌 뒤아래 위치" },
              { text: "기능: 몸의 평형 유지, 수의 운동의 정교한 조절(협응 운동)" },
              { text: "뉴런 수: 대뇌 겉질의 약 4배 → 복잡한 운동 학습·미세 조절 가능" },
              {
                text: "손상 시 증상",
                children: [
                  { text: "걸음걸이 불안정(운동 실조)" },
                  { text: "정밀 동작(글씨 쓰기, 단추 잠그기) 곤란" },
                  { text: "근육 긴장도 조절 장애" },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "bio_ch4_s2_c2",
        label: "대뇌 겉질의 구조와 기능 (엽별 기능)",
        nodes: [
          {
            text: "전두엽(Frontal Lobe) — 대뇌 앞쪽",
            children: [
              { text: "수의 운동 명령 (운동 겉질, Primary Motor Cortex)" },
              { text: "판단, 계획, 추론, 인격, 감정 조절 등 고등 정신 기능" },
              { text: "손상 시: 성격 변화, 판단력 저하, 충동 조절 장애 (피니어스 게이지 사례)" },
            ],
          },
          {
            text: "두정엽(Parietal Lobe) — 중심고랑 뒤쪽",
            children: [
              { text: "체성 감각 처리 (촉각, 압각, 온도, 통증)" },
              { text: "체성 감각 겉질(Primary Somatosensory Cortex) 위치" },
              { text: "감각 예민 부위(손끝, 입술)일수록 차지 면적 넓음" },
            ],
          },
          {
            text: "측두엽(Temporal Lobe) — 대뇌 옆쪽",
            children: [
              { text: "청각 정보 처리 (청각 겉질)" },
              { text: "언어 이해 (베르니케 영역, Wernicke's Area)" },
              { text: "해마(Hippocampus): 단기 기억 → 장기 기억 전환 핵심 역할" },
            ],
          },
          {
            text: "후두엽(Occipital Lobe) — 대뇌 가장 뒤쪽",
            children: [
              { text: "시각 정보 처리 (시각 겉질, Primary Visual Cortex)" },
              { text: "손상 시: 눈 정상이나 시각 처리 불가 → 피질 실명(Cortical Blindness)" },
            ],
          },
        ],
      },
      {
        id: "bio_ch4_s2_c3",
        label: "중추 신경계: 간뇌, 중간뇌, 연수",
        nodes: [
          {
            text: "간뇌(Diencephalon) — 대뇌와 중간뇌 사이",
            children: [
              {
                text: "시상(Thalamus)",
                children: [
                  { text: "후각 제외 모든 감각 정보의 중계소" },
                  { text: "감각 정보를 대뇌 겉질 해당 영역으로 전달" },
                ],
              },
              {
                text: "시상하부(Hypothalamus)",
                children: [
                  { text: "항상성 유지의 최고 중추 (체온, 혈장 삼투압, 혈당량, 수면-각성, 식욕, 갈증)" },
                  { text: "뇌하수체 통해 내분비계 조절 → 내분비계 최상위 조절 중추" },
                  { text: "뇌 전체의 약 1% 무게이지만 생존에 가장 필수적" },
                ],
              },
            ],
          },
          {
            text: "중간뇌(Midbrain, 중뇌) — 간뇌와 다리뇌 사이",
            children: [
              { text: "안구 운동, 홍채 반사(동공 크기 조절)" },
              { text: "청각·시각 반사 조절" },
            ],
          },
          {
            text: "연수(Medulla Oblongata, 숨뇌) — 뇌 가장 아래, 척수와 연결",
            children: [
              { text: "생명 유지 필수 기능: 심장 박동, 호흡 운동, 소화 운동, 혈압 조절" },
              { text: "반사 중추: 기침, 재채기, 하품, 딸꾹질, 구토" },
              { text: "손상 시 즉시 생명 위험 → '생명의 중추'" },
            ],
          },
          {
            text: "다리뇌(Pons, 교뇌) — 연수와 중간뇌 사이",
            children: [
              { text: "소뇌와 대뇌를 연결하는 다리 역할" },
            ],
          },
        ],
      },
      {
        id: "bio_ch4_s2_c4",
        label: "중추 신경계: 척수",
        nodes: [
          {
            text: "척수(Spinal Cord): 척추관 속 위치, 성인 약 45cm",
          },
          {
            text: "횡단면 구조",
            children: [
              {
                text: "내부: 나비(H) 모양 회색질",
                children: [
                  { text: "신경세포체, 연합 뉴런 위치" },
                  { text: "등쪽(후각): 감각 뉴런 축삭 말단 연결" },
                  { text: "배쪽(전각): 운동 뉴런 세포체 위치" },
                ],
              },
              {
                text: "주변부: 백색질",
                children: [
                  { text: "신경섬유 다발 (상행·하행 전도로)" },
                ],
              },
            ],
          },
          {
            text: "척수의 2대 기능",
            children: [
              {
                text: "전도 통로 역할",
                children: [
                  { text: "상행 전도로: 감각 정보를 뇌로 전달" },
                  { text: "하행 전도로: 운동 명령을 말초로 전달" },
                ],
              },
              {
                text: "척수 반사의 중추 역할",
                children: [
                  { text: "무릎 반사(슬개건 반사), 회피 반사 등" },
                ],
              },
            ],
          },
          {
            text: "척수 손상 시: 손상 부위 아래 감각·운동 기능 마비 (사지마비/하반신 마비)",
          },
        ],
      },
      {
        id: "bio_ch4_s2_c5",
        label: "척수 반사의 구체적 경로",
        nodes: [
          {
            text: "척수 반사(Spinal Reflex): 대뇌 거치지 않고 척수가 중추인 빠른 반사",
          },
          {
            text: "반사궁(Reflex Arc) 경로",
            children: [
              { text: "자극 → 수용기 → 감각 뉴런(구심성) → 연합 뉴런(척수 회색질) → 운동 뉴런(원심성) → 효과기(근육) → 반응" },
            ],
          },
          {
            text: "무릎 반사(슬개건 반사, Knee-Jerk Reflex)",
            children: [
              { text: "① 슬개건 두드림 → 대퇴사두근 근방추(Muscle Spindle) 자극 감지" },
              { text: "② 감각 뉴런이 흥분을 척수로 전달" },
              { text: "③ 감각 뉴런-운동 뉴런 직접 시냅스 (2개 뉴런 반사궁, 연합 뉴런 없음)" },
              { text: "④ 운동 뉴런이 대퇴사두근 수축 → 다리 올라감" },
              { text: "동시에 연합 뉴런 통해 길항근(대퇴이두근) 억제 → 이완 (상반 억제)" },
            ],
          },
          {
            text: "회피 반사: 3개 뉴런 반사궁 (감각-연합-운동)",
          },
          {
            text: "반사 중에도 감각 정보는 대뇌로 전달 → 의식적 인지 가능, 단 반응은 대뇌 판단 전에 먼저 발생 (약 50ms)",
          },
        ],
      },
      {
        id: "bio_ch4_s2_c6",
        label: "말초 신경계의 구분",
        nodes: [
          {
            text: "말초 신경계(PNS): 중추 신경계와 몸 각 부위를 연결하는 모든 신경",
            children: [
              { text: "12쌍 뇌신경 + 31쌍 척수 신경" },
            ],
          },
          {
            text: "체성 신경계(Somatic Nervous System)",
            children: [
              { text: "감각 신경(구심성): 수용기 → 중추" },
              { text: "운동 신경(원심성): 중추 → 골격근 (수의 운동)" },
              { text: "운동 신경: 1개 뉴런으로 중추에서 효과기까지 연결" },
              { text: "신경 말단에서 아세틸콜린 분비" },
              { text: "의식적 조절 가능" },
            ],
          },
          {
            text: "자율 신경계(Autonomic Nervous System)",
            children: [
              { text: "내장 기관, 혈관, 분비샘 등 불수의적 기능 조절" },
              { text: "2개 뉴런(절전 뉴런 + 절후 뉴런)이 신경절 경유하여 효과기 연결" },
              { text: "교감 신경 + 부교감 신경으로 구분 → 길항적 작용" },
              { text: "의식과 무관하게 자동 조절" },
            ],
          },
        ],
      },
      {
        id: "bio_ch4_s2_c7",
        label: "자율 신경계: 교감 신경과 부교감 신경",
        nodes: [
          {
            text: "교감 신경(Sympathetic Nerve)",
            children: [
              { text: "기원: 척수 흉추·요추" },
              { text: "구조: 절전 뉴런 짧음, 절후 뉴런 김" },
              { text: "신경전달물질: 절전 말단 ACh, 절후 말단 노르에피네프린(NE)" },
              { text: "예외: 부신 속질 자극 시 에피네프린 분비" },
            ],
          },
          {
            text: "부교감 신경(Parasympathetic Nerve)",
            children: [
              { text: "기원: 중간뇌·연수·척수 천추(S2~S4)" },
              { text: "구조: 절전 뉴런 김, 절후 뉴런 짧음" },
              { text: "신경전달물질: 절전·절후 말단 모두 ACh" },
            ],
          },
          {
            text: "교감 신경 흥분 시 효과 (투쟁-도피 반응)",
            children: [
              { text: "동공 확대, 심장 박동 촉진, 기관지 확장" },
              { text: "소화 운동 억제, 방광 이완(배뇨 억제)" },
              { text: "혈관 수축(혈압 상승), 땀 분비 촉진" },
              { text: "간에서 글리코젠 분해 촉진" },
            ],
          },
          {
            text: "부교감 신경 흥분 시 효과 (휴식-소화 반응)",
            children: [
              { text: "동공 축소, 심장 박동 억제, 기관지 수축" },
              { text: "소화 운동 촉진, 방광 수축(배뇨 촉진)" },
              { text: "침 분비 촉진" },
            ],
          },
        ],
      },
      {
        id: "bio_ch4_s2_c8",
        label: "무조건 반사와 조건 반사",
        nodes: [
          {
            text: "무조건 반사(Unconditional Reflex, 선천적 반사)",
            children: [
              { text: "태어날 때부터 갖추어진 반사" },
              { text: "대뇌 관여 없이 척수·연수 등이 중추" },
              {
                text: "대표 예",
                children: [
                  { text: "무릎 반사 (중추: 척수)" },
                  { text: "회피 반사 (중추: 척수)" },
                  { text: "침 분비 반사 — 음식이 구강에 들어올 때 (중추: 연수)" },
                  { text: "재채기·기침 (중추: 연수)" },
                  { text: "동공 반사 — 빛에 의한 동공 수축 (중추: 중간뇌)" },
                ],
              },
            ],
          },
          {
            text: "조건 반사(Conditional Reflex, 후천적 반사)",
            children: [
              { text: "학습과 경험에 의해 후천적으로 형성" },
              { text: "중추: 대뇌 겉질" },
              {
                text: "파블로프(Pavlov) 개 실험",
                children: [
                  { text: "음식(무조건 자극) + 종소리(중성 자극) 반복 제시" },
                  { text: "종소리(조건 자극)만으로 침 분비 → 조건 반사 형성" },
                ],
              },
              { text: "예: 매실 보고 침 나오기, 급브레이크 소리에 긴장" },
            ],
          },
          {
            text: "핵심 차이: 중추 위치(척수·연수 vs 대뇌 겉질), 형성 시기(선천적 vs 후천적)",
          },
        ],
      },
      {
        id: "bio_ch4_s2_c9",
        label: "뉴런의 종류와 신경 경로",
        nodes: [
          {
            text: "뉴런의 기능별 분류",
            children: [
              {
                text: "감각 뉴런(구심성 뉴런, Afferent Neuron)",
                children: [
                  { text: "수용기 → 중추 신경계로 자극 전달" },
                  { text: "세포체: 척수 후근 신경절 위치" },
                  { text: "형태: 위단극 뉴런(Pseudounipolar Neuron)" },
                ],
              },
              {
                text: "연합 뉴런(사이 뉴런, Interneuron)",
                children: [
                  { text: "중추 신경계(뇌, 척수) 내에서만 존재" },
                  { text: "감각 정보 통합·처리 → 적절한 반응 결정" },
                  { text: "전체 뉴런의 약 99% 차지" },
                ],
              },
              {
                text: "운동 뉴런(원심성 뉴런, Efferent Neuron)",
                children: [
                  { text: "중추 명령 → 효과기(골격근, 분비샘)로 전달" },
                  { text: "세포체: 척수 전각 또는 뇌간 위치" },
                  { text: "형태: 다극 뉴런(Multipolar Neuron)" },
                ],
              },
            ],
          },
          {
            text: "의식적 반응 경로",
            children: [
              { text: "수용기 → 감각 뉴런 → 척수(상행 전도로) → 대뇌(인지·판단) → 척수(하행 전도로) → 운동 뉴런 → 효과기" },
            ],
          },
          {
            text: "척수 반사 경로",
            children: [
              { text: "수용기 → 감각 뉴런 → 척수 연합 뉴런 → 운동 뉴런 → 효과기" },
              { text: "대뇌 비경유 → 반응 속도 매우 빠름" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "bio_ch4_s3",
    title: "내분비계와 호르몬",
    summary:
      "호르몬의 특성과 주요 내분비샘의 기능, 혈당량·체온·삼투압의 항상성 조절 메커니즘을 학습한다.",
    notes: [
      {
        id: "bio_ch4_s3_c1",
        label: "호르몬의 특성",
        nodes: [
          {
            text: "호르몬(Hormone): 내분비샘(Endocrine Gland)에서 생성, 혈액으로 운반되는 화학 신호 물질",
          },
          {
            text: "내분비샘 vs 외분비샘",
            children: [
              { text: "내분비샘: 분비관(도관) 없음 → 혈액으로 직접 분비" },
              { text: "외분비샘(땀샘, 침샘 등): 분비관 통해 분비물 방출" },
            ],
          },
          {
            text: "호르몬의 특징",
            children: [
              { text: "매우 미량(ng~μg 수준)으로 작용" },
              { text: "표적 기관 특이성(Target Specificity): 특정 수용체 가진 세포에만 작용" },
              { text: "자물쇠-열쇠 모델: 호르몬 = 열쇠, 수용체 = 자물쇠" },
              { text: "혈류 운반 → 효과 발현까지 수초~수분 소요" },
              { text: "효과 지속적(수분~수시간), 전신적·광범위" },
            ],
          },
          {
            text: "호르몬 농도 조절: 음성 피드백에 의한 정밀 조절",
          },
        ],
      },
      {
        id: "bio_ch4_s3_c2",
        label: "호르몬의 분류: 수용성과 지용성",
        nodes: [
          {
            text: "수용성 호르몬(Water-Soluble Hormone)",
            children: [
              {
                text: "종류",
                children: [
                  { text: "펩타이드 호르몬: 인슐린, 글루카곤, 생장 호르몬, ADH 등" },
                  { text: "아미노산 유도체: 에피네프린, 노르에피네프린 등" },
                ],
              },
              {
                text: "작용 메커니즘",
                children: [
                  { text: "세포막 통과 불가 → 세포 표면 막 수용체에 결합" },
                  { text: "2차 전달자(Second Messenger, 예: cAMP) 활성화" },
                  { text: "효소 활성 변화 → 빠른 효과(수초~수분)" },
                ],
              },
            ],
          },
          {
            text: "지용성 호르몬(Lipid-Soluble Hormone)",
            children: [
              {
                text: "종류",
                children: [
                  { text: "스테로이드 호르몬: 에스트로겐, 테스토스테론, 코르티솔, 알도스테론" },
                  { text: "갑상샘 호르몬: 티록신(T₃/T₄)" },
                ],
              },
              {
                text: "작용 메커니즘",
                children: [
                  { text: "세포막 통과 → 세포질/핵 내 수용체에 결합" },
                  { text: "호르몬-수용체 복합체가 DNA 전사 조절" },
                  { text: "특정 단백질 합성 촉진·억제 → 효과 발현 느림(수시간~수일), 오래 지속" },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "bio_ch4_s3_c3",
        label: "주요 내분비샘과 호르몬",
        nodes: [
          {
            text: "시상하부(Hypothalamus)",
            children: [
              { text: "방출 호르몬(Releasing Hormone) + 억제 호르몬(Inhibiting Hormone) 분비" },
              { text: "뇌하수체 전엽 조절" },
            ],
          },
          {
            text: "뇌하수체 전엽(Anterior Pituitary)",
            children: [
              { text: "생장 호르몬(GH): 뼈·근육 성장 촉진" },
              { text: "갑상샘 자극 호르몬(TSH)" },
              { text: "부신 겉질 자극 호르몬(ACTH)" },
              { text: "여포 자극 호르몬(FSH), 황체 형성 호르몬(LH)" },
              { text: "프로락틴(PRL): 젖 분비 촉진" },
            ],
          },
          {
            text: "뇌하수체 후엽(Posterior Pituitary)",
            children: [
              { text: "항이뇨 호르몬(ADH, 바소프레신): 시상하부에서 합성, 후엽에서 분비" },
              { text: "옥시토신: 자궁 수축, 젖 사출" },
            ],
          },
          {
            text: "갑상샘(Thyroid Gland)",
            children: [
              { text: "티록신(T₃/T₄): 물질대사 촉진 (요오드 필요)" },
              { text: "칼시토닌: 혈중 Ca²⁺ 농도 감소" },
            ],
          },
          {
            text: "부갑상샘(Parathyroid Gland)",
            children: [
              { text: "부갑상샘 호르몬(PTH): 혈중 Ca²⁺ 농도 증가" },
            ],
          },
          {
            text: "부신(Adrenal Gland)",
            children: [
              {
                text: "겉질(Adrenal Cortex)",
                children: [
                  { text: "당질 코르티코이드(코르티솔): 혈당 상승, 항염증" },
                  { text: "무기질 코르티코이드(알도스테론): Na⁺ 재흡수 촉진" },
                ],
              },
              {
                text: "속질(Adrenal Medulla)",
                children: [
                  { text: "에피네프린(아드레날린): 교감 신경 자극 시 분비" },
                  { text: "교감 신경 효과 강화·지속" },
                ],
              },
            ],
          },
          {
            text: "이자(Pancreas, 췌장) — 랑게르한스섬",
            children: [
              { text: "인슐린: B세포(β세포) 분비, 혈당 감소" },
              { text: "글루카곤: A세포(α세포) 분비, 혈당 증가" },
            ],
          },
        ],
      },
      {
        id: "bio_ch4_s3_c4",
        label: "혈당량 조절",
        nodes: [
          {
            text: "정상 혈당: 약 0.1% (70~110mg/dL)",
          },
          {
            text: "식사 후 혈당 상승 시 → 인슐린(Insulin) 분비 (이자 B세포)",
            children: [
              { text: "세포막 포도당 수송체(GLUT4) 활성화 → 근육·지방 세포 포도당 흡수 촉진" },
              { text: "간에서 포도당 → 글리코젠 합성(Glycogenesis) 촉진" },
              { text: "지방 합성, 단백질 합성 촉진" },
              { text: "결과: 혈당 감소" },
            ],
          },
          {
            text: "공복 시 혈당 하락 시 → 글루카곤(Glucagon) 분비 (이자 A세포)",
            children: [
              { text: "간에서 글리코젠 → 포도당 분해(Glycogenolysis) 촉진" },
              { text: "포도당신생합성(Gluconeogenesis): 아미노산·글리세롤 등으로부터 포도당 합성" },
              { text: "결과: 혈당 증가" },
            ],
          },
          {
            text: "혈당 상승 보조 호르몬",
            children: [
              { text: "부신 속질 에피네프린" },
              { text: "부신 겉질 코르티솔" },
            ],
          },
          {
            text: "음성 피드백(Negative Feedback): 혈당 정상 범위 복귀 → 해당 호르몬 분비 감소",
          },
        ],
      },
      {
        id: "bio_ch4_s3_c5",
        label: "당뇨병의 원인과 유형",
        nodes: [
          {
            text: "당뇨병(Diabetes Mellitus): 혈당 조절 실패 → 만성 고혈당 지속 질환",
          },
          {
            text: "제1형 당뇨병(Type 1, 인슐린 의존형)",
            children: [
              { text: "원인: 자가면역 반응 → 이자 B세포(β세포) 파괴 → 인슐린 미분비" },
              { text: "발병 시기: 주로 소아·청소년기" },
              { text: "치료: 외부 인슐린 투여(인슐린 주사) 필수" },
            ],
          },
          {
            text: "제2형 당뇨병(Type 2, 인슐린 비의존형)",
            children: [
              { text: "원인: 인슐린 저항성(Insulin Resistance) — 인슐린 정상 분비되나 표적 세포 반응 불량" },
              { text: "관련 요인: 비만, 운동 부족, 유전적 요인" },
              { text: "전체 당뇨 환자의 약 90~95%" },
            ],
          },
          {
            text: "당뇨병 3대 증상",
            children: [
              { text: "다뇨(polyuria): 소변량 증가" },
              { text: "다음(polydipsia): 갈증·수분 섭취 증가" },
              { text: "다식(polyphagia): 식욕 증가" },
            ],
          },
          {
            text: "발생 기전: 혈당 약 180mg/dL(신장 역치) 초과 시 소변으로 포도당 배출 → 삼투압 차이로 수분도 배출 → 다뇨·탈수",
          },
          {
            text: "장기 합병증: 혈관 손상, 신경 손상, 신장 질환, 망막 질환",
          },
        ],
      },
      {
        id: "bio_ch4_s3_c6",
        label: "체온 조절",
        nodes: [
          {
            text: "조절 중추: 간뇌 시상하부 (혈액 온도 변화 감지 + 피부 온도 수용기 정보 종합)",
          },
          {
            text: "체온 상승 시 반응",
            children: [
              { text: "피부 혈관 확장 → 혈류량 증가 → 열 방출 촉진" },
              { text: "땀샘 땀 분비 증가 → 기화열에 의한 열 방출" },
              { text: "물질대사 억제 → 열 생산 감소" },
              { text: "교감 신경 활성 감소, 부교감 신경 활성 증가" },
            ],
          },
          {
            text: "체온 하강 시 반응",
            children: [
              { text: "피부 혈관 수축 → 열 방출 감소" },
              { text: "골격근 떨림(Shivering) → 열 생산" },
              { text: "티록신·에피네프린 분비 증가 → 물질대사(세포 호흡) 촉진 → 열 생산 증가" },
              { text: "교감 신경 활성화 → 피부 혈관 수축 + 입모근 수축(닭살)" },
            ],
          },
          {
            text: "신경성 조절(교감 신경) + 호르몬성 조절(티록신·에피네프린)의 협동 작용",
          },
        ],
      },
      {
        id: "bio_ch4_s3_c7",
        label: "삼투압 조절(수분량 조절)",
        nodes: [
          {
            text: "감지: 시상하부 삼투압 수용체(Osmoreceptor)",
          },
          {
            text: "조절 호르몬: 항이뇨 호르몬(ADH, 바소프레신) — 뇌하수체 후엽 분비",
          },
          {
            text: "혈장 삼투압 높을 때 (수분 부족 / 염분 과다)",
            children: [
              { text: "시상하부 삼투압 수용체 감지 → ADH 분비 증가" },
              { text: "콩팥 집합관 아쿠아포린(Aquaporin) 삽입 촉진 → 수분 재흡수 증가" },
              { text: "결과: 농축된 소량의 고장성 오줌(진한 소변) 배출" },
            ],
          },
          {
            text: "혈장 삼투압 낮을 때 (수분 과다)",
            children: [
              { text: "ADH 분비 감소 → 집합관 수분 재흡수 감소" },
              { text: "결과: 묽고 많은 양의 저장성 오줌(묽은 소변) 배출" },
            ],
          },
          {
            text: "알도스테론(Aldosterone) — 부신 겉질 분비",
            children: [
              { text: "콩팥 세뇨관에서 Na⁺ 재흡수 촉진 → 혈장 삼투압 상승 방향" },
            ],
          },
          {
            text: "시상하부 = 갈증 중추: 삼투압 상승 시 갈증 유발 → 수분 섭취 유도",
          },
        ],
      },
      {
        id: "bio_ch4_s3_c8",
        label: "음성 피드백 메커니즘 상세",
        nodes: [
          {
            text: "음성 피드백(Negative Feedback): 호르몬 농도 일정 수준 이상 → 분비 억제 → 정상 범위 복귀",
          },
          {
            text: "시상하부-뇌하수체-갑상샘 축(HPT Axis)",
            children: [
              { text: "① 시상하부 → TRH 분비" },
              { text: "② 뇌하수체 전엽 → TSH 분비" },
              { text: "③ 갑상샘 → 티록신(T₃/T₄) 분비" },
              { text: "④ 티록신 농도 상승 → 시상하부·뇌하수체에 음성 피드백 → TRH·TSH 분비 억제" },
              { text: "⑤ TRH·TSH 감소 → 티록신 분비도 감소" },
            ],
          },
          {
            text: "유사한 축 구조",
            children: [
              { text: "HPA Axis: CRH → ACTH → 코르티솔" },
              { text: "HPG Axis: GnRH → FSH/LH → 성호르몬" },
            ],
          },
          {
            text: "임상 진단 적용",
            children: [
              { text: "갑상샘 기능 항진증: 티록신 과다 → TSH 억제(낮음)" },
              { text: "갑상샘 기능 저하증: 티록신 부족 → TSH 상승(높음)" },
            ],
          },
        ],
      },
      {
        id: "bio_ch4_s3_c9",
        label: "호르몬과 신경의 비교",
        nodes: [
          {
            text: "신경(Nervous System) 신호 전달",
            children: [
              { text: "전달 매체: 전기 신호(활동 전위)" },
              { text: "전달 속도: 매우 빠름 (밀리초 단위)" },
              { text: "작용 범위: 신경 연결된 특정 효과기에만 정확히 전달" },
              { text: "효과: 즉각적, 짧게 지속" },
              { text: "뉴런 수: 체성 1개, 자율 2개(절전+절후)" },
            ],
          },
          {
            text: "호르몬(Endocrine System) 신호 전달",
            children: [
              { text: "전달 매체: 화학 물질(호르몬), 혈액 운반" },
              { text: "전달 속도: 느림 (수초~수분 소요)" },
              { text: "작용 범위: 수용체 가진 전신 표적 세포에 광범위" },
              { text: "효과: 오래 지속 (수분~수시간)" },
            ],
          },
          {
            text: "항상성 유지에서의 협력",
            children: [
              { text: "체온 조절: 교감 신경(신경성) + 티록신·에피네프린(호르몬성) 동시 관여" },
              { text: "혈당 조절: 자율 신경이 이자 호르몬 분비 직접 조절" },
              { text: "부신 속질 = 교감 신경 절후 뉴런에 해당 → 신경-호르몬 접점" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "bio_ch4_s4",
    title: "방어 작용(면역)",
    summary:
      "비특이적 방어(선천 면역)와 특이적 방어(적응 면역), 면역 관련 질병 및 예방 접종의 원리를 학습한다.",
    notes: [
      {
        id: "bio_ch4_s4_c1",
        label: "비특이적 방어: 1차 방어",
        nodes: [
          {
            text: "1차 방어(First Line of Defense): 병원체 체내 침입 자체를 막는 물리적·화학적 장벽",
          },
          {
            text: "물리적 방어",
            children: [
              {
                text: "피부",
                children: [
                  { text: "가장 넓은 방어 장벽" },
                  { text: "표피 각질층: 케라틴 단백질 → 병원체 침투 차단" },
                ],
              },
              {
                text: "호흡기 점막",
                children: [
                  { text: "점액(Mucus) 분비 → 먼지·미생물 포획" },
                  { text: "섬모(Cilia) 파동 운동 → 이물질을 인두 쪽으로 제거 (점액섬모 에스컬레이터)" },
                ],
              },
            ],
          },
          {
            text: "화학적 방어",
            children: [
              { text: "피부 땀·피지 — 지방산·젖산 → 산성 환경(pH 3~5) → 세균 증식 억제" },
              { text: "라이소자임(Lysozyme) — 눈물·침·콧물에 포함 → 세균 세포벽(펩티도글리칸) 분해" },
              { text: "위액 — 강산성(pH 1.5~3.5, HCl) → 대부분 병원체 사멸" },
              { text: "담즙(쓸개즙) — 지질 유화 + 일부 세균 파괴" },
              { text: "비뇨·생식기 약산성 환경 + 정상 세균총(Microbiome) 경쟁적 배제" },
            ],
          },
        ],
      },
      {
        id: "bio_ch4_s4_c2",
        label: "비특이적 방어: 2차 방어",
        nodes: [
          {
            text: "2차 방어(Second Line of Defense): 체내 침입 병원체에 대한 비특이적 내부 방어",
          },
          {
            text: "식균 작용(Phagocytosis)",
            children: [
              {
                text: "호중구(Neutrophil)",
                children: [
                  { text: "혈중 백혈구의 약 60~70%" },
                  { text: "가장 먼저 감염 부위 도착" },
                ],
              },
              {
                text: "대식세포(Macrophage)",
                children: [
                  { text: "조직 상주, 식균 + 항원 제시 기능 동시 수행" },
                  { text: "리소좀의 소화 효소로 병원체 분해" },
                ],
              },
            ],
          },
          {
            text: "염증 반응(Inflammation)",
            children: [
              { text: "비만세포(Mast Cell) → 히스타민(Histamine) 분비" },
              { text: "모세혈관 확장 + 투과성 증가 → 백혈구·혈장 단백질 이동 촉진" },
              {
                text: "염증 4대 증상",
                children: [
                  { text: "발적(Redness): 혈류 증가" },
                  { text: "열감(Heat)" },
                  { text: "부종(Swelling): 혈장 유출" },
                  { text: "통증(Pain): 신경 자극" },
                ],
              },
            ],
          },
          {
            text: "자연살해세포(NK Cell)",
            children: [
              { text: "바이러스 감염 세포·암세포 인식" },
              { text: "퍼포린(Perforin) 분비 → 세포막 구멍 → 파괴" },
              { text: "항원 특이적이지 않음 (적응 면역과 차이)" },
            ],
          },
          {
            text: "보체 시스템(Complement System)",
            children: [
              { text: "약 30종 혈장 단백질이 연쇄 활성화" },
              { text: "막 공격 복합체(MAC) 형성 → 병원체 용해" },
              { text: "옵소닌화: 병원체 표면 결합 → 식균 작용 촉진" },
            ],
          },
          {
            text: "발열(Fever)",
            children: [
              { text: "대식세포 분비 인터류킨-1(IL-1) 등 → 시상하부 체온 설정점 상향" },
              { text: "적절한 발열: 면역세포 활성 증가 + 병원체 증식 억제" },
            ],
          },
        ],
      },
      {
        id: "bio_ch4_s4_c3",
        label: "특이적 방어: 세포성 면역",
        nodes: [
          {
            text: "세포성 면역(Cell-Mediated Immunity): T 세포 중심, 감염 세포 직접 공격하는 적응 면역",
          },
          {
            text: "T 세포: 골수 생성 → 가슴샘(Thymus) 성숙, TCR로 MHC 제시 항원 인식",
          },
          {
            text: "세포성 면역 과정",
            children: [
              { text: "① 대식세포(APC) → 병원체 식균·분해 → 항원 조각을 MHC에 실어 표면 제시" },
              {
                text: "② 보조 T 세포(Helper T, CD4⁺) 활성화",
                children: [
                  { text: "MHC II 제시 항원 인식" },
                  { text: "인터류킨-2(IL-2) 등 사이토카인(Cytokine) 분비" },
                  { text: "세포독성 T 세포 + B 세포 활성화 촉진" },
                ],
              },
              {
                text: "③ 세포독성 T 세포(Cytotoxic T, CD8⁺, 킬러 T) 활성화",
                children: [
                  { text: "MHC I 제시 항원 인식" },
                  { text: "바이러스 감염 세포·암세포 직접 파괴" },
                  { text: "퍼포린(Perforin) → 세포막 구멍 + 그랜자임(Granzyme) → 세포자멸사(Apoptosis)" },
                ],
              },
              { text: "④ 일부 T 세포 → 기억 T 세포로 분화 → 2차 면역 반응 대비" },
            ],
          },
          {
            text: "세포성 면역 주요 역할: 세포 내 감염(바이러스, 결핵균), 이식 거부 반응, 암세포 감시",
          },
        ],
      },
      {
        id: "bio_ch4_s4_c4",
        label: "특이적 방어: 체액성 면역",
        nodes: [
          {
            text: "체액성 면역(Humoral Immunity): B 세포가 항체 생산, 체액 속 병원체·독소 제거",
          },
          {
            text: "B 세포: 골수(Bone Marrow) 생성·성숙, BCR로 항원 직접 인식",
          },
          {
            text: "체액성 면역 과정",
            children: [
              { text: "① B 세포가 BCR 통해 특정 항원 인식" },
              { text: "② 활성화된 보조 T 세포 → 사이토카인 분비 → B 세포 활성화 촉진" },
              { text: "③ B 세포 빠르게 증식 (클론 선택, Clonal Selection)" },
              {
                text: "④ 형질세포(Plasma Cell)로 분화",
                children: [
                  { text: "초당 약 2,000개 항체 분비 ('항체 공장')" },
                  { text: "대량 항체 → 혈액·체액으로 방출" },
                ],
              },
              {
                text: "⑤ 기억세포(Memory B Cell)로 일부 분화",
                children: [
                  { text: "수년~수십 년 체내 잔존" },
                  { text: "같은 항원 재침입 시 빠르고 강력한 2차 면역 반응" },
                ],
              },
            ],
          },
          {
            text: "항체(Antibody, Immunoglobulin, Ig) 구조",
            children: [
              { text: "Y자 형태: 2개 중쇄(Heavy Chain) + 2개 경쇄(Light Chain)" },
              { text: "가변 영역(Variable Region): Y자 양 끝 = 항원 결합 부위" },
            ],
          },
          {
            text: "항체 종류",
            children: [
              { text: "IgG: 혈중 가장 많음, 태반 통과" },
              { text: "IgM: 1차 면역 반응 초기" },
              { text: "IgA: 점막 분비물" },
              { text: "IgE: 알레르기 관여" },
              { text: "IgD: B세포 표면" },
            ],
          },
        ],
      },
      {
        id: "bio_ch4_s4_c5",
        label: "항원항체 반응",
        nodes: [
          {
            text: "항원(Antigen): 면역 반응 유발 물질 (주로 병원체 표면 단백질·다당류)",
          },
          {
            text: "항체의 특이성: 자물쇠-열쇠 모델 → 특정 항원에만 결합",
          },
          {
            text: "항원항체 반응 종류",
            children: [
              {
                text: "응집 반응(Agglutination)",
                children: [
                  { text: "항체가 여러 병원체를 교차 결합 → 큰 덩어리 형성" },
                  { text: "식세포 식균 작용 용이하게 함" },
                  { text: "예: ABO 혈액형 판정 시 적혈구 응집" },
                ],
              },
              {
                text: "중화 반응(Neutralization)",
                children: [
                  { text: "항체가 독소·바이러스 활성 부위에 결합 → 활성 차단" },
                  { text: "예: 파상풍 항독소" },
                ],
              },
              {
                text: "옵소닌화(Opsonization)",
                children: [
                  { text: "항체·보체 C3b가 병원체 표면 결합" },
                  { text: "식세포 Fc 수용체 인식 → 식균 작용 효율 약 4,000배 증가" },
                ],
              },
              {
                text: "보체 활성화(Complement Activation)",
                children: [
                  { text: "항원-항체 복합체 → 고전 경로(Classical Pathway) → 보체 활성화" },
                  { text: "막 공격 복합체(MAC) 형성 → 병원체 용해" },
                ],
              },
              {
                text: "항체 의존성 세포 독성(ADCC)",
                children: [
                  { text: "NK 세포가 항체 코팅된 표적 세포 인식 → 파괴" },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "bio_ch4_s4_c6",
        label: "1차 면역 반응과 2차 면역 반응",
        nodes: [
          {
            text: "1차 면역 반응(Primary Immune Response)",
            children: [
              { text: "항원 최초 침입 시 발생" },
              { text: "잠복기(Lag Phase) 약 5~10일: B 세포 인식 → 클론 증식 → 형질세포 분화" },
              { text: "항체 생산량 상대적으로 적음" },
              { text: "초기 IgM 분비 → 이후 IgG로 클래스 전환(Class Switching)" },
              { text: "기억 B 세포 + 기억 T 세포 형성" },
            ],
          },
          {
            text: "2차 면역 반응(Secondary Immune Response)",
            children: [
              { text: "같은 항원 재침입 시 기억세포 빠르게 활성화" },
              { text: "항체 생산 1~3일 이내 개시" },
              { text: "항체 양: 1차 반응보다 약 100~1,000배 많음" },
              { text: "주로 친화도 높은 IgG 분비" },
              { text: "항체 고농도 유지 기간 훨씬 김" },
            ],
          },
          {
            text: "예방 접종(Vaccination)의 원리",
            children: [
              { text: "백신으로 1차 면역 반응 유도 → 기억세포 형성" },
              { text: "실제 병원체 침입 시 → 강력한 2차 면역 반응으로 신속 대응" },
            ],
          },
        ],
      },
      {
        id: "bio_ch4_s4_c7",
        label: "면역과 질병: 자가면역 질환",
        nodes: [
          {
            text: "자가 면역 질환(Autoimmune Disease): 면역 관용 붕괴 → 자기 세포·조직 공격",
            children: [
              { text: "정상: 가슴샘에서 자기 반응 T 세포 제거(음성 선택), 골수에서 자기 반응 B 세포 제거" },
              { text: "이상 시: 자기 항원에 대한 면역 반응 발생" },
            ],
          },
          {
            text: "대표 질환",
            children: [
              {
                text: "류마티스 관절염(RA)",
                children: [
                  { text: "관절 활막(Synovial Membrane) 공격 → 만성 염증, 관절 변형, 통증" },
                  { text: "특징: 좌우 대칭적 소관절(손가락, 손목) 침범" },
                ],
              },
              {
                text: "전신성 홍반성 루푸스(SLE)",
                children: [
                  { text: "항핵항체(ANA)가 자기 DNA·히스톤 공격" },
                  { text: "피부(나비 모양 발진), 관절, 신장, 심장, 뇌 등 전신 침범" },
                ],
              },
              { text: "제1형 당뇨병: T 세포가 이자 β세포 파괴 → 인슐린 분비 소실" },
              { text: "다발성 경화증: T 세포가 신경 수초 공격" },
              { text: "하시모토 갑상샘염: 갑상샘 세포 파괴" },
              { text: "그레이브스병: TSH 수용체 자극 자가항체 → 갑상샘 기능 항진" },
            ],
          },
          {
            text: "원인 요인: 유전적 소인, 환경적 요인(감염, 스트레스), 분자 모방(Molecular Mimicry)",
          },
        ],
      },
      {
        id: "bio_ch4_s4_c8",
        label: "면역과 질병: 알레르기와 아나필락시스",
        nodes: [
          {
            text: "알레르기(Allergy): 무해한 항원(알레르겐)에 면역계가 과도하게 반응하는 현상",
            children: [
              { text: "알레르겐 예: 꽃가루, 먼지 진드기, 동물 비듬, 특정 음식, 약물" },
            ],
          },
          {
            text: "발생 기전 (Type I 과민반응)",
            children: [
              { text: "① 최초 알레르겐 노출 → B 세포가 IgE 항체 생산" },
              { text: "② IgE가 비만세포·호염구 표면 Fc 수용체에 결합 → 감작(Sensitization)" },
              { text: "③ 같은 알레르겐 재침입 → 비만세포 표면 IgE에 결합" },
              { text: "④ IgE 교차결합 → 비만세포 탈과립(Degranulation)" },
              {
                text: "⑤ 히스타민, 류코트리엔, 프로스타글란딘 등 대량 방출",
                children: [
                  { text: "혈관 확장, 모세혈관 투과성 증가, 점액 분비 증가, 기관지 수축" },
                  { text: "증상: 재채기, 콧물, 가려움, 두드러기, 천식" },
                ],
              },
            ],
          },
          {
            text: "아나필락시스(Anaphylaxis)",
            children: [
              { text: "가장 심각한 전신적 알레르기 반응" },
              { text: "전신 비만세포 동시 탈과립 → 급격한 혈압 하강(쇼크), 기도 부종, 호흡 곤란" },
              { text: "즉시 에피네프린(아드레날린) 주사 필수 → 미투여 시 사망 위험" },
            ],
          },
          {
            text: "항히스타민제: 히스타민 수용체 차단 → 알레르기 증상 완화",
          },
        ],
      },
      {
        id: "bio_ch4_s4_c9",
        label: "면역과 질병: HIV/AIDS",
        nodes: [
          {
            text: "HIV(Human Immunodeficiency Virus): 레트로바이러스, RNA 유전 물질",
            children: [
              { text: "역전사효소(Reverse Transcriptase) → 숙주 DNA에 유전 정보 삽입" },
              { text: "표적: 보조 T 세포(CD4⁺ T Cell)" },
              { text: "침입 경로: CD4 수용체 + CCR5/CXCR4 보조수용체" },
            ],
          },
          {
            text: "감염 진행 과정",
            children: [
              {
                text: "① 급성 감염기 (2~4주)",
                children: [
                  { text: "감기 유사 증상 (발열, 피로, 림프절 종대)" },
                  { text: "바이러스 급증 → CD4⁺ T 세포 급감 → 면역 반응으로 일시적 억제" },
                ],
              },
              {
                text: "② 무증상 잠복기 (수년~10년+)",
                children: [
                  { text: "증상 없이 바이러스가 CD4⁺ T 세포 서서히 파괴" },
                  { text: "혈중 바이러스 낮으나 림프절 등에서 지속 복제" },
                ],
              },
              {
                text: "③ AIDS 발병기",
                children: [
                  { text: "CD4⁺ T 세포 200개/μL 이하 (정상: 800~1,200개/μL)" },
                  { text: "면역 체계 붕괴 → 기회감염(결핵, 폐렴, 칸디다증) + 카포시 육종 등" },
                ],
              },
            ],
          },
          {
            text: "보조 T 세포 파괴의 영향: 세포성 면역 + 체액성 면역 모두 약화 (활성화에 필수적이므로)",
          },
          {
            text: "전파 경로: 혈액, 정액, 질 분비물, 모유",
          },
          {
            text: "치료: 항레트로바이러스 치료(ART) → 바이러스 복제 억제, AIDS 발병 지연 (완치 어려움)",
          },
        ],
      },
      {
        id: "bio_ch4_s4_c10",
        label: "MHC와 장기이식",
        nodes: [
          {
            text: "MHC(Major Histocompatibility Complex): 세포 표면 당단백질, '분자적 신분증'",
            children: [
              { text: "사람의 MHC = HLA(Human Leukocyte Antigen)" },
              { text: "HLA 유전자: 6번 염색체, 매우 다양한 대립유전자(다형성)" },
            ],
          },
          {
            text: "MHC 종류 비교",
            children: [
              {
                text: "MHC I (Class I)",
                children: [
                  { text: "발현: 거의 모든 유핵세포" },
                  { text: "제시 대상: 세포 내부 합성 단백질 조각 (바이러스 단백질, 암 항원)" },
                  { text: "인식 T 세포: 세포독성 T 세포(CD8⁺)" },
                ],
              },
              {
                text: "MHC II (Class II)",
                children: [
                  { text: "발현: 항원 제시 세포(대식세포, 수지상세포, B세포)에만" },
                  { text: "제시 대상: 외부 식균 항원 조각" },
                  { text: "인식 T 세포: 보조 T 세포(CD4⁺)" },
                ],
              },
            ],
          },
          {
            text: "장기이식과 거부 반응(Transplant Rejection)",
            children: [
              { text: "수여자 T 세포가 공여자 MHC를 비자기로 인식 → 이식 조직 공격" },
              { text: "HLA 적합성 검사 필수: 공여자-수여자 HLA 최대한 일치 필요" },
              { text: "일란성 쌍둥이 간 이식이 가장 이상적" },
              { text: "이식 후 면역억제제(사이클로스포린, 타크롤리무스) 투여" },
            ],
          },
        ],
      },
      {
        id: "bio_ch4_s4_c11",
        label: "예방 접종과 혈청 요법",
        nodes: [
          {
            text: "예방 접종(Vaccination): 백신으로 1차 면역 반응 유도 → 기억세포 형성",
          },
          {
            text: "백신 종류",
            children: [
              { text: "약독화 백신: 독성 약화 병원체 (예: MMR, BCG)" },
              { text: "불활성화 백신: 사멸 병원체 (예: 인플루엔자, A형 간염)" },
              { text: "서브유닛/재조합 백신: 병원체 일부" },
              { text: "톡소이드(Toxoid): 변성 독소 (예: 파상풍)" },
              { text: "mRNA 백신: 항원 유전 정보 주입 → 체내 항원 합성 (예: COVID-19 화이자/모더나)" },
            ],
          },
          {
            text: "능동 면역(Active Immunity) = 예방 접종",
            children: [
              { text: "효과 발현: 1~2주 소요" },
              { text: "기억세포 형성 → 오래 지속(수년~평생)" },
              { text: "실제 침입 시 강력한 2차 면역 반응" },
            ],
          },
          {
            text: "혈청 요법(Serum Therapy)",
            children: [
              { text: "항체 포함 면역 혈청 직접 주사 → 즉각적 면역 효과" },
              { text: "예: 뱀 교상 시 항사독소 혈청, 파상풍 긴급 치료" },
            ],
          },
          {
            text: "수동 면역(Passive Immunity) = 혈청 요법",
            children: [
              { text: "효과: 즉각적(수시간 내) 발현, 기억세포 미형성 → 일시적(수주)" },
              { text: "자연적 수동 면역: 모체 → 태반(IgG), 모유(IgA) 통해 아기에게 전달" },
            ],
          },
        ],
      },
    ],
  },
];
