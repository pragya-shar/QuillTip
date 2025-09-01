import { Editor } from '@tiptap/react'
import { TextSelection } from '@tiptap/pm/state'
import { Id } from '@/convex/_generated/dataModel'

export interface HighlightData {
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

export class HighlightConverter {
  /**
   * Apply highlights to the TipTap editor as marks
   */
  static applyHighlightsToEditor(editor: Editor, highlights: HighlightData[]) {
    if (!editor || !highlights.length) return

    // Clear existing highlight marks first
    editor.chain().focus().unsetHighlight().run()

    // Sort highlights by position to apply them in order
    const sortedHighlights = [...highlights].sort((a, b) => a.startOffset - b.startOffset)

    // Apply each highlight as a mark
    sortedHighlights.forEach((highlight) => {
      try {
        const { from, to } = this.findTextPositions(editor, highlight.text, highlight.startOffset)
        
        if (from !== -1 && to !== -1) {
          // Apply the highlight mark with all attributes
          editor
            .chain()
            .focus()
            .setTextSelection({ from, to })
            .setHighlight({
              id: highlight._id,
              color: highlight.color || '#FFEB3B',
              userId: highlight.userId,
              userName: highlight.userName,
              note: highlight.note,
              createdAt: highlight.createdAt,
            })
            .run()
        }
      } catch (error) {
        console.error('Failed to apply highlight:', error)
      }
    })

    // Reset selection to the beginning
    editor.chain().focus().setTextSelection(0).run()
  }

  /**
   * Find the actual positions in the editor for a given text
   */
  private static findTextPositions(
    editor: Editor,
    searchText: string,
    approximateStart: number
  ): { from: number; to: number } {
    const { state } = editor
    const { doc } = state
    
    // Get the full text content
    const fullText = doc.textContent
    
    // Try to find the exact text near the approximate position
    const searchStart = Math.max(0, approximateStart - 50)
    const searchEnd = Math.min(fullText.length, approximateStart + searchText.length + 50)
    
    const searchArea = fullText.substring(searchStart, searchEnd)
    const textIndex = searchArea.indexOf(searchText)
    
    if (textIndex !== -1) {
      const from = searchStart + textIndex + 1 // TipTap positions are 1-indexed
      const to = from + searchText.length
      return { from, to }
    }
    
    // Fallback: search the entire document
    const globalIndex = fullText.indexOf(searchText)
    if (globalIndex !== -1) {
      const from = globalIndex + 1
      const to = from + searchText.length
      return { from, to }
    }
    
    return { from: -1, to: -1 }
  }

  /**
   * Convert a text selection to highlight data for storage
   */
  static selectionToHighlightData(
    editor: Editor,
    selection: TextSelection,
    additionalData: {
      color?: string
      note?: string
      isPublic?: boolean
    }
  ): Omit<HighlightData, '_id' | 'userId' | 'userName' | 'userAvatar' | 'createdAt'> {
    const { from, to } = selection
    const selectedText = editor.state.doc.textBetween(from, to, ' ')
    
    // For now, we'll use simple offsets
    // In a production app, you'd want more robust path calculation
    return {
      text: selectedText,
      startOffset: from - 1, // Convert to 0-indexed
      endOffset: to - 1,
      startContainerPath: `text.${from}`,
      endContainerPath: `text.${to}`,
      color: additionalData.color || '#FFEB3B',
      note: additionalData.note,
      isPublic: additionalData.isPublic !== false,
    }
  }

  /**
   * Create a highlight from the current editor selection
   */
  static createHighlightFromSelection(
    editor: Editor,
    additionalData: {
      color?: string
      note?: string
      isPublic?: boolean
    }
  ) {
    const { selection } = editor.state
    
    if (selection.empty) {
      return null
    }

    const { from, to } = selection
    const selectedText = editor.state.doc.textBetween(from, to, ' ')
    
    if (selectedText.trim().length < 3) {
      return null
    }

    return {
      text: selectedText,
      startOffset: from - 1,
      endOffset: to - 1,
      startContainerPath: `text.${from}`,
      endContainerPath: `text.${to}`,
      ...additionalData
    }
  }
}