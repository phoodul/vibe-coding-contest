/**
 * OpenAI text-embedding-3-small 1536-d 임베딩 유틸.
 * - embedText(text): 단일 텍스트 → number[]
 * - embedBatch(texts): 100개 단위 chunk 호출 → number[][]
 *
 * 비용 ($0.02 / 1M tokens 기준): 1K trigger 텍스트 (~50K tokens) ≈ $0.001
 */

const EMBED_MODEL = "text-embedding-3-small";
const DIM = 1536;
const BATCH_SIZE = 100;

interface OpenAIEmbeddingResponse {
  data: { embedding: number[]; index: number }[];
  model: string;
  usage: { prompt_tokens: number; total_tokens: number };
}

async function callOpenAI(input: string | string[]): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");

  const resp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBED_MODEL, input }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`OpenAI embedding failed: ${resp.status} ${errText.slice(0, 200)}`);
  }

  const data = (await resp.json()) as OpenAIEmbeddingResponse;
  // index 순서 보존
  return data.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

export async function embedText(text: string): Promise<number[]> {
  const cleaned = text.trim();
  if (!cleaned) {
    return new Array<number>(DIM).fill(0);
  }
  const [vec] = await callOpenAI(cleaned);
  return vec;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const chunk = texts.slice(i, i + BATCH_SIZE).map((t) => t.trim() || "(empty)");
    const vecs = await callOpenAI(chunk);
    out.push(...vecs);
  }
  return out;
}

export const EMBEDDING_DIM = DIM;
