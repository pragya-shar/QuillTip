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
    ppr: false, // Disable PPR as it can cause routing issues in Vercel
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  // Remove standalone output as it can cause issues with Vercel deployment
  // Ensure proper handling of Prisma client in serverless environments
  webpack: (config: any) => {
    config.externals = config.externals || []
    config.externals.push({
      '@prisma/client': 'commonjs @prisma/client'
    })
    
    // Optimize for serverless deployment
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    
    return config
  },
  // Ensure proper bundling for production
  transpilePackages: ['@prisma/client'],
  
  // Configure logging for better debugging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
};

export default nextConfig;