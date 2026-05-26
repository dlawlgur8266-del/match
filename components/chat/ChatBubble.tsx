import { formatDateTime } from '@/lib/utils'
import type { Message } from '@/types/database'

interface Props {
  message: Message
  isOwn: boolean
}

export function ChatBubble({ message, isOwn }: Props) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {!isOwn && message.sender && (
          <span className="text-xs text-slate-400 px-1">{message.sender.nickname}</span>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isOwn
              ? 'bg-primary text-white rounded-tr-sm'
              : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm shadow-sm'
          }`}
        >
          {message.content}
        </div>
        <span className="text-[10px] text-slate-400 px-1">{formatDateTime(message.created_at)}</span>
      </div>
    </div>
  )
}
