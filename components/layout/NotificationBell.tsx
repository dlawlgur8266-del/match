'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationDropdown } from './NotificationDropdown'
import toast from 'react-hot-toast'

interface Props {
  userId: string
}

export function NotificationBell({ userId }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleAccept = async (notif: { related_id: string | null }) => {
    if (!notif.related_id) return
    const res = await fetch(`/api/applications/${notif.related_id}/accept`, { method: 'PATCH' })
    const data = await res.json()
    if (res.ok) {
      toast.success('매치를 수락했습니다!')
    } else {
      toast.error(data.error || '처리에 실패했습니다.')
    }
  }

  const handleReject = async (notif: { related_id: string | null }) => {
    if (!notif.related_id) return
    const res = await fetch(`/api/applications/${notif.related_id}/reject`, { method: 'PATCH' })
    const data = await res.json()
    if (res.ok) {
      toast.success('매치를 거절했습니다.')
    } else {
      toast.error(data.error || '처리에 실패했습니다.')
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-xl transition-colors"
        aria-label="알림"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown
          notifications={notifications}
          onMarkRead={markAsRead}
          onMarkAllRead={markAllAsRead}
          onAccept={handleAccept}
          onReject={handleReject}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}
