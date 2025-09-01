import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params;

    // Get all tips for the article
    const tips = await prisma.tip.findMany({
      where: {
        articleId,
        status: 'CONFIRMED',
      },
      include: {
        tipper: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate aggregated stats
    const stats = await prisma.tip.aggregate({
      where: {
        articleId,
        status: 'CONFIRMED',
      },
      _sum: {
        amountCents: true,
      },
      _count: true,
    });

    // Get unique tippers count
    const uniqueTippers = await prisma.tip.groupBy({
      by: ['tipperId'],
      where: {
        articleId,
        status: 'CONFIRMED',
      },
    });

    return NextResponse.json({
      tips: tips.map(tip => ({
        id: tip.id,
        amountCents: tip.amountCents,
        amountUsd: tip.amountUsd,
        tipper: {
          username: tip.tipper.username,
          name: tip.tipper.name,
          avatar: tip.tipper.avatar,
        },
        createdAt: tip.createdAt,
      })),
      stats: {
        totalTips: stats._count,
        totalAmountCents: stats._sum.amountCents || 0,
        totalAmountUsd: (stats._sum.amountCents || 0) / 100,
        uniqueTippers: uniqueTippers.length,
      },
    });
  } catch (error) {
    console.error('Error fetching article tips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tips' },
      { status: 500 }
    );
  }
}