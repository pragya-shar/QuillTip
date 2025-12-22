export const ARWEAVE_CONFIG = {
  ENABLED: process.env.ARWEAVE_ENABLED === 'true',
  USE_TESTNET: process.env.ARWEAVE_USE_TESTNET === 'true',
  HOST: 'arweave.net',
  PORT: 443,
  PROTOCOL: 'https' as const,
  APP_NAME: 'QuillTip',
  APP_VERSION: '1.0',
} as const;
