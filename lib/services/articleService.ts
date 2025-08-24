import { z } from 'zod'
import prisma from '../prisma'

// Validation schemas
export const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.any(), // TipTap JSON content
  excerpt: z.string().optional().nullable(),
  coverImage: z.string().url().optional().nullable().or(z.literal('')),
  tags: z.array(z.string()).optional().default([]),
  published: z.boolean().default(false),
})

export const updateArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
  content: z.any().optional(), // TipTap JSON content
  excerpt: z.string().nullable().optional(),
  coverImage: z.string().url().nullable().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
})

export const listArticlesQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  tag: z.string().optional(),
  author: z.string().optional(),
  search: z.string().optional(),
})

// Types
export type CreateArticleData = z.infer<typeof createArticleSchema>
export type UpdateArticleData = z.infer<typeof updateArticleSchema>
export type ListArticlesQuery = z.infer<typeof listArticlesQuerySchema>

// Helper functions
export function generateSlug(title: string): string {
  const timestamp = Date.now()
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)
  
  return `${titleSlug}-${timestamp}`
}

export function generateTagSlug(tagName: string): string {
  return tagName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Article service functions
export async function processTagConnections(tags: string[]) {
  const tagConnections = []
  
  if (tags && tags.length > 0) {
    for (const tagName of tags) {
      if (tagName.trim()) {
        const tagSlug = generateTagSlug(tagName)
        
        // Create tag if it doesn't exist
        await prisma.tag.upsert({
          where: { slug: tagSlug },
          create: {
            name: tagName.trim(),
            slug: tagSlug,
          },
          update: {}, // No update needed if tag exists
        })

        tagConnections.push({ slug: tagSlug })
      }
    }
  }
  
  return tagConnections
}

export async function createArticle(authorId: string, data: CreateArticleData) {
  const validatedData = createArticleSchema.parse(data)
  
  // Process tags
  const tagConnections = await processTagConnections(validatedData.tags)
  
  // Generate unique slug
  const slug = generateSlug(validatedData.title)
  
  // Create the article
  const article = await prisma.article.create({
    data: {
      title: validatedData.title,
      content: validatedData.content,
      excerpt: validatedData.excerpt || null,
      coverImage: validatedData.coverImage || null,
      slug: slug,
      published: validatedData.published,
      publishedAt: validatedData.published ? new Date() : null,
      authorId: authorId,
      tags: {
        connect: tagConnections,
      },
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },
      tags: true,
    },
  })
  
  return article
}

export async function updateArticle(articleId: string, authorId: string, data: UpdateArticleData) {
  const validatedData = updateArticleSchema.parse(data)
  
  // Check if article exists and belongs to user
  const existingArticle = await prisma.article.findFirst({
    where: {
      id: articleId,
      authorId: authorId,
    },
    include: {
      tags: true,
    },
  })

  if (!existingArticle) {
    throw new Error('Article not found or unauthorized')
  }

  // Process tags if provided
  let tagConnections = undefined
  if (validatedData.tags !== undefined) {
    // Disconnect all existing tags
    await prisma.article.update({
      where: { id: articleId },
      data: {
        tags: {
          set: [], // Disconnect all tags
        },
      },
    })

    // Create new tag connections
    const newTagConnections = await processTagConnections(validatedData.tags)
    tagConnections = { connect: newTagConnections }
  }

  // Prepare update data
  const updateData: Record<string, unknown> = {}
  
  if (validatedData.title !== undefined) {
    updateData.title = validatedData.title
    // Keep the existing slug - don't regenerate it
  }
  
  if (validatedData.content !== undefined) {
    updateData.content = validatedData.content
  }
  
  if (validatedData.excerpt !== undefined) {
    updateData.excerpt = validatedData.excerpt || null
  }
  
  if (validatedData.coverImage !== undefined) {
    updateData.coverImage = validatedData.coverImage || null
  }
  
  // Handle publish/unpublish
  if (validatedData.published !== undefined) {
    updateData.published = validatedData.published
    
    // If publishing for the first time, set publishedAt
    if (validatedData.published && !existingArticle.published) {
      updateData.publishedAt = new Date()
    }
    // If unpublishing, clear publishedAt
    else if (!validatedData.published && existingArticle.published) {
      updateData.publishedAt = null
    }
  }
  
  if (tagConnections) {
    updateData.tags = tagConnections
  }

  // Update the article
  const updatedArticle = await prisma.article.update({
    where: { id: articleId },
    data: updateData,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },
      tags: true,
    },
  })

  return updatedArticle
}

export async function deleteArticle(articleId: string, authorId: string) {
  // Check if article exists and belongs to user
  const existingArticle = await prisma.article.findFirst({
    where: {
      id: articleId,
      authorId: authorId,
    },
  })

  if (!existingArticle) {
    throw new Error('Article not found or unauthorized')
  }

  // Delete the article
  await prisma.article.delete({
    where: { id: articleId },
  })

  return { success: true, message: 'Article deleted successfully' }
}

export async function getArticleById(articleId: string, userId?: string) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },
      tags: true,
    },
  })

  if (!article) {
    throw new Error('Article not found')
  }

  // If article is not published, only author can view it
  if (!article.published) {
    if (!userId || userId !== article.authorId) {
      throw new Error('Article not found')
    }
  }

  return article
}

export async function listArticles(query: ListArticlesQuery) {
  const validatedQuery = listArticlesQuerySchema.parse(query)
  const { page, limit, tag, author, search } = validatedQuery
  
  // Build where clause
  const where: Record<string, unknown> = {
    published: true,
  }

  if (tag) {
    where.tags = {
      some: {
        slug: tag,
      },
    }
  }

  if (author) {
    where.author = {
      username: author,
    }
  }

  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        excerpt: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ]
  }

  // Get total count
  const totalCount = await prisma.article.count({ where })

  // Get articles with pagination
  const articles = await prisma.article.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      publishedAt: 'desc',
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },
      tags: true,
    },
  })

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit)
  const hasNextPage = page < totalPages
  const hasPreviousPage = page > 1

  return {
    articles,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },
  }
}

export async function togglePublishStatus(articleId: string, authorId: string, published: boolean) {
  // Check if article exists and belongs to user
  const existingArticle = await prisma.article.findFirst({
    where: {
      id: articleId,
      authorId: authorId,
    },
  })

  if (!existingArticle) {
    throw new Error('Article not found or unauthorized')
  }

  // Update publish status
  const updatedArticle = await prisma.article.update({
    where: { id: articleId },
    data: {
      published,
      publishedAt: published ? (existingArticle.publishedAt || new Date()) : null,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },
      tags: true,
    },
  })

  return updatedArticle
}