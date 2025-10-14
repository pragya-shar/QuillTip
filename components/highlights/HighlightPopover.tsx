'use client'

import { useState } from 'react'
import { X, Highlighter, MessageSquare, Lock, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HighlightTipButton } from './HighlightTipButton'
import { Id } from '@/convex/_generated/dataModel'

interface HighlightPopoverProps {
  position: { top: number; left: number }
  onCreateHighlight: (color: string, note?: string, isPublic?: boolean) => void
  onClose: () => void
  selectedText: string
  // Tipping props (optional - only show tip button if article data provided)
  articleId?: Id<'articles'>
  articleSlug?: string
  articleTitle?: string
  authorName?: string
  authorStellarAddress?: string | null
  startOffset?: number
  endOffset?: number
}

const PREMIUM_HIGHLIGHT_COLORS = [
  {
    name: 'Amber',
    value: '#F59E0B',
    rgb: '245, 158, 11',
    description: 'Warm & Inviting',
  },
  {
    name: 'Emerald',
    value: '#10B981',
    rgb: '16, 185, 129',
    description: 'Fresh & Natural',
  },
  {
    name: 'Azure',
    value: '#3B82F6',
    rgb: '59, 130, 246',
    description: 'Deep & Trustworthy',
  },
  {
    name: 'Rose',
    value: '#F43F5E',
    rgb: '244, 63, 94',
    description: 'Elegant & Bold',
  },
  {
    name: 'Violet',
    value: '#8B5CF6',
    rgb: '139, 92, 246',
    description: 'Royal & Creative',
  },
  {
    name: 'Coral',
    value: '#FB7185',
    rgb: '251, 113, 133',
    description: 'Soft & Playful',
  },
]

export function HighlightPopover({
  position,
  onCreateHighlight,
  onClose,
  selectedText,
  articleId,
  articleSlug,
  authorName,
  authorStellarAddress,
  startOffset,
  endOffset,
}: HighlightPopoverProps) {
  const [selectedColor, setSelectedColor] = useState(
    PREMIUM_HIGHLIGHT_COLORS[0]?.value || '#F59E0B'
  )
  const [note, setNote] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [showNoteInput, setShowNoteInput] = useState(false)

  const handleCreateHighlight = () => {
    onCreateHighlight(selectedColor, note || undefined, isPublic)
  }

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    if (!showNoteInput) {
      onCreateHighlight(color, undefined, isPublic)
    }
  }

  return (
    <div
      className="highlight-popover absolute z-50 rounded-2xl p-4 min-w-[320px]"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)',
      }}
    >
      {/* Text Preview */}
      <div className="highlight-text-preview">
        &ldquo;{selectedText.slice(0, 150)}
        {selectedText.length > 150 ? '...' : ''}&rdquo;
      </div>

      {/* Color Picker */}
      <div className="mb-4">
        <div className="text-xs font-medium text-gray-600 mb-2">
          Choose Highlight Color
        </div>
        <div className="color-picker-container">
          {PREMIUM_HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorSelect(color.value)}
              className={cn(
                'color-picker-button',
                selectedColor === color.value && 'selected'
              )}
              style={{
                background: `linear-gradient(135deg, ${color.value}, ${color.value}dd)`,
              }}
              aria-label={`Select ${color.name} highlight`}
            >
              <div className="color-tooltip">
                <div className="font-medium">{color.name}</div>
                <div className="text-xs opacity-80">{color.description}</div>
                <div className="color-tooltip-arrow" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setShowNoteInput(!showNoteInput)}
          className={cn(
            'highlight-action-button flex items-center gap-2',
            'bg-gray-100 hover:bg-gray-200 text-gray-700',
            showNoteInput && 'bg-gray-200'
          )}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Add Note</span>
        </button>

        <button
          onClick={() => setIsPublic(!isPublic)}
          className="privacy-toggle"
        >
          {isPublic ? (
            <>
              <Globe className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">Public</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">Private</span>
            </>
          )}
        </button>
      </div>

      {/* Note Input */}
      {showNoteInput && (
        <div className="mb-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note to your highlight..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            autoFocus
          />
        </div>
      )}

      {/* Tip Button - Show if article data is available */}
      {articleId && articleSlug && authorStellarAddress && startOffset !== undefined && endOffset !== undefined && (
        <div className="mb-3 pt-3 border-t border-gray-200">
          <div className="text-xs font-medium text-gray-600 mb-2">
            💰 Tip this Highlight
          </div>
          <HighlightTipButton
            articleId={articleId}
            articleSlug={articleSlug}
            authorName={authorName || 'Author'}
            authorStellarAddress={authorStellarAddress}
            highlightText={selectedText}
            startOffset={startOffset}
            endOffset={endOffset}
            className="w-full justify-center"
            onSuccess={() => {
              // Close popover after successful tip
              onClose()
            }}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {showNoteInput && (
          <button
            onClick={handleCreateHighlight}
            className="highlight-action-button flex-1 bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600"
          >
            <Highlighter className="w-4 h-4 inline mr-2" />
            Save Highlight
          </button>
        )}

        <button
          onClick={onClose}
          className="highlight-action-button px-3 bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
