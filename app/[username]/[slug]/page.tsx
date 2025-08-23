import { notFound } from 'next/navigation'
import ArticleDisplay from '@/components/articles/ArticleDisplay'
import AppNavigation from '@/components/layout/AppNavigation'
import { JSONContent } from '@tiptap/react'
import prisma from '@/lib/prisma'

interface ArticlePageProps {
  params: Promise<{
    username: string
    slug: string
  }>
}

async function getArticle(username: string, slug: string) {
  try {
    console.log(`Fetching article: username=${username}, slug=${slug}`)
    
    // Add connection retry logic for production reliability
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const article = await prisma.article.findFirst({
          where: { 
            slug,
            author: {
              username
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
          console.log(`Article not found: username=${username}, slug=${slug}`)
          return null
        }

        console.log(`Article found: ${article.title}`)
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
      } catch (dbError) {
        console.error(`Database error (attempt ${retryCount + 1}):`, dbError)
        retryCount++;
        if (retryCount >= maxRetries) {
          throw dbError;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    return null; // This will never be reached due to the retry logic above
  } catch (error) {
    console.error('Failed to fetch article:', error)
    console.error('Username:', username, 'Slug:', slug)
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

// Configure dynamic behavior for production
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0 // Disable revalidation for dynamic routes
export const runtime = 'nodejs' // Ensure Node.js runtime for database connections