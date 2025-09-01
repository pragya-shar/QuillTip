'use client'

import { notFound } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useState, useEffect } from 'react'
import ArticleDisplay from '@/components/articles/ArticleDisplay'
import AppNavigation from '@/components/layout/AppNavigation'

interface ArticlePageProps {
  params: Promise<{
    username: string
    slug: string
  }>
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const [routeParams, setRouteParams] = useState<{
    username: string | null
    slug: string | null
  }>({ username: null, slug: null })
  
  // Get params from promise
  useEffect(() => {
    params.then(p => setRouteParams({
      username: p.username,
      slug: p.slug
    }))
  }, [params])
  
  // Fetch article
  const article = useQuery(
    api.articles.getArticleBySlug,
    routeParams.username && routeParams.slug 
      ? { username: routeParams.username, slug: routeParams.slug }
      : 'skip'
  )
  
  // Loading state
  if (routeParams.username === null || routeParams.slug === null) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <AppNavigation />
        <main className="pt-20">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }
  
  // Check if article exists (null means not found, undefined means loading)
  if (routeParams.username && routeParams.slug && article === null) {
    notFound()
  }
  
  // Show loading while article is being fetched
  if (!article) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <AppNavigation />
        <main className="pt-20">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Map Convex article to match ArticleDisplay interface
  const articleForDisplay = {
    id: article._id,
    slug: article.slug,
    title: article.title,
    content: article.content,
    excerpt: article.excerpt,
    coverImage: article.coverImage,
    publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
    author: article.author,
    // Transform string tags to objects
    tags: (article.tags || []).map((tag: string, index: number) => ({
      id: `tag-${index}`,
      name: tag,
      slug: tag.toLowerCase().replace(/\s+/g, '-'),
    })),
    tipStats: article.tipStats,
  }
  
  return (
    <div className="min-h-screen bg-brand-cream">
      <AppNavigation />
      <main className="pt-20">
        <ArticleDisplay article={articleForDisplay} />
      </main>
    </div>
  )
}

// Configure dynamic behavior for production
export const dynamic = 'force-dynamic'
export const dynamicParams = true