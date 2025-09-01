'use client'

import { Id } from '@/convex/_generated/dataModel'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface HighlightData {
  _id: Id<'highlights'>
  text: string
  color?: string
  note?: string
  isPublic: boolean
  userId: Id<'users'>
  userName?: string
  userAvatar?: string
  createdAt: number
}

interface HighlightNotesProps {
  highlights: HighlightData[]
  currentUserId?: Id<'users'>
  onNoteClick?: (highlight: HighlightData) => void
  className?: string
}

export function HighlightNotes({
  highlights,
  currentUserId,
  onNoteClick,
  className
}: HighlightNotesProps) {
  // Filter only highlights with notes
  const highlightsWithNotes = highlights.filter(h => h.note && h.note.trim().length > 0)
  
  if (highlightsWithNotes.length === 0) {
    return (
      <div className={cn("p-6 text-center", className)}>
        <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm">
          No notes yet. Highlight text and add a note to see it here.
        </p>
      </div>
    )
  }
  
  return (
    <div className={cn("divide-y divide-gray-100", className)}>
      {highlightsWithNotes.map((highlight) => (
        <div
          key={highlight._id}
          className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => onNoteClick?.(highlight)}
        >
          {/* Note header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {highlight.userAvatar ? (
                <Image
                  src={highlight.userAvatar}
                  alt={highlight.userName || 'User'}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-3 h-3 text-gray-500" />
                </div>
              )}
              <span className="text-sm font-medium text-gray-900">
                {highlight.userName || 'Anonymous'}
              </span>
              {highlight.userId === currentUserId && (
                <span className="text-xs text-gray-500">(You)</span>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(highlight.createdAt), { addSuffix: true })}
            </span>
          </div>
          
          {/* Highlighted text snippet */}
          <div 
            className="mb-2 px-2 py-1 rounded text-sm text-gray-700 line-clamp-2"
            style={{
              backgroundColor: `${highlight.color || '#FFEB3B'}40`,
              borderLeft: `3px solid ${highlight.color || '#FFEB3B'}`
            }}
          >
            &ldquo;{highlight.text}&rdquo;
          </div>
          
          {/* Note content */}
          <div className="text-sm text-gray-600 italic">
            {highlight.note}
          </div>
          
          {/* Visibility indicator */}
          {!highlight.isPublic && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                Private
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}