'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import AppNavigation from '@/components/layout/AppNavigation'
import ArticleGrid from '@/components/articles/ArticleGrid'
import Pagination from '@/components/articles/Pagination'
import SearchInput from '@/components/articles/SearchInput'
import { Loader2 } from 'lucide-react'

interface Article {
  id: string
  slug: string
  title: string
  excerpt?: string | null
  coverImage?: string | null
  publishedAt: Date | string | null
  author: {
    id: string
    name?: string | null
    username: string
    avatar?: string | null
  }
  tags: Array<{
    id: string
    name: string
    slug: string
  }>
}

interface PaginationData {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 9,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const currentPage = parseInt(searchParams.get('page') || '1')
  const tag = searchParams.get('tag')
  const author = searchParams.get('author')
  const urlSearch = searchParams.get('search') || ''

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      params.set('page', currentPage.toString())
      params.set('limit', '9')
      
      if (tag) params.set('tag', tag)
      if (author) params.set('author', author)
      if (urlSearch) params.set('search', urlSearch)
      
      const response = await fetch(`/api/articles?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles')
      }
      
      const data = await response.json()
      setArticles(data.articles)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [currentPage, tag, author, urlSearch])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  // Sync searchTerm with URL parameter
  useEffect(() => {
    setSearchTerm(urlSearch)
  }, [urlSearch])

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/articles?${params.toString()}`)
  }

  const handleSearchChange = (search: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (search.trim()) {
      params.set('search', search.trim())
    } else {
      params.delete('search')
    }
    params.set('page', '1') // Reset to first page when searching
    router.push(`/articles?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/articles')
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <AppNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">All Articles</h1>
          <p className="text-lg text-gray-600">
            Discover stories, thinking, and expertise from writers on QuillTip
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <SearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search articles by title or excerpt..."
            className="max-w-md"
          />
        </div>

        {/* Active Filters */}
        {(tag || author || urlSearch) && (
          <div className="mb-6 flex items-center gap-2">
            <span className="text-sm text-gray-600">Filtering by:</span>
            {tag && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-brand-blue text-white">
                Tag: {tag}
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.delete('tag')
                    params.set('page', '1')
                    router.push(`/articles?${params.toString()}`)
                  }}
                  className="ml-2 hover:text-gray-200"
                  aria-label="Remove tag filter"
                >
                  ×
                </button>
              </span>
            )}
            {author && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-brand-blue text-white">
                Author: @{author}
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.delete('author')
                    params.set('page', '1')
                    router.push(`/articles?${params.toString()}`)
                  }}
                  className="ml-2 hover:text-gray-200"
                  aria-label="Remove author filter"
                >
                  ×
                </button>
              </span>
            )}
            {urlSearch && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-brand-blue text-white">
                Search: &ldquo;{urlSearch}&rdquo;
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.delete('search')
                    params.set('page', '1')
                    router.push(`/articles?${params.toString()}`)
                  }}
                  className="ml-2 hover:text-gray-200"
                  aria-label="Remove search filter"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-brand-blue hover:text-brand-accent underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
            <span className="ml-2 text-gray-600">Loading articles...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">Error: {error}</p>
            <button
              onClick={fetchArticles}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Articles Grid */}
        {!loading && !error && (
          <>
            <ArticleGrid articles={articles} />
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            {/* Results Summary */}
            {articles.length > 0 && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} articles
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}