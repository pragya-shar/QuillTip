import ArticleCard from './ArticleCard'

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

interface ArticleGridProps {
  articles: Article[]
}

export default function ArticleGrid({ articles }: ArticleGridProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-sm mx-auto">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No articles found</h3>
          <p className="text-gray-500">
            Try adjusting your search or filters to find what you&apos;re looking for.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}