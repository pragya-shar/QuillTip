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
  },
  
  // Moved from experimental.serverComponentsExternalPackages (Next.js 15+ requirement)
  serverExternalPackages: ['@prisma/client', 'prisma'],
  // Conditional webpack config (only when not using Turbopack)
  ...(process.env.TURBOPACK !== '1' && {
    webpack: (config: any) => {
      config.externals = config.externals || []
      config.externals.push({
        '@prisma/client': 'commonjs @prisma/client'
      })
      
      return config
    },
  }),
  // Remove transpilePackages to avoid conflict with serverExternalPackages
  
  // Configure logging for better debugging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
};

export default nextConfig;