import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const { articleId } = await params

    // Get NFT info for article
    const nft = await prisma.articleNFT.findUnique({
      where: { articleId },
      include: {
        article: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true,
              }
            },
            tips: {
              where: { status: 'CONFIRMED' }
            }
          }
        },
        owner: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            stellarAddress: true,
          }
        },
        minter: {
          select: {
            id: true,
            username: true,
            name: true,
          }
        },
        transfers: {
          orderBy: { transferredAt: 'desc' },
          take: 10,
          include: {
            fromUser: {
              select: {
                id: true,
                username: true,
                name: true,
              }
            },
            toUser: {
              select: {
                id: true,
                username: true,
                name: true,
              }
            }
          }
        }
      }
    })

    if (!nft) {
      // Check if article exists and is eligible for minting
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        include: {
          tips: {
            where: { status: 'CONFIRMED' }
          }
        }
      })

      if (!article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 })
      }

      const totalTipsCents = article.tips.reduce((sum: number, tip) => sum + tip.amountCents, 0)
      const tipThreshold = 1000 // $10 in cents

      return NextResponse.json({
        minted: false,
        eligible: totalTipsCents >= tipThreshold,
        article: {
          id: article.id,
          title: article.title,
          slug: article.slug,
          totalTips: totalTipsCents / 100,
          threshold: tipThreshold / 100,
          progress: Math.min(100, (totalTipsCents / tipThreshold) * 100)
        }
      })
    }

    // Calculate current total tips
    const currentTotalTips = nft.article.tips.reduce((sum: number, tip) => sum + tip.amountCents, 0)

    return NextResponse.json({
      minted: true,
      nft: {
        id: nft.id,
        tokenId: nft.tokenId,
        metadataUrl: nft.metadataUrl,
        mintedAt: nft.mintedAt,
        totalTipsAtMint: nft.totalTipsAtMint / 100,
        currentTotalTips: currentTotalTips / 100,
        owner: nft.owner,
        minter: nft.minter,
        article: {
          id: nft.article.id,
          title: nft.article.title,
          slug: nft.article.slug,
          author: nft.article.author,
        },
        transferHistory: nft.transfers.map((transfer) => ({
          from: transfer.fromUser,
          to: transfer.toUser,
          date: transfer.transferredAt,
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching NFT:', error)
    return NextResponse.json({ error: 'Failed to fetch NFT data' }, { status: 500 })
  }
}