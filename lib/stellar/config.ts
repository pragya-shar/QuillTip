export const STELLAR_CONFIG = {
  // Network configuration
  NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'TESTNET',
  HORIZON_URL: process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org',
  SOROBAN_RPC_URL: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
  NETWORK_PASSPHRASE: process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',

  // Contract addresses
  TIPPING_CONTRACT_ID: process.env.NEXT_PUBLIC_TIPPING_CONTRACT_ID || 'CBSVFVIDV2U3SSY36TJ3MDGQDSQL3ZVL2TR7GMRBXJ3XZBE24FDHHWAM',
  NFT_CONTRACT_ID: process.env.NEXT_PUBLIC_NFT_CONTRACT_ID || 'CAOWOEKBL5VX4BHN4QT2RQN4QEEBEJZLVKNRQ7UAVGOX3W4UMSSQTTC5',

  // Highlight tipping contract (NEW - separate for safety)
  HIGHLIGHT_CONTRACT_ID: process.env.NEXT_PUBLIC_HIGHLIGHT_CONTRACT_ID || '',

  // Platform settings
  PLATFORM_ADDRESS: process.env.NEXT_PUBLIC_PLATFORM_ADDRESS || '',
  PLATFORM_FEE_BPS: 250, // 2.5% platform fee

  // Tipping settings
  MINIMUM_TIP_STROOPS: 261000, // 0.0261 XLM (approximately 1 cent at $0.3831/XLM)
  MINIMUM_TIP_CENTS: 1, // 1 cent minimum

  // NFT settings
  NFT_TIP_THRESHOLD_XLM: 10, // 10 XLM minimum tips to mint NFT
  NFT_TIP_THRESHOLD_STROOPS: 100_000_000, // 10 XLM in stroops
  NFT_METADATA_BASE_URL: process.env.NEXT_PUBLIC_NFT_METADATA_URL || 'https://quilltip.com/api/nft/metadata',
  NFT_ROYALTY_BPS: 500, // 5% royalty in basis points

  // Conversion rates (will be fetched dynamically in production)
  XLM_TO_USD_RATE: 0.3831, // Default rate, should be fetched from price oracle
} as const;

export const TIP_AMOUNTS = [
  { cents: 1, label: '1¢' },
  { cents: 5, label: '5¢' },
  { cents: 10, label: '10¢' },
  { cents: 25, label: '25¢' },
  { cents: 50, label: '50¢' },
  { cents: 100, label: '$1' },
] as const;