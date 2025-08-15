import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    // Get the article to verify ownership
    const article = await prisma.article.findFirst({
      where: {
        id: params.id,
        authorId: user.id,
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found or unauthorized' },
        { status: 404 }
      );
    }

    // Get all versions for this article
    const versions = await prisma.draftVersion.findMany({
      where: {
        articleId: params.id,
      },
      orderBy: {
        version: 'desc'
      },
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        version: true,
        createdAt: true
      }
    });

    // Also include the current version
    const currentVersion = {
      id: 'current',
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      version: 'current',
      createdAt: article.updatedAt
    };

    return NextResponse.json({
      current: currentVersion,
      versions: versions
    });
  } catch (error) {
    console.error('Version fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}