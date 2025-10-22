import { query } from "../_generated/server";

/**
 * MIGRATION PHASE 1: AUDIT
 *
 * Analyzes the current state of highlights in the database
 * Safe, read-only operation - makes no changes
 *
 * Run with: npx convex run migrations/01_auditHighlights:audit
 */

export const audit = query({
  handler: async (ctx) => {
    console.log("🔍 Starting highlight audit...");

    // Get all highlights
    const allHighlights = await ctx.db.query("highlights").collect();

    // Get all highlight tips
    const allTips = await ctx.db.query("highlightTips").collect();

    // Separate highlights by whether they have highlightId
    const withHighlightId = allHighlights.filter(h => h.highlightId);
    const withoutHighlightId = allHighlights.filter(h => !h.highlightId);

    // Check for potential issues
    const potentialIssues: {
      orphanedTips: Array<{ tipId: string; highlightId: string; text: string }>;
      duplicateTexts: Array<{ text: string; count: number; highlights: any[] }>;
    } = {
      orphanedTips: [],
      duplicateTexts: [],
    };

    // Find orphaned tips (tips with no matching highlight)
    for (const tip of allTips) {
      const matchingHighlight = allHighlights.find(h => h.highlightId === tip.highlightId);
      if (!matchingHighlight) {
        potentialIssues.orphanedTips.push({
          tipId: tip._id,
          highlightId: tip.highlightId,
          text: tip.highlightText.slice(0, 50),
        });
      }
    }

    // Find duplicate texts (same text highlighted multiple times - potential collision risk)
    const textMap = new Map<string, any[]>();
    for (const highlight of allHighlights) {
      const key = `${highlight.articleSlug}:${highlight.text.slice(0, 50)}`;
      if (!textMap.has(key)) {
        textMap.set(key, []);
      }
      textMap.get(key)!.push(highlight);
    }

    for (const [text, highlights] of textMap.entries()) {
      if (highlights.length > 1) {
        potentialIssues.duplicateTexts.push({
          text: text.slice(0, 50),
          count: highlights.length,
          highlights: highlights.map(h => ({
            id: h._id,
            hasId: !!h.highlightId,
            userId: h.userId,
          })),
        });
      }
    }

    // Sample highlights for inspection
    const sampleWithId = withHighlightId.slice(0, 2);
    const sampleWithoutId = withoutHighlightId.slice(0, 2);

    const report = {
      summary: {
        totalHighlights: allHighlights.length,
        withHighlightId: withHighlightId.length,
        withoutHighlightId: withoutHighlightId.length,
        percentageComplete: allHighlights.length > 0
          ? Math.round((withHighlightId.length / allHighlights.length) * 100)
          : 0,
      },
      tips: {
        totalTips: allTips.length,
        orphanedTips: potentialIssues.orphanedTips.length,
      },
      potentialIssues: {
        orphanedTips: potentialIssues.orphanedTips,
        duplicateTexts: potentialIssues.duplicateTexts,
        hasCriticalIssues: potentialIssues.orphanedTips.length > 0,
      },
      samples: {
        withHighlightId: sampleWithId.map(h => ({
          id: h._id,
          highlightId: h.highlightId,
          text: h.text.slice(0, 50),
          articleSlug: h.articleSlug,
          hasPositionData: !!(h.startOffset && h.endOffset),
        })),
        withoutHighlightId: sampleWithoutId.map(h => ({
          id: h._id,
          text: h.text.slice(0, 50),
          articleSlug: h.articleSlug,
          startOffset: h.startOffset,
          endOffset: h.endOffset,
          hasPositionData: !!(h.startOffset && h.endOffset),
        })),
      },
      recommendations: [] as string[],
    };

    // Add recommendations based on findings
    const recommendations: string[] = [];

    if (withoutHighlightId.length === 0) {
      recommendations.push("✅ All highlights have highlightId - no migration needed!");
    } else {
      recommendations.push(`⚠️  ${withoutHighlightId.length} highlights need highlightId backfilled`);
      recommendations.push("➡️  Proceed with migration script 02_backfillHighlightIds");
    }

    if (potentialIssues.orphanedTips.length > 0) {
      recommendations.push(`❌ ${potentialIssues.orphanedTips.length} orphaned tips found - these tips have no matching highlight`);
      recommendations.push("➡️  Review orphaned tips before migration");
    }

    if (potentialIssues.duplicateTexts.length > 0) {
      recommendations.push(`⚠️  ${potentialIssues.duplicateTexts.length} duplicate text patterns found`);
      recommendations.push("➡️  Review for potential hash collisions (usually safe if same user)");
    }

    report.recommendations = recommendations;

    console.log("✅ Audit complete!");

    return report;
  },
});
