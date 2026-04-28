/**
 * Phase G-06 G06-27 — GET /api/admin/beta-applications
 *
 * 관리자 신청 목록 조회. SECURITY DEFINER RPC `list_beta_applications` 호출.
 * RPC 내부에서 admin email (phoodul@gmail.com) 검증 → 비-admin 시 forbidden 예외.
 *
 * Query: ?status=pending|approved|rejected|all
 * 응답: { applications: [...] }
 */
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const ADMIN_EMAILS = ['phoodul@gmail.com'];

export async function GET(req: Request) {
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

  const url = new URL(req.url);
  const statusParam = url.searchParams.get('status');
  const status = statusParam && statusParam !== 'all' ? statusParam : null;

  const { data, error } = await supabase.rpc('list_beta_applications', {
    p_status: status,
    p_limit: 200,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ applications: data ?? [] });
}
