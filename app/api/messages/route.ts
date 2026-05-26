import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const { data, error } = await supabase
    .from('message_rooms')
    .select(`
      id, created_at, participant_1, participant_2,
      participant_1_profile:profiles!message_rooms_participant_1_fkey(id,nickname),
      participant_2_profile:profiles!message_rooms_participant_2_fkey(id,nickname),
      match_application:match_applications!message_rooms_application_id_fkey(
        match:matches!match_applications_match_id_fkey(id,team_name,sport)
      )
    `)
    .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
