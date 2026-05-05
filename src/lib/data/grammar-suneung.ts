/**
 * 수능 영어 어법 문제 (2017~2026 학년도) + 헤밍웨이 영문법 단원 매핑.
 *
 * 출처: 한국교육과정평가원 (KICE) 수능 영어 영역.
 * 교육 목적 학생 학습용 노출 (fair use). 상업적 재배포 X.
 *
 * 2018 (어휘 문제) 는 어법 단원 매핑 대상 아님 — hasGrammar=false.
 */

export interface SuneungQuestion {
  year: number;            // 학년도 (예: 2024)
  number: number;          // 문제 번호 (보통 28 또는 29)
  passage: string;         // 본문 markdown — ① ~ ⑤ 그대로 유지
  choices: string[];       // 5개 밑줄 표현 (텍스트만, 라벨은 ① 등)
  answer: number;          // 0~4 (CHOICE_LABELS 인덱스)
  errorPart: string;       // 잘못된 표현 (그대로)
  correctedForm: string;   // 옳은 형태
  explanation: string;     // 왜 틀렸나 + 옳은 룰
  otherChoicesNote?: string; // 다른 선택지가 왜 옳은지 (선택)
  relatedSlugs: string[];  // 헤밍웨이 영문법 슬러그 매핑 (1~3개)
  hasGrammar: boolean;     // true=어법 / false=어휘
  reviewNeeded?: string;   // 자료·정답 검토 필요 시 메모
}

export const SUNEUNG_QUESTIONS: SuneungQuestion[] = [
  // ── 2026 ────────────────────────────────────────
  {
    year: 2026,
    number: 29,
    passage: `We are exceptionally smart, and this helps us adapt to a wide range of environments. But we are not nearly smart enough as individuals ① to solve the adaptive problems that confronted modern humans as they spread across the globe. The package of tools, foraging techniques, ecological knowledge, and social arrangements used by any group of foragers ② being far too complex for any individual to create. We are able to learn all the things we need to know in each of the many different environments ③ in which we live only because we acquire information from others. We are much better at learning from others than other species are, and we are ④ motivated to learn from others even when we do not understand why our models are doing what they are doing. This psychology allows human populations to accumulate pools of adaptive information that ⑤ greatly exceed the inventive capacities of individuals.

* forage: 구하러 다니다`,
    choices: [
      'to solve the adaptive problems',
      'being far too complex',
      'in which we live',
      'motivated to learn from others',
      'greatly exceed',
    ],
    answer: 1, // ②
    errorPart: 'being',
    correctedForm: 'is',
    explanation: `주어는 \`The package of tools, foraging techniques, ecological knowledge, and social arrangements\`. 이 주어를 \`used by any group of foragers\` 가 수식하고 있고, 그 다음에 본동사가 와야 한다. \`being\` 은 분사 형태라 본동사 역할을 못 한다. 단수 주어 \`The package\` 에 맞춰 본동사 \`is\` 가 되어야 한다.

분사구문이 본동사 자리를 차지하는 한국 학생 단골 함정. 절을 길게 끌고 가다 본동사를 빠뜨리는 패턴.`,
    otherChoicesNote: `① to solve — enough + to V (정도, 부사적 용법) 정상. ③ in which we live — 전치사 + 관계대명사 정상. ④ motivated — 사람 주어 we 가 동기 부여 받음 (수동) → -ed 정상. ⑤ greatly exceed — 주어 \`pools of adaptive information\` 복수 → exceed (s 없음) 정상.`,
    relatedSlugs: ['participle-phrase', 'agreement-subject-verb'],
    hasGrammar: true,
  },
  // ── 2025 ────────────────────────────────────────
  {
    year: 2025,
    number: 29,
    passage: `Think of yourself. When you decide to get up and get a drink of water, for example, you don't consciously organize or consider the host of steps involved. Imagine if we ① had to consider every single muscle that needed to be contracted or relaxed just to stand up and walk. It would be tiresome and very slow ― as patients recovering from a brain injury affecting the motor system ② knows. The autopilot parts of our brain do it for us automatically, ③ freeing up our conscious mind for more important jobs. It is the older parts of our brain ④ that support these automatic processes that allow us to move, hear, see, and use many of our social skills. More recently evolved abilities like talking, reading, and writing are far less automated. So, most of the time, ⑤ what you are perceiving, feeling, or thinking is based on a very crude and fast analysis that happens completely without your awareness.

* crude: 투박한`,
    choices: [
      'had to consider',
      'knows',
      'freeing up',
      'that',
      'what',
    ],
    answer: 1, // ②
    errorPart: 'knows',
    correctedForm: 'know',
    explanation: `주어는 \`patients\` (복수). \`recovering from a brain injury affecting the motor system\` 은 patients 를 수식하는 분사구문. 본동사는 patients 에 맞춰 **복수형 \`know\`** 가 되어야 한다.

긴 수식어구가 끼면 진짜 주어를 놓치고 가까운 명사 (motor system) 에 동사를 일치시키는 한국 학생 단골 함정.`,
    otherChoicesNote: `① had to consider — 가정법 과거 if 절 안의 had to (must 의 과거) 정상. ③ freeing up — 분사구문, do it 의 결과 의미 정상. ④ that — 강조구문 \`It is ~ that\` 정상. ⑤ what — \`what you are perceiving\` 명사절 (선행사 포함) 정상.`,
    relatedSlugs: ['agreement-subject-verb'],
    hasGrammar: true,
  },
  // ── 2024 ────────────────────────────────────────
  {
    year: 2024,
    number: 29,
    passage: `A number of studies provide substantial evidence of an innate human disposition to respond differentially to social stimuli. From birth, infants will orient preferentially towards the human face and voice, ① seeming to know that such stimuli are particularly meaningful for them. Moreover, they register this connection actively, imitating a variety of facial gestures that are presented to them ― tongue protrusions, lip tightenings, mouth openings. They will even try to match gestures ② which they have some difficulty, experimenting with their own faces until they succeed. When they ③ do succeed, they show pleasure by a brightening of their eyes; when they fail, they show distress. In other words, they not only have an innate capacity for matching their own kinaesthetically experienced bodily movements with ④ those of others that are visually perceived; they have an innate drive to do so. That is, they seem to have an innate drive to imitate others whom they judge ⑤ to be 'like me'.

* innate: 타고난  ** disposition: 성향  *** kinaesthetically: 운동감각적으로`,
    choices: [
      'seeming to know',
      'which',
      'do succeed',
      'those',
      'to be',
    ],
    answer: 1, // ②
    errorPart: 'which',
    correctedForm: 'with which',
    explanation: `\`have difficulty with X\` 가 본래 형태. 즉 \`They have some difficulty **with** gestures\`. 관계대명사로 묶을 때 전치사 with 가 함께 가야 한다 → **\`with which\`** 또는 \`(which) they have some difficulty with\`.

전치사 with 가 빠진 채 which 만 있으면 \`have\` 의 목적어가 두 개 있는 셈이라 어색. 자동사·구동사가 명사를 수식할 때 전치사 유지 룰의 대표 예.`,
    otherChoicesNote: `① seeming — 분사구문 (= as they seem to know) 정상. ③ do succeed — 동사 강조 (정말 ~하다) 정상. ④ those — \`their bodily movements\` 의 those (= bodily movements of others) 대명사 정상. ⑤ to be — judge + O + to be (5형식 보어) 정상.`,
    relatedSlugs: ['relative-that-which', 'relative-who-whom'],
    hasGrammar: true,
  },
  // ── 2023 ────────────────────────────────────────
  {
    year: 2023,
    number: 29,
    passage: `Trends constantly suggest new opportunities for individuals to restage themselves, representing occasions for change. To understand how trends can ultimately give individuals power and freedom, one must first discuss fashion's importance as a basis for change. The most common explanation offered by my informants as to why fashion is so appealing is ① that it constitutes a kind of theatrical costumery. Clothes are part of how people present ② them to the world, and fashion locates them in the present, relative to what is happening in society and to fashion's own history. As a form of expression, fashion contains a host of ambiguities, enabling individuals to recreate the meanings ③ associated with specific pieces of clothing. Fashion is among the simplest and cheapest methods of self-expression: clothes can be ④ inexpensively purchased while making it easy to convey notions of wealth, intellectual stature, relaxation or environmental consciousness, even if none of these is true. Fashion can also strengthen agency in various ways, ⑤ opening up space for action.

* stature: 능력`,
    choices: [
      'that',
      'them',
      'associated',
      'inexpensively',
      'opening up',
    ],
    answer: 1, // ②
    errorPart: 'them',
    correctedForm: 'themselves',
    explanation: `\`how people present **them** to the world\` 의 \`them\` 은 주어 \`people\` 자기 자신을 가리킨다. 주어와 같은 대상을 가리킬 때는 **재귀대명사 \`themselves\`** 를 쓴다.

목적어가 주어와 다른 사람일 때만 \`them\`. 본 문장은 "사람들이 자기 자신을 세상에 보여준다" 의미라 \`themselves\`.`,
    otherChoicesNote: `① that — 명사절 보어 (the explanation is that ~) 정상. ③ associated — 과거분사 명사 수식 (= which are associated) 정상. ④ inexpensively — be purchased 동사 수식 부사 정상. ⑤ opening up — 분사구문 (~하면서) 정상.`,
    relatedSlugs: ['parts-pronoun'],
    hasGrammar: true,
  },
  // ── 2022 ────────────────────────────────────────
  {
    year: 2022,
    number: 29,
    passage: `Like whole individuals, cells have a life span. During their life cycle (cell cycle), cell size, shape, and metabolic activities can change dramatically. A cell is "born" as a twin when its mother cell divides, ① producing two daughter cells. Each daughter cell is smaller than the mother cell, and except for unusual cases, each grows until it becomes as large as the mother cell ② was. During this time, the cell absorbs water, sugars, amino acids, and other nutrients and assembles them into new, living protoplasm. After the cell has grown to the proper size, its metabolism shifts as it either prepares to divide or matures and ③ differentiates into a specialized cell. Both growth and development require a complex and dynamic set of interactions involving all cell parts. ④ What cell metabolism and structure should be complex would not be surprising, but actually, they are rather simple and logical. Even the most complex cell has only a small number of parts, each ⑤ responsible for a distinct, well-defined aspect of cell life.

* metabolic: 물질대사의  ** protoplasm: 원형질`,
    choices: [
      'producing',
      'was',
      'differentiates',
      'What',
      'responsible',
    ],
    answer: 3, // ④
    errorPart: 'What',
    correctedForm: 'That',
    explanation: `\`____ cell metabolism and structure should be complex would not be surprising\` 의 빈칸은 **명사절을 이끄는 접속사**. "세포 대사와 구조가 복잡하다는 사실은 놀랍지 않다" 의미라 **동격·명사절의 \`That\`** 이 와야 한다.

\`What\` 은 선행사를 자체 포함한 관계대명사 = "~한 것". 본 문장은 "~한 것" 이 아니라 "~라는 사실" 을 표현하므로 \`That\` 이 정답. \`What\` 다음에 완전한 절이 와도 의미상 어색하다 (보어 자리에 형용사 complex 인 점이 단서 — 이미 절이 완전하므로 what 의 빈자리 X).`,
    otherChoicesNote: `① producing — 분사구문 (= and produces) 정상. ② was — as large as + 주절 시제 (현재) 와의 비교에서 mother cell 의 과거 크기 의미. 사실 시제가 이상해 보이지만 KICE 정답은 ④. ③ differentiates — 주어 it (cell) 단수 + 현재시제 정상. ⑤ responsible — each + 분사·형용사 (= each is responsible) 정상.`,
    relatedSlugs: ['relative-what-compound', 'ellipsis-apposition'],
    hasGrammar: true,
  },
  // ── 2021 ────────────────────────────────────────
  {
    year: 2021,
    number: 29,
    passage: `Regulations covering scientific experiments on human subjects are strict. Subjects must give their informed, written consent, and experimenters must submit their proposed experiments to thorough examination by overseeing bodies. Scientists who experiment on themselves can, functionally if not legally, avoid the restrictions ① associated with experimenting on other people. They can also sidestep most of the ethical issues involved: nobody, presumably, is more aware of an experiment's potential hazards than the scientist who devised ② it. Nonetheless, experimenting on oneself remains ③ deeply problematic. One obvious drawback is the danger involved; knowing that it exists ④ does nothing to reduce it. A less obvious drawback is the limited range of data that the experiment can generate. Human anatomy and physiology vary, in small but significant ways, according to gender, age, lifestyle, and other factors. Experimental results derived from a single subject are, therefore, of limited value; there is no way to know ⑤ what the subject's responses are typical or atypical of the response of humans as a group.

* consent: 동의  ** anatomy: (해부학적) 구조  *** physiology: 생리적 현상`,
    choices: [
      'associated',
      'it',
      'deeply',
      'does',
      'what',
    ],
    answer: 4, // ⑤
    errorPart: 'what',
    correctedForm: 'whether',
    explanation: `\`there is no way to know ____ the subject's responses are typical or atypical\` — "~인지 (아닌지)" 를 묻는 명사절. **\`whether\`** (또는 \`if\`) 가 와야 한다.

\`what\` 은 선행사 포함 관계대명사 = "~한 것". 본 문장은 "어떤 것을 알 수 있나" 가 아니라 "그 반응이 typical 인지 atypical 인지를 알 수 없다" 의미. 또한 \`what\` 다음 절이 완전 (the subject's responses are typical) 한 것도 단서 — what 은 절 안에 빈 자리 (주어/목적어) 가 있어야 한다.`,
    otherChoicesNote: `① associated — 과거분사 명사 수식 (= which are associated) 정상. ② it — an experiment 를 가리키는 대명사 정상. ③ deeply — problematic (형용사) 수식 부사 정상. ④ does — 동명사 주어 \`knowing that it exists\` 단수 → does 정상.`,
    relatedSlugs: ['relative-what-compound'],
    hasGrammar: true,
  },
  // ── 2020 ────────────────────────────────────────
  {
    year: 2020,
    number: 29,
    passage: `Speculations about the meaning and purpose of prehistoric art ① rely heavily on analogies drawn with modern-day hunter-gatherer societies. Such primitive societies, ② as Steven Mithen emphasizes in The Prehistory of the Modern Mind, tend to view man and beast, animal and plant, organic and inorganic spheres, as participants in an integrated, animated totality. The dual expressions of this tendency are anthropomorphism (the practice of regarding animals as humans) and totemism (the practice of regarding humans as animals), both of ③ which spread through the visual art and the mythology of primitive cultures. Thus the natural world is conceptualized in terms of human social relations. When considered in this light, the visual preoccupation of early humans with the nonhuman creatures ④ inhabited their world becomes profoundly meaningful. Among hunter-gatherers, animals are not only good to eat, they are also good to think about, as Claude Lévi-Strauss has observed. In the practice of totemism, he has suggested, an unlettered humanity "broods upon ⑤ itself and its place in nature."

* speculation: 고찰  ** analogy: 유사점  *** brood: 곰곰이 생각하다`,
    choices: [
      'rely',
      'as',
      'which',
      'inhabited',
      'itself',
    ],
    answer: 3, // ④
    errorPart: 'inhabited',
    correctedForm: 'inhabiting',
    explanation: `\`the nonhuman creatures ____ their world\` 에서 creatures 가 their world 에 거주하는 능동의 의미. 명사 (creatures) 를 수식하는 분사인데 능동·진행 의미 → **현재분사 \`inhabiting\`** 이 와야 한다.

\`inhabited\` 는 과거분사 (수동) — "거주된 그들의 세계" 가 되어 의미가 안 통한다. \`inhabit\` 은 타동사라 \`inhabit + their world\` 가 능동.

또는 관계대명사 절로 풀면 \`creatures that inhabit/inhabited their world\` 도 가능.`,
    otherChoicesNote: `① rely — 주어 Speculations (복수) → 단수 -s 없음 정상. ② as — \`as Steven Mithen emphasizes\` (~로) 삽입절 접속사 정상. ③ which — both of which (계속적 용법) 정상. ⑤ itself — 주어 humanity 가 자기 자신을 곰곰이 생각하므로 재귀대명사 정상.`,
    relatedSlugs: ['participle-active-passive'],
    hasGrammar: true,
  },
  // ── 2019 ────────────────────────────────────────
  {
    year: 2019,
    number: 29,
    passage: `"Monumental" is a word that comes very close to ① expressing the basic characteristic of Egyptian art. Never before and never since has the quality of monumentality been achieved as fully as it ② did in Egypt. The reason for this is not the external size and massiveness of their works, although the Egyptians admittedly achieved some amazing things in this respect. Many modern structures exceed ③ those of Egypt in terms of purely physical size. But massiveness has nothing to do with monumentality. An Egyptian sculpture no bigger than a person's hand is more monumental than that gigantic pile of stones ④ that constitutes the war memorial in Leipzig, for instance. Monumentality is not a matter of external weight, but of "inner weight." This inner weight is the quality which Egyptian art possesses to such a degree that everything in it seems to be made of primeval stone, like a mountain range, even if it is only a few inches across or ⑤ carved in wood.

* gigantic: 거대한  ** primeval: 원시 시대의`,
    choices: [
      'expressing',
      'did',
      'those',
      'that',
      'carved',
    ],
    answer: 1, // ②
    errorPart: 'did',
    correctedForm: 'was',
    explanation: `앞 절이 \`the quality of monumentality **has been achieved**\` (현재완료 수동태). 비교절 \`as fully as it ____ in Egypt\` 의 동사는 앞과 같은 형태인 **\`was\`** (또는 \`has been\`) 가 와야 한다.

\`did\` 는 일반동사 do 의 대동사. 본 절의 동사는 수동태 (be + p.p.) 라 do 가 아닌 **be 동사**로 받아야 한다. 수동태를 일반동사 do 로 받는 한국 학생 단골 함정.`,
    otherChoicesNote: `① expressing — \`come close to + V-ing\` (가까이 다가가다 — to 는 전치사) 정상. ③ those — \`structures of Egypt\` 의 those 대명사 정상. ④ that — that gigantic pile of stones 를 수식하는 관계대명사 (선행사 — 한정적, 사물) 정상. ⑤ carved — and 로 앞의 \`a few inches across\` 와 병렬, "조각된" 수동 분사 정상.`,
    relatedSlugs: ['passive-basic', 'agreement-tense'],
    hasGrammar: true,
  },
  // ── 2018 ────────────────────────────────────────
  {
    year: 2018,
    number: 28,
    passage: `Psychologists who study giving behavior ① have noticed that some people give substantial amounts to one or two charities, while others give small amounts to many charities. Those who donate to one or two charities seek evidence about what the charity is doing and ② what it is really having a positive impact. If the evidence indicates that the charity is really helping others, they make a substantial donation. Those who give small amounts to many charities are not so interested in whether what they are ③ doing helps others ─ psychologists call them warm glow givers. Knowing that they are giving makes ④ them feel good, regardless of the impact of their donation. In many cases the donation is so small ─ $10 or less ─ that if they stopped ⑤ to think, they would realize that the cost of processing the donation is likely to exceed any benefit it brings to the charity.`,
    choices: [
      'have noticed',
      'what',
      'doing',
      'them',
      'to think',
    ],
    answer: 1, // ②
    errorPart: 'what',
    correctedForm: 'whether',
    explanation: `\`evidence about what the charity is doing **and ____ it is really having a positive impact**\` — 두 번째 절은 "그것이 정말 긍정적 영향을 미치는지 (아닌지)" 라는 **의문 명사절**이다. 이런 의미일 때 접속사는 \`whether\` (또는 if).

\`what\` 은 선행사를 자체 포함한 관계대명사 = "~한 것". what 다음 절은 빈 자리 (주어 또는 목적어) 가 있어야 한다. 본 절 \`it is really having a positive impact\` 는 it (주어) + is having (동사) + a positive impact (목적어) 로 **이미 완전**. 따라서 what 부적절.

\`whether\` 는 명사절 접속사로 "~인지 아닌지" 를 표현하며 절 안에 빈 자리가 필요 없다. 본 문장에 정확히 맞다.

비교:
- \`what the charity is doing\` (앞 절) — \`is doing\` 의 목적어 자리 빈 → what OK
- \`whether it is really having a positive impact\` (뒷 절) — 절이 완전 → whether 필요`,
    otherChoicesNote: `① have noticed — 주어 Psychologists (복수) + 현재완료 정상. ③ doing — \`what they are doing\` 명사절 (what 의 보어 자리 빈) 정상. ④ them — make + O + 원형 V (5형식 사역, them feel good) 정상. ⑤ to think — stop + to V = "~하기 위해 멈추다" 의 부사적 용법 (목적). 본 문맥에선 "잠시 멈춰서 생각해 본다" 의미라 정상. (\`stop V-ing\` 면 "~하던 것을 멈추다" — 의미 다름)`,
    relatedSlugs: ['relative-what-compound'],
    hasGrammar: true,
  },
  // ── 2016 ────────────────────────────────────────
  {
    year: 2016,
    number: 28,
    passage: `The Greeks' focus on the salient object and its attributes led to ① their failure to understand the fundamental nature of causality. Aristotle explained that a stone falling through the air is due to the stone having the property of "gravity." But of course a piece of wood ② tossed into water floats instead of sinking. This phenomenon Aristotle explained as being due to the wood having the property of "levity"! In both cases the focus is ③ exclusively on the object, with no attention paid to the possibility that some force outside the object might be relevant. But the Chinese saw the world as consisting of continuously interacting substances, so their attempts to understand it ④ causing them to be oriented toward the complexities of the entire "field," that is, the context or environment as a whole. The notion ⑤ that events always occur in a field of forces would have been completely intuitive to the Chinese.

* salient: 현저한, 두드러진  ** levity: 가벼움`,
    choices: ['their', 'tossed', 'exclusively', 'causing', 'that'],
    answer: 3, // ④
    errorPart: 'causing',
    correctedForm: 'caused',
    explanation: `\`their attempts to understand it ____ them to be oriented\` 의 주어는 \`their attempts\` 이고, 그 뒤에 본동사가 와야 한다. \`causing\` 은 분사라 본동사 역할 X.

문맥상 단순과거 → **\`caused\`**. 분사구문이 본동사 자리를 차지하는 한국 학생 단골 함정. \`their attempts ... caused them to be oriented\` (그들의 시도가 그들을 ~로 향하게 했다).`,
    otherChoicesNote: `① their — 소유격 + failure 정상. ② tossed — wood (수동 — 던져진) → 과거분사 정상. ③ exclusively — focus is + 부사 정상. ⑤ that — the notion + that 절 (동격) 정상.`,
    relatedSlugs: ['participle-phrase'],
    hasGrammar: true,
  },
  // ── 2015 ────────────────────────────────────────
  {
    year: 2015,
    number: 28,
    passage: `During the early stages when the aquaculture industry was rapidly expanding, mistakes were made and these were costly both in terms of direct losses and in respect of the industry's image. High-density rearing led to outbreaks of infectious diseases that in some cases ① devastated not just the caged fish, but local wild fish populations too. The negative impact on local wildlife inhabiting areas ② close to the fish farms continues to be an ongoing public relations problem for the industry. Furthermore, a general lack of knowledge and insufficient care being taken when fish pens were initially constructed ③ meaning that pollution from excess feed and fish waste created huge barren underwater deserts. These were costly lessons to learn, but now stricter regulations are in place to ensure that fish pens are placed in sites ④ where there is good water flow to remove fish waste. This, in addition to other methods that decrease the overall amount of uneaten food, ⑤ has helped aquaculture to clean up its act.`,
    choices: ['devastated', 'close', 'meaning', 'where', 'has helped'],
    answer: 2, // ③
    errorPart: 'meaning',
    correctedForm: 'meant',
    explanation: `\`a general lack of knowledge and insufficient care being taken when fish pens were initially constructed ____ that pollution ... created huge barren underwater deserts\`.

긴 주어 \`a general lack of knowledge and insufficient care\` (복수 명사 묶음, 본 절에선 단일 의미로 단수 취급) + 본동사가 와야 한다. \`meaning\` 분사 → **\`meant\`** (단순과거).

긴 수식 (being taken when fish pens were initially constructed) 에 가려 본동사가 와야 할 자리에 분사를 쓴 패턴.`,
    otherChoicesNote: `① devastated — that 관계절의 본동사 (단순과거) 정상. ② close — 형용사 (areas close to ~) 명사 수식 정상. ④ where — 관계부사 (sites + where) 정상. ⑤ has helped — 주어 \`This, in addition to ~\` 단수 → has 정상.`,
    relatedSlugs: ['participle-phrase'],
    hasGrammar: true,
  },
  // ── 2014 A형 ───────────────────────────────────
  {
    year: 2014,
    number: 27,
    passage: `I hope you remember our discussion last Monday about the servicing of the washing machine ① supplied to us three months ago. I regret to say the machine is no longer working. As we agreed during the meeting, please send a service engineer as soon as possible to repair it. The product warranty says ② that you provide spare parts and materials for free, but charge for the engineer's labor. This sounds ③ unfair. I believe the machine's failure is caused by a manufacturing defect. Initially, it made a lot of noise, and later, it stopped ④ to operate entirely. As it is wholly the company's responsibility to correct the defect, I hope you will not make us ⑤ pay for the labor component of its repair.

(2014 A형)`,
    choices: ['supplied', 'that', 'unfair', 'to operate', 'pay'],
    answer: 3, // ④
    errorPart: 'to operate',
    correctedForm: 'operating',
    explanation: `\`it stopped ____ entirely\` — 세탁기가 작동을 **그만뒀다** 의미.

\`stop\` 의 두 패턴이 의미가 다르다:
- **stop + V-ing** = 하던 것을 멈추다 (작동 중단)
- **stop + to V** = 하기 위해 멈추다 (다른 일을 하려고)

본 문맥은 세탁기가 작동을 멈춘 것이므로 → **\`operating\`** (V-ing). \`to operate\` 는 "작동시키기 위해 멈췄다" 가 되어 의미 정반대 (세탁기가 어딘가 가서 작동시키려 멈춘 것?).`,
    otherChoicesNote: `① supplied — washing machine + 과거분사 (수동, 공급된) 정상. ② that — says + 명사절 that 정상. ③ unfair — sounds + 형용사 (감각동사 + 형용사) 정상. ⑤ pay — make + O + 원형 V (사역 5형식) 정상.`,
    relatedSlugs: ['gerund-vs-infinitive'],
    hasGrammar: true,
  },
  // ── 2014 B형 ───────────────────────────────────
  {
    year: 2014,
    number: 27,
    passage: `Oxygen is what it is all about. Ironically, the stuff that gives us life eventually kills it. The ultimate life force lies in tiny cellular factories of energy, called mitochondria, ① that burn nearly all the oxygen we breathe in. But breathing has a price. The combustion of oxygen that keeps us alive and active ② sending out by-products called oxygen free radicals. They have Dr. Jekyll and Mr. Hyde characteristics. On the one hand, they help guarantee our survival. For example, when the body mobilizes ③ to fight off infectious agents, it generates a burst of free radicals to destroy the invaders very efficiently. On the other hand, free radicals move ④ uncontrollably through the body, attacking cells, rusting their proteins, piercing their membranes and corrupting their genetic code until the cells become dysfunctional and sometimes give up and die. These fierce radicals, ⑤ built into life as both protectors and avengers, are potent agents of aging.

(2014 B형) * oxygen free radical: 활성 산소  ** membrane: (해부학) 얇은 막`,
    choices: ['that', 'sending', 'to fight off', 'uncontrollably', 'built'],
    answer: 1, // ②
    errorPart: 'sending',
    correctedForm: 'sends',
    explanation: `\`The combustion of oxygen that keeps us alive and active ____ out by-products\` — 주어는 \`The combustion\` (단수). 관계절 \`that keeps us alive and active\` 가 끼어 있고, 그 다음 본동사가 와야 한다.

\`sending\` 분사 → **\`sends\`** (3단 + s). 긴 관계절에 가려 본동사 자리를 분사로 채운 함정.`,
    otherChoicesNote: `① that — mitochondria 를 수식하는 관계대명사 (계속적, 콤마 다음) 정상. ③ to fight off — 부사적 용법 (목적, ~을 위해) 정상. ④ uncontrollably — move 동사 수식 부사 정상. ⑤ built — These fierce radicals 를 수식하는 과거분사 (수동, 만들어진) 삽입구 정상.`,
    relatedSlugs: ['participle-phrase', 'agreement-subject-verb'],
    hasGrammar: true,
  },
  // ── 2013 ───────────────────────────────────────
  {
    year: 2013,
    number: 21,
    passage: `We take it for granted that film directors are in the game of recycling. Adapting novels ① is one of the most respectable of movie projects, while a book that calls itself the novelization of a film is considered barbarous. Being a hybrid art as well as a late one, film has always been in a dialogue with ② other narrative genres. Movies were first seen as an exceptionally potent kind of illusionist theatre, the rectangle of the screen corresponding to the proscenium of a stage, ③ which appear actors. Starting in the early silent period, plays were regularly "turned into" films. But ④ filming plays did not encourage the evolution of what truly was distinctive about a movie: the intervention of the camera ―its mobility of vision. As a source of plot, character, and dialogue, the novel seemed more ⑤ suitable. Many early successes of cinema were adaptations of popular novels.

* proscenium: 앞 무대`,
    choices: ['is', 'other', 'which', 'filming', 'suitable'],
    answer: 2, // ③
    errorPart: 'which',
    correctedForm: 'where (또는 on which)',
    explanation: `\`the proscenium of a stage, ____ appear actors\` — "그 앞 무대 **위에서** 배우들이 나타난다" 의미. 절 안의 동사 \`appear\` (자동사) 의 주어 actors 는 명확하므로 절 자체는 완전. 따라서 빈자리 필요한 \`which\` (관계대명사) 부적절.

장소를 가리키는 부사 역할 → **\`where\`** (관계부사) 또는 **\`on which\`** (전치사 + 관계대명사) 가 맞다. 둘 다 "그 위에서 배우들이 나타난다" 의미.

\`which\` 단독은 절 안에 빈 자리 (주어/목적어) 가 있어야 한다.`,
    otherChoicesNote: `① is — Adapting novels (동명사 단수 주어) → is 정상. ② other — 다른 + 복수 명사 정상. ④ filming — 동명사 주어 (영화화하는 것) 정상. ⑤ suitable — seemed + 형용사 정상.`,
    relatedSlugs: ['relative-adverb', 'relative-that-which'],
    hasGrammar: true,
  },
  // ── 2012 ───────────────────────────────────────
  {
    year: 2012,
    number: 21,
    passage: `Researchers studied two mobile phone companies trying to solve a technological problem. One company developed what it called a 'technology shelf,' created by a small group of engineers, on which ① was placed possible technical solutions that other teams might use in the future. It also created an open-ended conversation among ② its engineers in which salespeople and designers were often included. The boundaries among business units were deliberately ambiguous because more than technical information was needed ③ to get a feeling for the problem. However, the other company proceeded with more seeming clarity and discipline, ④ dividing the problem into its parts. Different departments protected their territory. Individuals and teams, competing with each other, stopped sharing information. The two companies did eventually ⑤ solve the technological problem, but the latter company had more difficulty than the former.`,
    choices: ['was placed', 'its', 'to get', 'dividing', 'solve'],
    answer: 0, // ①
    errorPart: 'was placed',
    correctedForm: 'were placed',
    explanation: `\`on which ____ possible technical solutions\` — 도치 구문. 진짜 주어는 \`possible technical solutions\` (복수). 도치돼서 동사가 앞으로 왔지만 단복수는 진짜 주어 기준.

복수 주어 → **\`were placed\`**. 도치 시 동사를 앞 명사 (which 또는 단수 명사) 에 일치시키는 함정.

원래 어순으로 풀면: \`possible technical solutions were placed on which\` (그 위에 가능한 기술 해법들이 놓였다).`,
    otherChoicesNote: `② its — 회사를 가리키는 소유격 정상. ③ to get — 부사적 용법 (~을 위해) 정상. ④ dividing — 분사구문 (proceeded ... and divided) 정상. ⑤ solve — did + 원형 (강조의 do) 정상.`,
    relatedSlugs: ['agreement-subject-verb', 'inversion-negative'],
    hasGrammar: true,
  },
  // ── 2011 ───────────────────────────────────────
  {
    year: 2011,
    number: 20,
    passage: `The word 'courage' takes on added meaning if you keep in mind that it is derived from the Latin word 'cor' ① meaning 'heart.' The dictionary defines courage as a 'quality which enables one to pursue a right course of action, through ② which one may provoke disapproval, hostility, or contempt.' Over 300 years ago La Rochefoucauld went a step further when he said: "Perfect courage is to do unwitnessed what we should be capable of doing before all men." It is not easy ③ to show moral courage in the face of either indifference or opposition. But persons who are daring in taking a wholehearted stand for truth often ④ achieving results that surpass their expectations. On the other hand, halfhearted individuals are seldom distinguished for courage even when it involves ⑤ their own welfare. To be courageous under all circumstances requires strong determination.

* provoke: 유발하다`,
    choices: ['meaning', 'which', 'to show', 'achieving', 'their'],
    answer: 3, // ④
    errorPart: 'achieving',
    correctedForm: 'achieve',
    explanation: `\`persons who are daring in taking a wholehearted stand for truth often ____ results\` — 주어 \`persons\` (복수) + 빈도부사 often + 본동사가 와야 한다. 관계절 \`who are daring ... truth\` 가 끼어 있고 그 후 본동사 필요.

\`achieving\` 분사 → **\`achieve\`**. 긴 관계절에 본동사 위치를 놓치는 함정.`,
    otherChoicesNote: `① meaning — 분사구문 (= which means) 정상. ② which — 전치사 + 관계대명사 (through which) 정상. ③ to show — 진주어 to V (가주어 it) 정상. ⑤ their — 소유격 정상.`,
    relatedSlugs: ['participle-phrase', 'agreement-subject-verb'],
    hasGrammar: true,
  },
  // ── 2010 (21번 — 객관식 (A)/(B)/(C) 형식) ──────
  {
    year: 2010,
    number: 21,
    passage: `While awaiting the birth of a new baby, North American parents typically furnish a room as the infant's sleeping quarters. For decades, child-rearing advice from experts has **(A)** [encouraged / been encouraged] the nighttime separation of baby from parent. For example, a study recommends that babies be moved into their own room by three months of age. "By six months a child **(B)** [who / whom] regularly sleeps in her parents' room is likely to become dependent on this arrangement," reports the study. Yet parent-infant 'co-sleeping' is the norm for approximately 90 percent of the world's population. Cultures as **(C)** [diverse / diversely] as the Japanese, the Guatemalan Maya, and the Inuit of Northwestern Canada practice it.

다음 (A), (B), (C) 의 각 네모 안에서 어법에 맞는 표현으로 가장 적절한 것은?`,
    choices: [
      'encouraged … who … diverse',
      'encouraged … whom … diversely',
      'encouraged … who … diversely',
      'been encouraged … who … diverse',
      'been encouraged … whom … diverse',
    ],
    answer: 0, // ①
    errorPart: '(A) been encouraged / (B) whom / (C) diversely 는 모두 오답',
    correctedForm: '(A) encouraged / (B) who / (C) diverse',
    explanation: `**(A) encouraged** — 주어 \`advice\` 가 \`the nighttime separation\` 을 권장하는 **능동** 의미. 따라서 \`has + p.p.\` (현재완료 능동) 의 \`has encouraged\`. \`been encouraged\` 면 수동 (조언이 권장 받음) 이라 어색.

**(B) who** — \`a child ____ regularly sleeps\` — 관계절에서 sleeps 의 **주어** 자리. 주격 → **\`who\`**. \`whom\` 은 목적격 (절 안의 목적어 자리에 빈 자리).

**(C) diverse** — \`Cultures as ____ as the Japanese, the Guatemalan Maya, and the Inuit\` — as ~ as 원급 비교 + 명사 cultures 를 수식 → **형용사 \`diverse\`**. \`diversely\` 부사 X.

세 빈칸 모두 능동/수동·격·품사 차이를 묻는 복합 문제. 각 단원의 핵심 룰이 모두 적용된다.`,
    otherChoicesNote: `이 문제는 (A) (B) (C) 세 영역 동시 점검: \`passive-basic\` (능동 vs 수동), \`relative-who-whom\` (주격 vs 목적격), \`parts-adjective\` (형용사 vs 부사). 한 문제가 세 단원의 핵심 함정을 동시에 다룬다.`,
    relatedSlugs: ['parts-adjective', 'relative-who-whom', 'passive-basic'],
    hasGrammar: true,
  },
  // ── 2010 (22번) ────────────────────────────────
  {
    year: 2010,
    number: 22,
    passage: `While manned space missions are more costly than unmanned ① ones, they are more successful. Robots and astronauts use ② much of the same equipment in space. But a human is much more capable of operating those instruments correctly and ③ to place them in appropriate and useful positions. Rarely ④ is a computer more sensitive and accurate than a human in managing the same geographical or environmental factors. Robots are also not equipped with capabilities like humans to solve problems ⑤ as they arise, and they often collect data that are unhelpful or irrelevant.`,
    choices: ['ones', 'much', 'to place', 'is', 'as'],
    answer: 2, // ③
    errorPart: 'to place',
    correctedForm: 'placing',
    explanation: `\`a human is much more capable of operating those instruments correctly and ____ them in appropriate and useful positions\` — 등위접속사 \`and\` 의 병렬 구조.

앞이 \`operating\` (V-ing — 동명사) 이므로 뒤도 같은 형태가 와야 한다 → **\`placing\`**.

또한 \`be capable of + V-ing\` 는 고정 패턴 (전치사 of 뒤는 동명사). \`be capable of + to V\` 는 X.`,
    otherChoicesNote: `① ones — manned space missions 의 unmanned ones (= unmanned missions) 대명사 정상. ② much — much of the same equipment (불가산 — much) 정상. ④ is — Rarely + 도치 (be 동사 + 주어) 정상. ⑤ as — \`as they arise\` (~할 때) 시간 부사절 정상.`,
    relatedSlugs: ['gerund-idioms'],
    hasGrammar: true,
  },
  // ── 2017 ────────────────────────────────────────
  {
    year: 2017,
    number: 28,
    passage: `When people face real adversity ─ disease, unemployment, or the disabilities of age ─ affection from a pet takes on new meaning. A pet's continuing affection becomes crucially important for ① those enduring hardship because it reassures them that their core essence has not been damaged. Thus pets are important in the treatment of ② depressed or chronically ill patients. In addition, pets are ③ used to great advantage with the institutionalized aged. In such institutions it is difficult for the staff to retain optimism when all the patients are declining in health. Children who visit cannot help but remember ④ what their parents or grandparents once were and be depressed by their incapacities. Animals, however, have no expectations about mental capacity. They do not worship youth. They have no memories about what the aged once ⑤ was and greet them as if they were children. An old man holding a puppy can relive a childhood moment with complete accuracy.`,
    choices: [
      'those',
      'depressed',
      'used',
      'what',
      'was',
    ],
    answer: 4, // ⑤ — 사용자 자료에는 4 (=④) 라 적혀 있으나 일반적으로 ⑤ 가 정답
    errorPart: 'was',
    correctedForm: 'were',
    explanation: `\`the aged\` 는 \`the + 형용사\` 형태로 **복수 (노인들)** 를 가리킨다. 따라서 동사도 복수 \`were\` 가 와야 한다.

\`what the aged once was\` → \`what the aged once **were**\`. 14-3 \`collective-noun\` / 12-1 \`agreement-subject-verb\` 단원의 "the + 형용사 = 복수" 룰.

\`the rich, the poor, the young, the old, the aged\` 모두 복수 취급.`,
    otherChoicesNote: `① those = those (people) enduring hardship 정상. ② depressed — 사람의 감정 (받는) → -ed 정상. ③ used to + 동사원형 (~하곤 했다) 이 아니라 \`be used\` (수동) + to + 명사 (= 이용되어 ~로) 패턴. ④ what — 명사절 (= the way they once were) 자연.`,
    relatedSlugs: ['agreement-subject-verb', 'collective-noun'],
    hasGrammar: true,
    reviewNeeded: '사용자 자료의 정답은 ④ 로 표기됨. 일반적으로 알려진 KICE 정답은 ⑤ (the aged 복수 → was → were). 본 데이터는 정답 ⑤ 기준으로 작성.',
  },
];

/** 슬러그에 매핑된 수능 문제만 필터. */
export function getSuneungBySlug(slug: string): SuneungQuestion[] {
  return SUNEUNG_QUESTIONS.filter((q) => q.hasGrammar && q.relatedSlugs.includes(slug));
}
