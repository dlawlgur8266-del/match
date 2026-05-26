'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value?: number
  onChange?: (val: number) => void
  readonly?: boolean
  size?: number
}

export function StarRating({ value = 0, onChange, readonly = false, size = 24 }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={cn('transition-transform', !readonly && 'hover:scale-110 cursor-pointer', readonly && 'cursor-default')}
        >
          <Star
            size={size}
            className={cn(
              'transition-colors',
              (hovered || value) >= star ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 text-slate-200'
            )}
          />
        </button>
      ))}
    </div>
  )
}
