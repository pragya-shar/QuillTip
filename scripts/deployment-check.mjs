#!/usr/bin/env node

/**
 * Deployment Health Check Script
 * 
 * This script checks if all deployment requirements are met
 * and helps diagnose common deployment issues.
 */

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync, existsSync } from 'fs'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

console.log('🚀 QuillTip Deployment Health Check')
console.log('=====================================\n')

// Check package.json
console.log('📦 Checking package.json...')
try {
  const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'))
  console.log('✅ Package.json found')
  console.log(`   - Name: ${packageJson.name}`)
  console.log(`   - Version: ${packageJson.version}`)
  console.log(`   - Next.js: ${packageJson.dependencies?.next || 'Not found'}`)
  
  // Check build script
  if (packageJson.scripts?.build) {
    console.log(`   - Build script: ${packageJson.scripts.build}`)
    if (packageJson.scripts.build.includes('prisma generate')) {
      console.log('✅ Build script includes Prisma generation')
    } else {
      console.log('⚠️  Build script missing Prisma generation')
    }
  } else {
    console.log('❌ No build script found')
  }
} catch (error) {
  console.log('❌ Failed to read package.json:', error.message)
}

// Check Next.js config
console.log('\n⚙️  Checking Next.js configuration...')
const nextConfigPath = join(projectRoot, 'next.config.ts')
if (existsSync(nextConfigPath)) {
  console.log('✅ next.config.ts found')
} else {
  console.log('⚠️  next.config.ts not found')
}

// Check Vercel config
console.log('\n🚢 Checking Vercel configuration...')
const vercelConfigPath = join(projectRoot, 'vercel.json')
if (existsSync(vercelConfigPath)) {
  try {
    const vercelConfig = JSON.parse(readFileSync(vercelConfigPath, 'utf8'))
    console.log('✅ vercel.json found')
    console.log(`   - Build command: ${vercelConfig.buildCommand || 'Default'}`)
    console.log(`   - Framework: ${vercelConfig.framework || 'Auto-detected'}`)
    console.log(`   - Output directory: ${vercelConfig.outputDirectory || 'Default'}`)
    
    if (vercelConfig.buildCommand?.includes('prisma generate')) {
      console.log('✅ Vercel build command includes Prisma generation')
    } else {
      console.log('⚠️  Vercel build command missing Prisma generation')
    }
  } catch (error) {
    console.log('❌ Failed to parse vercel.json:', error.message)
  }
} else {
  console.log('⚠️  vercel.json not found - using Vercel dashboard settings')
}

// Check Prisma setup
console.log('\n🗄️  Checking Prisma configuration...')
const prismaSchemaPath = join(projectRoot, 'prisma', 'schema.prisma')
if (existsSync(prismaSchemaPath)) {
  console.log('✅ Prisma schema found')
  const schemaContent = readFileSync(prismaSchemaPath, 'utf8')
  if (schemaContent.includes('binaryTargets')) {
    console.log('✅ Prisma binary targets configured for deployment')
  } else {
    console.log('⚠️  Consider adding binary targets for deployment compatibility')
  }
} else {
  console.log('❌ Prisma schema not found')
}

// Check critical files
console.log('\n📁 Checking critical application files...')
const criticalFiles = [
  'app/layout.tsx',
  'app/page.tsx',
  'app/[username]/[slug]/page.tsx',
  'lib/prisma.ts',
  'lib/auth.ts'
]

criticalFiles.forEach(file => {
  const filePath = join(projectRoot, file)
  if (existsSync(filePath)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - Missing critical file`)
  }
})

// Environment variables check
console.log('\n🔐 Environment Variables Checklist:')
const requiredEnvVars = [
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXTAUTH_URL', 
  'NEXTAUTH_SECRET',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
]

console.log('Required environment variables for Vercel dashboard:')
requiredEnvVars.forEach(varName => {
  console.log(`   - ${varName}`)
})

console.log('\n🎯 Deployment Recommendations:')
console.log('1. Ensure all environment variables are set in Vercel dashboard')
console.log('2. Set Build Command: "prisma generate && next build"')
console.log('3. Set Framework Preset: "Next.js"')
console.log('4. Set Output Directory: ".next" (default)')
console.log('5. Set Install Command: "npm ci" for faster installs')
console.log('6. Add Environment Variable: SKIP_ENV_VALIDATION=1 for build time')

console.log('\n🔍 If you\'re still getting 404s:')
console.log('1. Check Vercel function logs for errors')
console.log('2. Verify database connection with /api/health endpoint')
console.log('3. Ensure Prisma Client is generated during build')
console.log('4. Check if dynamic routes are working with a test article')

console.log('\n✅ Health check complete!')