export const ARWEAVE_CONFIG = {
  ENABLED: process.env.ARWEAVE_ENABLED === 'true',
  APP_NAME: 'QuillTip',
  APP_VERSION: '1.0',
  // Free tier limit for Turbo SDK (100 KiB)
  FREE_TIER_LIMIT_BYTES: 100 * 1024,
} as const;
