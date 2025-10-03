# 🎯 Implementation Plan: Granular Highlight Tipping System
### Deliverable 1 - Tranche 1 - MVP (Weeks 1-4) - UPDATED FOR CURRENT CODEBASE

**IMPORTANT: This plan has been adjusted based on existing wallet infrastructure implementation.**

## 🔄 What's Already Implemented (Foundation Complete!)

### ✅ **Stellar Wallet Kit Integration** - PRODUCTION READY
- Multi-wallet support: Freighter, xBull, Albedo, Rabet, Hana, HOT Wallet
- `WalletProvider` with React context at `/components/providers/WalletProvider.tsx`
- `useStellarWallet()` hook at `/hooks/useStellarWallet.ts`
- `walletAdapter` singleton at `/lib/stellar/wallet-adapter.ts`
- UI components: `WalletConnectButton`, `WalletStatus`, `WalletSettings`
- Features: Connection caching, retry logic, account/network watchers
- **No need to rebuild this - just use it!**

### ✅ **Article-Level Tipping Contract** - FULLY FUNCTIONAL
- Soroban smart contract at `/contracts/tipping/src/lib.rs`
- `tip_article()` function with direct XLM transfers
- Platform fee calculation (2.5%)
- NFT threshold tracking via `ArticleTotalTips`
- Deployed contract ID: `CBSVFVIDV2U3SSY36TJ3MDGQDSQL3ZVL2TR7GMRBXJ3XZBE24FDHHWAM`
- **Keep this as-is, extend for highlights**

### ✅ **Convex Database Schema** - WELL-DESIGNED
- `users` table with `stellarAddress` field
- `tips` table with Stellar transaction tracking
- `highlights` table (text selection only, ready for tipping)
- `authorEarnings` for analytics
- **Extend with highlight tip tables**

### ✅ **Stellar Client Infrastructure**
- Transaction builder at `/lib/stellar/client.ts`
- `TipButton` component with wallet integration
- Network configuration at `/lib/stellar/config.ts`
- **Reuse for highlight transactions**

---

Based on the complete **Technical Architecture** with payment channels and the existing codebase analysis, here's the adjusted implementation plan:

## 🏗️ Adjusted Architecture Overview

### **Hybrid Tipping Strategy**
The key innovation is using payment channels **ONLY for micropayments** while keeping direct transactions for larger tips:

```
ARTICLE TIPS ($1-$100):
User clicks tip → Existing wallet popup → Direct Stellar transfer → Author receives instantly
✅ Already working via existing TipButton component

HIGHLIGHT TIPS (< $0.10):
User deposits $5 → Opens payment channel → Tips accumulate off-chain →
Batch settlement every 100 tips or 24 hours → Authors receive funds
🔨 New system to implement

HIGHLIGHT TIPS (>= $0.10):
User clicks tip → Existing wallet popup → Direct Stellar transfer → Author receives instantly
🔨 New button, existing infrastructure
```

### **Why This Hybrid Approach?**
1. **Leverage existing wallet infrastructure** - Don't rebuild what works
2. **Payment channels only where needed** - Micropayments < $0.10
3. **Simpler for users** - Familiar flow for larger tips
4. **Cost-efficient** - No fees on micro-tips, direct transfers for larger amounts

## 📋 Adjusted Implementation Phases

### **Phase 1: Extend Existing Soroban Contract**

#### 1.1 Extend Existing Tipping Contract for Highlights
**Location:** `/contracts/tipping/src/lib.rs`
**Strategy:** Add new functions alongside existing `tip_article()` - DO NOT modify existing code

```rust
// contracts/tipping/src/lib.rs - ADD to existing contract (keep tip_article unchanged!)

#[derive(Clone)]
#[contracttype]
pub struct HighlightTip {
    pub highlight_id: String,    // Unique highlight identifier
    pub article_id: Symbol,       // Parent article
    pub tipper: Address,
    pub amount: i128,
    pub channel_id: Option<u64>,  // Payment channel reference
    pub timestamp: u64,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    // ... existing keys ...
    HighlightTips(String),           // Highlight ID → Tips
    PaymentChannel(Address, u64),    // User → Channel
    ChannelBalance(u64),             // Channel ID → Balance
    PendingSettlement(u64),          // Channel → Pending tips
}

#[contractimpl]
impl TippingContract {
    /// Open payment channel for batch micropayments
    pub fn open_channel(
        env: Env,
        user: Address,
        initial_deposit: i128,
        article_id: Symbol
    ) -> u64 {
        user.require_auth();
        // Generate channel ID
        let channel_id = get_next_channel_id(&env);

        // Lock funds in contract
        let xlm_client = get_xlm_client(&env);
        xlm_client.transfer(&user, &env.current_contract_address(), &initial_deposit);

        // Store channel state
        env.storage().persistent().set(
            &DataKey::PaymentChannel(user.clone(), channel_id),
            &initial_deposit
        );

        channel_id
    }

    /// Record highlight tip (off-chain accumulation)
    pub fn tip_highlight_offchain(
        env: Env,
        channel_id: u64,
        highlight_id: String,
        amount: i128
    ) -> Result<(), Error> {
        // Validate channel has sufficient balance
        let balance = get_channel_balance(&env, channel_id)?;
        if balance < amount {
            return Err(Error::InsufficientChannelBalance);
        }

        // Add to pending settlement queue
        add_pending_tip(&env, channel_id, highlight_id, amount);

        Ok(())
    }

    /// Batch settle channel tips
    pub fn settle_channel(
        env: Env,
        channel_id: u64
    ) -> Vec<TipReceipt> {
        // Get all pending tips
        let pending_tips = get_pending_tips(&env, channel_id);

        // Group by author and transfer
        let settlements = group_and_transfer_tips(&env, pending_tips);

        // Clear pending queue
        clear_pending_tips(&env, channel_id);

        settlements
    }
}
```

#### 1.2 Add Direct Highlight Tipping Function (for tips >= $0.10)
```rust
// contracts/tipping/src/lib.rs - ADD this function

/// Tip a highlight directly (for larger tips, no channel needed)
pub fn tip_highlight_direct(
    env: Env,
    tipper: Address,
    highlight_id: String,
    article_id: Symbol,
    author: Address,
    amount: i128,
) -> TipReceipt {
    tipper.require_auth();

    // Similar to tip_article but tracks highlight_id
    // Use existing fee calculation and transfer logic
    // Store in HighlightTips(highlight_id) key

    // ... implementation using existing tip_article logic
}
```

#### 1.3 Implement Highlight ID Generation
**Location:** `/lib/stellar/highlight-utils.ts` (NEW FILE)

```typescript
// lib/stellar/highlight-utils.ts - CREATE this file
import { createHash } from 'crypto';

export function generateHighlightId(
  articleId: string,
  text: string,
  startOffset: number,
  endOffset: number
): string {
  // Create deterministic ID from highlight properties
  const data = `${articleId}:${startOffset}:${endOffset}:${text.slice(0, 50)}`;

  // Generate SHA256 hash
  const hash = createHash('sha256')
    .update(data)
    .digest('hex');

  // Return first 28 chars for Stellar memo compatibility
  return hash.slice(0, 28);
}

// Store mapping in Convex for full data retrieval
export async function storeHighlightMapping(
  highlightId: string,
  fullData: HighlightData
) {
  await convex.mutation(api.highlights.storeMapping, {
    shortId: highlightId,
    fullData
  });
}
```

### **Phase 2: Frontend Integration (Leverage Existing Infrastructure)**

#### 2.1 Create Highlight Tip Button Component
**Location:** `/components/highlights/HighlightTipButton.tsx` (NEW FILE)
**Strategy:** Reuse existing wallet infrastructure

```typescript
// components/highlights/HighlightTipButton.tsx - CREATE this file
import { useWallet } from '@/components/providers/WalletProvider'; // ✅ EXISTING
import { stellarClient } from '@/lib/stellar/client'; // ✅ EXISTING

export function HighlightTipButton({
  highlightId,
  highlightText,
  articleId,
  authorAddress
}: Props) {
  // ✅ Use EXISTING wallet hook (already implemented!)
  const { isConnected, publicKey, signTransaction } = useWallet();
  const { channel } = usePaymentChannel(); // 🔨 NEW: for micropayments

  const tipHighlight = async (amountCents: number) => {
    if (!isConnected) {
      // ✅ Use EXISTING connect flow from WalletProvider
      return;
    }

    if (amountCents >= 10) {
      // DIRECT TIP: Use existing Stellar client
      const txData = await stellarClient.buildHighlightTipTransaction(
        publicKey!,
        { highlightId, authorAddress, amountCents }
      );

      // ✅ Use EXISTING signTransaction from useWallet hook
      const signedXDR = await signTransaction(txData.xdr);

      // ✅ Use EXISTING submit method
      await stellarClient.submitTipTransaction(signedXDR);
    } else {
      // MICROPAYMENT: Use payment channel (new system)
      await channel.addHighlightTip(highlightId, amountCents);
    }
  };

  return (
    <div className="highlight-tip-buttons">
      <button onClick={() => tipHighlight(1)}>1¢</button>
      <button onClick={() => tipHighlight(10)}>10¢</button>
      <button onClick={() => tipHighlight(100)}>$1</button>
    </div>
  );
}
```

#### 2.2 Extend Stellar Client for Highlight Transactions
**Location:** `/lib/stellar/client.ts` (EXTEND EXISTING FILE)

```typescript
// lib/stellar/client.ts - ADD these methods to existing StellarClient class

export class StellarClient {
  // ... existing methods (buildTipTransaction, submitTipTransaction, etc.) ...

  /**
   * Build transaction for highlight tipping (>= $0.10)
   * Similar to existing buildTipTransaction but uses tip_highlight_direct
   */
  async buildHighlightTipTransaction(
    tipperPublicKey: string,
    params: {
      highlightId: string;
      articleId: string;
      authorAddress: string;
      amountCents: number;
    }
  ): Promise<{ xdr: string; stroops: number }> {
    // ✅ Reuse existing conversion utilities
    const stroops = await this.convertCentsToStroops(params.amountCents);

    // ✅ Reuse existing account loading
    const account = await this.server.loadAccount(tipperPublicKey);

    // ✅ Use existing contract reference (same contract!)
    const contract = new StellarSdk.Contract(STELLAR_CONFIG.TIPPING_CONTRACT_ID);

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'tip_highlight_direct', // NEW function we added
          StellarSdk.nativeToScVal(tipperPublicKey, { type: 'address' }),
          StellarSdk.nativeToScVal(params.highlightId, { type: 'string' }),
          StellarSdk.nativeToScVal(params.articleId, { type: 'symbol' }),
          StellarSdk.nativeToScVal(params.authorAddress, { type: 'address' }),
          StellarSdk.nativeToScVal(stroops, { type: 'i128' })
        )
      )
      .setTimeout(180)
      .build();

    // ✅ Reuse existing Soroban preparation
    const preparedTransaction = await this.sorobanServer.prepareTransaction(transaction);

    return {
      xdr: preparedTransaction.toXDR(),
      stroops,
    };
  }

  // submitTipTransaction remains unchanged - already works!
}
```

#### 2.3 Payment Channel Manager Service (for micropayments < $0.10)
**Location:** `/services/payment-channel-manager.ts` (NEW FILE)

```typescript
// services/payment-channel-manager.ts - CREATE this file
export class PaymentChannelManager {
  private channels: Map<string, PaymentChannel> = new Map();

  async openChannel(userId: string, amount: number): Promise<PaymentChannel> {
    // Build Stellar transaction for channel opening
    const tx = await stellarClient.buildChannelOpen({
      user: userId,
      deposit: amount * 10_000_000, // Convert to stroops
      contractId: STELLAR_CONFIG.TIPPING_CONTRACT_ID
    });

    // Get user signature
    const signedTx = await walletSignTransaction(tx);

    // Submit to network
    const result = await stellarClient.submitTransaction(signedTx);

    // Create local channel tracking
    const channel = new PaymentChannel({
      id: result.channelId,
      userId,
      balance: amount,
      tips: [],
      createdAt: Date.now()
    });

    this.channels.set(channel.id, channel);

    // Store in Convex for persistence
    await convex.mutation(api.paymentChannels.create, channel);

    return channel;
  }

  async addHighlightTip(
    channelId: string,
    highlightId: string,
    amount: number
  ): Promise<void> {
    const channel = this.channels.get(channelId);
    if (!channel) throw new Error('Channel not found');

    if (channel.balance < amount) {
      throw new Error('Insufficient channel balance');
    }

    // Add tip to local queue
    channel.tips.push({
      highlightId,
      amount,
      timestamp: Date.now()
    });

    channel.balance -= amount;

    // Update Convex
    await convex.mutation(api.paymentChannels.addTip, {
      channelId,
      highlightId,
      amount
    });

    // Auto-settle if threshold reached
    if (channel.tips.length >= 100 ||
        Date.now() - channel.lastSettlement > 24 * 60 * 60 * 1000) {
      await this.settleChannel(channelId);
    }
  }

  async settleChannel(channelId: string): Promise<SettlementResult> {
    const channel = this.channels.get(channelId);
    if (!channel || channel.tips.length === 0) return;

    // Build settlement transaction
    const tx = await stellarClient.buildChannelSettle({
      channelId,
      tips: channel.tips,
      contractId: STELLAR_CONFIG.TIPPING_CONTRACT_ID
    });

    // Submit to Stellar
    const result = await stellarClient.submitTransaction(tx);

    // Clear local tips
    channel.tips = [];
    channel.lastSettlement = Date.now();

    // Update Convex
    await convex.mutation(api.paymentChannels.settle, {
      channelId,
      transactionHash: result.hash
    });

    return result;
  }
}
```

#### 2.4 Convex Schema Extensions
**Location:** `/convex/schema.ts` (EXTEND EXISTING FILE)

```typescript
// convex/schema.ts - ADD these tables to existing schema
paymentChannels: defineTable({
  userId: v.id("users"),
  channelId: v.string(),
  balance: v.number(),
  initialDeposit: v.number(),
  tipsCount: v.number(),
  lastSettlement: v.optional(v.number()),
  status: v.string(), // OPEN, SETTLING, CLOSED
  stellarChannelId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
.index("by_user", ["userId"])
.index("by_channel", ["channelId"]),

pendingHighlightTips: defineTable({
  channelId: v.string(),
  highlightId: v.string(),
  articleId: v.id("articles"),
  amount: v.number(),
  status: v.string(), // PENDING, SETTLING, SETTLED
  createdAt: v.number(),
})
.index("by_channel", ["channelId"])
.index("by_highlight", ["highlightId"]),

// Track all highlight tips (both direct and channel-based)
highlightTips: defineTable({
  highlightId: v.string(),
  articleId: v.id("articles"),
  tipperId: v.id("users"),
  authorId: v.id("articles"),
  amountCents: v.number(),

  // Stellar transaction data (for direct tips >= $0.10)
  stellarTxId: v.optional(v.string()),
  stellarNetwork: v.optional(v.string()),

  // Payment channel data (for micropayments < $0.10)
  channelId: v.optional(v.string()),

  status: v.string(), // PENDING, CONFIRMED, SETTLED
  createdAt: v.number(),
  processedAt: v.optional(v.number()),
})
.index("by_highlight", ["highlightId"])
.index("by_article", ["articleId"])
.index("by_tipper", ["tipperId"])
.index("by_author", ["authorId"]),
```

### **Phase 3: Heatmap Visualization & Analytics**

#### 3.1 Heatmap Data Aggregation Service
**Location:** `/lib/services/highlight-heatmap.ts` (NEW FILE)

```typescript
// lib/services/highlight-heatmap.ts - CREATE this file
import { api } from '@/convex/_generated/api';

export class HighlightHeatmapService {
  /**
   * Generate heatmap data for an article
   * Aggregates all highlight tips by position
   */
  async generateHeatmap(articleId: string): Promise<HeatmapData> {
    // Query Convex for all highlight tips for this article
    const highlights = await convex.query(api.highlightTips.getByArticle, {
      articleId
    });

    // Group by highlight ID and sum tips
    const heatmapData = highlights.reduce((acc, tip) => {
      if (!acc[tip.highlightId]) {
        acc[tip.highlightId] = {
          highlightId: tip.highlightId,
          text: tip.highlightText,
          startOffset: tip.startOffset,
          endOffset: tip.endOffset,
          totalTips: 0,
          tipCount: 0,
          position: calculatePosition(tip),
        };
      }

      acc[tip.highlightId].totalTips += tip.amountCents;
      acc[tip.highlightId].tipCount += 1;

      return acc;
    }, {} as Record<string, HeatmapPoint>);

    return Object.values(heatmapData);
  }
}
```

#### 3.2 Channel Management UI (for micropayments)
**Location:** `/components/payment/ChannelManager.tsx` (NEW FILE)

```typescript
// components/payment/ChannelManager.tsx - CREATE this file
import { useWallet } from '@/components/providers/WalletProvider'; // ✅ EXISTING
export function ChannelManager() {
  const [channel, setChannel] = useState<PaymentChannel | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  const openChannel = async (amount: number) => {
    setIsOpening(true);
    try {
      const manager = new PaymentChannelManager();
      const newChannel = await manager.openChannel(userId, amount);
      setChannel(newChannel);

      toast.success(`Channel opened with $${amount} deposit`);
    } catch (error) {
      toast.error('Failed to open payment channel');
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <div className="channel-manager">
      {!channel ? (
        <div className="open-channel-prompt">
          <h3>Enable Micropayments</h3>
          <p>Deposit funds to tip highlights instantly without fees</p>
          <div className="deposit-options">
            <button onClick={() => openChannel(5)}>$5</button>
            <button onClick={() => openChannel(10)}>$10</button>
            <button onClick={() => openChannel(20)}>$20</button>
          </div>
        </div>
      ) : (
        <div className="channel-status">
          <div className="balance">
            Balance: ${channel.balance.toFixed(2)}
          </div>
          <div className="tips-pending">
            {channel.tips.length} tips pending
          </div>
          <button onClick={() => channel.settle()}>
            Settle Now
          </button>
        </div>
      )}
    </div>
  );
}
```

#### 3.3 Highlight Heatmap Visualization Component
**Location:** `/components/dashboard/HighlightHeatmap.tsx` (NEW FILE)

```typescript
// components/dashboard/HighlightHeatmap.tsx - CREATE this file
import { HighlightHeatmapService } from '@/lib/services/highlight-heatmap'; // NEW

export function HighlightHeatmap({ articleId }: Props) {
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function loadHeatmap() {
      const service = new HighlightHeatmapService();
      const data = await service.generateHeatmap(articleId);
      setHeatmapData(data);
    }
    loadHeatmap();
  }, [articleId]);

  useEffect(() => {
    if (!heatmapData || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Render heatmap with D3.js color scales
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
      .domain([0, Math.max(...heatmapData.map(h => h.totalTips))]);

    heatmapData.forEach(highlight => {
      const intensity = colorScale(highlight.totalTips);

      // Draw highlight region with intensity color
      ctx.fillStyle = intensity;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(
        highlight.position.x,
        highlight.position.y,
        highlight.position.width,
        highlight.position.height
      );
    });

    // Add interactive tooltips
    canvasRef.current.addEventListener('mousemove', (e) => {
      const highlight = findHighlightAtPosition(e.offsetX, e.offsetY, heatmapData);
      if (highlight) {
        showTooltip(highlight);
      }
    });
  }, [heatmapData]);

  return (
    <div className="heatmap-container">
      <canvas ref={canvasRef} className="article-heatmap" />
      <HeatmapLegend
        min={0}
        max={heatmapData ? Math.max(...heatmapData.map(h => h.totalTips)) : 0}
      />
      <ExportButton data={heatmapData} />
    </div>
  );
}
```

#### 3.4 Simplified Highlight Tip Flow (No Payment Channel)
For users who just want to tip a highlight >= $0.10 without using micropayment channels:

```typescript
// This uses EXISTING wallet infrastructure
const tipHighlight = async (highlightId: string, amountCents: number) => {
  // ✅ Use EXISTING wallet connection check
  const { isConnected, publicKey, signTransaction } = useWallet();

  if (!isConnected) {
    toast.error('Please connect your wallet');
    return;
  }

  // ✅ Use EXTENDED stellar client (new method, existing class)
  const txData = await stellarClient.buildHighlightTipTransaction(
    publicKey!,
    { highlightId, authorAddress, amountCents }
  );

  // ✅ Use EXISTING signTransaction method
  const signedXDR = await signTransaction(txData.xdr);

  // ✅ Use EXISTING submitTipTransaction method (works for all contract calls)
  const receipt = await stellarClient.submitTipTransaction(signedXDR);

  toast.success(`Tipped ${(amountCents / 100).toFixed(2)} to highlight!`);
};
```

**Key insight:** We're just adding a new contract function (`tip_highlight_direct`) and new client method (`buildHighlightTipTransaction`), but reusing ALL the wallet/signing/submission infrastructure!

### **Phase 4: Convex Mutations & Queries**

#### 4.1 Highlight Tip Mutations
**Location:** `/convex/highlightTips.ts` (NEW FILE)

```typescript
// convex/highlightTips.ts - CREATE this file
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Record a highlight tip (from both direct and channel-based tips)
export const create = mutation({
  args: {
    highlightId: v.string(),
    articleId: v.id('articles'),
    amountCents: v.number(),
    stellarTxId: v.optional(v.string()),
    channelId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    // Get user and article info
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', q => q.eq('email', identity.email))
      .first();

    const article = await ctx.db.get(args.articleId);

    if (!user || !article) throw new Error('Invalid data');

    // Create tip record
    return await ctx.db.insert('highlightTips', {
      highlightId: args.highlightId,
      articleId: args.articleId,
      tipperId: user._id,
      authorId: article.authorId,
      amountCents: args.amountCents,
      stellarTxId: args.stellarTxId,
      stellarNetwork: args.stellarTxId ? 'TESTNET' : undefined,
      channelId: args.channelId,
      status: args.stellarTxId ? 'CONFIRMED' : 'PENDING',
      createdAt: Date.now(),
    });
  },
});

// Get all tips for a highlight (for tooltip display)
export const getByHighlight = query({
  args: { highlightId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('highlightTips')
      .withIndex('by_highlight', q => q.eq('highlightId', args.highlightId))
      .collect();
  },
});

// Get all highlight tips for an article (for heatmap generation)
export const getByArticle = query({
  args: { articleId: v.id('articles') },
  handler: async (ctx, args) => {
    const tips = await ctx.db
      .query('highlightTips')
      .withIndex('by_article', q => q.eq('articleId', args.articleId))
      .collect();

    // Join with highlights table to get text and position data
    const enrichedTips = await Promise.all(
      tips.map(async (tip) => {
        const highlight = await ctx.db
          .query('highlights')
          .filter(q => q.eq(q.field('text'), tip.highlightId)) // Assuming we store hash in text field temporarily
          .first();

        return {
          ...tip,
          highlightText: highlight?.text,
          startOffset: highlight?.startOffset,
          endOffset: highlight?.endOffset,
        };
      })
    );

    return enrichedTips;
  },
});
```

### **Phase 5: Analytics & Dashboard**

#### 5.1 Real-time Analytics Service
```typescript
// services/highlight-analytics.ts
export class HighlightAnalyticsService {
  private redis: Redis;
  private socket: Server;

  constructor() {
    this.redis = new Redis(REDIS_CONFIG);
    this.socket = new Server(SOCKET_CONFIG);
  }

  async trackHighlightTip(
    highlightId: string,
    amount: number,
    userId: string
  ) {
    // Update Redis cache for real-time stats
    await this.redis.hincrby(`highlight:${highlightId}:tips`, 'count', 1);
    await this.redis.hincrbyfloat(`highlight:${highlightId}:tips`, 'total', amount);

    // Emit real-time update via WebSocket
    this.socket.to(`article:${articleId}`).emit('highlight-tip', {
      highlightId,
      amount,
      userId,
      timestamp: Date.now()
    });

    // Update heatmap cache
    await this.updateHeatmapCache(highlightId);

    // Store in PostgreSQL for persistence
    await db.highlightTips.create({
      highlightId,
      amount,
      userId,
      timestamp: new Date()
    });
  }

  async getHighlightStats(highlightId: string): Promise<HighlightStats> {
    // Try Redis cache first
    const cached = await this.redis.hgetall(`highlight:${highlightId}:tips`);

    if (cached && cached.count) {
      return {
        tipCount: parseInt(cached.count),
        totalAmount: parseFloat(cached.total),
        topTippers: await this.getTopTippers(highlightId),
        trend: await this.calculateTrend(highlightId)
      };
    }

    // Fall back to database
    return await this.fetchFromDatabase(highlightId);
  }
}
```

#### 5.2 Author Dashboard Page
```typescript
// app/dashboard/highlights/page.tsx
export default function HighlightDashboard() {
  const { user } = useAuth();
  const analytics = useHighlightAnalytics(user.id);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap Section */}
        <section className="col-span-full">
          <h2>Earning Heatmap</h2>
          <ArticleSelector
            onSelect={(articleId) =>
              <HighlightHeatmap articleId={articleId} />
            }
          />
        </section>

        {/* Top Highlights */}
        <section>
          <h2>Top Earning Highlights</h2>
          <TopHighlightsList
            highlights={analytics.topHighlights}
            limit={10}
          />
        </section>

        {/* Recent Activity */}
        <section>
          <h2>Recent Tips</h2>
          <RecentTipsTimeline
            tips={analytics.recentTips}
            realtime={true}
          />
        </section>

        {/* Statistics */}
        <section className="col-span-full">
          <StatisticsGrid>
            <StatCard
              title="Total Highlight Tips"
              value={analytics.totalHighlightTips}
              change={analytics.tipGrowth}
            />
            <StatCard
              title="Average Tip Amount"
              value={`$${analytics.averageTip.toFixed(2)}`}
            />
            <StatCard
              title="Most Tipped Phrase"
              value={analytics.topPhrase}
              subtext={`${analytics.topPhraseTips} tips`}
            />
            <StatCard
              title="Engagement Rate"
              value={`${analytics.engagementRate}%`}
            />
          </StatisticsGrid>
        </section>
      </div>
    </DashboardLayout>
  );
}
```

### **Phase 6: Testing & Optimization**

#### 6.1 Comprehensive Test Suite
```typescript
// tests/highlight-tipping.test.ts
describe('Highlight Tipping System', () => {
  describe('Payment Channels', () => {
    it('opens channel with correct deposit', async () => {
      const channel = await openChannel(user, 10);
      expect(channel.balance).toBe(10);
      expect(channel.status).toBe('OPEN');
    });

    it('accumulates tips off-chain', async () => {
      const channel = await openChannel(user, 10);

      // Add multiple micro-tips
      for (let i = 0; i < 50; i++) {
        await channel.addTip(highlightIds[i], 0.01);
      }

      expect(channel.tips.length).toBe(50);
      expect(channel.balance).toBe(9.50);
    });

    it('auto-settles at threshold', async () => {
      const channel = await openChannel(user, 10);

      // Add 100 tips to trigger auto-settlement
      for (let i = 0; i < 100; i++) {
        await channel.addTip(highlightIds[i], 0.01);
      }

      // Should auto-settle
      expect(channel.tips.length).toBe(0);
      expect(channel.lastSettlement).toBeCloseTo(Date.now(), -3);
    });
  });

  describe('Heatmap Generation', () => {
    it('generates accurate heatmap data', async () => {
      // Create test highlights with varying tips
      const highlights = await createTestHighlights(20);

      const heatmap = await generateHeatmap(articleId);

      expect(heatmap.highlights).toHaveLength(20);
      expect(heatmap.maxIntensity).toBeGreaterThan(0);
    });

    it('caches heatmap in Redis', async () => {
      const heatmap = await generateHeatmap(articleId);

      const cached = await redis.get(`heatmap:${articleId}`);
      expect(cached).toBeDefined();
      expect(JSON.parse(cached)).toEqual(heatmap);
    });
  });

  describe('Performance', () => {
    it('handles 1000 concurrent tips', async () => {
      const startTime = Date.now();

      const tips = Array(1000).fill(0).map((_, i) =>
        tipHighlight(highlightIds[i % 50], 0.01)
      );

      await Promise.all(tips);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000); // Under 5 seconds
    });
  });
});
```

#### 6.2 Test Data Generator
```typescript
// scripts/generate-test-highlights.ts
async function generateTestHighlights() {
  console.log('🎯 Generating test highlights...');

  const articles = await convex.query(api.articles.getPublished);

  for (const article of articles.slice(0, 5)) {
    console.log(`📝 Processing article: ${article.title}`);

    // Generate 10-20 highlights per article
    const highlightCount = Math.floor(Math.random() * 10) + 10;

    for (let i = 0; i < highlightCount; i++) {
      // Random text selection
      const start = Math.floor(Math.random() * 1000);
      const end = start + Math.floor(Math.random() * 200) + 50;
      const text = extractTextFromContent(article.content, start, end);

      // Create highlight
      const highlightId = generateHighlightId(
        article._id,
        text,
        start,
        end
      );

      await convex.mutation(api.highlights.create, {
        articleId: article._id,
        text,
        startOffset: start,
        endOffset: end,
        uniqueHash: highlightId,
        color: COLORS[i % COLORS.length]
      });

      // Add random tips
      const tipCount = Math.floor(Math.random() * 20);
      for (let j = 0; j < tipCount; j++) {
        const amount = [0.01, 0.10, 1.00][Math.floor(Math.random() * 3)];

        await convex.mutation(api.highlightTips.create, {
          highlightId,
          amount,
          userId: TEST_USER_IDS[j % TEST_USER_IDS.length]
        });
      }
    }
  }

  console.log('✅ Test data generation complete!');
}
```

## ✅ Revised Completion Metrics

### **Technical Deliverables** (Adjusted)

**Week 1-2: Contract Extension**
- [ ] Add `HighlightTip` struct to existing contract
- [ ] Implement `tip_highlight_direct()` function
- [ ] Implement payment channel functions (open, tip offchain, settle)
- [ ] Deploy updated contract to Stellar testnet
- [ ] Test contract functions via Stellar CLI

**Week 2-3: Frontend Integration**
- [ ] Create `highlight-utils.ts` with `generateHighlightId()`
- [ ] Extend `StellarClient` class with `buildHighlightTipTransaction()`
- [ ] Create `HighlightTipButton` component (uses existing wallet hooks)
- [ ] Create `PaymentChannelManager` service
- [ ] Add Convex tables: `highlightTips`, `paymentChannels`, `pendingHighlightTips`
- [ ] Create Convex mutations/queries for highlight tips

**Week 3-4: Heatmap & Analytics**
- [ ] Build `HighlightHeatmapService` for data aggregation
- [ ] Create `HighlightHeatmap` visualization component
- [ ] Add highlight analytics to author dashboard
- [ ] Implement WebSocket for real-time tip updates

**Week 4-5: Testing & Polish**
- [ ] Generate 50+ test highlights with varied tip amounts
- [ ] Test direct highlight tipping flow (>= $0.10)
- [ ] Test payment channel flow (< $0.10): open → tip → settle
- [ ] Performance test: heatmap load time < 500ms
- [ ] E2E test: User connects wallet → tips highlight → author sees update
- [ ] Cross-wallet testing: Freighter, xBull, Albedo

### **Performance Targets**
- [ ] < 3 seconds for direct highlight tip (using existing wallet flow)
- [ ] < 500ms heatmap generation and load time
- [ ] Support $0.01 micropayments via payment channels
- [ ] Batch process 100+ channel tips in single settlement
- [ ] Cache heatmap data for 5 minutes (Redis or in-memory)

### **User Experience Goals**
- [ ] **Leverage existing wallet UX** - Users already know how to connect wallet
- [ ] Instant tip feedback for micropayments (off-chain accumulation)
- [ ] Real-time heatmap updates when new tips arrive
- [ ] Mobile-responsive highlight tip buttons
- [ ] Export heatmap data (CSV/JSON)

## 🚀 Revised Deployment Strategy

### **Phase 1: Local Development & Testing**
- [ ] Deploy updated tipping contract to Stellar testnet
- [ ] Configure local environment with testnet contract ID
- [ ] Test with Freighter wallet on testnet
- [ ] Verify direct tips and payment channels work

### **Phase 2: Vercel Preview Deployment**
- [ ] Deploy frontend to Vercel preview environment
- [ ] Test with multiple wallets (Freighter, xBull, Albedo)
- [ ] Monitor Convex database for tip records
- [ ] Check Stellar testnet explorer for transactions

### **Phase 3: Staging (Testnet + Production Frontend)**
- [ ] Deploy to production Vercel environment
- [ ] Keep using testnet Stellar contract (no real money)
- [ ] Monitor for 48 hours with internal testing
- [ ] Collect UX feedback on highlight tipping flow

### **Phase 4: Mainnet Migration (Future)**
- [ ] Deploy contracts to Stellar mainnet
- [ ] Update `NEXT_PUBLIC_TIPPING_CONTRACT_ID` to mainnet contract
- [ ] Feature flag for 10% rollout
- [ ] Monitor for 1 week before full rollout

## 🎯 Revised Success Criteria

✅ **Users can highlight any text and attach tips**
✅ **Each highlight has unique deterministic ID (SHA256 hash)**
✅ **Authors see highlight heatmap showing earning patterns**
✅ **50+ test highlights created with varied tip amounts**
✅ **Payment channels enable $0.01-$0.09 micropayment tips efficiently**
✅ **Direct transactions handle $0.10+ tips using existing wallet flow**
✅ **Real-time heatmap updates (polling or WebSocket)**
✅ **Batch settlement reduces on-chain transactions by 100x for micropayments**

## 🔥 Key Advantages Over Original Plan

1. **50% Faster Implementation** - Reuse existing wallet infrastructure instead of building from scratch
2. **Lower Risk** - Extend proven systems rather than replace them
3. **Better UX** - Users already familiar with existing tip flow
4. **Hybrid Approach** - Best of both worlds: Simple for large tips, efficient for micro-tips
5. **Production-Ready Wallet** - Multi-wallet support already battle-tested
6. **Easier Testing** - Can test highlight tips independently from existing article tips
7. **Incremental Rollout** - Can deploy highlight tipping without touching existing features

This adjusted implementation leverages Stellar's unique capabilities (ultra-low fees, smart contracts, payment channels) while **building on top of your existing, working infrastructure** to enable granular content monetization impossible on other blockchains, creating a new economic model for digital content.