# Phase 3: Stellar Integration & Crypto Wallet Foundation (Weeks 8-10)

> **📝 Implementation Note**: This phase builds on the fresh Next.js 14 application with highlight system from Phase 2. All Stellar integration is built as modern React components and API routes.

## Overview
Establish Web3 foundation by integrating Stellar network, enabling wallet connections, and creating a user-friendly crypto onboarding experience for both crypto-native and traditional users.

## Goals
- Integrate Stellar testnet for development
- Implement wallet connection system (Freighter, xBull)
- Create account management and funding flows
- Build balance display and transaction history
- Design smooth crypto onboarding for non-crypto users

## Technical Requirements

### Stellar Integration
- **SDK**: Stellar SDK (stellar-sdk) v11.0+
- **Network**: Stellar Testnet (Horizon API)
- **Wallets**: Freighter API, xBull Wallet SDK
- **Account Service**: Stellar account creation and management

### Frontend Updates
- **Wallet UI**: Connection modal and status indicators
- **Balance Display**: Real-time XLM balance updates
- **Transaction UI**: Send/receive interfaces
- **Onboarding Flow**: Step-by-step wallet setup

### Backend Infrastructure
- **Stellar Service**: Node.js service for Stellar operations
- **Account Management**: Database mapping for Stellar accounts
- **Testnet Faucet**: Automated funding for new accounts
- **Transaction Monitoring**: Webhook handlers for payments

## User Stories

### Crypto-Native Users
1. **As a crypto user**, I want to connect my existing Stellar wallet
   - One-click Freighter connection
   - Support for multiple wallet providers
   - View connected wallet address
   - Switch between accounts

2. **As a crypto user**, I want to manage my XLM balance
   - Real-time balance display
   - Transaction history
   - Send/receive XLM
   - QR code for receiving

### Non-Crypto Users
1. **As a new user**, I want to get started without prior crypto knowledge
   - Guided wallet setup process
   - Automatic testnet funding
   - Simple explanation of concepts
   - Hidden complexity

2. **As a new user**, I want to understand my wallet and balance
   - Visual balance representation
   - Fiat value approximation
   - Transaction explanations
   - Help documentation

## Database Schema Updates

```prisma
model StellarAccount {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id])
  
  // Stellar account data
  publicKey       String    @unique
  accountType     AccountType @default(MANAGED)
  
  // For managed accounts only (non-crypto users)
  encryptedSeed   String?   // Encrypted with user-specific key
  
  // Account status
  isActive        Boolean   @default(false)
  isFunded        Boolean   @default(false)
  
  // Metadata
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  lastSyncedAt    DateTime?
  
  transactions    Transaction[]
  
  @@index([userId])
  @@index([publicKey])
}

enum AccountType {
  EXTERNAL        // User's own wallet (Freighter, etc.)
  MANAGED         // Platform-managed for new users
}

model Transaction {
  id              String    @id @default(cuid())
  stellarAccountId String
  stellarAccount  StellarAccount @relation(fields: [stellarAccountId], references: [id])
  
  // Stellar transaction data
  stellarTxId     String    @unique
  type            TransactionType
  amount          String    // Store as string for precision
  assetCode       String    @default("XLM")
  
  // Transaction parties
  fromAddress     String
  toAddress       String
  
  // Status
  status          TxStatus  @default(PENDING)
  stellarLedger   Int?
  
  // Metadata
  memo            String?
  createdAt       DateTime  @default(now())
  confirmedAt     DateTime?
  
  @@index([stellarAccountId])
  @@index([stellarTxId])
}

enum TransactionType {
  PAYMENT
  CREATE_ACCOUNT
  PATH_PAYMENT
}

enum TxStatus {
  PENDING
  SUCCESS
  FAILED
}
```

## API Endpoints

### Wallet Management
- `GET /api/wallet/connect` - Initialize wallet connection
- `POST /api/wallet/verify` - Verify wallet signature
- `GET /api/wallet/balance` - Get current balance
- `DELETE /api/wallet/disconnect` - Disconnect wallet

### Account Management
- `POST /api/stellar/account/create` - Create managed account
- `GET /api/stellar/account/info` - Get account details
- `POST /api/stellar/account/fund` - Fund testnet account

### Transactions
- `GET /api/stellar/transactions` - Get transaction history
- `POST /api/stellar/send` - Send XLM payment
- `GET /api/stellar/transaction/[id]` - Get transaction details

### Utilities
- `GET /api/stellar/price` - Get XLM/USD price
- `POST /api/stellar/validate-address` - Validate Stellar address

## Wallet Integration

### Freighter Connection Flow
```typescript
interface WalletConnection {
  connect(): Promise<{ publicKey: string }>;
  signTransaction(tx: Transaction): Promise<SignedTransaction>;
  disconnect(): void;
}

class FreighterWallet implements WalletConnection {
  async connect() {
    const { isConnected } = await window.freighterApi.isConnected();
    if (!isConnected) {
      throw new Error("Freighter not installed");
    }
    
    const publicKey = await window.freighterApi.getPublicKey();
    return { publicKey };
  }
  
  async signTransaction(tx: Transaction) {
    return await window.freighterApi.signTransaction(tx);
  }
}
```

### Managed Account System
```typescript
class ManagedAccountService {
  // Create account for non-crypto users
  async createManagedAccount(userId: string) {
    const keypair = StellarSdk.Keypair.random();
    const publicKey = keypair.publicKey();
    const encryptedSeed = await this.encryptSeed(
      keypair.secret(),
      userId
    );
    
    // Fund from platform account
    await this.fundAccount(publicKey);
    
    return { publicKey, encryptedSeed };
  }
  
  // Sign transactions for managed accounts
  async signForUser(userId: string, transaction: Transaction) {
    const account = await this.getUserAccount(userId);
    const seed = await this.decryptSeed(account.encryptedSeed, userId);
    const keypair = StellarSdk.Keypair.fromSecret(seed);
    
    transaction.sign(keypair);
    return transaction;
  }
}
```

## UI/UX Components

### Wallet Connection Modal
```
┌─────────────────────────────────────────────┐
│  Connect Your Wallet                    [X] │
├─────────────────────────────────────────────┤
│                                             │
│  Choose your wallet:                        │
│                                             │
│  ┌─────────────┐  ┌─────────────┐         │
│  │  Freighter  │  │    xBull    │         │
│  │     🦊      │  │      🐂     │         │
│  └─────────────┘  └─────────────┘         │
│                                             │
│  New to crypto?                             │
│  [Create QuillTip Wallet] →                 │
│                                             │
└─────────────────────────────────────────────┘
```

### Balance Display
```
┌─────────────────────────────────────────────┐
│  Your Wallet                                │
├─────────────────────────────────────────────┤
│  Balance: 1,000 XLM                         │
│  ≈ $120.50 USD                              │
│                                             │
│  Address: GCIZ...3FNQ [Copy]                │
│                                             │
│  [Send] [Receive] [History]                 │
└─────────────────────────────────────────────┘
```

### Onboarding Flow
```
Step 1: Welcome
┌─────────────────────────────────────────────┐
│  Welcome to QuillTip! 🎉                    │
│                                             │
│  To tip creators, you'll need a wallet.     │
│  Don't worry, we'll help you set it up!    │
│                                             │
│  [Get Started] →                            │
└─────────────────────────────────────────────┘

Step 2: Create Wallet
┌─────────────────────────────────────────────┐
│  Creating Your Wallet                       │
│                                             │
│  ⚡ Generating secure wallet...             │
│  ✅ Wallet created!                         │
│  ⚡ Adding free test tokens...              │
│  ✅ 1,000 XLM added!                        │
│                                             │
│  [Continue] →                               │
└─────────────────────────────────────────────┘

Step 3: Backup (Optional)
┌─────────────────────────────────────────────┐
│  Secure Your Wallet (Optional)              │
│                                             │
│  Save your backup phrase:                   │
│  ┌─────────────────────────────────────────┐│
│  │ word1  word2  word3  word4  word5       ││
│  │ word6  word7  word8  word9  word10      ││
│  │ word11 word12                           ││
│  └─────────────────────────────────────────┘│
│                                             │
│  [I've Saved It] [Skip for Now]             │
└─────────────────────────────────────────────┘
```

## Security Implementation

### Key Management
```typescript
class KeyManagement {
  // Encryption for managed accounts
  private encryptionKey: string;
  
  async encryptSeed(seed: string, userId: string): Promise<string> {
    const userKey = await this.deriveUserKey(userId);
    return encrypt(seed, userKey);
  }
  
  async decryptSeed(encrypted: string, userId: string): Promise<string> {
    const userKey = await this.deriveUserKey(userId);
    return decrypt(encrypted, userKey);
  }
  
  // Never store plain text seeds
  private async deriveUserKey(userId: string): Promise<string> {
    return pbkdf2(userId + this.encryptionKey, salt, iterations);
  }
}
```

### Transaction Security
- All transactions require user confirmation
- Implement transaction limits for new accounts
- Monitor for suspicious activity
- Rate limiting on transaction endpoints

## Testing Requirements

### Unit Tests
- Wallet connection mocking
- Account creation flows
- Transaction building and signing
- Balance calculation accuracy

### Integration Tests
- Testnet account funding
- Transaction submission and monitoring
- Wallet switching scenarios
- Error handling for failed transactions

### E2E Tests
- Complete onboarding flow
- Wallet connection → funding → transaction
- Multiple wallet provider testing

## Performance Considerations
- Cache XLM price data (5-minute TTL)
- Batch balance queries
- WebSocket for real-time balance updates
- Optimize Horizon API calls

## Success Metrics
- **Wallet Connection Rate**: % of users connecting wallets
- **Onboarding Completion**: % completing full setup
- **Transaction Success Rate**: Successful vs failed transactions
- **Time to First Transaction**: Onboarding → first payment
- **Support Tickets**: Crypto-related support requests

## Dependencies & Risks

### Dependencies
- Stellar network stability
- Wallet extension availability
- Testnet faucet reliability
- Exchange rate API availability

### Risks
- **User Friction**: Crypto complexity scaring users
- **Wallet Issues**: Extension bugs or unavailability
- **Network Congestion**: Stellar network delays
- **Security Concerns**: Key management vulnerabilities

### Mitigation Strategies
- Progressive disclosure of crypto concepts
- Multiple wallet provider support
- Fallback to managed accounts
- Comprehensive security audit

## Testnet Configuration
```javascript
// Stellar testnet configuration
const config = {
  network: 'TESTNET',
  horizonUrl: 'https://horizon-testnet.stellar.org',
  networkPassphrase: StellarSdk.Networks.TESTNET,
  faucetUrl: 'https://friendbot.stellar.org',
  baseFee: '100', // stroops
  timeout: 30, // seconds
};
```

## Next Phase Preparation
While building Phase 3, prepare for Phase 4 by:
- Researching Soroban smart contract development
- Designing micro-payment contract architecture
- Planning coordinate-based tipping system
- Exploring payment channel optimizations

## Detailed Implementation Plan

### Week 8: Stellar Setup & Basic Integration

#### Day 1-2: Project Dependencies & Configuration
1. **Install Stellar Dependencies**
   ```bash
   npm install stellar-sdk @stellar/freighter-api
   npm install -D @types/stellar-sdk
   ```

2. **Create Stellar Configuration**
   ```typescript
   // config/stellar.ts
   import * as StellarSdk from 'stellar-sdk'
   
   export const stellarConfig = {
     network: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'TESTNET',
     horizonUrl: process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org',
     networkPassphrase: StellarSdk.Networks.TESTNET,
     baseFee: '100',
     timeout: 30
   }
   
   export const horizonServer = new StellarSdk.Horizon.Server(stellarConfig.horizonUrl)
   ```

3. **Environment Variables**
   ```env
   # Stellar Configuration
   NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
   NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
   STELLAR_PLATFORM_SECRET=your_platform_account_secret
   ENCRYPTION_KEY=your_encryption_key_for_managed_accounts
   ```

4. **Database Migration**
   ```prisma
   npx prisma migrate dev --name add-stellar-accounts
   ```

#### Day 3-4: Wallet Integration Layer
1. **Wallet Interface & Providers**
   ```typescript
   // lib/wallet/WalletInterface.ts
   export interface WalletProvider {
     name: string
     icon: string
     isInstalled(): boolean
     connect(): Promise<string>
     disconnect(): void
     signTransaction(tx: string): Promise<string>
     signMessage(message: string): Promise<string>
   }
   
   // lib/wallet/providers/FreighterProvider.ts
   export class FreighterProvider implements WalletProvider {
     name = 'Freighter'
     icon = '🦊'
     
     isInstalled(): boolean {
       return typeof window !== 'undefined' && window.freighterApi?.isConnected
     }
     
     async connect(): Promise<string> {
       if (!this.isInstalled()) {
         throw new Error('Freighter not installed')
       }
       
       const isAllowed = await window.freighterApi.isAllowed()
       if (!isAllowed) {
         await window.freighterApi.requestAccess()
       }
       
       return await window.freighterApi.getPublicKey()
     }
     
     async disconnect(): void {
       // Freighter doesn't have explicit disconnect
       // User must revoke access in extension
     }
     
     async signTransaction(tx: string): Promise<string> {
       return await window.freighterApi.signTransaction(tx)
     }
     
     async signMessage(message: string): Promise<string> {
       // Implement message signing for auth
       return await window.freighterApi.signAuthEntry(message)
     }
   }
   ```

2. **Wallet Context & Hook**
   ```typescript
   // contexts/WalletContext.tsx
   interface WalletContextType {
     isConnected: boolean
     publicKey: string | null
     provider: WalletProvider | null
     balance: string | null
     connect: (provider: WalletProvider) => Promise<void>
     disconnect: () => void
     signTransaction: (tx: string) => Promise<string>
   }
   
   export const WalletContext = createContext<WalletContextType>({} as WalletContextType)
   
   export const WalletProvider = ({ children }) => {
     const [isConnected, setIsConnected] = useState(false)
     const [publicKey, setPublicKey] = useState<string | null>(null)
     const [provider, setProvider] = useState<WalletProvider | null>(null)
     const [balance, setBalance] = useState<string | null>(null)
     
     const connect = async (walletProvider: WalletProvider) => {
       try {
         const key = await walletProvider.connect()
         setPublicKey(key)
         setProvider(walletProvider)
         setIsConnected(true)
         
         // Verify wallet ownership
         await verifyWalletOwnership(key)
         
         // Start balance monitoring
         startBalanceMonitoring(key)
       } catch (error) {
         console.error('Wallet connection failed:', error)
         throw error
       }
     }
     
     const verifyWalletOwnership = async (publicKey: string) => {
       // Generate challenge
       const { data: challenge } = await api.get('/api/wallet/challenge')
       
       // Sign challenge
       const signature = await provider?.signMessage(challenge.message)
       
       // Verify signature
       await api.post('/api/wallet/verify', {
         publicKey,
         signature,
         message: challenge.message
       })
     }
     
     const startBalanceMonitoring = async (publicKey: string) => {
       // Initial balance fetch
       const account = await horizonServer.loadAccount(publicKey)
       const xlmBalance = account.balances.find(b => b.asset_type === 'native')
       setBalance(xlmBalance?.balance || '0')
       
       // Subscribe to account updates
       const es = horizonServer.accounts()
         .accountId(publicKey)
         .stream({
           onmessage: (account) => {
             const xlm = account.balances.find(b => b.asset_type === 'native')
             setBalance(xlm?.balance || '0')
           }
         })
       
       return () => es.close()
     }
     
     return (
       <WalletContext.Provider value={{
         isConnected,
         publicKey,
         provider,
         balance,
         connect,
         disconnect,
         signTransaction
       }}>
         {children}
       </WalletContext.Provider>
     )
   }
   ```

#### Day 5: Wallet UI Components
1. **Wallet Connection Modal**
   ```typescript
   // components/wallet/WalletModal.tsx
   export const WalletModal = ({ isOpen, onClose }) => {
     const { connect } = useWallet()
     const [isLoading, setIsLoading] = useState(false)
     
     const providers = [
       new FreighterProvider(),
       new xBullProvider(),
     ]
     
     const handleConnect = async (provider: WalletProvider) => {
       setIsLoading(true)
       try {
         await connect(provider)
         onClose()
         toast.success('Wallet connected!')
       } catch (error) {
         toast.error(error.message)
       } finally {
         setIsLoading(false)
       }
     }
     
     const handleCreateWallet = () => {
       router.push('/onboarding/wallet')
     }
     
     return (
       <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Connect Your Wallet</DialogTitle>
             <DialogDescription>
               Choose a wallet to connect to QuillTip
             </DialogDescription>
           </DialogHeader>
           
           <div className="grid grid-cols-2 gap-4">
             {providers.map(provider => (
               <button
                 key={provider.name}
                 onClick={() => handleConnect(provider)}
                 disabled={!provider.isInstalled() || isLoading}
                 className="p-4 border rounded-lg hover:bg-gray-50"
               >
                 <div className="text-4xl mb-2">{provider.icon}</div>
                 <div className="font-medium">{provider.name}</div>
                 {!provider.isInstalled() && (
                   <div className="text-xs text-gray-500">Not installed</div>
                 )}
               </button>
             ))}
           </div>
           
           <div className="mt-6 pt-6 border-t">
             <div className="text-center">
               <p className="text-sm text-gray-600 mb-3">
                 New to crypto?
               </p>
               <button
                 onClick={handleCreateWallet}
                 className="text-primary hover:underline"
               >
                 Create a QuillTip Wallet →
               </button>
             </div>
           </div>
         </DialogContent>
       </Dialog>
     )
   }
   ```

2. **Wallet Status Component**
   ```typescript
   // components/wallet/WalletStatus.tsx
   export const WalletStatus = () => {
     const { isConnected, publicKey, balance, disconnect } = useWallet()
     const [showDetails, setShowDetails] = useState(false)
     
     if (!isConnected) {
       return (
         <button
           onClick={() => setShowWalletModal(true)}
           className="px-4 py-2 bg-primary text-white rounded-lg"
         >
           Connect Wallet
         </button>
       )
     }
     
     const xlmPrice = useXLMPrice()
     const usdValue = balance ? (parseFloat(balance) * xlmPrice).toFixed(2) : '0.00'
     
     return (
       <DropdownMenu>
         <DropdownMenuTrigger asChild>
           <button className="flex items-center gap-2 px-4 py-2 border rounded-lg">
             <div className="w-2 h-2 bg-green-500 rounded-full" />
             <span className="font-medium">{formatBalance(balance)} XLM</span>
             <ChevronDown className="w-4 h-4" />
           </button>
         </DropdownMenuTrigger>
         
         <DropdownMenuContent align="end" className="w-80">
           <div className="p-4">
             <div className="flex justify-between items-start mb-4">
               <div>
                 <p className="text-sm text-gray-500">Balance</p>
                 <p className="text-2xl font-bold">{formatBalance(balance)} XLM</p>
                 <p className="text-sm text-gray-500">≈ ${usdValue} USD</p>
               </div>
               <QRCode value={publicKey} size={60} />
             </div>
             
             <div className="space-y-2 mb-4">
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500">Address</span>
                 <CopyableAddress address={publicKey} />
               </div>
             </div>
             
             <div className="grid grid-cols-3 gap-2">
               <button className="btn-secondary">
                 <Send className="w-4 h-4" />
                 Send
               </button>
               <button className="btn-secondary">
                 <Download className="w-4 h-4" />
                 Receive
               </button>
               <button className="btn-secondary">
                 <Clock className="w-4 h-4" />
                 History
               </button>
             </div>
           </div>
           
           <DropdownMenuSeparator />
           
           <DropdownMenuItem onClick={disconnect}>
             <LogOut className="w-4 h-4 mr-2" />
             Disconnect
           </DropdownMenuItem>
         </DropdownMenuContent>
       </DropdownMenu>
     )
   }
   ```

### Week 9: Managed Accounts & Onboarding

#### Day 1-2: Managed Account System
1. **Account Service Implementation**
   ```typescript
   // services/stellar/ManagedAccountService.ts
   export class ManagedAccountService {
     private encryptionKey: string
     
     constructor() {
       this.encryptionKey = process.env.ENCRYPTION_KEY!
     }
     
     async createManagedAccount(userId: string): Promise<StellarAccount> {
       // Generate new keypair
       const keypair = StellarSdk.Keypair.random()
       const publicKey = keypair.publicKey()
       const secret = keypair.secret()
       
       // Encrypt secret with user-specific key
       const encryptedSeed = await this.encryptSeed(secret, userId)
       
       // Save to database
       const account = await prisma.stellarAccount.create({
         data: {
           userId,
           publicKey,
           accountType: 'MANAGED',
           encryptedSeed,
           isActive: false,
           isFunded: false
         }
       })
       
       // Fund account
       try {
         await this.fundAccount(publicKey)
         await prisma.stellarAccount.update({
           where: { id: account.id },
           data: { isFunded: true, isActive: true }
         })
       } catch (error) {
         console.error('Failed to fund account:', error)
       }
       
       return account
     }
     
     async fundAccount(publicKey: string): Promise<void> {
       // For testnet, use friendbot
       if (stellarConfig.network === 'TESTNET') {
         const response = await fetch(
           `https://friendbot.stellar.org?addr=${publicKey}`
         )
         if (!response.ok) {
           throw new Error('Friendbot funding failed')
         }
         return
       }
       
       // For production, fund from platform account
       const platformKeypair = StellarSdk.Keypair.fromSecret(
         process.env.STELLAR_PLATFORM_SECRET!
       )
       
       const platformAccount = await horizonServer.loadAccount(
         platformKeypair.publicKey()
       )
       
       const transaction = new StellarSdk.TransactionBuilder(
         platformAccount,
         {
           fee: stellarConfig.baseFee,
           networkPassphrase: stellarConfig.networkPassphrase
         }
       )
         .addOperation(
           StellarSdk.Operation.createAccount({
             destination: publicKey,
             startingBalance: '10' // 10 XLM
           })
         )
         .setTimeout(stellarConfig.timeout)
         .build()
       
       transaction.sign(platformKeypair)
       await horizonServer.submitTransaction(transaction)
     }
     
     async signTransaction(
       userId: string,
       transaction: StellarSdk.Transaction
     ): Promise<StellarSdk.Transaction> {
       const account = await prisma.stellarAccount.findUnique({
         where: { userId }
       })
       
       if (!account || account.accountType !== 'MANAGED') {
         throw new Error('No managed account found')
       }
       
       const secret = await this.decryptSeed(account.encryptedSeed!, userId)
       const keypair = StellarSdk.Keypair.fromSecret(secret)
       
       transaction.sign(keypair)
       return transaction
     }
     
     private async encryptSeed(seed: string, userId: string): Promise<string> {
       const userKey = await this.deriveUserKey(userId)
       const cipher = crypto.createCipher('aes-256-gcm', userKey)
       
       let encrypted = cipher.update(seed, 'utf8', 'hex')
       encrypted += cipher.final('hex')
       
       const authTag = cipher.getAuthTag()
       return encrypted + ':' + authTag.toString('hex')
     }
     
     private async decryptSeed(encrypted: string, userId: string): Promise<string> {
       const [ciphertext, authTag] = encrypted.split(':')
       const userKey = await this.deriveUserKey(userId)
       
       const decipher = crypto.createDecipher('aes-256-gcm', userKey)
       decipher.setAuthTag(Buffer.from(authTag, 'hex'))
       
       let decrypted = decipher.update(ciphertext, 'hex', 'utf8')
       decrypted += decipher.final('utf8')
       
       return decrypted
     }
     
     private async deriveUserKey(userId: string): Promise<string> {
       return crypto.pbkdf2Sync(
         userId + this.encryptionKey,
         'quilltip-salt',
         100000,
         32,
         'sha256'
       ).toString('hex')
     }
   }
   ```

2. **Onboarding API Routes**
   ```typescript
   // app/api/stellar/account/create/route.ts
   export async function POST(request: Request) {
     const session = await getServerSession(authOptions)
     if (!session) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
     }
     
     try {
       // Check if user already has an account
       const existingAccount = await prisma.stellarAccount.findUnique({
         where: { userId: session.user.id }
       })
       
       if (existingAccount) {
         return NextResponse.json({ 
           error: 'Account already exists' 
         }, { status: 400 })
       }
       
       // Create managed account
       const accountService = new ManagedAccountService()
       const account = await accountService.createManagedAccount(session.user.id)
       
       return NextResponse.json({
         publicKey: account.publicKey,
         isActive: account.isActive,
         isFunded: account.isFunded
       })
     } catch (error) {
       console.error('Account creation failed:', error)
       return NextResponse.json({ 
         error: 'Failed to create account' 
       }, { status: 500 })
     }
   }
   ```

#### Day 3-4: Onboarding Flow
1. **Onboarding Pages**
   ```typescript
   // app/onboarding/wallet/page.tsx
   export default function WalletOnboarding() {
     const [step, setStep] = useState(1)
     const [account, setAccount] = useState(null)
     const [backupPhrase, setBackupPhrase] = useState<string[]>([])
     
     const steps = [
       { id: 1, title: 'Welcome', component: WelcomeStep },
       { id: 2, title: 'Create Wallet', component: CreateWalletStep },
       { id: 3, title: 'Backup', component: BackupStep },
       { id: 4, title: 'Verify', component: VerifyStep },
       { id: 5, title: 'Complete', component: CompleteStep }
     ]
     
     return (
       <div className="max-w-2xl mx-auto p-6">
         <OnboardingProgress currentStep={step} totalSteps={steps.length} />
         
         <AnimatePresence mode="wait">
           <motion.div
             key={step}
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
           >
             {steps[step - 1].component({
               onNext: () => setStep(step + 1),
               onBack: () => setStep(step - 1),
               account,
               setAccount,
               backupPhrase,
               setBackupPhrase
             })}
           </motion.div>
         </AnimatePresence>
       </div>
     )
   }
   
   // components/onboarding/CreateWalletStep.tsx
   const CreateWalletStep = ({ onNext, setAccount }) => {
     const [isCreating, setIsCreating] = useState(false)
     const [progress, setProgress] = useState(0)
     
     const createWallet = async () => {
       setIsCreating(true)
       
       // Simulate progress for UX
       const progressInterval = setInterval(() => {
         setProgress(prev => Math.min(prev + 20, 90))
       }, 500)
       
       try {
         // Create account
         const { data } = await api.post('/api/stellar/account/create')
         setAccount(data)
         
         setProgress(100)
         clearInterval(progressInterval)
         
         // Add celebration animation
         confetti({
           particleCount: 100,
           spread: 70,
           origin: { y: 0.6 }
         })
         
         setTimeout(onNext, 1500)
       } catch (error) {
         clearInterval(progressInterval)
         toast.error('Failed to create wallet')
         setIsCreating(false)
       }
     }
     
     return (
       <div className="text-center space-y-6">
         <h2 className="text-2xl font-bold">Creating Your Wallet</h2>
         
         {!isCreating ? (
           <>
             <p className="text-gray-600">
               We'll create a secure wallet for you to start receiving tips.
               This wallet will be managed by QuillTip for simplicity.
             </p>
             
             <button
               onClick={createWallet}
               className="btn-primary"
             >
               Create My Wallet
             </button>
           </>
         ) : (
           <>
             <div className="space-y-4">
               <div className="flex items-center gap-3">
                 <Loader2 className="animate-spin" />
                 <span>Generating secure wallet...</span>
               </div>
               
               <Progress value={progress} className="w-full" />
               
               {progress >= 50 && (
                 <div className="flex items-center gap-3">
                   <CheckCircle className="text-green-500" />
                   <span>Adding free test tokens...</span>
                 </div>
               )}
               
               {progress === 100 && (
                 <div className="flex items-center gap-3">
                   <CheckCircle className="text-green-500" />
                   <span>Wallet created successfully!</span>
                 </div>
               )}
             </div>
           </>
         )}
       </div>
     )
   }
   ```

#### Day 5: Transaction Handling
1. **Transaction Service**
   ```typescript
   // services/stellar/TransactionService.ts
   export class TransactionService {
     async sendPayment({
       from,
       to,
       amount,
       memo,
       isManaged = false
     }: SendPaymentParams): Promise<Transaction> {
       // Load source account
       const sourceAccount = await horizonServer.loadAccount(from)
       
       // Build transaction
       const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
         fee: stellarConfig.baseFee,
         networkPassphrase: stellarConfig.networkPassphrase
       })
         .addOperation(
           StellarSdk.Operation.payment({
             destination: to,
             asset: StellarSdk.Asset.native(),
             amount: amount.toString()
           })
         )
         .addMemo(memo ? StellarSdk.Memo.text(memo) : StellarSdk.Memo.none())
         .setTimeout(stellarConfig.timeout)
         .build()
       
       // Sign transaction
       if (isManaged) {
         // Sign with managed account
         const managedService = new ManagedAccountService()
         await managedService.signTransaction(userId, transaction)
       } else {
         // Return unsigned for wallet signing
         return transaction.toXDR()
       }
       
       // Submit transaction
       const result = await horizonServer.submitTransaction(transaction)
       
       // Save to database
       await prisma.transaction.create({
         data: {
           stellarAccountId: accountId,
           stellarTxId: result.id,
           type: 'PAYMENT',
           amount,
           assetCode: 'XLM',
           fromAddress: from,
           toAddress: to,
           status: 'SUCCESS',
           stellarLedger: result.ledger,
           memo: memo || null,
           confirmedAt: new Date()
         }
       })
       
       return result
     }
     
     async getTransactionHistory(publicKey: string): Promise<Transaction[]> {
       const payments = await horizonServer
         .payments()
         .forAccount(publicKey)
         .order('desc')
         .limit(50)
         .call()
       
       return payments.records.map(payment => ({
         id: payment.id,
         type: payment.type,
         amount: payment.amount,
         from: payment.from,
         to: payment.to,
         createdAt: payment.created_at,
         assetCode: payment.asset_type === 'native' ? 'XLM' : payment.asset_code
       }))
     }
   }
   ```

2. **Send Payment Modal**
   ```typescript
   // components/wallet/SendPaymentModal.tsx
   export const SendPaymentModal = ({ isOpen, onClose }) => {
     const { publicKey, balance, signTransaction } = useWallet()
     const [recipient, setRecipient] = useState('')
     const [amount, setAmount] = useState('')
     const [memo, setMemo] = useState('')
     const [isValidating, setIsValidating] = useState(false)
     const [recipientValid, setRecipientValid] = useState<boolean | null>(null)
     
     const validateRecipient = useDebounce(async (address: string) => {
       if (!address) return
       
       setIsValidating(true)
       try {
         const { data } = await api.post('/api/stellar/validate-address', {
           address
         })
         setRecipientValid(data.valid)
       } catch {
         setRecipientValid(false)
       } finally {
         setIsValidating(false)
       }
     }, 500)
     
     useEffect(() => {
       validateRecipient(recipient)
     }, [recipient])
     
     const handleSend = async () => {
       try {
         // Build transaction
         const { data: unsignedTx } = await api.post('/api/stellar/send', {
           to: recipient,
           amount,
           memo
         })
         
         // Sign with wallet
         const signedTx = await signTransaction(unsignedTx.transaction)
         
         // Submit signed transaction
         const { data: result } = await api.post('/api/stellar/submit', {
           transaction: signedTx
         })
         
         toast.success('Payment sent successfully!')
         onClose()
       } catch (error) {
         toast.error(error.message)
       }
     }
     
     const maxAmount = parseFloat(balance || '0') - 1 // Reserve 1 XLM
     
     return (
       <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Send XLM</DialogTitle>
           </DialogHeader>
           
           <div className="space-y-4">
             <div>
               <label className="text-sm font-medium">Recipient Address</label>
               <div className="relative">
                 <input
                   type="text"
                   value={recipient}
                   onChange={(e) => setRecipient(e.target.value)}
                   placeholder="G..."
                   className="w-full p-2 pr-8 border rounded"
                 />
                 <div className="absolute right-2 top-2">
                   {isValidating && <Loader2 className="w-4 h-4 animate-spin" />}
                   {!isValidating && recipientValid === true && (
                     <CheckCircle className="w-4 h-4 text-green-500" />
                   )}
                   {!isValidating && recipientValid === false && (
                     <XCircle className="w-4 h-4 text-red-500" />
                   )}
                 </div>
               </div>
             </div>
             
             <div>
               <label className="text-sm font-medium">Amount (XLM)</label>
               <input
                 type="number"
                 value={amount}
                 onChange={(e) => setAmount(e.target.value)}
                 placeholder="0.00"
                 max={maxAmount}
                 step="0.0000001"
                 className="w-full p-2 border rounded"
               />
               <div className="flex justify-between text-xs text-gray-500 mt-1">
                 <span>Available: {maxAmount.toFixed(7)} XLM</span>
                 <button
                   onClick={() => setAmount(maxAmount.toString())}
                   className="text-primary hover:underline"
                 >
                   Max
                 </button>
               </div>
             </div>
             
             <div>
               <label className="text-sm font-medium">Memo (optional)</label>
               <input
                 type="text"
                 value={memo}
                 onChange={(e) => setMemo(e.target.value)}
                 placeholder="Payment for..."
                 maxLength={28}
                 className="w-full p-2 border rounded"
               />
             </div>
             
             <div className="bg-gray-50 p-3 rounded text-sm">
               <div className="flex justify-between">
                 <span>Network Fee:</span>
                 <span>0.00001 XLM</span>
               </div>
               <div className="flex justify-between font-medium">
                 <span>Total:</span>
                 <span>{(parseFloat(amount || '0') + 0.00001).toFixed(7)} XLM</span>
               </div>
             </div>
           </div>
           
           <DialogFooter>
             <button onClick={onClose} className="btn-secondary">
               Cancel
             </button>
             <button
               onClick={handleSend}
               disabled={!recipientValid || !amount || parseFloat(amount) <= 0}
               className="btn-primary"
             >
               Send Payment
             </button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     )
   }
   ```

### Week 10: Testing & Polish

#### Day 1-2: Comprehensive Testing
1. **Unit Tests**
   ```typescript
   // __tests__/stellar/ManagedAccountService.test.ts
   describe('ManagedAccountService', () => {
     let service: ManagedAccountService
     
     beforeEach(() => {
       service = new ManagedAccountService()
     })
     
     test('creates managed account with encrypted seed', async () => {
       const userId = 'test-user-123'
       const account = await service.createManagedAccount(userId)
       
       expect(account.publicKey).toMatch(/^G[A-Z0-9]{55}$/)
       expect(account.encryptedSeed).toBeTruthy()
       expect(account.accountType).toBe('MANAGED')
     })
     
     test('encrypts and decrypts seed correctly', async () => {
       const userId = 'test-user-123'
       const keypair = StellarSdk.Keypair.random()
       const originalSecret = keypair.secret()
       
       const encrypted = await service.encryptSeed(originalSecret, userId)
       const decrypted = await service.decryptSeed(encrypted, userId)
       
       expect(decrypted).toBe(originalSecret)
     })
     
     test('signs transaction with managed account', async () => {
       const userId = 'test-user-123'
       const account = await service.createManagedAccount(userId)
       
       // Build test transaction
       const sourceAccount = new StellarSdk.Account(
         account.publicKey,
         '1'
       )
       
       const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
         fee: '100',
         networkPassphrase: StellarSdk.Networks.TESTNET
       })
         .addOperation(
           StellarSdk.Operation.payment({
             destination: 'GABC...',
             asset: StellarSdk.Asset.native(),
             amount: '10'
           })
         )
         .setTimeout(30)
         .build()
       
       const signedTx = await service.signTransaction(userId, transaction)
       expect(signedTx.signatures).toHaveLength(1)
     })
   })
   ```

2. **Integration Tests**
   ```typescript
   // __tests__/api/stellar.integration.test.ts
   describe('Stellar API Integration', () => {
     test('creates account and funds from testnet', async () => {
       const response = await request(app)
         .post('/api/stellar/account/create')
         .set('Authorization', `Bearer ${authToken}`)
       
       expect(response.status).toBe(200)
       expect(response.body.publicKey).toBeTruthy()
       expect(response.body.isFunded).toBe(true)
       
       // Verify on testnet
       const account = await horizonServer.loadAccount(response.body.publicKey)
       const xlmBalance = account.balances.find(b => b.asset_type === 'native')
       expect(parseFloat(xlmBalance.balance)).toBeGreaterThan(0)
     })
     
     test('validates Stellar addresses correctly', async () => {
       const validAddress = 'GBCG6LGYYAQDDYX5SYJX4GKPFVEPSQN6CKYT3VUMT2ZQ4ZQYB5TCXBPO'
       const invalidAddress = 'INVALID123'
       
       const validResponse = await request(app)
         .post('/api/stellar/validate-address')
         .send({ address: validAddress })
       
       expect(validResponse.body.valid).toBe(true)
       
       const invalidResponse = await request(app)
         .post('/api/stellar/validate-address')
         .send({ address: invalidAddress })
       
       expect(invalidResponse.body.valid).toBe(false)
     })
   })
   ```

#### Day 3-4: UI Polish & Error Handling
1. **Error Boundary for Wallet**
   ```typescript
   // components/wallet/WalletErrorBoundary.tsx
   export class WalletErrorBoundary extends Component {
     state = { hasError: false, error: null }
     
     static getDerivedStateFromError(error) {
       return { hasError: true, error }
     }
     
     componentDidCatch(error, errorInfo) {
       console.error('Wallet error:', error, errorInfo)
       
       // Track error
       trackEvent('wallet_error', {
         error: error.message,
         stack: error.stack
       })
     }
     
     render() {
       if (this.state.hasError) {
         return (
           <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
             <h3 className="font-medium text-red-800 mb-2">
               Wallet Connection Error
             </h3>
             <p className="text-sm text-red-600 mb-3">
               {this.state.error?.message || 'An unexpected error occurred'}
             </p>
             <button
               onClick={() => window.location.reload()}
               className="text-sm text-red-700 underline"
             >
               Reload page
             </button>
           </div>
         )
       }
       
       return this.props.children
     }
   }
   ```

2. **Loading States & Skeletons**
   ```typescript
   // components/wallet/WalletSkeleton.tsx
   export const WalletSkeleton = () => (
     <div className="animate-pulse">
       <div className="flex items-center gap-2 px-4 py-2 border rounded-lg">
         <div className="w-2 h-2 bg-gray-300 rounded-full" />
         <div className="w-20 h-4 bg-gray-300 rounded" />
         <div className="w-4 h-4 bg-gray-300 rounded" />
       </div>
     </div>
   )
   
   // components/wallet/TransactionSkeleton.tsx
   export const TransactionSkeleton = () => (
     <div className="space-y-3">
       {[...Array(5)].map((_, i) => (
         <div key={i} className="flex justify-between p-3 animate-pulse">
           <div className="space-y-2">
             <div className="w-32 h-4 bg-gray-300 rounded" />
             <div className="w-24 h-3 bg-gray-200 rounded" />
           </div>
           <div className="text-right space-y-2">
             <div className="w-20 h-4 bg-gray-300 rounded" />
             <div className="w-16 h-3 bg-gray-200 rounded" />
           </div>
         </div>
       ))}
     </div>
   )
   ```

#### Day 5: Documentation & Deployment
1. **API Documentation**
   ```typescript
   // docs/api/stellar.md
   /**
    * @api {post} /api/wallet/connect Initialize wallet connection
    * @apiName ConnectWallet
    * @apiGroup Wallet
    * 
    * @apiHeader {String} Authorization Bearer token
    * 
    * @apiSuccess {String} challenge Challenge message to sign
    * @apiSuccess {String} sessionId Session ID for verification
    */
   
   /**
    * @api {post} /api/stellar/send Send XLM payment
    * @apiName SendPayment
    * @apiGroup Stellar
    * 
    * @apiParam {String} to Recipient Stellar address
    * @apiParam {Number} amount Amount in XLM
    * @apiParam {String} [memo] Optional memo text
    * 
    * @apiSuccess {String} transaction Unsigned transaction XDR
    * @apiSuccess {String} transactionId Database transaction ID
    */
   ```

2. **User Documentation**
   ```markdown
   # Wallet Setup Guide
   
   ## For Crypto Users
   1. Install Freighter extension
   2. Click "Connect Wallet"
   3. Approve connection in Freighter
   4. Start tipping!
   
   ## For New Users
   1. Click "Create QuillTip Wallet"
   2. Follow the onboarding steps
   3. Save your backup phrase (optional)
   4. Receive free test tokens
   5. Start exploring!
   ```

### Deployment Checklist
- [ ] Stellar SDK configured correctly
- [ ] Encryption keys securely stored
- [ ] Rate limiting on transaction endpoints
- [ ] Wallet connection error handling
- [ ] Transaction monitoring setup
- [ ] Backup and recovery flows tested
- [ ] Documentation complete
- [ ] Security audit performed