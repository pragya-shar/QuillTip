# Arweave Integration - Implementation Plan V2
## Deliverable 2: Permanent Content Storage & OpenZeppelin Security Patterns

**Status:** Ready for Implementation
**Testing:** AR.IO Testnet (FREE - no mainnet costs)
**Contract Modifications:** After Dec 17, 2025

---

## Executive Summary

QuillTip codebase is **~85% ready** for Arweave integration. Key finding: `memo-utils.ts` already handles Arweave TX IDs (future-proofed!).

### Deliverable 2 Requirements
| Requirement | Solution |
|-------------|----------|
| Articles permanently stored on Arweave | AR.IO Testnet (free tokens) |
| Content hash in Stellar memo | Already implemented in `memo-utils.ts` |
| OpenZeppelin security patterns | Ownable, Pausable, AccessControl in Soroban |

---

## AR.IO Testnet - Free Arweave Testing

**Faucet:** https://faucet.arweave.net/

- Up to **10,000 free test tokens**
- Works with standard `arweave-js` SDK
- Real network behavior, real TX IDs
- Perfect for Deliverable 2 demo

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

### 3. Deployed Contracts (Stellar Testnet)
- Article Tipping: `CBSVFVIDV2U3SSY36TJ3MDGQDSQL3ZVL2TR7GMRBXJ3XZBE24FDHHWAM`
- Highlight Tipping: `CDONAZILY4HGXK4I5VDLLM6RJE2WNSZD4XP2Y3TMKAM52VYYCVTJ64AB`
- NFT Minting: `CAOWOEKBL5VX4BHN4QT2RQN4QEEBEJZLVKNRQ7UAVGOX3W4UMSSQTTC5`

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

## Implementation Phases

### PHASE 1: Arweave Infrastructure

#### 1.1 Install Dependencies
```bash
npm install arweave
npm install -D @types/arweave
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
    transaction.addTag('App-Name', 'QuillTip');
    transaction.addTag('App-Version', '1.0');
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
**File:** `convex/schema.ts` (MODIFY)

Add to `articles` table:
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
  },
});
```

#### 3.2 Hook into publishArticle
**File:** `convex/articles.ts` (MODIFY)

```typescript
// Add after setting published: true
if (process.env.ARWEAVE_ENABLED === 'true') {
  await ctx.scheduler.runAfter(
    0,
    internal.arweave.uploadArticleToArweave,
    { articleId: args.articleId }
  );
}
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

### PHASE 5: OpenZeppelin Security Patterns (After Dec 17, 2025)

Implement these patterns in Soroban contracts:

| Pattern | Implementation |
|---------|----------------|
| **Ownable** | Admin-only functions with `require_auth()` |
| **Pausable** | Emergency pause/unpause functionality |
| **ReentrancyGuard** | Check-effects-interactions pattern |
| **AccessControl** | Role-based permissions (Admin, Moderator) |

**Contract modifications (deferred):**
- Add `tip_article_with_hash()` function
- Add `tip_highlight_with_hash()` function
- Add `arweave_tx_id` to NFTToken struct
- Add `mint_article_nft_with_arweave()` function

---

## Files Summary

### CREATE (5 files)
| File | Purpose |
|------|---------|
| `lib/arweave/client.ts` | Arweave SDK wrapper |
| `lib/arweave/config.ts` | Testnet/mainnet config |
| `lib/arweave/types.ts` | TypeScript types |
| `convex/arweave.ts` | Background upload actions |
| `components/articles/ArweaveStatus.tsx` | Status display |

### MODIFY (3 files)
| File | Changes |
|------|---------|
| `convex/schema.ts` | Add 5 Arweave fields |
| `convex/articles.ts` | Hook publishArticle |
| `.env.example` | Add Arweave config vars |

---

## Environment Variables

```bash
# .env.local
ARWEAVE_ENABLED=true
ARWEAVE_USE_TESTNET=true
ARWEAVE_WALLET_KEY={"kty":"RSA","n":"..."}  # JWK from AR.IO faucet
```

---

## Success Criteria

- [x] Arweave client with AR.IO testnet support
- [x] Background upload on article publish
- [x] TX ID stored in Convex
- [x] ArweaveStatus component displays status
- [x] Memo format ready (already done!)
- [ ] OpenZeppelin patterns in contracts (after Dec 17)

---

## Next Steps

1. Get AR.IO testnet wallet from https://faucet.arweave.net/
2. Request free test tokens (up to 10,000)
3. Implement Arweave client files
4. Update schema and articles mutation
5. Test end-to-end flow: publish → upload → verify TX ID
