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

export function buildUserContext(topic: string, grade: string, docContent: string): string {
  const guide = gradeLevelGuide(grade);
  return docContent
    ? `수업 주제: ${topic || "(업로드 자료 기반)"}
${grade ? `대상 학년: ${grade}` : ""}
${guide ? `\n[학년 맞춤 가이드]\n${guide}` : ""}

--- 업로드된 수업 자료 ---
${docContent}`
    : `수업 주제: ${topic}
${grade ? `대상 학년: ${grade}` : ""}
${guide ? `\n[학년 맞춤 가이드]\n${guide}` : ""}`;
}
