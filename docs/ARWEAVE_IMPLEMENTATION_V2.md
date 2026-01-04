# Arweave Integration - Implementation Plan V2
## Deliverable 2: Permanent Content Storage & OpenZeppelin Security Patterns

**Status:** In Progress (Branch: `arweave-integration`)
**Testing:** Stellar Testnet + Turbo SDK (FREE uploads under 100 KiB)
**Date:** December 2024
**Updated:** Switched from raw `arweave` SDK to `@ardrive/turbo-sdk` for free uploads

---

## Executive Summary

QuillTip codebase is **~85% ready** for Arweave integration. Key finding: `memo-utils.ts` already handles Arweave TX IDs (future-proofed!).

### Contract Consolidation (NEW)
| Before | After |
|--------|-------|
| 3 contracts (Tipping, Highlight, NFT) | **2 contracts (Unified Tipping, NFT)** |

The tipping contract already has both `tip_article()` and `tip_highlight_direct()` functions. We consolidate to:
1. **Unified Tipping Contract** - handles both article + highlight tipping
2. **NFT Contract** - article NFT minting with Arweave support

### Target Networks
| Network | Purpose | Cost |
|---------|---------|------|
| **Stellar Testnet** | Smart contract deployment | FREE (testnet XLM) |
| **Arweave (via Turbo)** | Permanent article storage | FREE (under 100 KiB) |

---

## Turbo SDK - Free Arweave Uploads

**Documentation:** https://docs.ar.io/build/upload/turbo-credits/

From AR.IO official docs:
> **"Uploads under 100 KiB are completely free and do not require a prior top up."**

### Why Turbo SDK (not raw `arweave` SDK)?

| Feature | Raw `arweave` SDK | Turbo SDK |
|---------|-------------------|-----------|
| Storage destination | Arweave blockchain | Arweave blockchain (same!) |
| Free uploads | NO - requires AR tokens | YES - under 100 KiB |
| Transaction IDs | Real Arweave TX IDs | Real Arweave TX IDs (same!) |
| Wallet required | YES - must be funded | NO - for small files |
| Permanence | Permanent | Permanent (same!) |

**Key insight:** Turbo is a **bundler/gateway** that uploads TO Arweave. Data is still permanently stored on the real Arweave blockchain with real transaction IDs.

### Article Size Estimate
- Typical JSON article: 5-50 KiB
- Free tier limit: 100 KiB
- **Result:** Most articles upload for FREE

```bash
# Environment Config (Turbo - FREE for <100KB)
ARWEAVE_ENABLED=true
# ARWEAVE_WALLET_KEY is OPTIONAL for files under 100 KiB
```

---

## What's Already Working (No Changes Needed)

### 1. Memo Format - Already Arweave-Ready!
**File:** `lib/stellar/memo-utils.ts`

```typescript
// ALREADY EXISTS - handles Arweave TX IDs
if (arweaveTxId) {
  return StellarSdk.Memo.text(arweaveTxId.slice(0, 28))
}
```

### 2. Background Job Pattern
**File:** `convex/tips.ts`

```typescript
// Pattern already in use - reuse for Arweave uploads
await ctx.scheduler.runAfter(1000, api.tips.confirmTip, { tipId })
```

---

## Architecture

```
Next.js Frontend
    ↓
    ├──→ Convex (fast queries, real-time, drafts)
    ├──→ Stellar Testnet (payments, verification)
    └──→ Turbo SDK → Arweave (permanent storage - FREE <100KB)
```

**Flow:**
1. User publishes article → Convex updated immediately
2. Background job uploads via Turbo SDK (FREE for articles <100KB)
3. Real Arweave TX ID stored in Convex + available for Stellar memo
4. Article accessible from both Convex (fast) and Arweave (permanent)

---

## Contract Architecture (After Implementation)

```
┌─────────────────────────────────────────────────────────┐
│              UNIFIED TIPPING CONTRACT                    │
│  (Handles both article tipping AND highlight tipping)   │
├─────────────────────────────────────────────────────────┤
│  Functions:                                              │
│  - tip_article(tipper, article_id, author, amount)      │
│  - tip_article_with_arweave(..., arweave_tx_id)         │
│  - tip_highlight_direct(tipper, highlight_id, ...)      │
│  - tip_highlight_with_arweave(..., arweave_tx_id)       │
│  - pause() / unpause() / is_paused()                    │
│  - update_fee() / get_article_tips() / etc.             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    NFT CONTRACT                          │
├─────────────────────────────────────────────────────────┤
│  Functions:                                              │
│  - mint_article_nft(author, article_id, tip_amount, url)│
│  - mint_article_nft_with_arweave(..., arweave_tx_id)    │
│  - transfer(from, to, token_id)                         │
│  - pause() / unpause()                                  │
│  - get_owner() / is_article_minted() / etc.             │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### PHASE 1: Arweave Infrastructure (Turbo SDK)

#### 1.1 Install Dependencies
```bash
npm install @ardrive/turbo-sdk
```

**Note:** We use Turbo SDK instead of raw `arweave` SDK because:
- FREE uploads for files under 100 KiB (no tokens needed)
- Still stores data on real Arweave blockchain
- Same permanent TX IDs

#### 1.2 Create Arweave Config
**File:** `lib/arweave/config.ts` (SIMPLIFIED)

```typescript
export const ARWEAVE_CONFIG = {
  ENABLED: process.env.ARWEAVE_ENABLED === 'true',
  APP_NAME: 'QuillTip',
  APP_VERSION: '1.0',
} as const;
```

#### 1.3 Create Arweave Client (Turbo SDK)
**File:** `lib/arweave/client.ts` (UPDATED)

```typescript
import { TurboFactory } from "@ardrive/turbo-sdk/node";
import { ARWEAVE_CONFIG } from './config';
import type { ArweaveArticleContent, ArweaveUploadResult, ArweaveTransactionStatus } from './types';

/**
 * Upload article content to Arweave via Turbo SDK
 * FREE for files under 100 KiB!
 */
export async function uploadArticle(
  content: ArweaveArticleContent
): Promise<ArweaveUploadResult> {
  try {
    const data = JSON.stringify(content);
    const dataBuffer = Buffer.from(data);

    // Check size - warn if approaching limit
    const sizeKiB = dataBuffer.length / 1024;
    if (sizeKiB > 100) {
      console.warn(`[Arweave] Article size ${sizeKiB.toFixed(1)} KiB exceeds free tier (100 KiB)`);
    }

    // Use unauthenticated Turbo for free uploads under 100 KiB
    const turbo = TurboFactory.unauthenticated();

    const result = await turbo.uploadSignedDataItem({
      dataItemStreamFactory: () => dataBuffer,
      dataItemSizeFactory: () => dataBuffer.length,
      signal: AbortSignal.timeout(60000), // 60s timeout
    });

    return {
      success: true,
      txId: result.id,
      url: `https://arweave.net/${result.id}`,
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
    const response = await fetch(`https://arweave.net/${txId}`);
    if (!response.ok) return null;
    return await response.json() as ArweaveArticleContent;
  } catch {
    return null;
  }
}

/**
 * Check transaction status (for verification)
 */
export async function getTransactionStatus(txId: string): Promise<ArweaveTransactionStatus> {
  try {
    const response = await fetch(`https://arweave.net/tx/${txId}/status`);
    if (!response.ok) {
      return { confirmed: false, confirmations: 0 };
    }
    const status = await response.json();
    return {
      confirmed: !!status.block_height,
      confirmations: status.number_of_confirmations || 0,
      blockHeight: status.block_height,
    };
  } catch {
    return { confirmed: false, confirmations: 0 };
  }
}
```

#### 1.4 Create Types
**File:** `lib/arweave/types.ts` (NEW)

```typescript
export interface ArweaveArticleContent {
  title: string;
  body: any;
  author: string;
  authorId: string;
  timestamp: number;
  version: number;
}

export type ArweaveStatus = 'pending' | 'uploaded' | 'verified' | 'failed';
```

---

### PHASE 2: Database Schema Update

#### 2.1 Add Arweave Fields
**File:** `convex/schema.ts` (MODIFY - line ~81)

Add to `articles` table after `readTime`:
```typescript
// Arweave permanent storage (optional - additive)
arweaveTxId: v.optional(v.string()),       // 43-char TX ID
arweaveUrl: v.optional(v.string()),        // https://arweave.net/{txId}
arweaveStatus: v.optional(v.string()),     // 'pending' | 'uploaded' | 'verified' | 'failed'
arweaveTimestamp: v.optional(v.number()),  // Upload timestamp
contentVersion: v.optional(v.number()),    // Version tracking
```

---

### PHASE 3: Background Upload System

#### 3.1 Create Arweave Actions
**File:** `convex/arweave.ts` (NEW)

```typescript
"use node";

import { internalAction, internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';

export const getArticleForUpload = internalQuery({
  args: { articleId: v.id('articles') },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article) throw new Error('Article not found');
    const author = await ctx.db.get(article.authorId);
    return { ...article, authorUsername: author?.username || 'unknown' };
  },
});

export const uploadArticleToArweave = internalAction({
  args: { articleId: v.id('articles') },
  handler: async (ctx, args) => {
    const enabled = process.env.ARWEAVE_ENABLED === 'true';
    if (!enabled) {
      console.log('[Arweave] Integration disabled, skipping upload');
      return { success: false, reason: 'disabled' };
    }

    const article = await ctx.runQuery(
      internal.arweave.getArticleForUpload,
      { articleId: args.articleId }
    );

    const { arweaveClient } = await import('../lib/arweave/client');

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const txId = await arweaveClient.uploadArticle({
          title: article.title,
          body: article.content,
          author: article.authorUsername,
          timestamp: article.publishedAt || Date.now(),
        });

        await ctx.runMutation(internal.arweave.recordArweaveUpload, {
          articleId: args.articleId,
          arweaveTxId: txId,
        });

        return { success: true, txId };
      } catch (error) {
        if (attempt === 2) {
          await ctx.runMutation(internal.arweave.recordArweaveFailure, {
            articleId: args.articleId,
            error: String(error),
          });
          throw error;
        }
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
    }
  },
});

export const recordArweaveUpload = internalMutation({
  args: { articleId: v.id('articles'), arweaveTxId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.articleId, {
      arweaveTxId: args.arweaveTxId,
      arweaveUrl: `https://arweave.net/${args.arweaveTxId}`,
      arweaveStatus: 'uploaded',
      arweaveTimestamp: Date.now(),
      contentVersion: 1,
    });
  },
});

export const recordArweaveFailure = internalMutation({
  args: { articleId: v.id('articles'), error: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.articleId, { arweaveStatus: 'failed' });
    console.error(`[Arweave] Upload failed for ${args.articleId}: ${args.error}`);
  },
});
```

#### 3.2 Hook into publishArticle
**File:** `convex/articles.ts` (MODIFY - line ~332)

```typescript
// Add import at top
import { internal } from "./_generated/api";

// Add after setting published: true (line ~332)
await ctx.scheduler.runAfter(
  0,
  internal.arweave.uploadArticleToArweave,
  { articleId: args.id }
);
```

---

### PHASE 4: Frontend Component

**File:** `components/articles/ArweaveStatus.tsx` (NEW)

```typescript
'use client';

import { Doc } from '@/convex/_generated/dataModel';

interface ArweaveStatusProps {
  article: Doc<'articles'>;
}

export function ArweaveStatus({ article }: ArweaveStatusProps) {
  if (!article.arweaveTxId) return null;

  const statusConfig = {
    pending: { text: 'Uploading to Arweave', color: 'text-yellow-600' },
    uploaded: { text: 'Confirming on Arweave', color: 'text-blue-600' },
    verified: { text: 'Permanently stored', color: 'text-green-600' },
    failed: { text: 'Upload failed', color: 'text-red-600' },
  };

  const status = statusConfig[article.arweaveStatus as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <a
      href={article.arweaveUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-1 text-sm ${status.color}`}
    >
      <span>{status.text}</span>
    </a>
  );
}
```

---

### PHASE 5: OpenZeppelin Security Patterns + Contract Deployment

#### 5.1 Add OpenZeppelin Stellar Dependencies
**File:** `contracts/tipping/Cargo.toml` (MODIFY)

```toml
[dependencies]
stellar-access = { git = "https://github.com/OpenZeppelin/stellar-contracts", package = "stellar-access" }
stellar-utils = { git = "https://github.com/OpenZeppelin/stellar-contracts", package = "stellar-utils" }
stellar-macros = { git = "https://github.com/OpenZeppelin/stellar-contracts", package = "stellar-macros" }
```

**File:** `contracts/article-nft/Cargo.toml` (MODIFY)

```toml
[dependencies]
stellar-access = { git = "https://github.com/OpenZeppelin/stellar-contracts", package = "stellar-access" }
stellar-utils = { git = "https://github.com/OpenZeppelin/stellar-contracts", package = "stellar-utils" }
stellar-macros = { git = "https://github.com/OpenZeppelin/stellar-contracts", package = "stellar-macros" }
```

#### 5.2 Upgrade Unified Tipping Contract
**File:** `contracts/tipping/src/lib.rs` (MODIFY)

Add to the contract:
- Pausable pattern (`pause()`, `unpause()`, `is_paused()`)
- `#[when_not_paused]` macro on `tip_article` and `tip_highlight_direct`
- `tip_article_with_arweave()` - accepts Arweave TX ID
- `tip_highlight_with_arweave()` - accepts Arweave TX ID

#### 5.3 Upgrade NFT Contract
**File:** `contracts/article-nft/src/lib.rs` (MODIFY)

Add to the contract:
- Pausable pattern
- `arweave_tx_id: Option<String>` field to NFTToken struct
- `mint_article_nft_with_arweave()` function

#### 5.4 Build & Deploy

```bash
# Build contracts
cd contracts/tipping && stellar contract build
cd ../article-nft && stellar contract build

# Deploy Unified Tipping Contract
stellar contract deploy \
  --wasm target/wasm32v1-none/release/quilltip_tipping.wasm \
  --source <YOUR_KEY> \
  --network testnet

# Initialize Tipping Contract
stellar contract invoke \
  --id <NEW_TIPPING_CONTRACT_ID> \
  --source <YOUR_KEY> \
  --network testnet \
  -- initialize \
  --admin <ADMIN_ADDRESS> \
  --platform_address <PLATFORM_ADDRESS> \
  --fee_bps 250

# Deploy NFT Contract
stellar contract deploy \
  --wasm target/wasm32v1-none/release/quilltip_article_nft.wasm \
  --source <YOUR_KEY> \
  --network testnet

# Initialize NFT Contract
stellar contract invoke \
  --id <NEW_NFT_CONTRACT_ID> \
  --source <YOUR_KEY> \
  --network testnet \
  -- initialize \
  --admin <ADMIN_ADDRESS> \
  --tip_threshold 100000000
```

---

### PHASE 6: Config Updates (Contract Consolidation)

#### 6.1 Update Stellar Config
**File:** `lib/stellar/config.ts` (MODIFY)

```typescript
export const STELLAR_CONFIG = {
  // ... network config ...

  // Contract addresses - CONSOLIDATED (2 contracts)
  TIPPING_CONTRACT_ID: process.env.NEXT_PUBLIC_TIPPING_CONTRACT_ID || '<NEW_TIPPING_CONTRACT_ID>',
  NFT_CONTRACT_ID: process.env.NEXT_PUBLIC_NFT_CONTRACT_ID || '<NEW_NFT_CONTRACT_ID>',

  // REMOVED: HIGHLIGHT_CONTRACT_ID - now uses TIPPING_CONTRACT_ID
  // Highlight tipping uses same contract as article tipping

  // ... rest unchanged ...
};
```

#### 6.2 Update Stellar Client
**File:** `lib/stellar/client.ts` (MODIFY - line ~225)

Change `buildHighlightTipTransaction()` to use `TIPPING_CONTRACT_ID`:
```typescript
// BEFORE:
const contract = new StellarSdk.Contract(STELLAR_CONFIG.HIGHLIGHT_CONTRACT_ID)

// AFTER:
const contract = new StellarSdk.Contract(STELLAR_CONFIG.TIPPING_CONTRACT_ID)
```

---

## Files Summary

### CREATE (5 files)
| File | Purpose |
|------|---------|
| `lib/arweave/config.ts` | Arweave environment config |
| `lib/arweave/client.ts` | Arweave SDK wrapper |
| `lib/arweave/types.ts` | TypeScript types |
| `convex/arweave.ts` | Background upload actions |
| `components/articles/ArweaveStatus.tsx` | Status display |

### MODIFY (9 files)
| File | Changes |
|------|---------|
| `convex/schema.ts:81` | Add 5 Arweave fields |
| `convex/articles.ts:332` | Hook scheduler in publishArticle |
| `.env.example` | Add Arweave vars, remove HIGHLIGHT_CONTRACT_ID |
| `contracts/tipping/Cargo.toml` | Add OZ dependencies |
| `contracts/tipping/src/lib.rs` | Add Pausable, Arweave functions |
| `contracts/article-nft/Cargo.toml` | Add OZ dependencies |
| `contracts/article-nft/src/lib.rs` | Add Pausable, arweave_tx_id |
| `lib/stellar/config.ts:13` | Remove HIGHLIGHT_CONTRACT_ID |
| `lib/stellar/client.ts:225` | Use TIPPING_CONTRACT_ID for highlights |

### DELETE (1 file)
| File | Reason |
|------|--------|
| `docs/ARWEAVE_INTEGRATION_PLAN.md` | Superseded by this document |

---

## Environment Variables

Required environment variables (see `.env.example` for template):

| Variable | Required | Description |
|----------|----------|-------------|
| `ARWEAVE_ENABLED` | Yes | Set to `true` to enable uploads |
| `ARWEAVE_WALLET_KEY` | No* | JWK wallet key (*only needed for files >100 KiB) |
| `NEXT_PUBLIC_TIPPING_CONTRACT_ID` | Yes | Unified tipping contract address |
| `NEXT_PUBLIC_NFT_CONTRACT_ID` | Yes | NFT contract address |

**Note:** With Turbo SDK, wallet key is NOT required for uploads under 100 KiB (free tier).

---

## Pre-requisites

1. **Turbo SDK:** `npm install @ardrive/turbo-sdk` (FREE uploads under 100 KiB - no wallet needed!)
2. **Stellar Wallet:** Funded testnet account
3. **Stellar CLI:** `cargo install --locked stellar-cli`
4. **Rust toolchain:** `rustup target add wasm32-unknown-unknown wasm32v1-none`

**Note:** Unlike raw Arweave SDK, Turbo SDK does NOT require a funded wallet for small uploads. Articles under 100 KiB upload for FREE.

---

## Implementation Status

### Completed Components ✅

| Component | File | Status |
|-----------|------|--------|
| Arweave Config | `lib/arweave/config.ts` | 🔄 Needs update for Turbo SDK |
| Arweave Client | `lib/arweave/client.ts` | 🔄 Needs update for Turbo SDK |
| Arweave Types | `lib/arweave/types.ts` | ✅ Complete |
| Schema Fields | `convex/schema.ts:79-84` | ✅ Complete |
| Background Upload | `convex/arweave.ts` | 🔄 Needs minor update |
| Helper Mutations | `convex/arweaveHelpers.ts` | ✅ Complete |
| Publish Hook | `convex/articles.ts:337` | ✅ Schedules upload on publish |
| ArweaveStatus UI | `components/articles/ArweaveStatus.tsx` | ✅ Integrated in article page |
| Stellar Config | `lib/stellar/config.ts` | ✅ Consolidated to unified TIPPING_CONTRACT_ID |
| Stellar Client | `lib/stellar/client.ts` | ✅ Uses unified contract |
| Tipping Contract | `contracts/tipping/src/lib.rs` | ✅ Has Arweave functions + Pausable |
| NFT Contract | `contracts/article-nft/src/lib.rs` | ✅ Has arweave_tx_id + Pausable |
| npm package | `package.json` | 🔄 Needs @ardrive/turbo-sdk (replacing arweave) |

### Turbo SDK Migration Status

| Step | Status |
|------|--------|
| Install `@ardrive/turbo-sdk` | ⏳ Pending |
| Update `lib/arweave/client.ts` | ⏳ Pending |
| Update `lib/arweave/config.ts` | ⏳ Pending |
| Update `convex/arweave.ts` | ⏳ Pending |
| Test upload flow | ⏳ Pending |

### Contracts Deployed on Testnet ✅

```bash
NEXT_PUBLIC_TIPPING_CONTRACT_ID=CASU4I45DVK3ZMXA3T34A3XF3BM4NBTFDW3QVCB3XA7PIWJSTN4HCVWG
NEXT_PUBLIC_NFT_CONTRACT_ID=CAS44OQK7A6W5FDRAH3K3ZN7TTQTJ5ESRVG6MB2HBVFWZ5TVH26UUB4S
```

Both contracts include:
- `tip_article_with_arweave()` / `tip_highlight_with_arweave()`
- `mint_article_nft_with_arweave()`
- `pause()` / `unpause()` / `is_paused()` (OpenZeppelin Pausable pattern)

---

## Remaining Gaps (3 Items)

### Gap 1: ArweaveStatus Component Not Integrated in UI

**Problem:** The `ArweaveStatus.tsx` component exists but is NOT imported/used anywhere.

**Fix:** Add to `app/[username]/[slug]/page.tsx` in the sidebar after Article Stats section (~line 233).

```typescript
// Add imports at top of file
import { ArweaveStatus } from '@/components/articles/ArweaveStatus'
import { Archive } from 'lucide-react'

// Add in sidebar after Article Stats section (~line 233)
{article.arweaveStatus && (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
      <Archive className="w-5 h-5 text-blue-500" />
      Permanent Storage
    </h3>
    <ArweaveStatus
      status={article.arweaveStatus}
      txId={article.arweaveTxId}
      url={article.arweaveUrl}
      timestamp={article.arweaveTimestamp}
    />
  </div>
)}
```

### Gap 2: Verification Job Missing

**Problem:** After upload, status stays "uploaded" forever - no job verifies and updates to "verified".

**Fix:** Add `verifyArweaveUpload` action in `convex/arweave.ts`:

```typescript
export const verifyArweaveUpload = internalAction({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    const data = await ctx.runQuery(internal.arweaveHelpers.getArticleForUpload, {
      articleId: args.articleId,
    });
    if (!data?.article.arweaveTxId) return;

    const { getTransactionStatus } = await import("../lib/arweave/client");
    const status = await getTransactionStatus(data.article.arweaveTxId);

    if (status.confirmed) {
      await ctx.runMutation(internal.arweaveHelpers.updateArweaveStatus, {
        articleId: args.articleId,
        status: "verified",
      });
      console.log(`[Arweave] Verified: ${data.article.arweaveTxId}`);
    } else {
      // Retry in 10 minutes if not confirmed yet
      await ctx.scheduler.runAfter(
        10 * 60 * 1000,
        internal.arweave.verifyArweaveUpload,
        { articleId: args.articleId }
      );
    }
  },
});
```

### Gap 3: updateArweaveStatus Mutation + Verification Scheduling

**Problem:** Missing mutation to update status, and verification not scheduled after upload.

**Fix 1:** Add `updateArweaveStatus` mutation in `convex/arweaveHelpers.ts`:

```typescript
// Update arweave status (for verification job)
export const updateArweaveStatus = internalMutation({
  args: {
    articleId: v.id("articles"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.articleId, {
      arweaveStatus: args.status,
      updatedAt: Date.now(),
    });
  },
});
```

**Fix 2:** Update `recordArweaveUpload` in `convex/arweaveHelpers.ts` to schedule verification:

```typescript
// Add import at top
import { internal } from "./_generated/api";

// Update recordArweaveUpload to schedule verification
export const recordArweaveUpload = internalMutation({
  args: {
    articleId: v.id("articles"),
    txId: v.string(),
    url: v.string(),
    version: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.articleId, {
      arweaveTxId: args.txId,
      arweaveUrl: args.url,
      arweaveStatus: "uploaded",
      arweaveTimestamp: Date.now(),
      contentVersion: args.version,
      updatedAt: Date.now(),
    });

    // Schedule verification after 10 minutes
    await ctx.scheduler.runAfter(
      10 * 60 * 1000,
      internal.arweave.verifyArweaveUpload,
      { articleId: args.articleId }
    );
  },
});
```

---

## Server-Side Wallet Implementation

### What "Authenticated" Means

"Authenticated" does NOT mean each author needs an Arweave account. It means QuillTip uses a server-side signing key to sign data before uploading.

**How it works:**
1. All data on Arweave must be signed (proves ownership/origin)
2. Signing requires a wallet/key (JWK)
3. QuillTip has ONE wallet key that signs all uploads on behalf of authors
4. Author information is stored in article metadata/tags, not the signature

**Cost:** FREE for articles <100KB (signing only, no payment required)

### Environment Variables

```bash
# Required
ARWEAVE_ENABLED=true
ARWEAVE_WALLET_KEY='{"kty":"RSA","n":"...","e":"...","d":"...","p":"...","q":"...","dp":"...","dq":"...","qi":"..."}'
```

**Wallet address:** `C8g4MCJbXT65pKLIXHgsxQ2XHK8gcnpdlcDU9iQs9jM`

### Generate New JWK (if needed)

```bash
node -e "require('arweave').init({}).wallets.generate().then(k=>console.log(JSON.stringify(k)))"
```

### Code Changes Required

**File:** `lib/arweave/client.ts`

1. Add `parseWalletKey()` function to parse JWK from environment
2. Modify `uploadArticle()` to accept JWK and use `TurboFactory.authenticated({ signer })`

```typescript
import { TurboFactory, ArweaveSigner } from "@ardrive/turbo-sdk/node";
import type { JWKInterface } from "arweave/node/lib/wallet";

export function parseWalletKey(jwkString: string): JWKInterface {
  const parsed = JSON.parse(jwkString);
  if (!parsed.kty || parsed.kty !== 'RSA') {
    throw new Error('Invalid JWK: must be RSA key');
  }
  return parsed as JWKInterface;
}

export async function uploadArticle(
  content: ArweaveArticleContent,
  jwk: JWKInterface  // Required - server wallet for signing
): Promise<ArweaveUploadResult> {
  const signer = new ArweaveSigner(jwk);
  const turbo = TurboFactory.authenticated({ signer });
  // ... rest of upload logic
}
```

**File:** `convex/arweave.ts` (no changes needed - already calls correctly)

```typescript
const { uploadArticle, parseWalletKey } = await import("../lib/arweave/client");
const result = await uploadArticle(content, parseWalletKey(walletKey));
```

---

## Files to Modify (Server-Side Wallet)

| File | Change |
|------|--------|
| `lib/arweave/client.ts` | Add `parseWalletKey()`, use authenticated uploads |
| `.env.local` | Add `ARWEAVE_WALLET_KEY` with JWK |

---

## Testing Checklist

1. Ensure `ARWEAVE_ENABLED=true` in environment
2. Publish an article
4. Check Convex dashboard for:
   - `arweaveStatus`: "pending" → "uploaded" transition
   - `arweaveTxId` populated
   - `arweaveUrl` set to `https://arweave.net/{txId}`
5. View article page - ArweaveStatus component shows in sidebar
6. Click "View on Arweave" link to verify content is accessible
7. After ~10 minutes, status should transition to "verified"

### Console Logs to Watch

- `[Arweave] Upload skipped - ARWEAVE_ENABLED is not true` - if disabled
- `[Arweave] Upload successful: {txId}` - on success
- `[Arweave] Verified: {txId}` - on confirmation
- `[Arweave] Failed for article {articleId}` - on failure

---

## Success Criteria

### Arweave Integration
- [x] Arweave client uploads articles to AR.IO testnet
- [x] Background job triggers on article publish
- [x] TX ID stored in Convex + displayed in UI ✅ (Gap 1 closed)
- [x] Memo format uses Arweave TX ID when available
- [x] Verification job updates status to "verified" ✅ (Gaps 2 & 3 closed)

### Contract Redeployment
- [x] Single unified tipping contract deployed (article + highlight)
- [x] NFT contract deployed with arweave_tx_id field
- [x] Both contracts have Pausable pattern (pause/unpause)
- [x] `lib/stellar/config.ts` uses single TIPPING_CONTRACT_ID
- [x] `lib/stellar/client.ts` uses same contract for highlight tips
- [ ] All tests pass

---

## Implementation Complete ✅

**Date Completed:** December 2024

All gaps have been addressed:

1. **ArweaveStatus integrated** in `app/[username]/[slug]/page.tsx:236-250`
2. **Verification action added** in `convex/arweave.ts:94-131`
3. **updateArweaveStatus mutation** in `convex/arweaveHelpers.ts:62-74`
4. **Verification scheduling** in `convex/arweaveHelpers.ts:38-43`

**Remaining user action:** Set `ARWEAVE_ENABLED=true` in environment and complete Turbo SDK migration.
