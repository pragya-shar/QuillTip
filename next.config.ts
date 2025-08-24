import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/vi/**',
      },
    ],
  },
  // Disable PPR for Vercel compatibility (Next.js 15)
  experimental: {
    // Disable PPR as it can cause routing issues in Vercel
    ppr: false,
  },
  // Optimize for Vercel deployment
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  // Force dynamic rendering for all pages
  distDir: '.next',
  // Ensure dynamic routes work properly
  trailingSlash: false,
  // Skip validation during build for faster deployments
  env: {
    SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION || '1',
  },
  // Ensure proper handling of dynamic imports
  webpack: (config: any) => {
    config.externals = config.externals || []
    config.externals.push({
      '@prisma/client': 'commonjs @prisma/client'
    })
    return config
  },
};

export default nextConfig;
