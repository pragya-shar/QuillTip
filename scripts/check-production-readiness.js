#!/usr/bin/env node

/**
 * Production Readiness Checker
 * 
 * This script checks if the application is properly configured for production deployment.
 */

const fs = require('fs');
const path = require('path');

const checks = [];
const warnings = [];
const errors = [];

console.log('🔍 Checking production readiness...\n');

// Check 1: Required files exist
const requiredFiles = [
  'next.config.ts',
  'vercel.json',
  'prisma/schema.prisma',
  'lib/prisma.ts',
  'lib/auth.ts',
  'app/api/health/route.ts',
  'app/global-error.tsx'
];

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    checks.push(`✅ ${file} exists`);
  } else {
    errors.push(`❌ Missing required file: ${file}`);
  }
});

// Check 2: Package.json scripts
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['build', 'start', 'vercel-build', 'postinstall'];

requiredScripts.forEach(script => {
  if (packageJson.scripts && packageJson.scripts[script]) {
    checks.push(`✅ Script "${script}" is defined`);
  } else {
    errors.push(`❌ Missing required script: ${script}`);
  }
});

// Check 3: Prisma configuration
const prismaSchema = fs.readFileSync('prisma/schema.prisma', 'utf8');
if (prismaSchema.includes('binaryTargets')) {
  checks.push('✅ Prisma binary targets configured');
} else {
  warnings.push('⚠️  Consider adding binary targets for better Vercel compatibility');
}

// Check 4: Next.js configuration
const nextConfigExists = fs.existsSync('next.config.ts') || fs.existsSync('next.config.js');
if (nextConfigExists) {
  checks.push('✅ Next.js configuration exists');
} else {
  errors.push('❌ Missing Next.js configuration');
}

// Check 5: Environment variable template (if it exists)
if (fs.existsSync('.env.example')) {
  checks.push('✅ Environment variable template exists');
} else {
  warnings.push('⚠️  Consider creating .env.example for documentation');
}

// Check 6: Error handling
if (fs.existsSync('app/global-error.tsx')) {
  checks.push('✅ Global error boundary configured');
} else {
  errors.push('❌ Missing global error boundary');
}

// Check 7: Vercel configuration
if (fs.existsSync('vercel.json')) {
  checks.push('✅ Vercel configuration exists');
} else {
  warnings.push('⚠️  Consider adding vercel.json for deployment optimization');
}

// Display results
console.log('📊 RESULTS:\n');

if (checks.length > 0) {
  console.log('✅ PASSED CHECKS:');
  checks.forEach(check => console.log(`  ${check}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  warnings.forEach(warning => console.log(`  ${warning}`));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ ERRORS:');
  errors.forEach(error => console.log(`  ${error}`));
  console.log('');
}

// Summary
const total = checks.length + warnings.length + errors.length;
console.log(`📈 SUMMARY: ${checks.length}/${total} checks passed, ${warnings.length} warnings, ${errors.length} errors\n`);

if (errors.length === 0) {
  console.log('🎉 Production readiness: GOOD');
  console.log('Your application is ready for production deployment!\n');
  
  console.log('🚀 Next steps:');
  console.log('1. Ensure environment variables are set in Vercel dashboard');
  console.log('2. Test the health endpoint: /api/health');
  console.log('3. Monitor deployment logs for any issues');
  console.log('4. Test critical user flows after deployment');
} else {
  console.log('🚨 Production readiness: NEEDS ATTENTION');
  console.log('Please fix the errors above before deploying to production.\n');
  process.exit(1);
}

// Environment variables check
console.log('🔐 IMPORTANT: Ensure these environment variables are set in production:');
console.log('  - DATABASE_URL');
console.log('  - DIRECT_URL (if using Prisma with connection pooling)');
console.log('  - NEXTAUTH_SECRET');
console.log('  - NEXTAUTH_URL');
console.log('  - Any other custom environment variables your app uses\n');