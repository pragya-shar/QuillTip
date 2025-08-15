'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { History, GitBranch } from 'lucide-react'
import AppNavigation from '@/components/layout/AppNavigation'
import DiffViewer from '@/components/editor/DiffViewer'

interface Draft {
  id: string
  title: string
  excerpt?: string
  createdAt: string
  updatedAt: string
  published: boolean
}

interface Version {
  id: string
  title: string
  content: any
  excerpt?: string
  version: number | string
  createdAt: string
}

interface VersionHistory {
  current: Version
  versions: Version[]
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [showVersions, setShowVersions] = useState<string | null>(null)
  const [versionHistory, setVersionHistory] = useState<VersionHistory | null>(null)
  const [loadingVersions, setLoadingVersions] = useState(false)
  const [showDiffViewer, setShowDiffViewer] = useState(false)
  const [compareVersions, setCompareVersions] = useState<{ current: Version; compare: Version } | null>(null)
  const router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    const fetchDrafts = async () => {
      if (status !== 'authenticated') return

      try {
        const response = await fetch('/api/articles/drafts')
        if (response.ok) {
          const data = await response.json()
          setDrafts(data)
        }
      } catch (error) {
        console.error('Failed to fetch drafts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDrafts()
  }, [status])

  const fetchVersions = async (draftId: string) => {
    setLoadingVersions(true)
    try {
      const response = await fetch(`/api/articles/${draftId}/versions`)
      if (response.ok) {
        const data = await response.json()
        setVersionHistory(data)
        setShowVersions(draftId)
      }
    } catch (error) {
      console.error('Failed to fetch versions:', error)
    } finally {
      setLoadingVersions(false)
    }
  }

  const handleCompareVersions = (compareVersion: Version) => {
    if (versionHistory) {
      setCompareVersions({
        current: versionHistory.current,
        compare: compareVersion
      })
      setShowDiffViewer(true)
    }
  }

  const handleRestoreVersion = async (version: Version) => {
    try {
      const response = await fetch('/api/articles/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: showVersions,
          title: version.title,
          content: version.content,
          excerpt: version.excerpt,
        }),
      })

      if (response.ok) {
        // Refresh the draft and version history
        fetchDrafts()
        if (showVersions) {
          fetchVersions(showVersions)
        }
        alert('Version restored successfully!')
      }
    } catch (error) {
      console.error('Failed to restore version:', error)
      alert('Failed to restore version')
    }
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavigation />
      <div className="max-w-5xl mx-auto pt-24 pb-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Drafts</h1>
          <Link
            href="/write"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Article
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading drafts...</div>
          </div>
        ) : drafts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-gray-500 mb-4">No drafts yet</div>
            <Link
              href="/write"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Start writing your first article →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {draft.title || 'Untitled'}
                    </h2>
                    {draft.excerpt && (
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {draft.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Created: {formatDate(draft.createdAt)}</span>
                      <span>•</span>
                      <span>Last saved: {formatDate(draft.updatedAt)}</span>
                      {!draft.published && (
                        <>
                          <span>•</span>
                          <span className="text-yellow-600 font-medium">Draft</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => fetchVersions(draft.id)}
                      className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-2"
                      disabled={loadingVersions && showVersions === draft.id}
                    >
                      <History className="w-4 h-4" />
                      {loadingVersions && showVersions === draft.id ? 'Loading...' : 'Versions'}
                    </button>
                    <Link
                      href={`/write?id=${draft.id}`}
                      className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this draft?')) {
                          try {
                            const response = await fetch(`/api/articles/draft?id=${draft.id}`, {
                              method: 'DELETE'
                            })
                            if (response.ok) {
                              setDrafts(drafts.filter(d => d.id !== draft.id))
                            }
                          } catch (error) {
                            console.error('Failed to delete draft:', error)
                          }
                        }
                      }}
                      className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
          <p className="font-semibold mb-2">ℹ️ About Drafts</p>
          <ul className="space-y-1">
            <li>• All your unpublished articles are saved here automatically</li>
            <li>• Click &quot;Edit&quot; to continue working on any draft</li>
            <li>• Click &quot;Versions&quot; to view version history and compare changes</li>
            <li>• Drafts are auto-saved every 30 seconds while you write</li>
            <li>• Delete drafts you no longer need to keep your workspace clean</li>
          </ul>
        </div>
      </div>

      {/* Version History Panel */}
      {showVersions && versionHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Version History</h2>
              </div>
              <button
                onClick={() => {
                  setShowVersions(null)
                  setVersionHistory(null)
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {/* Current Version */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                          CURRENT
                        </span>
                        <span className="font-medium">{versionHistory.current.title}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Last updated: {formatDate(versionHistory.current.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Previous Versions */}
                {versionHistory.versions.map((version) => (
                  <div key={version.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-gray-600 text-white px-2 py-1 rounded text-xs font-medium">
                            V{version.version}
                          </span>
                          <span className="font-medium">{version.title}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Saved: {formatDate(version.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCompareVersions(version)}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                      >
                        <GitBranch className="w-4 h-4" />
                        Compare
                      </button>
                    </div>
                  </div>
                ))}

                {versionHistory.versions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No previous versions available yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diff Viewer */}
      {showDiffViewer && compareVersions && (
        <DiffViewer
          currentVersion={compareVersions.current}
          compareVersion={compareVersions.compare}
          onClose={() => {
            setShowDiffViewer(false)
            setCompareVersions(null)
          }}
          onRestore={handleRestoreVersion}
        />
      )}
    </div>
  )
}