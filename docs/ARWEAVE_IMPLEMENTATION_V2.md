# Arweave Integration - Implementation Plan V2
## Deliverable 2: Permanent Content Storage & OpenZeppelin Security Patterns

**Status:** In Progress (Branch: `arweave-integration`)
**Testing:** Stellar Testnet + AR.IO Testnet (FREE - no mainnet costs)
**Date:** December 2024

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

### Target Networks (ALL TESTNET - FREE)
| Network | Purpose | Cost |
|---------|---------|------|
| **Stellar Testnet** | Smart contract deployment | FREE (testnet XLM) |
| **AR.IO Testnet** | Arweave permanent storage | FREE (up to 10,000 test tokens) |

---

## AR.IO Testnet - Free Arweave Testing

**Faucet:** https://faucet.arweave.net/

- Up to **10,000 free test tokens**
- Works with standard `arweave-js` SDK
- Real network behavior, real TX IDs

```bash
# Environment Config (testnet - FREE)
ARWEAVE_ENABLED=true
ARWEAVE_USE_TESTNET=true
ARWEAVE_WALLET_KEY={"kty":"RSA",...}  # From AR.IO testnet faucet
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
    └──→ AR.IO Testnet (permanent storage - FREE)
```

**Flow:**
1. User publishes article → Convex updated immediately
2. Background job uploads to AR.IO Testnet
3. TX ID stored in Convex + available for Stellar memo
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

### PHASE 1: Arweave Infrastructure

#### 1.1 Install Dependencies
```bash
npm install arweave
```

#### 1.2 Create Arweave Config
**File:** `lib/arweave/config.ts` (NEW)

```typescript
export const ARWEAVE_CONFIG = {
  ENABLED: process.env.ARWEAVE_ENABLED === 'true',
  USE_TESTNET: process.env.ARWEAVE_USE_TESTNET === 'true',
  HOST: 'arweave.net',
  PORT: 443,
  PROTOCOL: 'https',
  APP_NAME: 'QuillTip',
  APP_VERSION: '1.0',
};
```

#### 1.3 Create Arweave Client
**File:** `lib/arweave/client.ts` (NEW)

```typescript
import Arweave from 'arweave';
import { ARWEAVE_CONFIG } from './config';

export class ArweaveClient {
  private arweave: Arweave;

  constructor() {
    this.arweave = Arweave.init({
      host: ARWEAVE_CONFIG.HOST,
      port: ARWEAVE_CONFIG.PORT,
      protocol: ARWEAVE_CONFIG.PROTOCOL,
    });
  }

  async uploadArticle(content: {
    title: string;
    body: any;
    author: string;
    timestamp: number;
  }): Promise<string> {
    const wallet = JSON.parse(process.env.ARWEAVE_WALLET_KEY!);

    const transaction = await this.arweave.createTransaction({
      data: JSON.stringify(content),
    }, wallet);

    transaction.addTag('Content-Type', 'application/json');
    transaction.addTag('App-Name', ARWEAVE_CONFIG.APP_NAME);
    transaction.addTag('App-Version', ARWEAVE_CONFIG.APP_VERSION);
    transaction.addTag('Article-Title', content.title);
    transaction.addTag('Author', content.author);

    await this.arweave.transactions.sign(transaction, wallet);
    await this.arweave.transactions.post(transaction);

    return transaction.id; // 43-character TX ID
  }

  async getArticle(txId: string): Promise<any> {
    const data = await this.arweave.transactions.getData(txId, {
      decode: true,
      string: true
    });
    return JSON.parse(data as string);
  }

  async verifyTransaction(txId: string): Promise<boolean> {
    try {
      const status = await this.arweave.transactions.getStatus(txId);
      return status.status === 200 && status.confirmed !== null;
    } catch {
      return false;
    }
  }
}

export const arweaveClient = new ArweaveClient();
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

```bash
# .env.local / .env.example

# Arweave Permanent Storage
ARWEAVE_ENABLED=true
ARWEAVE_USE_TESTNET=true
ARWEAVE_WALLET_KEY={"kty":"RSA","n":"..."}  # JWK from AR.IO faucet

# Stellar Contracts (2 contracts - CONSOLIDATED)
NEXT_PUBLIC_TIPPING_CONTRACT_ID=<your-tipping-contract-id>  # Handles both article + highlight
NEXT_PUBLIC_NFT_CONTRACT_ID=<your-nft-contract-id>
# Note: HIGHLIGHT_CONTRACT_ID removed - unified into TIPPING_CONTRACT_ID
```

---

## Pre-requisites

1. **Arweave Wallet:** Get from https://faucet.arweave.net/ (free testnet tokens)
2. **Stellar Wallet:** Funded testnet account
3. **Stellar CLI:** `cargo install --locked stellar-cli`
4. **Rust toolchain:** `rustup target add wasm32-unknown-unknown wasm32v1-none`

---

## Success Criteria

### Arweave Integration
- [ ] Arweave client uploads articles to AR.IO testnet
- [ ] Background job triggers on article publish
- [ ] TX ID stored in Convex + displayed in UI
- [ ] Memo format uses Arweave TX ID when available (already implemented!)

### Contract Redeployment
- [ ] Single unified tipping contract deployed (article + highlight)
- [ ] NFT contract deployed with arweave_tx_id field
- [ ] Both contracts have Pausable pattern (pause/unpause)
- [ ] `lib/stellar/config.ts` uses single TIPPING_CONTRACT_ID
- [ ] `lib/stellar/client.ts` uses same contract for highlight tips
- [ ] All tests pass
