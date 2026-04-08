export const maxDuration = 30;

export async function POST(req: Request) {
  const { text, voice, instructions } = await req.json();

  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-tts",
      input: text,
      voice: voice || "nova",
      instructions: instructions || "Speak in a friendly tone.",
      response_format: "mp3",
    }),
  });

  if (!res.ok) {
    return new Response("TTS generation failed", { status: 500 });
  }

  const arrayBuffer = await res.arrayBuffer();

  return new Response(arrayBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-cache",
    },
  });
}
