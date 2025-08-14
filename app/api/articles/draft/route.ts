import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const draftSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  content: z.any(), // TipTap JSON content
  excerpt: z.string().optional(),
});

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
    const validatedData = draftSchema.parse(body);

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

    let article;

    if (validatedData.id) {
      // Update existing draft
      article = await prisma.article.findFirst({
        where: {
          id: validatedData.id,
          authorId: user.id,
        },
      });

      if (!article) {
        return NextResponse.json(
          { error: 'Article not found or unauthorized' },
          { status: 404 }
        );
      }

      article = await prisma.article.update({
        where: { id: validatedData.id },
        data: {
          title: validatedData.title,
          content: validatedData.content,
          excerpt: validatedData.excerpt,
          slug: generateSlug(validatedData.title),
        },
      });
    } else {
      // Create new draft
      article = await prisma.article.create({
        data: {
          title: validatedData.title,
          content: validatedData.content,
          excerpt: validatedData.excerpt,
          slug: generateSlug(validatedData.title),
          published: false,
          authorId: user.id,
        },
      });
    }

    return NextResponse.json({
      id: article.id,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      version: 1, // We'll implement versioning in the next task
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Draft save error:', error);
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('id');

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const article = await prisma.article.findFirst({
      where: {
        id: articleId,
        authorId: user.id,
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: article.id,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      published: article.published,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Draft fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch draft' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('id');

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete the article only if it belongs to the user
    const deleted = await prisma.article.deleteMany({
      where: {
        id: articleId,
        authorId: user.id,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Article not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Draft delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete draft' },
      { status: 500 }
    );
  }
}

function generateSlug(title: string): string {
  const timestamp = Date.now();
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
  
  return `${titleSlug}-${timestamp}`;
}