import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Beacon API doesn't support authentication headers well,
    // so we need to rely on session cookies
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Quick save without validation for beacon API
    if (body.id) {
      // Update existing
      await prisma.article.updateMany({
        where: {
          id: body.id,
          authorId: user.id,
        },
        data: {
          title: body.title || 'Untitled',
          content: body.content,
          excerpt: body.excerpt,
        },
      });
    } else {
      // Create new
      await prisma.article.create({
        data: {
          title: body.title || 'Untitled',
          content: body.content,
          excerpt: body.excerpt,
          slug: `draft-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          published: false,
          authorId: user.id,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Beacon save error:', error);
    // Beacon API expects 200 OK even on error
    return NextResponse.json({ success: false });
  }
}