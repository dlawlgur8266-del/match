import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/ui/EmptyState'
import { SPORT_META } from '@/types/database'
import { formatDateTime } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rooms } = await supabase
    .from('message_rooms')
    .select(`
      id,
      participant_1,
      participant_2,
      created_at,
      participant_1_profile:profiles!message_rooms_participant_1_fkey(id,nickname),
      participant_2_profile:profiles!message_rooms_participant_2_fkey(id,nickname),
      match_application:match_applications!message_rooms_application_id_fkey(
        id,
        match:matches!match_applications_match_id_fkey(id,team_name,sport)
      )
    `)
    .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">매치 메시지</h1>
        <p className="text-slate-500 text-sm mt-0.5">매치 확정 후 상대팀과 대화하세요</p>
      </div>

      {!rooms || rooms.length === 0 ? (
        <EmptyState
          emoji="💬"
          title="아직 매치 메시지가 없어요"
          description="매치가 수락되면 상대팀과 채팅할 수 있습니다."
        />
      ) : (
        <div className="space-y-2">
          {rooms.map((room: any) => {
            const isP1 = room.participant_1 === user.id
            const opponent = isP1 ? room.participant_2_profile : room.participant_1_profile
            const match = room.match_application?.match
            const sport = match?.sport
            const meta = sport ? SPORT_META[sport as keyof typeof SPORT_META] : null

            return (
              <Link
                key={room.id}
                href={`/messages/${room.id}`}
                className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: meta?.bgColor || '#F1F5F9' }}>
                  {meta?.emoji || '💬'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{opponent?.nickname || '상대방'}</span>
                    <span className="text-xs text-slate-400">{formatDateTime(room.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-500 truncate mt-0.5">
                    {match ? `${match.team_name} 매치` : '매치 채팅'}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
