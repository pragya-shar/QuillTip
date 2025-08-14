'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EditorWithToolbar } from '@/components/editor'
import { useSession } from 'next-auth/react'
import AppNavigation from '@/components/layout/AppNavigation'

export default function WritePage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [tags, setTags] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  
  const router = useRouter()
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    // TODO: Implement draft save API call
    console.log('Saving draft...', { title, content, excerpt, tags })
    setIsSaving(false)
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    // TODO: Implement publish API call
    console.log('Publishing...', { title, content, excerpt, tags, coverImage })
    setIsPublishing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavigation />
      <div className="max-w-5xl mx-auto pt-24 pb-8 px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Write Your Story</h1>
          <div className="flex gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={isSaving || !title || !content}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing || !title || !content}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Article Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl font-bold border-0 border-b-2 border-gray-200 focus:border-blue-500 outline-none pb-2 bg-transparent"
          />
        </div>

        {/* Cover Image URL */}
        <div className="mb-6">
          <input
            type="url"
            placeholder="Cover Image URL (optional)"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 outline-none"
          />
        </div>

        {/* Editor */}
        <div className="mb-6">
          <EditorWithToolbar
            content={content}
            onChange={setContent}
            placeholder="Write your story..."
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
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 outline-none resize-none"
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
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 outline-none"
          />
        </div>
      </div>
    </div>
  )
}