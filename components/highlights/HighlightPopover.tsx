'use client'

import { useState } from 'react'
import { X, Highlighter, MessageSquare, Lock, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HighlightPopoverProps {
  position: { top: number; left: number }
  onCreateHighlight: (color: string, note?: string, isPublic?: boolean) => void
  onClose: () => void
  selectedText: string
}

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#FFEB3B' },
  { name: 'Green', value: '#B2FF59' },
  { name: 'Blue', value: '#40C4FF' },
  { name: 'Pink', value: '#FF4081' },
  { name: 'Purple', value: '#E040FB' },
  { name: 'Orange', value: '#FFAB40' },
]

export function HighlightPopover({
  position,
  onCreateHighlight,
  onClose,
  selectedText
}: HighlightPopoverProps) {
  const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS[0]?.value || '#FFEB3B')
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
      className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[280px]"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Highlighter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Highlight Text</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      
      {/* Selected text preview */}
      <div className="mb-3 p-2 bg-gray-50 rounded text-sm text-gray-600 max-h-20 overflow-y-auto">
        &quot;{selectedText.slice(0, 100)}{selectedText.length > 100 ? '...' : ''}&quot;
      </div>
      
      {/* Color selector */}
      <div className="flex gap-2 mb-3">
        {HIGHLIGHT_COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => handleColorSelect(color.value)}
            className={cn(
              "w-8 h-8 rounded-full border-2 transition-all",
              selectedColor === color.value 
                ? "border-gray-800 scale-110 shadow-md" 
                : "border-gray-300 hover:scale-105"
            )}
            style={{ backgroundColor: color.value }}
            title={color.name}
          />
        ))}
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setShowNoteInput(!showNoteInput)}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors",
            showNoteInput
              ? "bg-brand-blue text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          <MessageSquare className="w-3 h-3" />
          Add Note
        </button>
        
        <button
          onClick={() => setIsPublic(!isPublic)}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors",
            isPublic
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {isPublic ? (
            <>
              <Globe className="w-3 h-3" />
              Public
            </>
          ) : (
            <>
              <Lock className="w-3 h-3" />
              Private
            </>
          )}
        </button>
      </div>
      
      {/* Note input */}
      {showNoteInput && (
        <div className="mb-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none"
            rows={3}
            autoFocus
          />
        </div>
      )}
      
      {/* Save button (only shown with note) */}
      {showNoteInput && (
        <button
          onClick={handleCreateHighlight}
          className="w-full py-2 bg-brand-blue text-white rounded-md text-sm font-medium hover:bg-brand-blue/90 transition-colors"
        >
          Create Highlight
        </button>
      )}
    </div>
  )
}