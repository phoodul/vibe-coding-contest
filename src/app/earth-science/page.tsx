/**
 * 19차 (2026-05-06) — Earth Science Maestro 메인 채팅.
 * Legend BetaChat 을 subject="earth-science" 로 재사용. 후기 link / 베타 만료 표시는
 * BetaChat 내부에서 자동 분기 (math 만 노출).
 */
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BetaChat } from '@/components/legend/BetaChat';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Earth Science Maestro — 베게너·갈릴레이·허블·세이건',
  description: '4 거장과 함께 푸는 수능 지구과학Ⅰ·Ⅱ',
};

export default async function EarthScienceMainPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/earth-science');

  return <BetaChat user={{ id: user.id, email: user.email ?? null }} subject="earth-science" />;
}
