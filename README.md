# QuillTip - Decentralized Publishing Platform

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live%20Demo-quilltip.me-blue?style=for-the-badge)](https://quilltip.me)
[![Stellar Contract](https://img.shields.io/badge/Stellar%20Contract-View%20on%20Explorer-yellow?style=for-the-badge)](https://stellar.expert/explorer/testnet/contract/CBSVFVIDV2U3SSY36TJ3MDGQDSQL3ZVL2TR7GMRBXJ3XZBE24FDHHWAM)

</div>

**🔗 Live Application:** [https://quilltip.me](https://quilltip.me)  
**📜 Tipping Contract:** [`CBSVFVIDV2U3SSY36TJ3MDGQDSQL3ZVL2TR7GMRBXJ3XZBE24FDHHWAM`](https://stellar.expert/explorer/testnet/contract/CBSVFVIDV2U3SSY36TJ3MDGQDSQL3ZVL2TR7GMRBXJ3XZBE24FDHHWAM)

## 🎭 Demo Account

| Field | Value |
|-------|-------|
| **Email** | demo@example.com |
| **Password** | Stellar123 |

## 🎥 Demo Video

<div style="position: relative; padding-bottom: 62.5%; height: 0;"><iframe src="https://www.loom.com/embed/647b5117508d4dd8a6e31e27698fcf6a?sid=5dcee0cb-0786-4a0a-8cb5-544f93251ade" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>

## 🚀 Overview

QuillTip is a decentralized publishing platform where writers can earn money through reader tips. Built with Next.js 15, Convex backend, and Stellar blockchain for payments. QuillTip enables writers to earn direct income from readers while providing an interactive, engaging reading experience.

## 🎯 Key Features

- **Direct Payments**: Authors receive 97.5% of tips via Stellar
- **Free Access**: No subscription required to read or write
- **Real-time Features**: Live tips and text highlights
- **NFT Support**: Articles can be minted as NFTs
- **Instant Payouts**: No minimum withdrawal amounts

## 🏗️ Technical Stack

### Frontend

- **Next.js 15.4.5**: React framework with App Router
- **TypeScript 5**: Type safety
- **Tailwind CSS 4**: Styling
- **Radix UI**: UI components
- **TipTap 3**: Rich text editor
- **Motion**: Animations
- **Lucide React**: Icons

### Backend

- **Convex 1.26**: Real-time backend
  - Type-safe APIs
  - Real-time subscriptions
  - Authentication (@convex-dev/auth)
  - File storage
  - Caching

### Blockchain

- **Stellar Network**: Payment processing
- **Soroban Smart Contracts**: Rust contracts for:
  - Tip distribution and fees
  - NFT minting
  - Peer-to-peer transfers

### Database Schema

```text
// Core Tables (Convex)
- users          // User profiles and authentication
- articles       // Published content and drafts
- tips           // Transaction records
- highlights     // Interactive annotations
- articleNFTs    // Minted article NFTs
- earnings       // Author revenue tracking
- fileUploads    // Media storage metadata
- withdrawals    // Payout history
- tags           // Content categorization
- authTables     // Convex Auth system tables
```

## 📦 Project Structure

```text
QuillTip/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── [username]/        # User profiles
│   ├── articles/          # Article views
│   ├── write/             # Editor interface
│   └── drafts/            # Draft management
├── components/            # React components
│   ├── article/           # Article-specific components
│   ├── editor/            # TipTap editor components
│   ├── ui/                # Shared UI components
│   └── user/              # User-related components
├── convex/                # Backend functions
│   ├── articles.ts        # Article CRUD operations
│   ├── auth.ts            # Authentication logic
│   ├── highlights.ts      # Highlight management
│   ├── nfts.ts            # NFT operations
│   ├── tips.ts            # Tipping transactions
│   ├── uploads.ts         # File storage
│   └── users.ts           # User management
├── contracts/             # Stellar smart contracts
│   ├── tipping/           # Tip distribution contract
│   └── article-nft/       # NFT minting contract
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
└── types/                 # TypeScript definitions
```

## 🌟 Key Features

### For Writers

- **Rich Text Editor**
  - Advanced formatting (headings, lists, code blocks)
  - Image uploads with automatic compression
  - YouTube video embeds
  - Syntax highlighting for code
  - Auto-save every 30 seconds
  - Draft management system

- **Analytics Dashboard**
  - Real-time earnings tracking
  - Article performance metrics
  - Reader engagement statistics
  - Tip history and trends

- **NFT Minting**
  - Automatic eligibility after tip threshold
  - One-click minting process
  - Full ownership and transfer rights

### For Readers

- **Interactive Reading**
  - Text highlighting with notes
  - Public/private annotations
  - Color-coded highlights
  - Persistent across sessions

- **Microtipping**
  - Support authors with $0.01 - $100
  - Preset amounts ($1, $5, $10)
  - Instant Stellar transactions
  - Transaction history

- **Content Discovery**
  - Full-text search
  - Tag-based filtering
  - Author collections
  - Trending articles

### For Collectors

- **Article NFTs**
  - Unique digital collectibles
  - Transferable ownership
  - On-chain provenance
  - Future marketplace integration

## 🔧 Installation & Setup

### Prerequisites

- Node.js 20+ and npm/yarn
- Git
- Stellar wallet (for blockchain features)

### Quick Start

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/quilltip.git
cd quilltip
```

1. **Install dependencies**

```bash
npm install
```

1. **Set up environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Convex (auto-generated on first run)
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Site URL (for auth redirects)
SITE_URL=http://localhost:3000

# Stellar Configuration (optional for local dev)
STELLAR_TIPPING_CONTRACT_ID=
STELLAR_DEPLOYER_ADDRESS=
STELLAR_NETWORK=testnet
```

1. **Initialize Convex**

```bash
npx convex dev
```

This will:

- Create a new Convex project
- Generate type definitions
- Set up real-time sync

1. **Deploy Stellar contracts (optional)**

```bash
cd contracts/tipping
cargo build --target wasm32-unknown-unknown --release
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/tipping.wasm

cd ../article-nft
cargo build --target wasm32-unknown-unknown --release
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/article_nft.wasm
```

1. **Start development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
vercel
```

### Deploy Convex Functions

```bash
npx convex deploy --prod
```

## 📝 Development Commands

```bash
# Development
npm run dev              # Start frontend + Convex dev server
npm run dev:frontend     # Frontend only
npm run dev:backend      # Convex only

# Testing
npm test                 # Run tests with Vitest
npm run test:coverage    # Generate coverage report
npm run test:debug       # Debug tests

# Code Quality
npm run lint             # ESLint checks
npm run typecheck        # TypeScript validation

# Convex Management
npx convex dashboard     # Open Convex dashboard
npx convex deploy        # Deploy to production
npx convex logs          # View function logs
```

## 🔐 Security Features

- **Authentication**: Secure password hashing with Argon2
- **Authorization**: Role-based access control
- **Data Validation**: Zod schemas for all inputs
- **XSS Protection**: Content sanitization
- **CSRF Protection**: Built into Convex
- **Rate Limiting**: API throttling
- **Secure File Uploads**: Type validation and size limits

## 🎨 UI Components

The platform uses a comprehensive component library:

- **Primitives**: Button, Input, Card, Dialog, Toast
- **Article**: ArticleCard, ArticleGrid, ArticleViewer
- **Editor**: RichTextEditor, ToolbarButton, ImageUpload
- **User**: ProfileHeader, UserStats, EarningsDashboard
- **Engagement**: TipButton, HighlightPopover, NFTCard

## 📊 Real-time Features

Powered by Convex subscriptions:

- **Live Article Updates**: Content changes reflect instantly
- **Real-time Tips**: See tips as they happen
- **Active Highlights**: Watch readers engage with content
- **Instant Notifications**: Toast messages for all actions
- **Auto-save Sync**: Drafts saved across devices

## 🌐 Stellar Integration

### Tipping Contract

- **Immediate Settlement**: Direct XLM transfers
- **Fee Distribution**: 97.5% author, 2.5% platform
- **Minimum Tip**: 0.01 XLM (~$0.001)
- **Event Logging**: On-chain transaction history

### NFT Contract

- **Threshold Minting**: Requires minimum tip amount
- **Unique Tokens**: One NFT per article
- **Transfer Support**: Full ERC-721 compatibility
- **Metadata Storage**: IPFS integration ready

## 📈 Performance Optimizations

- **Code Splitting**: Dynamic imports for routes
- **Image Optimization**: Automatic compression and WebP
- **Lazy Loading**: Components loaded on demand
- **Caching Strategy**: Convex automatic query caching
- **CDN Delivery**: Static assets via Vercel Edge
- **Database Indexing**: Optimized query patterns

## 🧪 Testing

```bash
# Unit Tests
npm test

# Integration Tests
npm run test:integration

# E2E Tests
npm run test:e2e

# Coverage Report
npm run test:coverage
```

## 📚 API Documentation

### Convex Functions

#### Articles

- `listArticles`: Paginated article feed
- `getArticleBySlug`: Single article fetch
- `createArticle`: New article creation
- `updateArticle`: Edit existing article
- `publishArticle`: Make article public
- `deleteArticle`: Remove article

#### Tips

- `sendTip`: Process tip transaction
- `getArticleTips`: Fetch tip history
- `getUserEarnings`: Calculate revenue

#### NFTs

- `mintNFT`: Create article NFT
- `transferNFT`: Change ownership
- `getNFTDetails`: Fetch metadata

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Powered by [Convex](https://convex.dev)
- Payments via [Stellar](https://stellar.org)
- UI components from [Radix UI](https://radix-ui.com)
- Editor by [TipTap](https://tiptap.dev)

## 📞 Support

- **Documentation**: [docs.quilltip.io](https://docs.quilltip.io)
- **Discord**: [discord.gg/quilltip](https://discord.gg/quilltip)
- **Email**: <support@quilltip.io>
- **Twitter**: [@quilltip](https://twitter.com/quilltip)

## 🚦 Status

- **Version**: 0.1.0 (Beta)
- **Network**: Stellar Testnet
- **Database**: Convex Cloud
- **Hosting**: Vercel Edge

---

**QuillTip** - Empowering writers through decentralized monetization. Built with ❤️ for the creator economy on Stellar.
