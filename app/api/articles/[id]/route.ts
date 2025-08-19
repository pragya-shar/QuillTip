import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for article update
const updateArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
  content: z.any().optional(), // TipTap JSON content
  excerpt: z.string().nullable().optional(),
  coverImage: z.string().url().nullable().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

// GET /api/articles/[id] - Get single article by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get article with author and tags
    const article = await prisma.article.findUnique({
      where: { id },
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

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // If article is not published, only author can view it
    if (!article.published) {
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.email) {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user || user.id !== article.authorId) {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Article fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PUT /api/articles/[id] - Update article
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateArticleSchema.parse(body);

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

    // Check if article exists and belongs to user
    const existingArticle = await prisma.article.findFirst({
      where: {
        id,
        authorId: user.id,
      },
      include: {
        tags: true,
      },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found or unauthorized' },
        { status: 404 }
      );
    }

    // Process tags if provided
    let tagConnections = undefined;
    if (validatedData.tags !== undefined) {
      // Disconnect all existing tags
      await prisma.article.update({
        where: { id },
        data: {
          tags: {
            set: [], // Disconnect all tags
          },
        },
      });

      // Create new tag connections
      const newTagConnections = [];
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
            update: {},
          });

          newTagConnections.push({ slug: tagSlug });
        }
      }
      tagConnections = { connect: newTagConnections };
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    
    if (validatedData.title !== undefined) {
      updateData.title = validatedData.title;
      // Generate new slug if title changed
      updateData.slug = generateSlug(validatedData.title);
    }
    
    if (validatedData.content !== undefined) {
      updateData.content = validatedData.content;
    }
    
    if (validatedData.excerpt !== undefined) {
      updateData.excerpt = validatedData.excerpt || null;
    }
    
    if (validatedData.coverImage !== undefined) {
      updateData.coverImage = validatedData.coverImage || null;
    }
    
    // Handle publish/unpublish
    if (validatedData.published !== undefined) {
      updateData.published = validatedData.published;
      
      // If publishing for the first time, set publishedAt
      if (validatedData.published && !existingArticle.published) {
        updateData.publishedAt = new Date();
      }
      // If unpublishing, clear publishedAt
      else if (!validatedData.published && existingArticle.published) {
        updateData.publishedAt = null;
      }
    }
    
    if (tagConnections) {
      updateData.tags = tagConnections;
    }

    // Update the article
    const updatedArticle = await prisma.article.update({
      where: { id },
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
    });

    return NextResponse.json({
      success: true,
      article: {
        id: updatedArticle.id,
        slug: updatedArticle.slug,
        title: updatedArticle.title,
        content: updatedArticle.content,
        excerpt: updatedArticle.excerpt,
        coverImage: updatedArticle.coverImage,
        published: updatedArticle.published,
        publishedAt: updatedArticle.publishedAt,
        author: updatedArticle.author,
        tags: updatedArticle.tags,
        createdAt: updatedArticle.createdAt,
        updatedAt: updatedArticle.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Article update error:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[id] - Delete article
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

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

    // Check if article exists and belongs to user
    const existingArticle = await prisma.article.findFirst({
      where: {
        id,
        authorId: user.id,
      },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the article
    await prisma.article.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    console.error('Article delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}

// PATCH /api/articles/[id]/publish - Toggle publish status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { published } = body;

    if (typeof published !== 'boolean') {
      return NextResponse.json(
        { error: 'Published status must be a boolean' },
        { status: 400 }
      );
    }

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

    // Check if article exists and belongs to user
    const existingArticle = await prisma.article.findFirst({
      where: {
        id,
        authorId: user.id,
      },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update publish status
    const updatedArticle = await prisma.article.update({
      where: { id },
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
    });

    return NextResponse.json({
      success: true,
      article: {
        id: updatedArticle.id,
        slug: updatedArticle.slug,
        title: updatedArticle.title,
        published: updatedArticle.published,
        publishedAt: updatedArticle.publishedAt,
        author: updatedArticle.author,
        tags: updatedArticle.tags,
      },
    });
  } catch (error) {
    console.error('Publish toggle error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle publish status' },
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