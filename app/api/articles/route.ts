import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for article creation
const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.any(), // TipTap JSON content
  excerpt: z.string().optional().nullable(),
  coverImage: z.string().url().optional().nullable().or(z.literal('')),
  tags: z.array(z.string()).optional().default([]),
  published: z.boolean().default(false),
});

// POST /api/articles - Create new article
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createArticleSchema.parse(body);

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Process tags - create if they don't exist
    const tagConnections = [];
    if (validatedData.tags && validatedData.tags.length > 0) {
      for (const tagName of validatedData.tags) {
        if (tagName.trim()) {
          const tagSlug = tagName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          
          // Create tag if it doesn't exist
          await prisma.tag.upsert({
            where: { slug: tagSlug },
            create: {
              name: tagName.trim(),
              slug: tagSlug,
            },
            update: {}, // No update needed if tag exists
          });

          tagConnections.push({ slug: tagSlug });
        }
      }
    }

    // Generate unique slug
    const slug = generateSlug(validatedData.title);

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
        authorId: user.id,
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
    });

    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        slug: article.slug,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        coverImage: article.coverImage,
        published: article.published,
        publishedAt: article.publishedAt,
        author: article.author,
        tags: article.tags,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    // Check for unique constraint violation (duplicate slug)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      // Try again with a different slug
      return NextResponse.json(
        { error: 'Article with similar title already exists. Please modify the title.' },
        { status: 409 }
      );
    }

    console.error('Article creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}

// GET /api/articles - List published articles (with pagination)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const tag = searchParams.get('tag');
    const author = searchParams.get('author');
    
    // Build where clause
    const where: any = {
      published: true,
    };

    if (tag) {
      where.tags = {
        some: {
          slug: tag,
        },
      };
    }

    if (author) {
      where.author = {
        username: author,
      };
    }

    // Get total count
    const totalCount = await prisma.article.count({ where });

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
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      articles: articles.map(article => ({
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        coverImage: article.coverImage,
        published: article.published,
        publishedAt: article.publishedAt,
        author: article.author,
        tags: article.tags,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (error) {
    console.error('Articles fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// Helper function to generate unique slug
function generateSlug(title: string): string {
  const timestamp = Date.now();
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
  
  return `${titleSlug}-${timestamp}`;
}