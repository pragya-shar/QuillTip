# Phase 5: NFT Ownership & Content Tokenization (Weeks 15-17)

> **📝 Implementation Note**: This phase builds on the complete Next.js 15 application with micro-tipping from Phase 4. NFT features are integrated as modern React components with proper TypeScript types.

## Implementation Status Checklist

### ✅ Completed

- [x] **Environment Setup**
  - [x] Created feature branch `feature/phase-5-nft-ownership`
  - [x] Set up contracts directory structure (`/contracts/article-nft`)
  - [x] Configured Rust project with Soroban SDK v22.0.0

- [x] **Smart Contract Development**
  - [x] Created minimal Article NFT contract (195 lines)
  - [x] Implemented core functions (mint_article_nft, transfer, get_owner)
  - [x] Added tip threshold validation ($10 default)
  - [x] Integrated NFT hooks in tipping contract
  - [x] Written unit tests for NFT contract

- [x] **Database Schema**
  - [x] Added ArticleNFT model with ownership tracking
  - [x] Added NFTTransfer model for transfer history
  - [x] Updated User and Article relations
  - [x] Generated Prisma client

- [x] **API Endpoints**
  - [x] POST /api/nft/mint - Mint article as NFT
  - [x] GET /api/nft/[articleId] - Get NFT status/eligibility
  - [x] POST /api/nft/transfer - P2P NFT transfers
  - [x] GET /api/nft/owned - Get user's owned NFTs

- [x] **UI Components**
  - [x] MintButton component with progress bar
  - [x] NFTBadge component with rarity tiers
  - [x] TransferModal for P2P transfers
  - [x] NFTIntegration example component
  - [x] Component index exports

- [x] **Testing & Build**
  - [x] Fixed TypeScript type errors
  - [x] Fixed ESLint issues
  - [x] Build passes successfully
  - [x] Rust contract tests pass

### 🚧 In Progress

### ❌ Not Started

- [ ] **Testing**
  - [ ] Integration test suite for NFT flows
  - [ ] Manual test helper functions
  - [ ] E2E tests for minting and transfers

- [ ] **Contract Deployment**
  - [ ] Deploy to Stellar testnet
  - [ ] Initialize with platform address
  - [ ] Update environment variables with contract ID

- [ ] **Frontend Integration**
  - [ ] Integrate NFT components into article pages
  - [ ] Add NFT collection page for users
  - [ ] Implement real-time NFT status updates

- [ ] **Documentation**
  - [ ] User guide for NFT minting
  - [ ] Author guide for NFT management
  - [ ] API documentation for NFT endpoints

### 🔄 Deferred for Production (Post-POC)

- [ ] **Complex Features (Intentionally Excluded)**
  - [ ] Royalty system with automated distribution
  - [ ] On-chain marketplace integration
  - [ ] IPFS metadata storage (using URLs for POC)
  - [ ] Complex auction mechanisms
  - [ ] Detailed ownership history tracking
  - [ ] Secondary market features
  - [ ] Price discovery mechanisms

- [ ] **Production Enhancements**
  - [ ] Real XLM transfers (currently internal tracking)
  - [ ] Mainnet deployment
  - [ ] Advanced security features (reentrancy guards, upgrade mechanisms)
  - [ ] Gas optimization
  - [ ] Batch minting capabilities
  - [ ] Cross-chain bridges

## Overview

Implement true content ownership through NFTs on Stellar, enabling writers to mint their articles as NFTs, transfer ownership, and earn royalties from secondary sales.

## Goals

- Create article NFT minting system on Stellar
- Implement ownership verification and transfers
- Build NFT marketplace integration
- Design royalty system for resales
- Track complete ownership history

## Technical Requirements

### NFT Implementation

- **Standard**: Stellar NFTs (using asset issuance)
- **Metadata**: IPFS for off-chain metadata storage
- **Smart Contracts**: Soroban for advanced NFT features
- **Marketplace**: Integration with existing Stellar NFT platforms

### Contract Extensions

- **NFT Minting Contract**: Article tokenization
- **Royalty Contract**: Automated royalty distribution
- **Marketplace Contract**: Trading and transfers
- **Metadata Contract**: On-chain metadata management

## Smart Contract Specifications

### Article NFT Contract

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, vec, Env, Symbol, Address, Vec, Map};

#[contract]
pub struct ArticleNFTContract;

#[contractimpl]
impl ArticleNFTContract {
    /// Mint new article NFT
    pub fn mint_article(
        env: Env,
        author: Address,
        article_id: Symbol,
        metadata_uri: String,
        royalty_percentage: u32, // Basis points (1000 = 10%)
    ) -> Result<NFTToken, Error> {
        // Verify author owns article
        // Create unique NFT identifier
        // Store metadata reference
        // Set royalty percentage

## Detailed Implementation Plan

### Week 15: NFT Contract Development

#### Day 1-2: Stellar Asset Creation
1. **Article NFT Asset Contract**
   ```rust
   // Create unique assets for each article
   pub fn create_article_asset(
       env: Env,
       author: Address,
       article_id: Symbol,
   ) -> AssetContract {
       let asset_code = format!("ART_{}", article_id);
       let asset = Asset::new(&env, &asset_code, &author);
       
       // Set asset properties
       asset.set_auth_required(true);
       asset.set_auth_revocable(false);
       asset.set_clawback_enabled(false);
       
       asset
   }
   ```

2. **NFT Metadata Structure**

   ```typescript
   interface ArticleNFTMetadata {
     name: string
     description: string
     image: string
     external_url: string
     attributes: {
       trait_type: string
       value: string
     }[]
     properties: {
       article_id: string
       author: string
       created_at: string
       word_count: number
       tip_history: TipData[]
     }
   }
   ```

#### Day 3-4: Minting & Ownership

1. **Minting Flow Implementation**

   ```typescript
   // components/nft/MintArticleNFT.tsx
   export const MintArticleNFT = ({ articleId, authorAddress }) => {
     const [isLoading, setIsLoading] = useState(false)
     const { signTransaction } = useWallet()
     
     const handleMint = async () => {
       setIsLoading(true)
       
       try {
         // Upload metadata to IPFS
         const metadata = await uploadMetadata({
           name: article.title,
           description: article.excerpt,
           image: article.coverImage,
           external_url: `${window.location.origin}/${article.slug}`,
           properties: {
             article_id: articleId,
             author: authorAddress,
             created_at: article.createdAt,
             word_count: calculateWordCount(article.content)
           }
         })
         
         // Mint NFT via contract
         const result = await nftContract.mintArticle({
           author: authorAddress,
           articleId,
           metadataUri: metadata.ipfsHash,
           royaltyPercentage: 1000 // 10%
         })
         
         toast.success('Article NFT minted successfully!')
       } catch (error) {
         toast.error('Failed to mint NFT')
       } finally {
         setIsLoading(false)
       }
     }
     
     return (
       <Card>
         <CardHeader>
           <CardTitle>Mint Article as NFT</CardTitle>
           <CardDescription>
             Create a unique NFT for this article to enable ownership trading
           </CardDescription>
         </CardHeader>
         <CardContent>
           <button 
             onClick={handleMint}
             disabled={isLoading}
             className="btn-primary"
           >
             {isLoading ? 'Minting...' : 'Mint NFT'}
           </button>
         </CardContent>
       </Card>
     )
   }
   ```

#### Day 5: Marketplace Integration

1. **Transfer & Trading Interface**

   ```typescript
   // components/nft/NFTMarketplace.tsx
   export const NFTMarketplace = () => {
     const [listings, setListings] = useState<NFTListing[]>([])
     
     const buyNFT = async (listingId: string, price: string) => {
       // Handle NFT purchase via smart contract
       await marketplaceContract.buyNFT({
         listingId,
         price,
         buyer: currentUser.publicKey
       })
     }
     
     return (
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {listings.map(listing => (
           <NFTCard 
             key={listing.id}
             listing={listing}
             onBuy={buyNFT}
           />
         ))}
       </div>
     )
   }
   ```

### Week 16: Royalty System & Ownership Tracking

#### Day 1-2: Royalty Distribution

1. **Automated Royalty Smart Contract**

   ```rust
   pub fn distribute_royalties(
       env: Env,
       nft_id: Symbol,
       sale_price: i128,
   ) -> Result<(), Error> {
       let nft_info = get_nft_info(&env, &nft_id)?;
       let royalty_amount = (sale_price * nft_info.royalty_bps as i128) / 10_000;
       
       // Transfer royalty to original creator
       token::transfer(
           &env,
           &get_buyer_address(&env),
           &nft_info.creator,
           &royalty_amount
       );
       
       // Transfer remainder to current seller
       let seller_amount = sale_price - royalty_amount;
       token::transfer(
           &env,
           &get_buyer_address(&env),
           &nft_info.current_owner,
           &seller_amount
       );
       
       Ok(())
   }
   ```

#### Day 3-4: Ownership History & Analytics

1. **Ownership Tracking System**

   ```typescript
   // Track complete ownership history
   export const OwnershipHistory = ({ nftId }: { nftId: string }) => {
     const { data: history } = useQuery({
       queryKey: ['ownership-history', nftId],
       queryFn: () => api.get(`/api/nft/${nftId}/history`)
     })
     
     return (
       <div className="space-y-4">
         <h3 className="font-semibold">Ownership History</h3>
         {history?.map((transfer, idx) => (
           <div key={idx} className="flex justify-between p-3 border rounded">
             <div>
               <p className="font-medium">{transfer.from} → {transfer.to}</p>
               <p className="text-sm text-gray-500">{transfer.date}</p>
             </div>
             <div className="text-right">
               <p className="font-medium">{transfer.price} XLM</p>
               <p className="text-xs text-gray-500">
                 Royalty: {transfer.royalty} XLM
               </p>
             </div>
           </div>
         ))}
       </div>
     )
   }
   ```

#### Day 5: Secondary Market Features

1. **Price Discovery & Bidding**

   ```typescript
   // Auction system for rare article NFTs
   export const NFTAuction = ({ nftId }: { nftId: string }) => {
     const [currentBid, setCurrentBid] = useState<string>('0')
     const [timeRemaining, setTimeRemaining] = useState<number>(0)
     
     const placeBid = async (amount: string) => {
       await auctionContract.placeBid({
         nftId,
         amount: parseFloat(amount) * 10_000_000, // Convert to stroops
         bidder: currentUser.publicKey
       })
     }
     
     return (
       <Card>
         <CardHeader>
           <CardTitle>Current Auction</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="space-y-4">
             <div className="text-center">
               <p className="text-2xl font-bold">{currentBid} XLM</p>
               <p className="text-sm text-gray-500">Current Bid</p>
             </div>
             
             <CountdownTimer timeRemaining={timeRemaining} />
             
             <BidForm onSubmit={placeBid} />
           </div>
         </CardContent>
       </Card>
     )
   }
   ```

### Week 17: Testing & Launch

#### Day 1-3: Comprehensive Testing

1. **NFT Flow Testing**

   ```typescript
   describe('NFT Minting & Trading', () => {
     test('complete NFT lifecycle', async () => {
       // 1. Mint NFT
       const nft = await mintArticleNFT(testArticle)
       expect(nft.tokenId).toBeTruthy()
       
       // 2. List for sale
       await listNFT(nft.tokenId, '100') // 100 XLM
       
       // 3. Purchase by another user
       const sale = await buyNFT(nft.tokenId, testBuyer)
       
       // 4. Verify royalty distribution
       const creatorBalance = await getBalance(testCreator)
       expect(creatorBalance).toBeGreaterThan(10) // 10% royalty
     })
   })
   ```

#### Day 4-5: Analytics & Documentation

1. **NFT Analytics Dashboard**

   ```typescript
   // Real-time NFT marketplace metrics
   export const NFTAnalytics = () => {
     return (
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <MetricCard title="Total NFTs Minted" value="1,234" />
         <MetricCard title="Trading Volume" value="45,678 XLM" />
         <MetricCard title="Average Price" value="12.5 XLM" />
         <MetricCard title="Active Traders" value="892" />
       </div>
     )
   }
   ```

        // Emit minting event
    }

    /// Transfer NFT ownership
    pub fn transfer(
        env: Env,
        from: Address,
        to: Address,
        token_id: Symbol,
        price: Option<i128>,
    ) -> Result<TransferReceipt, Error> {
        // Verify ownership
        // Calculate and distribute royalties if sale
        // Update ownership records
        // Emit transfer event
    }

    /// Get NFT metadata
    pub fn get_metadata(
        env: Env,
        token_id: Symbol,
    ) -> Result<NFTMetadata, Error> {
        // Return on-chain metadata
        // Include IPFS URI for full data
    }

    /// List NFT for sale
    pub fn list_for_sale(
        env: Env,
        owner: Address,
        token_id: Symbol,
        price: i128,
    ) -> Result<(), Error> {
        // Verify ownership
        // Create sale listing
        // Emit listing event
    }
}

# [derive(Clone)]
pub struct NFTToken {
    pub token_id: Symbol,
    pub article_id: Symbol,
    pub author: Address,
    pub owner: Address,
    pub metadata_uri: String,
    pub royalty_percentage: u32,
    pub mint_timestamp: u64,
}

# [derive(Clone)]
pub struct NFTMetadata {
    pub title: String,
    pub description: String,
    pub author_name: String,
    pub creation_date: u64,
    pub word_count: u32,
    pub tip_total: i128,
    pub read_count: u32,
    pub ipfs_hash: String,
}

```

### Royalty Distribution Contract
```rust
#[contract]
pub struct RoyaltyContract;

#[contractimpl]
impl RoyaltyContract {
    /// Calculate and distribute royalties
    pub fn distribute_royalty(
        env: Env,
        sale_price: i128,
        royalty_percentage: u32,
        original_author: Address,
        seller: Address,
    ) -> Result<RoyaltyDistribution, Error> {
        // Calculate royalty amount
        // Transfer royalty to author
        // Transfer remainder to seller
        // Record transaction
    }

    /// Get royalty earnings for author
    pub fn get_royalty_earnings(
        env: Env,
        author: Address,
    ) -> Result<RoyaltyEarnings, Error> {
        // Return total royalties earned
        // Include transaction history
    }
}

#[derive(Clone)]
pub struct RoyaltyDistribution {
    pub author_royalty: i128,
    pub seller_proceeds: i128,
    pub transaction_id: Symbol,
}
```

### Marketplace Integration Contract

```rust
#[contract]
pub struct MarketplaceContract;

#[contractimpl]
impl MarketplaceContract {
    /// Create buy order
    pub fn create_buy_order(
        env: Env,
        buyer: Address,
        token_id: Symbol,
        offer_price: i128,
    ) -> Result<(), Error> {
        // Create purchase offer
        // Lock buyer funds
        // Notify seller
    }

    /// Accept buy order
    pub fn accept_offer(
        env: Env,
        seller: Address,
        order_id: Symbol,
    ) -> Result<(), Error> {
        // Verify seller owns NFT
        // Execute transfer with royalties
        // Release funds
    }

    /// Get market listings
    pub fn get_listings(
        env: Env,
        filter: ListingFilter,
    ) -> Result<Vec<MarketListing>, Error> {
        // Return filtered listings
        // Include price history
    }
}
```

## Database Schema Updates

```prisma
model ArticleNFT {
  id              String    @id @default(cuid())
  articleId       String    @unique
  article         Article   @relation(fields: [articleId], references: [id])
  
  // NFT data
  tokenId         String    @unique
  contractAddress String
  metadataUri     String
  ipfsHash        String
  
  // Ownership
  mintedBy        String
  minter          User      @relation("NFTsMinted", fields: [mintedBy], references: [id])
  currentOwner    String
  owner           User      @relation("NFTsOwned", fields: [currentOwner], references: [id])
  
  // Royalty settings
  royaltyPercentage Int     @default(1000) // 10% default
  
  // Status
  isListed        Boolean   @default(false)
  listPrice       String?   // In stroops
  
  mintedAt        DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  transfers       NFTTransfer[]
  royalties       RoyaltyPayment[]
  
  @@index([currentOwner])
  @@index([tokenId])
}

model NFTTransfer {
  id              String    @id @default(cuid())
  nftId           String
  nft             ArticleNFT @relation(fields: [nftId], references: [id])
  
  // Transfer details
  fromAddress     String
  fromUser        User      @relation("TransfersFrom", fields: [fromAddress], references: [id])
  toAddress       String
  toUser          User      @relation("TransfersTo", fields: [toAddress], references: [id])
  
  // Transaction data
  price           String?   // Null if gift/transfer
  transactionId   String    @unique
  
  transferredAt   DateTime  @default(now())
  
  @@index([nftId])
  @@index([fromAddress])
  @@index([toAddress])
}

model RoyaltyPayment {
  id              String    @id @default(cuid())
  nftId           String
  nft             ArticleNFT @relation(fields: [nftId], references: [id])
  
  // Payment details
  salePrice       String
  royaltyAmount   String
  authorId        String
  author          User      @relation(fields: [authorId], references: [id])
  
  // Transaction reference
  transferId      String
  transactionId   String
  
  paidAt          DateTime  @default(now())
  
  @@index([authorId])
  @@index([nftId])
}

model MarketplaceListing {
  id              String    @id @default(cuid())
  nftId           String
  nft             ArticleNFT @relation(fields: [nftId], references: [id])
  
  // Listing details
  price           String
  currency        String    @default("XLM")
  sellerId        String
  seller          User      @relation(fields: [sellerId], references: [id])
  
  // Status
  status          ListingStatus @default(ACTIVE)
  
  listedAt        DateTime  @default(now())
  expiresAt       DateTime?
  soldAt          DateTime?
  
  @@index([status])
  @@index([sellerId])
}

enum ListingStatus {
  ACTIVE
  SOLD
  CANCELLED
  EXPIRED
}
```

## API Endpoints

### NFT Management

- `POST /api/nft/mint` - Mint article as NFT
- `GET /api/nft/[tokenId]` - Get NFT details
- `POST /api/nft/transfer` - Transfer NFT
- `GET /api/nft/owned` - Get user's NFTs
- `GET /api/nft/created` - Get user's minted NFTs

### Marketplace

- `POST /api/marketplace/list` - List NFT for sale
- `GET /api/marketplace/listings` - Browse listings
- `POST /api/marketplace/buy` - Purchase NFT
- `POST /api/marketplace/offer` - Make offer
- `GET /api/marketplace/history` - Price history

### Royalties

- `GET /api/royalties/earnings` - Get royalty earnings
- `GET /api/royalties/history` - Royalty payment history

## UI/UX Implementation

### NFT Minting Interface

```
┌─────────────────────────────────────────────┐
│  Mint Your Article as NFT                   │
├─────────────────────────────────────────────┤
│  Article: "The Future of Digital Writing"   │
│  Author: @yourname                          │
│  Published: Dec 1, 2024                     │
│  Total Tips: $45.30                         │
│                                             │
│  Royalty Rate: [10%] (You earn on resales) │
│                                             │
│  ⚠️ Minting is permanent and creates       │
│  transferable ownership of this article     │
│                                             │
│  [🎨 Mint as NFT]                          │
└─────────────────────────────────────────────┘
```

### NFT Display

```
┌─────────────────────────────────────────────┐
│  📜 NFT Article                        #0042│
├─────────────────────────────────────────────┤
│  "The Future of Digital Writing"            │
│  By @originalauthor                         │
│                                             │
│  Owner: @currentowner                       │
│  Minted: Dec 1, 2024                        │
│  Royalty: 10%                               │
│                                             │
│  Stats:                                     │
│  • 12,453 reads                             │
│  • $127.45 in tips                          │
│  • 3 previous owners                        │
│                                             │
│  [List for Sale] [Transfer] [View Article]  │
└─────────────────────────────────────────────┘
```

### Marketplace Listing

```
┌─────────────────────────────────────────────┐
│  NFT Marketplace                            │
├─────────────────────────────────────────────┤
│  Filter: [All] [Listed] [My Collection]     │
│  Sort: [Recent] [Price ↓] [Tips ↓]         │
│                                             │
│  ┌─────────────┐ ┌─────────────┐           │
│  │ Article NFT │ │ Article NFT │           │
│  │             │ │             │           │
│  │ Price: 500  │ │ Price: 250  │           │
│  │ XLM         │ │ XLM         │           │
│  │ Tips: $234  │ │ Tips: $189  │           │
│  └─────────────┘ └─────────────┘           │
│                                             │
│  [Load More]                                │
└─────────────────────────────────────────────┘
```

### Ownership History

```
┌─────────────────────────────────────────────┐
│  Ownership History                          │
├─────────────────────────────────────────────┤
│  Current: @collector123                     │
│  ↑                                          │
│  Dec 15: Purchased for 500 XLM             │
│  From: @trader456                           │
│  ↑                                          │
│  Dec 1: Purchased for 200 XLM              │
│  From: @firstbuyer                          │
│  ↑                                          │
│  Nov 15: Minted by @originalauthor         │
│                                             │
│  Total Royalties Paid: 70 XLM              │
└─────────────────────────────────────────────┘
```

## IPFS Metadata Structure

```json
{
  "name": "Article Title",
  "description": "Article excerpt or description",
  "image": "ipfs://QmArticleCoverImage",
  "external_url": "https://quilltip.com/article/slug",
  "attributes": [
    {
      "trait_type": "Author",
      "value": "@originalauthor"
    },
    {
      "trait_type": "Word Count",
      "value": 2500
    },
    {
      "trait_type": "Published Date",
      "value": "2024-12-01"
    },
    {
      "trait_type": "Total Tips",
      "value": "$127.45"
    },
    {
      "trait_type": "Read Count",
      "value": 12453
    }
  ],
  "content": {
    "full_text": "ipfs://QmArticleFullText",
    "format": "markdown"
  }
}
```

## Security Considerations

### NFT Security

- Verify article ownership before minting
- Prevent double-minting of same article
- Secure metadata storage on IPFS
- Validate royalty percentages (max 50%)

### Marketplace Security

- Escrow pattern for secure trades
- Prevent front-running attacks
- Validate price manipulations
- Time-locked transactions

## Performance Optimizations

### Contract Optimization

- Lazy minting for gas efficiency
- Batch transfer capabilities
- Efficient royalty calculations
- Minimal storage usage

### Frontend Optimization

- Cache NFT metadata locally
- Lazy load marketplace listings
- Optimize IPFS gateway usage
- Background metadata updates

## Testing Requirements

### Contract Tests

- NFT minting and metadata
- Ownership transfers
- Royalty calculations
- Marketplace operations

### Integration Tests

- End-to-end minting flow
- Marketplace purchase flow
- Royalty distribution accuracy
- IPFS integration

## Success Metrics

- **NFT Adoption**: % of articles minted as NFTs
- **Trading Volume**: Monthly NFT sales volume
- **Royalty Generation**: Average royalties per author
- **Market Liquidity**: Average time to sale
- **Owner Satisfaction**: NFT holder retention

## Dependencies & Risks

### Dependencies

- IPFS availability for metadata
- Stellar NFT ecosystem maturity
- Marketplace liquidity
- Gas costs for operations

### Risks

- **Adoption**: Authors hesitant to tokenize
- **Liquidity**: Low trading volume
- **Technical**: IPFS pinning costs
- **Legal**: NFT regulatory uncertainty

### Mitigation Strategies

- Education on NFT benefits
- Initial liquidity incentives
- Redundant IPFS pinning
- Legal compliance review

## Next Phase Preparation

While building Phase 5, prepare for Phase 6 by:

- Researching Arweave integration
- Planning content migration strategy
- Designing permanent storage architecture
- Exploring cross-chain bridges for NFTs
