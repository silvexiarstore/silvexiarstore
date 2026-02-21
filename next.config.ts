import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // هاد النجمات كيعنيو: قبل أي رابط كيفما كان
      },
    ],
    // Increase timeout for image optimization
    minimumCacheTTL: 60,
    // Disable optimization for Supabase storage to avoid timeout issues
    unoptimized: process.env.NODE_ENV === 'development',
    dangerouslyAllowSVG: true,
  },
  // Increase server timeout for image processing
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};
export default nextConfig;
