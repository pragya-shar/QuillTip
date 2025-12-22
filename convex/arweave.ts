"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// Main upload action (background job) - Node.js runtime
export const uploadArticleToArweave = internalAction({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    // Check if Arweave is enabled
    const enabled = process.env.ARWEAVE_ENABLED === "true";
    if (!enabled) {
      console.log("[Arweave] Upload skipped - ARWEAVE_ENABLED is not true");
      return;
    }

    const walletKey = process.env.ARWEAVE_WALLET_KEY;
    if (!walletKey) {
      console.error("[Arweave] ARWEAVE_WALLET_KEY not configured");
      await ctx.runMutation(internal.arweaveHelpers.recordArweaveFailure, {
        articleId: args.articleId,
        error: "Wallet key not configured",
      });
      return;
    }

    // Get article data via helper query
    const data = await ctx.runQuery(internal.arweaveHelpers.getArticleForUpload, {
      articleId: args.articleId,
    });

    if (!data) {
      console.error("[Arweave] Article not found:", args.articleId);
      return;
    }

    const { article, authorUsername } = data;

    // Dynamic import for Node.js module
    const { uploadArticle, parseWalletKey } = await import("../lib/arweave/client");

    const content = {
      title: article.title,
      body: article.content,
      author: authorUsername,
      authorId: article.authorId,
      timestamp: Date.now(),
      version: (article.contentVersion || 0) + 1,
    };

    // Retry logic with exponential backoff
    const maxRetries = 3;
    let lastError = "";

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Arweave] Upload attempt ${attempt}/${maxRetries} for article: ${article.title}`);

        const result = await uploadArticle(content, parseWalletKey(walletKey));

        if (result.success && result.txId) {
          await ctx.runMutation(internal.arweaveHelpers.recordArweaveUpload, {
            articleId: args.articleId,
            txId: result.txId,
            url: result.url || `https://arweave.net/${result.txId}`,
            version: content.version,
          });
          console.log(`[Arweave] Upload successful: ${result.txId}`);
          return;
        }

        lastError = result.error || "Unknown error";
      } catch (error) {
        lastError = error instanceof Error ? error.message : "Unknown error";
      }

      // Exponential backoff before retry
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // All retries failed
    await ctx.runMutation(internal.arweaveHelpers.recordArweaveFailure, {
      articleId: args.articleId,
      error: lastError,
    });
    console.error(`[Arweave] Upload failed after ${maxRetries} attempts:`, lastError);
  },
});
