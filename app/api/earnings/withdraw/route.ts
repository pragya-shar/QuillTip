import {
  // NextRequest,
  NextResponse,
} from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stellarClient } from '@/lib/stellar/client'

export async function POST() {
  // _req: NextRequest
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

    // Check if user has a Stellar address
    if (!user.stellarAddress) {
      return NextResponse.json(
        { error: 'Stellar wallet not configured' },
        { status: 400 }
      )
    }

    // Get author earnings
    const earnings = await prisma.authorEarnings.findUnique({
      where: { authorId: user.id },
    })

    if (!earnings || earnings.pendingAmountCents === 0) {
      return NextResponse.json(
        { error: 'No earnings to withdraw' },
        { status: 400 }
      )
    }

    // Minimum withdrawal amount (e.g., $1)
    const MINIMUM_WITHDRAWAL_CENTS = 100
    if (earnings.pendingAmountCents < MINIMUM_WITHDRAWAL_CENTS) {
      return NextResponse.json(
        {
          error: 'Minimum withdrawal amount is $1.00',
          currentBalance: earnings.pendingAmountCents / 100,
        },
        { status: 400 }
      )
    }

    // For POC, mock the withdrawal
    const withdrawalResult = await stellarClient.withdrawEarnings()

    if (!withdrawalResult.success) {
      return NextResponse.json(
        { error: 'Withdrawal failed', details: withdrawalResult.error },
        { status: 500 }
      )
    }

    // Update earnings to reflect withdrawal
    const updatedEarnings = await prisma.authorEarnings.update({
      where: { authorId: user.id },
      data: {
        pendingAmountCents: 0,
        pendingAmountStroops: '0',
        lastWithdrawal: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      withdrawal: {
        amountCents: earnings.pendingAmountCents,
        amountUsd: earnings.pendingAmountCents / 100,
        transactionHash: withdrawalResult.hash,
        timestamp: new Date(),
      },
      newBalance: {
        pendingAmountCents: updatedEarnings.pendingAmountCents,
        pendingAmountUsd: updatedEarnings.pendingAmountCents / 100,
      },
    })
  } catch (error) {
    console.error('Withdrawal error:', error)
    return NextResponse.json(
      { error: 'Failed to process withdrawal' },
      { status: 500 }
    )
  }
}
