/**
 * Environment Variable Validation
 * 
 * This file validates that all required environment variables are present
 * and properly configured for the application to function correctly.
 */

interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test'
  DATABASE_URL: string
  DIRECT_URL: string
  NEXTAUTH_URL: string
  NEXTAUTH_SECRET: string
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  SUPABASE_STORAGE_BUCKET: string
}

function validateEnvironment(): EnvironmentConfig {
  const requiredVars = [
    'DATABASE_URL',
    'DIRECT_URL', 
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ] as const

  const missing: string[] = []
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  }

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing)
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  return {
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    DATABASE_URL: process.env.DATABASE_URL!,
    DIRECT_URL: process.env.DIRECT_URL!,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET || 'images'
  }
}

// Validate environment on module load (except during build time)
if (process.env.NODE_ENV !== 'production' || process.env.SKIP_ENV_VALIDATION !== '1') {
  try {
    validateEnvironment()
  } catch (error) {
    console.warn('Environment validation failed:', error)
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET || 'images'
}

export default env