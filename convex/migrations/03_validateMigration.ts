import { query } from "../_generated/server";

/**
 * MIGRATION PHASE 3: VALIDATION
 *
 * Validates that the migration was successful
 * Checks data integrity and tip linkage
 *
 * Run with: npx convex run migrations/03_validateMigration:validate
 */

export const validate = query({
  handler: async (ctx) => {
    console.log("🔍 Validating migration...");

    const startTime = Date.now();

    // Get all highlights and tips
    const allHighlights = await ctx.db.query("highlights").collect();
    const allTips = await ctx.db.query("highlightTips").collect();

    // Check 1: All highlights have highlightId
    const withHighlightId = allHighlights.filter(h => h.highlightId);
    const withoutHighlightId = allHighlights.filter(h => !h.highlightId);

    // Check 2: No duplicate highlightIds (that aren't intentional)
    const highlightIdMap = new Map<string, any[]>();
    for (const highlight of withHighlightId) {
      // TypeScript knows highlightId exists because we filtered with it
      const id = highlight.highlightId!;
      if (!highlightIdMap.has(id)) {
        highlightIdMap.set(id, []);
      }
      highlightIdMap.get(id)!.push(highlight);
    }

    const duplicateIds = [];
    for (const [id, highlights] of highlightIdMap.entries()) {
      if (highlights.length > 1) {
        // Check if these are truly duplicates or intentional (same text/position by different users)
        const firstHighlight = highlights[0];
        const isDifferentUsers = highlights.some(h => h.userId !== firstHighlight.userId);

        duplicateIds.push({
          highlightId: id,
          count: highlights.length,
          text: firstHighlight.text.slice(0, 50),
          isDifferentUsers,
          userIds: highlights.map(h => h.userId),
          isCritical: !isDifferentUsers, // Critical if same user has duplicates
        });
      }
    }

    // Check 3: All tips link to valid highlights
    const orphanedTips = [];
    const validTipLinks = [];

    for (const tip of allTips) {
      const matchingHighlights = allHighlights.filter(h => h.highlightId === tip.highlightId);

      if (matchingHighlights.length === 0) {
        orphanedTips.push({
          tipId: tip._id,
          highlightId: tip.highlightId,
          text: tip.highlightText.slice(0, 50),
          articleSlug: tip.articleSlug,
        });
      } else {
        validTipLinks.push({
          tipId: tip._id,
          highlightId: tip.highlightId,
          matchingHighlights: matchingHighlights.length,
        });
      }
    }

    // Check 4: Verify tip queries work
    let tipQueryTest = { success: false, error: null as string | null };
    try {
      // Test querying tips by highlightId
      if (withHighlightId.length > 0) {
        const testHighlight = withHighlightId[0];
        const tips = await ctx.db
          .query("highlightTips")
          .withIndex("by_highlight", q => q.eq("highlightId", testHighlight!.highlightId!))
          .collect();

        tipQueryTest.success = true;
        console.log(`✅ Tip query test passed (found ${tips.length} tips for sample highlight)`);
      } else {
        tipQueryTest.success = true;
        tipQueryTest.error = "No highlights to test (but this is OK)";
      }
    } catch (error) {
      tipQueryTest.error = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ Tip query test failed:", error);
    }

    const duration = Date.now() - startTime;

    // Determine validation status
    const criticalIssues = [];
    const warnings = [];

    if (withoutHighlightId.length > 0) {
      criticalIssues.push(`${withoutHighlightId.length} highlights still missing highlightId`);
    }

    if (orphanedTips.length > 0) {
      criticalIssues.push(`${orphanedTips.length} orphaned tips (tips with no matching highlight)`);
    }

    if (!tipQueryTest.success) {
      criticalIssues.push(`Tip query test failed: ${tipQueryTest.error}`);
    }

    const criticalDuplicates = duplicateIds.filter(d => d.isCritical);
    if (criticalDuplicates.length > 0) {
      warnings.push(`${criticalDuplicates.length} critical duplicate IDs (same user)`);
    }

    const intentionalDuplicates = duplicateIds.filter(d => !d.isCritical);
    if (intentionalDuplicates.length > 0) {
      warnings.push(`${intentionalDuplicates.length} intentional duplicates (different users, same text - OK)`);
    }

    const validationStatus = criticalIssues.length === 0 ? "PASSED" : "FAILED";

    const report = {
      validation: validationStatus,
      summary: {
        totalHighlights: allHighlights.length,
        withHighlightId: withHighlightId.length,
        withoutHighlightId: withoutHighlightId.length,
        totalTips: allTips.length,
        duration: `${duration}ms`,
      },
      integrity: {
        orphanedTips: orphanedTips.length,
        duplicateIds: duplicateIds.length,
        validTipLinks: validTipLinks.length,
        tipQueryTestPassed: tipQueryTest.success,
      },
      issues: {
        critical: criticalIssues,
        warnings,
      },
      details: {
        orphanedTips: orphanedTips.slice(0, 5),
        duplicateIds: duplicateIds.slice(0, 5),
        sampleValidLinks: validTipLinks.slice(0, 3),
      },
      recommendations: [] as string[],
    };

    // Add recommendations
    const recommendations: string[] = [];

    if (validationStatus === "PASSED") {
      recommendations.push("✅ Migration validation PASSED");
      recommendations.push("✅ All highlights have highlightId");
      recommendations.push("✅ All tips link to valid highlights");
      recommendations.push("✅ Tip queries working correctly");
      recommendations.push("➡️  Safe to make highlightId required in schema");
    } else {
      recommendations.push("❌ Migration validation FAILED");
      criticalIssues.forEach(issue => {
        recommendations.push(`❌ ${issue}`);
      });
      recommendations.push("➡️  DO NOT make highlightId required yet");
      recommendations.push("➡️  Review issues and re-run migration if needed");
    }

    if (warnings.length > 0) {
      warnings.forEach(warning => {
        recommendations.push(`⚠️  ${warning}`);
      });
    }

    report.recommendations = recommendations;

    console.log(`${validationStatus === "PASSED" ? "✅" : "❌"} Validation ${validationStatus.toLowerCase()}`);

    return report;
  },
});
