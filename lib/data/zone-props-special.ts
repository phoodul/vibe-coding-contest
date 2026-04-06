/**
 * 기억의 궁전 특수 소품(Props) — 바이오 아일랜드 & 언어의 궁전
 *
 * 핵심 원칙: 각 소품은 그 공간에만 존재하는 고유한 것이어야 한다.
 * - 같은 종류의 소품이 다른 구역에서 반복되면 기억 혼선
 * - 각 소품은 그 공간의 테마/특성과 깊이 연결
 * - 시각적으로 뚜렷하고 독특한 이미지
 */

import type { ZoneProp } from "./zone-props";

// ============================================================
// A. 바이오 아일랜드 (5곳 × 5-6구역 = 27개 구역)
// ============================================================

export const BIO_ISLAND_ZONE_PROPS: Record<string, ZoneProp[]> = {
  // ─── 1. 세포 돔 (cell_dome) ───
  cell_membrane_gate: [
    {
      id: "phospholipid_model", name: "유동하는 인지질 분자 모형", emoji: "🫧",
      description: "끊임없이 유동하는 인지질 이중층 모형. 소수성 꼬리가 안쪽, 친수성 머리가 바깥을 향한다",
      position: { x: 30, y: 40 },
      slots: [
        { id: "hydrophilic_head", label: "친수성 머리 층", relativePosition: { x: 0, y: -20 } },
        { id: "hydrophobic_tail", label: "소수성 꼬리 층", relativePosition: { x: 0, y: 0 } },
        { id: "lipid_bilayer_cross", label: "이중층 단면", relativePosition: { x: 0, y: 20 } },
      ],
    },
    {
      id: "channel_protein_gate", name: "채널 단백질 관문", emoji: "🚪",
      description: "열리고 닫히는 채널 단백질. 특정 이온만 통과시키는 선택적 투과 관문",
      position: { x: 60, y: 30 },
      slots: [
        { id: "open_channel", label: "개방 채널", relativePosition: { x: -10, y: 0 } },
        { id: "gated_channel", label: "게이트 채널", relativePosition: { x: 10, y: 0 } },
        { id: "carrier_protein", label: "운반체 단백질", relativePosition: { x: 0, y: 15 } },
      ],
    },
    {
      id: "cholesterol_coin", name: "콜레스테롤 황금 코인", emoji: "🪙",
      description: "막 유동성을 조절하는 콜레스테롤 분자. 금색 동전 모양으로 인지질 사이에 끼어 있다",
      position: { x: 80, y: 55 },
      slots: [
        { id: "fluidity_high", label: "유동성 높을 때", relativePosition: { x: -10, y: 0 } },
        { id: "fluidity_low", label: "유동성 낮을 때", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],
  nucleus_tower: [
    {
      id: "nuclear_envelope_door", name: "핵막 이중문", emoji: "🚧",
      description: "핵공이 표시된 이중 핵막 문. 물질의 출입을 통제하는 핵의 관제 시스템",
      position: { x: 25, y: 30 },
      slots: [
        { id: "nuclear_pore", label: "핵공", relativePosition: { x: 0, y: -10 } },
        { id: "outer_membrane", label: "외막", relativePosition: { x: -15, y: 0 } },
        { id: "inner_membrane", label: "내막", relativePosition: { x: 15, y: 0 } },
      ],
    },
    {
      id: "chromatin_thread", name: "크로마틴 실타래", emoji: "🧶",
      description: "풀어진 DNA가 히스톤 단백질에 감긴 실타래. 간기에 느슨하게 풀려 있다",
      position: { x: 55, y: 25 },
      slots: [
        { id: "histone_spool", label: "히스톤 실패", relativePosition: { x: 0, y: -10 } },
        { id: "euchromatin", label: "진정염색질(느슨)", relativePosition: { x: -10, y: 10 } },
        { id: "heterochromatin", label: "이질염색질(응축)", relativePosition: { x: 10, y: 10 } },
      ],
    },
    {
      id: "nucleolus_sphere", name: "핵소체 발광 구체", emoji: "💡",
      description: "rRNA를 합성하는 핵소체. 핵 안에서 밝게 빛나는 구체",
      position: { x: 40, y: 60 },
      slots: [
        { id: "rrna_synthesis", label: "rRNA 합성 지점", relativePosition: { x: 0, y: -10 } },
        { id: "ribosome_subunit", label: "리보솜 소단위 조립", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "dna_blueprint_scroll", name: "DNA 설계도 두루마리", emoji: "📜",
      description: "유전 정보가 담긴 거대한 두루마리. 펼치면 이중나선 구조가 드러난다",
      position: { x: 75, y: 50 },
      slots: [
        { id: "gene_section", label: "유전자 구간", relativePosition: { x: -10, y: 0 } },
        { id: "promoter_mark", label: "프로모터 표시", relativePosition: { x: 10, y: -10 } },
        { id: "terminator_mark", label: "종결 신호 표시", relativePosition: { x: 10, y: 10 } },
      ],
    },
  ],
  mitochondria_plant: [
    {
      id: "cristae_generator", name: "크리스타 주름 발전기", emoji: "⚡",
      description: "미토콘드리아 내막의 주름(크리스타)을 본뜬 발전기. 전자전달계가 작동한다",
      position: { x: 30, y: 35 },
      slots: [
        { id: "etc_complex", label: "전자전달 복합체", relativePosition: { x: 0, y: -15 } },
        { id: "atp_synthase", label: "ATP 합성효소", relativePosition: { x: 0, y: 0 } },
        { id: "proton_gradient", label: "양성자 농도 기울기", relativePosition: { x: 0, y: 15 } },
      ],
    },
    {
      id: "atp_coin_mint", name: "ATP 동전 제조기", emoji: "🏭",
      description: "세포의 에너지 화폐 ATP를 찍어내는 제조기. ADP+Pi→ATP",
      position: { x: 65, y: 30 },
      slots: [
        { id: "adp_input", label: "ADP 투입구", relativePosition: { x: -10, y: 0 } },
        { id: "atp_output", label: "ATP 배출구", relativePosition: { x: 10, y: 0 } },
        { id: "energy_counter", label: "에너지 수율 카운터", relativePosition: { x: 0, y: 15 } },
      ],
    },
    {
      id: "matrix_cauldron", name: "매트릭스 반응 가마솥", emoji: "🫕",
      description: "TCA 회로(시트르산 회로)가 돌아가는 기질(매트릭스)의 가마솥",
      position: { x: 45, y: 65 },
      slots: [
        { id: "tca_cycle", label: "TCA 회로", relativePosition: { x: 0, y: -10 } },
        { id: "acetyl_coa_input", label: "아세틸 CoA 투입", relativePosition: { x: -15, y: 5 } },
        { id: "nadh_fadh2_output", label: "NADH/FADH2 생성", relativePosition: { x: 15, y: 5 } },
      ],
    },
  ],
  ribosome_factory: [
    {
      id: "mrna_conveyor", name: "mRNA 컨베이어 벨트", emoji: "📼",
      description: "mRNA가 리보솜을 통과하며 코돈 단위로 읽히는 컨베이어 벨트",
      position: { x: 50, y: 25 },
      slots: [
        { id: "start_codon", label: "개시코돈(AUG)", relativePosition: { x: -15, y: 0 } },
        { id: "reading_frame", label: "해독 프레임", relativePosition: { x: 0, y: 0 } },
        { id: "stop_codon", label: "종결코돈", relativePosition: { x: 15, y: 0 } },
      ],
    },
    {
      id: "amino_acid_lego", name: "아미노산 레고 블럭", emoji: "🧱",
      description: "20종류의 아미노산을 나타내는 서로 다른 색과 모양의 레고 블록",
      position: { x: 30, y: 55 },
      slots: [
        { id: "peptide_bond", label: "펩타이드 결합", relativePosition: { x: 0, y: -10 } },
        { id: "polypeptide_chain", label: "폴리펩타이드 사슬", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "trna_clamp_robot", name: "tRNA 집게 로봇", emoji: "🤖",
      description: "안티코돈으로 mRNA 코돈을 인식하고, 맞는 아미노산을 운반하는 집게 로봇",
      position: { x: 70, y: 50 },
      slots: [
        { id: "anticodon_arm", label: "안티코돈 팔", relativePosition: { x: -10, y: 10 } },
        { id: "amino_acid_grip", label: "아미노산 집게", relativePosition: { x: 10, y: -10 } },
      ],
    },
  ],
  er_corridor: [
    {
      id: "rough_er_wall", name: "거친면 소포체 벽", emoji: "🧫",
      description: "리보솜이 박힌 거친면 소포체의 울퉁불퉁한 벽. 단백질 합성의 현장",
      position: { x: 25, y: 40 },
      slots: [
        { id: "attached_ribosome", label: "부착 리보솜", relativePosition: { x: 0, y: -10 } },
        { id: "protein_folding", label: "단백질 접힘 공간", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "smooth_er_tunnel", name: "매끈면 소포체 터널", emoji: "🕳️",
      description: "리보솜 없는 매끈한 터널. 지질 합성과 해독 작용이 일어난다",
      position: { x: 55, y: 35 },
      slots: [
        { id: "lipid_synthesis", label: "지질 합성 구역", relativePosition: { x: -10, y: 0 } },
        { id: "detoxification", label: "해독 작용 구역", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "transport_vesicle_box", name: "수송 소포 택배 상자", emoji: "📦",
      description: "합성된 단백질을 골지체로 운반하는 택배 상자 형태의 수송 소포",
      position: { x: 75, y: 60 },
      slots: [
        { id: "budding", label: "출아(떨어져 나옴)", relativePosition: { x: -10, y: 0 } },
        { id: "fusion", label: "융합(도착 합체)", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],
  golgi_logistics: [
    {
      id: "cisternae_stack", name: "납작한 주머니 스택", emoji: "🥞",
      description: "시스 면에서 트랜스 면으로 이어지는 납작한 주머니(시스터나) 더미",
      position: { x: 40, y: 30 },
      slots: [
        { id: "cis_face", label: "시스 면(수신)", relativePosition: { x: -15, y: 0 } },
        { id: "medial_cisterna", label: "중간 주머니(가공)", relativePosition: { x: 0, y: 0 } },
        { id: "trans_face", label: "트랜스 면(발송)", relativePosition: { x: 15, y: 0 } },
      ],
    },
    {
      id: "sorting_tag_sticker", name: "분류 태그 스티커", emoji: "🏷️",
      description: "단백질 목적지를 지정하는 분류 태그. 세포막/리소좀/세포 외 등 행선지 표시",
      position: { x: 65, y: 50 },
      slots: [
        { id: "membrane_tag", label: "세포막 행 태그", relativePosition: { x: -10, y: -5 } },
        { id: "lysosome_tag", label: "리소좀 행 태그", relativePosition: { x: 10, y: -5 } },
        { id: "secretion_tag", label: "분비 태그", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "secretory_vesicle_rocket", name: "분비 소포 로켓", emoji: "🚀",
      description: "트랜스 면에서 떨어져 나온 분비 소포. 세포막을 향해 로켓처럼 발사",
      position: { x: 35, y: 70 },
      slots: [
        { id: "exocytosis", label: "세포외배출", relativePosition: { x: 0, y: -10 } },
        { id: "constitutive", label: "구성적 분비", relativePosition: { x: -10, y: 10 } },
        { id: "regulated", label: "조절 분비", relativePosition: { x: 10, y: 10 } },
      ],
    },
  ],

  // ─── 2. DNA 나선탑 (dna_tower) ───
  helix_stairs: [
    {
      id: "at_red_step", name: "A-T 빨간 계단 디딤판", emoji: "🔴",
      description: "아데닌-티민 염기쌍의 빨간색 계단. 수소결합 2개로 연결",
      position: { x: 30, y: 30 },
      slots: [
        { id: "adenine", label: "아데닌(A)", relativePosition: { x: -10, y: 0 } },
        { id: "thymine", label: "티민(T)", relativePosition: { x: 10, y: 0 } },
        { id: "h_bond_2", label: "수소결합 2개", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "gc_blue_step", name: "G-C 파란 계단 디딤판", emoji: "🔵",
      description: "구아닌-시토신 염기쌍의 파란색 계단. 수소결합 3개로 더 강하게 연결",
      position: { x: 30, y: 60 },
      slots: [
        { id: "guanine", label: "구아닌(G)", relativePosition: { x: -10, y: 0 } },
        { id: "cytosine", label: "시토신(C)", relativePosition: { x: 10, y: 0 } },
        { id: "h_bond_3", label: "수소결합 3개", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "sugar_phosphate_railing", name: "당-인산 금속 난간", emoji: "🔗",
      description: "디옥시리보스와 인산기가 교대로 연결된 DNA 골격 난간",
      position: { x: 70, y: 40 },
      slots: [
        { id: "deoxyribose", label: "디옥시리보스(당)", relativePosition: { x: -10, y: 0 } },
        { id: "phosphate", label: "인산기", relativePosition: { x: 10, y: 0 } },
        { id: "phosphodiester", label: "인산다이에스터 결합", relativePosition: { x: 0, y: 15 } },
      ],
    },
  ],
  mendel_garden: [
    {
      id: "pea_seed_pot", name: "초록/노란 완두콩 화분", emoji: "🫛",
      description: "멘델의 완두콩 실험. 둥근 노란 완두(우성)와 주름진 초록 완두(열성) 화분",
      position: { x: 25, y: 35 },
      slots: [
        { id: "dominant_seed", label: "둥근 황색(우성)", relativePosition: { x: -10, y: 0 } },
        { id: "recessive_seed", label: "주름 녹색(열성)", relativePosition: { x: 10, y: 0 } },
        { id: "ratio_3_1", label: "3:1 분리비", relativePosition: { x: 0, y: 15 } },
      ],
    },
    {
      id: "pea_flower_pot", name: "보라/흰 완두꽃 화분", emoji: "🪻",
      description: "보라색(우성)과 흰색(열성) 완두꽃이 피어있는 화분",
      position: { x: 55, y: 30 },
      slots: [
        { id: "purple_flower", label: "보라꽃(우성 PP/Pp)", relativePosition: { x: -10, y: 0 } },
        { id: "white_flower", label: "흰꽃(열성 pp)", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "experiment_chalkboard", name: "실험 기록 칠판", emoji: "🪧",
      description: "멘델의 분리 법칙과 독립 법칙이 적힌 칠판",
      position: { x: 40, y: 65 },
      slots: [
        { id: "segregation_law", label: "분리의 법칙", relativePosition: { x: -10, y: -5 } },
        { id: "independent_law", label: "독립의 법칙", relativePosition: { x: 10, y: -5 } },
        { id: "punnett_square", label: "퍼넷 사각형", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "genotype_dice", name: "유전자형 주사위", emoji: "🎲",
      description: "유전자형(AA, Aa, aa)이 새겨진 주사위. 교배 결과를 시뮬레이션",
      position: { x: 75, y: 55 },
      slots: [
        { id: "homozygous_dom", label: "동형접합 우성(AA)", relativePosition: { x: -10, y: -5 } },
        { id: "heterozygous", label: "이형접합(Aa)", relativePosition: { x: 10, y: -5 } },
        { id: "homozygous_rec", label: "동형접합 열성(aa)", relativePosition: { x: 0, y: 10 } },
      ],
    },
  ],
  chromosome_gallery: [
    {
      id: "karyotype_panel", name: "사람 핵형 유리 패널", emoji: "🖼️",
      description: "사람의 46개(23쌍) 염색체가 크기순으로 배열된 유리 패널",
      position: { x: 30, y: 35 },
      slots: [
        { id: "autosome_22", label: "상염색체 22쌍", relativePosition: { x: -10, y: 0 } },
        { id: "sex_chromosome", label: "성염색체(XX/XY)", relativePosition: { x: 10, y: 0 } },
        { id: "total_46", label: "총 46개 = 2n", relativePosition: { x: 0, y: 15 } },
      ],
    },
    {
      id: "x_chromosome_statue", name: "X자형 염색체 조각상", emoji: "✖️",
      description: "중기 염색체의 X자형 조각상. 두 자매 염색분체가 동원체로 연결",
      position: { x: 60, y: 40 },
      slots: [
        { id: "sister_chromatid", label: "자매 염색분체", relativePosition: { x: -10, y: -10 } },
        { id: "centromere_point", label: "동원체(결합점)", relativePosition: { x: 0, y: 0 } },
        { id: "telomere_tip", label: "텔로미어(말단)", relativePosition: { x: 10, y: 10 } },
      ],
    },
    {
      id: "centromere_magnet_ring", name: "동원체 자석 고리", emoji: "🧲",
      description: "방추사가 부착되는 동원체의 자석 고리. 염색분체를 잡아당기는 힘의 원천",
      position: { x: 45, y: 70 },
      slots: [
        { id: "kinetochore", label: "키네토코어(부착점)", relativePosition: { x: 0, y: -10 } },
        { id: "spindle_attach", label: "방추사 부착", relativePosition: { x: 0, y: 10 } },
      ],
    },
  ],
  pedigree_gallery: [
    {
      id: "abo_pedigree_tapestry", name: "ABO 혈액형 가계도 태피스트리", emoji: "🩸",
      description: "ABO 혈액형의 복대립유전과 가계도가 수놓인 태피스트리",
      position: { x: 25, y: 35 },
      slots: [
        { id: "allele_ia_ib_i", label: "대립유전자 IA/IB/i", relativePosition: { x: 0, y: -10 } },
        { id: "codominance", label: "공우성(AB형)", relativePosition: { x: -10, y: 10 } },
        { id: "blood_type_inheritance", label: "혈액형 유전 패턴", relativePosition: { x: 10, y: 10 } },
      ],
    },
    {
      id: "colorblind_stained_glass", name: "색맹 검사판 스테인드글라스", emoji: "🔮",
      description: "이시하라 색맹 검사판을 본뜬 스테인드글라스. 반성유전의 대표 사례",
      position: { x: 60, y: 30 },
      slots: [
        { id: "x_linked", label: "X염색체 연관", relativePosition: { x: -10, y: 0 } },
        { id: "carrier_female", label: "보인자 여성(XᶜX)", relativePosition: { x: 10, y: -5 } },
        { id: "affected_male", label: "발현 남성(XᶜY)", relativePosition: { x: 10, y: 10 } },
      ],
    },
    {
      id: "genetic_counseling_chair", name: "유전 상담실 의자", emoji: "🪑",
      description: "유전 상담을 진행하는 의자. 가계도 분석과 확률 계산의 현장",
      position: { x: 45, y: 65 },
      slots: [
        { id: "pedigree_analysis", label: "가계도 분석", relativePosition: { x: -10, y: 0 } },
        { id: "probability_calc", label: "유전 확률 계산", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],
  mutation_lab: [
    {
      id: "sickle_cell_model", name: "낫 모양 적혈구 모형", emoji: "🌙",
      description: "찌그러진 빨간 공 형태의 낫 모양 적혈구. 점 돌연변이의 결과",
      position: { x: 25, y: 35 },
      slots: [
        { id: "normal_rbc", label: "정상 적혈구(원반형)", relativePosition: { x: -10, y: 0 } },
        { id: "sickle_rbc", label: "낫 모양 적혈구", relativePosition: { x: 10, y: 0 } },
        { id: "point_mutation", label: "점 돌연변이(GAG→GTG)", relativePosition: { x: 0, y: 15 } },
      ],
    },
    {
      id: "nondisjunction_simulator", name: "삼염색체 비분리 시뮬레이터", emoji: "⚠️",
      description: "감수분열 시 염색체 비분리를 시뮬레이션. 다운증후군(21번 삼염색체) 등",
      position: { x: 55, y: 40 },
      slots: [
        { id: "normal_disjunction", label: "정상 분리", relativePosition: { x: -10, y: -5 } },
        { id: "nondisjunction", label: "비분리", relativePosition: { x: 10, y: -5 } },
        { id: "trisomy", label: "삼염색체(2n+1)", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "crispr_scissors", name: "유전자 가위(CRISPR) 금속 도구", emoji: "✂️",
      description: "특정 DNA 서열을 정밀하게 자르는 CRISPR-Cas9 유전자 가위",
      position: { x: 75, y: 60 },
      slots: [
        { id: "guide_rna", label: "가이드 RNA", relativePosition: { x: -10, y: 0 } },
        { id: "cas9_enzyme", label: "Cas9 효소", relativePosition: { x: 10, y: 0 } },
        { id: "target_dna", label: "표적 DNA 서열", relativePosition: { x: 0, y: 15 } },
      ],
    },
  ],

  // ─── 3. 분열의 광장 (division_plaza) ───
  interphase_garden: [
    {
      id: "g1_sprout_bed", name: "G1 새싹 화단", emoji: "🌱",
      description: "G1기의 세포 성장을 나타내는 새싹 화단. 세포가 자라기 시작",
      position: { x: 20, y: 40 },
      slots: [
        { id: "cell_growth", label: "세포 성장", relativePosition: { x: 0, y: -10 } },
        { id: "organelle_increase", label: "세포소기관 증가", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "s_phase_fountain", name: "S기 DNA 복제 분수", emoji: "⛲",
      description: "이중나선이 풀리며 둘로 복제되는 모양의 분수. DNA 복제의 상징",
      position: { x: 50, y: 30 },
      slots: [
        { id: "replication_fork", label: "복제 분기점", relativePosition: { x: 0, y: -10 } },
        { id: "semiconservative", label: "반보존적 복제", relativePosition: { x: -10, y: 10 } },
        { id: "dna_doubled", label: "DNA 양 2배", relativePosition: { x: 10, y: 10 } },
      ],
    },
    {
      id: "g2_grown_tree", name: "G2 성장한 나무", emoji: "🌳",
      description: "G2기에 충분히 성장한 나무. 분열 준비 완료 상태",
      position: { x: 80, y: 45 },
      slots: [
        { id: "division_prep", label: "분열 준비", relativePosition: { x: 0, y: -10 } },
        { id: "centriole_duplication", label: "중심체 복제", relativePosition: { x: 0, y: 10 } },
      ],
    },
  ],
  spindle_fountain: [
    {
      id: "centriole_twin_stars", name: "중심체 쌍둥이 별", emoji: "⭐",
      description: "세포 양극으로 이동하는 두 개의 별 모양 중심체",
      position: { x: 30, y: 30 },
      slots: [
        { id: "pole_1", label: "제1극", relativePosition: { x: -15, y: 0 } },
        { id: "pole_2", label: "제2극", relativePosition: { x: 15, y: 0 } },
      ],
    },
    {
      id: "microtubule_streams", name: "미세소관 물줄기", emoji: "🌊",
      description: "중심체에서 뻗어나오는 미세소관 방추사의 물줄기",
      position: { x: 55, y: 50 },
      slots: [
        { id: "kinetochore_mt", label: "동원체 미세소관", relativePosition: { x: -10, y: 0 } },
        { id: "polar_mt", label: "극 미세소관", relativePosition: { x: 10, y: 0 } },
        { id: "astral_mt", label: "성상체 미세소관", relativePosition: { x: 0, y: 15 } },
      ],
    },
    {
      id: "kinetochore_ring", name: "동원체 고리 장식", emoji: "💍",
      description: "방추사가 염색체에 부착되는 동원체의 고리 장식",
      position: { x: 75, y: 35 },
      slots: [
        { id: "attachment_point", label: "부착점", relativePosition: { x: 0, y: -10 } },
        { id: "pulling_force", label: "견인력", relativePosition: { x: 0, y: 10 } },
      ],
    },
  ],
  mitosis_hall: [
    {
      id: "prophase_butterfly", name: "전기: 응축 나비", emoji: "🦋",
      description: "크로마틴이 응축되어 나비 모양 염색체로 변하는 전기",
      position: { x: 15, y: 35 },
      slots: [
        { id: "chromatin_condensation", label: "크로마틴 응축", relativePosition: { x: 0, y: -10 } },
        { id: "nuclear_envelope_breakdown", label: "핵막 소실", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "metaphase_lineup", name: "중기: 적도판 줄서기 인형", emoji: "🎯",
      description: "염색체가 세포 적도판에 일렬로 정렬된 인형 세트",
      position: { x: 38, y: 35 },
      slots: [
        { id: "metaphase_plate", label: "적도판 정렬", relativePosition: { x: 0, y: -10 } },
        { id: "spindle_check", label: "방추사 점검점", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "anaphase_seesaw", name: "후기: 분리 시소", emoji: "⚖️",
      description: "자매 염색분체가 양극으로 분리되는 시소",
      position: { x: 62, y: 35 },
      slots: [
        { id: "chromatid_separation", label: "염색분체 분리", relativePosition: { x: 0, y: -10 } },
        { id: "pole_movement", label: "양극 이동", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "telophase_curtain", name: "말기: 세포판 커튼", emoji: "🎭",
      description: "세포질이 분열되며 내려오는 커튼. 새 핵막 형성과 세포질 분열",
      position: { x: 85, y: 35 },
      slots: [
        { id: "nuclear_reform", label: "핵막 재형성", relativePosition: { x: 0, y: -10 } },
        { id: "cytokinesis", label: "세포질 분열", relativePosition: { x: 0, y: 10 } },
      ],
    },
  ],
  meiosis_hall: [
    {
      id: "bivalent_hug_doll", name: "2가 염색체 포옹 인형", emoji: "🫂",
      description: "상동 염색체 쌍이 서로 포옹하여 2가 염색체(4분 염색체)를 형성",
      position: { x: 25, y: 35 },
      slots: [
        { id: "synapsis", label: "시냅시스(접합)", relativePosition: { x: 0, y: -10 } },
        { id: "tetrad", label: "4분 염색체", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "crossover_x_scissors", name: "교차 X자 가위", emoji: "🔀",
      description: "비자매 염색분체 사이에서 유전 물질을 교환하는 교차(crossing over)",
      position: { x: 55, y: 30 },
      slots: [
        { id: "chiasma", label: "키아즈마(교차점)", relativePosition: { x: 0, y: -10 } },
        { id: "recombination", label: "유전자 재조합", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "meiosis_doors", name: "감수1분열 큰 문/감수2분열 작은 문", emoji: "🚪",
      description: "감수1분열(상동 염색체 분리)의 큰 문과 감수2분열(자매 염색분체 분리)의 작은 문",
      position: { x: 75, y: 50 },
      slots: [
        { id: "meiosis_1", label: "감수1분열(2n→n)", relativePosition: { x: -10, y: 0 } },
        { id: "meiosis_2", label: "감수2분열(n→n)", relativePosition: { x: 10, y: 0 } },
        { id: "genetic_diversity", label: "유전적 다양성", relativePosition: { x: 0, y: 15 } },
      ],
    },
  ],
  gamete_hatchery: [
    {
      id: "sperm_weathervane", name: "정자 모양 풍향계", emoji: "🌬️",
      description: "꼬리를 흔들며 방향을 가리키는 정자 모양의 풍향계",
      position: { x: 25, y: 40 },
      slots: [
        { id: "acrosome", label: "첨체(선체)", relativePosition: { x: 0, y: -10 } },
        { id: "flagellum", label: "편모(꼬리)", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "ovum_incubator", name: "난자 둥근 인큐베이터", emoji: "🥚",
      description: "크고 둥근 난자를 품고 있는 인큐베이터. 영양물질 가득",
      position: { x: 55, y: 35 },
      slots: [
        { id: "zona_pellucida", label: "투명대", relativePosition: { x: 0, y: -10 } },
        { id: "cytoplasm_nutrient", label: "세포질(영양물질)", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "fertilization_spark", name: "수정 불꽃 장치", emoji: "✨",
      description: "정자와 난자가 만나 수정되는 순간의 불꽃. 2n 회복",
      position: { x: 75, y: 55 },
      slots: [
        { id: "sperm_egg_fusion", label: "정자-난자 융합", relativePosition: { x: 0, y: -10 } },
        { id: "zygote_2n", label: "수정란(2n)", relativePosition: { x: -10, y: 10 } },
        { id: "cortical_reaction", label: "표층 반응(다수정 방지)", relativePosition: { x: 10, y: 10 } },
      ],
    },
  ],

  // ─── 4. 항상성 센터 (homeostasis_center) ───
  neuron_comm_tower: [
    {
      id: "dendrite_antenna_forest", name: "가지돌기 안테나 숲", emoji: "📡",
      description: "신호를 수신하는 가지돌기(수상돌기)의 안테나 숲",
      position: { x: 20, y: 30 },
      slots: [
        { id: "signal_receive", label: "자극 수신", relativePosition: { x: 0, y: -10 } },
        { id: "graded_potential", label: "등급 전위", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "soma_control_room", name: "세포체 중앙 제어실", emoji: "🧠",
      description: "핵이 있는 세포체. 신경 세포의 중앙 제어실",
      position: { x: 40, y: 40 },
      slots: [
        { id: "nucleus_center", label: "핵(유전 정보)", relativePosition: { x: 0, y: -10 } },
        { id: "integration", label: "신호 통합", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "axon_fiber_optic", name: "축삭 광케이블", emoji: "🔌",
      description: "활동전위를 전달하는 긴 축삭돌기. 광케이블처럼 빠른 전도",
      position: { x: 65, y: 35 },
      slots: [
        { id: "action_potential", label: "활동전위 전도", relativePosition: { x: 0, y: -10 } },
        { id: "saltatory_conduction", label: "도약전도", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "myelin_insulation", name: "말이집 절연 튜브", emoji: "🧪",
      description: "축삭을 감싸는 말이집(수초). 절연으로 전도 속도 향상",
      position: { x: 82, y: 50 },
      slots: [
        { id: "schwann_cell", label: "슈반 세포", relativePosition: { x: 0, y: -10 } },
        { id: "node_of_ranvier", label: "랑비에 마디", relativePosition: { x: 0, y: 10 } },
      ],
    },
  ],
  synapse_bridge: [
    {
      id: "synaptic_vesicle_grenade", name: "시냅스 소포 수류탄", emoji: "💣",
      description: "아세틸콜린(ACh)이 들어있는 시냅스 소포. 터지면 신경전달물질 방출",
      position: { x: 25, y: 35 },
      slots: [
        { id: "ach_content", label: "ACh(아세틸콜린)", relativePosition: { x: 0, y: -10 } },
        { id: "exocytosis_release", label: "세포외배출 방출", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "synaptic_cleft_bridge", name: "시냅스 틈 현수교 줄", emoji: "🌉",
      description: "시냅스 전 뉴런과 시냅스 후 뉴런 사이의 20nm 틈을 잇는 현수교",
      position: { x: 50, y: 30 },
      slots: [
        { id: "presynaptic", label: "시냅스 전 뉴런", relativePosition: { x: -15, y: 0 } },
        { id: "cleft_space", label: "시냅스 틈(20nm)", relativePosition: { x: 0, y: 0 } },
        { id: "postsynaptic", label: "시냅스 후 뉴런", relativePosition: { x: 15, y: 0 } },
      ],
    },
    {
      id: "receptor_lock", name: "수용체 자물쇠", emoji: "🔐",
      description: "신경전달물질(열쇠)이 결합하는 수용체(자물쇠). 열쇠-자물쇠 모델",
      position: { x: 70, y: 50 },
      slots: [
        { id: "ligand_key", label: "리간드(열쇠)", relativePosition: { x: -10, y: 0 } },
        { id: "receptor_lock_hole", label: "수용체(자물쇠)", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "reuptake_vacuum", name: "재흡수 진공청소기", emoji: "🧹",
      description: "시냅스 틈에 남은 신경전달물질을 재흡수하는 진공청소기",
      position: { x: 45, y: 70 },
      slots: [
        { id: "reuptake_pump", label: "재흡수 펌프", relativePosition: { x: -10, y: 0 } },
        { id: "enzyme_breakdown", label: "효소 분해", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],
  hormone_post: [
    {
      id: "insulin_green_envelope", name: "인슐린 초록 편지봉투", emoji: "💚",
      description: "혈당을 낮추는 인슐린 호르몬의 초록색 편지봉투. 이자 β세포에서 발송",
      position: { x: 20, y: 35 },
      slots: [
        { id: "beta_cell_origin", label: "이자 β세포 발신", relativePosition: { x: 0, y: -10 } },
        { id: "glucose_uptake", label: "포도당 흡수 촉진", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "glucagon_red_envelope", name: "글루카곤 빨간 편지봉투", emoji: "❤️",
      description: "혈당을 올리는 글루카곤 호르몬의 빨간색 편지봉투. 이자 α세포에서 발송",
      position: { x: 45, y: 30 },
      slots: [
        { id: "alpha_cell_origin", label: "이자 α세포 발신", relativePosition: { x: 0, y: -10 } },
        { id: "glycogen_breakdown", label: "글리코겐 분해 촉진", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "thyroxine_yellow_express", name: "티록신 노란 속달 봉투", emoji: "💛",
      description: "물질대사를 촉진하는 티록신 호르몬의 노란 속달 봉투. 갑상샘에서 발송",
      position: { x: 70, y: 35 },
      slots: [
        { id: "thyroid_origin", label: "갑상샘 발신", relativePosition: { x: 0, y: -10 } },
        { id: "metabolism_boost", label: "물질대사 촉진", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "target_cell_mailbox", name: "표적세포 수신함", emoji: "📬",
      description: "호르몬을 수신하는 표적세포의 수신함. 특정 수용체만 반응",
      position: { x: 50, y: 65 },
      slots: [
        { id: "membrane_receptor", label: "세포막 수용체(수용성)", relativePosition: { x: -10, y: 0 } },
        { id: "nuclear_receptor", label: "핵 수용체(지용성)", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],
  immune_fortress: [
    {
      id: "skin_rampart", name: "피부 성벽", emoji: "🏰",
      description: "1차 방어선인 피부 성벽. 물리적·화학적 방어의 최전선",
      position: { x: 15, y: 30 },
      slots: [
        { id: "physical_barrier", label: "물리적 장벽", relativePosition: { x: 0, y: -10 } },
        { id: "chemical_barrier", label: "화학적 장벽(라이소자임)", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "macrophage_guard", name: "대식세포 파수꾼", emoji: "👹",
      description: "2차 방어선 비특이적 면역의 대식세포. 병원체를 삼켜 소화",
      position: { x: 35, y: 40 },
      slots: [
        { id: "phagocytosis", label: "식세포 작용", relativePosition: { x: 0, y: -10 } },
        { id: "antigen_presentation", label: "항원 제시", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "b_cell_cannon", name: "B세포 대포", emoji: "💥",
      description: "3차 방어선 특이적 면역의 B세포 대포. 항체를 발사하여 항원 제거",
      position: { x: 55, y: 35 },
      slots: [
        { id: "antibody_fire", label: "항체 발사(체액성)", relativePosition: { x: 0, y: -10 } },
        { id: "plasma_cell", label: "형질세포 분화", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "t_cell_commando", name: "T세포 특공대원", emoji: "🥷",
      description: "감염 세포를 직접 공격하는 T세포 특공대원. 세포성 면역",
      position: { x: 72, y: 45 },
      slots: [
        { id: "killer_t", label: "세포독성 T세포", relativePosition: { x: 0, y: -10 } },
        { id: "helper_t", label: "보조 T세포", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "memory_cell_archive", name: "기억세포 기록실", emoji: "📚",
      description: "한번 만난 항원을 기억하는 기억세포의 기록실. 2차 면역 반응의 기반",
      position: { x: 85, y: 55 },
      slots: [
        { id: "primary_response", label: "1차 면역(느림)", relativePosition: { x: -10, y: 0 } },
        { id: "secondary_response", label: "2차 면역(빠름/강함)", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],
  glucose_control: [
    {
      id: "blood_sugar_seesaw", name: "혈당 시소", emoji: "⚖️",
      description: "혈당이 올라가면 인슐린, 내려가면 글루카곤이 작동하는 시소",
      position: { x: 30, y: 35 },
      slots: [
        { id: "high_glucose", label: "고혈당→인슐린↑", relativePosition: { x: -10, y: 0 } },
        { id: "low_glucose", label: "저혈당→글루카곤↑", relativePosition: { x: 10, y: 0 } },
        { id: "negative_feedback", label: "음성 피드백", relativePosition: { x: 0, y: 15 } },
      ],
    },
    {
      id: "liver_glycogen_storage", name: "간 글리코겐 저장고", emoji: "🏦",
      description: "포도당을 글리코겐으로 저장하는 간의 저장고",
      position: { x: 60, y: 40 },
      slots: [
        { id: "glycogenesis", label: "글리코겐 합성", relativePosition: { x: -10, y: 0 } },
        { id: "glycogenolysis", label: "글리코겐 분해", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "pancreas_control_panel", name: "이자 조절 패널", emoji: "🎛️",
      description: "인슐린과 글루카곤을 분비하는 이자(랑게르한스섬)의 조절 패널",
      position: { x: 45, y: 70 },
      slots: [
        { id: "beta_cells", label: "β세포(인슐린)", relativePosition: { x: -10, y: 0 } },
        { id: "alpha_cells", label: "α세포(글루카곤)", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],

  // ─── 5. 생태계 자연공원 (ecosystem_park) ───
  canopy_viewpoint: [
    {
      id: "canopy_glass_floor", name: "수관층 유리바닥 전망대", emoji: "🏗️",
      description: "숲 최상층 수관(캐노피)에 설치된 유리바닥 전망대. 생태계를 조망",
      position: { x: 40, y: 25 },
      slots: [
        { id: "canopy_layer", label: "수관층(교목층)", relativePosition: { x: 0, y: -10 } },
        { id: "understory", label: "하층(관목/초본)", relativePosition: { x: -10, y: 10 } },
        { id: "forest_floor", label: "임상(바닥층)", relativePosition: { x: 10, y: 10 } },
      ],
    },
    {
      id: "photosynthesis_solar_panel", name: "광합성 태양전지판", emoji: "☀️",
      description: "빛에너지를 화학에너지로 변환하는 광합성 원리의 태양전지판",
      position: { x: 70, y: 35 },
      slots: [
        { id: "light_reaction", label: "명반응(틸라코이드)", relativePosition: { x: -10, y: 0 } },
        { id: "dark_reaction", label: "암반응(스트로마)", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "chloroplast_green_flag", name: "엽록체 녹색 깃발", emoji: "🟢",
      description: "광합성의 장소인 엽록체를 상징하는 녹색 깃발",
      position: { x: 30, y: 60 },
      slots: [
        { id: "chlorophyll", label: "엽록소(클로로필)", relativePosition: { x: 0, y: -10 } },
        { id: "thylakoid_granum", label: "틸라코이드/그라나", relativePosition: { x: 0, y: 10 } },
      ],
    },
  ],
  food_web_trail: [
    {
      id: "food_chain_rope", name: "먹이사슬 연결 밧줄", emoji: "🔗",
      description: "풀→메뚜기→개구리→뱀→독수리로 이어지는 밧줄 연결",
      position: { x: 50, y: 30 },
      slots: [
        { id: "producer", label: "생산자(풀)", relativePosition: { x: -20, y: 0 } },
        { id: "primary_consumer", label: "1차 소비자(메뚜기)", relativePosition: { x: -10, y: 0 } },
        { id: "secondary_consumer", label: "2차 소비자(개구리)", relativePosition: { x: 0, y: 0 } },
        { id: "tertiary_consumer", label: "3차 소비자(뱀)", relativePosition: { x: 10, y: 0 } },
        { id: "apex_predator", label: "최종 소비자(독수리)", relativePosition: { x: 20, y: 0 } },
      ],
    },
    {
      id: "food_web_arrow_signpost", name: "먹이그물 방향 화살표 이정표", emoji: "➡️",
      description: "복잡한 먹이그물의 에너지 흐름 방향을 가리키는 화살표 이정표",
      position: { x: 50, y: 65 },
      slots: [
        { id: "energy_flow", label: "에너지 흐름 방향", relativePosition: { x: -10, y: 0 } },
        { id: "trophic_level", label: "영양 단계", relativePosition: { x: 10, y: 0 } },
        { id: "energy_pyramid", label: "에너지 피라미드", relativePosition: { x: 0, y: 15 } },
      ],
    },
  ],
  carbon_cycle_lake: [
    {
      id: "co2_bubble_lake", name: "CO2 거품 분출 호수", emoji: "🫧",
      description: "CO2 거품이 보글보글 올라오는 호수. 탄소순환의 대기 방출 부분",
      position: { x: 30, y: 35 },
      slots: [
        { id: "atmosphere_co2", label: "대기 중 CO2", relativePosition: { x: 0, y: -10 } },
        { id: "dissolved_co2", label: "수중 용존 CO2", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "photosynthesis_watermill", name: "광합성 물레방아", emoji: "🎡",
      description: "CO2를 흡수하여 유기물로 전환하는 광합성 물레방아",
      position: { x: 55, y: 40 },
      slots: [
        { id: "co2_fixation", label: "CO2 고정", relativePosition: { x: -10, y: 0 } },
        { id: "organic_matter", label: "유기물 생성", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "respiration_chimney", name: "호흡 연기 굴뚝", emoji: "🏭",
      description: "세포 호흡으로 CO2를 방출하는 굴뚝. 유기물→CO2+H2O",
      position: { x: 75, y: 55 },
      slots: [
        { id: "cellular_respiration", label: "세포 호흡", relativePosition: { x: 0, y: -10 } },
        { id: "decomposition", label: "분해자의 분해", relativePosition: { x: 0, y: 10 } },
      ],
    },
  ],
  nitrogen_cave: [
    {
      id: "rhizobium_stalactite", name: "뿌리혹 박테리아 발광 석순", emoji: "💎",
      description: "질소 고정을 수행하는 뿌리혹 박테리아의 발광 석순",
      position: { x: 30, y: 40 },
      slots: [
        { id: "n2_fixation", label: "N2 고정(N2→NH3)", relativePosition: { x: 0, y: -10 } },
        { id: "nitrogenase", label: "나이트로게네이스 효소", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "n2_purple_gas", name: "질소(N2) 무거운 보라 가스", emoji: "🟣",
      description: "대기의 78%를 차지하는 질소 기체. 무거운 보라색 가스로 시각화",
      position: { x: 60, y: 35 },
      slots: [
        { id: "atmospheric_n2", label: "대기 중 N2(78%)", relativePosition: { x: 0, y: -10 } },
        { id: "denitrification", label: "탈질소 작용", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "ammonia_crystal", name: "암모니아(NH3) 크리스탈", emoji: "🔷",
      description: "질소 고정의 산물인 암모니아가 결정화된 크리스탈",
      position: { x: 45, y: 65 },
      slots: [
        { id: "ammonification", label: "암모니아화 작용", relativePosition: { x: -10, y: 0 } },
        { id: "nitrification", label: "질산화 작용(NH3→NO3⁻)", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],
  biodiversity_reserve: [
    {
      id: "species_rainbow_arch", name: "종 다양성 무지개 아치", emoji: "🌈",
      description: "다양한 종이 공존함을 나타내는 무지개 아치. 종 다양성의 상징",
      position: { x: 30, y: 30 },
      slots: [
        { id: "species_richness", label: "종 풍부도", relativePosition: { x: -10, y: 0 } },
        { id: "species_evenness", label: "종 균등도", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "genetic_diversity_dna_tree", name: "유전적 다양성 DNA 나무", emoji: "🌲",
      description: "같은 종 내의 유전적 변이를 나타내는 DNA 모양의 나무",
      position: { x: 55, y: 40 },
      slots: [
        { id: "allele_variation", label: "대립유전자 변이", relativePosition: { x: 0, y: -10 } },
        { id: "population_genetics", label: "집단 유전학", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "ecosystem_diversity_globe", name: "생태계 다양성 지구본 분수", emoji: "🌍",
      description: "다양한 생태계(산림/습지/해양 등)를 보여주는 지구본 분수",
      position: { x: 75, y: 55 },
      slots: [
        { id: "biome_types", label: "생물군계(바이옴)", relativePosition: { x: -10, y: 0 } },
        { id: "conservation", label: "생물 다양성 보전", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],
};

// ============================================================
// B. 언어의 궁전 (5곳 × 5-6구역 = 27개 구역)
// ============================================================

export const KOREAN_LANG_ZONE_PROPS: Record<string, ZoneProp[]> = {
  // ─── 1. 음운의 성 (phoneme_fortress) ───
  consonant_hall: [
    {
      id: "articulation_mural", name: "발음기관 상형 벽화", emoji: "🗿",
      description: "ㄱ=혀뿌리, ㄴ=혀, ㅁ=입술, ㅅ=이, ㅇ=목구멍을 본뜬 훈민정음 상형 벽화",
      position: { x: 25, y: 30 },
      slots: [
        { id: "velar_g", label: "ㄱ(아음·혀뿌리)", relativePosition: { x: -15, y: -5 } },
        { id: "alveolar_n", label: "ㄴ(설음·혀)", relativePosition: { x: -5, y: -5 } },
        { id: "bilabial_m", label: "ㅁ(순음·입술)", relativePosition: { x: 5, y: -5 } },
        { id: "dental_s", label: "ㅅ(치음·이)", relativePosition: { x: 15, y: -5 } },
        { id: "glottal_ng", label: "ㅇ(후음·목구멍)", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "manner_tricolor_flag", name: "파열/마찰/비음 삼색 깃발", emoji: "🚩",
      description: "조음 방법에 따른 삼색 깃발. 빨강(파열), 노랑(마찰), 파랑(비음)",
      position: { x: 60, y: 35 },
      slots: [
        { id: "plosive", label: "파열음(ㄱ,ㄷ,ㅂ)", relativePosition: { x: -10, y: 0 } },
        { id: "fricative", label: "마찰음(ㅅ,ㅎ)", relativePosition: { x: 0, y: 0 } },
        { id: "nasal", label: "비음(ㄴ,ㅁ,ㅇ)", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "aspiration_triple_bell", name: "평음/경음/격음 세 개의 종", emoji: "🔔",
      description: "기식의 세기에 따른 세 개의 종. 작은 종(평음), 쌍종(경음), 큰 종(격음)",
      position: { x: 40, y: 65 },
      slots: [
        { id: "lax", label: "평음(ㄱ,ㄷ,ㅂ,ㅈ,ㅅ)", relativePosition: { x: -10, y: 0 } },
        { id: "tense", label: "경음(ㄲ,ㄸ,ㅃ,ㅉ,ㅆ)", relativePosition: { x: 0, y: 0 } },
        { id: "aspirated", label: "격음(ㅋ,ㅌ,ㅍ,ㅊ)", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],
  vowel_garden: [
    {
      id: "samjaegeuk_fountain", name: "천(ㆍ)·지(ㅡ)·인(ㅣ) 삼태극 분수", emoji: "☯️",
      description: "모음 창제 원리인 천(하늘·ㆍ), 지(땅·ㅡ), 인(사람·ㅣ)의 삼태극 분수",
      position: { x: 50, y: 25 },
      slots: [
        { id: "sky_dot", label: "천(ㆍ·하늘)", relativePosition: { x: 0, y: -10 } },
        { id: "earth_line", label: "지(ㅡ·땅)", relativePosition: { x: -10, y: 10 } },
        { id: "human_line", label: "인(ㅣ·사람)", relativePosition: { x: 10, y: 10 } },
      ],
    },
    {
      id: "yang_vowel_sunflower", name: "양성모음 해바라기 화단", emoji: "🌻",
      description: "밝고 양적인 양성모음(ㅏ,ㅗ)의 해바라기 화단",
      position: { x: 25, y: 50 },
      slots: [
        { id: "vowel_a", label: "ㅏ", relativePosition: { x: -5, y: 0 } },
        { id: "vowel_o", label: "ㅗ", relativePosition: { x: 5, y: 0 } },
      ],
    },
    {
      id: "yin_vowel_moonflower", name: "음성모음 달맞이꽃 화단", emoji: "🌙",
      description: "어둡고 음적인 음성모음(ㅓ,ㅜ)의 달맞이꽃 화단",
      position: { x: 75, y: 50 },
      slots: [
        { id: "vowel_eo", label: "ㅓ", relativePosition: { x: -5, y: 0 } },
        { id: "vowel_u", label: "ㅜ", relativePosition: { x: 5, y: 0 } },
      ],
    },
    {
      id: "neutral_vowel_dew", name: "중성모음 이슬 풀", emoji: "💧",
      description: "양성도 음성도 아닌 중성모음(ㅡ,ㅣ)의 이슬 맺힌 풀밭",
      position: { x: 50, y: 70 },
      slots: [
        { id: "vowel_eu", label: "ㅡ", relativePosition: { x: -5, y: 0 } },
        { id: "vowel_i", label: "ㅣ", relativePosition: { x: 5, y: 0 } },
      ],
    },
  ],
  syllable_tower: [
    {
      id: "onset_brick", name: "초성 벽돌(아래층)", emoji: "🧱",
      description: "음절의 시작인 초성이 쌓인 벽돌 아래층. 19개 자음",
      position: { x: 50, y: 70 },
      slots: [
        { id: "onset_consonant", label: "초성 자음", relativePosition: { x: 0, y: 0 } },
        { id: "onset_count", label: "초성 19개", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "nucleus_pillar", name: "중성 기둥(가운데)", emoji: "🏛️",
      description: "음절의 핵인 중성(모음)이 새겨진 가운데 기둥. 21개 모음",
      position: { x: 50, y: 45 },
      slots: [
        { id: "nucleus_vowel", label: "중성 모음", relativePosition: { x: 0, y: 0 } },
        { id: "nucleus_count", label: "중성 21개", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "coda_roof", name: "종성 지붕(꼭대기)", emoji: "🏠",
      description: "음절의 끝인 종성(받침)이 새겨진 꼭대기 지붕. 27개+없음",
      position: { x: 50, y: 20 },
      slots: [
        { id: "coda_consonant", label: "종성 받침", relativePosition: { x: 0, y: 0 } },
        { id: "end_sound_7", label: "끝소리 7개(ㄱㄴㄷㄹㅁㅂㅇ)", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "double_coda_chimney", name: "겹받침 굴뚝", emoji: "🏭",
      description: "겹받침(ㄳ,ㄵ,ㄶ 등)이 연기처럼 올라오는 굴뚝",
      position: { x: 80, y: 25 },
      slots: [
        { id: "double_coda", label: "겹받침 종류", relativePosition: { x: 0, y: -10 } },
        { id: "simplification", label: "자음군 단순화 규칙", relativePosition: { x: 0, y: 10 } },
      ],
    },
  ],
  change_bridge: [
    {
      id: "nasalization_fog_bridge", name: "비음화 안개다리", emoji: "🌫️",
      description: "비음 앞에서 장애음이 비음으로 바뀌는 안개다리(ㄱ→ㅇ, ㄷ→ㄴ, ㅂ→ㅁ)",
      position: { x: 20, y: 35 },
      slots: [
        { id: "velar_nasal", label: "ㄱ→ㅇ(국물→궁물)", relativePosition: { x: -10, y: 0 } },
        { id: "alveolar_nasal", label: "ㄷ→ㄴ(닫는→단는)", relativePosition: { x: 0, y: 0 } },
        { id: "bilabial_nasal", label: "ㅂ→ㅁ(밥물→밤물)", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "lateralization_water_bridge", name: "유음화 흐르는 물다리", emoji: "💦",
      description: "ㄴ이 ㄹ 옆에서 ㄹ로 바뀌는 물 흐르는 다리(ㄴ→ㄹ)",
      position: { x: 45, y: 30 },
      slots: [
        { id: "n_to_l", label: "ㄴ→ㄹ(신라→실라)", relativePosition: { x: 0, y: -5 } },
        { id: "l_context", label: "ㄹ 옆 환경", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "palatalization_roof_bridge", name: "구개음화 지붕다리", emoji: "🌉",
      description: "ㄷ/ㅌ이 이 모음 앞에서 ㅈ/ㅊ로 바뀌는 지붕 형태 다리",
      position: { x: 65, y: 40 },
      slots: [
        { id: "d_to_j", label: "ㄷ+이→ㅈ(굳이→구지)", relativePosition: { x: -10, y: 0 } },
        { id: "t_to_ch", label: "ㅌ+이→ㅊ(같이→가치)", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "fortition_vibration_bridge", name: "된소리 울림다리", emoji: "🔊",
      description: "평음이 된소리(경음)로 바뀌는 울림다리(ㄱ→ㄲ 등)",
      position: { x: 80, y: 55 },
      slots: [
        { id: "obstruent_context", label: "장애음 뒤 된소리", relativePosition: { x: 0, y: -10 } },
        { id: "fortition_examples", label: "국밥→국빱, 학교→학꾜", relativePosition: { x: 0, y: 10 } },
      ],
    },
  ],
  reduction_gate: [
    {
      id: "cluster_simplification_axe", name: "자음군 단순화 도끼문", emoji: "🪓",
      description: "겹받침에서 하나를 잘라내는 도끼 장식의 문(ㄳ→ㄱ, ㄵ→ㄴ 등)",
      position: { x: 25, y: 35 },
      slots: [
        { id: "left_survives", label: "왼쪽 남는 경우(ㄳ→ㄱ)", relativePosition: { x: -10, y: 0 } },
        { id: "right_survives", label: "오른쪽 남는 경우(ㄺ→ㄹ)", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "aspiration_furnace", name: "거센소리되기 용광로", emoji: "🔥",
      description: "ㅎ+ㄱ/ㄷ/ㅂ/ㅈ이 합쳐져 거센소리가 되는 용광로",
      position: { x: 55, y: 40 },
      slots: [
        { id: "h_plus_g", label: "ㅎ+ㄱ→ㅋ(놓고→노코)", relativePosition: { x: -10, y: -5 } },
        { id: "h_plus_d", label: "ㅎ+ㄷ→ㅌ(놓다→노타)", relativePosition: { x: 10, y: -5 } },
        { id: "h_plus_j", label: "ㅎ+ㅈ→ㅊ(놓지→노치)", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "h_deletion_evaporation_arch", name: "ㅎ탈락 증발 아치", emoji: "💨",
      description: "ㅎ이 모음 앞에서 사라지는 증발 아치(좋아→조아)",
      position: { x: 75, y: 60 },
      slots: [
        { id: "h_drop_vowel", label: "ㅎ+모음→탈락", relativePosition: { x: 0, y: -10 } },
        { id: "examples", label: "좋아→조아, 넣어→너어", relativePosition: { x: 0, y: 10 } },
      ],
    },
  ],
  addition_plaza: [
    {
      id: "saisiot_gate", name: "사이시옷 솟을 대문", emoji: "⛩️",
      description: "합성어에서 사이시옷이 끼어드는 솟을대문 형태의 게이트",
      position: { x: 25, y: 40 },
      slots: [
        { id: "saisiot_condition", label: "사이시옷 6조건", relativePosition: { x: 0, y: -10 } },
        { id: "saisiot_examples", label: "나뭇잎, 깃발, 햇살", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "n_insertion_pillar", name: "ㄴ첨가 끼어들기 돌기둥", emoji: "🪨",
      description: "합성어에서 ㄴ이 첨가되는 돌기둥(색연필→생년필)",
      position: { x: 55, y: 35 },
      slots: [
        { id: "n_insertion_rule", label: "ㄴ첨가 규칙", relativePosition: { x: 0, y: -10 } },
        { id: "n_insertion_examples", label: "색연필→생년필", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "vowel_contraction_press", name: "모음축약 압착 프레스", emoji: "🗜️",
      description: "두 모음이 하나로 줄어드는 압착 프레스(ㅗ+ㅏ→ㅘ 등)",
      position: { x: 75, y: 55 },
      slots: [
        { id: "contraction_oa", label: "ㅗ+ㅏ→ㅘ", relativePosition: { x: -10, y: 0 } },
        { id: "contraction_ue", label: "ㅜ+ㅓ→ㅝ", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],

  // ─── 2. 형태소 공방 (morpheme_workshop) ───
  root_workbench: [
    {
      id: "free_morpheme_oak", name: "자립 형태소 참나무 블록", emoji: "🪵",
      description: "혼자 쓸 수 있는 자립 형태소의 단단한 참나무 블록",
      position: { x: 25, y: 35 },
      slots: [
        { id: "free_substantive", label: "자립·실질(명사 등)", relativePosition: { x: -10, y: 0 } },
        { id: "free_formal", label: "자립·형식(조사)", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "bound_morpheme_puzzle", name: "의존 형태소 퍼즐 조각", emoji: "🧩",
      description: "다른 것과 결합해야 쓸 수 있는 의존 형태소의 퍼즐 조각",
      position: { x: 55, y: 30 },
      slots: [
        { id: "bound_substantive", label: "의존·실질(어근)", relativePosition: { x: -10, y: 0 } },
        { id: "bound_formal", label: "의존·형식(어미·접사)", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "substantive_formal_coin", name: "실질/형식 양면 동전", emoji: "🪙",
      description: "실질적 의미가 있는 면과 문법적 기능만 있는 면의 양면 동전",
      position: { x: 40, y: 65 },
      slots: [
        { id: "substantive_side", label: "실질 형태소(뜻 있음)", relativePosition: { x: -10, y: 0 } },
        { id: "formal_side", label: "형식 형태소(기능만)", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],
  affix_shelf: [
    {
      id: "prefix_hat_rack", name: "접두사 모자 걸이", emoji: "🎩",
      description: "어근 앞에 붙는 접두사들이 걸린 모자 걸이(풋-, 맨-, 헛-)",
      position: { x: 25, y: 35 },
      slots: [
        { id: "prefix_poot", label: "풋-(풋사과)", relativePosition: { x: -10, y: -5 } },
        { id: "prefix_maen", label: "맨-(맨손)", relativePosition: { x: 0, y: -5 } },
        { id: "prefix_heot", label: "헛-(헛소문)", relativePosition: { x: 10, y: -5 } },
      ],
    },
    {
      id: "suffix_tail_hook", name: "접미사 꼬리 고리", emoji: "🪝",
      description: "어근 뒤에 붙는 접미사들이 달린 꼬리 고리(-이, -음, -기)",
      position: { x: 60, y: 40 },
      slots: [
        { id: "suffix_i", label: "-이(높이)", relativePosition: { x: -10, y: 0 } },
        { id: "suffix_eum", label: "-음(웃음)", relativePosition: { x: 0, y: 0 } },
        { id: "suffix_gi", label: "-기(달리기)", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "derivation_mirror", name: "파생 변환 거울", emoji: "🪞",
      description: "접사 결합으로 품사가 바뀌는 것을 보여주는 변환 거울",
      position: { x: 40, y: 70 },
      slots: [
        { id: "verb_to_noun", label: "동사→명사(-음/-기)", relativePosition: { x: -10, y: 0 } },
        { id: "adj_to_adv", label: "형용사→부사(-이/-히)", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],
  derivation_bench: [
    {
      id: "root_affix_magnet", name: "어근+접사 자석 결합 봉", emoji: "🧲",
      description: "어근과 접사가 자석처럼 달라붙는 결합 봉",
      position: { x: 30, y: 35 },
      slots: [
        { id: "root_slot", label: "어근 자리", relativePosition: { x: -10, y: 0 } },
        { id: "affix_slot", label: "접사 자리", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "pos_conversion_stamp", name: "품사 변환 도장", emoji: "📛",
      description: "파생으로 품사가 변하면 찍는 도장. 동→명, 형→부 등",
      position: { x: 60, y: 40 },
      slots: [
        { id: "original_pos", label: "원래 품사", relativePosition: { x: -10, y: 0 } },
        { id: "derived_pos", label: "파생된 품사", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "derivation_bell", name: "파생어 완성 벨", emoji: "🛎️",
      description: "파생어가 완성되면 울리는 벨",
      position: { x: 45, y: 70 },
      slots: [
        { id: "derived_word", label: "완성된 파생어", relativePosition: { x: 0, y: 0 } },
      ],
    },
  ],
  compound_forge: [
    {
      id: "root_welding_torch", name: "어근+어근 용접 토치", emoji: "🔦",
      description: "두 어근을 용접하여 합성어를 만드는 토치",
      position: { x: 30, y: 35 },
      slots: [
        { id: "root_1", label: "어근 1", relativePosition: { x: -10, y: 0 } },
        { id: "root_2", label: "어근 2", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "syntactic_compound_rail", name: "통사적 합성어 직선 레일", emoji: "🛤️",
      description: "국어 문법 순서를 따르는 통사적 합성어의 직선 레일",
      position: { x: 60, y: 30 },
      slots: [
        { id: "syntactic_example", label: "큰집, 돌다리", relativePosition: { x: 0, y: -5 } },
        { id: "word_order", label: "정상 어순", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "nonsyntactic_compound_rail", name: "비통사적 합성어 꼬인 레일", emoji: "🌀",
      description: "국어 문법 순서를 따르지 않는 비통사적 합성어의 꼬인 레일",
      position: { x: 60, y: 65 },
      slots: [
        { id: "nonsyntactic_example", label: "검붉다, 돌보다", relativePosition: { x: 0, y: -5 } },
        { id: "irregular_order", label: "비정상 어순", relativePosition: { x: 0, y: 10 } },
      ],
    },
  ],
  pos_cabinet: [
    {
      id: "substantive_drawer", name: "체언 서랍(나무 질감)", emoji: "🗄️",
      description: "명사·대명사·수사가 담긴 나무 질감의 체언 서랍",
      position: { x: 20, y: 30 },
      slots: [
        { id: "noun", label: "명사", relativePosition: { x: -10, y: 0 } },
        { id: "pronoun", label: "대명사", relativePosition: { x: 0, y: 0 } },
        { id: "numeral", label: "수사", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "predicate_drawer", name: "용언 서랍(금속 광택)", emoji: "🔩",
      description: "동사·형용사가 담긴 금속 광택의 용언 서랍",
      position: { x: 50, y: 35 },
      slots: [
        { id: "verb", label: "동사(움직임)", relativePosition: { x: -10, y: 0 } },
        { id: "adjective", label: "형용사(상태)", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "modifier_drawer", name: "수식언 서랍(유리 투명)", emoji: "🫧",
      description: "관형사·부사가 담긴 투명 유리 수식언 서랍",
      position: { x: 75, y: 40 },
      slots: [
        { id: "determiner", label: "관형사", relativePosition: { x: -5, y: 0 } },
        { id: "adverb", label: "부사", relativePosition: { x: 5, y: 0 } },
      ],
    },
    {
      id: "relational_independent_slot", name: "관계언/독립언 작은 칸", emoji: "📎",
      description: "조사(관계언)와 감탄사(독립언)가 담긴 작은 칸",
      position: { x: 45, y: 70 },
      slots: [
        { id: "particle", label: "조사(관계언)", relativePosition: { x: -10, y: 0 } },
        { id: "interjection", label: "감탄사(독립언)", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],

  // ─── 3. 문장의 궁전 (sentence_palace) ───
  subject_throne: [
    {
      id: "nominative_crown", name: "주격 조사 '이/가' 금빛 왕관", emoji: "👑",
      description: "주어를 표시하는 주격 조사 '이/가'가 새겨진 금빛 왕관",
      position: { x: 30, y: 30 },
      slots: [
        { id: "i_ga", label: "이/가 주격", relativePosition: { x: 0, y: -10 } },
        { id: "subject_identify", label: "주어 식별", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "subject_sash", name: "주어 어깨띠(~이/가)", emoji: "🎗️",
      description: "문장의 주인공임을 나타내는 주어 어깨띠",
      position: { x: 55, y: 40 },
      slots: [
        { id: "agent_subject", label: "동작주(~이/가 ~하다)", relativePosition: { x: -10, y: 0 } },
        { id: "theme_subject", label: "피동주(~이/가 ~되다)", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "humble_silver_crown", name: "겸양 '께서' 은빛 왕관", emoji: "🥈",
      description: "높임의 주격 조사 '께서'가 새겨진 은빛 왕관",
      position: { x: 75, y: 55 },
      slots: [
        { id: "kkeseo", label: "께서(주체 높임)", relativePosition: { x: 0, y: -10 } },
        { id: "honorific_si", label: "-시-(선어말어미)", relativePosition: { x: 0, y: 10 } },
      ],
    },
  ],
  predicate_court: [
    {
      id: "verb_hammer", name: "동사 망치(행동)", emoji: "🔨",
      description: "행동을 나타내는 동사의 망치. 주어의 동작을 서술",
      position: { x: 20, y: 35 },
      slots: [
        { id: "action_verb", label: "동작 동사", relativePosition: { x: 0, y: -10 } },
        { id: "state_verb", label: "상태 동사(있다/없다)", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "adjective_mirror", name: "형용사 거울(상태)", emoji: "🪞",
      description: "상태를 비추는 형용사의 거울. 주어의 성질/상태를 서술",
      position: { x: 45, y: 30 },
      slots: [
        { id: "quality_adj", label: "성질 형용사", relativePosition: { x: -10, y: 0 } },
        { id: "state_adj", label: "상태 형용사", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "ida_equals_scale", name: "'이다' 등호 저울", emoji: "⚖️",
      description: "'이다'(서술격 조사)의 등호 저울. A=B를 선언",
      position: { x: 70, y: 40 },
      slots: [
        { id: "equation_a", label: "주어(A)", relativePosition: { x: -10, y: 0 } },
        { id: "equation_b", label: "보어(B)", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "valency_numpad", name: "서술어 자릿수 숫자판", emoji: "🔢",
      description: "서술어가 필수적으로 요구하는 문장 성분의 수를 나타내는 숫자판",
      position: { x: 45, y: 70 },
      slots: [
        { id: "one_place", label: "한 자리(자동사)", relativePosition: { x: -10, y: 0 } },
        { id: "two_place", label: "두 자리(타동사)", relativePosition: { x: 0, y: 0 } },
        { id: "three_place", label: "세 자리(수여동사)", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],
  object_courtyard: [
    {
      id: "accusative_net", name: "목적격 '을/를' 그물", emoji: "🥅",
      description: "목적어를 잡는 목적격 조사 '을/를'의 그물",
      position: { x: 30, y: 35 },
      slots: [
        { id: "eul_reul", label: "을/를 목적격", relativePosition: { x: 0, y: -10 } },
        { id: "direct_object", label: "직접 목적어", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "complement_flag", name: "보어 '이/가' 깃발", emoji: "🏁",
      description: "되다/아니다 앞의 보어를 표시하는 '이/가' 깃발",
      position: { x: 55, y: 40 },
      slots: [
        { id: "complement_doeda", label: "~이/가 되다", relativePosition: { x: -10, y: 0 } },
        { id: "complement_anida", label: "~이/가 아니다", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "essential_adverb_velvet", name: "필수적 부사어 VIP 벨벳 줄", emoji: "🎪",
      description: "서술어가 반드시 요구하는 필수적 부사어의 VIP 벨벳 줄",
      position: { x: 75, y: 60 },
      slots: [
        { id: "essential_adverb", label: "필수적 부사어(~에/~로)", relativePosition: { x: 0, y: -10 } },
        { id: "optional_adverb", label: "수의적 부사어", relativePosition: { x: 0, y: 10 } },
      ],
    },
  ],
  modifier_corridor: [
    {
      id: "adnominal_frame", name: "관형어 액자틀(-ㄴ/-는/-ㄹ 패턴)", emoji: "🖼️",
      description: "체언을 꾸미는 관형어의 액자틀. -ㄴ/-는/-ㄹ 관형사형",
      position: { x: 25, y: 35 },
      slots: [
        { id: "past_n", label: "-ㄴ(과거/완료)", relativePosition: { x: -10, y: 0 } },
        { id: "present_neun", label: "-는(현재/진행)", relativePosition: { x: 0, y: 0 } },
        { id: "future_l", label: "-ㄹ(미래/추정)", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "adverb_arrow_carpet", name: "부사어 화살표 카펫", emoji: "➡️",
      description: "용언이나 문장 전체를 꾸미는 부사어의 화살표 방향 카펫",
      position: { x: 55, y: 40 },
      slots: [
        { id: "component_adverb", label: "성분 부사어", relativePosition: { x: -10, y: 0 } },
        { id: "sentence_adverb", label: "문장 부사어", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "independent_balloon", name: "독립어 풍선(호격/감탄)", emoji: "🎈",
      description: "다른 성분과 독립적인 독립어의 풍선. 호격·감탄·응답 등",
      position: { x: 75, y: 60 },
      slots: [
        { id: "vocative", label: "호격(영수야!)", relativePosition: { x: -10, y: 0 } },
        { id: "exclamatory", label: "감탄(아, 와!)", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],
  embedded_chamber: [
    {
      id: "noun_clause_box", name: "명사절 상자(-음/-기 라벨)", emoji: "📦",
      description: "절 전체가 명사 역할을 하는 명사절 상자. -음/-기 라벨 부착",
      position: { x: 20, y: 30 },
      slots: [
        { id: "eum_clause", label: "-음 명사절", relativePosition: { x: -5, y: 0 } },
        { id: "gi_clause", label: "-기 명사절", relativePosition: { x: 5, y: 0 } },
      ],
    },
    {
      id: "adnominal_clause_frame", name: "관형절 액자(-ㄴ/-는/-ㄹ 틀)", emoji: "🖼️",
      description: "절 전체가 관형어 역할을 하는 관형절 액자",
      position: { x: 45, y: 35 },
      slots: [
        { id: "relative_clause", label: "관계 관형절", relativePosition: { x: -10, y: 0 } },
        { id: "complement_clause", label: "동격 관형절", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "adverb_clause_carpet", name: "부사절 양탄자(-게/-도록)", emoji: "🧶",
      description: "절 전체가 부사어 역할을 하는 부사절 양탄자",
      position: { x: 70, y: 45 },
      slots: [
        { id: "ge_clause", label: "-게 부사절", relativePosition: { x: -10, y: 0 } },
        { id: "dorok_clause", label: "-도록 부사절", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "quotation_speech_bubble", name: "인용절 말풍선(-라고/-다고)", emoji: "💬",
      description: "다른 사람의 말이나 생각을 인용하는 인용절 말풍선",
      position: { x: 40, y: 70 },
      slots: [
        { id: "direct_quote", label: "직접 인용(-라고)", relativePosition: { x: -10, y: 0 } },
        { id: "indirect_quote", label: "간접 인용(-다고)", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],
  connected_hall: [
    {
      id: "coordinate_equals_pillar", name: "대등 접속 '='자 기둥", emoji: "🟰",
      description: "대등하게 이어진 문장의 '='자 기둥. -고/-지만/-거나 등",
      position: { x: 25, y: 35 },
      slots: [
        { id: "additive_go", label: "-고(나열)", relativePosition: { x: -10, y: 0 } },
        { id: "adversative_jiman", label: "-지만(대조)", relativePosition: { x: 0, y: 0 } },
        { id: "alternative_geona", label: "-거나(선택)", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "subordinate_arrow_pillar", name: "종속 접속 '→'자 기둥", emoji: "➡️",
      description: "종속적으로 이어진 문장의 '→'자 기둥. -면/-므로/-니까 등",
      position: { x: 55, y: 40 },
      slots: [
        { id: "conditional_myeon", label: "-면(조건)", relativePosition: { x: -10, y: 0 } },
        { id: "causal_meuro", label: "-므로(원인)", relativePosition: { x: 0, y: 0 } },
        { id: "causal_nikka", label: "-니까(이유)", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "connective_ending_arch", name: "연결어미 아치 게이트", emoji: "🌈",
      description: "다양한 연결어미가 새겨진 아치 게이트",
      position: { x: 75, y: 60 },
      slots: [
        { id: "temporal", label: "-ㄹ 때/-자(시간)", relativePosition: { x: -10, y: 0 } },
        { id: "purposive", label: "-려고/-고자(목적)", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],

  // ─── 4. 집현전 (jiphyeonjeon) ───
  hunminjeongeum_room: [
    {
      id: "onset_pictograph_scroll", name: "초성 발음기관 상형도 족자", emoji: "📜",
      description: "초성 자음을 발음기관 모양에서 따왔음을 보여주는 상형도 족자",
      position: { x: 20, y: 30 },
      slots: [
        { id: "velar_shape", label: "ㄱ=혀뿌리 모양", relativePosition: { x: -10, y: -5 } },
        { id: "alveolar_shape", label: "ㄴ=혀 모양", relativePosition: { x: 0, y: -5 } },
        { id: "bilabial_shape", label: "ㅁ=입 모양", relativePosition: { x: 10, y: -5 } },
        { id: "dental_shape", label: "ㅅ=이 모양", relativePosition: { x: -5, y: 10 } },
        { id: "glottal_shape", label: "ㅇ=목구멍 모양", relativePosition: { x: 5, y: 10 } },
      ],
    },
    {
      id: "samwon_stone_tablet", name: "중성 천지인 삼원 석판", emoji: "🪨",
      description: "중성 모음의 창제 원리인 천(ㆍ)·지(ㅡ)·인(ㅣ)이 새겨진 석판",
      position: { x: 50, y: 35 },
      slots: [
        { id: "heaven", label: "천(ㆍ·하늘·둥금)", relativePosition: { x: 0, y: -10 } },
        { id: "earth", label: "지(ㅡ·땅·평평)", relativePosition: { x: -10, y: 10 } },
        { id: "human", label: "인(ㅣ·사람·곧음)", relativePosition: { x: 10, y: 10 } },
      ],
    },
    {
      id: "jongseong_wooden_type", name: "종성부용초성 나무 활자", emoji: "🔤",
      description: "종성에 초성을 다시 쓴다(종성부용초성)는 원리의 나무 활자",
      position: { x: 75, y: 50 },
      slots: [
        { id: "reuse_principle", label: "초성 재활용 원리", relativePosition: { x: 0, y: -10 } },
        { id: "final_consonant", label: "종성 적용", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "haerye_glass_case", name: "해례본 원본 유리 보관함", emoji: "🏺",
      description: "훈민정음 해례본 원본을 보관하는 유리 보관함. 1997 유네스코 기록유산",
      position: { x: 40, y: 70 },
      slots: [
        { id: "creation_principle", label: "제자 원리(해례)", relativePosition: { x: -10, y: 0 } },
        { id: "usage_example", label: "용자례(용례)", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],
  medieval_archive: [
    {
      id: "arae_a_stele", name: "아래아(ㆍ) 각인 석비", emoji: "🗿",
      description: "중세국어에서 쓰이던 아래아(ㆍ)가 각인된 석비",
      position: { x: 25, y: 30 },
      slots: [
        { id: "arae_a_usage", label: "아래아 쓰임", relativePosition: { x: 0, y: -10 } },
        { id: "arae_a_change", label: "아래아 소실 과정", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "bangjeom_abacus", name: "방점 거성(·)/상성(··) 주판", emoji: "🧮",
      description: "중세국어의 성조를 표시하던 방점 체계의 주판",
      position: { x: 55, y: 35 },
      slots: [
        { id: "pyeongseong", label: "평성(무점)", relativePosition: { x: -10, y: 0 } },
        { id: "geoseong", label: "거성(점 1개)", relativePosition: { x: 0, y: 0 } },
        { id: "sangseong", label: "상성(점 2개)", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "continuous_writing_scroll", name: "이어적기 두루마리", emoji: "📃",
      description: "중세국어의 이어적기(연철) 표기법이 적힌 두루마리",
      position: { x: 40, y: 60 },
      slots: [
        { id: "yeoncheol", label: "이어적기(연철)", relativePosition: { x: -10, y: 0 } },
        { id: "kkeuneojjeokgi", label: "끊어적기(분철)", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "vowel_harmony_fan", name: "모음조화 양성/음성 양면 부채", emoji: "🪭",
      description: "양성모음+양성, 음성모음+음성의 모음조화를 보여주는 양면 부채",
      position: { x: 75, y: 55 },
      slots: [
        { id: "positive_harmony", label: "양성 조화(ㅏ+ㅏ)", relativePosition: { x: -10, y: 0 } },
        { id: "negative_harmony", label: "음성 조화(ㅓ+ㅓ)", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],
  modern_transition: [
    {
      id: "arae_a_converter", name: "아래아→ㅏ 변화 변환기", emoji: "🔄",
      description: "아래아가 ㅏ로 변한 근대국어 모음 변화를 보여주는 변환기",
      position: { x: 25, y: 35 },
      slots: [
        { id: "first_syllable", label: "1음절: ㆍ→ㅏ", relativePosition: { x: -10, y: 0 } },
        { id: "non_first", label: "비1음절: ㆍ→ㅡ", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "palatalization_timeline", name: "구개음화 타임라인 벽화", emoji: "🎞️",
      description: "17세기 이후 구개음화 확산 과정을 보여주는 타임라인 벽화",
      position: { x: 50, y: 30 },
      slots: [
        { id: "before_palatal", label: "변화 전(디다)", relativePosition: { x: -10, y: 0 } },
        { id: "after_palatal", label: "변화 후(지다)", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "initial_law_checkpoint", name: "두음법칙 검문소", emoji: "🚧",
      description: "어두에서 ㄹ/ㄴ이 변하는 두음법칙 검문소(녀→여, 류→유)",
      position: { x: 70, y: 45 },
      slots: [
        { id: "r_to_n_zero", label: "ㄹ→ㄴ/ㅇ(률→율)", relativePosition: { x: -10, y: 0 } },
        { id: "n_to_zero", label: "ㄴ→ㅇ(녀→여)", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "unified_spelling_cover", name: "맞춤법 통일안(1933) 금박 표지", emoji: "📕",
      description: "한글 맞춤법 통일안(1933)의 금박 표지. 현대 맞춤법의 기초",
      position: { x: 45, y: 70 },
      slots: [
        { id: "morphophonemic", label: "형태음소적 표기 원칙", relativePosition: { x: -10, y: 0 } },
        { id: "standardization", label: "표기 표준화", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],
  spelling_lecture: [
    {
      id: "sound_morpheme_board", name: "'소리대로+어법에' 칠판 양분 규칙", emoji: "📋",
      description: "한글 맞춤법 제1항: 소리대로 적되, 어법에 맞도록의 양분 칠판",
      position: { x: 30, y: 30 },
      slots: [
        { id: "phonetic_side", label: "소리대로(표음)", relativePosition: { x: -10, y: 0 } },
        { id: "morphemic_side", label: "어법에 맞도록(표의)", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "saisiot_6_dice", name: "사이시옷 6조건 주사위", emoji: "🎯",
      description: "사이시옷 표기의 6가지 조건이 새겨진 주사위",
      position: { x: 60, y: 35 },
      slots: [
        { id: "native_compound", label: "순우리말 합성어", relativePosition: { x: -10, y: -5 } },
        { id: "native_sino", label: "고유어+한자어", relativePosition: { x: 10, y: -5 } },
        { id: "six_sino", label: "한자어 6개(곳간 등)", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "spacing_ruler", name: "띄어쓰기 자(ruler)", emoji: "📏",
      description: "띄어쓰기 규칙을 측정하는 자. 조사는 붙여, 의존명사는 띄어",
      position: { x: 40, y: 60 },
      slots: [
        { id: "particle_attach", label: "조사 붙여쓰기", relativePosition: { x: -10, y: 0 } },
        { id: "bound_noun_space", label: "의존명사 띄어쓰기", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "double_coda_chart", name: "겹받침 도표 족자", emoji: "📊",
      description: "겹받침 11개의 발음 규칙이 정리된 도표 족자",
      position: { x: 75, y: 55 },
      slots: [
        { id: "left_read", label: "왼쪽 읽기(ㄳ→ㄱ)", relativePosition: { x: -10, y: 0 } },
        { id: "right_read", label: "오른쪽 읽기(ㄺ→ㄹ)", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],
  standard_library: [
    {
      id: "multiple_standard_bookmark", name: "복수표준어 양갈래 책갈피", emoji: "📑",
      description: "두 가지 이상 표준어가 인정되는 복수표준어의 양갈래 책갈피",
      position: { x: 25, y: 35 },
      slots: [
        { id: "dual_standard", label: "복수 표준어 사례", relativePosition: { x: -10, y: 0 } },
        { id: "standard_change", label: "표준어 변경 사례", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "loanword_flag_card", name: "외래어 표기법 국기 카드", emoji: "🏳️",
      description: "영어/일본어/중국어 등 원어별 외래어 표기법의 국기 카드",
      position: { x: 55, y: 40 },
      slots: [
        { id: "english_loan", label: "영어 외래어 표기", relativePosition: { x: -10, y: 0 } },
        { id: "japanese_loan", label: "일본어 외래어 표기", relativePosition: { x: 0, y: 0 } },
        { id: "chinese_loan", label: "중국어 외래어 표기", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "romanization_tile", name: "로마자 표기법 알파벳 타일", emoji: "🔡",
      description: "한글의 로마자 표기 규칙이 새겨진 알파벳 타일",
      position: { x: 75, y: 55 },
      slots: [
        { id: "romanization_rule", label: "표기 원칙(전사법)", relativePosition: { x: -10, y: 0 } },
        { id: "exceptions", label: "예외 규정", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],

  // ─── 5. 매체의 광장 (media_square) ───
  print_pavilion: [
    {
      id: "gutenberg_press", name: "구텐베르크 인쇄기 모형", emoji: "🖨️",
      description: "인쇄 매체의 시초인 구텐베르크 인쇄기의 모형",
      position: { x: 20, y: 30 },
      slots: [
        { id: "movable_type", label: "활판 인쇄술", relativePosition: { x: 0, y: -10 } },
        { id: "mass_production", label: "대량 복제·배포", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "inverted_pyramid", name: "역피라미드 기사 구조물", emoji: "🔻",
      description: "위가 넓고 아래가 좁은 뉴스 기사의 역피라미드 구조물",
      position: { x: 50, y: 35 },
      slots: [
        { id: "headline_lead", label: "표제/전문(핵심)", relativePosition: { x: 0, y: -10 } },
        { id: "body_detail", label: "본문(세부 사항)", relativePosition: { x: 0, y: 0 } },
        { id: "background", label: "배경(부가 정보)", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "editor_red_pen", name: "편집자의 빨간 펜", emoji: "🖊️",
      description: "기사를 교정하고 게이트키핑하는 편집자의 빨간 펜",
      position: { x: 75, y: 45 },
      slots: [
        { id: "gatekeeping", label: "게이트키핑", relativePosition: { x: -10, y: 0 } },
        { id: "editing", label: "교정·교열", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "newspaper_turntable", name: "신문 돌림판", emoji: "📰",
      description: "다양한 신문 지면(1면/사회/문화/사설)을 돌려보는 돌림판",
      position: { x: 40, y: 70 },
      slots: [
        { id: "news_section", label: "보도 기사", relativePosition: { x: -10, y: 0 } },
        { id: "editorial_section", label: "사설·칼럼", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],
  broadcast_studio: [
    {
      id: "tv_camera", name: "TV 카메라(클로즈업/롱샷 라벨)", emoji: "📹",
      description: "클로즈업과 롱샷 등 다양한 샷 크기를 표시한 TV 카메라",
      position: { x: 25, y: 35 },
      slots: [
        { id: "closeup", label: "클로즈업(감정)", relativePosition: { x: -10, y: 0 } },
        { id: "longshot", label: "롱샷(상황)", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "cue_sign_red_light", name: "큐사인 빨간 불", emoji: "🔴",
      description: "방송 시작을 알리는 큐사인 빨간 불",
      position: { x: 55, y: 30 },
      slots: [
        { id: "on_air", label: "ON AIR(생방송)", relativePosition: { x: 0, y: -10 } },
        { id: "recording", label: "녹화/편집 방송", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "subtitle_generator", name: "자막 생성기", emoji: "📝",
      description: "방송에 자막을 입히는 생성기. 시각 정보 보조",
      position: { x: 70, y: 50 },
      slots: [
        { id: "open_caption", label: "열린 자막", relativePosition: { x: -10, y: 0 } },
        { id: "closed_caption", label: "닫힌 자막", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "three_point_lighting", name: "조명 삼점 세트(키/필/백)", emoji: "💡",
      description: "방송 조명의 삼점 조명 세트: 키 라이트/필 라이트/백 라이트",
      position: { x: 40, y: 70 },
      slots: [
        { id: "key_light", label: "키 라이트(주광)", relativePosition: { x: -10, y: 0 } },
        { id: "fill_light", label: "필 라이트(보조광)", relativePosition: { x: 0, y: 0 } },
        { id: "back_light", label: "백 라이트(역광)", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],
  sns_cafe: [
    {
      id: "hashtag_neon", name: "해시태그(#) 네온사인", emoji: "🏷️",
      description: "SNS의 핵심 분류 체계인 해시태그(#)의 네온사인",
      position: { x: 25, y: 30 },
      slots: [
        { id: "topic_tag", label: "주제 해시태그", relativePosition: { x: -10, y: 0 } },
        { id: "trending_tag", label: "트렌딩 해시태그", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "like_counter", name: "좋아요(♥) 카운터", emoji: "❤️",
      description: "좋아요 수를 세는 카운터. SNS 상호작용의 기본 단위",
      position: { x: 55, y: 35 },
      slots: [
        { id: "engagement", label: "참여(인게이지먼트)", relativePosition: { x: -10, y: 0 } },
        { id: "social_validation", label: "사회적 검증", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "algorithm_slot_machine", name: "알고리즘 슬롯머신", emoji: "🎰",
      description: "사용자 맞춤 콘텐츠를 추천하는 알고리즘의 슬롯머신",
      position: { x: 75, y: 45 },
      slots: [
        { id: "recommendation", label: "추천 알고리즘", relativePosition: { x: 0, y: -10 } },
        { id: "echo_chamber", label: "에코 챔버(반향실)", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "emoticon_vending", name: "이모티콘 자판기", emoji: "😀",
      description: "비언어적 표현 수단인 이모티콘/이모지의 자판기",
      position: { x: 40, y: 70 },
      slots: [
        { id: "nonverbal_comm", label: "비언어적 소통", relativePosition: { x: -10, y: 0 } },
        { id: "emotional_expression", label: "감정 표현", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],
  factcheck_center: [
    {
      id: "magnifying_glass", name: "돋보기 확대경", emoji: "🔍",
      description: "정보를 면밀히 살피는 팩트체크용 돋보기 확대경",
      position: { x: 25, y: 35 },
      slots: [
        { id: "claim_check", label: "주장 검증", relativePosition: { x: -10, y: 0 } },
        { id: "evidence_review", label: "증거 검토", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "source_verification_stamp", name: "출처 검증 스탬프(O/X)", emoji: "✅",
      description: "출처의 신뢰성을 검증하는 O/X 스탬프",
      position: { x: 55, y: 30 },
      slots: [
        { id: "verified", label: "검증됨(O)", relativePosition: { x: -10, y: 0 } },
        { id: "unverified", label: "미검증(X)", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "confirmation_bias_mirror", name: "확증편향 거울(한쪽만 보이는)", emoji: "🪞",
      description: "자신이 믿고 싶은 것만 보이는 확증편향의 한쪽 거울",
      position: { x: 70, y: 50 },
      slots: [
        { id: "confirmation_bias", label: "확증 편향", relativePosition: { x: 0, y: -10 } },
        { id: "critical_thinking", label: "비판적 사고", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "filter_bubble_device", name: "필터버블 거품 장치", emoji: "🫧",
      description: "개인화된 정보만 보이게 하는 필터 버블의 거품 장치",
      position: { x: 40, y: 70 },
      slots: [
        { id: "filter_bubble", label: "필터 버블", relativePosition: { x: -10, y: 0 } },
        { id: "information_diversity", label: "정보 다양성 확보", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],
  ai_media_lab: [
    {
      id: "deepfake_ir_goggles", name: "딥페이크 탐지 적외선 안경", emoji: "🥽",
      description: "딥페이크 영상을 탐지하는 적외선 안경. AI 위조 콘텐츠 식별",
      position: { x: 20, y: 30 },
      slots: [
        { id: "deepfake_detect", label: "딥페이크 탐지", relativePosition: { x: 0, y: -10 } },
        { id: "synthetic_media", label: "합성 미디어 식별", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "ai_vs_human_scale", name: "AI 생성 vs 인간 작성 비교 저울", emoji: "⚖️",
      description: "AI가 생성한 글과 인간이 작성한 글을 비교하는 저울",
      position: { x: 50, y: 35 },
      slots: [
        { id: "ai_generated", label: "AI 생성 콘텐츠", relativePosition: { x: -10, y: 0 } },
        { id: "human_written", label: "인간 작성 콘텐츠", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "digital_footprint_hourglass", name: "디지털 발자국 모래시계", emoji: "⏳",
      description: "온라인 활동이 쌓이는 디지털 발자국의 모래시계",
      position: { x: 75, y: 45 },
      slots: [
        { id: "data_trail", label: "데이터 흔적", relativePosition: { x: 0, y: -10 } },
        { id: "privacy_concern", label: "개인정보 우려", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "right_to_be_forgotten_eraser", name: "잊힐 권리 지우개", emoji: "🧽",
      description: "개인 정보 삭제를 요청하는 '잊힐 권리'의 지우개",
      position: { x: 45, y: 70 },
      slots: [
        { id: "erasure_right", label: "잊힐 권리(삭제 요청)", relativePosition: { x: -10, y: 0 } },
        { id: "digital_ethics", label: "디지털 윤리", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],
};
