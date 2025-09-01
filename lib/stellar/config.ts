export const STELLAR_CONFIG = {
  // Network configuration
  NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'TESTNET',
  HORIZON_URL: process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org',
  SOROBAN_RPC_URL: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
  NETWORK_PASSPHRASE: process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
  
  // Contract addresses (will be set after deployment)
  TIPPING_CONTRACT_ID: process.env.NEXT_PUBLIC_TIPPING_CONTRACT_ID || '',
  
  // Platform settings
  PLATFORM_ADDRESS: process.env.NEXT_PUBLIC_PLATFORM_ADDRESS || '',
  PLATFORM_FEE_BPS: 250, // 2.5% platform fee
  
  // Tipping settings
  MINIMUM_TIP_STROOPS: 100000, // 0.01 XLM (approximately 1 cent)
  MINIMUM_TIP_CENTS: 1, // 1 cent minimum
  
  // Conversion rates (will be fetched dynamically in production)
  XLM_TO_USD_RATE: 0.12, // Default rate, should be fetched from price oracle
} as const;

export const TIP_AMOUNTS = [
  { cents: 1, label: '1¢' },
  { cents: 5, label: '5¢' },
  { cents: 10, label: '10¢' },
  { cents: 25, label: '25¢' },
  { cents: 50, label: '50¢' },
  { cents: 100, label: '$1' },
] as const;