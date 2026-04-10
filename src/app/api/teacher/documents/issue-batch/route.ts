import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { batchId } = await req.json();
  if (!batchId) {
    return NextResponse.json({ error: "batchId required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 배치에 속한 승인된 문서 조회
  const { data: docs } = await supabase
    .from("documents")
    .select("id, content_hash")
    .eq("batch_id", batchId)
    .eq("status", "approved");

  if (!docs || docs.length === 0) {
    return NextResponse.json(
      { error: "No approved documents in batch" },
      { status: 400 }
    );
  }

  const issued: { id: string; doc_number: string }[] = [];

  // 순차적으로 번호 발급 (atomic)
  for (const doc of docs) {
    const { data: docNumber } = await supabase.rpc("generate_doc_number", {
      p_org_prefix: "EasyEdu",
    });

    await supabase
      .from("documents")
      .update({ status: "issued", doc_number: docNumber })
      .eq("id", doc.id);

    await supabase.from("document_versions").insert({
      document_id: doc.id,
      version_number: 1,
      content_hash: doc.content_hash,
      action: "issue",
      actor_id: user.id,
      notes: `일괄발급: ${docNumber}`,
    });

    issued.push({ id: doc.id, doc_number: docNumber });
  }

  // 배치 상태 업데이트
  await supabase
    .from("document_batches")
    .update({ status: "issued", issued_count: issued.length })
    .eq("id", batchId);

  return NextResponse.json({ issued, count: issued.length });
}
