/**
 * Check what real data we have in the database
 * This will help us decide whether to use real data or build for empty state
 */

import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function checkData() {
  console.log("🔍 Checking existing data in database...\n");

  try {
    // Check highlights
    console.log("📌 HIGHLIGHTS:");
    const highlights = await client.query("highlights:getArticleHighlights" as any, { 
      articleId: "test" // This will fail but we can see if the query works
    }).catch(() => []);
    console.log(`  - Found ${highlights?.length || 0} highlights in database`);

    // Check article tips
    console.log("\n💰 ARTICLE TIPS:");
    const tips = await client.query("tips:getArticleTips" as any, { 
      articleId: "test" 
    }).catch(() => []);
    console.log(`  - Found ${tips?.length || 0} article tips in database`);

    // Check highlight tips
    console.log("\n🎯 HIGHLIGHT TIPS:");
    const highlightTips = await client.query("highlightTips:getByArticle" as any, { 
      articleId: "test" 
    }).catch(() => []);
    console.log(`  - Found ${highlightTips?.length || 0} highlight tips in database`);

    console.log("\n" + "=".repeat(60));
    console.log("RECOMMENDATION:");
    console.log("=".repeat(60));

    if (highlightTips && highlightTips.length > 0) {
      console.log("✅ You have REAL highlight tips data!");
      console.log("   → Build heatmap using existing data (no fake data needed)");
    } else if (highlights && highlights.length > 0) {
      console.log("⚠️  You have highlights but no tips on them yet");
      console.log("   → Build heatmap with 'zero state' design");
      console.log("   → Show 'No tips yet' message when empty");
    } else {
      console.log("📭 No data found - fresh database");
      console.log("   → Build heatmap with 'empty state' design");
      console.log("   → Launch feature and let real users populate it");
    }

  } catch (error) {
    console.error("Error checking data:", error);
  }
}

checkData();
