'use client'

import { useState } from 'react'
import { JSONContent } from '@tiptap/react'
import { diffWords, diffLines } from 'diff'
import { X, ArrowLeft, RotateCcw, Clock } from 'lucide-react'

interface Version {
  id: string
  title: string
  content: JSONContent
  excerpt?: string
  version: number | string
  createdAt: string
}

interface DiffViewerProps {
  currentVersion: Version
  compareVersion: Version
  onClose: () => void
  onRestore?: (version: Version) => void
}

// Helper function to extract plain text from TipTap JSON
function extractTextFromContent(content: JSONContent): string {
  if (!content) return ''
  
  let text = ''
  
  if (content.text) {
    text += content.text
  }
  
  if (content.content) {
    content.content.forEach(node => {
      text += extractTextFromContent(node)
      if (node.type === 'paragraph' || node.type === 'heading') {
        text += '\n'
      }
    })
  }
  
  return text
}

export default function DiffViewer({ currentVersion, compareVersion, onClose, onRestore }: DiffViewerProps) {
  const [diffMode, setDiffMode] = useState<'words' | 'lines'>('words')
  const [showConfirmRestore, setShowConfirmRestore] = useState(false)

  // Extract text content for comparison
  const currentText = extractTextFromContent(currentVersion.content)
  const compareText = extractTextFromContent(compareVersion.content)

  // Generate diffs
  const textDiff = diffMode === 'words' ? diffWords(compareText, currentText) : diffLines(compareText, currentText)
  const titleDiff = diffWords(compareVersion.title, currentVersion.title)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleRestore = () => {
    if (onRestore) {
      onRestore(compareVersion)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold">Version Comparison</h2>
              <p className="text-sm text-gray-500">
                Comparing version {compareVersion.version} with {currentVersion.version === 'current' ? 'current version' : `version ${currentVersion.version}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Diff mode toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setDiffMode('words')}
                className={`px-3 py-1 text-sm rounded-l-lg transition-colors ${
                  diffMode === 'words' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                }`}
              >
                Words
              </button>
              <button
                onClick={() => setDiffMode('lines')}
                className={`px-3 py-1 text-sm rounded-r-lg transition-colors ${
                  diffMode === 'lines' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                }`}
              >
                Lines
              </button>
            </div>
            
            {onRestore && compareVersion.version !== 'current' && (
              <button
                onClick={() => setShowConfirmRestore(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Restore Version
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Version info */}
        <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 border-b border-gray-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">Version {compareVersion.version}</span>
            </div>
            <p className="text-sm text-gray-600">{formatDate(compareVersion.createdAt)}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">
                {currentVersion.version === 'current' ? 'Current Version' : `Version ${currentVersion.version}`}
              </span>
            </div>
            <p className="text-sm text-gray-600">{formatDate(currentVersion.createdAt)}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Title diff */}
          {compareVersion.title !== currentVersion.title && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Title Changes</h3>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                {titleDiff.map((part, index) => (
                  <span
                    key={index}
                    className={
                      part.added
                        ? 'bg-green-200 text-green-800'
                        : part.removed
                        ? 'bg-red-200 text-red-800 line-through'
                        : ''
                    }
                  >
                    {part.value}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Content diff */}
          <div>
            <h3 className="text-lg font-medium mb-3">Content Changes</h3>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap leading-relaxed">
              {textDiff.map((part, index) => (
                <span
                  key={index}
                  className={
                    part.added
                      ? 'bg-green-200 text-green-800'
                      : part.removed
                      ? 'bg-red-200 text-red-800 line-through'
                      : ''
                  }
                >
                  {part.value}
                </span>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 rounded"></div>
              <span>Added</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 rounded"></div>
              <span>Removed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 rounded"></div>
              <span>Unchanged</span>
            </div>
          </div>
        </div>
      </div>

      {/* Restore confirmation modal */}
      {showConfirmRestore && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Restore Version?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to restore to version {compareVersion.version}? This will replace your current content 
              and cannot be undone easily.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmRestore(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Restore Version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}