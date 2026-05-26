'use client'

import { useRouter } from 'next/navigation'
import { Check, CheckCheck, Bell } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import type { Notification } from '@/types/database'

interface Props {
  notifications: Notification[]
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onAccept?: (notif: Notification) => void
  onReject?: (notif: Notification) => void
  onClose: () => void
}

export function NotificationDropdown({ notifications, onMarkRead, onMarkAllRead, onAccept, onReject, onClose }: Props) {
  const router = useRouter()

  const handleClick = (notif: Notification) => {
    onMarkRead(notif.id)
    if (notif.type === 'new_message' && notif.related_id) {
      router.push(`/messages/${notif.related_id}`)
      onClose()
    } else if ((notif.type === 'match_accept') && notif.related_id) {
      router.push(`/messages`)
      onClose()
    }
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-primary" />
          <span className="font-semibold text-slate-800 text-sm">알림</span>
        </div>
        <button
          onClick={onMarkAllRead}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary transition-colors"
        >
          <CheckCheck size={14} />
          전체 읽음
        </button>
      </div>

      {/* Notifications */}
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
        {notifications.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">알림이 없습니다</div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${!notif.is_read ? 'bg-primary/5' : ''}`}
              onClick={() => handleClick(notif)}
            >
              <div className="flex items-start gap-2">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notif.is_read ? 'bg-accent' : 'bg-transparent'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 leading-snug">{notif.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatDateTime(notif.created_at)}</p>

                  {/* Action buttons for match_apply notification */}
                  {notif.type === 'match_apply' && notif.related_id && (
                    <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => { onAccept?.(notif); onMarkRead(notif.id) }}
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg font-medium hover:bg-green-600 transition-colors"
                      >
                        매치 수락
                      </button>
                      <button
                        onClick={() => { onReject?.(notif); onMarkRead(notif.id) }}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg font-medium hover:bg-red-600 transition-colors"
                      >
                        매치 거절
                      </button>
                    </div>
                  )}

                  {notif.type === 'match_accept' && notif.related_id && (
                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => { router.push('/messages'); onClose() }}
                        className="px-3 py-1 bg-primary text-white text-xs rounded-lg font-medium hover:bg-primary-600 transition-colors"
                      >
                        채팅 시작
                      </button>
                    </div>
                  )}
                </div>
                {!notif.is_read && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onMarkRead(notif.id) }}
                    className="text-slate-300 hover:text-primary flex-shrink-0"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
