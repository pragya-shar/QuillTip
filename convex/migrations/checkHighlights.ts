import { query } from "../_generated/server";

export const checkHighlights = query({
  handler: async (ctx) => {
    const allHighlights = await ctx.db.query("highlights").collect();

    const withId = allHighlights.filter(h => h.highlightId);
    const withoutId = allHighlights.filter(h => !h.highlightId);

    return {
      total: allHighlights.length,
      withHighlightId: withId.length,
      withoutHighlightId: withoutId.length,
      sample: allHighlights.slice(0, 2), // See structure
    };
  },
});
