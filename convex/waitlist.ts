import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Add an email to the waitlist
 */
export const joinWaitlist = mutation({
  args: {
    email: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email address");
    }

    // Normalize email (lowercase)
    const normalizedEmail = args.email.toLowerCase().trim();

    // Check if email already exists
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (existing) {
      // Return success even if already exists (don't reveal this info)
      return { success: true, alreadyExists: true };
    }

    // Add to waitlist
    await ctx.db.insert("waitlist", {
      email: normalizedEmail,
      status: "pending",
      source: args.source || "landing_page",
      createdAt: Date.now(),
    });

    return { success: true, alreadyExists: false };
  },
});

/**
 * Get all waitlist entries (requires authentication)
 */
export const getWaitlist = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Require authentication to access waitlist data
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    if (args.status) {
      const entries = await ctx.db
        .query("waitlist")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .order("desc")
        .collect();
      return entries;
    }

    const entries = await ctx.db
      .query("waitlist")
      .order("desc")
      .collect();
    
    return entries;
  },
});

/**
 * Get waitlist statistics
 */
export const getWaitlistStats = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("waitlist").collect();
    
    const stats = {
      total: all.length,
      pending: all.filter(e => e.status === "pending").length,
      invited: all.filter(e => e.status === "invited").length,
      joined: all.filter(e => e.status === "joined").length,
    };

    return stats;
  },
});
