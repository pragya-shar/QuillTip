import * as StellarSdk from '@stellar/stellar-sdk';
import { STELLAR_CONFIG } from './config';
import type { 
  TipParams, 
  TipReceipt, 
  TransactionResult, 
  AuthorBalance,
  TipData,
  XLMPriceData 
} from './types';

export class StellarClient {
  private server: StellarSdk.Horizon.Server;
  private networkPassphrase: string;

  constructor() {
    this.server = new StellarSdk.Horizon.Server(STELLAR_CONFIG.HORIZON_URL);
    this.networkPassphrase = STELLAR_CONFIG.NETWORK_PASSPHRASE;
  }

  /**
   * Convert USD cents to XLM stroops
   */
  async convertCentsToStroops(cents: number): Promise<number> {
    // For POC, use fixed rate
    // In production, fetch from price oracle
    const xlmPrice = STELLAR_CONFIG.XLM_TO_USD_RATE;
    const usdAmount = cents / 100;
    const xlmAmount = usdAmount / xlmPrice;
    const stroops = Math.floor(xlmAmount * 10_000_000);
    
    // Ensure minimum tip amount
    return Math.max(stroops, STELLAR_CONFIG.MINIMUM_TIP_STROOPS);
  }

  /**
   * Convert XLM stroops to USD
   */
  convertStroopsToUSD(stroops: number): number {
    const xlmAmount = stroops / 10_000_000;
    return xlmAmount * STELLAR_CONFIG.XLM_TO_USD_RATE;
  }

  /**
   * Create a new Stellar account (for POC - server-side)
   */
  async createAccount(): Promise<StellarSdk.Keypair> {
    const keypair = StellarSdk.Keypair.random();
    
    // Fund account on testnet
    if (STELLAR_CONFIG.NETWORK === 'TESTNET') {
      try {
        await fetch(
          `https://friendbot.stellar.org?addr=${keypair.publicKey()}`
        );
      } catch (error) {
        console.error('Failed to fund testnet account:', error);
      }
    }
    
    return keypair;
  }

  /**
   * Get account balance
   */
  async getBalance(publicKey: string): Promise<AuthorBalance> {
    try {
      const account = await this.server.loadAccount(publicKey);
      const xlmBalance = account.balances.find(
        (balance) => balance.asset_type === 'native'
      );
      
      const balanceStroops = xlmBalance 
        ? Math.floor(parseFloat(xlmBalance.balance) * 10_000_000)
        : 0;
      
      return {
        address: publicKey,
        balance: balanceStroops,
        balanceXLM: balanceStroops / 10_000_000,
        balanceUSD: this.convertStroopsToUSD(balanceStroops),
        pendingWithdrawal: false,
      };
    } catch {
      // Account doesn't exist or other error
      return {
        address: publicKey,
        balance: 0,
        balanceXLM: 0,
        balanceUSD: 0,
        pendingWithdrawal: false,
      };
    }
  }

  /**
   * Send a simple XLM payment (for POC)
   */
  async sendPayment(
    sourceKeypair: StellarSdk.Keypair,
    destinationId: string,
    amountStroops: number
  ): Promise<TransactionResult> {
    try {
      const sourceAccount = await this.server.loadAccount(sourceKeypair.publicKey());
      const xlmAmount = (amountStroops / 10_000_000).toFixed(7);
      
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: destinationId,
            asset: StellarSdk.Asset.native(),
            amount: xlmAmount,
          })
        )
        .setTimeout(30)
        .build();
      
      transaction.sign(sourceKeypair);
      
      const result = await this.server.submitTransaction(transaction);
      
      return {
        success: true,
        hash: result.hash,
      };
    } catch (error) {
      console.error('Payment failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Call the tipping smart contract (simplified for POC)
   * In production, this would use Soroban contract calls
   */
  async tipArticle(params: TipParams): Promise<TipReceipt> {
    const stroops = await this.convertCentsToStroops(params.amountCents);
    
    // Calculate fees
    const platformFee = Math.floor((stroops * STELLAR_CONFIG.PLATFORM_FEE_BPS) / 10_000);
    const authorReceived = stroops - platformFee;
    
    // For POC, return mock receipt
    // In production, this would call the actual smart contract
    const receipt: TipReceipt = {
      tipId: `tip_${Date.now()}`,
      amountSent: stroops,
      authorReceived,
      platformFee,
      timestamp: new Date(),
      transactionHash: `mock_tx_${Date.now()}`,
    };
    
    return receipt;
  }

  /**
   * Get article tips (mock for POC)
   */
  async getArticleTips(_articleId: string): Promise<TipData[]> {
    // In production, this would query the smart contract
    // For POC, return empty array or mock data
    return [];
  }

  /**
   * Withdraw earnings (mock for POC)
   */
  async withdrawEarnings(_authorAddress: string): Promise<TransactionResult> {
    // In production, this would call the withdraw function on the smart contract
    return {
      success: true,
      hash: `mock_withdraw_${Date.now()}`,
    };
  }

  /**
   * Get current XLM price (mock for POC)
   */
  async getXLMPrice(): Promise<XLMPriceData> {
    // In production, fetch from price oracle
    // For POC, use fixed rate
    return {
      price: STELLAR_CONFIG.XLM_TO_USD_RATE,
      timestamp: new Date(),
    };
  }

  /**
   * Fund testnet account (development only)
   */
  async fundTestnetAccount(publicKey: string): Promise<boolean> {
    if (STELLAR_CONFIG.NETWORK !== 'TESTNET') {
      console.error('Can only fund accounts on testnet');
      return false;
    }
    
    try {
      const response = await fetch(
        `https://friendbot.stellar.org?addr=${publicKey}`
      );
      return response.ok;
    } catch (error) {
      console.error('Failed to fund account:', error);
      return false;
    }
  }
}

// Export singleton instance
export const stellarClient = new StellarClient();