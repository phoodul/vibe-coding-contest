import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    const buffer = await file.arrayBuffer();

    // HWP/HWPX만 서버 파싱 (TXT/DOCX는 클라이언트에서 처리)
    if (!name.endsWith(".hwp") && !name.endsWith(".hwpx")) {
      return NextResponse.json(
        { error: "HWP 또는 HWPX 파일만 지원합니다." },
        { status: 400 }
      );
    }

    const { parseHwp, parseHwpx } = await import("kordoc");
    const result = name.endsWith(".hwpx")
      ? await parseHwpx(buffer)
      : await parseHwp(buffer);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "파일 파싱에 실패했습니다." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      markdown: result.markdown,
      metadata: result.metadata,
    });
  } catch (e) {
    console.error("parse-document error:", e);
    return NextResponse.json(
      { error: "파일 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
