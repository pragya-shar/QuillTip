import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const transferSchema = z.object({
  tokenId: z.string(),
  toAddress: z.string(), // Can be username or user ID
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tokenId, toAddress } = transferSchema.parse(body)

    // Get NFT with current owner
    const nft = await prisma.articleNFT.findUnique({
      where: { tokenId },
      include: {
        owner: true,
        article: {
          include: {
            author: true
          }
        }
      }
    })

    if (!nft) {
      return NextResponse.json({ error: 'NFT not found' }, { status: 404 })
    }

    // Check ownership
    if (nft.currentOwner !== session.user.id) {
      return NextResponse.json({ error: 'You do not own this NFT' }, { status: 403 })
    }

    // Find recipient by username or ID
    const recipient = await prisma.user.findFirst({
      where: {
        OR: [
          { id: toAddress },
          { username: toAddress },
          { stellarAddress: toAddress }
        ]
      }
    })

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    if (recipient.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot transfer to yourself' }, { status: 400 })
    }

    // Create transfer record and update NFT owner
    const [transfer] = await prisma.$transaction([
      // Create transfer record
      prisma.nFTTransfer.create({
        data: {
          nftId: nft.id,
          fromAddress: session.user.id,
          toAddress: recipient.id,
          transactionId: `TRANSFER_${Date.now()}`, // Mock transaction ID for POC
        }
      }),
      // Update NFT owner
      prisma.articleNFT.update({
        where: { id: nft.id },
        data: { currentOwner: recipient.id }
      })
    ])

    return NextResponse.json({
      success: true,
      transfer: {
        id: transfer.id,
        from: session.user.id,
        to: recipient.id,
        tokenId: nft.tokenId,
        article: {
          id: nft.article.id,
          title: nft.article.title,
          slug: nft.article.slug,
        },
        transferredAt: transfer.transferredAt,
      }
    })
  } catch (error) {
    console.error('NFT transfer error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to transfer NFT' }, { status: 500 })
  }
}