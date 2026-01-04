import * as StellarSdk from '@stellar/stellar-sdk'
import { STELLAR_CONFIG } from './config'
// Note: Memos cannot be used with Soroban source account auth
// (Stellar protocol restriction: "non-source auth Soroban tx uses memo or muxed source account")
import type {
  TipParams,
  TipReceipt,
  TransactionResult,
  AuthorBalance,
  TipData,
  XLMPriceData,
} from './types'

// Cache for XLM price to avoid excessive API calls
let xlmPriceCache: { price: number; timestamp: number } | null = null;
const PRICE_CACHE_TTL = 60 * 1000; // 1 minute cache

/**
 * Fetch real-time XLM price from CoinGecko API
 */
async function fetchXLMPrice(): Promise<number> {
  // Return cached price if still valid
  if (xlmPriceCache && Date.now() - xlmPriceCache.timestamp < PRICE_CACHE_TTL) {
    return xlmPriceCache.price;
  }

  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd',
      { next: { revalidate: 60 } } // Cache for 60 seconds
    );

    if (!response.ok) {
      console.warn('[XLM Price] Failed to fetch, using fallback rate');
      return STELLAR_CONFIG.XLM_TO_USD_RATE;
    }

    const data = await response.json();
    const price = data?.stellar?.usd;

    if (typeof price === 'number' && price > 0) {
      xlmPriceCache = { price, timestamp: Date.now() };
      return price;
    }
  } catch (error) {
    console.warn('[XLM Price] API error, using fallback rate:', error);
  }

  // Fallback to config default
  return STELLAR_CONFIG.XLM_TO_USD_RATE;
}

export class StellarClient {
  private server: StellarSdk.Horizon.Server
  private sorobanServer: StellarSdk.rpc.Server
  private networkPassphrase: string

  constructor() {
    this.server = new StellarSdk.Horizon.Server(STELLAR_CONFIG.HORIZON_URL)
    this.sorobanServer = new StellarSdk.rpc.Server(STELLAR_CONFIG.SOROBAN_RPC_URL)
    this.networkPassphrase = STELLAR_CONFIG.NETWORK_PASSPHRASE
  }

  /**
   * Convert USD cents to XLM stroops (using real-time price)
   */
  async convertCentsToStroops(cents: number): Promise<number> {
    const xlmPrice = await fetchXLMPrice();
    const usdAmount = cents / 100
    const xlmAmount = usdAmount / xlmPrice
    const stroops = Math.floor(xlmAmount * 10_000_000)

    // Ensure minimum tip amount
    return Math.max(stroops, STELLAR_CONFIG.MINIMUM_TIP_STROOPS)
  }

  /**
   * Convert XLM stroops to USD (using real-time price)
   */
  async convertStroopsToUSD(stroops: number): Promise<number> {
    const xlmPrice = await fetchXLMPrice();
    const xlmAmount = stroops / 10_000_000
    return xlmAmount * xlmPrice
  }

  /**
   * Get current XLM price in USD
   */
  async getXLMPrice(): Promise<number> {
    return fetchXLMPrice();
  }

  /**
   * Create a new Stellar account (for POC - server-side)
   */
  async createAccount(): Promise<StellarSdk.Keypair> {
    const keypair = StellarSdk.Keypair.random()

    // Fund account on testnet
    if (STELLAR_CONFIG.NETWORK === 'TESTNET') {
      try {
        await fetch(`https://friendbot.stellar.org?addr=${keypair.publicKey()}`)
      } catch (error) {
        console.error('Failed to fund testnet account:', error)
      }
    }

    return keypair
  }

  /**
   * Get account balance
   */
  async getBalance(publicKey: string): Promise<AuthorBalance> {
    try {
      const account = await this.server.loadAccount(publicKey)
      const xlmBalance = account.balances.find(
        (balance) => balance.asset_type === 'native'
      )

      const balanceStroops = xlmBalance
        ? Math.floor(parseFloat(xlmBalance.balance) * 10_000_000)
        : 0

      return {
        address: publicKey,
        balance: balanceStroops,
        balanceXLM: balanceStroops / 10_000_000,
        balanceUSD: await this.convertStroopsToUSD(balanceStroops),
        pendingWithdrawal: false,
      }
    } catch {
      // Account doesn't exist or other error
      return {
        address: publicKey,
        balance: 0,
        balanceXLM: 0,
        balanceUSD: 0,
        pendingWithdrawal: false,
      }
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
      const sourceAccount = await this.server.loadAccount(
        sourceKeypair.publicKey()
      )
      const xlmAmount = (amountStroops / 10_000_000).toFixed(7)

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
        .addMemo(StellarSdk.Memo.text('payment')) // Simple payment identifier
        .setTimeout(30)
        .build()

      transaction.sign(sourceKeypair)

      const result = await this.server.submitTransaction(transaction)

      return {
        success: true,
        hash: result.hash,
      }
    } catch (error) {
      console.error('Payment failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Build transaction for tipping smart contract
   * Returns XDR that needs to be signed by Freighter wallet
   */
  async buildTipTransaction(
    tipperPublicKey: string,
    params: TipParams
  ): Promise<{
    xdr: string
    stroops: number
    authorReceived: number
    platformFee: number
  }> {
    const stroops = await this.convertCentsToStroops(params.amountCents)
    const platformFee = Math.floor((stroops * STELLAR_CONFIG.PLATFORM_FEE_BPS) / 10_000)
    const authorReceived = stroops - platformFee

    // Load the tipper's account
    const account = await this.server.loadAccount(tipperPublicKey)

    // Create contract instance
    const contract = new StellarSdk.Contract(STELLAR_CONFIG.TIPPING_CONTRACT_ID)

    // Convert stroops to BigInt for i128 (required by Soroban)
    const stroopsBigInt = BigInt(stroops)

    // Build the transaction (no memo - not allowed with Soroban source account auth)
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'tip_article',
          StellarSdk.nativeToScVal(tipperPublicKey, { type: 'address' }),
          StellarSdk.nativeToScVal(params.articleId.slice(0, 10), { type: 'symbol' }), // truncated for Symbol limit
          StellarSdk.nativeToScVal(params.authorAddress, { type: 'address' }),
          StellarSdk.nativeToScVal(stroopsBigInt, { type: 'i128' })
        )
      )
      .setTimeout(180)
      .build()

    // Prepare transaction for Soroban
    const preparedTransaction = await this.sorobanServer.prepareTransaction(transaction)

    return {
      xdr: preparedTransaction.toXDR(),
      stroops,
      authorReceived,
      platformFee,
    }
  }

  /**
   * Build transaction for highlight tipping
   * Uses same TIPPING_CONTRACT_ID (unified contract for article + highlight tipping)
   */
  async buildHighlightTipTransaction(
    tipperPublicKey: string,
    params: {
      highlightId: string
      articleId: string
      authorAddress: string
      amountCents: number
    }
  ): Promise<{
    xdr: string
    stroops: number
    authorReceived: number
    platformFee: number
  }> {
    const stroops = await this.convertCentsToStroops(params.amountCents)
    const platformFee = Math.floor((stroops * STELLAR_CONFIG.PLATFORM_FEE_BPS) / 10_000)
    const authorReceived = stroops - platformFee

    // Load the tipper's account
    const account = await this.server.loadAccount(tipperPublicKey)

    // Create contract instance for unified TIPPING contract (handles both article + highlight)
    const contract = new StellarSdk.Contract(STELLAR_CONFIG.TIPPING_CONTRACT_ID)

    // Convert stroops to BigInt for i128 (required by Soroban)
    const stroopsBigInt = BigInt(stroops)

    // Build the transaction (no memo - not allowed with Soroban source account auth)
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'tip_highlight_direct',
          StellarSdk.nativeToScVal(tipperPublicKey, { type: 'address' }),
          StellarSdk.nativeToScVal(params.highlightId, { type: 'string' }),
          StellarSdk.nativeToScVal(params.articleId.slice(0, 10), { type: 'symbol' }), // truncated for Symbol limit
          StellarSdk.nativeToScVal(params.authorAddress, { type: 'address' }),
          StellarSdk.nativeToScVal(stroopsBigInt, { type: 'i128' })
        )
      )
      .setTimeout(180)
      .build()

    // Prepare transaction for Soroban
    const preparedTransaction = await this.sorobanServer.prepareTransaction(transaction)

    return {
      xdr: preparedTransaction.toXDR(),
      stroops,
      authorReceived,
      platformFee,
    }
  }

  /**
   * Submit signed transaction to network
   */
  async submitTipTransaction(signedXDR: string): Promise<TipReceipt> {
    const transaction = StellarSdk.TransactionBuilder.fromXDR(signedXDR, this.networkPassphrase)

    // Submit transaction
    const result = await this.sorobanServer.sendTransaction(transaction)

    if (result.status === 'PENDING') {
      // Wait for transaction to be included in ledger
      let txResult = await this.sorobanServer.getTransaction(result.hash)
      let retries = 0
      const maxRetries = 30 // 30 seconds timeout

      while (txResult.status === 'NOT_FOUND' && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        txResult = await this.sorobanServer.getTransaction(result.hash)
        retries++
      }

      if (txResult.status === 'SUCCESS') {
        // Parse the return value from contract
        const returnValue = txResult.returnValue
        if (returnValue) {
          // The contract returns a TipReceipt struct
          const receipt = StellarSdk.scValToNative(returnValue)

          return {
            tipId: receipt.tip_id.toString(),
            amountSent: receipt.amount_sent,
            authorReceived: receipt.author_received,
            platformFee: receipt.platform_fee,
            timestamp: new Date(Number(receipt.timestamp) * 1000),
            transactionHash: result.hash,
          }
        }
      } else if (txResult.status === 'FAILED') {
        throw new Error('Transaction failed on the network')
      } else if (txResult.status === 'NOT_FOUND' && retries >= maxRetries) {
        throw new Error('Transaction timeout: Could not confirm transaction after 30 seconds')
      }
    }

    // Handle error cases
    const errorMessage = result.errorResult
      ? `Transaction failed: ${JSON.stringify(result.errorResult)}`
      : `Transaction failed with status: ${result.status}`

    throw new Error(errorMessage)
  }

  /**
   * Get article tips from smart contract
   */
  async getArticleTips(articleId: string): Promise<TipData[]> {
    try {
      const contract = new StellarSdk.Contract(STELLAR_CONFIG.TIPPING_CONTRACT_ID)

      // Create a dummy account for simulation (we just need to read data)
      const account = new StellarSdk.Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0')

      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          contract.call('get_article_tips', StellarSdk.nativeToScVal(articleId.slice(0, 10), { type: 'symbol' }))
        )
        .setTimeout(30)
        .build()

      const result = await this.sorobanServer.simulateTransaction(transaction)

      if (StellarSdk.rpc.Api.isSimulationSuccess(result) && result.result?.retval) {
        const tips = StellarSdk.scValToNative(result.result.retval)
        return tips.map((tip: { tipper: string; amount: number; timestamp: number }) => ({
          tipper: tip.tipper,
          amount: tip.amount,
          timestamp: new Date(tip.timestamp * 1000),
        }))
      }

      return []
    } catch (error) {
      console.error('Error getting article tips:', error)
      return []
    }
  }

  /**
   * Withdraw earnings (mock for POC)
   */
  async withdrawEarnings() // _authorAddress: string

  : Promise<TransactionResult> {
    // In production, this would call the withdraw function on the smart contract
    return {
      success: true,
      hash: `mock_withdraw_${Date.now()}`,
    }
  }

  /**
   * Get current XLM price with metadata
   */
  async getXLMPriceData(): Promise<XLMPriceData> {
    const price = await fetchXLMPrice();
    return {
      price,
      timestamp: new Date(),
    }
  }

  /**
   * Fund testnet account (development only)
   */
  async fundTestnetAccount(publicKey: string): Promise<boolean> {
    if (STELLAR_CONFIG.NETWORK !== 'TESTNET') {
      console.error('Can only fund accounts on testnet')
      return false
    }

    try {
      const response = await fetch(
        `https://friendbot.stellar.org?addr=${publicKey}`
      )
      return response.ok
    } catch (error) {
      console.error('Failed to fund account:', error)
      return false
    }
  }
}

// Export singleton instance
export const stellarClient = new StellarClient()
