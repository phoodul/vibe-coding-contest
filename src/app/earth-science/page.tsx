/**
 * 22차 (2026-05-09) — Earth Science Maestro 메인 채팅.
 * MaestroChat (Maestro/Legend 분리 1단계 wrapper). 다음 cleanup 시 wrapper 안만
 * 변경되어 본 페이지 영향 0.
 */
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MaestroChat } from '@/components/maestro/MaestroChat';

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

  return <MaestroChat user={{ id: user.id, email: user.email ?? null }} subject="earth-science" />;
}
