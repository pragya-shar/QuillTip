import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

// Get article data for upload (used by arweave action)
export const getArticleForUpload = internalQuery({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article) return null;

    const author = await ctx.db.get(article.authorId);
    return {
      article,
      authorUsername: author?.username || "unknown",
    };
  },
});

// Record successful upload
export const recordArweaveUpload = internalMutation({
  args: {
    articleId: v.id("articles"),
    txId: v.string(),
    url: v.string(),
    version: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.articleId, {
      arweaveTxId: args.txId,
      arweaveUrl: args.url,
      arweaveStatus: "uploaded",
      arweaveTimestamp: Date.now(),
      contentVersion: args.version,
      updatedAt: Date.now(),
    });

    // Schedule verification after 10 minutes
    await ctx.scheduler.runAfter(
      10 * 60 * 1000,
      internal.arweave.verifyArweaveUpload,
      { articleId: args.articleId }
    );
  },
});

// Record upload failure
export const recordArweaveFailure = internalMutation({
  args: {
    articleId: v.id("articles"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.articleId, {
      arweaveStatus: "failed",
      updatedAt: Date.now(),
    });
    console.error(`[Arweave] Failed for article ${args.articleId}: ${args.error}`);
  },
});

// Update arweave status (for verification job)
export const updateArweaveStatus = internalMutation({
  args: {
    articleId: v.id("articles"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.articleId, {
      arweaveStatus: args.status,
      updatedAt: Date.now(),
    });
  },
});
