import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Generate upload URL for client-side uploads
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    // Generate a short-lived upload URL
    const uploadUrl = await ctx.storage.generateUploadUrl();
    
    return uploadUrl;
  },
});

// Allowed file types and max size
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 10485760; // 10MB

// Store file metadata after upload
export const storeFileMetadata = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    uploadType: v.union(v.literal("avatar"), v.literal("article_image"), v.literal("cover_image"), v.literal("article_cover")),
    articleId: v.optional(v.id("articles")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Server-side validation
    if (!ALLOWED_FILE_TYPES.includes(args.fileType)) {
      throw new Error(`Invalid file type: ${args.fileType}. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`);
    }
    if (args.fileSize > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum of 10MB`);
    }

    const now = Date.now();
    
    // Store file metadata
    const fileId = await ctx.db.insert("fileUploads", {
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      uploadType: args.uploadType,
      uploadedBy: userId,
      articleId: args.articleId,
      createdAt: now,
    });
    
    // Get the public URL for the file
    const url = await ctx.storage.getUrl(args.storageId);
    
    return {
      fileId,
      url,
    };
  },
});

// Get file URL by storage ID
export const getFileUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    return url;
  },
});

// Get user's uploaded files
export const getUserUploads = query({
  args: {
    uploadType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    const uploadsQuery = ctx.db
      .query("fileUploads")
      .withIndex("by_user", (q) => q.eq("uploadedBy", userId));
    
    const uploads = await uploadsQuery.collect();
    
    // Filter by upload type if specified
    const filteredUploads = args.uploadType 
      ? uploads.filter(u => u.uploadType === args.uploadType)
      : uploads;
    
    // Get URLs for all files
    const uploadsWithUrls = await Promise.all(
      filteredUploads.map(async (upload) => {
        const url = await ctx.storage.getUrl(upload.storageId);
        return {
          ...upload,
          url,
        };
      })
    );
    
    return uploadsWithUrls;
  },
});

// Delete file
export const deleteFile = mutation({
  args: {
    fileId: v.id("fileUploads"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File not found");
    if (file.uploadedBy !== userId) throw new Error("Not authorized");
    
    // Delete from storage
    await ctx.storage.delete(file.storageId);
    
    // Delete metadata
    await ctx.db.delete(args.fileId);
    
    return { success: true };
  },
});

// Update user avatar
export const updateUserAvatar = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    
    // Get the public URL for the avatar
    const avatarUrl = await ctx.storage.getUrl(args.storageId);
    
    // Store file metadata
    const now = Date.now();
    await ctx.db.insert("fileUploads", {
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: "image",
      fileSize: 0, // Size can be determined client-side
      uploadType: "avatar",
      uploadedBy: userId,
      createdAt: now,
    });
    
    // Update user profile
    await ctx.db.patch(userId, {
      avatar: avatarUrl || undefined,
      updatedAt: now,
    });
    
    return {
      avatarUrl,
    };
  },
});

// Update article cover image
export const updateArticleCoverImage = mutation({
  args: {
    articleId: v.id("articles"),
    storageId: v.id("_storage"),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const article = await ctx.db.get(args.articleId);
    if (!article) throw new Error("Article not found");
    if (article.authorId !== userId) throw new Error("Not authorized");
    
    // Get the public URL for the image
    const imageUrl = await ctx.storage.getUrl(args.storageId);
    
    // Store file metadata
    const now = Date.now();
    await ctx.db.insert("fileUploads", {
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: "image",
      fileSize: 0, // Size can be determined client-side
      uploadType: "cover_image",
      uploadedBy: userId,
      articleId: args.articleId,
      createdAt: now,
    });
    
    // Update article
    await ctx.db.patch(args.articleId, {
      coverImage: imageUrl || undefined,
      updatedAt: now,
    });
    
    return {
      imageUrl,
    };
  },
});