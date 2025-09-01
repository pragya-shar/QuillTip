# QuillTip - Modern Writing Platform

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🚀 Convex Migration Status

### 📊 API Migration Progress

| API Category | Original Routes | Convex Status | Functions Implemented |
|-------------|----------------|---------------|----------------------|
| **Auth** | `/api/auth/register`<br>`/api/auth/[...nextauth]` | Complete | `auth.signIn`, `auth.signUp`, `auth.signOut` |
| **Users** | `/api/users/[username]` | Complete | `getCurrentUser`, `getUserByUsername`, `updateProfile`, `getUserStats` |
| **Articles** | `/api/articles` (POST)<br>`/api/articles/[id]` (GET)<br>`/api/articles/by-slug/[username]/[slug]`<br>`/api/articles/draft` (POST)<br>`/api/articles/drafts` (GET) | Complete | `listArticles`, `getArticleBySlug`, `getArticleById`, `getUserDrafts`, `createArticle`, `updateArticle`, `publishArticle`, `deleteArticle`, `saveDraft` |
| **Tips** | `/api/tips/send` (POST)<br>`/api/tips/article/[id]` (GET) | Complete | `getArticleTips`, `getUserSentTips`, `getUserReceivedTips`, `sendTip`, `confirmTip` |
| **Earnings** | `/api/earnings/balance` (GET)<br>`/api/earnings/withdraw` (POST) | Complete | `getAuthorEarnings`, `withdrawEarnings`, `confirmWithdrawal` |
| **NFTs** | `/api/nft/mint` (POST)<br>`/api/nft/[articleId]` (GET)<br>`/api/nft/transfer` (POST)<br>`/api/nft/owned` (GET) | Complete | `mintNFT`, `getNFTByArticle`, `transferNFT`, `getNFTsByOwner`, `getNFTDetails`, `getUserMintedNFTs`, `checkMintingThreshold` |
| **Highlights** | *(No API routes found)* | Complete | `getArticleHighlights`, `getUserHighlights`, `createHighlight`, `updateHighlight`, `deleteHighlight` |
| **Uploads** | `/api/upload` (POST) | Complete | `generateUploadUrl`, `storeFileMetadata`, `getFileUrl`, `getUserUploads`, `deleteFile`, `updateUserAvatar`, `updateArticleCoverImage` |

### Completed (Phase 1)

- [x] **Convex Project Initialization**
  - Installed Convex and @convex-dev/auth packages
  - Configured environment variables (SITE_URL)
  - Set up HTTP routes and auth configuration

- [x] **Database Schema Migration**
  - Migrated 8 core tables from Prisma schema
  - Added auth tables from Convex Auth
  - Added withdrawals and fileUploads tables
  - Implemented proper indexes and search capabilities
  - Denormalized data for optimal performance

- [x] **API Functions Migration (100% Complete)**
  - Authentication (register, login, logout)
  - Users (profile, stats, username check)
  - Articles (CRUD, drafts, search, pagination)
  - Tips (send, receive, track earnings)
  - NFTs (mint, transfer, ownership)
  - Highlights (CRUD with user enrichment)
  - Earnings (balance, withdrawal with Stellar integration)
  - File uploads (storage, metadata, avatar/cover updates)

- **Frontend Integration**
  - [x] Replace all API calls with Convex hooks
  - [x] Implement ConvexAuthProvider
  - [x] Update authentication flow UI
  - [x] Add real-time subscriptions for articles, tips, and highlights
  - [x] Fix authentication state persistence
  - [x] Replace profile pages with Convex queries
  - [x] Replace article pages with Convex queries
  - [x] Update NFT components to use Convex mutations
  - [x] Implement image uploads with Convex storage
  - [x] Cover image uploads automatically stored in Convex
  - [x] Complete earnings dashboard with withdrawal UI
  - [x] Integrate dashboard components into user profile (tabs)
  - [x] Add engagement sidebar to article pages

- **Component Integration**
  - [x] TipButton integrated in article sidebar
  - [x] TipStats displayed on article pages
  - [x] NFTIntegration in article engagement sidebar
  - [x] EarningsDashboard in user profile (Earnings tab)
  - [x] User stats in profile (Stats tab)
  - [x] NFT collections display (owned & minted)
  - [x] Article grid with pagination
  - [x] Profile header with user stats

- **Storage & Media**
  - [x] Image compression and optimization
  - [x] External URL images auto-uploaded to Convex
  - [x] File uploads with progress tracking
  - [x] Avatar and cover image management

- **Real-time Features**
  - [x] Live article updates (via Convex subscriptions)
  - [x] Real-time tip data
  - [x] Real-time earnings updates
  - [x] Auto-save drafts with real-time sync
  - [ ] Real-time notifications (planned)
  - [ ] Collaborative highlighting (planned)

- **Stellar Integration**
  - [ ] Tip sending with Stellar blockchain (using mock transactions)
  - [ ] NFT minting on blockchain (database records only)
  - [ ] NFT transfer on blockchain (database records only)
  - [x] Earnings tracking (database only)
  - [ ] Withdrawal to Stellar wallet (mock transactions only)
  - [x] Minimum withdrawal amount validation ($10)
  - [ ] Stellar wallet connection UI (not implemented)
  - [ ] Transaction history from blockchain (not implemented)
  - [ ] Smart contract deployment (not done)
  - [ ] Actual XLM transactions (not happening)

- **UI/UX Features**
  - [x] Tabbed user profile (Articles, NFTs, Earnings, Stats)
  - [x] Article engagement sidebar
  - [x] Responsive modal dialogs (tips, withdrawals)
  - [x] Loading skeletons for better UX
  - [x] Toast notifications for user feedback
  - [ ] Dark mode support (planned)
  - [ ] Mobile-optimized views (partial)

- **Cleanup & Optimization**
  - [x] Remove Prisma and Supabase dependencies
  - [x] Delete old API routes in `/app/api`
  - [x] Remove NextAuth configuration
  - [x] Fix TypeScript errors
  - [x] Fix build issues
  - [x] Resolve all component prop mismatches
  - [x] Delete Prisma schema and migrations
  - [x] Remove lib/prisma.ts and lib/supabase.ts
  - [ ] Performance optimization (lazy loading)
  - [ ] SEO metadata optimization

### 🏗️ Architecture Changes

- **From**: Next.js API Routes → Prisma → PostgreSQL (Supabase)
- **To**: Next.js → Convex Functions → Convex Database
- **Benefits**: Real-time subscriptions, type-safe queries, automatic caching, simpler deployment

### 🔧 Development Commands

```bash
# Start development (frontend + Convex)
npm run dev

# Deploy Convex functions
npx convex deploy

# Open Convex dashboard
npx convex dashboard
```

### 📝 Environment Variables

Required for Convex:

- `CONVEX_DEPLOYMENT` (auto-generated)
- `SITE_URL` (for auth redirects)

### 🎯 Migration Benefits

- **Real-time Updates**: Built-in subscriptions for live data
- **Type Safety**: End-to-end TypeScript with generated types
- **Simplified Stack**: No ORM, direct database access
- **Better DX**: Hot reload, automatic migrations
- **Performance**: Automatic query caching and optimization
