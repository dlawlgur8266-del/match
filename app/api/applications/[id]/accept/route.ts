import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: applicationId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  // Get application with match info
  const { data: app } = await supabase
    .from('match_applications')
    .select('id,match_id,applicant_id,status,match:matches!match_applications_match_id_fkey(id,author_id,team_name,sport)')
    .eq('id', applicationId)
    .single()

  if (!app) return NextResponse.json({ error: '신청을 찾을 수 없습니다.' }, { status: 404 })

  const match = app.match as any
  if (!match) return NextResponse.json({ error: '매치 정보를 찾을 수 없습니다.' }, { status: 404 })
  if (match.author_id !== user.id) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  if (app.status !== 'pending') return NextResponse.json({ error: '이미 처리된 신청입니다.' }, { status: 400 })

  // Update application status
  await supabaseAdmin
    .from('match_applications')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', applicationId)

  // Update match status
  await supabaseAdmin
    .from('matches')
    .update({ status: '매치확정', updated_at: new Date().toISOString() })
    .eq('id', app.match_id)

  // Create message room
  const { data: room, error: roomError } = await supabaseAdmin
    .from('message_rooms')
    .insert({
      application_id: applicationId,
      participant_1: user.id,
      participant_2: app.applicant_id,
    })
    .select()
    .single()

  if (roomError) {
    console.error('Room creation error:', roomError)
  }

  // Notify applicant
  await supabaseAdmin.from('notifications').insert({
    user_id: app.applicant_id,
    type: 'match_accept',
    message: `매치가 수락되었습니다! ${match.team_name}과의 ${match.sport} 매치가 확정됐어요.`,
    related_id: room?.id || null,
  })

  return NextResponse.json({ success: true, roomId: room?.id })
}
