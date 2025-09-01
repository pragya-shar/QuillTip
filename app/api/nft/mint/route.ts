import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const mintSchema = z.object({
  articleId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { articleId } = mintSchema.parse(body)

    // Get article with author and tips
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        author: true,
        tips: {
          where: { status: 'CONFIRMED' }
        },
        nft: true,
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Check if user is the author
    if (article.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Only the author can mint the NFT' }, { status: 403 })
    }

    // Check if already minted
    if (article.nft) {
      return NextResponse.json({ error: 'Article already minted as NFT' }, { status: 400 })
    }

    // Calculate total tips
    const totalTipsCents = article.tips.reduce((sum, tip) => sum + tip.amountCents, 0)
    
    // Check if meets threshold (default $10 = 1000 cents)
    const tipThreshold = 1000 // $10 in cents
    if (totalTipsCents < tipThreshold) {
      return NextResponse.json({ 
        error: `Article must have at least $${tipThreshold / 100} in tips to mint as NFT`,
        currentTips: totalTipsCents / 100,
        threshold: tipThreshold / 100
      }, { status: 400 })
    }

    // For POC, we'll simulate the contract interaction
    // In production, this would call the actual Soroban contract
    const tokenId = `NFT_${articleId}_${Date.now()}`
    const metadataUrl = `${process.env.NEXT_PUBLIC_APP_URL}/articles/${article.slug}`

    // Create NFT record in database
    const nft = await prisma.articleNFT.create({
      data: {
        articleId,
        tokenId,
        metadataUrl,
        mintedBy: session.user.id,
        currentOwner: session.user.id,
        tipThreshold,
        totalTipsAtMint: totalTipsCents,
        contractAddress: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || 'testnet_contract',
      },
      include: {
        article: {
          include: {
            author: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      nft: {
        id: nft.id,
        tokenId: nft.tokenId,
        article: {
          id: nft.article.id,
          title: nft.article.title,
          slug: nft.article.slug,
        },
        owner: session.user.id,
        mintedAt: nft.mintedAt,
        totalTipsAtMint: nft.totalTipsAtMint / 100, // Convert to dollars
      }
    })
  } catch (error) {
    console.error('NFT minting error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to mint NFT' }, { status: 500 })
  }
}