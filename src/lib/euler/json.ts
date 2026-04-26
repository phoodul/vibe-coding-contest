/**
 * LLM 응답 파싱 헬퍼.
 *
 * Anthropic / OpenAI 모델은 JSON 모드를 강제해도 종종 ```json ... ``` 펜스나
 * 앞뒤 공백·쓰레기 텍스트를 섞어서 반환한다. 펜스를 벗기고 안전하게 파싱한다.
 *
 * 실패 시 null 반환 — 호출자가 폴백을 결정.
 */
export function tryParseJson<T>(text: string): T | null {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence ? fence[1] : trimmed;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
}
