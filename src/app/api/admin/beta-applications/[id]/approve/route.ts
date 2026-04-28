/**
 * Phase G-06 G06-27 — POST /api/admin/beta-applications/[id]/approve
 *
 * 관리자 승인/거부. SECURITY DEFINER RPC `review_beta_application` 호출.
 * approve 시 `euler_beta_invites` 자동 발급 (RPC 내부에서 50명 cap 검사 + insert).
 *
 * Body: { action: 'approve' | 'reject', comment?: string }
 * 응답: { id, status, invite_code? }
 */
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const ADMIN_EMAILS = ['phoodul@gmail.com'];

interface ApproveBody {
  action?: 'approve' | 'reject';
  comment?: string;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!ADMIN_EMAILS.includes(user.email ?? '')) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }

  let body: ApproveBody;
  try {
    body = (await req.json()) as ApproveBody;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (body.action !== 'approve' && body.action !== 'reject') {
    return Response.json({ error: 'invalid_action' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('review_beta_application', {
    p_application_id: id,
    p_action: body.action,
    p_comment: body.comment ?? null,
  });

  if (error) {
    const msg = error.message ?? '';
    if (msg.includes('forbidden')) {
      return Response.json({ error: 'forbidden' }, { status: 403 });
    }
    if (msg.includes('not_found')) {
      return Response.json({ error: 'not_found' }, { status: 404 });
    }
    if (msg.includes('beta_full')) {
      return Response.json({ error: 'beta_full', message: '베타 정원(50명) 마감' }, { status: 409 });
    }
    return Response.json({ error: msg }, { status: 500 });
  }

  // RPC returns table → 첫 row 추출
  const row = Array.isArray(data) ? data[0] : data;
  return Response.json({
    id: row?.id ?? id,
    status: row?.status,
    invite_code: row?.invite_code ?? null,
  });
}
