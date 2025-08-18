import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { createArticleSchema } from '@/lib/validations/article';
import { 
  generateUniqueSlug, 
  handleTags, 
  validateTipTapContent, 
  generateExcerptFromContent 
} from '@/lib/utils/article';

/**
 * Article Creation API
 * 
 * POST /api/articles - Create a new article
 * Handles both draft and published articles with proper validation,
 * slug generation, tag association, and error handling.
 */


export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createArticleSchema.parse(body);

    // Additional TipTap content validation
    if (!validateTipTapContent(validatedData.content)) {
      return NextResponse.json(
        { error: 'Invalid TipTap content structure' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate or validate slug
    let slug: string;
    if (validatedData.slug) {
      // Check if provided slug is unique
      const existingSlug = await prisma.article.findUnique({
        where: { slug: validatedData.slug },
      });

      if (existingSlug) {
        return NextResponse.json(
          { error: 'Slug already exists', field: 'slug' },
          { status: 409 }
        );
      }
      slug = validatedData.slug;
    } else {
      // Generate unique slug from title
      slug = await generateUniqueSlug(validatedData.title);
    }

    // Handle tags
    const tagConnections = await handleTags(validatedData.tags || []);

    // Prepare article data
    const now = new Date();
    const publishedAt = validatedData.published 
      ? (validatedData.publishedAt ? new Date(validatedData.publishedAt) : now)
      : null;

    // Create article with transaction for consistency
    const article = await prisma.article.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        excerpt: validatedData.excerpt || generateExcerptFromContent(validatedData.content),
        coverImage: validatedData.coverImage || null,
        slug,
        published: validatedData.published,
        publishedAt,
        authorId: user.id,
        // Connect tags using the tag IDs
        tags: {
          connect: tagConnections,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Return created article
    return NextResponse.json({
      id: article.id,
      slug: article.slug,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      coverImage: article.coverImage,
      published: article.published,
      publishedAt: article.publishedAt?.toISOString() || null,
      author: article.author,
      tags: article.tags,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    }, { status: 201 });

  } catch (error) {
    console.error('Article creation error:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.reduce((acc, issue) => {
        const field = issue.path.join('.');
        acc[field] = issue.message;
        return acc;
      }, {} as Record<string, string>);

      return NextResponse.json(
        { 
          error: 'Validation failed',
          fields: fieldErrors,
          details: error.issues 
        },
        { status: 400 }
      );
    }

    // Handle Prisma unique constraint violations
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint failed on the constraint: `articles_slug_key`')) {
        return NextResponse.json(
          { error: 'Slug already exists', field: 'slug' },
          { status: 409 }
        );
      }

      if (error.message.includes('Cannot generate slug from title')) {
        return NextResponse.json(
          { error: 'Invalid title - cannot generate slug' },
          { status: 400 }
        );
      }
    }

    // Generic server error
    return NextResponse.json(
      { error: 'Internal server error - Failed to create article' },
      { status: 500 }
    );
  }
}