import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stellarClient } from '@/lib/stellar/client';
import { z } from 'zod';

const tipSchema = z.object({
  articleId: z.string().min(1),
  amountCents: z.number().min(1).max(10000), // Max $100 for POC
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = tipSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error },
        { status: 400 }
      );
    }

    const { articleId, amountCents } = validation.data;

    // Get tipper and article details
    const [tipper, article] = await Promise.all([
      prisma.user.findUnique({
        where: { email: session.user.email },
      }),
      prisma.article.findUnique({
        where: { id: articleId },
        include: { author: true },
      }),
    ]);

    if (!tipper) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    if (article.authorId === tipper.id) {
      return NextResponse.json(
        { error: 'Cannot tip your own article' },
        { status: 400 }
      );
    }

    // For POC, use mock tipping (no real XLM transfer)
    const tipReceipt = await stellarClient.tipArticle({
      tipper: tipper.stellarAddress || tipper.id,
      articleId: article.id,
      authorAddress: article.author.stellarAddress || article.author.id,
      amountCents,
    });

    // Convert stroops to string for database storage
    const amountStroops = tipReceipt.amountSent.toString();
    const platformFee = tipReceipt.platformFee.toString();
    const authorShare = tipReceipt.authorReceived.toString();

    // Create tip record in database
    const tip = await prisma.tip.create({
      data: {
        articleId,
        tipperId: tipper.id,
        authorId: article.authorId,
        amountCents,
        amountStroops,
        amountUsd: amountCents / 100,
        stellarTxId: tipReceipt.transactionHash,
        contractTipId: tipReceipt.tipId,
        platformFee,
        authorShare,
        status: 'CONFIRMED', // Mock as confirmed for POC
        processedAt: new Date(),
      },
    });

    // Update author earnings
    await prisma.authorEarnings.upsert({
      where: { authorId: article.authorId },
      create: {
        authorId: article.authorId,
        totalTips: 1,
        totalEarnedCents: Math.floor(amountCents * 0.975), // 97.5% after fee
        totalEarnedStroops: authorShare,
        totalEarnedUsd: Math.floor(amountCents * 0.975) / 100,
        pendingAmountCents: Math.floor(amountCents * 0.975),
        pendingAmountStroops: authorShare,
      },
      update: {
        totalTips: { increment: 1 },
        totalEarnedCents: { increment: Math.floor(amountCents * 0.975) },
        totalEarnedUsd: { increment: Math.floor(amountCents * 0.975) / 100 },
        pendingAmountCents: { increment: Math.floor(amountCents * 0.975) },
      },
    });

    return NextResponse.json({
      success: true,
      tip: {
        id: tip.id,
        amountCents: tip.amountCents,
        amountUsd: tip.amountUsd,
        status: tip.status,
        createdAt: tip.createdAt,
      },
      receipt: tipReceipt,
    });
  } catch (error) {
    console.error('Tip creation error:', error);
    return NextResponse.json(
      { error: 'Failed to process tip' },
      { status: 500 }
    );
  }
}