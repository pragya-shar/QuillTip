import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all NFTs owned by the user
    const ownedNFTs = await prisma.articleNFT.findMany({
      where: { currentOwner: session.user.id },
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
        minter: {
          select: {
            id: true,
            username: true,
            name: true,
          }
        }
      },
      orderBy: { mintedAt: 'desc' }
    })

    // Get all NFTs minted by the user (but not currently owned)
    const mintedNFTs = await prisma.articleNFT.findMany({
      where: { 
        mintedBy: session.user.id,
        currentOwner: { not: session.user.id }
      },
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
            }
          }
        },
        owner: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          }
        }
      },
      orderBy: { mintedAt: 'desc' }
    })

    // Format the response
    const formatNFT = (nft: {
      id: string
      tokenId: string
      article: {
        id: string
        title: string
        slug: string
        author: { id: string; username: string | null; name: string | null; avatar: string | null }
        coverImage: string | null
        tips?: Array<{ amountCents: number }>
      }
      mintedAt: Date
      totalTipsAtMint: number
      mintedBy: string
      owner?: { id: string; username: string | null; name: string | null; avatar: string | null }
    }) => ({
      id: nft.id,
      tokenId: nft.tokenId,
      article: {
        id: nft.article.id,
        title: nft.article.title,
        slug: nft.article.slug,
        author: nft.article.author,
        coverImage: nft.article.coverImage,
      },
      mintedAt: nft.mintedAt,
      totalTipsAtMint: nft.totalTipsAtMint / 100,
      currentTotalTips: nft.article.tips 
        ? nft.article.tips.reduce((sum: number, tip) => sum + tip.amountCents, 0) / 100
        : nft.totalTipsAtMint / 100,
    })

    return NextResponse.json({
      owned: ownedNFTs.map(formatNFT),
      minted: mintedNFTs.map((nft) => ({
        ...formatNFT(nft),
        currentOwner: nft.owner,
      })),
      stats: {
        totalOwned: ownedNFTs.length,
        totalMinted: mintedNFTs.length + ownedNFTs.filter(n => n.mintedBy === session.user.id).length,
        totalValue: ownedNFTs.reduce((sum, nft) => {
          const tips = nft.article.tips || []
          return sum + tips.reduce((tipSum: number, tip) => tipSum + tip.amountCents, 0)
        }, 0) / 100,
      }
    })
  } catch (error) {
    console.error('Error fetching owned NFTs:', error)
    return NextResponse.json({ error: 'Failed to fetch NFTs' }, { status: 500 })
  }
}