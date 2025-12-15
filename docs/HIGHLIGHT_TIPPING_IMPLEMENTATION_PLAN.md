# 🎯 Implementation Plan: Granular Highlight Tipping System
### Deliverable 1 - Tranche 1 - MVP (Weeks 1-4)

**IMPORTANT: Simplified approach using direct transactions (no payment channels). Keep it simple, validate demand first.**

---

## 🔒 CRITICAL: Two-Contract Deployment Strategy

### ⚠️ ZERO-RISK APPROACH - Existing Article Tipping MUST NOT Be Affected

**OLD CONTRACT (Article Tipping):** `CBSVFVIDV2U3SSY36TJ3MDGQDSQL3ZVL2TR7GMRBXJ3XZBE24FDHHWAM`
- ✅ **REMAINS ACTIVE AND UNCHANGED**
- ✅ **CONTINUES HANDLING ALL ARTICLE TIPPING**
- ✅ **DO NOT MODIFY .env.local TIPPING_CONTRACT_ID**
- ✅ **ZERO RISK TO EXISTING FUNCTIONALITY**

**NEW CONTRACT (Highlight Tipping):** Will be deployed separately
- Contains BOTH article + highlight tipping functions
- Used EXCLUSIVELY for highlight tipping initially
- Deployed to testnet as separate contract
- Uses NEW environment variable: `NEXT_PUBLIC_HIGHLIGHT_CONTRACT_ID`
- Once proven stable, can become single source of truth (future phase)

### Why Two Contracts?
1. **Zero Risk**: Article tipping keeps working unchanged
2. **Independent Testing**: Develop/test highlight tipping separately
3. **Safe Rollback**: Can abandon new contract if issues found
4. **Clean Separation**: Clear boundaries during development
5. **Future Flexibility**: Easy migration path when ready

---

## 📋 Deliverable 1: Granular Highlight Tipping System

**Description:** Implement phrase-level tipping where readers can select and tip specific text portions within articles.

### ✅ Completion Metrics:
1. **Users can highlight any text and attach tips**
2. **Each highlight gets unique ID stored in Stellar memo**
3. **Authors see highlight heatmap showing which phrases earned most**
4. **NEW CONTRACT deployed and tested on testnet**
5. **OLD CONTRACT remains functional for article tipping**

---

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
- **⚠️ DO NOT TOUCH - This contract stays active for article tipping**
- **⚠️ DO NOT MODIFY EXISTING .env.local VARIABLES**

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

## 🏗️ Simple Architecture Overview

### **Direct Tipping Strategy**
All highlight tips use the same flow as article tipping:

```
HIGHLIGHT TIPS (any amount):
User selects text → Clicks tip → Wallet popup → Direct Stellar transfer → Author receives instantly
✅ Same UX as article tipping, just for specific text portions
```

### **Why This Simple Approach?**
1. **Leverage existing wallet infrastructure** - 100% reuse
2. **Same UX as article tipping** - Users already understand it
3. **No new complexity** - Direct transactions only
4. **Faster implementation** - 4 weeks instead of 8+
5. **Validate demand first** - Add payment channels in v2 if needed

---

## 📋 4-Week Implementation Plan

### **Week 1: Smart Contract Extension**

#### 1.1 Extend Tipping Contract for Highlights
**Location:** `/contracts/tipping/src/lib.rs`
**Strategy:** Add new functions alongside existing `tip_article()` - DO NOT modify existing code

```rust
// contracts/tipping/src/lib.rs - ADD to existing contract

#[derive(Clone)]
#[contracttype]
pub struct HighlightTip {
    pub highlight_id: String,    // Unique highlight identifier (SHA256)
    pub article_id: Symbol,       // Parent article
    pub tipper: Address,
    pub amount: i128,
    pub timestamp: u64,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    // ... existing keys ...
    HighlightTips(String),           // Highlight ID → Tips
}

#[contractimpl]
impl TippingContract {
    /// Tip a highlight directly (same flow as tip_article)
    pub fn tip_highlight_direct(
        env: Env,
        tipper: Address,
        highlight_id: String,
        article_id: Symbol,
        author: Address,
        amount: i128,
    ) -> TipReceipt {
        tipper.require_auth();

        // Validate minimum amount
        if amount < MINIMUM_TIP_STROOPS {
            panic!("Amount below minimum tip");
        }

        // Get platform settings (reuse existing code)
        let platform_address: Address = env.storage()
            .instance()
            .get(&DataKey::PlatformAddress)
            .expect("Platform address not set");

        let platform_fee_bps: u32 = env.storage()
            .instance()
            .get(&DataKey::PlatformFeeBps)
            .unwrap_or(DEFAULT_PLATFORM_FEE_BPS);

        // Calculate fees (same as tip_article)
        let platform_fee = (amount * platform_fee_bps as i128) / 10_000;
        let author_share = amount - platform_fee;

        // Get XLM token client (same as tip_article)
        let xlm_address = Address::from_string(&String::from_str(&env, XLM_TOKEN_ADDRESS));
        let xlm_client = token::TokenClient::new(&env, &xlm_address);

        // Transfer author's share
        xlm_client.transfer(&tipper, &author, &author_share);

        // Transfer platform fee
        if platform_fee > 0 {
            xlm_client.transfer(&tipper, &platform_address, &platform_fee);
        }

        // Store highlight tip
        let tip = HighlightTip {
            highlight_id: highlight_id.clone(),
            article_id: article_id.clone(),
            tipper: tipper.clone(),
            amount,
            timestamp: env.ledger().timestamp(),
        };

        // Get existing tips for highlight
        let mut highlight_tips: Vec<HighlightTip> = env.storage()
            .persistent()
            .get(&DataKey::HighlightTips(highlight_id.clone()))
            .unwrap_or(vec![&env]);

        highlight_tips.push_back(tip);

        env.storage()
            .persistent()
            .set(&DataKey::HighlightTips(highlight_id), &highlight_tips);

        // Create receipt (same format as tip_article)
        TipReceipt {
            tip_id: env.ledger().sequence(),
            amount_sent: amount,
            author_received: author_share,
            platform_fee,
            timestamp: env.ledger().timestamp(),
        }
    }

    /// Get all tips for a highlight
    pub fn get_highlight_tips(env: Env, highlight_id: String) -> Vec<HighlightTip> {
        env.storage()
            .persistent()
            .get(&DataKey::HighlightTips(highlight_id))
            .unwrap_or(vec![&env])
    }
}
```

#### 1.2 Build Contract
**Command:**
```bash
cd /Users/apple/Desktop/QuillTip/contracts/tipping
stellar contract build
```
**Expected:** `target/wasm32v1-none/release/quilltip_tipping.wasm` (~8-15KB)

#### 1.3 Deploy NEW Contract to Testnet
**⚠️ CRITICAL: This creates a SEPARATE contract. Old contract remains unchanged.**

**Command:**
```bash
cd /Users/apple/Desktop/QuillTip/contracts/tipping
stellar contract deploy \
  --wasm target/wasm32v1-none/release/quilltip_tipping.wasm \
  --source quilltip-deployer \
  --network testnet
```
**Expected Output:** New contract ID (different from `CBSVFVIDV2U3SSY36TJ3MDGQDSQL3ZVL2TR7GMRBXJ3XZBE24FDHHWAM`)
**⚠️ IMMEDIATELY SAVE THIS NEW CONTRACT ID - You'll need it for next steps**

#### 1.4 Initialize NEW Contract
**Command:**
```bash
stellar contract invoke \
  --id <NEW_CONTRACT_ID_FROM_STEP_1.3> \
  --source quilltip-deployer \
  --network testnet \
  -- \
  initialize \
  --admin GCEDIDFYL6U3Y456ZK2GS4KXBNOBMRKR77EMOSR7W57AHWDVUVOVIZO5 \
  --platform_address GCEDIDFYL6U3Y456ZK2GS4KXBNOBMRKR77EMOSR7W57AHWDVUVOVIZO5 \
  --fee_bps 250
```
**Why:** New contract needs initialization before any tipping works

#### 1.5 Manual Contract Testing
**Test Highlight Tip Function:**
```bash
stellar contract invoke \
  --id <NEW_CONTRACT_ID> \
  --source quilltip-deployer \
  --network testnet \
  -- \
  tip_highlight_direct \
  --tipper GCEDIDFYL6U3Y456ZK2GS4KXBNOBMRKR77EMOSR7W57AHWDVUVOVIZO5 \
  --highlight_id "test_highlight_abc123" \
  --article_id "article1" \
  --author GCEDIDFYL6U3Y456ZK2GS4KXBNOBMRKR77EMOSR7W57AHWDVUVOVIZO5 \
  --amount 1000000
```
**Verify:** Transaction succeeds, check Stellar testnet explorer

**Test Query Function:**
```bash
stellar contract invoke \
  --id <NEW_CONTRACT_ID> \
  --network testnet \
  -- \
  get_highlight_tips \
  --highlight_id "test_highlight_abc123"
```
**Why:** Validate contract functions before frontend integration

---

### **Week 2: Frontend Integration**

#### 2.1 Add Highlight Contract ID to Environment Variables
**File:** `.env.local`

**⚠️ CRITICAL: Add NEW variable, DO NOT modify existing TIPPING_CONTRACT_ID**

**Action:**
```bash
# OLD - Article Tipping (⚠️ DO NOT CHANGE THIS LINE)
NEXT_PUBLIC_TIPPING_CONTRACT_ID=CBSVFVIDV2U3SSY36TJ3MDGQDSQL3ZVL2TR7GMRBXJ3XZBE24FDHHWAM

# NEW - Highlight Tipping (ADD THIS NEW LINE)
NEXT_PUBLIC_HIGHLIGHT_CONTRACT_ID=<NEW_CONTRACT_ID_FROM_WEEK_1_STEP_1.3>
```

**Why:** Keep article tipping working while we build highlight tipping

#### 2.2 Update Stellar Config for Two Contracts
**File:** `lib/stellar/config.ts`

**Action:** Add new constant (around line 9):
```typescript
export const STELLAR_CONFIG = {
  // ... existing config ...

  // Contract addresses
  TIPPING_CONTRACT_ID: process.env.NEXT_PUBLIC_TIPPING_CONTRACT_ID || 'CBSVFVIDV2U3SSY36TJ3MDGQDSQL3ZVL2TR7GMRBXJ3XZBE24FDHHWAM',

  // ⚠️ NEW: Highlight tipping contract (separate for safety)
  HIGHLIGHT_CONTRACT_ID: process.env.NEXT_PUBLIC_HIGHLIGHT_CONTRACT_ID || '',

  // ... rest of config ...
}
```

**Why:** Make highlight contract ID available throughout app
**Note:** Article tipping continues using TIPPING_CONTRACT_ID (unchanged)

#### 2.3 Create Highlight ID Generator
**Location:** `/lib/stellar/highlight-utils.ts` (NEW FILE)

```typescript
// lib/stellar/highlight-utils.ts
import { createHash } from 'crypto';

/**
 * Generate deterministic highlight ID from text selection
 * This ID will be stored in Stellar memo field
 */
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

/**
 * Store highlight mapping in Convex for full data retrieval
 */
export async function storeHighlightMapping(
  highlightId: string,
  fullData: {
    articleId: string;
    text: string;
    startOffset: number;
    endOffset: number;
  }
) {
  // Will be implemented with Convex mutation
  // This allows us to retrieve full highlight data from short ID
}
```

#### 2.4 Extend Stellar Client for Highlight Tipping
**File:** `/lib/stellar/client.ts`
**Location:** Add method after `buildTipTransaction()` method (around line 192)

**⚠️ KEY DIFFERENCE: Uses HIGHLIGHT_CONTRACT_ID, not TIPPING_CONTRACT_ID**

```typescript
// lib/stellar/client.ts - ADD to existing StellarClient class

/**
 * Build transaction for highlight tipping
 * Same pattern as buildTipTransaction but uses NEW CONTRACT
 */
async buildHighlightTipTransaction(
  tipperPublicKey: string,
  params: {
    highlightId: string;
    articleId: string;
    authorAddress: string;
    amountCents: number;
  }
): Promise<{
  xdr: string;
  stroops: number;
  authorReceived: number;
  platformFee: number;
}> {
  // Reuse existing conversion utilities
  const stroops = await this.convertCentsToStroops(params.amountCents);
  const platformFee = Math.floor((stroops * STELLAR_CONFIG.PLATFORM_FEE_BPS) / 10_000);
  const authorReceived = stroops - platformFee;

  // Reuse existing account loading
  const account = await this.server.loadAccount(tipperPublicKey);

  // ⚠️ CRITICAL: Use HIGHLIGHT_CONTRACT_ID (new contract), NOT TIPPING_CONTRACT_ID
  const contract = new StellarSdk.Contract(STELLAR_CONFIG.HIGHLIGHT_CONTRACT_ID);

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

  // Reuse existing Soroban preparation
  const preparedTransaction = await this.sorobanServer.prepareTransaction(transaction);

  return {
    xdr: preparedTransaction.toXDR(),
    stroops,
    authorReceived,
    platformFee,
  };
}
```

**Why:** Build transactions for highlight tipping using NEW contract
**Note:** `buildTipTransaction()` continues using TIPPING_CONTRACT_ID (unchanged)

#### 2.5 Extend Convex Schema
**Location:** `/convex/schema.ts` (EXTEND EXISTING FILE)

```typescript
// convex/schema.ts - ADD this table to existing schema

highlightTips: defineTable({
  // Core references
  highlightId: v.string(),        // SHA256 hash stored in Stellar memo
  articleId: v.id("articles"),
  tipperId: v.id("users"),
  authorId: v.id("users"),

  // Denormalized data
  highlightText: v.string(),       // The actual text that was tipped
  articleTitle: v.string(),
  tipperName: v.optional(v.string()),
  authorName: v.optional(v.string()),

  // Tip details
  amountCents: v.number(),

  // Stellar transaction data
  stellarTxId: v.string(),
  stellarNetwork: v.string(),      // TESTNET or MAINNET
  stellarMemo: v.string(),         // Highlight ID stored in memo

  // Position data (for heatmap)
  startOffset: v.number(),
  endOffset: v.number(),

  // Status
  status: v.string(),              // CONFIRMED, FAILED

  // Timestamps
  createdAt: v.number(),
  processedAt: v.number(),
})
  .index("by_highlight", ["highlightId"])
  .index("by_article", ["articleId"])
  .index("by_tipper", ["tipperId"])
  .index("by_author", ["authorId"]),
```

#### 2.6 Create Convex Mutations
**Location:** `/convex/highlightTips.ts` (NEW FILE)

```typescript
// convex/highlightTips.ts
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from "@convex-dev/auth/server";

// Record a highlight tip after Stellar transaction
export const create = mutation({
  args: {
    highlightId: v.string(),
    articleId: v.id('articles'),
    highlightText: v.string(),
    startOffset: v.number(),
    endOffset: v.number(),
    amountCents: v.number(),
    stellarTxId: v.string(),
    stellarMemo: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const user = await ctx.db.get(userId);
    const article = await ctx.db.get(args.articleId);
    if (!user || !article) throw new Error('Invalid data');

    return await ctx.db.insert('highlightTips', {
      highlightId: args.highlightId,
      articleId: args.articleId,
      tipperId: userId,
      authorId: article.authorId,
      highlightText: args.highlightText,
      articleTitle: article.title,
      tipperName: user.name,
      authorName: article.authorName,
      amountCents: args.amountCents,
      stellarTxId: args.stellarTxId,
      stellarNetwork: 'TESTNET',
      stellarMemo: args.stellarMemo,
      startOffset: args.startOffset,
      endOffset: args.endOffset,
      status: 'CONFIRMED',
      createdAt: Date.now(),
      processedAt: Date.now(),
    });
  },
});

// Get all tips for a specific highlight
export const getByHighlight = query({
  args: { highlightId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('highlightTips')
      .withIndex('by_highlight', q => q.eq('highlightId', args.highlightId))
      .collect();
  },
});

// Get all highlight tips for an article (for heatmap)
export const getByArticle = query({
  args: { articleId: v.id('articles') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('highlightTips')
      .withIndex('by_article', q => q.eq('articleId', args.articleId))
      .collect();
  },
});
```

#### 2.7 Create HighlightTipButton Component
**Location:** `/components/highlights/HighlightTipButton.tsx` (NEW FILE)

```typescript
// components/highlights/HighlightTipButton.tsx
'use client';

import { useState } from 'react';
import { useWallet } from '@/components/providers/WalletProvider'; // ✅ EXISTING
import { useAuth } from '@/components/providers/AuthContext'; // ✅ EXISTING
import { stellarClient } from '@/lib/stellar/client'; // ✅ EXISTING
import { generateHighlightId } from '@/lib/stellar/highlight-utils'; // NEW
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';

export function HighlightTipButton({
  highlightText,
  articleId,
  authorAddress,
  startOffset,
  endOffset,
}: {
  highlightText: string;
  articleId: string;
  authorAddress: string;
  startOffset: number;
  endOffset: number;
}) {
  // ✅ Use EXISTING hooks
  const { isConnected, publicKey, signTransaction } = useWallet();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const createHighlightTip = useMutation(api.highlightTips.create);

  const tipHighlight = async (amountCents: number) => {
    if (!isAuthenticated || !isConnected || !publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsLoading(true);

    try {
      // Generate deterministic highlight ID
      const highlightId = generateHighlightId(articleId, highlightText, startOffset, endOffset);

      // Build Stellar transaction (NEW method, existing pattern)
      const txData = await stellarClient.buildHighlightTipTransaction(
        publicKey,
        { highlightId, articleId, authorAddress, amountCents }
      );

      // ✅ Use EXISTING signTransaction from useWallet hook
      const signedXDR = await signTransaction(txData.xdr);

      // ✅ Use EXISTING submitTipTransaction method
      const receipt = await stellarClient.submitTipTransaction(signedXDR);

      // Record in Convex
      await createHighlightTip({
        highlightId,
        articleId: articleId as any,
        highlightText,
        startOffset,
        endOffset,
        amountCents,
        stellarTxId: receipt.transactionHash,
        stellarMemo: highlightId,
      });

      toast.success(`Tipped ${(amountCents / 100).toFixed(2)} for this highlight!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send tip');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="highlight-tip-buttons">
      <button onClick={() => tipHighlight(10)}>10¢</button>
      <button onClick={() => tipHighlight(50)}>50¢</button>
      <button onClick={() => tipHighlight(100)}>$1</button>
    </div>
  );
}
```

---

### **Week 3: Heatmap & Visualization**

#### 3.1 Heatmap Data Aggregation Service
**Location:** `/lib/services/highlight-heatmap.ts` (NEW FILE)

```typescript
// lib/services/highlight-heatmap.ts
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

#### 3.2 Heatmap Visualization Component
**Location:** `/components/dashboard/HighlightHeatmap.tsx` (NEW FILE)

```typescript
// components/dashboard/HighlightHeatmap.tsx
import { useEffect, useState, useRef } from 'react';
import { HighlightHeatmapService } from '@/lib/services/highlight-heatmap';
import * as d3 from 'd3';

export function HighlightHeatmap({ articleId }: { articleId: string }) {
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
      // Position calculation based on startOffset/endOffset
      // This will overlay on the article text
    });
  }, [heatmapData]);

  return (
    <div className="heatmap-container">
      <canvas ref={canvasRef} className="article-heatmap" />
    </div>
  );
}
```

---

### **Week 4: Manual Testing & Polish**

#### 4.1 Verify Old Contract Still Works
**⚠️ CRITICAL: Test this FIRST before anything else**
- Open app in browser
- Navigate to any article
- Test article tipping with existing TipButton
- Verify transaction succeeds on old contract
- **If this fails, STOP and investigate before proceeding**

#### 4.2 Test Highlight Tipping End-to-End
1. User selects text
2. HighlightTipButton appears
3. User clicks tip amount
4. Wallet popup (Freighter/xBull/Albedo)
5. Sign transaction
6. Tip recorded on Stellar (NEW contract)
7. Heatmap updates in real-time
8. **Verify article tipping STILL works on old contract**

#### 4.3 Create Manual Test Highlights
- Create 10+ test highlights across different articles
- Vary tip amounts (10¢, 50¢, $1)
- Test different text lengths and positions
- Verify heatmap displays correctly

#### 4.4 Cross-Wallet Testing
- Freighter wallet
- xBull wallet
- Albedo wallet
- Verify all wallets can sign highlight tip transactions
- **Test article tipping still works with each wallet**

#### 4.5 Performance Optimization
- Heatmap loads in < 500ms
- Add caching for frequently viewed articles
- Optimize Convex queries with proper indexes

#### 4.6 UX Polish
- Error handling for failed transactions
- Loading states during wallet signing
- Mobile-responsive tip buttons
- Tooltip showing total tips on heatmap hover

---

## ✅ Completion Metrics (Deliverable 1)

### 1. ✅ OLD CONTRACT: Article tipping still works
- **CRITICAL:** Existing article tipping unchanged and functional
- Old contract ID still in use for articles
- Zero disruption to current users

### 2. ✅ NEW CONTRACT: Deployed and initialized on testnet
- New contract contains both article + highlight functions
- Initialized with correct admin and platform fee
- Manual CLI testing passed

### 3. ✅ Users can highlight any text and attach tips
- HighlightTipButton component functional
- Works with any text selection
- Direct Stellar transactions to NEW contract

### 4. ✅ Each highlight gets unique ID stored in Stellar memo
- SHA256 hash generation from text + position
- Stored in Stellar transaction memo field
- Deterministic and collision-resistant

### 5. ✅ Authors see highlight heatmap showing which phrases earned most
- HighlightHeatmap component shows color-coded visualization
- Yellow → Orange → Red based on tip amount
- Interactive tooltips with tip details

### 6. ✅ Manual testing complete
- 10+ test highlights created successfully
- Different articles, amounts, positions
- Cross-wallet testing passed
- **Article tipping verified still working**

---

## 🚀 Deployment Strategy

### Phase 1: Local Development & Testing
- Deploy NEW contract to Stellar testnet (Week 1)
- Add HIGHLIGHT_CONTRACT_ID to .env.local (**DO NOT change TIPPING_CONTRACT_ID**)
- Test highlight tipping with Freighter wallet on testnet
- Verify article tipping still works on old contract

### Phase 2: Vercel Preview Deployment
- Deploy frontend to Vercel preview environment
- Add HIGHLIGHT_CONTRACT_ID to Vercel environment variables
- **Verify TIPPING_CONTRACT_ID unchanged in Vercel**
- Test with multiple wallets
- Monitor Convex database for highlight tip records
- Check Stellar testnet explorer for transactions on BOTH contracts

### Phase 3: Production Release (Highlight Tipping)
- Deploy to production Vercel environment
- Keep using testnet Stellar contracts (no real money yet)
- OLD contract continues article tipping
- NEW contract handles highlight tipping
- Monitor for 48 hours with internal testing
- Collect UX feedback

### Phase 4: Contract Consolidation (Future)
**Only after highlight tipping proven stable:**
- Update TIPPING_CONTRACT_ID to point to new contract
- Test article tipping on new contract
- Remove HIGHLIGHT_CONTRACT_ID variable
- Use single contract for both features
- Old contract remains on testnet but unused

### Phase 5: Mainnet Migration (Future)
- Deploy final contract to Stellar mainnet
- Update contract ID in environment variables
- Feature flag for gradual rollout
- Monitor for 1 week before full release

---

## 💡 Future Enhancements (v2)

### Payment Channels for Micropayments
**When to add:** If analytics show users tip 10+ highlights per session

**Benefits:**
- One wallet approval for multiple tips
- No transaction fees per tip
- Better UX for heavy tippers

**Implementation:**
- Add channel opening/closing functions to contract
- Create PaymentChannelManager service
- Batch settlement every 100 tips or 24 hours

---

## 🎯 Why Two-Contract Approach Works

1. **Zero Risk** - Article tipping guaranteed to keep working
2. **Independent Testing** - Develop highlight tipping without affecting production
3. **Safe Rollback** - Can abandon new contract if issues found
4. **Clean Separation** - Clear boundaries during development
5. **Future Flexibility** - Easy migration path when ready
6. **Maximum Leverage** - Still reuses 90% of existing code patterns

---

## ⚠️ CRITICAL SAFETY CHECKLIST

Before deploying ANY changes to production:

- [ ] Old contract `CBSVFVIDV2U3SSY36TJ3MDGQDSQL3ZVL2TR7GMRBXJ3XZBE24FDHHWAM` unchanged
- [ ] `NEXT_PUBLIC_TIPPING_CONTRACT_ID` in .env.local still points to old contract
- [ ] `NEXT_PUBLIC_HIGHLIGHT_CONTRACT_ID` added as NEW variable
- [ ] Article tipping tested and working on old contract
- [ ] Highlight tipping tested and working on new contract
- [ ] Both contracts visible on Stellar testnet explorer
- [ ] No modifications to existing TipButton or article tipping code

---

**Implementation Status:** Ready to begin Week 1 with TWO-CONTRACT approach
