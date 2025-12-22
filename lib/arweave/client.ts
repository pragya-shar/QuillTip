import Arweave from 'arweave';
import type { JWKInterface } from 'arweave/node/lib/wallet';
import { ARWEAVE_CONFIG } from './config';
import type { ArweaveArticleContent, ArweaveUploadResult, ArweaveTransactionStatus } from './types';

// Initialize Arweave client
const arweave = Arweave.init({
  host: ARWEAVE_CONFIG.HOST,
  port: ARWEAVE_CONFIG.PORT,
  protocol: ARWEAVE_CONFIG.PROTOCOL,
});

/**
 * Upload article content to Arweave permanent storage
 */
export async function uploadArticle(
  content: ArweaveArticleContent,
  walletKey: JWKInterface
): Promise<ArweaveUploadResult> {
  try {
    const data = JSON.stringify(content);

    const transaction = await arweave.createTransaction({ data }, walletKey);

    // Add metadata tags for indexing
    transaction.addTag('Content-Type', 'application/json');
    transaction.addTag('App-Name', ARWEAVE_CONFIG.APP_NAME);
    transaction.addTag('App-Version', ARWEAVE_CONFIG.APP_VERSION);
    transaction.addTag('Article-Title', content.title);
    transaction.addTag('Author', content.author);
    transaction.addTag('Author-Id', content.authorId);
    transaction.addTag('Timestamp', content.timestamp.toString());
    transaction.addTag('Version', content.version.toString());

    await arweave.transactions.sign(transaction, walletKey);

    // Use chunked upload for reliability
    const uploader = await arweave.transactions.getUploader(transaction);
    while (!uploader.isComplete) {
      await uploader.uploadChunk();
    }

    return {
      success: true,
      txId: transaction.id,
      url: `https://arweave.net/${transaction.id}`,
    };
  } catch (error) {
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
    const data = await arweave.transactions.getData(txId, { decode: true, string: true });
    return JSON.parse(data as string) as ArweaveArticleContent;
  } catch {
    return null;
  }
}

/**
 * Check transaction status and confirmations
 */
export async function getTransactionStatus(txId: string): Promise<ArweaveTransactionStatus> {
  try {
    const status = await arweave.transactions.getStatus(txId);
    return {
      confirmed: status.status === 200 && !!status.confirmed,
      confirmations: status.confirmed?.number_of_confirmations || 0,
      blockHeight: status.confirmed?.block_height,
    };
  } catch {
    return { confirmed: false, confirmations: 0 };
  }
}

/**
 * Parse JWK wallet key from environment variable
 */
export function parseWalletKey(keyString: string): JWKInterface {
  return JSON.parse(keyString) as JWKInterface;
}

export { arweave };
