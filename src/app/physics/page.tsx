/**
 * 19차 Phase C-Physics — Physics Maestro 메인 채팅.
 * Legend BetaChat 을 subject="physics" 로 재사용.
 */
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BetaChat } from '@/components/legend/BetaChat';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Physics Maestro — 베게너·갈릴레이·허블·세이건',
  description: '4 거장과 함께 푸는 수능 물리학Ⅰ·Ⅱ',
};

export default async function PhysicsMainPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/physics');

  return <BetaChat user={{ id: user.id, email: user.email ?? null }} subject="physics" />;
}
