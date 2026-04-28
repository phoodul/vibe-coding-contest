/**
 * G-05c: Gemini 응답 진단 — finishReason / safetyRatings / promptFeedback 직접 확인
 */
async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");
  const userMsg = `### 원문제 (변하지 않는 컨텍스트)
2022 수능 기하 29번. 평행사변형 OACB 에서 OA=√2, OB=2√2, cos(∠AOB)=1/4. 점 P 에 대해 OP·OB + BP·BC = 2 일 때 OP = sOA + tOB.

### 풀이 절차
5단계로 나눠 풀이합니다.

### Step 1: 문제 구조화 + 첫 추론 1걸음
구해야 할 것 / 조건 / 제약 분리.`;

  const body = {
    systemInstruction: { parts: [{ text: "당신은 수학 전문 시니어 강사입니다." }] },
    contents: [{ role: "user", parts: [{ text: userMsg }] }],
    generationConfig: { maxOutputTokens: 3000, temperature: 0.2 },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  };

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${apiKey}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
  );
  const data = (await resp.json()) as {
    promptFeedback?: unknown;
    candidates?: { finishReason?: string; safetyRatings?: unknown; content?: { parts?: { text?: string }[] } }[];
  };
  console.log("Status:", resp.status);
  console.log("promptFeedback:", JSON.stringify(data.promptFeedback));
  console.log("candidates count:", (data.candidates || []).length);
  if (data.candidates && data.candidates[0]) {
    const c = data.candidates[0];
    console.log("finishReason:", c.finishReason);
    console.log("safetyRatings:", JSON.stringify(c.safetyRatings));
    console.log("parts count:", (c.content?.parts || []).length);
    console.log("text first 300:", ((c.content?.parts || []).map((p) => p.text || "").join("")).slice(0, 300));
  }
  console.log("\nFULL response (first 3000):", JSON.stringify(data).slice(0, 3000));
}
main().catch((e) => { console.error(e); process.exit(1); });
