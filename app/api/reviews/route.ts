import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const { data, error } = await supabase
    .from('reviews')
    .select('*, match:matches(team_name,sport), reviewer:profiles!reviews_reviewer_id_fkey(nickname)')
    .eq('reviewee_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const { matchId, revieweeId, rating } = await req.json()

  if (!matchId || !revieweeId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: '유효하지 않은 요청입니다.' }, { status: 400 })
  }

  // Check if already reviewed
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('match_id', matchId)
    .eq('reviewer_id', user.id)
    .maybeSingle()

  if (existing) return NextResponse.json({ error: '이미 평가한 매치입니다.' }, { status: 409 })

  // Check match participation
  const { data: match } = await supabase
    .from('matches')
    .select('id,author_id')
    .eq('id', matchId)
    .single()

  const { data: app } = await supabase
    .from('match_applications')
    .select('id,applicant_id')
    .eq('match_id', matchId)
    .eq('status', 'accepted')
    .maybeSingle()

  const isParticipant =
    match?.author_id === user.id || app?.applicant_id === user.id
  if (!isParticipant) return NextResponse.json({ error: '매치 참여자만 평가할 수 있습니다.' }, { status: 403 })

  const { error } = await supabaseAdmin.from('reviews').insert({
    match_id: matchId,
    reviewer_id: user.id,
    reviewee_id: revieweeId,
    rating,
  })

  if (error) {
    if (error.message.includes('unique')) return NextResponse.json({ error: '이미 평가했습니다.' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
