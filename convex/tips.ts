import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

// Get tips for an article
export const getArticleTips = query({
  args: {
    articleId: v.id("articles"),
  },
  handler: async (ctx, args) => {
    const tips = await ctx.db
      .query("tips")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .filter((q) => q.eq(q.field("status"), "CONFIRMED"))
      .order("desc")
      .collect();
    
    // Enrich with tipper data
    const enrichedTips = await Promise.all(
      tips.map(async (tip) => {
        const tipper = await ctx.db.get(tip.tipperId);
        return {
          ...tip,
          tipper: tipper ? {
            id: tipper._id,
            name: tipper.name,
            username: tipper.username,
            avatar: tipper.avatar,
          } : null,
        };
      })
    );
    
    return enrichedTips;
  },
});

// Get tip statistics for an article
export const getArticleTipStats = query({
  args: {
    articleId: v.id("articles"),
  },
  handler: async (ctx, args) => {
    const tips = await ctx.db
      .query("tips")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .filter((q) => q.eq(q.field("status"), "CONFIRMED"))
      .collect();
    
    const totalTips = tips.length;
    const totalAmountUsd = tips.reduce((sum, tip) => sum + tip.amountUsd, 0);
    const uniqueTippers = new Set(tips.map(tip => tip.tipperId)).size;
    
    return {
      totalTips,
      totalAmountUsd,
      uniqueTippers,
    };
  },
});

// Get user's sent tips
export const getUserSentTips = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const targetUserId = args.userId || await getAuthUserId(ctx);
    if (!targetUserId) return [];
    
    const tips = await ctx.db
      .query("tips")
      .withIndex("by_tipper", (q) => q.eq("tipperId", targetUserId))
      .order("desc")
      .collect();
    
    // Enrich with article data
    const enrichedTips = await Promise.all(
      tips.map(async (tip) => {
        const article = await ctx.db.get(tip.articleId);
        return {
          ...tip,
          article: article ? {
            id: article._id,
            title: article.title,
            slug: article.slug,
            authorUsername: article.authorUsername,
          } : null,
        };
      })
    );
    
    return enrichedTips;
  },
});

// Get user's received tips
export const getUserReceivedTips = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const targetUserId = args.userId || await getAuthUserId(ctx);
    if (!targetUserId) return [];
    
    const tips = await ctx.db
      .query("tips")
      .withIndex("by_author", (q) => q.eq("authorId", targetUserId))
      .filter((q) => q.eq(q.field("status"), "CONFIRMED"))
      .order("desc")
      .collect();
    
    // Enrich with tipper and article data
    const enrichedTips = await Promise.all(
      tips.map(async (tip) => {
        const [tipper, article] = await Promise.all([
          ctx.db.get(tip.tipperId),
          ctx.db.get(tip.articleId),
        ]);
        
        return {
          ...tip,
          tipper: tipper ? {
            id: tipper._id,
            name: tipper.name,
            username: tipper.username,
            avatar: tipper.avatar,
          } : null,
          article: article ? {
            id: article._id,
            title: article.title,
            slug: article.slug,
          } : null,
        };
      })
    );
    
    return enrichedTips;
  },
});

// Send tip mutation
export const sendTip = mutation({
  args: {
    articleId: v.id("articles"),
    amountUsd: v.number(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    
    const article = await ctx.db.get(args.articleId);
    if (!article) throw new Error("Article not found");
    
    const author = await ctx.db.get(article.authorId);
    if (!author) throw new Error("Author not found");
    
    // Validate amount
    if (args.amountUsd < 0.01 || args.amountUsd > 10000) {
      throw new Error("Invalid tip amount");
    }
    
    // Convert USD to cents for storage
    const amountCents = Math.round(args.amountUsd * 100);
    
    const now = Date.now();
    
    // Create tip record (initially pending)
    const tipId = await ctx.db.insert("tips", {
      articleId: args.articleId,
      articleTitle: article.title,
      articleSlug: article.slug,
      tipperId: userId,
      tipperName: user.name || user.username,
      tipperAvatar: user.avatar,
      authorId: article.authorId,
      authorName: author.name || author.username,
      authorAvatar: author.avatar,
      amountUsd: args.amountUsd,
      amountCents,
      message: args.message,
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
    });
    
    // In a real implementation, this would trigger a Stellar transaction
    // For now, we'll simulate success after a short delay
    await ctx.scheduler.runAfter(1000, api.tips.confirmTip, { tipId });
    
    return tipId;
  },
});

// Internal mutation to confirm tip
export const confirmTip = mutation({
  args: {
    tipId: v.id("tips"),
    stellarTxId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tip = await ctx.db.get(args.tipId);
    if (!tip) throw new Error("Tip not found");
    if (tip.status !== "PENDING") return;
    
    const now = Date.now();
    
    // Update tip status
    await ctx.db.patch(args.tipId, {
      status: "CONFIRMED",
      stellarTxId: args.stellarTxId || `mock_tx_${Date.now()}`,
      updatedAt: now,
    });
    
    // Update article stats
    const article = await ctx.db.get(tip.articleId);
    if (article) {
      await ctx.db.patch(tip.articleId, {
        tipCount: (article.tipCount || 0) + 1,
        totalTipsUsd: (article.totalTipsUsd || 0) + tip.amountUsd,
      });
    }
    
    // Update author earnings
    let earnings = await ctx.db
      .query("authorEarnings")
      .withIndex("by_user", (q) => q.eq("userId", tip.authorId))
      .first();
    
    if (!earnings) {
      // Create earnings record
      await ctx.db.insert("authorEarnings", {
        userId: tip.authorId,
        totalEarnedUsd: tip.amountUsd,
        totalEarnedCents: tip.amountCents,
        availableBalanceUsd: tip.amountUsd,
        availableBalanceCents: tip.amountCents,
        pendingBalanceUsd: 0,
        pendingBalanceCents: 0,
        withdrawnUsd: 0,
        withdrawnCents: 0,
        tipCount: 1,
        lastTipAt: now,
        monthlyEarnings: {
          [getMonthKey(now)]: tip.amountUsd,
        },
        topArticles: [
          {
            articleId: tip.articleId,
            title: tip.articleTitle,
            earnings: tip.amountUsd,
            tipCount: 1,
          },
        ],
        createdAt: now,
        updatedAt: now,
      });
    } else {
      // Update earnings record
      const monthKey = getMonthKey(now);
      const monthlyEarnings = {
        ...earnings.monthlyEarnings,
        [monthKey]: (earnings.monthlyEarnings?.[monthKey] || 0) + tip.amountUsd,
      };
      
      // Update top articles
      const topArticles = [...(earnings.topArticles || [])];
      const articleIndex = topArticles.findIndex(a => a.articleId === tip.articleId);
      
      if (articleIndex >= 0 && topArticles[articleIndex]) {
        topArticles[articleIndex].earnings += tip.amountUsd;
        topArticles[articleIndex].tipCount += 1;
      } else {
        topArticles.push({
          articleId: tip.articleId,
          title: tip.articleTitle,
          earnings: tip.amountUsd,
          tipCount: 1,
        });
      }
      
      // Sort and keep top 10
      topArticles.sort((a, b) => b.earnings - a.earnings);
      topArticles.splice(10);
      
      await ctx.db.patch(earnings._id, {
        totalEarnedUsd: earnings.totalEarnedUsd + tip.amountUsd,
        totalEarnedCents: earnings.totalEarnedCents + tip.amountCents,
        availableBalanceUsd: earnings.availableBalanceUsd + tip.amountUsd,
        availableBalanceCents: earnings.availableBalanceCents + tip.amountCents,
        tipCount: earnings.tipCount + 1,
        lastTipAt: now,
        monthlyEarnings,
        topArticles,
        updatedAt: now,
      });
    }
    
    // Update user stats
    const [tipper, author] = await Promise.all([
      ctx.db.get(tip.tipperId),
      ctx.db.get(tip.authorId),
    ]);
    
    if (tipper) {
      await ctx.db.patch(tip.tipperId, {
        tipsSentCount: (tipper.tipsSentCount || 0) + 1,
      });
    }
    
    if (author) {
      await ctx.db.patch(tip.authorId, {
        tipsReceivedCount: (author.tipsReceivedCount || 0) + 1,
      });
    }
    
    return { success: true };
  },
});

// Get author earnings
export const getAuthorEarnings = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const targetUserId = args.userId || await getAuthUserId(ctx);
    if (!targetUserId) return null;
    
    const earnings = await ctx.db
      .query("authorEarnings")
      .withIndex("by_user", (q) => q.eq("userId", targetUserId))
      .first();
    
    return earnings;
  },
});

// Withdraw earnings mutation
export const withdrawEarnings = mutation({
  args: {
    amountUsd: v.number(),
    stellarAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    
    // Get author earnings
    const earnings = await ctx.db
      .query("authorEarnings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!earnings) {
      throw new Error("No earnings found");
    }
    
    // Validate withdrawal amount
    if (args.amountUsd <= 0) {
      throw new Error("Invalid withdrawal amount");
    }
    
    if (args.amountUsd > earnings.availableBalanceUsd) {
      throw new Error("Insufficient balance");
    }
    
    // Minimum withdrawal threshold
    const MIN_WITHDRAWAL_USD = 10;
    if (args.amountUsd < MIN_WITHDRAWAL_USD) {
      throw new Error(`Minimum withdrawal amount is $${MIN_WITHDRAWAL_USD}`);
    }
    
    const amountCents = Math.round(args.amountUsd * 100);
    const now = Date.now();
    
    // Create withdrawal record
    const withdrawalId = await ctx.db.insert("withdrawals", {
      userId,
      amountUsd: args.amountUsd,
      amountCents,
      stellarAddress: args.stellarAddress,
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
    });
    
    // Update earnings - move from available to pending
    await ctx.db.patch(earnings._id, {
      availableBalanceUsd: earnings.availableBalanceUsd - args.amountUsd,
      availableBalanceCents: earnings.availableBalanceCents - amountCents,
      pendingBalanceUsd: earnings.pendingBalanceUsd + args.amountUsd,
      pendingBalanceCents: earnings.pendingBalanceCents + amountCents,
      updatedAt: now,
    });
    
    // In production, this would trigger a Stellar transaction
    // For now, simulate success after delay
    await ctx.scheduler.runAfter(2000, api.tips.confirmWithdrawal, { 
      withdrawalId,
      earningsId: earnings._id 
    });
    
    return withdrawalId;
  },
});

// Internal mutation to confirm withdrawal
export const confirmWithdrawal = mutation({
  args: {
    withdrawalId: v.id("withdrawals"),
    earningsId: v.id("authorEarnings"),
    stellarTxId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const withdrawal = await ctx.db.get(args.withdrawalId);
    if (!withdrawal) throw new Error("Withdrawal not found");
    if (withdrawal.status !== "PENDING") return;
    
    const earnings = await ctx.db.get(args.earningsId);
    if (!earnings) throw new Error("Earnings record not found");
    
    const now = Date.now();
    
    // Update withdrawal status
    await ctx.db.patch(args.withdrawalId, {
      status: "COMPLETED",
      stellarTxId: args.stellarTxId || `mock_withdraw_tx_${Date.now()}`,
      completedAt: now,
      updatedAt: now,
    });
    
    // Update earnings - move from pending to withdrawn
    await ctx.db.patch(args.earningsId, {
      pendingBalanceUsd: earnings.pendingBalanceUsd - withdrawal.amountUsd,
      pendingBalanceCents: earnings.pendingBalanceCents - withdrawal.amountCents,
      withdrawnUsd: earnings.withdrawnUsd + withdrawal.amountUsd,
      withdrawnCents: earnings.withdrawnCents + withdrawal.amountCents,
      lastWithdrawalAt: now,
      updatedAt: now,
    });
    
    return { success: true };
  },
});

// Helper function to get month key
function getMonthKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}