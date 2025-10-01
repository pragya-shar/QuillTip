import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  
  // Users table
  users: defineTable({
    // Unique identifiers
    email: v.string(),
    username: v.string(),
    
    // Profile
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatar: v.optional(v.string()),
    
    // Authentication
    hashedPassword: v.optional(v.string()),
    
    // Stellar integration (optional, can be null to explicitly clear)
    stellarAddress: v.optional(v.union(v.string(), v.null())),
    
    // Stats (denormalized for performance)
    articleCount: v.optional(v.number()),
    highlightCount: v.optional(v.number()),
    tipsSentCount: v.optional(v.number()),
    tipsReceivedCount: v.optional(v.number()),
    nftsCreated: v.optional(v.number()),
    nftsOwned: v.optional(v.number()),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_username", ["username"]),

  // Articles table
  articles: defineTable({
    // Identification
    slug: v.string(),
    title: v.string(),
    
    // Content
    content: v.any(), // TipTap JSON content
    excerpt: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    
    // Publishing
    published: v.boolean(),
    publishedAt: v.optional(v.number()),
    
    // Author relationship
    authorId: v.id("users"),
    
    // Denormalized author data for performance
    authorUsername: v.string(),
    authorName: v.optional(v.string()),
    authorAvatar: v.optional(v.string()),
    
    // Tags
    tags: v.optional(v.array(v.string())),
    
    // Stats (denormalized)
    viewCount: v.optional(v.number()),
    highlightCount: v.optional(v.number()),
    tipCount: v.optional(v.number()),
    totalTipsUsd: v.optional(v.number()),
    
    // NFT reference
    hasNft: v.optional(v.boolean()),
    nftId: v.optional(v.id("articleNFTs")),
    
    // Computed
    readTime: v.optional(v.number()),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_author", ["authorId"])
    .index("by_published", ["published"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["published", "authorUsername"],
    }),

  // Tags table
  tags: defineTable({
    name: v.string(),
    slug: v.string(),
    
    // Stats
    articleCount: v.optional(v.number()),
    
    // Display
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  })
    .index("by_name", ["name"])
    .index("by_slug", ["slug"]),

  // Highlights table
  highlights: defineTable({
    // References
    articleId: v.id("articles"),
    userId: v.id("users"),
    
    // Denormalized data for performance
    articleTitle: v.string(),
    articleSlug: v.string(),
    articleAuthor: v.string(),
    userName: v.optional(v.string()),
    userAvatar: v.optional(v.string()),
    
    // Text selection data
    text: v.string(),
    startOffset: v.number(),
    endOffset: v.number(),
    startContainerPath: v.string(),
    endContainerPath: v.string(),
    
    // Metadata
    color: v.optional(v.string()),
    note: v.optional(v.string()),
    isPublic: v.boolean(),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_article", ["articleId"])
    .index("by_user", ["userId"])
    .index("by_article_public", ["articleId", "isPublic"]),

  // Tips table
  tips: defineTable({
    // References
    articleId: v.id("articles"),
    tipperId: v.id("users"),
    authorId: v.id("users"),
    
    // Denormalized data
    articleTitle: v.string(),
    articleSlug: v.string(),
    tipperName: v.optional(v.string()),
    tipperAvatar: v.optional(v.string()),
    authorName: v.optional(v.string()),
    authorAvatar: v.optional(v.string()),
    
    // Tip details
    amountUsd: v.number(),
    amountCents: v.number(),
    message: v.optional(v.string()),
    
    // Blockchain data
    stellarTxId: v.optional(v.string()),
    stellarNetwork: v.optional(v.string()), // TESTNET or MAINNET
    stellarLedger: v.optional(v.number()), // Ledger number
    stellarFeeCharged: v.optional(v.string()), // Network fee in XLM
    stellarMemo: v.optional(v.string()), // Transaction memo
    stellarSourceAccount: v.optional(v.string()), // Sender's Stellar address
    stellarDestinationAccount: v.optional(v.string()), // Receiver's Stellar address
    stellarAmountXlm: v.optional(v.string()), // Amount in XLM
    contractTipId: v.optional(v.string()),

    // Status
    status: v.string(), // PENDING, CONFIRMING, CONFIRMED, FAILED
    failureReason: v.optional(v.string()), // Error message if failed
    platformFee: v.optional(v.number()),
    authorShare: v.optional(v.number()),
    
    // Timestamps
    createdAt: v.number(),
    processedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_article", ["articleId"])
    .index("by_tipper", ["tipperId"])
    .index("by_author", ["authorId"])
    .index("by_status", ["status"]),

  // Author Earnings table
  authorEarnings: defineTable({
    // Relationship
    userId: v.id("users"),
    
    // Earnings data
    totalEarnedUsd: v.number(),
    totalEarnedCents: v.number(),
    availableBalanceUsd: v.number(),
    availableBalanceCents: v.number(),
    pendingBalanceUsd: v.number(),
    pendingBalanceCents: v.number(),
    withdrawnUsd: v.number(),
    withdrawnCents: v.number(),
    
    // Stats
    tipCount: v.number(),
    lastTipAt: v.optional(v.number()),
    lastWithdrawalAt: v.optional(v.number()),
    
    // Monthly breakdown (denormalized)
    monthlyEarnings: v.optional(v.any()),
    
    // Top articles (denormalized)
    topArticles: v.optional(v.array(v.object({
      articleId: v.id("articles"),
      title: v.string(),
      earnings: v.number(),
      tipCount: v.number(),
    }))),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // Article NFTs table
  articleNFTs: defineTable({
    // Article reference
    articleId: v.id("articles"),
    
    // NFT data
    tokenId: v.string(),
    contractAddress: v.optional(v.string()),
    metadataUrl: v.string(),
    
    // Ownership
    mintedBy: v.id("users"),
    currentOwner: v.id("users"),
    
    // Minting criteria
    tipThreshold: v.number(),
    totalTipsAtMint: v.number(),
    
    // Timestamps
    mintedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_token_id", ["tokenId"])
    .index("by_article", ["articleId"])
    .index("by_current_owner", ["currentOwner"])
    .index("by_minted_by", ["mintedBy"]),

  // NFT Transfers table
  nftTransfers: defineTable({
    // NFT reference
    nftId: v.id("articleNFTs"),
    
    // Transfer parties
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    
    // Transaction data
    transactionId: v.optional(v.string()),
    
    // Timestamp
    transferredAt: v.number(),
  })
    .index("by_nft", ["nftId"])
    .index("by_from_user", ["fromUserId"])
    .index("by_to_user", ["toUserId"]),

  // Withdrawals table
  withdrawals: defineTable({
    // User reference
    userId: v.id("users"),
    
    // Amount
    amountUsd: v.number(),
    amountCents: v.number(),
    
    // Destination
    stellarAddress: v.string(),
    
    // Status
    status: v.string(), // PENDING, PROCESSING, COMPLETED, FAILED
    failureReason: v.optional(v.string()),

    // Transaction data
    stellarTxId: v.optional(v.string()),
    stellarNetwork: v.optional(v.string()), // TESTNET or MAINNET
    stellarLedger: v.optional(v.number()),
    stellarFeeCharged: v.optional(v.string()),
    stellarAmountXlm: v.optional(v.string()),
    
    // Timestamps
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // File uploads table
  fileUploads: defineTable({
    // Storage reference
    storageId: v.id("_storage"),
    
    // File metadata
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    
    // Upload context
    uploadType: v.string(), // "avatar", "article_image", "cover_image"
    uploadedBy: v.id("users"),
    articleId: v.optional(v.id("articles")),
    
    // Timestamp
    createdAt: v.number(),
  })
    .index("by_user", ["uploadedBy"])
    .index("by_article", ["articleId"])
    .index("by_type", ["uploadType"]),
});