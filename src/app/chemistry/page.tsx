/**
 * 19차 Phase C-Chemistry — Chemistry Maestro 메인 채팅.
 * Legend BetaChat 을 subject="chemistry" 로 재사용.
 */
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BetaChat } from '@/components/legend/BetaChat';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Chemistry Maestro — 베게너·갈릴레이·허블·세이건',
  description: '4 거장과 함께 푸는 수능 화학Ⅰ·Ⅱ',
};

export default async function ChemistryMainPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/chemistry');

  return <BetaChat user={{ id: user.id, email: user.email ?? null }} subject="chemistry" />;
}
