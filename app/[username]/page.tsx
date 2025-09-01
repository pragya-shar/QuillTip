'use client'

import { notFound } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import AppNavigation from '@/components/layout/AppNavigation'
import ProfileHeader from '@/components/profile/ProfileHeader'
import ArticleGrid from '@/components/articles/ArticleGrid'
import Pagination from '@/components/articles/Pagination'

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const searchParams = useSearchParams()
  const [username, setUsername] = useState<string | null>(null)
  const page = parseInt(searchParams.get('page') || '1', 10)
  
  // Get username from params
  useEffect(() => {
    params.then(p => setUsername(p.username))
  }, [params])
  
  // Fetch user profile
  const user = useQuery(
    api.users.getUserByUsername,
    username ? { username } : 'skip'
  )
  
  // Fetch user stats
  const userStats = useQuery(
    api.users.getUserStats,
    user ? { userId: user._id } : 'skip'
  )
  
  // Fetch user's articles
  const articlesData = useQuery(
    api.articles.listArticles,
    username ? { 
      author: username, 
      page, 
      limit: 9 
    } : 'skip'
  )
  
  // Loading state
  if (username === null) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <AppNavigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }
  
  // Check if user exists
  if (username && user === null) {
    notFound()
  }
  
  // Show loading while data is being fetched
  if (!user || !articlesData) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <AppNavigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }
  
  // Prepare user data with article count and map _id to id
  const userWithStats = {
    id: user._id,
    username: user.username,
    name: user.name,
    bio: user.bio,
    avatar: user.avatar,
    createdAt: new Date(user.createdAt),
    articleCount: userStats?.articleCount || 0,
    totalEarnings: userStats?.totalEarnings || 0,
    tipsReceivedCount: userStats?.tipsReceivedCount || 0,
  }
  
  return (
    <div className="min-h-screen bg-brand-cream">
      <AppNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Profile Header */}
        <div className="mb-8">
          <ProfileHeader user={userWithStats} />
        </div>

        {/* Articles Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Articles by {user.name || user.username}
          </h2>

          {articlesData.articles.length > 0 ? (
            <>
              <ArticleGrid articles={articlesData.articles.map(article => ({
                id: article._id,
                slug: article.slug,
                title: article.title,
                excerpt: article.excerpt,
                coverImage: article.coverImage,
                publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
                author: article.author ? {
                  id: article.author.id,
                  name: article.author.name,
                  username: article.author.username,
                  avatar: article.author.avatar,
                } : {
                  id: '',
                  name: null,
                  username: 'unknown',
                  avatar: null,
                },
                tags: (article.tags || []).map((tag: string, index: number) => ({
                  id: `tag-${index}`,
                  name: tag,
                  slug: tag.toLowerCase().replace(/\s+/g, '-'),
                })),
              }))} />
              
              {/* Pagination */}
              {articlesData.totalPages && articlesData.totalPages > 1 && (
                <div className="mt-12">
                  <Pagination
                    currentPage={page}
                    totalPages={articlesData.totalPages}
                    basePath={`/${username}`}
                  />
                </div>
              )}

              {/* Results Summary */}
              <div className="mt-4 text-center text-sm text-gray-600">
                Showing {((page - 1) * 9) + 1} - {Math.min(page * 9, articlesData.total)} of {articlesData.total} articles
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-600 text-lg">
                {user.name || user.username} hasn&apos;t published any articles yet.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// Configure dynamic behavior
export const dynamic = 'force-dynamic'
export const dynamicParams = true