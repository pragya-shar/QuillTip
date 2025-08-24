#!/usr/bin/env node

// Test script for verifying dynamic routes work locally
// Run with: node scripts/test-routes.js

const http = require('http');
const https = require('https');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

const testRoutes = [
  // Test profile routes
  '/testuser',
  '/admin',
  '/john_doe',
  
  // Test article routes
  '/testuser/test-article',
  '/admin/sample-post',
  
  // Test API routes
  '/api/health',
  '/api/articles',
];

async function testRoute(path) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${path}`;
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          headers: res.headers,
          hasContent: data.length > 0,
          contentPreview: data.substring(0, 200)
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        path,
        status: 'ERROR',
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        path,
        status: 'TIMEOUT',
        error: 'Request timed out'
      });
    });
  });
}

async function runTests() {
  console.log(`Testing routes against: ${BASE_URL}`);
  console.log('=' .repeat(50));
  
  for (const route of testRoutes) {
    const result = await testRoute(route);
    
    const statusColor = result.status === 200 ? '\x1b[32m' : 
                       result.status === 404 ? '\x1b[31m' : '\x1b[33m';
    
    console.log(`${statusColor}${result.status}\x1b[0m ${route}`);
    
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
    
    if (result.status === 404) {
      console.log('  ❌ Route returned 404 - this needs to be fixed');
    } else if (result.status === 200) {
      console.log('  ✅ Route working correctly');
    }
    
    console.log('');
  }
  
  console.log('Test complete!');
  console.log('');
  console.log('If any profile routes (/username) return 404:');
  console.log('1. Make sure you have users in your database');
  console.log('2. Check Vercel function logs for errors');
  console.log('3. Verify your DATABASE_URL is correct in production');
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testRoute, runTests };