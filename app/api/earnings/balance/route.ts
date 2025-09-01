import {
  // NextRequest,
  NextResponse,
} from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stellarClient } from '@/lib/stellar/client'

export async function GET() {
// _request: Request
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get author earnings from database
    const earnings = await prisma.authorEarnings.findUnique({
      where: { authorId: user.id },
    })

    // Get recent tips
    const recentTips = await prisma.tip.findMany({
      where: {
        authorId: user.id,
        status: 'CONFIRMED',
      },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        tipper: {
          select: {
            username: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    })

    // Get article-wise breakdown
    const articleStats = await prisma.tip.groupBy({
      by: ['articleId'],
      where: {
        authorId: user.id,
        status: 'CONFIRMED',
      },
      _sum: {
        amountCents: true,
      },
      _count: true,
    })

    // Fetch article details for the stats
    const articleIds = articleStats.map((stat) => stat.articleId)
    const articles = await prisma.article.findMany({
      where: {
        id: { in: articleIds },
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    })

    const articleStatsWithDetails = articleStats.map((stat) => {
      const article = articles.find((a) => a.id === stat.articleId)
      return {
        articleId: stat.articleId,
        title: article?.title || 'Unknown',
        slug: article?.slug || '',
        totalTips: stat._count,
        totalAmountCents: stat._sum.amountCents || 0,
        totalAmountUsd: (stat._sum.amountCents || 0) / 100,
      }
    })

    // Get Stellar balance if user has a Stellar address
    let stellarBalance = null
    if (user.stellarAddress) {
      stellarBalance = await stellarClient.getBalance(user.stellarAddress)
    }

    return NextResponse.json({
      earnings: earnings
        ? {
            totalTips: earnings.totalTips,
            totalEarnedCents: earnings.totalEarnedCents,
            totalEarnedUsd: earnings.totalEarnedUsd.toNumber(),
            pendingAmountCents: earnings.pendingAmountCents,
            pendingAmountUsd: earnings.pendingAmountCents / 100,
            lastWithdrawal: earnings.lastWithdrawal,
          }
        : {
            totalTips: 0,
            totalEarnedCents: 0,
            totalEarnedUsd: 0,
            pendingAmountCents: 0,
            pendingAmountUsd: 0,
            lastWithdrawal: null,
          },
      recentTips: recentTips.map((tip) => ({
        id: tip.id,
        amountCents: tip.amountCents,
        amountUsd: tip.amountUsd,
        article: tip.article,
        tipper: tip.tipper,
        createdAt: tip.createdAt,
      })),
      articleStats: articleStatsWithDetails.sort(
        (a, b) => (b.totalAmountCents || 0) - (a.totalAmountCents || 0)
      ),
      stellarBalance,
    })
  } catch (error) {
    console.error('Error fetching earnings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch earnings' },
      { status: 500 }
    )
  }
}
