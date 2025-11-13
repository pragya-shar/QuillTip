# Arweave Integration Implementation Plan
## Deliverable 2: Permanent Content Storage & Smart Contract Upgrades

**Status:** Ready for Implementation  
**Timeline:** 2 Weeks

---

## Overview

### What We're Building

Implementing permanent, censorship-resistant content storage for QuillTip using Arweave, integrated with our existing three Stellar smart contracts. This transforms QuillTip from database-only storage to a truly decentralized publishing system.

### Current State (Deliverable 1 - ~90% Complete)

**Working Features:**
- ✅ Highlight-level tipping with unique IDs
- ✅ SHA256 hashes stored in Stellar memos
- ✅ Heatmap analytics showing top-earning phrases
- ✅ Touch support for mobile devices
- ⚠️ 50+ test highlights pending (user-generated, not blocking)

**Current Infrastructure:**
```
Next.js Frontend
    ↓
Convex Database ←→ Stellar Blockchain (3 contracts)
```

**Three Deployed Contracts (Testnet):**
1. **Article Tipping:** `CBSVFVIDV2U3SSY36TJ3MDGQDSQL3ZVL2TR7GMRBXJ3XZBE24FDHHWAM`
2. **Highlight Tipping:** `CDONAZILY4HGXK4I5VDLLM6RJE2WNSZD4XP2Y3TMKAM52VYYCVTJ64AB`
3. **NFT Minting:** `CAOWOEKBL5VX4BHN4QT2RQN4QEEBEJZLVKNRQ7UAVGOX3W4UMSSQTTC5`

### Target State (Deliverable 2)

```
Next.js Frontend
    ↓
    ├──→ Convex (fast, mutable, queries)
    ├──→ Stellar (payments, verification)
    └──→ Arweave (permanent, immutable)
```

**Why This Architecture:**
- **Convex** = Hot storage (fast queries, real-time updates, drafts)
- **Arweave** = Cold storage (permanent backup, published articles only)
- **Stellar** = Proof layer (payments + content hash verification)

**Note on Convex:** No changes to Convex dependencies or usage. Arweave is *additive* - it complements Convex, doesn't replace it.

---

## Architecture: Storage Layer Separation

### Convex Role (Unchanged)

```typescript
// Primary database - ALL existing functionality stays
const article = await ctx.db.get(articleId);              // Fast reads
const articles = await ctx.db.query("articles")           // Complex queries
  .filter(q => q.eq(q.field("published"), true))
  .collect();

// Stores:
// - All article metadata
// - Draft versions
// - User data
// - Tips/analytics
// - Real-time state
```

### Arweave Role (New)

```typescript
// Permanent backup - published articles only
const txId = await arweaveClient.uploadArticle({
  title: article.title,
  content: article.content,
  author: article.authorUsername,
  publishedAt: article.publishedAt,
});

// Returns: 43-character TX ID (permanent hash)
// Stores: Published content only (immutable)
// Use case: Backup, verification, censorship resistance
```

### How They Work Together

```typescript
// 1. User publishes article
await publishArticle(articleId);  // Updates Convex

// 2. Schedule Arweave upload (background job)
await scheduleArweaveUpload(articleId);

// 3. Article accessible immediately from Convex
const article = await getArticle(articleId);  // Instant

// 4. Arweave upload completes (2-10 min later)
// Article now has both:
// - Convex ID (for queries)
// - Arweave TX ID (for verification)

// 5. Tip with content hash
await tipArticle({
  articleId: article._id,
  arweaveTxId: article.arweaveTxId,  // Links payment to permanent content
});
```

---

## Three-Contract Upgrade Plan

### All Three Contracts Get Enhanced

#### 1. Article Tipping Contract (OLD)

**Current Functions:**
```rust
pub fn tip_article(env: Env, tipper: Address, article_id: Symbol, 
                   author: Address, amount: i128) -> TipReceipt
```

**New Functions:**
```rust
// Enhanced: accepts Arweave TX ID
pub fn tip_article_with_hash(
    env: Env,
    tipper: Address,
    article_id: Symbol,
    author: Address,
    amount: i128,
    content_hash: String,  // NEW: Arweave TX ID
) -> TipReceipt

// Query stored hash
pub fn get_article_content_hash(env: Env, article_id: Symbol) -> Option<String>
```

#### 2. Highlight Tipping Contract (NEW)

**Current Functions:**
```rust
pub fn tip_highlight_direct(env: Env, tipper: Address, highlight_id: String,
                            article_id: Symbol, author: Address, amount: i128)
```

**New Functions:**
```rust
// Enhanced: links highlight to article's Arweave content
pub fn tip_highlight_with_hash(
    env: Env,
    tipper: Address,
    highlight_id: String,
    article_id: Symbol,
    author: Address,
    amount: i128,
    content_hash: String,  // Article's Arweave TX ID
) -> TipReceipt
```

**Note:** All highlights of an article share the same content hash (the article's Arweave TX ID).

#### 3. NFT Contract

**Current Functions:**
```rust
pub fn mint_article_nft(env: Env, author: Address, article_id: Symbol,
                        tip_amount: i128, metadata_url: String) -> u64
```

**New Functions:**
```rust
// Enhanced: embeds Arweave reference in NFT
pub fn mint_article_nft_with_arweave(
    env: Env,
    author: Address,
    article_id: Symbol,
    tip_amount: i128,
    metadata_url: String,
    arweave_tx_id: String,  // NEW: Permanent content reference
) -> u64

// NFT struct updated
pub struct NFTToken {
    // ... existing fields ...
    pub arweave_tx_id: Option<String>,  // NEW
}
```

### Backward Compatibility

All old functions remain working:
- `tip_article()` still works (without hash)
- `tip_highlight_direct()` still works
- `mint_article_nft()` still works

New functions are *additions*, not replacements.

---

## Implementation Phases

### Phase 1: Arweave Infrastructure (Week 1)

#### 1.1 Setup Arweave Client

**Install Dependencies:**
```bash
npm install arweave @types/arweave --save-dev
```

**Environment Setup:**
```bash
# .env.local additions
ARWEAVE_NETWORK=testnet
ARWEAVE_GATEWAY_URL=https://testnet.arweave.net
ARWEAVE_WALLET_KEY=[Your JWK wallet key]
```

**Create Client:**
```typescript
// lib/arweave/client.ts
import Arweave from 'arweave';

export class ArweaveClient {
  private arweave: Arweave;
  private wallet: any;

  constructor() {
    this.arweave = Arweave.init({
      host: process.env.ARWEAVE_NETWORK === 'mainnet' 
        ? 'arweave.net' 
        : 'testnet.arweave.net',
      port: 443,
      protocol: 'https',
    });
  }

  /**
   * Upload article to Arweave
   * Returns: 43-character transaction ID
   */
  async uploadArticle(content: {
    title: string;
    body: any;
    author: string;
    timestamp: number;
  }): Promise<string> {
    const transaction = await this.arweave.createTransaction({
      data: JSON.stringify(content),
    }, this.wallet);

    // Add tags for discoverability
    transaction.addTag('Content-Type', 'application/json');
    transaction.addTag('App-Name', 'QuillTip');
    transaction.addTag('App-Version', '1.0');
    transaction.addTag('Article-Title', content.title);
    transaction.addTag('Author', content.author);

    await this.arweave.transactions.sign(transaction, this.wallet);
    await this.arweave.transactions.post(transaction);

    return transaction.id;
  }

  /**
   * Retrieve article from Arweave
   */
  async getArticle(txId: string): Promise<any> {
    const data = await this.arweave.transactions.getData(txId, {
      decode: true,
      string: true
    });
    return JSON.parse(data as string);
  }

  /**
   * Verify content integrity
   */
  async verifyContent(txId: string, expectedContent: string): Promise<boolean> {
    const stored = await this.getArticle(txId);
    return JSON.stringify(stored) === expectedContent;
  }
}

export const arweaveClient = new ArweaveClient();
```

#### 1.2 Update Database Schema

**Add Arweave fields to articles table:**
```typescript
// convex/schema.ts
articles: defineTable({
  // ALL EXISTING FIELDS STAY UNCHANGED
  title: v.string(),
  content: v.any(),
  authorId: v.id("users"),
  published: v.boolean(),
  // ... all other existing fields ...
  
  // NEW FIELDS (optional, additive)
  arweaveTxId: v.optional(v.string()),       // Arweave transaction ID
  arweaveUrl: v.optional(v.string()),        // Gateway URL
  arweaveVerified: v.optional(v.boolean()),  // Verified on chain?
  arweaveTimestamp: v.optional(v.number()),  // Upload timestamp
  contentVersion: v.optional(v.number()),    // Version tracking
})
```

**No changes needed to:**
- `highlights` table (inherits article's Arweave ID)
- `users` table
- `tips` table
- Any other tables

#### 1.3 Implement Upload Flow with Background Jobs

**Why background jobs?** Arweave uploads take 2-10 minutes. Users shouldn't wait.

```typescript
// convex/articles.ts

export const publishArticle = mutation({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    // ... existing publish logic ...
    
    await ctx.db.patch(args.articleId, {
      published: true,
      publishedAt: Date.now(),
    });

    // Schedule Arweave upload (doesn't block)
    await ctx.scheduler.runAfter(
      0,
      internal.arweave.uploadArticleToArweave,
      { articleId: args.articleId }
    );

    return { success: true };
  },
});

// Background worker (internal action)
export const uploadArticleToArweave = internalAction({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    const article = await ctx.runQuery(internal.articles.getArticleForUpload, {
      articleId: args.articleId,
    });

    // Retry logic: 3 attempts with exponential backoff
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const txId = await arweaveClient.uploadArticle({
          title: article.title,
          body: article.content,
          author: article.authorUsername,
          timestamp: article.publishedAt,
        });

        // Record success
        await ctx.runMutation(internal.articles.recordArweaveUpload, {
          articleId: args.articleId,
          arweaveTxId: txId,
          arweaveUrl: `https://arweave.net/${txId}`,
        });

        return; // Success!
      } catch (error) {
        if (attempt === 2) {
          // Failed after 3 attempts - log for manual retry
          console.error('Arweave upload failed:', error);
          throw error;
        }
        // Wait before retry (1s, 2s, 4s)
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
    }
  },
});

export const recordArweaveUpload = internalMutation({
  args: {
    articleId: v.id("articles"),
    arweaveTxId: v.string(),
    arweaveUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.articleId, {
      arweaveTxId: args.arweaveTxId,
      arweaveUrl: args.arweaveUrl,
      arweaveVerified: false, // Will verify later
      arweaveTimestamp: Date.now(),
      contentVersion: 1,
    });
  },
});
```

#### 1.4 Frontend Integration

```typescript
// components/articles/ArweaveStatus.tsx
'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function ArweaveStatus({ articleId }) {
  const article = useQuery(api.articles.getArticleById, { articleId });

  if (!article?.arweaveTxId) {
    return <span className="text-gray-500">Not permanently stored</span>;
  }

  if (!article.arweaveVerified) {
    return (
      <span className="text-yellow-600">
        ⏳ Verifying permanent storage...
      </span>
    );
  }

  return (
    <a 
      href={article.arweaveUrl}
      target="_blank"
      className="text-green-600 hover:underline"
    >
      ✓ Permanently stored on Arweave
    </a>
  );
}
```

#### 1.5 Content Verification Worker

**Automatic verification via cron job:**
```typescript
// convex/crons.ts
import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

// Run every 10 minutes
crons.interval(
  'verify-arweave-uploads',
  { minutes: 10 },
  internal.arweave.verifyPendingUploads
);

export default crons;

// convex/arweave.ts
export const verifyPendingUploads = internalAction({
  handler: async (ctx) => {
    const pending = await ctx.runQuery(
      internal.articles.getUnverifiedArweaveArticles
    );

    for (const article of pending) {
      const timeSinceUpload = Date.now() - article.arweaveTimestamp;
      
      // Arweave confirmation takes ~10 minutes
      if (timeSinceUpload > 10 * 60 * 1000) {
        const isValid = await arweaveClient.verifyContent(
          article.arweaveTxId,
          JSON.stringify(article.content)
        );

        if (isValid) {
          await ctx.runMutation(internal.articles.markAsVerified, {
            articleId: article._id,
          });
        }
      }
    }
  },
});
```

---

### Phase 2: Smart Contract Upgrades (Week 1-2)

#### 2.1 Contract Code Updates

**Article Tipping Contract:**
```rust
// contracts/tipping/src/lib.rs

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    // ... existing keys ...
    ArticleContentHash(Symbol),  // NEW: article_id -> Arweave TX ID
}

pub fn tip_article_with_hash(
    env: Env,
    tipper: Address,
    article_id: Symbol,
    author: Address,
    amount: i128,
    content_hash: String,  // Arweave TX ID
) -> TipReceipt {
    tipper.require_auth();
    
    if amount < MINIMUM_TIP_STROOPS {
        panic!("Amount below minimum tip");
    }
    
    // Store content hash for verification
    env.storage().persistent().set(
        &DataKey::ArticleContentHash(article_id.clone()),
        &content_hash
    );
    
    // Rest of tipping logic (same as tip_article)
    // ... transfer funds, update counters, etc ...
    
    TipReceipt {
        article_id,
        tipper,
        author,
        amount,
        timestamp: env.ledger().timestamp(),
    }
}

pub fn get_article_content_hash(env: Env, article_id: Symbol) -> Option<String> {
    env.storage()
        .persistent()
        .get(&DataKey::ArticleContentHash(article_id))
}
```

**Highlight Tipping Contract (same pattern):**
```rust
pub fn tip_highlight_with_hash(
    env: Env,
    tipper: Address,
    highlight_id: String,
    article_id: Symbol,
    author: Address,
    amount: i128,
    content_hash: String,  // Parent article's Arweave TX ID
) -> TipReceipt {
    tipper.require_auth();

    if amount < MINIMUM_TIP_STROOPS {
        panic!("Amount below minimum");
    }

    // Store article content hash (all highlights share this)
    env.storage().persistent().set(
        &DataKey::ArticleContentHash(article_id.clone()),
        &content_hash
    );

    // Rest of highlight tipping logic
    // ... same as tip_highlight_direct ...
}
```

**NFT Contract:**
```rust
// contracts/article-nft/src/lib.rs

#[derive(Clone)]
#[contracttype]
pub struct NFTToken {
    pub token_id: u64,
    pub article_id: Symbol,
    pub owner: Address,
    pub minter: Address,
    pub metadata_url: String,
    pub minted_at: u64,
    pub tip_amount: i128,
    pub arweave_tx_id: Option<String>,  // NEW
}

pub fn mint_article_nft_with_arweave(
    env: Env,
    author: Address,
    article_id: Symbol,
    tip_amount: i128,
    metadata_url: String,
    arweave_tx_id: String,  // NEW
) -> u64 {
    author.require_auth();
    
    // ... validation logic ...
    
    let nft = NFTToken {
        token_id,
        article_id: article_id.clone(),
        owner: author.clone(),
        minter: author.clone(),
        metadata_url,
        arweave_tx_id: Some(arweave_tx_id.clone()),  // NEW
        minted_at: env.ledger().timestamp(),
        tip_amount,
    };
    
    // ... storage logic ...
    
    env.events().publish(
        (Symbol::new(&env, "mint_with_arweave"), article_id),
        (author, token_id, arweave_tx_id)
    );
    
    token_id
}
```

#### 2.2 Stellar Client Updates

**Memo Format Strategy:**
```typescript
// lib/stellar/memo-format.ts

export function createMemo(params: {
  type: 'article' | 'highlight' | 'nft';
  arweaveTxId?: string;
  articleId?: string;
  highlightId?: string;
}): Memo {
  // Priority: Arweave TX ID > specific ID
  
  if (params.arweaveTxId) {
    const prefix = params.type === 'nft' ? 'nft-ar:' : 'ar:';
    const maxLen = 28 - prefix.length; // Stellar memo limit: 28 bytes
    return Memo.text(`${prefix}${params.arweaveTxId.slice(0, maxLen)}`);
  }
  
  // Fallback to existing formats (backward compatible)
  if (params.highlightId) {
    return Memo.text(params.highlightId); // Existing 28-char hash
  }
  
  if (params.articleId) {
    return Memo.text(`article:${params.articleId}`);
  }
  
  return Memo.none();
}
```

**Updated Transaction Builders:**
```typescript
// lib/stellar/client.ts

async buildTipTransaction(
  tipperPublicKey: string,
  params: {
    articleId: string;
    authorAddress: string;
    amountCents: number;
    arweaveTxId?: string;  // Optional
  }
) {
  const stroops = await this.convertCentsToStroops(params.amountCents);
  const account = await this.server.loadAccount(tipperPublicKey);
  const contract = new Contract(TIPPING_CONTRACT_ID);

  // Choose function based on Arweave availability
  const fn = params.arweaveTxId ? 'tip_article_with_hash' : 'tip_article';
  
  const baseArgs = [
    nativeToScVal(tipperPublicKey, { type: 'address' }),
    nativeToScVal(params.articleId, { type: 'symbol' }),
    nativeToScVal(params.authorAddress, { type: 'address' }),
    nativeToScVal(stroops, { type: 'i128' }),
  ];
  
  const args = params.arweaveTxId
    ? [...baseArgs, nativeToScVal(params.arweaveTxId, { type: 'string' })]
    : baseArgs;

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: this.networkPassphrase,
  })
    .addOperation(contract.call(fn, ...args))
    .addMemo(createMemo({
      type: 'article',
      arweaveTxId: params.arweaveTxId,
      articleId: params.articleId,
    }))
    .setTimeout(180)
    .build();

  return await this.sorobanServer.prepareTransaction(transaction);
}

// Similar for buildHighlightTipTransaction and buildMintTransaction
```

#### 2.3 Frontend Integration

```typescript
// components/articles/TipButton.tsx

const sendTip = async () => {
  const article = await getArticle(articleId);
  
  // Automatically includes Arweave TX ID if available
  const { xdr } = await stellarClient.buildTipTransaction(
    walletAddress,
    {
      articleId: article._id,
      authorAddress: article.authorStellarAddress,
      amountCents: selectedAmount * 100,
      arweaveTxId: article.arweaveTxId,  // undefined if not uploaded yet
    }
  );
  
  // Sign and submit (unchanged)
  const signed = await freighter.signTransaction(xdr);
  const result = await stellarClient.submitTransaction(signed);
  
  // Record in Convex (unchanged)
  await recordTip({ articleId, amount, txHash: result.hash });
};
```

---

### Phase 3: Security & Optimization (Week 2)

#### 3.1 Soroban Best Practices

**Note:** Original proposal mentioned OpenZeppelin, but **OpenZeppelin doesn't support Stellar**. We'll use Soroban best practices instead.

**Research:**
- Review Stellar's official contract examples
- Study Soroban security guidelines
- Analyze gas optimization patterns
- Document security patterns

#### 3.2 Access Control

```rust
// contracts/tipping/src/lib.rs

#[derive(Clone, PartialEq)]
#[contracttype]
pub enum Role {
    Admin,
    Moderator,
}

pub fn grant_role(env: Env, admin: Address, user: Address, role: Role) {
    admin.require_auth();
    
    let stored_admin: Address = env.storage()
        .instance()
        .get(&DataKey::Admin)
        .expect("Admin not initialized");
    
    if admin != stored_admin {
        panic!("Only admin can grant roles");
    }
    
    env.storage().persistent().set(
        &DataKey::UserRole(user.clone()),
        &role
    );
    
    env.events().publish(
        (Symbol::new(&env, "role_granted"), user.clone()),
        (admin, role)
    );
}

pub fn has_role(env: Env, user: Address, role: Role) -> bool {
    let stored_role: Option<Role> = env.storage()
        .persistent()
        .get(&DataKey::UserRole(user));
    
    matches!(stored_role, Some(r) if r == role)
}

// Emergency pause
pub fn pause_contract(env: Env, admin: Address) {
    admin.require_auth();
    
    let stored_admin: Address = env.storage()
        .instance()
        .get(&DataKey::Admin)
        .expect("Admin not initialized");
    
    if admin != stored_admin {
        panic!("Only admin can pause");
    }
    
    env.storage().instance().set(&DataKey::Paused, &true);
    
    env.events().publish(
        (Symbol::new(&env, "contract_paused"),),
        admin
    );
}

fn ensure_not_paused(env: &Env) {
    let paused: bool = env.storage()
        .instance()
        .get(&DataKey::Paused)
        .unwrap_or(false);
    
    if paused {
        panic!("Contract is paused");
    }
}

// Add to all mutable functions
pub fn tip_article(/* ... */) {
    ensure_not_paused(&env);
    // ... rest of function ...
}
```

#### 3.3 Storage Optimization

```rust
// Chunk tips for efficient storage
pub fn tip_article(env: Env, /* ... */) -> TipReceipt {
    // ... validation ...
    
    let tip_counter: u64 = /* ... */;
    let chunk_id = tip_counter / 100;  // 100 tips per chunk
    
    let mut chunk: Vec<SimpleTip> = env.storage()
        .persistent()
        .get(&DataKey::TipChunk(article_id.clone(), chunk_id))
        .unwrap_or(vec![&env]);
    
    chunk.push_back(SimpleTip {
        tipper: tipper.clone(),
        amount,
        timestamp: env.ledger().timestamp(),
    });
    
    env.storage()
        .persistent()
        .set(&DataKey::TipChunk(article_id.clone(), chunk_id), &chunk);
    
    // ... rest of function ...
}
```

#### 3.4 Testing

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tip_with_content_hash() {
        let env = Env::default();
        env.mock_all_auths();
        
        let contract_id = env.register(TippingContract, ());
        let client = TippingContractClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        let platform = Address::generate(&env);
        client.initialize(&admin, &platform, &Some(250));
        
        let tipper = Address::generate(&env);
        let author = Address::generate(&env);
        let article_id = symbol_short!("test");
        let hash = String::from_str(&env, "arweave_tx_abc123");
        
        client.tip_article_with_hash(
            &tipper,
            &article_id,
            &author,
            &1_000_000,
            &hash
        );
        
        let stored = client.get_article_content_hash(&article_id);
        assert_eq!(stored, Some(hash));
    }
}
```

---

### Phase 4: Deployment & Migration (Week 2)

#### 4.1 Build & Deploy

```bash
#!/bin/bash
# scripts/deploy-upgraded-contracts.sh

echo "Building contracts..."
cd contracts/tipping
cargo build --target wasm32-unknown-unknown --release
cd ../article-nft
cargo build --target wasm32-unknown-unknown --release
cd ../..

echo "Optimizing WASM..."
stellar contract optimize \
  --wasm target/wasm32-unknown-unknown/release/tipping.wasm \
  --wasm-out target/tipping_optimized.wasm

stellar contract optimize \
  --wasm target/wasm32-unknown-unknown/release/article_nft.wasm \
  --wasm-out target/nft_optimized.wasm

echo "Deploying to testnet..."
NEW_ARTICLE_CONTRACT=$(stellar contract deploy \
  --wasm target/tipping_optimized.wasm \
  --source quilltip-deployer \
  --network testnet)

NEW_HIGHLIGHT_CONTRACT=$(stellar contract deploy \
  --wasm target/tipping_optimized.wasm \
  --source quilltip-deployer \
  --network testnet)

NEW_NFT_CONTRACT=$(stellar contract deploy \
  --wasm target/nft_optimized.wasm \
  --source quilltip-deployer \
  --network testnet)

echo "Initializing contracts..."
stellar contract invoke \
  --id $NEW_ARTICLE_CONTRACT \
  --source quilltip-deployer \
  --network testnet \
  -- initialize \
  --admin $ADMIN_ADDRESS \
  --platform_address $PLATFORM_ADDRESS \
  --fee_bps 250

# Similar for other contracts...

echo "Deployment complete!"
echo "Article: $NEW_ARTICLE_CONTRACT"
echo "Highlight: $NEW_HIGHLIGHT_CONTRACT"
echo "NFT: $NEW_NFT_CONTRACT"
```

#### 4.2 Migration Strategy with Feature Flags

**Challenge:** Active contracts with existing data. Can't switch instantly.

**Solution:** Gradual rollout with feature flags

```typescript
// lib/stellar/config.ts

export const USE_UPGRADED_CONTRACTS = 
  process.env.NEXT_PUBLIC_USE_UPGRADED_CONTRACTS === 'true';

export const CONTRACT_IDS = {
  article: USE_UPGRADED_CONTRACTS
    ? process.env.NEXT_PUBLIC_NEW_ARTICLE_CONTRACT_ID!
    : 'CBSVFVIDV2U3SSY36TJ3MDGQDSQL3ZVL2TR7GMRBXJ3XZBE24FDHHWAM',
  
  highlight: USE_UPGRADED_CONTRACTS
    ? process.env.NEXT_PUBLIC_NEW_HIGHLIGHT_CONTRACT_ID!
    : 'CDONAZILY4HGXK4I5VDLLM6RJE2WNSZD4XP2Y3TMKAM52VYYCVTJ64AB',
  
  nft: USE_UPGRADED_CONTRACTS
    ? process.env.NEXT_PUBLIC_NEW_NFT_CONTRACT_ID!
    : 'CAOWOEKBL5VX4BHN4QT2RQN4QEEBEJZLVKNRQ7UAVGOX3W4UMSSQTTC5',
};
```

**Rollout Plan:**
```bash
# Week 1: Deploy and test
NEXT_PUBLIC_USE_UPGRADED_CONTRACTS=false  # Use old (default)

# Week 2: Internal testing
NEXT_PUBLIC_USE_UPGRADED_CONTRACTS=true   # Test new

# Week 3: Beta users (10% traffic)
# Use percentage-based rollout in code

# Week 4: Full migration
NEXT_PUBLIC_USE_UPGRADED_CONTRACTS=true   # Everyone
```

#### 4.3 Integration Testing

```typescript
// __tests__/arweave-stellar-integration.test.ts

describe('Full Arweave + Stellar Flow', () => {
  it('should complete publish → upload → tip flow', async () => {
    // 1. Publish article
    const articleId = await publishArticle({
      title: 'Test Article',
      content: testContent,
    });
    
    // 2. Schedule Arweave upload
    await scheduleArweaveUpload({ articleId });
    
    // 3. Wait for upload (mock in tests)
    await waitForArweaveUpload(articleId);
    
    // 4. Verify article has Arweave data
    const article = await getArticle(articleId);
    expect(article.arweaveTxId).toBeDefined();
    expect(article.arweaveVerified).toBe(true);
    
    // 5. Tip with content hash
    const { xdr } = await stellarClient.buildTipTransaction(
      tipperAddress,
      {
        articleId: article._id,
        authorAddress: article.authorStellarAddress,
        amountCents: 100,
        arweaveTxId: article.arweaveTxId,
      }
    );
    
    // 6. Verify memo contains Arweave hash
    const tx = parseTransaction(xdr);
    expect(tx.memo.value).toContain('ar:');
    expect(tx.memo.value).toContain(article.arweaveTxId!.slice(0, 24));
  });
});
```

#### 4.4 Documentation

Create user guide for writers and technical docs for developers.

---

## Development Tools

### Required Tools

**NPM Packages:**
```json
{
  "dependencies": {
    "arweave": "^1.14.4"
  },
  "devDependencies": {
    "@types/arweave": "^1.14.0"
  }
}
```

**Rust Toolchain:**
```bash
cargo install --locked soroban-cli --features opt
rustup target add wasm32-unknown-unknown
```

---

## Success Criteria

### Technical Metrics

**Arweave Integration:**
- ✅ Articles upload to Arweave testnet
- ✅ Content retrievable via TX ID
- ✅ Verification confirms integrity
- ✅ >99% upload success rate
- ✅ Automatic retry on failure

**Smart Contracts:**
- ✅ All three contracts deployed with Arweave support
- ✅ Content hashes stored on-chain
- ✅ Memos correctly formatted
- ✅ Security features working
- ✅ >90% test coverage

**Integration:**
- ✅ Background jobs process uploads
- ✅ No impact on existing flows
- ✅ Backward compatible

---

## Timeline

### Week 1
- Days 1-2: Arweave infrastructure setup
- Days 3-4: Upload system with background jobs
- Day 5: Stellar memo integration

### Week 2
- Days 1-2: Security enhancements
- Days 3-4: Testing (unit, integration, E2E)
- Day 5: Deployment & migration setup

**Total Duration:** 2 weeks of focused development

---

## Next Steps

### Immediate Actions (Day 1)

1. **Setup Arweave Testnet** (15 min)
```bash
npm install arweave @types/arweave
# Get testnet wallet from https://faucet.arweave.net
```

2. **Create Arweave Client** (30 min)
Follow Phase 1.1 implementation

3. **Update Database Schema** (15 min)
Add optional Arweave fields to articles table

4. **Test Upload** (30 min)
Verify testnet connectivity

### First Week Goals

- [ ] Arweave client operational
- [ ] Database schema updated
- [ ] Background upload system working
- [ ] Contract code updated

### Second Week Goals

- [ ] Security features implemented
- [ ] All tests passing
- [ ] Contracts deployed to testnet
- [ ] Migration strategy ready

---

## Ready to Start?

**Prerequisites:**
- ✅ Stellar testnet contracts deployed
- ✅ Convex operational
- ✅ Frontend working

**Blockers:**
- ❌ None! Can start immediately

**Parallel Work:**
- ✅ 50+ test highlights (independent)
- ✅ Community building (independent)

Let's build permanent storage for QuillTip! 🚀
