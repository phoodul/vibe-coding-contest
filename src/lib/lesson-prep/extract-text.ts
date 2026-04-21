import { parsePdf } from "@/lib/parse-document";

/** 업로드된 파일에서 텍스트 추출 (txt/md/hwp/hwpx/doc/docx/pdf/ppt/pptx) */
export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const ab = await file.arrayBuffer();
  const buffer = Buffer.from(ab);

  if (name.endsWith(".txt") || name.endsWith(".md")) {
    return (await file.text()).slice(0, 30000);
  }

  if (name.endsWith(".hwp") || name.endsWith(".hwpx")) {
    const { parseHwp, parseHwpx } = await import("kordoc");
    const result = name.endsWith(".hwpx")
      ? await parseHwpx(ab as ArrayBuffer)
      : await parseHwp(ab as ArrayBuffer);
    if (!result.success) throw new Error("HWP 파싱 실패");
    return (result.markdown || "").slice(0, 30000);
  }

  if (name.endsWith(".pdf")) {
    const result = await parsePdf(buffer, name);
    return result.text;
  }

  if (/\.(docx?|pptx?)$/.test(name)) {
    const { OfficeParser } = await import("officeparser");
    const ast = await OfficeParser.parseOffice(buffer);
    const text = ast.toText();
    return (text || "").slice(0, 30000);
  }

  throw new Error("지원하지 않는 파일 형식입니다");
}

/** 요청 공통 파싱: multipart(파일)와 JSON 둘 다 지원 */
export async function parseLessonPrepRequest(req: Request): Promise<{
  topic: string;
  grade: string;
  docContent: string;
}> {
  const contentType = req.headers.get("content-type") || "";
  let topic = "";
  let grade = "";
  let docContent = "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    topic = (formData.get("topic") as string) || "";
    grade = (formData.get("grade") as string) || "";
    const file = formData.get("file") as File | null;
    if (file && file.size > 0) {
      docContent = await extractText(file);
    }
  } else {
    const json = await req.json();
    topic = json.topic || "";
    grade = json.grade || "";
    docContent = json.docContent || "";
  }

  return { topic, grade, docContent };
}

/** 학년별 난이도 가이드 (프롬프트에 삽입) */
export function gradeLevelGuide(grade: string): string {
  if (!grade) return "";
  const g = grade.toLowerCase();
  if (/초등.*1|초등.*2|초1|초2/.test(g)) {
    return "대상은 초등 저학년입니다. 한자어·전문용어를 피하고 매우 쉬운 어휘를 쓰세요. 한 문장은 15자 이내로 짧게. 구체적 사례 중심.";
  }
  if (/초등/.test(g)) {
    return "대상은 초등 중·고학년입니다. 어려운 개념은 비유로 설명하세요. 한자어는 괄호로 풀이.";
  }
  if (/중/.test(g)) {
    return "대상은 중학생입니다. 교과 용어는 사용하되 정의를 함께 제시하세요. 추상적 개념은 일상 사례로 연결.";
  }
  if (/고등.*1|고1/.test(g)) {
    return "대상은 고1입니다. 교과 개념어를 사용하되 근거·논리를 중시하세요.";
  }
  if (/고등.*2|고2/.test(g)) {
    return "대상은 고2입니다. 수능·모의고사 수준 어휘를 사용하고, 심화 개념과 비교·대조를 포함하세요.";
  }
  if (/고등.*3|고3/.test(g)) {
    return "대상은 고3입니다. 수능 기출 수준의 어휘·추론을 포함하고, 변별력 있는 심화 질문을 제시하세요.";
  }
  if (/고등/.test(g)) {
    return "대상은 고등학생입니다. 교과 개념어와 논증 구조를 적극 활용하세요.";
  }
  if (/대학/.test(g)) {
    return "대상은 대학생입니다. 학문적 용어와 이론적 틀(패러다임, 학파)을 활용하세요.";
  }
  return `대상 학년은 "${grade}"입니다. 이 수준에 맞춘 어휘·사례를 선택하세요.`;
}

/**
 * 교육과정 성취기준 인식 지시 — 한국 초·중·고 교과인 경우에만 삽입.
 * 저작권상 교과서 원문 직접 참조는 불가하므로,
 * 2022 개정 교육과정의 공개된 성취기준 범위·용어·난이도를 따르도록 유도한다.
 */
function curriculumHint(grade: string, topic: string): string {
  if (!grade && !topic) return "";
  const g = grade.toLowerCase();
  const t = topic.toLowerCase();
  const isKoreanSchool =
    /초등|중학|고등|중1|중2|중3|고1|고2|고3/.test(g) ||
    /화학|물리|생명과학|지구과학|통합과학|통합사회|공통과학|공통수학|공통국어|공통영어|세계사|한국사|사회문화|윤리|경제|정치와법|지리/.test(t) ||
    /화학|물리|생명과학|지구과학|통합과학|통합사회/.test(g);
  if (!isKoreanSchool) return "";

  return `
[교육과정 성취기준 지시]
이 수업은 한국 학교 교육과정을 따릅니다. 반드시 **2022 개정 교육과정**의 해당 학년·과목 성취기준에 부합하도록 작성하세요.
- 단원 범위·용어·난이도를 성취기준에 맞추세요 (출판사별 교과서 차이와 무관하게 호환되도록).
- 성취기준 코드가 명확하다면 표지 슬라이드 하단에 한 줄로 명시하세요.
  예: "관련 성취기준: [12화학01-03] 화학 반응식을 균형 있게 쓰고…"
- 해당 학년의 선수학습 개념을 전제하고, 차기 학년 내용은 선행하지 마세요.
- 교과서 원문을 그대로 인용하지 말고, 성취기준에서 요구하는 개념·탐구 활동 중심으로 재구성하세요.`;
}

export function buildUserContext(topic: string, grade: string, docContent: string): string {
  const guide = gradeLevelGuide(grade);
  const curriculum = curriculumHint(grade, topic);
  return docContent
    ? `수업 주제: ${topic || "(업로드 자료 기반)"}
${grade ? `대상 학년: ${grade}` : ""}
${guide ? `\n[학년 맞춤 가이드]\n${guide}` : ""}
${curriculum}

--- 업로드된 수업 자료 ---
${docContent}`
    : `수업 주제: ${topic}
${grade ? `대상 학년: ${grade}` : ""}
${guide ? `\n[학년 맞춤 가이드]\n${guide}` : ""}
${curriculum}`;
}
