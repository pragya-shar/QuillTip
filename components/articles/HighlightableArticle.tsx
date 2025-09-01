'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { ResizableImage } from '@/components/editor/extensions/ResizableImage'
import { SelectionManager } from '@/lib/highlights/SelectionManager'
import { HighlightSerializer } from '@/lib/highlights/HighlightSerializer'
import { TextHighlighter } from '@/components/fancy/text/text-highlighter'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { HighlightPopover } from '@/components/highlights/HighlightPopover'
import { cn } from '@/lib/utils'
import { JSONContent } from '@tiptap/react'

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
  content: JSONContent // TipTap JSON content
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
  const containerRef = useRef<HTMLDivElement>(null)
  const selectionManagerRef = useRef<SelectionManager | null>(null)
  const setSelectionManager = (manager: SelectionManager | null) => {
    selectionManagerRef.current = manager
  }
  const [selectedText, setSelectedText] = useState<{
    text: string
    startOffset: number
    endOffset: number
    startPath: string
    endPath: string
  } | null>(null)
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null)
  const [highlightedRanges, setHighlightedRanges] = useState<Map<string, Range>>(new Map())
  
  // Fetch highlights for the article
  const highlights = useQuery(api.highlights.getArticleHighlights, { 
    articleId
  })
  
  // Mutation to create a highlight
  const createHighlight = useMutation(api.highlights.createHighlight)
  
  // Initialize TipTap editor
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
    ],
    content,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-lg prose-stone max-w-none focus:outline-none',
      },
    },
  })
  
  // Initialize selection manager
  useEffect(() => {
    if (!containerRef.current || editable) return
    
    // Wait for editor to be mounted and find the actual content element
    const setupSelectionManager = () => {
      // Find the ProseMirror editor content element
      const editorElement = containerRef.current?.querySelector('.ProseMirror') || containerRef.current
      if (!editorElement) {
        console.warn('Editor element not found')
        return
      }
      
      const manager = new SelectionManager(
        editorElement as HTMLElement,
        (selection) => {
          const rect = selection.range.getBoundingClientRect()
          console.log('Selection detected:', selection.text) // Debug log
          
          setSelectedText({
            text: selection.text,
            startOffset: selection.startOffset,
            endOffset: selection.endOffset,
            startPath: HighlightSerializer.getNodePath(selection.startContainer),
            endPath: HighlightSerializer.getNodePath(selection.endContainer)
          })
          
          setPopoverPosition({
            top: rect.top + window.scrollY - 60,
            left: rect.left + rect.width / 2
          })
        },
        {
          minSelectionLength: 3,
          debounceMs: 300
        }
      )
      
      setSelectionManager(manager)
      
      return manager
    }
    
    // Give editor time to mount
    const timer = setTimeout(() => {
      const manager = setupSelectionManager()
      if (manager) {
        return () => {
          manager.destroy()
        }
      }
    }, 100)
    
    return () => {
      clearTimeout(timer)
      selectionManagerRef.current?.destroy()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editable])
  
  // Apply highlights to content
  useEffect(() => {
    if (!highlights || !containerRef.current || !showHighlights) return
    
    const newHighlightedRanges = new Map<string, Range>()
    
    // Clear existing highlights
    highlightedRanges.forEach((range) => {
      try {
        const contents = range.extractContents()
        range.insertNode(contents)
      } catch (e) {
        console.error('Error clearing highlight:', e)
      }
    })
    
    // Apply new highlights
    highlights.forEach((highlight) => {
      try {
        const startNode = HighlightSerializer.getNodeFromPath(highlight.startContainerPath)
        const endNode = HighlightSerializer.getNodeFromPath(highlight.endContainerPath)
        
        if (startNode && endNode) {
          const range = document.createRange()
          range.setStart(startNode, highlight.startOffset)
          range.setEnd(endNode, highlight.endOffset)
          
          newHighlightedRanges.set(highlight._id, range)
        }
      } catch (e) {
        console.error('Error applying highlight:', e)
      }
    })
    
    setHighlightedRanges(newHighlightedRanges)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlights, showHighlights])
  
  // Handle highlight creation
  const handleCreateHighlight = useCallback(async (color: string, note?: string, isPublic: boolean = true) => {
    if (!selectedText) return
    
    try {
      await createHighlight({
        articleId,
        text: selectedText.text,
        startOffset: selectedText.startOffset,
        endOffset: selectedText.endOffset,
        startContainerPath: selectedText.startPath,
        endContainerPath: selectedText.endPath,
        color,
        note,
        isPublic
      })
      
      // Clear selection
      setSelectedText(null)
      setPopoverPosition(null)
      window.getSelection()?.removeAllRanges()
    } catch (error) {
      console.error('Error creating highlight:', error)
    }
  }, [selectedText, articleId, createHighlight])
  
  // Handle popover close
  const handlePopoverClose = useCallback(() => {
    setSelectedText(null)
    setPopoverPosition(null)
    window.getSelection()?.removeAllRanges()
  }, [])
  
  // Manual selection check (fallback)
  const checkManualSelection = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    
    const range = selection.getRangeAt(0)
    const text = selection.toString().trim()
    
    if (text.length < 3) return
    
    // Check if selection is within our container
    const container = containerRef.current
    if (!container || !container.contains(range.commonAncestorContainer)) return
    
    const rect = range.getBoundingClientRect()
    console.log('Manual selection detected:', text)
    
    setSelectedText({
      text,
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      startPath: HighlightSerializer.getNodePath(range.startContainer),
      endPath: HighlightSerializer.getNodePath(range.endContainer)
    })
    
    setPopoverPosition({
      top: rect.top + window.scrollY - 60,
      left: rect.left + rect.width / 2
    })
  }, [])
  
  // Render highlighted text segments
  const renderHighlightedContent = () => {
    if (!editor || !highlights || !showHighlights) {
      return <EditorContent editor={editor} />
    }
    
    // Group overlapping highlights and render with TextHighlighter
    const highlightSegments = highlights.map((highlight) => ({
      id: highlight._id,
      start: highlight.startOffset,
      end: highlight.endOffset,
      color: highlight.color || '#FFEB3B',
      text: highlight.text,
      note: highlight.note,
      userId: highlight.userId,
      userName: highlight.userName
    }))
    
    return (
      <div className="highlight-container relative">
        <EditorContent editor={editor} />
        {highlightSegments.map((segment) => (
          <TextHighlighter
            key={segment.id}
            highlightColor={segment.color}
            direction="ltr"
            triggerType="auto"
            className="highlight-segment"
            onClick={() => onHighlightClick && onHighlightClick(highlights.find(h => h._id === segment.id)!)}
            title={segment.note || `Highlighted by ${segment.userName}`}
          >
            <span>{/* Empty span as child */}</span>
          </TextHighlighter>
        ))}
      </div>
    )
  }
  
  return (
    <div 
      className={cn("highlightable-article relative", className)} 
      ref={containerRef}
      onMouseUp={checkManualSelection}
      onTouchEnd={checkManualSelection}
    >
      {renderHighlightedContent()}
      
      {/* Highlight creation popover */}
      {popoverPosition && selectedText && (
        <HighlightPopover
          position={popoverPosition}
          onCreateHighlight={handleCreateHighlight}
          onClose={handlePopoverClose}
          selectedText={selectedText.text}
        />
      )}
      
    </div>
  )
}