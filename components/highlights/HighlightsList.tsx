'use client'

import { useState, useMemo } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { formatDistanceToNow } from 'date-fns'
import { Trash2, Edit2, Globe, Lock, User, X, Check } from 'lucide-react'
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

interface HighlightsListProps {
  highlights: HighlightData[]
  currentUserId?: Id<'users'>
  onHighlightClick?: (highlight: HighlightData) => void
  className?: string
}

export function HighlightsList({
  highlights,
  currentUserId,
  onHighlightClick,
  className
}: HighlightsListProps) {
  const [filter, setFilter] = useState<'all' | 'mine' | 'public'>('all')
  const [colorFilter, setColorFilter] = useState<string | null>(null)
  const [editingHighlight, setEditingHighlight] = useState<Id<'highlights'> | null>(null)
  const [editNote, setEditNote] = useState('')
  
  const updateHighlight = useMutation(api.highlights.updateHighlight)
  const deleteHighlight = useMutation(api.highlights.deleteHighlight)
  
  // Filter highlights
  const filteredHighlights = useMemo(() => {
    let filtered = [...highlights]
    
    // Apply visibility filter
    if (filter === 'mine' && currentUserId) {
      filtered = filtered.filter(h => h.userId === currentUserId)
    } else if (filter === 'public') {
      filtered = filtered.filter(h => h.isPublic)
    }
    
    // Apply color filter
    if (colorFilter) {
      filtered = filtered.filter(h => h.color === colorFilter)
    }
    
    // Sort by creation date (newest first)
    filtered.sort((a, b) => b.createdAt - a.createdAt)
    
    return filtered
  }, [highlights, filter, colorFilter, currentUserId])
  
  // Get unique colors from highlights
  const availableColors = useMemo(() => {
    const colors = new Set(highlights.map(h => h.color).filter(Boolean))
    return Array.from(colors) as string[]
  }, [highlights])
  
  const handleEditNote = async (highlightId: Id<'highlights'>, note: string) => {
    try {
      await updateHighlight({
        id: highlightId,
        note: note || undefined
      })
      setEditingHighlight(null)
      setEditNote('')
    } catch (error) {
      console.error('Error updating highlight:', error)
    }
  }
  
  const handleDelete = async (highlightId: Id<'highlights'>) => {
    try {
      await deleteHighlight({ id: highlightId })
    } catch (error) {
      console.error('Error deleting highlight:', error)
    }
  }
  
  const handleTogglePrivacy = async (highlightId: Id<'highlights'>, isPublic: boolean) => {
    try {
      await updateHighlight({
        id: highlightId,
        isPublic: !isPublic
      })
    } catch (error) {
      console.error('Error updating highlight privacy:', error)
    }
  }
  
  if (highlights.length === 0) {
    return (
      <div className={cn("p-4 text-center text-gray-500", className)}>
        No highlights yet. Select text to create one!
      </div>
    )
  }
  
  return (
    <div className={cn("highlights-list", className)}>
      {/* Filters */}
      <div className="p-4 border-b">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "px-3 py-1 rounded-md text-sm transition-colors",
              filter === 'all'
                ? "bg-brand-blue text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            All ({highlights.length})
          </button>
          {currentUserId && (
            <button
              onClick={() => setFilter('mine')}
              className={cn(
                "px-3 py-1 rounded-md text-sm transition-colors",
                filter === 'mine'
                  ? "bg-brand-blue text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Mine ({highlights.filter(h => h.userId === currentUserId).length})
            </button>
          )}
          <button
            onClick={() => setFilter('public')}
            className={cn(
              "px-3 py-1 rounded-md text-sm transition-colors",
              filter === 'public'
                ? "bg-brand-blue text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            Public ({highlights.filter(h => h.isPublic).length})
          </button>
        </div>
        
        {/* Color filter */}
        {availableColors.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Color:</span>
            <button
              onClick={() => setColorFilter(null)}
              className={cn(
                "px-2 py-1 rounded text-xs transition-colors",
                !colorFilter
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              All
            </button>
            {availableColors.map((color) => (
              <button
                key={color}
                onClick={() => setColorFilter(color)}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-all",
                  colorFilter === color
                    ? "border-gray-800 scale-110"
                    : "border-gray-300 hover:scale-105"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Highlights list */}
      <div className="divide-y max-h-[600px] overflow-y-auto">
        {filteredHighlights.map((highlight) => {
          const isOwner = currentUserId === highlight.userId
          const isEditing = editingHighlight === highlight._id
          
          return (
            <div
              key={highlight._id}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => !isEditing && onHighlightClick?.(highlight)}
            >
              {/* User info */}
              <div className="flex items-center gap-2 mb-2">
                {highlight.userAvatar ? (
                  <Image
                    src={highlight.userAvatar}
                    alt={highlight.userName || 'User'}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="w-3 h-3 text-gray-600" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {highlight.userName || 'Anonymous'}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(highlight.createdAt), { addSuffix: true })}
                </span>
                {highlight.isPublic ? (
                  <Globe className="w-3 h-3 text-green-600" />
                ) : (
                  <Lock className="w-3 h-3 text-gray-600" />
                )}
              </div>
              
              {/* Highlighted text */}
              <div
                className="p-2 rounded text-sm mb-2"
                style={{
                  backgroundColor: `${highlight.color}40` || '#FFEB3B40',
                  borderLeft: `3px solid ${highlight.color || '#FFEB3B'}`
                }}
              >
                {`"${highlight.text}"`}
              </div>
              
              {/* Note */}
              {isEditing ? (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    placeholder="Add a note..."
                    autoFocus
                  />
                  <button
                    onClick={() => handleEditNote(highlight._id, editNote)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingHighlight(null)
                      setEditNote('')
                    }}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : highlight.note ? (
                <p className="text-sm text-gray-600 italic mb-2">
                  {highlight.note}
                </p>
              ) : null}
              
              {/* Actions */}
              {isOwner && !isEditing && (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setEditingHighlight(highlight._id)
                      setEditNote(highlight.note ?? '')
                    }}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="Edit note"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleTogglePrivacy(highlight._id, highlight.isPublic)}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title={highlight.isPublic ? "Make private" : "Make public"}
                  >
                    {highlight.isPublic ? (
                      <Lock className="w-3 h-3" />
                    ) : (
                      <Globe className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(highlight._id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete highlight"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}