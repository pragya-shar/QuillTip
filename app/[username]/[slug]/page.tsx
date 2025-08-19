import { notFound } from 'next/navigation'
import ArticleDisplay from '@/components/articles/ArticleDisplay'
import AppNavigation from '@/components/layout/AppNavigation'

interface ArticlePageProps {
  params: Promise<{
    username: string
    slug: string
  }>
}

async function getArticle(username: string, slug: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/articles/by-slug/${username}/${slug}`, {
      cache: 'no-store', // Always fetch fresh data for articles
    })
    
    if (!response.ok) {
      return null
    }
    
    return response.json()
  } catch (error) {
    console.error('Failed to fetch article:', error)
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