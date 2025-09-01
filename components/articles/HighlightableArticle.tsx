'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { ResizableImage } from '@/components/editor/extensions/ResizableImage'
import HighlightExtension from '@/components/editor/extensions/HighlightExtension'
import { HighlightConverter } from '@/lib/highlights/HighlightConverter'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { HighlightPopover } from '@/components/highlights/HighlightPopover'
import { cn } from '@/lib/utils'
import { JSONContent } from '@tiptap/react'
import { motion, AnimatePresence } from 'motion/react'

const lowlight = createLowlight(common)

interface HighlightData {
  _id: Id<'highlights'>
  text: string
  startOffset: number
  endOffset: number
  startContainerPath: string
  endContainerPath: string
  color?: string
  note?: string
  isPublic: boolean
  userId: Id<'users'>
  userName?: string
  userAvatar?: string
  createdAt: number
}

interface HighlightableArticleProps {
  articleId: Id<'articles'>
  content: JSONContent
  editable?: boolean
  showHighlights?: boolean
  onHighlightClick?: (highlight: HighlightData) => void
  className?: string
}

export function HighlightableArticle({
  articleId,
  content,
  editable = false,
  showHighlights = true,
  onHighlightClick,
  className
}: HighlightableArticleProps) {
  const [selectedText, setSelectedText] = useState<{
    text: string
    from: number
    to: number
  } | null>(null)
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null)
  const [highlightTooltip, setHighlightTooltip] = useState<{
    highlight: HighlightData
    position: { top: number; left: number }
  } | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  
  // Fetch highlights for the article
  const highlights = useQuery(api.highlights.getArticleHighlights, { 
    articleId
  })
  
  // Mutation to create a highlight
  const createHighlight = useMutation(api.highlights.createHighlight)
  
  // Initialize TipTap editor with highlight extension
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      ResizableImage,
      HighlightExtension.configure({
        multicolor: true,
        highlights: highlights?.map(h => ({
          id: h._id,
          color: h.color || '#FFEB3B',
          userId: h.userId,
          userName: h.userName,
          userAvatar: h.userAvatar,
          note: h.note,
          createdAt: h.createdAt
        })) || [],
        onHighlightClick: (highlightAttrs) => {
          // Find the full highlight data
          const fullHighlight = highlights?.find(h => h._id === highlightAttrs.id)
          if (fullHighlight) {
            // Show tooltip with highlight info
            if (onHighlightClick) {
              onHighlightClick(fullHighlight)
            } else {
              // Default behavior: show tooltip
              const selection = window.getSelection()
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0)
                const rect = range.getBoundingClientRect()
                setHighlightTooltip({
                  highlight: fullHighlight,
                  position: {
                    top: rect.top + window.scrollY - 60,
                    left: rect.left + rect.width / 2
                  }
                })
              }
            }
          }
        }
      }),
    ],
    content,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-lg prose-stone max-w-none focus:outline-none',
      },
    },
    onSelectionUpdate: ({ editor }) => {
      if (editable) return
      
      const { selection } = editor.state
      const { from, to } = selection
      const text = editor.state.doc.textBetween(from, to, ' ')
      
      if (text.trim().length >= 3) {
        // Get the DOM selection for positioning
        const domSelection = window.getSelection()
        if (domSelection && domSelection.rangeCount > 0) {
          const range = domSelection.getRangeAt(0)
          const rect = range.getBoundingClientRect()
          
          setSelectedText({ text, from, to })
          setPopoverPosition({
            top: rect.top + window.scrollY - 60,
            left: rect.left + rect.width / 2
          })
        }
      } else {
        setSelectedText(null)
        setPopoverPosition(null)
      }
    },
  })
  
  // Apply highlights when they change
  useEffect(() => {
    if (!editor || !highlights || !showHighlights) return
    
    // Apply highlights to the editor
    HighlightConverter.applyHighlightsToEditor(editor, highlights)
  }, [editor, highlights, showHighlights])
  
  // Handle highlight creation
  const handleCreateHighlight = useCallback(async (color: string, note?: string, isPublic: boolean = true) => {
    if (!selectedText || !editor) return
    
    try {
      // Create highlight data from selection
      const highlightData = HighlightConverter.createHighlightFromSelection(editor, {
        color,
        note,
        isPublic
      })
      
      if (highlightData) {
        // Save to database
        await createHighlight({
          articleId,
          ...highlightData
        })
        
        // Apply the highlight immediately for instant feedback
        editor
          .chain()
          .focus()
          .setHighlight({
            id: `temp-${Date.now()}`, // Temporary ID until refetch
            color,
            userId: 'current-user', // This would come from auth context
            note,
            createdAt: Date.now(),
          })
          .run()
        
        // Clear selection
        setSelectedText(null)
        setPopoverPosition(null)
        window.getSelection()?.removeAllRanges()
      }
    } catch (error) {
      console.error('Error creating highlight:', error)
    }
  }, [selectedText, editor, articleId, createHighlight])
  
  // Handle popover close
  const handlePopoverClose = useCallback(() => {
    setSelectedText(null)
    setPopoverPosition(null)
    window.getSelection()?.removeAllRanges()
  }, [])
  
  // Handle tooltip close
  const handleTooltipClose = useCallback(() => {
    setHighlightTooltip(null)
  }, [])
  
  return (
    <div 
      className={cn("highlightable-article relative", className)} 
      ref={editorRef}
    >
      <EditorContent editor={editor} />
      
      {/* Highlight creation popover */}
      <AnimatePresence>
        {popoverPosition && selectedText && (
          <HighlightPopover
            position={popoverPosition}
            onCreateHighlight={handleCreateHighlight}
            onClose={handlePopoverClose}
            selectedText={selectedText.text}
          />
        )}
      </AnimatePresence>
      
      {/* Highlight info tooltip */}
      <AnimatePresence>
        {highlightTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="highlight-tooltip visible"
            style={{
              top: highlightTooltip.position.top,
              left: highlightTooltip.position.left,
              transform: 'translateX(-50%)',
            }}
            onMouseLeave={handleTooltipClose}
          >
            {highlightTooltip.highlight.userName && (
              <div className="author">
                {highlightTooltip.highlight.userName}
              </div>
            )}
            {highlightTooltip.highlight.note && (
              <div className="note">
                {highlightTooltip.highlight.note}
              </div>
            )}
            <div className="timestamp">
              {new Date(highlightTooltip.highlight.createdAt).toLocaleDateString()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}