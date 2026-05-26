import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: matchId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  // Get match + applicant profile
  const [{ data: match }, { data: applicantProfile }] = await Promise.all([
    supabase.from('matches').select('id,author_id,status,team_name,sport').eq('id', matchId).single(),
    supabase.from('profiles').select('nickname,skill_level').eq('id', user.id).single(),
  ])

  if (!match) return NextResponse.json({ error: '매치를 찾을 수 없습니다.' }, { status: 404 })
  if (match.author_id === user.id) return NextResponse.json({ error: '본인 게시글에는 신청할 수 없습니다.' }, { status: 400 })
  if (match.status === '매치확정') return NextResponse.json({ error: '이미 확정된 매치입니다.' }, { status: 400 })

  // Check duplicate application
  const { data: existing } = await supabase
    .from('match_applications')
    .select('id')
    .eq('match_id', matchId)
    .eq('applicant_id', user.id)
    .maybeSingle()

  if (existing) return NextResponse.json({ error: '이미 신청한 매치입니다.' }, { status: 409 })

  // Create application
  const { data: app, error: appError } = await supabaseAdmin
    .from('match_applications')
    .insert({ match_id: matchId, applicant_id: user.id, status: 'pending' })
    .select()
    .single()

  if (appError) return NextResponse.json({ error: appError.message }, { status: 500 })

  // Send notification to match author
  const message = `${applicantProfile?.nickname || '누군가'} 님이 매치를 신청했습니다. [실력: ${applicantProfile?.skill_level || '미설정'}]`
  await supabaseAdmin.from('notifications').insert({
    user_id: match.author_id,
    type: 'match_apply',
    message,
    related_id: app.id,
  })

  return NextResponse.json({ success: true, application: app })
}
