'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { StarRating } from '@/components/review/StarRating'
import { SportBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'
import { createClient } from '@/lib/supabase/client'
import type { Sport } from '@/types/database'
import toast from 'react-hot-toast'

interface PendingReview {
  applicationId: string
  matchId: string
  teamName: string
  sport: Sport
  opponentId: string
  opponentNickname: string
}

export default function ReviewPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingReview[]>([])
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)

      // Get accepted applications where user is participant
      const { data: apps } = await supabase
        .from('match_applications')
        .select(`
          id,
          match_id,
          applicant_id,
          match:matches!match_applications_match_id_fkey(id,team_name,sport,author_id,author:profiles!matches_author_id_fkey(id,nickname)),
          applicant:profiles!match_applications_applicant_id_fkey(id,nickname)
        `)
        .eq('status', 'accepted')
        .or(`applicant_id.eq.${user.id},match.author_id.eq.${user.id}`)

      if (!apps) { setLoading(false); return }

      // Check which ones already reviewed
      const { data: myReviews } = await supabase
        .from('reviews')
        .select('match_id')
        .eq('reviewer_id', user.id)

      const reviewedMatchIds = new Set(myReviews?.map((r) => r.match_id) || [])

      const pendingList: PendingReview[] = []
      for (const app of apps) {
        const m = app.match as any
        if (!m) continue
        if (reviewedMatchIds.has(m.id)) continue

        const isApplicant = app.applicant_id === user.id
        const opponentId = isApplicant ? m.author_id : app.applicant_id
        const opponentNickname = isApplicant ? m.author?.nickname : (app.applicant as any)?.nickname

        pendingList.push({
          applicationId: app.id,
          matchId: m.id,
          teamName: m.team_name,
          sport: m.sport,
          opponentId,
          opponentNickname,
        })
      }

      setPending(pendingList)
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (review: PendingReview) => {
    const rating = ratings[review.matchId]
    if (!rating) { toast.error('별점을 선택해주세요.'); return }
    setSubmitting((prev) => ({ ...prev, [review.matchId]: true }))

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId: review.matchId, revieweeId: review.opponentId, rating }),
    })

    if (res.ok) {
      toast.success('평가가 제출되었습니다!')
      setPending((prev) => prev.filter((p) => p.matchId !== review.matchId))
    } else {
      const data = await res.json()
      toast.error(data.error || '평가 제출에 실패했습니다.')
    }
    setSubmitting((prev) => ({ ...prev, [review.matchId]: false }))
  }

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">팀 후기</h1>
        <p className="text-slate-500 text-sm mt-0.5">매치 후 상대팀의 매너를 별점으로 평가하세요</p>
      </div>

      {pending.length === 0 ? (
        <EmptyState
          emoji="⭐"
          title="평가할 매치가 없습니다"
          description="매치가 확정되면 여기서 상대팀을 평가할 수 있어요."
        />
      ) : (
        <div className="space-y-4">
          {pending.map((review) => (
            <div key={review.matchId} className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <SportBadge sport={review.sport} />
                    <span className="font-bold text-slate-800">{review.teamName}</span>
                  </div>
                  <p className="text-sm text-slate-500">
                    상대팀: <span className="font-semibold text-slate-700">{review.opponentNickname}</span>
                  </p>
                </div>
                <Star className="text-yellow-400 fill-yellow-400" size={28} />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">매너 점수</p>
                <StarRating
                  value={ratings[review.matchId] || 0}
                  onChange={(val) => setRatings((prev) => ({ ...prev, [review.matchId]: val }))}
                  size={32}
                />
              </div>

              <button
                onClick={() => handleSubmit(review)}
                disabled={!ratings[review.matchId] || submitting[review.matchId]}
                className="btn-accent w-full py-2.5 flex items-center justify-center gap-2"
              >
                {submitting[review.matchId] ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : '평가 제출하기'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
