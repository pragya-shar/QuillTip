export interface TipData {
  tipId: string;
  tipper: string;
  amount: number; // in stroops
  timestamp: Date;
}

export interface TipReceipt {
  tipId: string;
  amountSent: number; // in stroops
  authorReceived: number; // in stroops
  platformFee: number; // in stroops
  timestamp: Date;
  transactionHash?: string;
}

export interface AuthorBalance {
  address: string;
  balance: number; // in stroops
  balanceXLM: number; // in XLM
  balanceUSD: number; // in USD
  pendingWithdrawal: boolean;
}

export interface TipParams {
  tipper: string;
  articleId: string;
  authorAddress: string;
  amountCents: number;
  signerFn?: (txXDR: string) => Promise<string>;
}

export interface WithdrawParams {
  authorAddress: string;
  signerFn?: (txXDR: string) => Promise<string>;
}

export interface StellarWallet {
  publicKey: string;
  secretKey?: string; // Only for server-side wallets
}

export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
}

export interface XLMPriceData {
  price: number; // USD per XLM
  timestamp: Date;
}

export interface TipStatistics {
  totalTips: number;
  totalVolume: number; // in stroops
  totalVolumeUSD: number;
  uniqueTippers: number;
  topTippedArticles: Array<{
    articleId: string;
    totalTips: number;
    totalAmount: number;
  }>;
}