/**
 * 22차 (2026-05-09) — Chemistry Maestro 메인 채팅.
 * MaestroChat (Maestro/Legend 분리 1단계 wrapper).
 */
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MaestroChat } from '@/components/maestro/MaestroChat';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Chemistry Maestro — 마리 퀴리·라부아지에·폴링·멘델레예프',
  description: '4 거장과 함께 푸는 수능 화학Ⅰ·Ⅱ',
};

export default async function ChemistryMainPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/chemistry');

  return <MaestroChat user={{ id: user.id, email: user.email ?? null }} subject="chemistry" />;
}
