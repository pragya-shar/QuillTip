import { TurboFactory, ArweaveSigner } from "@ardrive/turbo-sdk/node";
import { ARWEAVE_CONFIG } from './config';
import type { ArweaveArticleContent, ArweaveUploadResult, ArweaveTransactionStatus } from './types';
import type { JWKInterface } from "arweave/node/lib/wallet";

/**
 * Parse JWK wallet key from JSON string
 */
export function parseWalletKey(jwkString: string): JWKInterface {
  try {
    const parsed = JSON.parse(jwkString);
    if (!parsed.kty || parsed.kty !== 'RSA') {
      throw new Error('Invalid JWK: must be RSA key');
    }
    return parsed as JWKInterface;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JWK format: not valid JSON');
    }
    throw error;
  }
}

/**
 * Upload article content to Arweave via Turbo SDK
 * Uses server-side wallet for authenticated signing
 * FREE for files under 100 KiB
 */
export async function uploadArticle(
  content: ArweaveArticleContent,
  jwk: JWKInterface
): Promise<ArweaveUploadResult> {
  try {
    const data = JSON.stringify(content);
    const dataBuffer = Buffer.from(data);
    const sizeBytes = dataBuffer.length;

    // Warn if approaching or exceeding free tier limit
    if (sizeBytes > ARWEAVE_CONFIG.FREE_TIER_LIMIT_BYTES) {
      console.warn(
        `[Arweave] Article size ${(sizeBytes / 1024).toFixed(1)} KiB exceeds free tier (100 KiB). ` +
        `Upload may require credits.`
      );
    }

    // Create authenticated client with server wallet
    const signer = new ArweaveSigner(jwk);
    const turbo = TurboFactory.authenticated({ signer });

    const result = await turbo.upload({
      data: dataBuffer,
      signal: AbortSignal.timeout(60000), // 60s timeout
      dataItemOpts: {
        tags: [
          { name: 'Content-Type', value: 'application/json' },
          { name: 'App-Name', value: ARWEAVE_CONFIG.APP_NAME },
          { name: 'App-Version', value: ARWEAVE_CONFIG.APP_VERSION },
          { name: 'Article-Title', value: content.title },
          { name: 'Author', value: content.author },
          { name: 'Author-Id', value: content.authorId },
          { name: 'Timestamp', value: content.timestamp.toString() },
          { name: 'Version', value: content.version.toString() },
        ],
      },
    });

    return {
      success: true,
      txId: result.id,
      url: `https://arweave.net/${result.id}`,
    };
  } catch (error) {
    console.error('[Arweave] Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get article content from Arweave by transaction ID
 */
export async function getArticle(txId: string): Promise<ArweaveArticleContent | null> {
  try {
    const response = await fetch(`https://arweave.net/${txId}`);
    if (!response.ok) return null;
    return await response.json() as ArweaveArticleContent;
  } catch {
    return null;
  }
}

/**
 * Check transaction status (for verification)
 * For bundled transactions (Turbo SDK), checks multiple gateways
 */
export async function getTransactionStatus(txId: string): Promise<ArweaveTransactionStatus> {
  try {
    // First try main gateway for block confirmation
    const response = await fetch(`https://arweave.net/tx/${txId}/status`);
    if (response.ok) {
      const status = await response.json();
      if (status.block_height) {
        return {
          confirmed: true,
          confirmations: status.number_of_confirmations || 0,
          blockHeight: status.block_height,
        };
      }
    }

    // For bundled transactions, check if content is accessible via alternative gateways
    // If accessible, consider it confirmed (data is permanently stored)
    const gateways = [
      `https://arweave.developerdao.com/${txId}`,
      `https://g8way.io/${txId}`,
    ];

    for (const url of gateways) {
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok) {
          return { confirmed: true, confirmations: 1 };
        }
      } catch {
        // Try next gateway
      }
    }

    return { confirmed: false, confirmations: 0 };
  } catch {
    return { confirmed: false, confirmations: 0 };
  }
}
