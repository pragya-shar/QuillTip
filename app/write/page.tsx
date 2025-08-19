'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent, JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { ResizableImage } from '@/components/editor/extensions/ResizableImage'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { useSession } from 'next-auth/react'
import AppNavigation from '@/components/layout/AppNavigation'
import { useAutoSave } from '@/hooks/useAutoSave'

const lowlight = createLowlight(common)

export default function WritePage() {
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [tags, setTags] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [isUnpublishing, setIsUnpublishing] = useState(false)
  const [articleId, setArticleId] = useState<string | undefined>()
  const [editorContent, setEditorContent] = useState<JSONContent | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [publishStatus, setPublishStatus] = useState<{published: boolean, publishedAt: Date | null}>({
    published: false,
    publishedAt: null
  })
  
  const router = useRouter()
  const { data: session, status } = useSession()

  // Initialize editor with proper configuration
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        },
        codeBlock: false
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer hover:text-blue-800'
        }
      }),
      ResizableImage.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4'
        }
      }),
      Placeholder.configure({
        placeholder: 'Start writing your story...'
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'rounded-lg bg-gray-900 text-gray-100 p-4 my-4 overflow-x-auto'
        }
      })
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-8 py-4'
      }
    },
    onCreate: ({ editor }) => {
      // Set initial content state when editor is created
      const json = editor.getJSON()
      setEditorContent(json)
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      setEditorContent(json)
      setHasUnsavedChanges(true)
    }
  })

  // Auto-save hook - enable when we have a session and any content
  const { isSaving, lastSavedAt, error, saveNow } = useAutoSave({
    content: editorContent,
    articleId,
    title: title || 'Untitled',
    excerpt,
    enabled: !!session && (hasUnsavedChanges || !!title),
    onSaveSuccess: (response) => {
      if (!articleId && response.id) {
        setArticleId(response.id)
      }
      setHasUnsavedChanges(false)
    },
    onSaveError: (error) => {
      console.error('Auto-save error:', error)
    }
  })

  // Load draft if returning to edit
  useEffect(() => {
    const loadDraft = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const draftId = urlParams.get('id')
      
      if (draftId) {
        try {
          const response = await fetch(`/api/articles/draft?id=${draftId}`)
          if (response.ok) {
            const draft = await response.json()
            setArticleId(draft.id)
            setTitle(draft.title)
            setExcerpt(draft.excerpt || '')
            setPublishStatus({
              published: draft.published,
              publishedAt: draft.publishedAt ? new Date(draft.publishedAt) : null
            })
            if (editor && draft.content) {
              editor.commands.setContent(draft.content)
              setEditorContent(draft.content)
            }
            // Reset unsaved changes flag after loading draft
            setHasUnsavedChanges(false)
          }
        } catch (error) {
          console.error('Failed to load draft:', error)
        }
      }
    }

    if (editor && status === 'authenticated') {
      loadDraft()
    }
  }, [editor, status])

  // Handle publish
  const handlePublish = useCallback(async () => {
    if (!title || !editorContent) {
      alert('Please add a title and content before publishing')
      return
    }

    setIsPublishing(true)
    try {
      // Save one final time before publishing
      await saveNow()
      
      // Call the actual publish API
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: editorContent,
          excerpt: excerpt || '',
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          coverImage: coverImage || '',
          published: true, // Publishing immediately
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to publish')
      }

      const data = await response.json()
      console.log('Article published:', data)
      
      // Update publish status
      setPublishStatus({
        published: true,
        publishedAt: new Date(data.article.publishedAt)
      })
      
      alert('Article published successfully!')
      // Stay on the same page to show the updated status
      // router.push('/articles') // Disabled until we create the articles page
    } catch (error) {
      console.error('Publish error:', error)
      alert(`Failed to publish article: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsPublishing(false)
    }
  }, [title, editorContent, excerpt, tags, coverImage, saveNow])

  // Handle unpublish
  const handleUnpublish = useCallback(async () => {
    if (!articleId) {
      alert('No article to unpublish')
      return
    }

    setIsUnpublishing(true)
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          published: false,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to unpublish')
      }

      const data = await response.json()
      console.log('Article unpublished:', data)
      
      // Update publish status
      setPublishStatus({
        published: false,
        publishedAt: null
      })
      
      alert('Article unpublished successfully!')
    } catch (error) {
      console.error('Unpublish error:', error)
      alert(`Failed to unpublish article: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUnpublishing(false)
    }
  }, [articleId])

  // Handle toggle publish status
  const handleTogglePublish = useCallback(async () => {
    if (publishStatus.published) {
      await handleUnpublish()
    } else {
      await handlePublish()
    }
  }, [publishStatus.published, handleUnpublish, handlePublish])

  // Authentication checks
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavigation />
      <div className="max-w-5xl mx-auto pt-24 pb-8 px-4">
        {/* Header with auto-save status */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Write Your Story</h1>
            {articleId && (
              <div className="text-sm mt-1">
                <p className="text-gray-500">
                  Article ID: {articleId}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium">Status:</span>
                  {publishStatus.published ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                      Draft
                    </span>
                  )}
                  {publishStatus.published && publishStatus.publishedAt && (
                    <span className="text-xs text-gray-500">
                      • Published {publishStatus.publishedAt.toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Auto-save status */}
            <div className="text-sm text-gray-500">
              {isSaving && (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                  Saving...
                </span>
              )}
              {!isSaving && lastSavedAt && (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                  Saved {lastSavedAt.toLocaleTimeString()}
                </span>
              )}
              {error && (
                <span className="flex items-center gap-2 text-red-500">
                  <span className="inline-block w-2 h-2 bg-red-400 rounded-full"></span>
                  Save failed
                </span>
              )}
            </div>
            
            {/* Manual save button */}
            <button
              onClick={() => {
                saveNow()
                setHasUnsavedChanges(false)
              }}
              disabled={isSaving || !hasUnsavedChanges}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Save now (auto-saves every 30 seconds)"
            >
              {isSaving ? 'Saving...' : 'Save Now'}
            </button>
            
            {/* Publish/Unpublish buttons */}
            {publishStatus.published ? (
              <button
                onClick={handleUnpublish}
                disabled={isUnpublishing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Make this article private (unpublish)"
              >
                {isUnpublishing ? 'Unpublishing...' : 'Unpublish'}
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={isPublishing || !title || !editorContent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Make this article public"
              >
                {isPublishing ? 'Publishing...' : 'Publish'}
              </button>
            )}
            
            {/* Toggle button for existing articles */}
            {articleId && (
              <button
                onClick={handleTogglePublish}
                disabled={isPublishing || isUnpublishing || !title || !editorContent}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                title={publishStatus.published ? "Switch to draft" : "Publish article"}
              >
                {publishStatus.published ? '📝 Make Draft' : '🚀 Make Public'}
              </button>
            )}
          </div>
        </div>

        {/* Title Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Article Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setHasUnsavedChanges(true)
            }}
            className="w-full text-3xl font-bold border-0 border-b-2 border-gray-200 focus:border-blue-500 outline-none pb-2 bg-transparent placeholder-gray-400"
          />
        </div>

        {/* Cover Image URL */}
        <div className="mb-6">
          <input
            type="url"
            placeholder="Cover Image URL (optional)"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 outline-none placeholder-gray-400"
          />
          {coverImage && (
            <div className="mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={coverImage} 
                alt="Cover preview" 
                className="h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>

        {/* Editor with Toolbar */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <EditorToolbar editor={editor} />
          <EditorContent 
            editor={editor} 
            className="editor-content"
          />
        </div>

        {/* Excerpt */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Article Excerpt
          </label>
          <textarea
            placeholder="Brief description of your article (optional)"
            value={excerpt}
            onChange={(e) => {
              setExcerpt(e.target.value)
              setHasUnsavedChanges(true)
            }}
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 outline-none resize-none placeholder-gray-400"
          />
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            type="text"
            placeholder="Add tags separated by commas (e.g., technology, programming, web)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 outline-none placeholder-gray-400"
          />
        </div>

        {/* Help text */}
        <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
          <p className="font-semibold mb-2">ℹ️ Auto-save is enabled</p>
          <ul className="space-y-1">
            <li>• Your work is automatically saved every 30 seconds</li>
            <li>• The green indicator shows when your work was last saved</li>
            <li>• Your draft will be saved even if you close the browser</li>
            <li>• Use the &quot;Publish&quot; button when you&apos;re ready to make your article public</li>
          </ul>
        </div>
      </div>
    </div>
  )
}