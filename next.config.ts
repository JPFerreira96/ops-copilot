import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Next.js 15+ trace config
  experimental: {
  } as any,
};

export default nextConfig;
