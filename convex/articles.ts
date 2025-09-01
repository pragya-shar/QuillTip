import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// List articles with pagination and filters
export const listArticles = query({
  args: {
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    tag: v.optional(v.string()),
    author: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const page = args.page || 1;
    const limit = args.limit || 10;
    const offset = (page - 1) * limit;
    
    let articlesQuery = ctx.db
      .query("articles")
      .withIndex("by_published", (q) => q.eq("published", true));
    
    // Apply filters
    if (args.author) {
      const author = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.author!))
        .first();
      
      if (!author) return { articles: [], total: 0, page, limit };
      
      articlesQuery = articlesQuery.filter((q) => 
        q.eq(q.field("authorId"), author._id)
      );
    }
    
    // Tag filtering would need to be done post-query since tags is an array
    // We'll filter after collecting all articles
    
    // Search filtering will be done post-query
    // since Convex doesn't support contains on non-indexed fields
    
    // Get all articles and apply filters
    let allArticles = await articlesQuery.collect();
    
    // Apply tag filter if specified
    if (args.tag) {
      allArticles = allArticles.filter(article => 
        article.tags && article.tags.includes(args.tag!)
      );
    }
    
    // Apply search filter if specified
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      allArticles = allArticles.filter(article => 
        article.title.toLowerCase().includes(searchLower) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(searchLower))
      );
    }
    
    const total = allArticles.length;
    
    // Apply pagination
    const articles = allArticles
      .sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0))
      .slice(offset, offset + limit);
    
    // Enrich with author data
    const enrichedArticles = await Promise.all(
      articles.map(async (article) => {
        const author = await ctx.db.get(article.authorId);
        return {
          ...article,
          author: author ? {
            id: author._id,
            name: author.name,
            username: author.username,
            avatar: author.avatar,
          } : null,
        };
      })
    );
    
    return {
      articles: enrichedArticles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
});

// Get article by slug
export const getArticleBySlug = query({
  args: {
    username: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    // Find author
    const author = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    
    if (!author) return null;
    
    // Find article
    const article = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .filter((q) => 
        q.and(
          q.eq(q.field("authorId"), author._id),
          q.eq(q.field("published"), true)
        )
      )
      .first();
    
    if (!article) return null;
    
    // Note: View count increment would need to be in a mutation
    // For now, we'll skip it in this query
    
    // Get tips count
    const tips = await ctx.db
      .query("tips")
      .withIndex("by_article", (q) => q.eq("articleId", article._id))
      .filter((q) => q.eq(q.field("status"), "CONFIRMED"))
      .collect();
    
    const tipStats = {
      count: tips.length,
      total: tips.reduce((sum, tip) => sum + tip.amountUsd, 0),
    };
    
    return {
      ...article,
      author: {
        id: author._id,
        name: author.name,
        username: author.username,
        avatar: author.avatar,
        stellarAddress: author.stellarAddress,
      },
      tipStats,
    };
  },
});

// Get article by ID
export const getArticleById = query({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id);
    if (!article) return null;
    
    const author = await ctx.db.get(article.authorId);
    return {
      ...article,
      author: author ? {
        id: author._id,
        name: author.name,
        username: author.username,
        avatar: author.avatar,
      } : null,
    };
  },
});

// Get user drafts
export const getUserDrafts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    const drafts = await ctx.db
      .query("articles")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .filter((q) => q.eq(q.field("published"), false))
      .order("desc")
      .collect();
    
    return drafts;
  },
});

// Create article
export const createArticle = mutation({
  args: {
    title: v.string(),
    content: v.any(),
    excerpt: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    
    // Generate slug from title
    const slug = args.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 100);
    
    // Check if slug exists for this user
    const existingSlug = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .filter((q) => q.eq(q.field("authorId"), userId))
      .first();
    
    const finalSlug = existingSlug 
      ? `${slug}-${Date.now()}`
      : slug;
    
    const now = Date.now();
    
    const articleId = await ctx.db.insert("articles", {
      slug: finalSlug,
      title: args.title,
      content: args.content,
      excerpt: args.excerpt,
      coverImage: args.coverImage,
      published: args.published || false,
      publishedAt: args.published ? now : undefined,
      authorId: userId,
      authorUsername: user.username,
      authorName: user.name,
      authorAvatar: user.avatar,
      tags: args.tags || [],
      viewCount: 0,
      highlightCount: 0,
      tipCount: 0,
      totalTipsUsd: 0,
      readTime: calculateReadTime(args.content),
      createdAt: now,
      updatedAt: now,
    });
    
    // Update user's article count if published
    if (args.published) {
      await ctx.db.patch(userId, {
        articleCount: (user.articleCount || 0) + 1,
        updatedAt: now,
      });
    }
    
    return articleId;
  },
});

// Update article
export const updateArticle = mutation({
  args: {
    id: v.id("articles"),
    title: v.optional(v.string()),
    content: v.optional(v.any()),
    excerpt: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const article = await ctx.db.get(args.id);
    if (!article) throw new Error("Article not found");
    if (article.authorId !== userId) throw new Error("Not authorized");
    
    const updates: any = {
      updatedAt: Date.now(),
    };
    
    if (args.title !== undefined) {
      updates.title = args.title;
      // Optionally update slug if title changes significantly
    }
    
    if (args.content !== undefined) {
      updates.content = args.content;
      updates.readTime = calculateReadTime(args.content);
    }
    
    if (args.excerpt !== undefined) updates.excerpt = args.excerpt;
    if (args.coverImage !== undefined) updates.coverImage = args.coverImage;
    if (args.tags !== undefined) updates.tags = args.tags;
    
    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

// Publish article
export const publishArticle = mutation({
  args: {
    id: v.id("articles"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const article = await ctx.db.get(args.id);
    if (!article) throw new Error("Article not found");
    if (article.authorId !== userId) throw new Error("Not authorized");
    if (article.published) throw new Error("Already published");
    
    const now = Date.now();
    
    await ctx.db.patch(args.id, {
      published: true,
      publishedAt: now,
      updatedAt: now,
    });
    
    // Update user's article count
    const user = await ctx.db.get(userId);
    if (user) {
      await ctx.db.patch(userId, {
        articleCount: (user.articleCount || 0) + 1,
        updatedAt: now,
      });
    }
    
    return args.id;
  },
});

// Delete article
export const deleteArticle = mutation({
  args: {
    id: v.id("articles"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const article = await ctx.db.get(args.id);
    if (!article) throw new Error("Article not found");
    if (article.authorId !== userId) throw new Error("Not authorized");
    
    // Delete related data
    // Delete highlights
    const highlights = await ctx.db
      .query("highlights")
      .withIndex("by_article", (q) => q.eq("articleId", args.id))
      .collect();
    
    for (const highlight of highlights) {
      await ctx.db.delete(highlight._id);
    }
    
    // Delete article
    await ctx.db.delete(args.id);
    
    // Update user's article count if it was published
    if (article.published) {
      const user = await ctx.db.get(userId);
      if (user) {
        await ctx.db.patch(userId, {
          articleCount: Math.max(0, (user.articleCount || 0) - 1),
          updatedAt: Date.now(),
        });
      }
    }
    
    return { success: true };
  },
});

// Save draft (auto-save)
export const saveDraft = mutation({
  args: {
    id: v.optional(v.id("articles")),
    title: v.string(),
    content: v.any(),
    excerpt: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    if (args.id) {
      // Update existing draft
      const article = await ctx.db.get(args.id);
      if (!article) throw new Error("Draft not found");
      if (article.authorId !== userId) throw new Error("Not authorized");
      
      await ctx.db.patch(args.id, {
        title: args.title,
        content: args.content,
        excerpt: args.excerpt,
        coverImage: args.coverImage,
        tags: args.tags,
        updatedAt: Date.now(),
      });
      
      return args.id;
    } else {
      // Create new draft
      // Create new draft
      const user = await ctx.db.get(userId);
      if (!user) throw new Error("User not found");
      
      const slug = args.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .substring(0, 100);
      
      const existingSlug = await ctx.db
        .query("articles")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .filter((q) => q.eq(q.field("authorId"), userId))
        .first();
      
      const finalSlug = existingSlug 
        ? `${slug}-${Date.now()}`
        : slug;
      
      const now = Date.now();
      
      return await ctx.db.insert("articles", {
        slug: finalSlug,
        title: args.title,
        content: args.content,
        excerpt: args.excerpt,
        coverImage: args.coverImage,
        published: false,
        authorId: userId,
        authorUsername: user.username,
        authorName: user.name,
        authorAvatar: user.avatar,
        tags: args.tags || [],
        viewCount: 0,
        highlightCount: 0,
        tipCount: 0,
        totalTipsUsd: 0,
        readTime: calculateReadTime(args.content),
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Helper function to calculate read time
function calculateReadTime(content: any): number {
  // Simple estimation: 200 words per minute
  const text = JSON.stringify(content);
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / 200);
}