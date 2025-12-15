/**
 * Server-side highlight ID generation for Convex
 * Must produce IDENTICAL hash to client-side version in lib/stellar/highlight-utils.ts
 */

/**
 * Generate deterministic highlight ID from text selection
 * This ID links highlights table with highlightTips table
 *
 * CRITICAL: Must match client-side generateHighlightId() exactly
 *
 * @param articleSlug - Article slug (not ID, to match client)
 * @param text - Selected text (truncated to first 50 chars for consistency)
 * @param startOffset - Start position in article
 * @param endOffset - End position in article
 * @returns SHA256 hash (first 28 chars for Stellar memo compatibility)
 */
export async function generateHighlightIdServer(
  articleSlug: string,
  text: string,
  startOffset: number,
  endOffset: number
): Promise<string> {
  // Create deterministic data string (MUST match client format exactly)
  const data = `${articleSlug}:${startOffset}:${endOffset}:${text.slice(0, 50)}`;

  // Convert string to Uint8Array
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  // Generate SHA-256 hash using Web Crypto API (works in V8 isolate)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer as BufferSource);

  // Convert hash to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Return first 28 chars for Stellar memo compatibility (max 28 bytes)
  return hashHex.slice(0, 28);
}

/**
 * Validate highlight ID format
 *
 * @param highlightId - Highlight ID to validate
 * @returns true if valid format
 */
export function isValidHighlightId(highlightId: string): boolean {
  // Should be 28 characters, hexadecimal
  return /^[a-f0-9]{28}$/.test(highlightId);
}
