import { notFound } from 'next/navigation'
import AppNavigation from '@/components/layout/AppNavigation'
import ProfileHeader from '@/components/profile/ProfileHeader'
import ArticleGrid from '@/components/articles/ArticleGrid'
import Pagination from '@/components/articles/Pagination'
import prisma from '@/lib/prisma'

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
  searchParams: Promise<{
    page?: string
  }>
}

async function getUserProfile(username: string, page: number = 1) {
  try {
    const limit = 9
    const skip = (page - 1) * limit

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            articles: {
              where: {
                published: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return null
    }

    // Get total article count
    const totalCount = user._count.articles

    // Fetch user's published articles
    const articles = await prisma.article.findMany({
      where: {
        authorId: user.id,
        published: true
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true,
        tags: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      skip,
      take: limit
    })

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit)

    return {
      user: {
        ...user,
        articleCount: totalCount
      },
      articles,
      pagination: {
        page,
        totalPages,
        totalCount
      }
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const { username } = await params
  const { page = '1' } = await searchParams
  const currentPage = parseInt(page, 10) || 1

  const profileData = await getUserProfile(username, currentPage)

  if (!profileData) {
    notFound()
  }

  const { user, articles, pagination } = profileData

  return (
    <div className="min-h-screen bg-brand-cream">
      <AppNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Profile Header */}
        <div className="mb-8">
          <ProfileHeader user={user} />
        </div>

        {/* Articles Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Articles by {user.name || user.username}
          </h2>

          {articles.length > 0 ? (
            <>
              <ArticleGrid articles={articles} />
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-12">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    basePath={`/${username}`}
                  />
                </div>
              )}

              {/* Results Summary */}
              <div className="mt-4 text-center text-sm text-gray-600">
                Showing {((pagination.page - 1) * 9) + 1} - {Math.min(pagination.page * 9, pagination.totalCount)} of {pagination.totalCount} articles
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

// Generate metadata for SEO
export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params
  
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      name: true,
      username: true,
      bio: true,
      avatar: true
    }
  })

  if (!user) {
    return {
      title: 'User Not Found - QuillTip',
    }
  }

  const displayName = user.name || user.username

  return {
    title: `${displayName} (@${user.username}) - QuillTip`,
    description: user.bio || `Read articles by ${displayName} on QuillTip`,
    openGraph: {
      title: `${displayName} - QuillTip`,
      description: user.bio || `Read articles by ${displayName} on QuillTip`,
      images: user.avatar ? [user.avatar] : [],
      type: 'profile',
      username: user.username,
    },
    twitter: {
      card: 'summary',
      title: `${displayName} (@${user.username})`,
      description: user.bio || `Read articles by ${displayName} on QuillTip`,
      images: user.avatar ? [user.avatar] : [],
    },
  }
}

// Configure dynamic behavior
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0