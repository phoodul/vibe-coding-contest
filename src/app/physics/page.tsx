/**
 * 22차 (2026-05-09) — Physics Maestro 메인 채팅.
 * MaestroChat (Maestro/Legend 분리 1단계 wrapper).
 */
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MaestroChat } from '@/components/maestro/MaestroChat';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Physics Maestro — 페르미·아인슈타인·파인만·뉴턴',
  description: '4 거장과 함께 푸는 수능 물리학Ⅰ·Ⅱ',
};

export default async function PhysicsMainPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/physics');

  return <MaestroChat user={{ id: user.id, email: user.email ?? null }} subject="physics" />;
}
