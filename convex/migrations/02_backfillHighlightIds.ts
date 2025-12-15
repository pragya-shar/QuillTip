import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { generateHighlightIdServer } from "../lib/highlightHash";

/**
 * MIGRATION PHASE 2: BACKFILL
 *
 * Adds highlightId to all existing highlights that don't have one
 * Uses the same hash generation algorithm as createHighlight
 *
 * Features:
 * - Idempotent (safe to run multiple times)
 * - Dry-run mode for preview
 * - Batch processing
 * - Progress reporting
 *
 * Run dry-run: npx convex run migrations/02_backfillHighlightIds:dryRun
 * Run live: npx convex run migrations/02_backfillHighlightIds:migrate
 */

export const dryRun = mutation({
  handler: async (ctx) => {
    console.log("🔍 Running migration in DRY-RUN mode (no changes will be made)...");

    const startTime = Date.now();

    // Get all highlights
    const allHighlights = await ctx.db.query("highlights").collect();

    // Filter highlights that need highlightId
    const highlightsToUpdate = allHighlights.filter(h => !h.highlightId);
    const highlightsToSkip = allHighlights.filter(h => h.highlightId);

    console.log(`Found ${highlightsToUpdate.length} highlights to update`);
    console.log(`Found ${highlightsToSkip.length} highlights already with highlightId (will skip)`);

    const details = [];
    const collisions = [];

    // Process each highlight that needs an ID
    for (const highlight of highlightsToUpdate) {
      try {
        // Generate highlightId using same algorithm as creation
        const highlightId = await generateHighlightIdServer(
          highlight.articleSlug,
          highlight.text,
          highlight.startOffset,
          highlight.endOffset
        );

        // Check if this ID already exists (collision detection)
        const existingWithSameId = allHighlights.find(
          h => h.highlightId === highlightId && h._id !== highlight._id
        );

        if (existingWithSameId) {
          collisions.push({
            highlightId,
            text: highlight.text.slice(0, 50),
            existingHighlight: {
              id: existingWithSameId._id,
              text: existingWithSameId.text.slice(0, 50),
            },
          });
        }

        details.push({
          id: highlight._id,
          highlightId,
          text: highlight.text.slice(0, 50),
          articleSlug: highlight.articleSlug,
          action: "WOULD_ADD_ID",
          collision: !!existingWithSameId,
        });
      } catch (error) {
        details.push({
          id: highlight._id,
          text: highlight.text.slice(0, 50),
          action: "ERROR",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const duration = Date.now() - startTime;

    return {
      mode: "DRY_RUN",
      summary: {
        totalHighlights: allHighlights.length,
        wouldUpdate: highlightsToUpdate.length,
        wouldSkip: highlightsToSkip.length,
        collisions: collisions.length,
        errors: details.filter(d => d.action === "ERROR").length,
        duration: `${duration}ms`,
      },
      collisions,
      details: details.slice(0, 10), // Show first 10 for review
      recommendations: collisions.length > 0
        ? ["⚠️  Hash collisions detected - review before running live migration"]
        : ["✅ No collisions detected - safe to run live migration"],
    };
  },
});

export const migrate = mutation({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    console.log("🚀 Running migration in LIVE mode...");

    const startTime = Date.now();
    const batchSize = args.batchSize || 100;

    // Get all highlights
    const allHighlights = await ctx.db.query("highlights").collect();

    // Filter highlights that need highlightId
    const highlightsToUpdate = allHighlights.filter(h => !h.highlightId);
    const highlightsToSkip = allHighlights.filter(h => h.highlightId);

    console.log(`Processing ${highlightsToUpdate.length} highlights...`);

    let updated = 0;
    let skipped = highlightsToSkip.length;
    let failed = 0;
    const errors = [];

    // Process in batches
    for (let i = 0; i < highlightsToUpdate.length; i += batchSize) {
      const batch = highlightsToUpdate.slice(i, i + batchSize);

      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}...`);

      for (const highlight of batch) {
        try {
          // Generate highlightId using same algorithm as creation
          const highlightId = await generateHighlightIdServer(
            highlight.articleSlug,
            highlight.text,
            highlight.startOffset,
            highlight.endOffset
          );

          // Check if this ID already exists (collision detection)
          const existingWithSameId = allHighlights.find(
            h => h.highlightId === highlightId && h._id !== highlight._id
          );

          if (existingWithSameId) {
            // Collision detected - log but continue (same highlight = same ID is intentional)
            console.warn(`Collision detected for ${highlightId} - this is OK if same text/position`);
          }

          // Update the highlight with the generated ID
          await ctx.db.patch(highlight._id, {
            highlightId,
            updatedAt: Date.now(),
          });

          updated++;
        } catch (error) {
          failed++;
          errors.push({
            id: highlight._id,
            text: highlight.text.slice(0, 50),
            error: error instanceof Error ? error.message : "Unknown error",
          });
          console.error(`Failed to update highlight ${highlight._id}:`, error);
        }
      }
    }

    const duration = Date.now() - startTime;

    console.log("✅ Migration complete!");

    return {
      mode: "LIVE",
      summary: {
        totalHighlights: allHighlights.length,
        updated,
        skipped,
        failed,
        successRate: allHighlights.length > 0
          ? Math.round((updated / allHighlights.length) * 100)
          : 0,
        duration: `${duration}ms`,
      },
      errors: errors.slice(0, 10), // Show first 10 errors
      recommendations: failed > 0
        ? ["❌ Some updates failed - review errors before proceeding"]
        : ["✅ All highlights updated successfully - proceed with validation"],
    };
  },
});
