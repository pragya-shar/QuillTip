import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

// Get NFTs by owner
export const getNFTsByOwner = query({
  args: {
    ownerId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const targetOwnerId = args.ownerId || await getAuthUserId(ctx);
    if (!targetOwnerId) return [];
    
    const nfts = await ctx.db
      .query("articleNFTs")
      .withIndex("by_current_owner", (q) => q.eq("currentOwner", targetOwnerId))
      .collect();
    
    // Enrich with article data
    const enrichedNfts = await Promise.all(
      nfts.map(async (nft) => {
        const article = await ctx.db.get(nft.articleId);
        const minter = await ctx.db.get(nft.mintedBy);
        
        return {
          ...nft,
          article: article ? {
            id: article._id,
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
            coverImage: article.coverImage,
            authorUsername: article.authorUsername,
          } : null,
          minter: minter ? {
            id: minter._id,
            name: minter.name,
            username: minter.username,
            avatar: minter.avatar,
          } : null,
        };
      })
    );
    
    return enrichedNfts;
  },
});

// Get NFT by article
export const getNFTByArticle = query({
  args: {
    articleId: v.id("articles"),
  },
  handler: async (ctx, args) => {
    const nft = await ctx.db
      .query("articleNFTs")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .first();
    
    if (!nft) return null;
    
    const [owner, minter] = await Promise.all([
      ctx.db.get(nft.currentOwner),
      ctx.db.get(nft.mintedBy),
    ]);
    
    return {
      ...nft,
      owner: owner ? {
        id: owner._id,
        name: owner.name,
        username: owner.username,
        avatar: owner.avatar,
      } : null,
      minter: minter ? {
        id: minter._id,
        name: minter.name,
        username: minter.username,
        avatar: minter.avatar,
      } : null,
    };
  },
});

// Get NFT details with transfer history
export const getNFTDetails = query({
  args: {
    nftId: v.id("articleNFTs"),
  },
  handler: async (ctx, args) => {
    const nft = await ctx.db.get(args.nftId);
    if (!nft) return null;
    
    const [owner, minter, article] = await Promise.all([
      ctx.db.get(nft.currentOwner),
      ctx.db.get(nft.mintedBy),
      ctx.db.get(nft.articleId),
    ]);
    
    // Get transfer history
    const transfers = await ctx.db
      .query("nftTransfers")
      .withIndex("by_nft", (q) => q.eq("nftId", args.nftId))
      .collect();
    
    // Enrich transfers with user data
    const enrichedTransfers = await Promise.all(
      transfers.map(async (transfer) => {
        const [from, to] = await Promise.all([
          ctx.db.get(transfer.fromUserId),
          ctx.db.get(transfer.toUserId),
        ]);
        
        return {
          ...transfer,
          from: from ? {
            id: from._id,
            name: from.name,
            username: from.username,
            avatar: from.avatar,
          } : null,
          to: to ? {
            id: to._id,
            name: to.name,
            username: to.username,
            avatar: to.avatar,
          } : null,
        };
      })
    );
    
    return {
      ...nft,
      owner: owner ? {
        id: owner._id,
        name: owner.name,
        username: owner.username,
        avatar: owner.avatar,
        stellarAddress: owner.stellarAddress,
      } : null,
      minter: minter ? {
        id: minter._id,
        name: minter.name,
        username: minter.username,
        avatar: minter.avatar,
      } : null,
      article: article ? {
        id: article._id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        coverImage: article.coverImage,
        authorUsername: article.authorUsername,
      } : null,
      transferHistory: enrichedTransfers,
    };
  },
});

// Mint NFT for article
export const mintNFT = mutation({
  args: {
    articleId: v.id("articles"),
    tipThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    
    const article = await ctx.db.get(args.articleId);
    if (!article) throw new Error("Article not found");
    if (article.authorId !== userId) throw new Error("Only the author can mint NFT for this article");
    
    // Check if NFT already exists for this article
    const existingNft = await ctx.db
      .query("articleNFTs")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .first();
    
    if (existingNft) {
      throw new Error("NFT already minted for this article");
    }
    
    const now = Date.now();
    
    // Generate NFT data
    const tokenId = `QUILL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const metadataUrl = `https://quilltip.com/api/nft/${tokenId}`;
    
    // Get total tips for the article
    const tips = await ctx.db
      .query("tips")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .filter((q) => q.eq(q.field("status"), "CONFIRMED"))
      .collect();
    
    const totalTipsUsd = tips.reduce((sum, tip) => sum + tip.amountUsd, 0);
    const totalTipsCents = Math.round(totalTipsUsd * 100);
    
    // Create NFT record
    const nftId = await ctx.db.insert("articleNFTs", {
      articleId: args.articleId,
      tokenId,
      contractAddress: "", // Will be set when deployed to Stellar
      metadataUrl,
      mintedBy: userId,
      currentOwner: userId,
      tipThreshold: args.tipThreshold || 1000, // Default $10 threshold
      totalTipsAtMint: totalTipsCents,
      mintedAt: now,
      updatedAt: now,
    });
    
    // Update article with NFT reference
    await ctx.db.patch(args.articleId, {
      hasNft: true,
      nftId,
      updatedAt: now,
    });
    
    // Update user NFT counts
    await ctx.db.patch(userId, {
      nftsCreated: (user.nftsCreated || 0) + 1,
      nftsOwned: (user.nftsOwned || 0) + 1,
      updatedAt: now,
    });
    
    return nftId;
  },
});

// Transfer NFT
export const transferNFT = mutation({
  args: {
    nftId: v.id("articleNFTs"),
    toUsername: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const nft = await ctx.db.get(args.nftId);
    if (!nft) throw new Error("NFT not found");
    if (nft.currentOwner !== userId) throw new Error("You don't own this NFT");
    
    // Find recipient
    const recipient = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.toUsername))
      .first();
    
    if (!recipient) throw new Error("Recipient not found");
    if (recipient._id === userId) throw new Error("Cannot transfer to yourself");
    
    const fromUser = await ctx.db.get(userId);
    if (!fromUser) throw new Error("User not found");
    
    const now = Date.now();
    
    // Create transfer record
    const transferId = await ctx.db.insert("nftTransfers", {
      nftId: args.nftId,
      fromUserId: userId,
      toUserId: recipient._id,
      transactionId: `tx_${Date.now()}`, // Mock transaction ID
      transferredAt: now,
    });
    
    // Update NFT ownership
    await ctx.db.patch(args.nftId, {
      currentOwner: recipient._id,
      updatedAt: now,
    });
    
    // Update user NFT counts
    await ctx.db.patch(userId, {
      nftsOwned: Math.max(0, (fromUser.nftsOwned || 0) - 1),
      updatedAt: now,
    });
    
    await ctx.db.patch(recipient._id, {
      nftsOwned: (recipient.nftsOwned || 0) + 1,
      updatedAt: now,
    });
    
    return transferId;
  },
});

// Get user's minted NFTs
export const getUserMintedNFTs = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const targetUserId = args.userId || await getAuthUserId(ctx);
    if (!targetUserId) return [];
    
    const nfts = await ctx.db
      .query("articleNFTs")
      .withIndex("by_minted_by", (q) => q.eq("mintedBy", targetUserId))
      .collect();
    
    // Enrich with article and current owner data
    const enrichedNfts = await Promise.all(
      nfts.map(async (nft) => {
        const [article, owner] = await Promise.all([
          ctx.db.get(nft.articleId),
          ctx.db.get(nft.currentOwner),
        ]);
        
        return {
          ...nft,
          article: article ? {
            id: article._id,
            title: article.title,
            slug: article.slug,
            authorUsername: article.authorUsername,
          } : null,
          currentOwnerInfo: owner ? {
            id: owner._id,
            name: owner.name,
            username: owner.username,
            avatar: owner.avatar,
          } : null,
        };
      })
    );
    
    return enrichedNfts;
  },
});

// Check if article has reached NFT minting threshold
export const checkMintingThreshold = query({
  args: {
    articleId: v.id("articles"),
    threshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article) return { eligible: false, totalTips: 0, threshold: 0 };
    
    // Check if NFT already exists
    const existingNft = await ctx.db
      .query("articleNFTs")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .first();
    
    if (existingNft) {
      return { 
        eligible: false, 
        totalTips: article.totalTipsUsd || 0,
        threshold: args.threshold || 10,
        alreadyMinted: true 
      };
    }
    
    const totalTipsUsd = article.totalTipsUsd || 0;
    const thresholdUsd = args.threshold || 10; // Default $10
    
    return {
      eligible: totalTipsUsd >= thresholdUsd,
      totalTips: totalTipsUsd,
      threshold: thresholdUsd,
      alreadyMinted: false,
    };
  },
});