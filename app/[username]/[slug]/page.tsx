import { notFound } from 'next/navigation'
import ArticleDisplay from '@/components/articles/ArticleDisplay'
import AppNavigation from '@/components/layout/AppNavigation'
import { JSONContent } from '@tiptap/react'

interface ArticlePageProps {
  params: Promise<{
    username: string
    slug: string
  }>
}

async function getArticle(username: string, slug: string) {
  try {
    // Import prisma directly instead of using fetch during build
    const { prisma } = await import('@/lib/prisma')
    
    const article = await prisma.article.findFirst({
      where: { 
        slug: {
          equals: slug,
          mode: 'insensitive'
        },
        author: {
          username: {
            equals: username,
            mode: 'insensitive'
          }
        },
        published: true
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
        tags: true,
      },
    })

    if (!article) {
      console.log(`Article not found: ${username}/${slug}`)
      return null
    }

    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      content: article.content as JSONContent,
      excerpt: article.excerpt,
      coverImage: article.coverImage,
      publishedAt: article.publishedAt,
      author: article.author,
      tags: article.tags,
    }
  } catch (error) {
    console.error('Failed to fetch article:', error)
    console.error('Error details:', {
      username,
      slug,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return null
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { username, slug } = await params
  const article = await getArticle(username, slug)

  if (!article) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <AppNavigation />
      <main className="pt-20">
        <ArticleDisplay article={article} />
      </main>
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ArticlePageProps) {
  const { username, slug } = await params
  const article = await getArticle(username, slug)

  if (!article) {
    return {
      title: 'Article Not Found - QuillTip',
    }
  }

  return {
    title: `${article.title} - ${article.author.name || article.author.username} | QuillTip`,
    description: article.excerpt || `Read ${article.title} by ${article.author.name || article.author.username} on QuillTip`,
    openGraph: {
      title: article.title,
      description: article.excerpt || `Read ${article.title} by ${article.author.name || article.author.username}`,
      images: article.coverImage ? [article.coverImage] : [],
      type: 'article',
      authors: [article.author.name || article.author.username],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || `Read ${article.title} by ${article.author.name || article.author.username}`,
      images: article.coverImage ? [article.coverImage] : [],
    },
  }
}

// Enable dynamic rendering when needed
export const dynamic = 'force-dynamic'
export const revalidate = 60 // Revalidate every minute for published content