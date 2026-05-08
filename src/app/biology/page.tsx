/**
 * 22차 (2026-05-09) — Biology Maestro 메인 채팅.
 * MaestroChat (Maestro/Legend 분리 1단계 wrapper).
 */
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MaestroChat } from '@/components/maestro/MaestroChat';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Biology Maestro — 파스퇴르·멘델·왓슨·다윈',
  description: '4 거장과 함께 푸는 수능 생명과학Ⅰ·Ⅱ',
};

export default async function BiologyMainPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/biology');

  return <MaestroChat user={{ id: user.id, email: user.email ?? null }} subject="biology" />;
}
