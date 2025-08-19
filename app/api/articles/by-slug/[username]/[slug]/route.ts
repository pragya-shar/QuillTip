import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/articles/by-slug/[username]/[slug] - Get single article by username and slug
export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string; slug: string }> }
) {
  try {
    const { username, slug } = await params;

    // Get article with author and tags
    const article = await prisma.article.findFirst({
      where: { 
        slug,
        author: {
          username
        },
        published: true // Only return published articles
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
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
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