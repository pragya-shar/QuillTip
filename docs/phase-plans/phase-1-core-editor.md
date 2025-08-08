# Phase 1: Core Editor & Basic Platform (Weeks 1-4)

## Overview
Build a functional publishing platform with an advanced TipTap editor, enabling writers to create, edit, and publish content with a professional experience.

## Goals
- Establish the foundation for the QuillTip publishing platform
- Implement a rich text editor with TipTap
- Create user authentication and basic profile management
- Build article CRUD operations with draft/publish workflow
- Design a clean, responsive reading interface

## Technical Requirements

### Frontend Stack
- **Framework**: Next.js 15 with TypeScript
- **Editor**: TipTap v2 with custom extensions
- **Styling**: Tailwind CSS v3
- **State Management**: Zustand for client state
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives

### Backend Infrastructure
- **API**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **File Storage**: AWS S3 for images (temporary, will migrate to Arweave)
- **Hosting**: Vercel for deployment

### Development Tools
- **Version Control**: Git with GitHub
- **Testing**: Jest for unit tests, Cypress for E2E
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint, Prettier, Husky

## User Stories

### Writer Stories
1. **As a writer**, I want to sign up and create my profile so I can start publishing content
   - Email/password registration
   - Profile creation with bio, avatar
   - Username selection

2. **As a writer**, I want to use a rich text editor so I can format my articles professionally
   - Headers (H1-H6)
   - Bold, italic, underline, strikethrough
   - Links with preview
   - Ordered/unordered lists
   - Code blocks with syntax highlighting
   - Image upload and positioning
   - Block quotes

3. **As a writer**, I want to save drafts automatically so I don't lose my work
   - Auto-save every 30 seconds
   - Draft versioning
   - Restore from drafts

4. **As a writer**, I want to publish my articles so readers can discover them
   - Publish/unpublish toggle
   - SEO metadata (title, description, tags)
   - Custom URL slugs
   - Publishing date control

### Reader Stories
1. **As a reader**, I want to browse published articles so I can find content to read
   - Article listing with pagination
   - Search by title/author
   - Filter by tags
   - Sort by date/popularity

2. **As a reader**, I want to read articles in a clean interface so I can focus on content
   - Distraction-free reading mode
   - Responsive typography
   - Progress indicator
   - Estimated reading time

## Database Schema

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  username        String    @unique
  name            String?
  bio             String?
  avatar          String?
  hashedPassword  String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  articles        Article[]
}

model Article {
  id              String    @id @default(cuid())
  slug            String    @unique
  title           String
  content         Json      // TipTap JSON content
  excerpt         String?
  coverImage      String?
  published       Boolean   @default(false)
  publishedAt     DateTime?
  tags            Tag[]
  author          User      @relation(fields: [authorId], references: [id])
  authorId        String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([authorId])
  @@index([published, publishedAt])
}

model Tag {
  id              String    @id @default(cuid())
  name            String    @unique
  slug            String    @unique
  articles        Article[]
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Articles
- `GET /api/articles` - List published articles
- `GET /api/articles/[slug]` - Get single article
- `POST /api/articles` - Create article (auth required)
- `PUT /api/articles/[id]` - Update article (auth required)
- `DELETE /api/articles/[id]` - Delete article (auth required)
- `GET /api/articles/drafts` - Get user's drafts (auth required)

### Users
- `GET /api/users/[username]` - Get user profile
- `PUT /api/users/profile` - Update profile (auth required)

## UI/UX Components

### Editor Interface
```
┌─────────────────────────────────────────────┐
│  QuillTip                    [Save] [Publish]│
├─────────────────────────────────────────────┤
│  Article Title                              │
│  __________________________________________ │
│                                             │
│  Cover Image: [Upload]                      │
│                                             │
│  [B] [I] [U] [Link] [H1] [H2] [List] [Quote]│
│  ┌─────────────────────────────────────────┐│
│  │                                         ││
│  │  Your content here...                   ││
│  │                                         ││
│  │                                         ││
│  └─────────────────────────────────────────┘│
│                                             │
│  Tags: [Add tags...]                        │
│  SEO Description: _______________           │
└─────────────────────────────────────────────┘
```

### Reading Interface
```
┌─────────────────────────────────────────────┐
│  QuillTip                    [@username]     │
├─────────────────────────────────────────────┤
│                                             │
│       Article Title Goes Here               │
│       By Author Name • 5 min read           │
│       Published Dec 1, 2024                 │
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │         [Cover Image]                   ││
│  └─────────────────────────────────────────┘│
│                                             │
│  Article content begins here with clean     │
│  typography and proper spacing...           │
│                                             │
│  [Share] [Bookmark]                         │
└─────────────────────────────────────────────┘
```

## Testing Requirements

### Unit Tests
- Authentication flow
- Article CRUD operations
- Editor functionality
- API endpoint validation

### E2E Tests
- Complete writer journey: signup → write → publish
- Reader journey: browse → read → share
- Editor functionality across browsers

## Performance Targets
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: > 90
- **Bundle Size**: < 200KB (initial)

## Security Considerations
- Input sanitization for all user content
- XSS prevention in rich text rendering
- CSRF protection on all mutations
- Rate limiting on API endpoints
- Secure password hashing (bcrypt)

## Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] S3 bucket configured for images
- [ ] SSL certificate active
- [ ] Monitoring setup (Sentry)
- [ ] Analytics configured
- [ ] Backup strategy implemented

## Success Metrics
- **User Signups**: Track daily new users
- **Articles Published**: Monitor publishing rate
- **Active Writers**: Weekly active publishers
- **Reader Engagement**: Time on site, articles read
- **Editor Performance**: Save success rate, error tracking

## Dependencies & Risks
### Dependencies
- TipTap editor stability and performance
- AWS S3 availability for image storage
- Database performance at scale

### Risks
- **Technical**: Editor complexity might slow development
- **UX**: Onboarding flow might be too complex
- **Performance**: Rich content might impact load times

### Mitigation Strategies
- Progressive enhancement for editor features
- Simplified onboarding with optional steps
- Lazy loading and optimization for content

## Next Phase Preparation
While building Phase 1, prepare for Phase 2 by:
- Researching text selection APIs
- Designing highlight data structure
- Planning coordinate system for precise selection
- Exploring WebSocket for real-time highlights

## Detailed Implementation Plan

### Week 1: Fresh Next.js Foundation & Authentication  

#### Day 1-2: Complete Fresh Project Setup
1. **Initialize Brand New Next.js 15 Project** 
   ```bash
   # Start completely fresh - ignore existing index.html
   npx create-next-app@latest quilltip-app --typescript --tailwind --eslint --app
   cd quilltip-app
   ```

2. **Configure Tailwind with QuillTip Brand Colors**
   ```typescript
   // tailwind.config.ts - Adapt from existing landing page
   const config = {
     theme: {
       extend: {
         colors: {
           brand: {
             blue: '#1a365d',      // Primary brand color
             cream: '#fefefe',     // Background/light color  
             accent: '#2d5a87'     // Secondary accent
           },
           quill: {
             50: '#f8f9fa',
             100: '#f1f3f4', 
             200: '#e8eaed',
             300: '#dadce0',
             400: '#bdc1c6',
             500: '#9aa0a6',
             600: '#80868b',
             700: '#5f6368',
             800: '#3c4043',
             900: '#202124',
           }
         },
         fontFamily: {
           'handwritten': ['Caveat', 'cursive'],
           'sans': ['Inter', 'sans-serif']
         }
       }
     }
   }
   ```

3. **Fresh Project Structure Setup**
   ```
   quilltip-app/
   ├── src/
   │   ├── app/                    # Next.js 15 app directory
   │   │   ├── (auth)/            # Auth route group
   │   │   ├── (dashboard)/       # Protected routes
   │   │   ├── api/               # API routes
   │   │   └── globals.css        # Fresh global styles
   │   ├── components/            # Reusable components
   │   │   ├── ui/                # Base UI components
   │   │   ├── editor/            # TipTap editor components
   │   │   └── layout/            # Layout components
   │   ├── lib/                   # Utilities & config
   │   └── types/                 # TypeScript definitions
   ├── prisma/                    # Database schema
   └── public/                    # Static assets
   ```

4. **Install Fresh Dependencies**
   ```bash
   # Core dependencies for new app
   npm install @prisma/client prisma
   npm install next-auth @auth/prisma-adapter
   npm install @tiptap/react @tiptap/starter-kit
   npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
   npm install zustand react-hook-form @hookform/resolvers zod
   npm install lucide-react clsx tailwind-merge
   ```

5. **Fresh Environment Configuration**
   ```bash
   # .env.local - completely new setup
   DATABASE_URL="postgresql://..."
   NEXTAUTH_SECRET="..."
   NEXTAUTH_URL="http://localhost:3000"
   AWS_ACCESS_KEY_ID="..."
   AWS_SECRET_ACCESS_KEY="..."
   AWS_BUCKET_NAME="..."
   ```

6. **Configure TypeScript**
   ```json
   // tsconfig.json
       "strict": true,
       "noUnusedLocals": true,
       "noUnusedParameters": true,
       "noImplicitReturns": true
     }
   }
   ```

3. **Install Core Dependencies**
   ```bash
   npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image
   npm install @radix-ui/react-* zustand react-hook-form zod
   npm install prisma @prisma/client next-auth bcryptjs
   npm install -D @types/bcryptjs
   ```

4. **Setup Development Tools**
   ```bash
   npm install -D eslint-config-prettier prettier husky lint-staged
   npx husky init
   ```

#### Day 3-4: Fresh Landing Page & Database Setup
1. **Build New Landing Page from Scratch**
   ```typescript
   // app/page.tsx - Completely new implementation
   export default function HomePage() {
     return (
       <div className="min-h-screen bg-brand-cream">
         <Navigation />
         <HeroSection />
         <ProblemSection />
         <StellarBenefitsSection />
         <HowItWorksSection />
         <FeaturesSection />
         <WaitlistSection />
         <Footer />
       </div>
     )
   }
   ```

2. **Create Fresh Landing Page Components**
   ```typescript
   // components/landing/HeroSection.tsx
   // components/landing/Navigation.tsx
   // components/landing/ProblemSection.tsx
   // components/landing/StellarBenefitsSection.tsx
   // components/landing/HowItWorksSection.tsx
   // components/landing/FeaturesSection.tsx
   // components/landing/WaitlistSection.tsx
   // components/landing/Footer.tsx
   ```

3. **Setup Brand Assets & Fonts**
   ```typescript
   // Add Google Fonts configuration
   import { Inter, Caveat } from 'next/font/google'
   
   const inter = Inter({ subsets: ['latin'] })
   const caveat = Caveat({ 
     subsets: ['latin'],
     variable: '--font-handwritten'
   })
   ```

4. **Initialize Fresh Database**
   ```bash
   npx prisma init
   # Configure DATABASE_URL in .env.local
   ```

5. **Configure Database Schema**
   - Copy the schema from the requirements
   - Add sessions table for NextAuth
   - Run migrations: `npx prisma migrate dev`

6. **Note on Existing Files**
   - Keep `index.html` for visual reference only
   - Keep all `/docs` documentation unchanged
   - All new implementation goes in `quilltip-app/` directory

#### Day 5: Authentication System Setup
1. **Setup NextAuth**
   - Create `app/api/auth/[...nextauth]/route.ts`
   - Configure JWT strategy
   - Create auth context and hooks

2. **Create Fresh Auth Pages**
   - `app/(auth)/login/page.tsx`
   - `app/(auth)/register/page.tsx`
   - `app/(auth)/layout.tsx`

3. **Build Auth Components**
   ```typescript
   // components/auth/LoginForm.tsx
   // components/auth/RegisterForm.tsx
   // components/auth/AuthProvider.tsx
   ```

4. **Setup Auth Context & Hooks**
   ```typescript
   // lib/auth.ts - Fresh auth utilities
   // hooks/useAuth.ts - Auth state management
   ```

### Week 1 Summary: Fresh Foundation Complete
- ✅ Brand new Next.js 15 application
- ✅ QuillTip brand colors and design system
- ✅ Fresh landing page with modern components
- ✅ Database and authentication foundation
- ✅ Proper project structure for 7-phase roadmap

### Week 2: TipTap Editor Implementation

#### Day 1-2: AWS S3 & Upload Infrastructure
1. **Setup S3 Bucket**
   - Create bucket with proper CORS configuration
   - Set up IAM user with limited permissions
   - Configure environment variables

2. **Create Upload API**
   - `app/api/upload/route.ts`
   - Implement presigned URL generation
   - Add file type and size validation

#### Day 3-4: Basic Editor Setup
1. **Create Editor Component**
   ```typescript
   // components/editor/Editor.tsx
   import { useEditor, EditorContent } from '@tiptap/react'
   import StarterKit from '@tiptap/starter-kit'
   ```

2. **Configure Extensions**
   - Heading levels
   - Bold, italic, underline, strike
   - Lists (ordered/unordered)
   - Code blocks with syntax highlighting
   - Links with preview
   - Images with upload

3. **Create Toolbar Component**
   - Format buttons
   - Heading dropdown
   - List toggles
   - Link/image dialogs

#### Day 3-4: Auto-save & Draft System
1. **Implement Auto-save Hook**
   ```typescript
   // hooks/useAutoSave.ts
   const useAutoSave = (content, articleId) => {
     // Debounced save every 30 seconds
   }
   ```

2. **Create Draft API**
   - `POST /api/articles/draft`
   - Version management
   - Conflict resolution

3. **Draft Recovery UI**
   - Show draft versions
   - Restore functionality
   - Diff viewer

#### Day 5: Advanced Editor Features
1. **Image Upload Integration**
   - Drag & drop support
   - Progress indicators
   - Image optimization

2. **Custom Extensions**
   - YouTube embed
   - Tweet embed
   - Code syntax highlighting

### Week 3: Core Features & UI

#### Day 1-2: Article Management
1. **Article CRUD APIs**
   - Create with slug generation
   - Update with validation
   - Soft delete
   - Publish/unpublish

2. **Article Editor Page**
   - `app/write/page.tsx`
   - Title, content, metadata fields
   - Tag management
   - SEO fields

#### Day 3-4: Reading Experience
1. **Article Display Page**
   - `app/[username]/[slug]/page.tsx`
   - Clean typography
   - Progress indicator
   - Reading time calculation

2. **Article Listing**
   - `app/articles/page.tsx`
   - Pagination
   - Search functionality
   - Tag filtering
   - Sort options

#### Day 5: User Profiles
1. **Profile Pages**
   - `app/[username]/page.tsx`
   - Bio display
   - Article listing
   - Stats (articles, readers)

2. **Profile Management**
   - `app/settings/profile/page.tsx`
   - Avatar upload
   - Bio editing
   - Username change

### Week 4: Polish & Deployment

#### Day 1-2: Testing
1. **Unit Tests**
   ```typescript
   // __tests__/auth.test.ts
   // __tests__/articles.test.ts
   ```

2. **E2E Tests**
   ```typescript
   // cypress/e2e/writer-flow.cy.ts
   // cypress/e2e/reader-flow.cy.ts
   ```

#### Day 3: Performance Optimization
1. **Code Splitting**
   - Dynamic imports for editor
   - Route-based splitting

2. **Image Optimization**
   - Next/Image component
   - Lazy loading
   - WebP conversion

3. **Caching Strategy**
   - Static page generation
   - API response caching
   - CDN configuration

#### Day 4: Security Hardening
1. **Input Validation**
   - Zod schemas for all inputs
   - SQL injection prevention
   - XSS protection with DOMPurify

2. **Rate Limiting**
   ```typescript
   // middleware/rateLimit.ts
   export const rateLimiter = new Map()
   ```

3. **Security Headers**
   - CSP configuration
   - HSTS
   - X-Frame-Options

#### Day 5: Deployment
1. **Vercel Setup**
   - Environment variables
   - Domain configuration
   - Preview deployments

2. **Monitoring**
   - Sentry integration
   - Performance monitoring
   - Error tracking

3. **Analytics**
   - Google Analytics
   - Custom events
   - User behavior tracking

### File Structure
```
quilltip/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── write/
│   │   └── settings/
│   ├── [username]/
│   │   ├── [slug]/
│   │   └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   ├── articles/
│   │   └── upload/
│   └── layout.tsx
├── components/
│   ├── editor/
│   ├── ui/
│   └── layouts/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── utils.ts
├── hooks/
├── types/
└── styles/
```

### Key Implementation Details

#### Authentication Flow
```typescript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Validate and return user
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      // Add user info to token
    },
    session: async ({ session, token }) => {
      // Add user info to session
    }
  }
}
```

#### Editor State Management
```typescript
// stores/editorStore.ts
interface EditorStore {
  content: JSONContent
  isDirty: boolean
  lastSaved: Date | null
  setContent: (content: JSONContent) => void
  markSaved: () => void
}
```

#### API Route Pattern
```typescript
// app/api/articles/route.ts
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const data = await request.json()
  const validated = articleSchema.parse(data)
  
  // Create article
}
```

### Environment Variables
```env
# .env.local
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="..."
AWS_S3_BUCKET="..."
```

### Testing Strategy
1. **Unit Tests**: Components, hooks, utilities
2. **Integration Tests**: API routes, database operations
3. **E2E Tests**: Critical user journeys
4. **Performance Tests**: Lighthouse CI

### Deployment Configuration
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - uses: vercel/action@v1
```

## Implementation Checklist

### Week 1: Fresh Next.js Foundation & Authentication

#### Day 1-2: Complete Fresh Project Setup
- [x] Initialize new Next.js 15 project with TypeScript, Tailwind, ESLint
- [x] Configure Tailwind with QuillTip brand colors (blue, cream, accent)
- [x] Set up fresh project structure (app, components, lib, types directories)
- [x] Install core dependencies (Prisma, NextAuth, TipTap, Radix UI, Zustand)
- [x] Configure environment variables (.env.local)
- [x] Configure TypeScript with strict mode settings
- [x] Install and configure development tools (ESLint, Prettier, Husky)

#### Day 3-4: Fresh Landing Page & Database Setup
- [x] Build new landing page root component (app/page.tsx)
- [x] Create Navigation component with brand styling
- [x] Create HeroSection component
- [x] Create ProblemSection component
- [x] Create StellarBenefitsSection component
- [x] Create HowItWorksSection component
- [x] Create FeaturesSection component
- [x] Create WaitlistSection component with email capture
- [x] Create Footer component
- [x] Configure Google Fonts (Inter, Caveat)
- [ ] Initialize Prisma and configure PostgreSQL connection
- [ ] Create database schema (User, Article, Tag models)
- [ ] Run initial database migrations
- [ ] Test database connection

#### Day 5: Authentication System Setup
- [ ] Create NextAuth configuration (app/api/auth/[...nextauth]/route.ts)
- [ ] Configure JWT authentication strategy
- [ ] Create login page (app/(auth)/login/page.tsx)
- [ ] Create register page (app/(auth)/register/page.tsx)
- [ ] Create auth layout wrapper (app/(auth)/layout.tsx)
- [ ] Build LoginForm component with validation
- [ ] Build RegisterForm component with validation
- [ ] Create AuthProvider context component
- [ ] Create useAuth hook for auth state management
- [ ] Test registration flow end-to-end
- [ ] Test login/logout flow
- [ ] Implement session persistence

### Week 2: TipTap Editor Implementation

#### Day 1-2: AWS S3 & Upload Infrastructure
- [ ] Create and configure AWS S3 bucket
- [ ] Set up bucket CORS configuration
- [ ] Create IAM user with limited S3 permissions
- [ ] Add AWS credentials to environment variables
- [ ] Create upload API endpoint (app/api/upload/route.ts)
- [ ] Implement presigned URL generation
- [ ] Add file type validation (images only)
- [ ] Add file size validation (max 10MB)
- [ ] Test image upload functionality

#### Day 3-4: Basic Editor Setup
- [ ] Create base Editor component (components/editor/Editor.tsx)
- [ ] Configure TipTap StarterKit extension
- [ ] Add heading levels (H1-H6) support
- [ ] Add text formatting (bold, italic, underline, strike)
- [ ] Add ordered and unordered lists
- [ ] Add code blocks with syntax highlighting
- [ ] Add link extension with preview
- [ ] Add image extension with upload integration
- [ ] Create EditorToolbar component
- [ ] Add format buttons to toolbar
- [ ] Add heading dropdown selector
- [ ] Add list toggle buttons
- [ ] Create link dialog component
- [ ] Create image upload dialog
- [ ] Test all editor formatting features

#### Day 3-4: Auto-save & Draft System
- [ ] Create useAutoSave hook with 30-second debounce
- [ ] Create draft save API endpoint (POST /api/articles/draft)
- [ ] Implement draft versioning system
- [ ] Add conflict resolution for concurrent edits
- [ ] Create draft recovery UI component
- [ ] Add draft version list display
- [ ] Implement restore from draft functionality
- [ ] Create diff viewer for draft comparisons
- [ ] Test auto-save functionality
- [ ] Test draft recovery scenarios

#### Day 5: Advanced Editor Features
- [ ] Implement drag-and-drop image upload
- [ ] Add upload progress indicators
- [ ] Implement client-side image optimization
- [ ] Create YouTube embed extension
- [ ] Create Tweet embed extension
- [ ] Configure code syntax highlighting themes
- [ ] Add block quote styling
- [ ] Test all advanced editor features

### Week 3: Core Features & UI

#### Day 1-2: Article Management
- [ ] Create article creation API (POST /api/articles)
- [ ] Create article update API (PUT /api/articles/[id])
- [ ] Create article delete API (DELETE /api/articles/[id])
- [ ] Implement publish/unpublish functionality
- [ ] Add automatic slug generation
- [ ] Create article editor page (app/write/page.tsx)
- [ ] Add title input with character limit
- [ ] Add excerpt field
- [ ] Add cover image upload
- [ ] Add tag management interface
- [ ] Add SEO metadata fields
- [ ] Add publish date scheduler
- [ ] Test complete article CRUD flow

#### Day 3-4: Reading Experience
- [ ] Create article display page (app/[username]/[slug]/page.tsx)
- [ ] Implement clean typography styles
- [ ] Add reading progress indicator
- [ ] Calculate and display reading time
- [ ] Create article listing page (app/articles/page.tsx)
- [ ] Implement pagination component
- [ ] Add search functionality with debounce
- [ ] Create tag filter component
- [ ] Add sort options (date, popularity)
- [ ] Implement infinite scroll option
- [ ] Add article sharing buttons
- [ ] Test reading experience across devices

#### Day 5: User Profiles
- [ ] Create public profile page (app/[username]/page.tsx)
- [ ] Display user bio and avatar
- [ ] Show user's published articles
- [ ] Add user statistics (article count, total reads)
- [ ] Create profile settings page (app/settings/profile/page.tsx)
- [ ] Implement avatar upload functionality
- [ ] Add bio editor with markdown support
- [ ] Add username change with availability check
- [ ] Create social links management
- [ ] Test profile viewing and editing

### Week 4: Polish & Deployment

#### Day 1-2: Testing
- [ ] Set up Jest testing framework
- [ ] Write unit tests for auth flow
- [ ] Write unit tests for article CRUD operations
- [ ] Write unit tests for editor functionality
- [ ] Write unit tests for API endpoint validation
- [ ] Set up Cypress for E2E testing
- [ ] Write E2E test for writer journey (signup → write → publish)
- [ ] Write E2E test for reader journey (browse → read → share)
- [ ] Test editor functionality across browsers
- [ ] Achieve >80% code coverage

#### Day 3: Performance Optimization
- [ ] Implement code splitting for editor bundle
- [ ] Add route-based code splitting
- [ ] Configure Next/Image for all images
- [ ] Implement lazy loading for images
- [ ] Set up WebP conversion for images
- [ ] Configure static page generation for articles
- [ ] Implement API response caching
- [ ] Set up CDN configuration
- [ ] Run Lighthouse audit and optimize
- [ ] Achieve >90 Lighthouse score

#### Day 4: Security Hardening
- [ ] Create Zod schemas for all API inputs
- [ ] Implement SQL injection prevention
- [ ] Add XSS protection with DOMPurify
- [ ] Create rate limiting middleware
- [ ] Configure CSP headers
- [ ] Add HSTS header
- [ ] Configure X-Frame-Options
- [ ] Implement CSRF protection
- [ ] Add input sanitization for rich text
- [ ] Security audit all endpoints

#### Day 5: Deployment
- [ ] Set up Vercel project
- [ ] Configure production environment variables
- [ ] Set up custom domain
- [ ] Configure preview deployments
- [ ] Integrate Sentry for error tracking
- [ ] Set up performance monitoring
- [ ] Configure Google Analytics
- [ ] Add custom event tracking
- [ ] Create deployment workflow
- [ ] Perform production smoke tests
- [ ] Monitor initial production metrics

### Post-Deployment Tasks
- [ ] Set up automated backups
- [ ] Configure monitoring alerts
- [ ] Create user documentation
- [ ] Set up customer support flow
- [ ] Plan Phase 2 kickoff meeting