/**
 * 19차 Phase C-Biology — Biology Maestro 메인 채팅.
 * Legend BetaChat 을 subject="biology" 로 재사용.
 */
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BetaChat } from '@/components/legend/BetaChat';

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

  return <BetaChat user={{ id: user.id, email: user.email ?? null }} subject="biology" />;
}
