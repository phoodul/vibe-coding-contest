/**
 * Lv3 — Advanced (C1-C2) 100문장
 * 고급 문법: 도치, 가정법, 분사구문, 강조·분열문, 학술적 표현 등
 * 10 카테고리 × 10문장
 */
import type { GrammarSentence } from "./grammar-sentences";

export const GRAMMAR_LV3_CATEGORIES = [
  "Inversion & Fronting",
  "Subjunctive Mood",
  "Advanced Passive & Causative",
  "Participle Constructions",
  "Cleft & Pseudo-cleft",
  "Mixed & Advanced Conditionals",
  "Complex Noun Clauses",
  "Advanced Modality",
  "Ellipsis & Substitution",
  "Academic Register",
] as const;

export const GRAMMAR_LV3: GrammarSentence[] = [
  // ── 1. Inversion & Fronting 도치·전치 (1-10) ──
  { id: 1, en: "Not until I read the report did I understand the severity of the issue.", ko: "보고서를 읽고 나서야 문제의 심각성을 이해했다.", category: "Inversion & Fronting", grammar: "Not until 도치" },
  { id: 2, en: "Rarely does one encounter such generosity in everyday life.", ko: "일상에서 그런 관대함을 만나는 일은 드물다.", category: "Inversion & Fronting", grammar: "Rarely 부정부사 도치" },
  { id: 3, en: "Only after considerable debate was the proposal finally approved.", ko: "상당한 토론 끝에야 그 제안이 마침내 승인되었다.", category: "Inversion & Fronting", grammar: "Only after 도치" },
  { id: 4, en: "So intense was the heat that the roads began to crack.", ko: "열기가 너무 강해서 도로가 갈라지기 시작했다.", category: "Inversion & Fronting", grammar: "So + 형용사 도치" },
  { id: 5, en: "Under no circumstances should you reveal this information.", ko: "어떤 상황에서도 이 정보를 공개해서는 안 된다.", category: "Inversion & Fronting", grammar: "Under no circumstances 도치" },
  { id: 6, en: "Had I known about the delay, I would have taken a different flight.", ko: "지연을 알았다면 다른 항공편을 탔을 것이다.", category: "Inversion & Fronting", grammar: "Had + S + p.p. 조건 도치" },
  { id: 7, en: "Little did they realize how much the decision would affect their lives.", ko: "그들은 그 결정이 삶에 얼마나 영향을 미칠지 거의 몰랐다.", category: "Inversion & Fronting", grammar: "Little did 도치" },
  { id: 8, en: "Hardly had the concert begun when the fire alarm went off.", ko: "콘서트가 시작하자마자 화재 경보가 울렸다.", category: "Inversion & Fronting", grammar: "Hardly ... when 도치" },
  { id: 9, en: "No sooner had she sat down than the phone rang.", ko: "그녀가 앉자마자 전화가 울렸다.", category: "Inversion & Fronting", grammar: "No sooner ... than 도치" },
  { id: 10, en: "At no point during the negotiation did they consider giving up.", ko: "협상 중 어느 시점에서도 그들은 포기를 고려하지 않았다.", category: "Inversion & Fronting", grammar: "At no point 도치" },

  // ── 2. Subjunctive Mood 가정법 (11-20) ──
  { id: 11, en: "If I had studied harder, I would have gotten into a better university.", ko: "더 열심히 공부했더라면 더 좋은 대학에 갔을 것이다.", category: "Subjunctive Mood", grammar: "3rd conditional" },
  { id: 12, en: "I wish I had taken that opportunity when it was available.", ko: "기회가 있을 때 잡았더라면 좋았을 텐데.", category: "Subjunctive Mood", grammar: "wish + 과거완료" },
  { id: 13, en: "If only she had listened to her parents' advice.", ko: "그녀가 부모님 조언을 들었더라면.", category: "Subjunctive Mood", grammar: "if only + 과거완료" },
  { id: 14, en: "It is essential that every student submit the assignment on time.", ko: "모든 학생이 과제를 제시간에 제출하는 것이 필수적이다.", category: "Subjunctive Mood", grammar: "가정법 현재 (submit)" },
  { id: 15, en: "The doctor recommended that she take a week off from work.", ko: "의사는 그녀가 일주일 쉬라고 권고했다.", category: "Subjunctive Mood", grammar: "recommend + (should) 원형" },
  { id: 16, en: "Were it not for your help, I could never have finished this project.", ko: "당신의 도움이 없었다면 이 프로젝트를 절대 끝내지 못했을 것이다.", category: "Subjunctive Mood", grammar: "Were it not for 도치" },
  { id: 17, en: "If he had not missed the train, he would be here by now.", ko: "기차를 놓치지 않았다면 지금쯤 여기 있었을 것이다.", category: "Subjunctive Mood", grammar: "혼합 가정법" },
  { id: 18, en: "It is high time we addressed the issue of climate change seriously.", ko: "기후 변화 문제를 진지하게 다뤄야 할 때이다.", category: "Subjunctive Mood", grammar: "It is high time + 과거형" },
  { id: 19, en: "I would rather you didn't mention this to anyone else.", ko: "이것을 다른 사람에게 말하지 않았으면 좋겠다.", category: "Subjunctive Mood", grammar: "would rather + 과거형" },
  { id: 20, en: "Suppose you were given a million dollars, what would you do?", ko: "백만 달러를 받는다고 가정하면 무엇을 하겠는가?", category: "Subjunctive Mood", grammar: "Suppose + 가정법 과거" },

  // ── 3. Advanced Passive & Causative 고급 수동·사역 (21-30) ──
  { id: 21, en: "The suspect is alleged to have fled the country.", ko: "용의자는 나라를 탈출한 것으로 의심된다.", category: "Advanced Passive & Causative", grammar: "be alleged to have p.p." },
  { id: 22, en: "She had her car repaired at the garage yesterday.", ko: "그녀는 어제 정비소에서 차를 수리받았다.", category: "Advanced Passive & Causative", grammar: "have + 목적어 + p.p." },
  { id: 23, en: "He got his wallet stolen while traveling abroad.", ko: "해외 여행 중 지갑을 도둑맞았다.", category: "Advanced Passive & Causative", grammar: "get + 목적어 + p.p." },
  { id: 24, en: "The new regulation is expected to benefit millions of people.", ko: "새 규정은 수백만 명에게 혜택을 줄 것으로 기대된다.", category: "Advanced Passive & Causative", grammar: "be expected to" },
  { id: 25, en: "She made her children clean their rooms before dinner.", ko: "그녀는 아이들에게 저녁 전에 방 청소를 시켰다.", category: "Advanced Passive & Causative", grammar: "make + 목적어 + 원형" },
  { id: 26, en: "The teacher had the students rewrite their essays.", ko: "선생님은 학생들에게 에세이를 다시 쓰게 했다.", category: "Advanced Passive & Causative", grammar: "have + 목적어 + 원형" },
  { id: 27, en: "The building is reported to have been constructed in 1920.", ko: "그 건물은 1920년에 지어진 것으로 보도된다.", category: "Advanced Passive & Causative", grammar: "be reported to have been p.p." },
  { id: 28, en: "She let the children play outside until sunset.", ko: "그녀는 아이들이 해질 때까지 밖에서 놀게 했다.", category: "Advanced Passive & Causative", grammar: "let + 목적어 + 원형" },
  { id: 29, en: "The data cannot be accounted for by the existing theory.", ko: "이 데이터는 기존 이론으로 설명될 수 없다.", category: "Advanced Passive & Causative", grammar: "수동태 + 전치사" },
  { id: 30, en: "The politician was seen to enter the building late at night.", ko: "그 정치인은 늦은 밤 건물에 들어가는 것이 목격되었다.", category: "Advanced Passive & Causative", grammar: "be seen to (수동 지각)" },

  // ── 4. Participle Constructions 분사구문 (31-40) ──
  { id: 31, en: "Having finished the report, she turned off the computer and went home.", ko: "보고서를 끝내고 그녀는 컴퓨터를 끄고 귀가했다.", category: "Participle Constructions", grammar: "완료 분사구문" },
  { id: 32, en: "Surrounded by mountains, the village looked like a painting.", ko: "산으로 둘러싸인 마을은 한 폭의 그림 같았다.", category: "Participle Constructions", grammar: "과거분사 분사구문" },
  { id: 33, en: "Not knowing what to say, he just stood there in silence.", ko: "무슨 말을 해야 할지 몰라 그는 그저 묵묵히 서 있었다.", category: "Participle Constructions", grammar: "부정 분사구문" },
  { id: 34, en: "The weather being fine, we decided to have lunch outdoors.", ko: "날씨가 좋아서 야외에서 점심을 먹기로 했다.", category: "Participle Constructions", grammar: "독립 분사구문" },
  { id: 35, en: "Judging from his accent, he must be from the southern region.", ko: "억양으로 판단하건대 그는 남부 지방 출신일 것이다.", category: "Participle Constructions", grammar: "관용 분사구문" },
  { id: 36, en: "Walking along the beach, I found a beautiful seashell.", ko: "해변을 걸으며 나는 아름다운 조개를 발견했다.", category: "Participle Constructions", grammar: "현재분사 분사구문" },
  { id: 37, en: "All things considered, the plan seems quite reasonable.", ko: "모든 것을 고려하면 그 계획은 꽤 합리적이다.", category: "Participle Constructions", grammar: "독립 분사 관용표현" },
  { id: 38, en: "Written in plain English, the manual was easy to understand.", ko: "쉬운 영어로 쓰여진 그 매뉴얼은 이해하기 쉬웠다.", category: "Participle Constructions", grammar: "과거분사 시작 분사구문" },
  { id: 39, en: "Generally speaking, the economy has improved over the past decade.", ko: "일반적으로 말해서 경제는 지난 10년간 개선되었다.", category: "Participle Constructions", grammar: "관용 분사구문" },
  { id: 40, en: "Having been warned about the danger, they proceeded with caution.", ko: "위험에 대해 경고를 받아 그들은 조심스럽게 진행했다.", category: "Participle Constructions", grammar: "완료 수동 분사구문" },

  // ── 5. Cleft & Pseudo-cleft 분열문·유사분열문 (41-50) ──
  { id: 41, en: "It was the lack of funding that caused the project to fail.", ko: "프로젝트 실패의 원인은 자금 부족이었다.", category: "Cleft & Pseudo-cleft", grammar: "It 분열문 (원인 강조)" },
  { id: 42, en: "What surprised me most was how calm she remained under pressure.", ko: "나를 가장 놀라게 한 것은 그녀가 압박 속에서도 침착했다는 것이다.", category: "Cleft & Pseudo-cleft", grammar: "What 유사분열문" },
  { id: 43, en: "It was not until midnight that he finally came home.", ko: "자정이 되어서야 그는 마침내 집에 왔다.", category: "Cleft & Pseudo-cleft", grammar: "It was not until 강조" },
  { id: 44, en: "What we need now is a clear and realistic action plan.", ko: "지금 우리에게 필요한 것은 명확하고 현실적인 실행 계획이다.", category: "Cleft & Pseudo-cleft", grammar: "What절 주어 강조" },
  { id: 45, en: "It is through failure that we learn the most valuable lessons.", ko: "실패를 통해서 우리는 가장 값진 교훈을 배운다.", category: "Cleft & Pseudo-cleft", grammar: "It is through 강조" },
  { id: 46, en: "The thing that concerns me is the timeline, not the budget.", ko: "내가 걱정하는 것은 예산이 아니라 일정이다.", category: "Cleft & Pseudo-cleft", grammar: "The thing that 유사분열" },
  { id: 47, en: "It was her determination, not her talent, that led to her success.", ko: "그녀의 성공을 이끈 것은 재능이 아닌 결단력이었다.", category: "Cleft & Pseudo-cleft", grammar: "It was A, not B, that" },
  { id: 48, en: "What matters most is not where you start but where you finish.", ko: "가장 중요한 것은 어디서 시작하느냐가 아니라 어디서 끝내느냐이다.", category: "Cleft & Pseudo-cleft", grammar: "What matters 강조" },
  { id: 49, en: "All that remains is to sign the final agreement.", ko: "남은 것은 최종 합의서에 서명하는 것뿐이다.", category: "Cleft & Pseudo-cleft", grammar: "All that 유사분열" },
  { id: 50, en: "It was precisely because of the risk that the reward was so high.", ko: "보상이 높았던 것은 정확히 위험 때문이었다.", category: "Cleft & Pseudo-cleft", grammar: "It was because of 강조" },

  // ── 6. Mixed & Advanced Conditionals 혼합·고급 조건 (51-60) ──
  { id: 51, en: "If she had accepted the offer, she would be living in New York now.", ko: "그녀가 제안을 수락했다면 지금 뉴욕에 살고 있을 것이다.", category: "Mixed & Advanced Conditionals", grammar: "혼합 조건 (과거→현재)" },
  { id: 52, en: "If he were more experienced, he would have handled the crisis better.", ko: "그가 더 경험이 많았다면 위기를 더 잘 처리했을 것이다.", category: "Mixed & Advanced Conditionals", grammar: "혼합 조건 (현재→과거)" },
  { id: 53, en: "But for your timely intervention, the situation would have been disastrous.", ko: "당신의 시의적절한 개입이 아니었다면 상황은 참담했을 것이다.", category: "Mixed & Advanced Conditionals", grammar: "But for + 가정법" },
  { id: 54, en: "Should the need arise, do not hesitate to contact me directly.", ko: "필요가 생기면 주저하지 말고 나에게 직접 연락하세요.", category: "Mixed & Advanced Conditionals", grammar: "Should 도치 조건" },
  { id: 55, en: "Were the government to invest more in education, the economy would benefit.", ko: "정부가 교육에 더 투자한다면 경제가 혜택을 받을 것이다.", category: "Mixed & Advanced Conditionals", grammar: "Were + to부정사 도치" },
  { id: 56, en: "If it were not for the scholarship, I could not afford to study abroad.", ko: "장학금이 아니라면 유학할 여유가 없을 것이다.", category: "Mixed & Advanced Conditionals", grammar: "If it were not for" },
  { id: 57, en: "Assuming the data is accurate, the conclusion is quite alarming.", ko: "데이터가 정확하다고 가정하면 결론은 매우 우려스럽다.", category: "Mixed & Advanced Conditionals", grammar: "Assuming 조건절" },
  { id: 58, en: "Otherwise, we would have missed the deadline completely.", ko: "그렇지 않았다면 마감을 완전히 놓쳤을 것이다.", category: "Mixed & Advanced Conditionals", grammar: "Otherwise 함축 조건" },
  { id: 59, en: "Given more time, I could have written a much better essay.", ko: "시간이 더 있었다면 훨씬 나은 에세이를 쓸 수 있었을 것이다.", category: "Mixed & Advanced Conditionals", grammar: "Given + 함축 조건" },
  { id: 60, en: "If the experiment had been designed differently, the results might have been conclusive.", ko: "실험이 다르게 설계되었다면 결과가 결정적이었을 수도 있다.", category: "Mixed & Advanced Conditionals", grammar: "3rd conditional + might" },

  // ── 7. Complex Noun Clauses 복합 명사절 (61-70) ──
  { id: 61, en: "The fact that he resigned came as a shock to everyone.", ko: "그가 사임했다는 사실은 모든 사람에게 충격이었다.", category: "Complex Noun Clauses", grammar: "동격 that절" },
  { id: 62, en: "Whether or not they will approve the budget remains uncertain.", ko: "그들이 예산을 승인할지는 여전히 불확실하다.", category: "Complex Noun Clauses", grammar: "Whether or not 주어" },
  { id: 63, en: "It is widely acknowledged that education is the key to social mobility.", ko: "교육이 사회 이동성의 열쇠라는 것은 널리 인정된다.", category: "Complex Noun Clauses", grammar: "It is acknowledged that" },
  { id: 64, en: "What is most remarkable is that she achieved this entirely on her own.", ko: "가장 놀라운 점은 그녀가 이것을 완전히 혼자 성취했다는 것이다.", category: "Complex Noun Clauses", grammar: "What절 + that절" },
  { id: 65, en: "The question of how to balance growth and sustainability is critical.", ko: "성장과 지속 가능성의 균형을 어떻게 맞출지의 문제는 중요하다.", category: "Complex Noun Clauses", grammar: "of + 의문사절" },
  { id: 66, en: "There is no guarantee that the situation will improve anytime soon.", ko: "상황이 곧 개선될 것이라는 보장은 없다.", category: "Complex Noun Clauses", grammar: "no guarantee + that절" },
  { id: 67, en: "Whoever is responsible for this error must be held accountable.", ko: "이 오류의 책임자는 반드시 책임을 져야 한다.", category: "Complex Noun Clauses", grammar: "whoever 복합관계대명사" },
  { id: 68, en: "It goes without saying that punctuality is highly valued in this company.", ko: "이 회사에서 시간 엄수가 매우 중시된다는 것은 말할 필요도 없다.", category: "Complex Noun Clauses", grammar: "It goes without saying that" },
  { id: 69, en: "The likelihood that the policy will be reversed is extremely low.", ko: "정책이 뒤집어질 가능성은 극히 낮다.", category: "Complex Noun Clauses", grammar: "동격 that절 (likelihood)" },
  { id: 70, en: "However much you try to persuade him, he will not change his mind.", ko: "아무리 그를 설득하려 해도 그는 마음을 바꾸지 않을 것이다.", category: "Complex Noun Clauses", grammar: "however + 양보절" },

  // ── 8. Advanced Modality 고급 양태 (71-80) ──
  { id: 71, en: "She must have been exhausted after working a double shift.", ko: "이중 근무 후 그녀는 극도로 피곤했음에 틀림없다.", category: "Advanced Modality", grammar: "must have p.p. (확신 추측)" },
  { id: 72, en: "He could not have known about the change in plans.", ko: "그가 계획 변경을 알았을 리 없다.", category: "Advanced Modality", grammar: "could not have p.p." },
  { id: 73, en: "You might want to reconsider your approach to this problem.", ko: "이 문제에 대한 접근법을 재고해 보는 것이 좋을 것이다.", category: "Advanced Modality", grammar: "might want to (공손한 제안)" },
  { id: 74, en: "The accident need not have happened if proper safety measures had been in place.", ko: "적절한 안전 조치가 있었다면 사고는 일어나지 않아도 됐다.", category: "Advanced Modality", grammar: "need not have p.p." },
  { id: 75, en: "She should have been promoted years ago.", ko: "그녀는 수년 전에 승진했어야 했다.", category: "Advanced Modality", grammar: "should have p.p. (유감)" },
  { id: 76, en: "He may well be the most qualified candidate for the position.", ko: "그는 그 직위에 가장 적합한 후보일 가능성이 높다.", category: "Advanced Modality", grammar: "may well (가능성 높음)" },
  { id: 77, en: "They would have us believe that the problem has been resolved.", ko: "그들은 문제가 해결되었다고 우리에게 믿게 하려 한다.", category: "Advanced Modality", grammar: "would have + 목적어 + 원형" },
  { id: 78, en: "You needn't worry about the paperwork; I will handle it.", ko: "서류 작업은 걱정하지 않아도 됩니다. 제가 처리하겠습니다.", category: "Advanced Modality", grammar: "needn't (불필요)" },
  { id: 79, en: "He can't have left already; his coat is still here.", ko: "그가 벌써 갔을 리 없다. 코트가 아직 여기 있다.", category: "Advanced Modality", grammar: "can't have p.p. (불가능 추측)" },
  { id: 80, en: "We ought to have consulted with the legal team before signing.", ko: "서명하기 전에 법률팀과 상의했어야 했다.", category: "Advanced Modality", grammar: "ought to have p.p." },

  // ── 9. Ellipsis & Substitution 생략·대용 (81-90) ──
  { id: 81, en: "She can speak French, and so can her brother.", ko: "그녀는 프랑스어를 할 수 있고, 그녀의 남동생도 할 수 있다.", category: "Ellipsis & Substitution", grammar: "so + 조동사 + 주어" },
  { id: 82, en: "I don't think he will come, but he might.", ko: "그가 올 것 같지는 않지만 올 수도 있다.", category: "Ellipsis & Substitution", grammar: "조동사 대용" },
  { id: 83, en: "He said he would help, and he did.", ko: "그는 도와주겠다고 했고, 실제로 그렇게 했다.", category: "Ellipsis & Substitution", grammar: "did 대용" },
  { id: 84, en: "If necessary, I will revise the entire document.", ko: "필요하다면 전체 문서를 수정하겠습니다.", category: "Ellipsis & Substitution", grammar: "If necessary 생략절" },
  { id: 85, en: "She speaks not only English but also German and Italian.", ko: "그녀는 영어뿐만 아니라 독일어와 이탈리아어도 한다.", category: "Ellipsis & Substitution", grammar: "not only A but also B" },
  { id: 86, en: "Neither the manager nor the employees were aware of the policy change.", ko: "매니저도 직원들도 정책 변경을 알지 못했다.", category: "Ellipsis & Substitution", grammar: "neither A nor B" },
  { id: 87, en: "The results were not as promising as we had hoped them to be.", ko: "결과는 우리가 바랐던 것만큼 유망하지 않았다.", category: "Ellipsis & Substitution", grammar: "as ... as 대용구문" },
  { id: 88, en: "When asked about the incident, she refused to comment.", ko: "사건에 대해 질문을 받았을 때 그녀는 논평을 거부했다.", category: "Ellipsis & Substitution", grammar: "When asked 분사 생략" },
  { id: 89, en: "Though difficult at first, the process becomes easier with practice.", ko: "처음에는 어렵지만 연습하면 과정이 쉬워진다.", category: "Ellipsis & Substitution", grammar: "Though + 형용사 생략절" },
  { id: 90, en: "A: 'Will the project be completed on time?' B: 'I believe so.'", ko: "A: '프로젝트가 제때 완료될까요?' B: '그렇게 믿습니다.'", category: "Ellipsis & Substitution", grammar: "so 대용 (believe so)" },

  // ── 10. Academic Register 학술·격식 표현 (91-100) ──
  { id: 91, en: "The findings suggest that further research is warranted.", ko: "연구 결과는 추가 연구가 필요함을 시사한다.", category: "Academic Register", grammar: "학술적 제안 표현" },
  { id: 92, en: "It can be argued that technology has both advantages and disadvantages.", ko: "기술에는 장점과 단점이 모두 있다고 주장할 수 있다.", category: "Academic Register", grammar: "It can be argued that" },
  { id: 93, en: "The data lend support to the hypothesis that sleep affects memory.", ko: "데이터는 수면이 기억에 영향을 미친다는 가설을 뒷받침한다.", category: "Academic Register", grammar: "lend support to" },
  { id: 94, en: "This phenomenon can be attributed to a combination of social and economic factors.", ko: "이 현상은 사회적·경제적 요인의 복합으로 귀인될 수 있다.", category: "Academic Register", grammar: "be attributed to" },
  { id: 95, en: "Notwithstanding the limitations, the study provides valuable insights.", ko: "한계에도 불구하고 이 연구는 가치 있는 통찰을 제공한다.", category: "Academic Register", grammar: "notwithstanding" },
  { id: 96, en: "The extent to which this approach is effective remains to be seen.", ko: "이 접근법이 얼마나 효과적인지는 아직 지켜봐야 한다.", category: "Academic Register", grammar: "the extent to which" },
  { id: 97, en: "In light of recent developments, we must revise our initial estimates.", ko: "최근 상황을 고려하면 초기 추정치를 수정해야 한다.", category: "Academic Register", grammar: "in light of" },
  { id: 98, en: "The results are consistent with those reported in previous studies.", ko: "결과는 이전 연구에서 보고된 것과 일치한다.", category: "Academic Register", grammar: "be consistent with" },
  { id: 99, en: "It is worth noting that correlation does not imply causation.", ko: "상관관계가 인과관계를 의미하지는 않는다는 점에 주목할 가치가 있다.", category: "Academic Register", grammar: "It is worth noting that" },
  { id: 100, en: "To what extent these findings are generalizable is a matter of debate.", ko: "이 발견들이 일반화될 수 있는 정도는 논쟁의 여지가 있다.", category: "Academic Register", grammar: "to what extent" },
];
