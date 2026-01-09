export const ARWEAVE_CONFIG = {
  ENABLED: process.env.ARWEAVE_ENABLED === 'true',
  APP_NAME: 'QuillTip',
  APP_VERSION: '1.0',
  // Free tier limit for Turbo SDK (100 KiB)
  FREE_TIER_LIMIT_BYTES: 100 * 1024,
  // Hard limit to prevent excessive upload costs (500 KiB)
  HARD_LIMIT_BYTES: 500 * 1024,
  // Gateway timeout for verification (10 seconds)
  GATEWAY_TIMEOUT_MS: 10000,
} as const;
